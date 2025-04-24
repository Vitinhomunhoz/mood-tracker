"use client"

import { memo } from "react"
import type { Mood } from "@/components/dashboard"

interface MoodHistoryProps {
  moods: Mood[]
}

const getMoodEmoji = (mood: string): string => {
  switch (mood) {
    case "happy":
      return "😊"
    case "neutral":
      return "😐"
    case "sad":
      return "😢"
    case "angry":
      return "😡"
    case "anxious":
      return "😰"
    default:
      return "❓"
  }
}

const getMoodLabel = (mood: string): string => {
  switch (mood) {
    case "happy":
      return "Feliz"
    case "neutral":
      return "Neutro"
    case "sad":
      return "Triste"
    case "angry":
      return "Irritado"
    case "anxious":
      return "Ansioso"
    default:
      return "Desconhecido"
  }
}

// Usando memo para evitar renderizações desnecessárias
export const MoodHistory = memo(function MoodHistory({ moods }: MoodHistoryProps) {
  // Garantir que moods é um array válido
  if (!moods || !Array.isArray(moods) || moods.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum registro de humor ainda. Comece a acompanhar seu humor hoje!</p>
      </div>
    )
  }

  // Formatador de data para português do Brasil
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

  const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="space-y-4">
      {moods.map((entry) => {
        if (!entry || !entry.id) return null

        const date = entry.date ? new Date(entry.date) : new Date()
        const formattedDate = dateFormatter.format(date)
        const formattedTime = timeFormatter.format(date)

        return (
          <div key={entry.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getMoodEmoji(entry.mood || "")}</span>
                <span className="font-medium">{getMoodLabel(entry.mood || "")}</span>
              </div>
              <div className="text-sm text-gray-500">
                {formattedDate} às {formattedTime}
              </div>
            </div>

            {entry.note && <div className="mt-2 text-gray-700 text-sm">{entry.note}</div>}
          </div>
        )
      })}
    </div>
  )
})
