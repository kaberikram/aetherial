"use client"

import { useState } from "react"
import { Moon } from "lucide-react"

export function DreamImage({ imageSrc, language }: DreamImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const copy = dreamImageCopy[language]
  const canShowImage = Boolean(imageSrc) && failedSrc !== imageSrc

  if (!canShowImage || !imageSrc) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border border-zinc-700/30 bg-zinc-800/30 p-8 text-center">
        <Moon className="h-10 w-10 text-zinc-500" aria-hidden="true" />
        <p className="max-w-xs text-sm text-zinc-400">
          {imageSrc ? copy.imageUnavailable : copy.noSavedImage}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700/50 bg-zinc-900/50">
      {/* Stored images can be data URLs or hosts that are not known ahead of time. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={copy.savedImageAlt}
        className="h-auto w-full"
        onError={() => setFailedSrc(imageSrc)}
      />
    </div>
  )
}

const dreamImageCopy = {
  en: {
    savedImageAlt: "Saved dream image",
    noSavedImage: "No image saved for this dream.",
    imageUnavailable: "This image could not be shown.",
  },
  ms: {
    savedImageAlt: "Imej mimpi yang disimpan",
    noSavedImage: "Tiada imej disimpan untuk mimpi ini.",
    imageUnavailable: "Imej ini tidak dapat dipaparkan.",
  },
} as const

interface DreamImageProps {
  imageSrc: string | null
  language: "en" | "ms"
}
