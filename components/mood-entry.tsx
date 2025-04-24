"use client"

import { useState, memo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import type { Mood } from "@/components/dashboard"

interface MoodEntryProps {
  onSave: (mood: Omit<Mood, "id" | "userId">) => void
}

type MoodType = "happy" | "neutral" | "sad" | "angry" | "anxious"

const moods: { type: MoodType; emoji: string; label: string }[] = [
  { type: "happy", emoji: "😊", label: "Feliz" },
  { type: "neutral", emoji: "😐", label: "Neutro" },
  { type: "sad", emoji: "😢", label: "Triste" },
  { type: "angry", emoji: "😡", label: "Irritado" },
  { type: "anxious", emoji: "😰", label: "Ansioso" },
]

// Usando memo para evitar renderizações desnecessárias
export const MoodEntry = memo(function MoodEntry({ onSave }: MoodEntryProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [note, setNote] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedMood) return

    setIsSaving(true)

    // Criar dados do humor
    const now = new Date()
    const moodData = {
      mood: selectedMood,
      note: note.trim(),
      date: now.toISOString(),
      timestamp: now.getTime(),
    }

    try {
      // Chamar a função de salvamento
      onSave(moodData)

      // Resetar formulário imediatamente para feedback instantâneo
      setSelectedMood(null)
      setNote("")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-2">
        {moods.map((mood) => (
          <Card
            key={mood.type}
            className={`p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
              selectedMood === mood.type ? "bg-purple-100 border-purple-300 ring-2 ring-purple-300" : "hover:bg-gray-50"
            }`}
            onClick={() => setSelectedMood(mood.type)}
          >
            <div className="text-3xl mb-2">{mood.emoji}</div>
            <div className="text-xs text-center">{mood.label}</div>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Adicione uma nota (opcional)</label>
        <Textarea
          placeholder="Como você está se sentindo hoje? O que aconteceu?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="resize-none"
          rows={4}
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={!selectedMood || isSaving}
        className="w-full bg-purple-600 hover:bg-purple-700 transition-colors"
      >
        {isSaving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Salvando...
          </>
        ) : (
          "Salvar Humor"
        )}
      </Button>
    </div>
  )
})
