"use client"

import { useState, useEffect } from "react"

interface WeatherMapProps {
  location: {
    name: string
    lat: number
    lon: number
  }
}

export default function WeatherMap({ location }: WeatherMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapType, setMapType] = useState<"temp" | "precipitation" | "wind" | "clouds">("temp")

  useEffect(() => {
    // This would be replaced with actual map initialization code
    // For demonstration purposes, we're simulating map loading
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [location])

  // OpenWeatherMap tile layer URLs
  const getMapUrl = () => {
    const baseUrl = "https://tile.openweathermap.org/map"
    const apiKey = "7585cc4af686cf630c9aaf9db4864de6"

    switch (mapType) {
      case "temp":
        return `${baseUrl}/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`
      case "precipitation":
        return `${baseUrl}/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`
      case "wind":
        return `${baseUrl}/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`
      case "clouds":
        return `${baseUrl}/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`
      default:
        return `${baseUrl}/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Bản đồ thời tiết</h3>
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: "400px" }}>
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-teal-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Bản đồ thời tiết cho</p>
              <h4 className="text-xl font-bold text-teal-800">{location.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                Vị trí: {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Trong triển khai thực tế, đây sẽ là bản đồ thời tiết tương tác hiển thị dữ liệu thời tiết theo vị trí.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Bạn có thể sử dụng thư viện Leaflet hoặc Google Maps để hiển thị bản đồ với lớp phủ thời tiết từ
                OpenWeatherMap.
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <button
          className={`px-3 py-1 ${mapType === "temp" ? "bg-teal-100 text-teal-800" : "bg-white border border-gray-300 text-gray-700"} rounded-full text-sm`}
          onClick={() => setMapType("temp")}
        >
          Nhiệt độ
        </button>
        <button
          className={`px-3 py-1 ${mapType === "precipitation" ? "bg-teal-100 text-teal-800" : "bg-white border border-gray-300 text-gray-700"} rounded-full text-sm`}
          onClick={() => setMapType("precipitation")}
        >
          Lượng mưa
        </button>
        <button
          className={`px-3 py-1 ${mapType === "wind" ? "bg-teal-100 text-teal-800" : "bg-white border border-gray-300 text-gray-700"} rounded-full text-sm`}
          onClick={() => setMapType("wind")}
        >
          Gió
        </button>
        <button
          className={`px-3 py-1 ${mapType === "clouds" ? "bg-teal-100 text-teal-800" : "bg-white border border-gray-300 text-gray-700"} rounded-full text-sm`}
          onClick={() => setMapType("clouds")}
        >
          Mây
        </button>
      </div>
    </div>
  )
}
