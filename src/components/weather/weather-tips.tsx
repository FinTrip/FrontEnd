import { Cloud, Sun, CloudRain, Umbrella } from "lucide-react"
import type { WeatherResponse } from "./weather-dashboard"

interface WeatherTipsProps {
  location: string
  currentWeather: WeatherResponse
}

export default function WeatherTips({ location, currentWeather }: WeatherTipsProps) {
  // Determine weather category
  const isRainy =
    currentWeather.weather[0].main.toLowerCase().includes("rain") ||
    (currentWeather.rain && (currentWeather.rain["1h"] || currentWeather.rain["3h"]))

  const isSunny =
    currentWeather.weather[0].main.toLowerCase().includes("clear") ||
    currentWeather.weather[0].main.toLowerCase().includes("sun")

  const isHot = currentWeather.main.temp > 30
  const isCold = currentWeather.main.temp < 15
  const isHumid = currentWeather.main.humidity > 80

  // Generate tips based on weather conditions
  const getTips = () => {
    const tips = []

    if (isRainy) {
      tips.push("Mang theo ô hoặc áo mưa khi ra ngoài.")
      tips.push("Tránh các hoạt động ngoài trời nếu có thể.")
    }

    if (isSunny) {
      tips.push("Bôi kem chống nắng để bảo vệ da.")
      tips.push("Đeo kính râm để bảo vệ mắt.")
    }

    if (isHot) {
      tips.push("Uống nhiều nước để tránh mất nước.")
      tips.push("Tránh hoạt động ngoài trời vào giữa trưa.")
    }

    if (isCold) {
      tips.push("Mặc nhiều lớp quần áo để giữ ấm.")
      tips.push("Uống đồ uống ấm để duy trì nhiệt độ cơ thể.")
    }

    if (isHumid) {
      tips.push("Mặc quần áo thoáng khí để thoải mái hơn.")
      tips.push("Sử dụng máy hút ẩm trong phòng nếu có thể.")
    }

    // Add some general tips if we don't have specific ones
    if (tips.length < 2) {
      tips.push("Kiểm tra dự báo thời tiết trước khi ra ngoài.")
      tips.push("Chuẩn bị sẵn kế hoạch dự phòng cho các hoạt động ngoài trời.")
    }

    return tips
  }

  // Get icon based on weather condition
  const getIcon = () => {
    if (isRainy) return <CloudRain className="h-8 w-8 text-blue-500" />
    if (isSunny) return <Sun className="h-8 w-8 text-yellow-500" />
    return <Cloud className="h-8 w-8 text-gray-500" />
  }

  const tips = getTips()

  return (
    <div>
      <div className="flex items-center mb-4">
        {getIcon()}
        <h3 className="text-xl font-semibold ml-2">Lời khuyên cho du khách</h3>
      </div>

      <p className="text-gray-600 mb-4">Dựa trên thời tiết hiện tại tại {location}:</p>

      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start">
            <Umbrella className="h-5 w-5 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Lưu ý:</strong> Thời tiết có thể thay đổi nhanh chóng. Luôn kiểm tra dự báo mới nhất trước khi đi du
          lịch.
        </p>
      </div>
    </div>
  )
}
