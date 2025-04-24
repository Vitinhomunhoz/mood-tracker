import { MoodTracker } from "@/components/mood-tracker"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="w-full max-w-md">
        <MoodTracker />
      </div>
    </main>
  )
}
