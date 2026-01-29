import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WishPop - Visual Wishlist Manager",
  description: "Manage your wishlist items visually with automatic URL fetching and Pinterest-style layout",
  keywords: ["wishlist", "shopping", "wishlist manager", "visual shopping list"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`light ${inter.variable}`}>
      <head>
        {/* Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-[#f3f4f6] dark:bg-[#101622] text-slate-900 dark:text-white min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
