"use client"

import { useState } from "react"
import { SlidersHorizontalIcon, SmileIcon, FrownIcon, SearchIcon, XIcon } from "lucide-react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  classificationFieldLabels,
  classificationLabel,
  dreamCategoryOptions,
  dreamStateOptions,
  dreamTypeOptions,
  type ClassificationOption,
} from "@/utils/dream-classifications"
import type { DreamCategory, DreamState, DreamType } from "@/utils/supabase/dreams"

interface FilterChipsProps {
  filters: JournalFilterState
  onFiltersChange: (filters: JournalFilterState) => void
  filterLabel?: string
  emotions: string[]
  language: "en" | "ms"
}

const emotionMapping = {
  gembira: "happy",
  teruja: "excited",
  takut: "scared",
  cemas: "anxious",
  keliru: "confused",
  tenang: "peaceful",
  happy: "happy",
  excited: "excited",
  scared: "scared",
  anxious: "anxious",
  confused: "confused",
  peaceful: "peaceful",
} as const

export function FilterChips({
  filters,
  onFiltersChange,
  filterLabel = "Filter by Emotion",
  emotions = ["Happy", "Excited", "Scared", "Anxious", "Confused", "Peaceful"],
  language,
}: FilterChipsProps) {
  const [showEmotions, setShowEmotions] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const copy = classificationFieldLabels[language]
  const activeClassificationCount = [
    filters.kategoriMimpi,
    filters.keadaanMimpi,
    filters.jenisMimpi,
  ].filter(Boolean).length
  const hasAnyFilter = Boolean(filters.emotion) || activeClassificationCount > 0

  const toggleEmotionFilter = () => {
    setShowEmotions((isOpen) => !isOpen)
    if (filters.emotion) onFiltersChange({ ...filters, emotion: null })
  }

  const handleEmotionSelect = (emotion: string) => {
    const lowerEmotion = emotion.toLowerCase()
    const englishEmotion = emotionMapping[lowerEmotion as keyof typeof emotionMapping] || lowerEmotion
    if (filters.emotion === englishEmotion) {
      onFiltersChange({ ...filters, emotion: null })
      return
    }
    onFiltersChange({ ...filters, emotion: englishEmotion })
  }

  const getDisplayEmotion = () => {
    if (!filters.emotion) return null
    if (language === "en") return filters.emotion.charAt(0).toUpperCase() + filters.emotion.slice(1)

    const matchingEntry = Object.entries(emotionMapping).find(
      ([key, value]) => value === filters.emotion && key !== value
    )
    if (!matchingEntry) return filters.emotion.charAt(0).toUpperCase() + filters.emotion.slice(1)
    return matchingEntry[0].charAt(0).toUpperCase() + matchingEntry[0].slice(1)
  }

  const clearClassifications = () => {
    onFiltersChange({
      ...filters,
      kategoriMimpi: null,
      keadaanMimpi: null,
      jenisMimpi: null,
    })
  }

  const clearAll = () => {
    onFiltersChange({
      emotion: null,
      kategoriMimpi: null,
      keadaanMimpi: null,
      jenisMimpi: null,
    })
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={toggleEmotionFilter}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1 ${
            filters.emotion
              ? "bg-white text-black"
              : "bg-zinc-900/70 text-zinc-300 border border-zinc-800"
          }`}
        >
          <SmileIcon className="h-4 w-4" />
          {filters.emotion ? `${filterLabel}: ${getDisplayEmotion()}` : filterLabel}
        </button>

        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm whitespace-nowrap flex items-center gap-1 ${
            activeClassificationCount > 0
              ? "bg-white text-black"
              : "bg-zinc-900/70 text-zinc-300 border border-zinc-800"
          }`}
        >
          <SlidersHorizontalIcon className="h-4 w-4" />
          {copy.filters}
          {activeClassificationCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black/10 px-1 text-xs">
              {activeClassificationCount}
            </span>
          )}
        </button>
      </div>

      {showEmotions && (
        <div className="flex flex-wrap gap-2 mt-2 pl-1">
          {emotions.map((emotion) => (
            <button
              key={emotion}
              type="button"
              onClick={() => handleEmotionSelect(emotion)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap flex items-center gap-1 ${
                filters.emotion === emotionMapping[emotion.toLowerCase() as keyof typeof emotionMapping]
                  ? "bg-white text-black"
                  : "bg-zinc-900/50 text-zinc-300 border border-zinc-800"
              }`}
            >
              {getEmotionIcon(emotion)}
              <span className="capitalize">{emotion}</span>
            </button>
          ))}
        </div>
      )}

      {activeClassificationCount > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
          {filters.kategoriMimpi && (
            <ActiveFilterChip
              label={classificationLabel(dreamCategoryOptions, filters.kategoriMimpi, language)}
              onClear={() => onFiltersChange({ ...filters, kategoriMimpi: null })}
            />
          )}
          {filters.keadaanMimpi && (
            <ActiveFilterChip
              label={classificationLabel(dreamStateOptions, filters.keadaanMimpi, language)}
              onClear={() => onFiltersChange({ ...filters, keadaanMimpi: null })}
            />
          )}
          {filters.jenisMimpi && (
            <ActiveFilterChip
              label={classificationLabel(dreamTypeOptions, filters.jenisMimpi, language)}
              onClear={() => onFiltersChange({ ...filters, jenisMimpi: null })}
            />
          )}
        </div>
      )}

      {hasAnyFilter && (
        <button
          type="button"
          onClick={clearAll}
          className="mt-2 text-xs text-zinc-400 underline underline-offset-2 hover:text-white"
        >
          {copy.clearAll}
        </button>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="bottom"
          className="z-[60] max-h-[85vh] overflow-y-auto rounded-t-2xl border-zinc-800 bg-zinc-950 px-4 pb-8 pt-6 text-white"
        >
          <SheetHeader className="pr-8 text-left">
            <SheetTitle className="text-white">{copy.sheetTitle}</SheetTitle>
            <SheetDescription className="text-zinc-400">{copy.sheetDescription}</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <FilterGroup
              label={copy.category}
              options={dreamCategoryOptions}
              selected={filters.kategoriMimpi}
              language={language}
              onSelect={(kategoriMimpi) => onFiltersChange({ ...filters, kategoriMimpi })}
            />
            <FilterGroup
              label={copy.state}
              options={dreamStateOptions}
              selected={filters.keadaanMimpi}
              language={language}
              onSelect={(keadaanMimpi) => onFiltersChange({ ...filters, keadaanMimpi })}
            />
            <FilterGroup
              label={copy.type}
              options={dreamTypeOptions}
              selected={filters.jenisMimpi}
              language={language}
              onSelect={(jenisMimpi) => onFiltersChange({ ...filters, jenisMimpi })}
            />
          </div>

          <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-3 bg-zinc-950 py-3">
            <button
              type="button"
              onClick={clearClassifications}
              disabled={activeClassificationCount === 0}
              className="px-4 py-1.5 rounded-full text-sm text-white border border-zinc-600 disabled:opacity-40"
            >
              {copy.clear}
            </button>
            <SheetClose asChild>
              <button
                type="button"
                className="px-4 py-1.5 rounded-full text-sm bg-white text-black"
              >
                {copy.done}
              </button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function FilterGroup<T extends string>({
  label,
  options,
  selected,
  language,
  onSelect,
}: FilterGroupProps<T>) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-zinc-400">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected === option.value
          const optionLabel = language === "ms" ? option.ms : option.en
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(isSelected ? null : option.value)}
              className={`max-w-full px-3 py-1 rounded-full text-xs text-left leading-snug ${
                isSelected
                  ? "bg-white text-black"
                  : "bg-zinc-900/50 text-zinc-300 border border-zinc-800"
              }`}
            >
              {optionLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ActiveFilterChip({ label, onClear }: ActiveFilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClear}
      aria-label={label}
      className="px-3 py-1 rounded-full text-xs whitespace-nowrap flex items-center gap-1 bg-white text-black"
    >
      <span>{label}</span>
      <XIcon className="h-3 w-3" />
    </button>
  )
}

function getEmotionIcon(emotion: string) {
  const lowerEmotion = emotion.toLowerCase()
  switch (lowerEmotion) {
    case "happy":
    case "gembira":
    case "excited":
    case "teruja":
      return <SmileIcon className="h-4 w-4" />
    case "scared":
    case "takut":
    case "anxious":
    case "cemas":
      return <FrownIcon className="h-4 w-4" />
    case "confused":
    case "keliru":
    case "peaceful":
    case "tenang":
      return <SearchIcon className="h-4 w-4" />
    default:
      return <SmileIcon className="h-4 w-4" />
  }
}

interface FilterGroupProps<T extends string> {
  label: string
  options: ClassificationOption<T>[]
  selected: T | null
  language: "en" | "ms"
  onSelect: (value: T | null) => void
}

interface ActiveFilterChipProps {
  label: string
  onClear: () => void
}

export interface JournalFilterState {
  emotion: string | null
  kategoriMimpi: DreamCategory | null
  keadaanMimpi: DreamState | null
  jenisMimpi: DreamType | null
}
