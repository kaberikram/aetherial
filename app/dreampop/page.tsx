import type { Metadata } from 'next'
import React from 'react'
import { DreampopClient } from './dreampop-client' // Import the new client component

// Keep the specific metadata for this page
export const metadata: Metadata = {
  title: 'DreamPop - Aetherial Dream',
  description: 'Hit matching colored spheres to score! Beat the clock in this fast-paced arcade game.',
  openGraph: {
    title: 'DreamPop - Aetherial Dream',
    description: 'Hit matching colored spheres to score! Beat the clock in this fast-paced arcade game.',
    url: 'https://www.aetherialdream.com/dreampop',
    images: [
      {
        url: 'https://www.aetherialdream.com/dreampopWeb.png', // Use the specific image
        width: 1200,
        height: 630,
        alt: 'DreamPop Game',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DreamPop - Aetherial Dream',
    description: 'Hit matching colored spheres to score! Beat the clock in this fast-paced arcade game.',
    images: ['https://www.aetherialdream.com/dreampopWeb.png'], // Use the specific image
    creator: '@Kaberikram',
  },
}

// This is now the main Page component (Server Component)
export default function ExplorePage() {
  return (
    <div className="fixed inset-0 w-full h-full bg-black">
      <DreampopClient /> {/* Render the client component */}
    </div>
  )
}

// Remove all other component definitions and client-side logic from this file