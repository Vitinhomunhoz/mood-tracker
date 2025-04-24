// Configuração do Firebase para web/React Native
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
import { enableIndexedDbPersistence, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore"

// Configuração do Firebase para seu aplicativo
const firebaseConfig = {
  apiKey: "AIzaSyD7BodTZa2KRsYQVtbUdLrTQy1imSN0G-w",
  authDomain: "chave-de-rotina.firebaseapp.com",
  projectId: "chave-de-rotina",
  storageBucket: "chave-de-rotina.firebasestorage.app",
  messagingSenderId: "92105139104",
  appId: "1:92105139104:web:5323037aa0e83c2144bac5",
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar Firestore com configurações otimizadas
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
})

// Habilitar persistência offline (isso melhora a performance)
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    console.error("Erro ao habilitar persistência offline:", err)
  })
}

// Inicializar outros serviços do Firebase
export const auth = getAuth(app)
export const storage = getStorage(app)

export default app
