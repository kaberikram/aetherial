import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import Script from "next/script"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from '@vercel/analytics/react'
import { LayoutWithConditionalSidebar } from '@/components/layout-with-conditional-sidebar'

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: "Aetherial - Dream Journal",
  description: "A progressive web app for dream journaling and self-discovery",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/newlogo.svg', type: 'image/svg+xml' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aetherial'
  },
  metadataBase: new URL('https://www.aetherialdream.com'),
  openGraph: {
    title: 'Dream Explorer',
    description: 'Explore your dreams in an immersive 3D space',
    url: 'https://www.aetherialdream.com',
    siteName: 'Aetherial Dream',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dream Explorer',
    description: 'Explore your dreams in an immersive 3D space',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload the explore page to ensure loading screen appears instantly */}
        <link rel="preload" href="/explore" as="document" />
        <link rel="icon" href="/newlogo.svg" type="image/svg+xml" />
        
        {/* Preload THREE.js */}
        <link rel="preload" href="https://unpkg.com/three@0.174.0/build/three.module.js" as="script" />
        
        {/* Script to preload THREE.js */}
        <Script id="preload-three" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined') {
              // Create a link to preload THREE.js
              const link = document.createElement('link');
              link.rel = 'preload';
              link.as = 'script';
              link.href = 'https://unpkg.com/three@0.174.0/build/three.module.js';
              document.head.appendChild(link);
              
              // Preload common THREE.js resources
              const preloadResources = [
                'https://unpkg.com/three@0.174.0/examples/jsm/loaders/GLTFLoader.js',
                'https://unpkg.com/three@0.174.0/examples/jsm/controls/OrbitControls.js'
              ];
              
              preloadResources.forEach(resource => {
                const resourceLink = document.createElement('link');
                resourceLink.rel = 'preload';
                resourceLink.as = 'script';
                resourceLink.href = resource;
                document.head.appendChild(resourceLink);
              });
            }
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-black text-white`}>
        <Toaster position="top-center" />
        <LayoutWithConditionalSidebar>
          {children}
        </LayoutWithConditionalSidebar>
        <Analytics />
      </body>
    </html>
  )
}

import './globals.css'