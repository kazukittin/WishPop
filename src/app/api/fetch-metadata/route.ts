import { NextRequest, NextResponse } from 'next/server';
import ogs from 'open-graph-scraper';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Fetch OGP data
        const options = {
            url,
            timeout: 10000,
            fetchOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                },
            },
        };

        const { result, error } = await ogs(options);

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch metadata', details: result },
                { status: 500 }
            );
        }

        // Extract relevant data
        const title = result.ogTitle || result.twitterTitle || result.dcTitle || '';
        const description = result.ogDescription || result.twitterDescription || result.dcDescription || '';

        // Get the best quality image
        let image = '';
        if (result.ogImage && result.ogImage.length > 0) {
            image = result.ogImage[0].url;
        } else if (result.twitterImage && result.twitterImage.length > 0) {
            image = result.twitterImage[0].url;
        }

        // Make image URL absolute if relative
        if (image && !image.startsWith('http')) {
            try {
                const baseUrl = new URL(url);
                image = new URL(image, baseUrl.origin).href;
            } catch {
                // Keep the image URL as-is if we can't resolve it
            }
        }

        // Try to extract price from meta tags or page content
        // This is a basic implementation - price extraction is complex due to varying formats
        let price: number | null = null;

        // Check for price in og:product:price:amount
        if (result.customMetaTags && Array.isArray(result.customMetaTags)) {
            const priceMeta = result.customMetaTags.find(
                (tag: { property?: string }) =>
                    tag.property === 'og:product:price:amount' ||
                    tag.property === 'product:price:amount'
            );
            if (priceMeta && 'content' in priceMeta) {
                const parsedPrice = parseFloat((priceMeta as { content: string }).content);
                if (!isNaN(parsedPrice)) {
                    price = parsedPrice;
                }
            }
        }

        return NextResponse.json({
            title,
            description,
            image,
            price,
            url,
        });
    } catch (error) {
        console.error('Error fetching metadata:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
