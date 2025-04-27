import type { Metadata } from "next"
import WeatherDashboard from "@/components/weather/weather-dashboard"

export const metadata: Metadata = {
  title: "Thời Tiết Việt Nam | Weather Forecast",
  description: "Theo dõi thời tiết tại các điểm du lịch Việt Nam để lên kế hoạch chuyến đi của bạn.",
}

export default function WeatherPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-500 to-teal-700">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">Thời Tiết Việt Nam</h1>
        <p className="text-white text-center mb-12 max-w-3xl mx-auto">
          Theo dõi thời tiết tại các điểm du lịch Việt Nam để lên kế hoạch chuyến đi của bạn tốt hơn.
        </p>

        <WeatherDashboard />
      </div>
    </main>
  )
}
