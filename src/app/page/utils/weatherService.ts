// utils/weatherService.ts
import axios from "axios";

interface GeocodingResponse {
  lat: number;
  lon: number;
  name: string;
}

export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
  date: string;
}

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

// Cache key prefix
const WEATHER_CACHE_PREFIX = "weather_cache_";
const GEOCODING_CACHE_PREFIX = "geocoding_cache_";

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

console.log("API Key:", process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY);

export const getCoordinates = async (
  province: string
): Promise<GeocodingResponse> => {
  // Check cache first
  const cacheKey = `${GEOCODING_CACHE_PREFIX}${province}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  try {
    const response = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${province}&limit=1&appid=${API_KEY}`
    );

    if (response.data && response.data.length > 0) {
      const result = {
        lat: response.data[0].lat,
        lon: response.data[0].lon,
        name: response.data[0].name,
      };

      // Save to cache
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: result,
          timestamp: Date.now(),
        })
      );

      return result;
    }
    throw new Error("Location not found");
  } catch (error) {
    console.error("Error getting coordinates:", error);
    throw error;
  }
};

export const getWeatherForDate = async (
  lat: number,
  lon: number,
  targetDate: string
): Promise<WeatherData> => {
  const cacheKey = `${WEATHER_CACHE_PREFIX}${lat}_${lon}_${targetDate}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const targetDateTime = new Date(targetDate);
    const diffInDays = Math.floor(
      (targetDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    let weatherData;

    if (diffInDays <= 5) {
      // Use forecast API for next 5 days
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );

      // Find the forecast closest to 12:00 PM for the target date
      const targetForecast = response.data.list.find((item: any) => {
        const forecastDate = new Date(item.dt * 1000)
          .toISOString()
          .split("T")[0];
        return forecastDate === targetDate;
      });

      if (targetForecast) {
        weatherData = {
          temp: Math.round(targetForecast.main.temp),
          description: targetForecast.weather[0].description,
          icon: targetForecast.weather[0].icon,
          humidity: targetForecast.main.humidity,
          windSpeed: targetForecast.wind.speed,
          date: targetDate,
        };
      }
    } else {
      // For dates beyond 5 days, we'll use a placeholder or historical data
      weatherData = {
        temp: 25, // Default temperature
        description: "Dự báo không khả dụng",
        icon: "01d",
        date: targetDate,
      };
    }

    // Save to cache
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: weatherData,
        timestamp: Date.now(),
      })
    );

    return weatherData;
  } catch (error) {
    console.error("Error getting weather:", error);
    throw error;
  }
};

export const getVietnameseDescription = (description: string): string => {
  const translations: { [key: string]: string } = {
    "clear sky": "Trời quang",
    "few clouds": "Ít mây",
    "scattered clouds": "Mây rải rác",
    "broken clouds": "Nhiều mây",
    "shower rain": "Mưa rào",
    rain: "Mưa",
    thunderstorm: "Giông",
    snow: "Tuyết",
    mist: "Sương mù",
  };

  return translations[description.toLowerCase()] || description;
};
