"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SmilePlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type AuthError } from "firebase/auth"

export function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { toast } = useToast()

  const validateForm = useCallback(() => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um endereço de email válido.",
        variant: "destructive",
      })
      return false
    }

    if (!password || password.length < 6) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return false
    }

    return true
  }, [email, password, toast])

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validateForm()) return

      setIsLoading(true)
      try {
        await signInWithEmailAndPassword(auth, email, password)
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao Mood Do Dia!",
        })
      } catch (error) {
        const authError = error as AuthError
        console.error("Erro de login:", authError)

        // Mensagens de erro em português
        let errorMessage = "Falha no login. Verifique suas credenciais."
        if (authError.code === "auth/user-not-found") {
          errorMessage = "Usuário não encontrado. Verifique seu email."
        } else if (authError.code === "auth/wrong-password") {
          errorMessage = "Senha incorreta. Tente novamente."
        } else if (authError.code === "auth/too-many-requests") {
          errorMessage = "Muitas tentativas. Tente novamente mais tarde."
        }

        toast({
          title: "Falha no login",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [email, password, toast, validateForm],
  )

  const handleSignup = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validateForm()) return

      setIsLoading(true)
      try {
        await createUserWithEmailAndPassword(auth, email, password)
        toast({
          title: "Conta criada",
          description: "Bem-vindo ao Mood Do Dia!",
        })
      } catch (error) {
        const authError = error as AuthError
        console.error("Erro de cadastro:", authError)

        // Mensagens de erro em português
        let errorMessage = "Falha ao criar conta. Tente novamente."
        if (authError.code === "auth/email-already-in-use") {
          errorMessage = "Este email já está em uso. Tente fazer login."
        } else if (authError.code === "auth/invalid-email") {
          errorMessage = "Email inválido. Verifique o formato."
        } else if (authError.code === "auth/weak-password") {
          errorMessage = "Senha muito fraca. Use uma senha mais forte."
        }

        toast({
          title: "Falha no cadastro",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [email, password, toast, validateForm],
  )

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
          <SmilePlus className="h-6 w-6 text-purple-600" />
        </div>
        <CardTitle className="text-2xl text-center">Mood Do Dia</CardTitle>
        <CardDescription className="text-center">
          Acompanhe suas emoções e monitore seu bem-estar mental
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Cadastrar</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Entrar"
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Senha</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Mínimo de 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
