"use client"

import { useState, useEffect, useCallback } from "react"
import { AuthScreen } from "@/components/auth-screen"
import { Dashboard } from "@/components/dashboard"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"

export function MoodTracker() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Usar Firebase Auth para verificar o estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    // Limpar inscrição
    return () => unsubscribe()
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut()
      toast({
        title: "Desconectado",
        description: "Você saiu da sua conta com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao sair: ", error)
      toast({
        title: "Erro",
        description: "Falha ao sair. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }, [toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    )
  }

  return <>{!user ? <AuthScreen /> : <Dashboard user={user} onLogout={handleLogout} />}</>
}
