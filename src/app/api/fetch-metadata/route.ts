import { NextRequest, NextResponse } from 'next/server';
import ogs from 'open-graph-scraper';

// Site-specific configurations
interface SiteConfig {
    hostPatterns: string[];
    headers?: Record<string, string>;
    imagePatterns: RegExp[];
    titlePatterns?: RegExp[];
    pricePatterns?: RegExp[];
}

const AMAZON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'max-age=0',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
};

const SITE_CONFIGS: SiteConfig[] = [
    // Amazon Japan / US - needs special handling
    {
        hostPatterns: ['amazon.co.jp', 'amazon.com', 'www.amazon.co.jp', 'www.amazon.com'],
        headers: AMAZON_HEADERS,
        imagePatterns: [
            // High-res image from data attributes
            /data-old-hires=["']([^"']+)["']/i,
            /data-a-dynamic-image=["']\{["']([^"']+)["']/i,
            // Landing image src
            /id=["']landingImage["'][^>]*src=["']([^"']+)["']/i,
            /<img[^>]+id=["']landingImage["'][^>]+src=["']([^"']+)["']/i,
            // Image block front
            /id=["']imgBlkFront["'][^>]*src=["']([^"']+)["']/i,
            /id=["']ebooksImgBlkFront["'][^>]*src=["']([^"']+)["']/i,
            // Dynamic image class
            /class=["'][^"']*a-dynamic-image[^"']*["'][^>]*src=["']([^"']+)["']/i,
            // Image gallery
            /class=["'][^"']*imgTagWrapper[^"']*["'][^>]*>\s*<img[^>]+src=["']([^"']+)["']/i,
            // Fallback: any image with product in URL
            /<img[^>]+src=["'](https:\/\/m\.media-amazon\.com\/images\/I\/[^"']+)["']/i,
            /<img[^>]+src=["'](https:\/\/images-na\.ssl-images-amazon\.com\/images\/I\/[^"']+)["']/i,
        ],
        titlePatterns: [
            /id=["']productTitle["'][^>]*>([^<]+)</i,
            /id=["']title["'][^>]*>\s*<span[^>]*>([^<]+)</i,
            /<span[^>]+id=["']productTitle["'][^>]*>([^<]+)</i,
        ],
        pricePatterns: [
            /class=["'][^"']*a-price-whole["'][^>]*>([^<]+)</i,
            /class=["'][^"']*a-offscreen["'][^>]*>[¥￥]?\s*([\d,]+)/i,
            /id=["']priceblock_ourprice["'][^>]*>[¥￥]?\s*([\d,]+)/i,
            /id=["']priceblock_dealprice["'][^>]*>[¥￥]?\s*([\d,]+)/i,
            /class=["'][^"']*apexPriceToPay["'][^>]*>[^<]*[¥￥]?\s*([\d,]+)/i,
        ],
    },
    // Rakuten
    {
        hostPatterns: ['item.rakuten.co.jp', 'rakuten.co.jp', 'www.rakuten.co.jp'],
        imagePatterns: [
            /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
            /class=["'][^"']*image-main[^"']*["'][^>]*>\s*<img[^>]+src=["']([^"']+)["']/i,
            /id=["']rakutenLimitedId_ImageMain[^"']*["'][^>]*src=["']([^"']+)["']/i,
        ],
        pricePatterns: [
            /class=["'][^"']*price2[^"']*["'][^>]*>([\d,]+)/i,
            /class=["'][^"']*important[^"']*["'][^>]*>[¥￥]?\s*([\d,]+)/i,
        ],
    },
    // Yahoo Shopping
    {
        hostPatterns: ['store.shopping.yahoo.co.jp', 'shopping.yahoo.co.jp', 'paypaymall.yahoo.co.jp'],
        imagePatterns: [
            /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
            /class=["'][^"']*elMainImage[^"']*["'][^>]*>\s*<img[^>]+src=["']([^"']+)["']/i,
        ],
        pricePatterns: [
            /class=["'][^"']*elPriceNumber["'][^>]*>([\d,]+)/i,
        ],
    },
    // Kakaku.com (価格.com) - needs special handling for encoding
    {
        hostPatterns: ['kakaku.com', 'www.kakaku.com'],
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        },
        imagePatterns: [
            // Priority 1: Product gallery images (most reliable for actual product images)
            /<img[^>]+class="[^"]*gallery[^"]*"[^>]+src=["']([^"']+)["']/i,
            /<img[^>]+id="[^"]*gallery[^"]*"[^>]+src=["']([^"']+)["']/i,
            // Priority 2: Main product photo container
            /<div[^>]+class="[^"]*mainPhoto[^"]*"[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/i,
            /class=["'][^"']*itemviewImage[^"']*["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/i,
            // Priority 3: Product image from data attributes
            /data-image=["']([^"']+)["']/i,
            /data-src=["'](https?:\/\/[^"']*img1\.kakaku\.k-img\.com\/images\/productimage[^"']+)["']/i,
            // Priority 4: Images from kakaku.com product image CDN
            /<img[^>]+src=["'](https?:\/\/img1\.kakaku\.k-img\.com\/images\/productimage\/[^"']+)["']/i,
            /<img[^>]+src=["'](https?:\/\/[^"']*kakaku[^"']*\/images\/productimage[^"']+)["']/i,
            // Priority 5: Any product-related image from CDN (excluding logo)
            /<img[^>]+src=["'](https?:\/\/img1\.kakaku\.k-img\.com\/images\/(?!.*(?:logo|icon|common|btn))[^"']+)["']/i,
            // Priority 6: Fallback - images from product directory
            /<img[^>]+src=["'](https?:\/\/[^"']+\/item\/K[0-9]+[^"']*)["']/i,
        ],
        titlePatterns: [
            // Product title
            /class=["'][^"']*productName[^"']*["'][^>]*>([^<]+)</i,
            /<h2[^>]+itemprop=["']name["'][^>]*>([^<]+)</i,
            /itemprop=["']name["'][^>]*>([^<]+)</i,
        ],
        pricePatterns: [
            // 価格.com - クレカ支払い最安価格(税込) を優先取得
            // Pattern 1: クレカ支払い最安価格の後の価格
            /クレカ支払い最安価格[^0-9]*¥?\s*([\d,]+)/i,
            /クレカ払い最安価格[^0-9]*¥?\s*([\d,]+)/i,
            /クレジットカード[^0-9]*最安[^0-9]*¥?\s*([\d,]+)/i,
            // Pattern 2: 税込価格
            /税込[^0-9]*¥?\s*([\d,]+)/i,
            // Pattern 3: 最安価格（一般）
            /最安価格[^0-9]*¥?\s*([\d,]+)/i,
            /最安値[^0-9]*¥?\s*([\d,]+)/i,
            // Pattern 4: priceMin クラス（価格.comの価格表示クラス）
            /class="[^"]*priceMin[^"]*"[^>]*>[^<]*¥?\s*([\d,]+)/i,
            /class="[^"]*lowest[^"]*"[^>]*>[^<]*¥?\s*([\d,]+)/i,
            // Pattern 5: JSON-LD lowPrice
            /"lowPrice"\s*:\s*"?([\d,]+)"?/,
            /"price"\s*:\s*"?([\d,]+)"?/,
            // Pattern 6: 基本的な円表記
            /¥\s*([\d,]+)/,
            /￥\s*([\d,]+)/,
            /([\d,]+)\s*円/,
        ],
    },
    // Yodobashi
    {
        hostPatterns: ['www.yodobashi.com', 'yodobashi.com'],
        imagePatterns: [
            /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
            /id=["']mainImage["'][^>]*>\s*<img[^>]+src=["']([^"']+)["']/i,
        ],
        pricePatterns: [
            /class=["'][^"']*salesPrice[^"']*["'][^>]*>[¥￥]?\s*([\d,]+)/i,
        ],
    },
    // Mercari
    {
        hostPatterns: ['jp.mercari.com', 'mercari.com'],
        imagePatterns: [
            /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
        ],
        pricePatterns: [
            /"price"\s*:\s*(\d+)/,
        ],
    },
];

// Get site-specific config
function getSiteConfig(hostname: string): SiteConfig | null {
    return SITE_CONFIGS.find(config =>
        config.hostPatterns.some(pattern => hostname.includes(pattern))
    ) || null;
}

// Fetch HTML with appropriate headers
async function fetchHtml(url: string, siteConfig: SiteConfig | null): Promise<string> {
    const headers = siteConfig?.headers || {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    };

    const response = await fetch(url, {
        headers,
        redirect: 'follow',
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    // Handle encoding
    const contentType = response.headers.get('content-type') || '';
    const buffer = await response.arrayBuffer();

    let encoding = 'utf-8';
    const charsetMatch = contentType.match(/charset=([^;]+)/i);
    if (charsetMatch) {
        encoding = charsetMatch[1].trim().toLowerCase();
    }

    // Map common encoding names
    const encodingMap: Record<string, string> = {
        'shift_jis': 'shift-jis',
        'shift-jis': 'shift-jis',
        'sjis': 'shift-jis',
        'euc-jp': 'euc-jp',
        'eucjp': 'euc-jp',
    };
    encoding = encodingMap[encoding] || encoding;

    try {
        const decoder = new TextDecoder(encoding, { fatal: false });
        let html = decoder.decode(buffer);

        // Check for meta charset in HTML if we got garbled text or encoding wasn't specified
        if (encoding === 'utf-8') {
            // First, try to find charset in a quick UTF-8 decode
            const charsetPatterns = [
                /<meta[^>]+charset=["']?([^"'\s>]+)/i,
                /<meta[^>]+content=["'][^"']*charset=([^"'\s;]+)/i,
            ];

            for (const pattern of charsetPatterns) {
                const match = html.match(pattern);
                if (match) {
                    const detectedEncoding = match[1].toLowerCase().trim();
                    const mappedEncoding = encodingMap[detectedEncoding] || detectedEncoding;

                    // If a different encoding was detected, re-decode
                    if (mappedEncoding !== 'utf-8' && mappedEncoding !== encoding) {
                        try {
                            const newDecoder = new TextDecoder(mappedEncoding, { fatal: false });
                            html = newDecoder.decode(buffer);
                        } catch {
                            // Keep original decoding
                        }
                    }
                    break;
                }
            }
        }

        return html;
    } catch {
        // Fallback to UTF-8
        const decoder = new TextDecoder('utf-8', { fatal: false });
        return decoder.decode(buffer);
    }
}

// Extract using patterns
function extractWithPatterns(html: string, patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
            const value = match[1].trim();
            if (value && value.length > 0) {
                return value;
            }
        }
    }
    return null;
}

// Clean up Amazon image URL to get high-res version
function cleanAmazonImageUrl(url: string): string {
    if (!url) return url;

    // Remove size constraints from Amazon image URLs
    // Example: ._SX300_ or ._AC_SX300_ or ._SS40_
    return url
        .replace(/\._[A-Z0-9_]+_\./g, '.')
        .replace(/\._[A-Z]{2}\d+_/g, '');
}

// Check if an image URL is likely a logo or icon (not a product image)
function isLogoOrIcon(imageUrl: string): boolean {
    const lowerUrl = imageUrl.toLowerCase();
    const logoPatterns = [
        'logo',
        '/icon',
        '_icon',
        'favicon',
        'ogimage', // Generic OGP image
        '/common/',
        '/shared/',
        'sprite',
        'btn_',
        'button',
        '/ui/',
        'header_',
        'footer_',
        'nav_',
        '/assets/images/og', // Common OGP path for site logos
        'site-image',
        'default-image',
        'placeholder',
    ];

    return logoPatterns.some(pattern => lowerUrl.includes(pattern));
}

// Extract image from HTML
function extractImage(html: string, url: string, siteConfig: SiteConfig | null): string | null {
    const parsedUrl = new URL(url);
    const isKakaku = parsedUrl.hostname.includes('kakaku.com');

    // Use site-specific patterns first
    if (siteConfig?.imagePatterns) {
        const image = extractWithPatterns(html, siteConfig.imagePatterns);
        if (image) {
            let cleanImage = image;

            // Clean Amazon image URLs
            if (parsedUrl.hostname.includes('amazon')) {
                cleanImage = cleanAmazonImageUrl(image);
            }

            // Make absolute if relative
            if (!cleanImage.startsWith('http')) {
                try {
                    cleanImage = new URL(cleanImage, parsedUrl.origin).href;
                } catch {
                    return null;
                }
            }

            // For Kakaku.com, skip if it looks like a logo
            if (isKakaku && isLogoOrIcon(cleanImage)) {
                // Continue to try other methods
            } else {
                return cleanImage;
            }
        }
    }

    // Fallback: Common OGP patterns
    const ogPatterns = [
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ];

    const ogImage = extractWithPatterns(html, ogPatterns);
    if (ogImage) {
        let absoluteOgImage = ogImage;
        if (!ogImage.startsWith('http')) {
            try {
                absoluteOgImage = new URL(ogImage, parsedUrl.origin).href;
            } catch {
                absoluteOgImage = '';
            }
        }

        // Skip if it looks like a logo (especially for Kakaku.com)
        if (absoluteOgImage && (!isKakaku || !isLogoOrIcon(absoluteOgImage))) {
            return absoluteOgImage;
        }
    }

    // Fallback: JSON-LD image
    const jsonLdPatterns = [
        /"image"\s*:\s*"([^"]+)"/,
        /"image"\s*:\s*\[\s*"([^"]+)"/,
        /"image"\s*:\s*\{\s*"url"\s*:\s*"([^"]+)"/,
    ];

    const jsonLdImage = extractWithPatterns(html, jsonLdPatterns);
    if (jsonLdImage) {
        if (!jsonLdImage.startsWith('http')) {
            try {
                return new URL(jsonLdImage, parsedUrl.origin).href;
            } catch {
                return null;
            }
        }
        return jsonLdImage;
    }

    // Last resort for Kakaku.com: Try to find ANY product image
    if (isKakaku) {
        const lastResortPatterns = [
            // Product images typically have specific path patterns
            /<img[^>]+src=["'](https?:\/\/[^"']+\/images\/[^"']*(?:product|item|goods)[^"']*)["']/i,
            /<img[^>]+src=["'](https?:\/\/img[0-9]*\.[^"']+\.com[^"']+\.(jpg|jpeg|png|webp))["']/i,
        ];

        for (const pattern of lastResortPatterns) {
            const match = html.match(pattern);
            if (match && match[1] && !isLogoOrIcon(match[1])) {
                return match[1];
            }
        }
    }

    return null;
}

// Extract title from HTML
function extractTitle(html: string, siteConfig: SiteConfig | null): string | null {
    // Use site-specific patterns first
    if (siteConfig?.titlePatterns) {
        const title = extractWithPatterns(html, siteConfig.titlePatterns);
        if (title) {
            // Decode HTML entities
            return title
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&nbsp;/g, ' ')
                .trim();
        }
    }

    // Fallback: OGP title
    const ogPatterns = [
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    ];

    const ogTitle = extractWithPatterns(html, ogPatterns);
    if (ogTitle && !ogTitle.includes('Amazon') && ogTitle.length > 10) {
        return ogTitle.trim();
    }

    // Fallback: <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
        let title = titleMatch[1].trim();
        // Clean up common suffixes
        title = title
            .replace(/\s*[|\-–—:]\s*Amazon\.co\.jp.*$/i, '')
            .replace(/\s*[|\-–—:]\s*Amazon\.com.*$/i, '')
            .replace(/\s*[|\-–—:]\s*楽天市場.*$/i, '')
            .replace(/\s*[|\-–—:]\s*Yahoo!ショッピング.*$/i, '')
            .replace(/\s*[|\-–—:]\s*価格\.com.*$/i, '')
            .trim();

        if (title.length > 5) {
            return title;
        }
    }

    return null;
}

// Extract price from HTML
function extractPrice(html: string, siteConfig: SiteConfig | null): number | null {
    // Try site-specific patterns first (in order of priority)
    if (siteConfig?.pricePatterns) {
        for (const pattern of siteConfig.pricePatterns) {
            // Reset lastIndex for global patterns
            if (pattern.global) {
                pattern.lastIndex = 0;
            }

            const match = html.match(pattern);
            if (match && match[1]) {
                const price = parseFloat(match[1].replace(/,/g, ''));
                // Valid price: at least 100 yen, less than 100 million yen
                if (!isNaN(price) && price >= 100 && price < 100000000) {
                    return price;
                }
            }
        }
    }

    // Fallback: Common price patterns
    const fallbackPatterns = [
        // Basic yen patterns
        /¥\s*([\d,]+)/,
        /￥\s*([\d,]+)/,
        /([\d,]+)\s*円/,
        // JSON-LD patterns
        /"price"\s*:\s*"?([\d,]+)"?/,
        /"lowPrice"\s*:\s*"?([\d,]+)"?/,
        // Schema.org patterns
        /itemprop="price"[^>]*content="([\d,]+)"/i,
        /itemprop="lowPrice"[^>]*content="([\d,]+)"/i,
    ];

    for (const pattern of fallbackPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
            const price = parseFloat(match[1].replace(/,/g, ''));
            if (!isNaN(price) && price >= 100 && price < 100000000) {
                return price;
            }
        }
    }

    return null;
}

// Extract description
function extractDescription(html: string): string | null {
    const patterns = [
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
    ];

    return extractWithPatterns(html, patterns);
}

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
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        const hostname = parsedUrl.hostname;
        const siteConfig = getSiteConfig(hostname);
        const isAmazon = hostname.includes('amazon');

        let html = '';
        let title = '';
        let description = '';
        let image = '';
        let price: number | null = null;

        // Fetch HTML directly
        try {
            html = await fetchHtml(url, siteConfig);

            // Extract data from HTML
            title = extractTitle(html, siteConfig) || '';
            description = extractDescription(html) || '';
            image = extractImage(html, url, siteConfig) || '';
            price = extractPrice(html, siteConfig);

        } catch (fetchError) {
            console.error('Error fetching HTML directly:', fetchError);
        }

        // If direct fetch failed or got incomplete data, try OGS (but not for Amazon)
        if (!isAmazon && (!title || !image)) {
            try {
                const ogsOptions = {
                    url,
                    timeout: 10000,
                    fetchOptions: {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                        },
                    },
                };

                const { result, error: ogsError } = await ogs(ogsOptions);

                if (!ogsError && result) {
                    if (!title) {
                        title = result.ogTitle || result.twitterTitle || result.dcTitle || '';
                    }
                    if (!description) {
                        description = result.ogDescription || result.twitterDescription || result.dcDescription || '';
                    }
                    if (!image) {
                        if (result.ogImage && result.ogImage.length > 0) {
                            image = result.ogImage[0].url;
                        } else if (result.twitterImage && result.twitterImage.length > 0) {
                            image = result.twitterImage[0].url;
                        }
                    }
                }
            } catch (ogsError) {
                console.error('OGS error:', ogsError);
            }
        }

        // Make image URL absolute if needed
        if (image && !image.startsWith('http')) {
            try {
                image = new URL(image, parsedUrl.origin).href;
            } catch {
                image = '';
            }
        }

        // For Amazon, if we still don't have a proper title, it means we got blocked
        if (isAmazon && (!title || title === 'Amazon.co.jp' || title === 'Amazon')) {
            // Try to extract ASIN and construct a basic response
            const asinMatch = url.match(/\/(?:dp|product|gp\/product)\/([A-Z0-9]{10})/i);
            if (asinMatch) {
                const asin = asinMatch[1];
                // Construct image URL from ASIN (this format usually works)
                image = `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg`;
                title = `Amazon商品 (ASIN: ${asin})`;
            }
        }

        return NextResponse.json({
            title: title || '',
            description: description || '',
            image: image || '',
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
