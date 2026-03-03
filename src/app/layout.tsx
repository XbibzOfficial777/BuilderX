import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://catbox-manager.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Catbox Manager Pro - File Management Made Easy",
    template: "%s | Catbox Manager Pro",
  },
  description: "Upload, organize, and share your files seamlessly with Catbox Manager Pro. Built with powerful features, beautiful UI, and cloud integration via Catbox.moe API.",
  keywords: [
    "Catbox",
    "File Manager",
    "Cloud Storage",
    "File Upload",
    "Image Hosting",
    "File Sharing",
    "Album Manager",
    "Next.js",
    "React",
    "Firebase",
  ],
  authors: [{ name: "Catbox Manager Team", url: siteUrl }],
  creator: "Catbox Manager Pro",
  publisher: "Catbox Manager Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "1024x1024", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Catbox Manager Pro",
    title: "Catbox Manager Pro - File Management Made Easy",
    description: "Upload, organize, and share your files seamlessly with Catbox Manager Pro. Built with powerful features, beautiful UI, and cloud integration.",
    images: [
      {
        url: "/og-image.png",
        width: 1344,
        height: 768,
        alt: "Catbox Manager Pro - Modern File Management",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catbox Manager Pro - File Management Made Easy",
    description: "Upload, organize, and share your files seamlessly with beautiful UI and cloud integration.",
    images: ["/og-image.png"],
    creator: "@catboxmanager",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://files.catbox.moe" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
