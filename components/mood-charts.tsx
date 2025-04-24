"use client"

import { useState, useEffect, memo } from "react"
import type { Mood } from "@/components/dashboard"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MoodChartsProps {
  moods: Mood[]
}

// Definir tipos para os dados dos gráficos
type ChartDataItem = {
  date: string
  value: number
  mood: string
  moodLabel: string
  note?: string
}

type DistributionDataItem = {
  mood: string
  count: number
}

const moodToValue = (mood: string): number => {
  switch (mood) {
    case "happy":
      return 5
    case "neutral":
      return 3
    case "sad":
      return 2
    case "angry":
      return 1
    case "anxious":
      return 1
    default:
      return 0
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

// Componente de tooltip personalizado em português
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="text-sm">{`Data: ${data.date}`}</p>
        <p className="text-sm font-medium">{`Humor: ${data.moodLabel}`}</p>
        {data.note && <p className="text-xs mt-1">{`Nota: ${data.note}`}</p>}
      </div>
    )
  }
  return null
}

// Usando memo para evitar renderizações desnecessárias
export const MoodCharts = memo(function MoodCharts({ moods }: MoodChartsProps) {
  const [timeRange, setTimeRange] = useState<"7days" | "30days">("7days")
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [distributionData, setDistributionData] = useState<DistributionDataItem[]>([])

  // Usar useEffect em vez de useMemo para efeitos colaterais
  useEffect(() => {
    // Garantir que moods é um array válido
    if (!moods || !Array.isArray(moods) || moods.length === 0) {
      setChartData([])
      setDistributionData([])
      return
    }

    try {
      // Ordenar humores por data
      const sortedMoods = [...moods].sort((a, b) => {
        // Garantir que as datas são válidas
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        return dateA - dateB
      })

      // Filtrar por intervalo de tempo
      const now = new Date()
      const filterDate = new Date()
      filterDate.setDate(now.getDate() - (timeRange === "7days" ? 7 : 30))
      const filterTime = filterDate.getTime()

      const filteredMoods = sortedMoods.filter((mood) => {
        // Garantir que a data é válida
        if (!mood.date) return false
        return new Date(mood.date).getTime() > filterTime
      })

      // Preparar dados para gráficos
      const newChartData: ChartDataItem[] = filteredMoods.map((mood) => {
        const date = new Date(mood.date || new Date())
        const formatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" })
        return {
          date: formatter.format(date),
          value: moodToValue(mood.mood || ""),
          mood: mood.mood || "",
          moodLabel: getMoodLabel(mood.mood || ""),
          note: mood.note,
        }
      })

      // Contar humores por tipo - usando abordagem mais segura
      const moodCounts = {
        happy: 0,
        neutral: 0,
        sad: 0,
        angry: 0,
        anxious: 0,
      }

      filteredMoods.forEach((mood) => {
        const moodType = mood.mood || ""
        if (moodType in moodCounts) {
          moodCounts[moodType as keyof typeof moodCounts]++
        }
      })

      // Converter para formato de gráfico
      const newDistributionData: DistributionDataItem[] = []
      for (const [mood, count] of Object.entries(moodCounts)) {
        newDistributionData.push({
          mood: getMoodLabel(mood),
          count,
        })
      }

      setChartData(newChartData)
      setDistributionData(newDistributionData)
    } catch (error) {
      console.error("Erro ao processar dados para gráficos:", error)
      // Em caso de erro, definir dados vazios
      setChartData([])
      setDistributionData([])
    }
  }, [moods, timeRange])

  // Verificação segura para renderização
  const hasData = Array.isArray(moods) && moods.length > 0

  if (!hasData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum dado de humor disponível ainda. Comece a registrar seu humor para ver os gráficos!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList>
            <TabsTrigger value="7days">Últimos 7 Dias</TabsTrigger>
            <TabsTrigger value="30days">Últimos 30 Dias</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Humor ao Longo do Tempo</h3>
        <div className="h-64">
          {chartData.length > 0 ? (
            <ChartContainer
              config={{
                mood: {
                  label: "Nível de Humor",
                  color: "hsl(var(--chart-1))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Nenhum dado disponível para o período selecionado
            </div>
          )}
        </div>
      </Card>
    </div>
  )
})
