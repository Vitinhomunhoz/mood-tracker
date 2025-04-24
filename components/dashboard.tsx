"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoodEntry } from "@/components/mood-entry"
import { MoodHistory } from "@/components/mood-history"
import { MoodCharts } from "@/components/mood-charts"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs, addDoc, Timestamp, limit } from "firebase/firestore"
import type { User } from "firebase/auth"

interface DashboardProps {
  user: User
  onLogout: () => void
}

export type Mood = {
  id: string
  date: string
  mood: "happy" | "neutral" | "sad" | "angry" | "anxious"
  note?: string
  timestamp: number
  userId: string
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [moods, setMoods] = useState<Mood[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Buscar humores do Firestore - otimizado com limit para melhor performance
  useEffect(() => {
    const fetchMoods = async () => {
      try {
        if (!user || !user.uid) {
          setMoods([])
          setLoading(false)
          return
        }

        const moodsCollection = collection(db, "moods")
        // Limitando a 100 entradas para melhor performance
        const moodsQuery = query(
          moodsCollection,
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(100),
        )

        const querySnapshot = await getDocs(moodsQuery)
        const moodsList: Mood[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (data) {
            moodsList.push({
              id: doc.id,
              date: data.date || new Date().toISOString(),
              mood: data.mood || "neutral",
              note: data.note || "",
              timestamp: data.timestamp ? data.timestamp.toMillis() : Date.now(),
              userId: data.userId || user.uid,
            })
          }
        })

        setMoods(moodsList)
      } catch (error) {
        console.error("Erro ao buscar humores:", error)
        toast({
          title: "Erro",
          description: "Falha ao carregar seu histórico de humor.",
          variant: "destructive",
        })
        // Em caso de erro, definir array vazio para evitar erros de renderização
        setMoods([])
      } finally {
        setLoading(false)
      }
    }

    fetchMoods()
  }, [user, toast])

  // Memoizando a função para evitar recriações desnecessárias
  const saveMood = useCallback(
    async (moodData: Omit<Mood, "id" | "userId">) => {
      if (!user || !user.uid) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para salvar seu humor.",
          variant: "destructive",
        })
        return
      }

      // Gerar ID temporário para atualização otimista
      const tempId = `temp_${Date.now()}`

      // Criar objeto de humor com ID temporário para atualização otimista
      const newMood: Mood = {
        id: tempId,
        ...moodData,
        userId: user.uid,
      }

      // Atualizar estado imediatamente (otimista)
      setMoods((prevMoods) => [newMood, ...(Array.isArray(prevMoods) ? prevMoods : [])])

      // Mostrar toast de feedback imediato
      toast({
        title: "Salvando...",
        description: "Seu humor está sendo registrado.",
      })

      try {
        const moodsCollection = collection(db, "moods")

        // Preparar dados para o Firestore
        const firestoreData = {
          ...moodData,
          userId: user.uid,
          timestamp: Timestamp.fromDate(new Date(moodData.date)),
        }

        // Configurar para usar cache e priorizar velocidade
        const docRef = await addDoc(moodsCollection, firestoreData)

        // Atualizar o estado com o ID real do Firestore
        setMoods((prevMoods) => {
          if (!Array.isArray(prevMoods)) return [{ ...newMood, id: docRef.id }]
          return prevMoods.map((mood) => (mood.id === tempId ? { ...mood, id: docRef.id } : mood))
        })

        toast({
          title: "Humor salvo",
          description: "Seu humor foi registrado com sucesso.",
          variant: "default",
        })
      } catch (error) {
        console.error("Erro ao salvar humor:", error)

        // Remover o item temporário em caso de erro
        setMoods((prevMoods) => {
          if (!Array.isArray(prevMoods)) return []
          return prevMoods.filter((mood) => mood.id !== tempId)
        })

        toast({
          title: "Erro",
          description: "Falha ao salvar seu humor. Por favor, tente novamente.",
          variant: "destructive",
        })
      }
    },
    [user, toast],
  )

  // Memoizando o nome de exibição para evitar recálculos
  const displayName = useMemo(() => {
    if (!user) return "Usuário"
    return user.displayName || (user.email ? user.email.split("@")[0] : "Usuário")
  }, [user])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Olá, {displayName}</h1>
        <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Sair">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <Tabs defaultValue="entry" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entry">Hoje</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="entry">
          <Card>
            <CardHeader>
              <CardTitle>Como você está se sentindo hoje?</CardTitle>
              <CardDescription>Selecione uma emoção que melhor descreva seu humor</CardDescription>
            </CardHeader>
            <CardContent>
              <MoodEntry onSave={saveMood} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Seu Histórico de Humor</CardTitle>
              <CardDescription>Revise seus registros de humor anteriores</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : (
                <MoodHistory moods={moods || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Humor</CardTitle>
              <CardDescription>Visualize seus padrões emocionais ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : (
                <MoodCharts moods={moods || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
