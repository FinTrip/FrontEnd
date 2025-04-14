import type { WeatherResponse } from "./weather-dashboard"
import { Droplets, Wind, Sun, Umbrella, Clock } from "lucide-react"

interface CurrentWeatherProps {
  data: WeatherResponse
}

export default function CurrentWeather({ data }: CurrentWeatherProps) {
  // Format the last updated time
  const lastUpdated = new Date(data.dt * 1000).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Get weather icon URL
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`

  return (
    <div className="text-center md:text-left">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-teal-800">
            {data.name}, {data.sys.country}
          </h2>
          <p className="text-gray-600 mb-4">{data.weather[0].description}</p>
        </div>
        <div className="text-sm text-gray-500 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Cập nhật lúc: {lastUpdated}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center">
            <img src={iconUrl || "/placeholder.svg"} alt={data.weather[0].description} className="w-24 h-24" />
            <div className="ml-4">
              <div className="text-5xl font-bold text-teal-800">{Math.round(data.main.temp)}°C</div>
              <div className="text-lg text-gray-600">{data.weather[0].main}</div>
            </div>
          </div>
          <div className="text-gray-600 mt-2">Cảm giác như {Math.round(data.main.feels_like)}°C</div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-teal-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Wind className="h-5 w-5 text-teal-600 mr-2" />
            <div>
              <div className="text-sm text-gray-500">Gió</div>
              <div className="font-medium">{data.wind.speed} m/s</div>
            </div>
          </div>
          <div className="flex items-center">
            <Droplets className="h-5 w-5 text-teal-600 mr-2" />
            <div>
              <div className="text-sm text-gray-500">Độ ẩm</div>
              <div className="font-medium">{data.main.humidity}%</div>
            </div>
          </div>
          <div className="flex items-center">
            <Sun className="h-5 w-5 text-teal-600 mr-2" />
            <div>
              <div className="text-sm text-gray-500">Nhiệt độ cao/thấp</div>
              <div className="font-medium">
                {Math.round(data.main.temp_max)}°/{Math.round(data.main.temp_min)}°
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Umbrella className="h-5 w-5 text-teal-600 mr-2" />
            <div>
              <div className="text-sm text-gray-500">Mây</div>
              <div className="font-medium">{data.clouds.all}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
