import type { Metadata } from "next";
import { Anton, Archivo, Geist_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://grandvista-construction.com"),
  title: "Grandvista | America's Commercial Builder",
  description:
    "Grandvista is a growth-minded commercial construction partner building business environments with clear planning, field coordination, and accountable execution.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Grandvista | America's Commercial Builder",
    description:
      "Grandvista is a growth-minded commercial construction partner building business environments with clear planning, field coordination, and accountable execution.",
    url: "/",
    siteName: "Grandvista Construction",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Grandvista Construction - America's Commercial Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grandvista | America's Commercial Builder",
    description:
      "Grandvista is a growth-minded commercial construction partner building business environments with clear planning, field coordination, and accountable execution.",
    images: ["/twitter-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${anton.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
