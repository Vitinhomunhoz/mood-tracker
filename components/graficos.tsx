// filepath: c:\Users\Vito\Desktop\mood-tracker\app\graficos.tsx
"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const data = {
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"], // Certifique-se de que as labels estão definidas
    datasets: [
      {
        label: "Humor da Semana",
        data: [3, 4, 2, 5, 4, 3, 5], // Certifique-se de que os dados estão definidos
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Gráfico de Humor",
      },
    },
  }

export default function Graficos() {
  if (!data || !data.labels || !data.datasets) {
    return <p>Carregando dados...</p>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-4">Gráficos de Humor</h1>
        <Line data={data} options={options} />
      </div>
    </main>
  )
}