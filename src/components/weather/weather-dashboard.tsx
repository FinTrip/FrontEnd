"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import WeatherSearch from "./weather-search";
import CurrentWeather from "./current-weather";
import WeatherForecast from "./weather-forecast";
import PopularDestinations from "./popular-destinations";
import WeatherMap from "./weather-map";
import WeatherTips from "./weather-tips";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Types for OpenWeatherMap API responses
export interface GeocodingResponse {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface WeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    "1h"?: number;
    "3h"?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust?: number;
    };
    visibility: number;
    pop: number;
    rain?: {
      "3h": number;
    };
    sys: {
      pod: string;
    };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

// API key
const API_KEY = "7585cc4af686cf630c9aaf9db4864de6";

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const location = searchParams.get("location") || "Hà Nội";

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) return;

      setLoading(true);
      setError(null);

      try {
        // Step 1: Get coordinates from location name
        const geoResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
            location
          )}&limit=1&appid=${API_KEY}`
        );

        if (!geoResponse.ok) {
          throw new Error("Failed to fetch location data");
        }

        const geoData: GeocodingResponse[] = await geoResponse.json();

        if (!geoData.length) {
          throw new Error("Location not found");
        }

        const { lat, lon } = geoData[0];

        // Step 2: Get current weather data
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=vi`
        );

        if (!weatherResponse.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const weatherResult: WeatherResponse = await weatherResponse.json();
        setWeatherData(weatherResult);

        // Step 3: Get forecast data
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=vi`
        );

        if (!forecastResponse.ok) {
          throw new Error("Failed to fetch forecast data");
        }

        const forecastResult: ForecastResponse = await forecastResponse.json();
        setForecastData(forecastResult);
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError("Không thể tải dữ liệu thời tiết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location]);

  const handleSearch = (searchLocation: string) => {
    if (searchLocation) {
      router.push(`/weather?location=${encodeURIComponent(searchLocation)}`);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg text-gray-900">
        <WeatherSearch onSearch={handleSearch} defaultValue={location} />

        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mt-4">
            {error}
          </div>
        )}

        {!loading && !error && weatherData && (
          <div className="mt-6">
            <CurrentWeather data={weatherData} />
          </div>
        )}
      </Card>

      {!loading && !error && weatherData && forecastData && (
        <>
          <Tabs defaultValue="forecast" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm rounded-xl text-gray-900">
              <TabsTrigger value="forecast">Dự báo 5 ngày</TabsTrigger>
              <TabsTrigger value="hourly">Theo giờ</TabsTrigger>
              <TabsTrigger value="map">Bản đồ thời tiết</TabsTrigger>
            </TabsList>
            <TabsContent value="forecast" className="mt-4">
              <Card className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg text-gray-900">
                <WeatherForecast data={forecastData} />
              </Card>
            </TabsContent>
            <TabsContent value="hourly" className="mt-4">
              <Card className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg text-gray-900">
                <h3 className="text-xl font-semibold mb-4">Dự báo theo giờ</h3>
                <div className="overflow-x-auto pb-2">
                  <div className="flex space-x-4 min-w-max">
                    {forecastData.list.slice(0, 8).map((hour, index) => {
                      const time = new Date(hour.dt * 1000).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center p-3 bg-teal-50 rounded-lg min-w-[100px]"
                        >
                          <span className="text-sm font-medium">{time}</span>
                          <img
                            src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}
                            alt={hour.weather[0].description}
                            className="w-12 h-12 my-2"
                          />
                          <span className="text-lg font-bold">
                            {Math.round(hour.main.temp)}°C
                          </span>
                          <span className="text-xs text-teal-700 mt-1">
                            {hour.pop > 0
                              ? `${Math.round(hour.pop * 100)}% mưa`
                              : "Không mưa"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="map" className="mt-4">
              <Card className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg text-gray-900">
                <WeatherMap
                  location={{
                    name: weatherData.name,
                    lat: weatherData.coord.lat,
                    lon: weatherData.coord.lon,
                  }}
                />
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg text-gray-900">
              <WeatherTips
                location={weatherData.name}
                currentWeather={weatherData}
              />
            </Card>
            <Card className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg text-gray-900">
              <PopularDestinations onSelectLocation={handleSearch} />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
