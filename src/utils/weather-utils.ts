// Helper function to format date
export function formatDate(timestamp: number, format: "full" | "day" | "time" = "full"): string {
    const date = new Date(timestamp * 1000)
  
    if (format === "time") {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  
    if (format === "day") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
  
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
  
      if (date.toDateString() === today.toDateString()) {
        return "Hôm nay"
      }
  
      if (date.toDateString() === tomorrow.toDateString()) {
        return "Ngày mai"
      }
  
      return date.toLocaleDateString("vi-VN", { weekday: "long" })
    }
  
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  
  // Helper function to get weather icon URL from OpenWeatherMap
  export function getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }
  
  // Helper function to convert wind direction in degrees to cardinal direction
  export function getWindDirection(degrees: number): string {
    const directions = ["Bắc", "Đông Bắc", "Đông", "Đông Nam", "Nam", "Tây Nam", "Tây", "Tây Bắc"]
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }
  
  // Helper function to get weather description in Vietnamese
  export function getWeatherDescription(weatherId: number): string {
    const weatherDescriptions: Record<number, string> = {
      200: "Giông bão với mưa nhỏ",
      201: "Giông bão với mưa",
      202: "Giông bão với mưa lớn",
      210: "Giông bão nhẹ",
      211: "Giông bão",
      212: "Giông bão mạnh",
      221: "Giông bão rải rác",
      230: "Giông bão với mưa phùn nhẹ",
      231: "Giông bão với mưa phùn",
      232: "Giông bão với mưa phùn mạnh",
      300: "Mưa phùn nhẹ",
      301: "Mưa phùn",
      302: "Mưa phùn mạnh",
      310: "Mưa phùn nhẹ",
      311: "Mưa phùn",
      312: "Mưa phùn mạnh",
      313: "Mưa rào và mưa phùn",
      314: "Mưa rào mạnh và mưa phùn",
      321: "Mưa phùn rải rác",
      500: "Mưa nhỏ",
      501: "Mưa vừa",
      502: "Mưa to",
      503: "Mưa rất to",
      504: "Mưa cực to",
      511: "Mưa đá",
      520: "Mưa rào nhẹ",
      521: "Mưa rào",
      522: "Mưa rào mạnh",
      531: "Mưa rào rải rác",
      600: "Tuyết nhẹ",
      601: "Tuyết",
      602: "Tuyết dày",
      611: "Mưa tuyết",
      612: "Mưa tuyết nhẹ",
      613: "Mưa tuyết rải rác",
      615: "Mưa nhẹ và tuyết",
      616: "Mưa và tuyết",
      620: "Tuyết rơi nhẹ",
      621: "Tuyết rơi",
      622: "Tuyết rơi dày",
      701: "Sương mù",
      711: "Khói",
      721: "Sương mờ",
      731: "Xoáy cát/bụi",
      741: "Sương mù",
      751: "Cát",
      761: "Bụi",
      762: "Tro núi lửa",
      771: "Gió mạnh",
      781: "Lốc xoáy",
      800: "Trời quang",
      801: "Ít mây",
      802: "Mây rải rác",
      803: "Nhiều mây",
      804: "Trời âm u",
    }
  
    return weatherDescriptions[weatherId] || "Không xác định"
  }
