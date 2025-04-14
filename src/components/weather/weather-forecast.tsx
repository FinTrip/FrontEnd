import type { ForecastResponse } from "./weather-dashboard"
import { Droplets } from "lucide-react"

interface WeatherForecastProps {
  data: ForecastResponse
}

export default function WeatherForecast({ data }: WeatherForecastProps) {
  // Group forecast data by day
  const dailyForecasts = groupForecastsByDay(data.list)

  // Format date to display day of week
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if the date is today
    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay"
    }

    // Check if the date is tomorrow
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Ngày mai"
    }

    // Return the day of week for other days
    return date.toLocaleDateString("vi-VN", { weekday: "long" })
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Dự báo 5 ngày tới</h3>

      <div className="space-y-4">
        {Object.entries(dailyForecasts).map(([timestamp, forecasts], index) => {
          const date = Number.parseInt(timestamp)
          const dayData = getDaySummary(forecasts)

          return (
            <div
              key={timestamp}
              className={`flex items-center justify-between p-4 rounded-lg ${
                index === 0 ? "bg-teal-100" : "bg-gray-50"
              } hover:bg-teal-50 transition-colors`}
            >
              <div className="flex items-center">
                <div className="w-28">
                  <div className="font-medium">{formatDate(date)}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(date * 1000).toLocaleDateString("vi-VN", {
                      day: "numeric",
                      month: "numeric",
                    })}
                  </div>
                </div>

                <div className="flex items-center ml-4">
                  <img
                    src={`https://openweathermap.org/img/wn/${dayData.icon}@2x.png`}
                    alt={dayData.description}
                    className="w-12 h-12"
                  />
                  <div className="ml-2 w-32">
                    <div className="text-sm">{dayData.description}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                {dayData.pop > 0 && (
                  <div className="flex items-center mr-6 text-blue-600">
                    <Droplets className="h-4 w-4 mr-1" />
                    <span>{Math.round(dayData.pop * 100)}%</span>
                  </div>
                )}

                <div className="flex space-x-4">
                  <div className="text-blue-600 font-medium">{Math.round(dayData.min_temp)}°</div>
                  <div className="text-red-600 font-medium">{Math.round(dayData.max_temp)}°</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Helper function to group forecasts by day
function groupForecastsByDay(forecastList: ForecastResponse["list"]) {
  const dailyForecasts: Record<string, ForecastResponse["list"]> = {}

  forecastList.forEach((forecast) => {
    // Get the date part only (without time)
    const date = new Date(forecast.dt * 1000)
    date.setHours(0, 0, 0, 0)
    const dateTimestamp = date.getTime() / 1000

    if (!dailyForecasts[dateTimestamp]) {
      dailyForecasts[dateTimestamp] = []
    }

    dailyForecasts[dateTimestamp].push(forecast)
  })

  return dailyForecasts
}

// Helper function to get day summary from forecasts
function getDaySummary(forecasts: ForecastResponse["list"]) {
  // Find min and max temperatures
  let min_temp = Number.POSITIVE_INFINITY
  let max_temp = Number.NEGATIVE_INFINITY
  let totalPop = 0
  const mostFrequentWeather: Record<string, number> = {}

  forecasts.forEach((forecast) => {
    min_temp = Math.min(min_temp, forecast.main.temp_min)
    max_temp = Math.max(max_temp, forecast.main.temp_max)
    totalPop = Math.max(totalPop, forecast.pop)

    // Count weather conditions to find the most frequent one
    const weatherId = forecast.weather[0].id.toString()
    mostFrequentWeather[weatherId] = (mostFrequentWeather[weatherId] || 0) + 1
  })

  // Find the most frequent weather condition
  let maxCount = 0
  let dominantWeatherId = ""

  Object.entries(mostFrequentWeather).forEach(([weatherId, count]) => {
    if (count > maxCount) {
      maxCount = count
      dominantWeatherId = weatherId
    }
  })

  // Find the forecast with the dominant weather
  const representativeForecast =
    forecasts.find((forecast) => forecast.weather[0].id.toString() === dominantWeatherId) || forecasts[0]

  return {
    min_temp,
    max_temp,
    pop: totalPop,
    description: representativeForecast.weather[0].description,
    icon: representativeForecast.weather[0].icon,
  }
}
