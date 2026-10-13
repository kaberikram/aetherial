import type { DreamCategory, DreamState, DreamType } from "@/utils/supabase/dreams"

export interface ClassificationOption<T extends string> {
  value: T
  en: string
  ms: string
}

export const dreamCategoryOptions: ClassificationOption<DreamCategory>[] = [
  { value: "Daytime Carryover Dream", en: "Daytime Carryover Dream", ms: "Mimpi Bawaan Sianghari" },
  { value: "Random Dream", en: "Random Dream", ms: "Mimpi Merapu" },
  { value: "Carried Dream", en: "Carried Dream", ms: "Mimpi Di Bawa" },
  { value: "Learning Dream", en: "Learning Dream", ms: "Mimpi Belajar" },
  { value: "Receiving Dream", en: "Receiving Dream", ms: "Mimpi Dapat Benda" },
  { value: "Message Dream", en: "Message Dream", ms: "Mimpi Pesanan" },
  { value: "Disturbance Dream", en: "Disturbance Dream", ms: "Mimpi Gangguan" },
  { value: "Blank Dream", en: "Blank Dream", ms: "Mimpi Blank (Kosong)" },
]

export const dreamStateOptions: ClassificationOption<DreamState>[] = [
  { value: "Watching a Screen", en: "Watching a Screen", ms: "Tengok Skrin" },
  { value: "Character in Dream", en: "Character in Dream", ms: "Watak Dalam Mimpi" },
  { value: "Both Watching and Being a Character", en: "Both Watching and Being a Character", ms: "Tengok Skrin Dan Watak Sekali" },
]

export const dreamTypeOptions: ClassificationOption<DreamType>[] = [
  { value: "Normal Dream", en: "Normal Dream", ms: "Mimpi Biasa" },
  { value: "Aware but Can't Control", en: "Aware but Can't Control", ms: "Sedar tapi Tidak Boleh Mengawal" },
  { value: "Lucid Dream", en: "Lucid Dream", ms: "Mimpi Sedar" },
  { value: "Liminal Dream", en: "Liminal Dream", ms: "Mimpi Ambang" },
  { value: "Vivid Dream", en: "Vivid Dream", ms: "Mimpi Jelas" },
]

export const classificationFieldLabels = {
  en: {
    filters: "Filters",
    clear: "Clear",
    clearAll: "Clear all",
    category: "Dream Category",
    state: "Dream State",
    type: "Dream Type",
    sheetTitle: "Filter dreams",
    sheetDescription: "These combine with emotion and search.",
    done: "Done",
  },
  ms: {
    filters: "Tapisan",
    clear: "Kosongkan",
    clearAll: "Kosongkan semua",
    category: "Kategori Mimpi",
    state: "Keadaan Mimpi",
    type: "Jenis Mimpi",
    sheetTitle: "Tapis mimpi",
    sheetDescription: "Ini digabung dengan emosi dan carian.",
    done: "Selesai",
  },
} as const

export function classificationLabel<T extends string>(
  options: ClassificationOption<T>[],
  value: T,
  language: "en" | "ms"
) {
  const match = options.find((option) => option.value === value)
  if (!match) return value
  return language === "ms" ? match.ms : match.en
}
