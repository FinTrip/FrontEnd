"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WeatherSearchProps {
  onSearch: (location: string) => void
  defaultValue?: string
}

const popularLocations = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Huế", "Nha Trang", "Đà Lạt", "Phú Quốc", "Hạ Long"]

export default function WeatherSearch({ onSearch, defaultValue = "" }: WeatherSearchProps) {
  const [searchTerm, setSearchTerm] = useState(defaultValue)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim())
      setShowSuggestions(false)
    }
  }

  const filteredLocations = popularLocations.filter((location) =>
    location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mx-auto gap-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Tìm kiếm địa điểm (ví dụ: Hà Nội, Đà Nẵng...)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 py-6 text-base rounded-l-lg border-r-0 focus-visible:ring-teal-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 py-6" />
        </div>
        <Button type="submit" className="rounded-l-none bg-teal-600 hover:bg-teal-700 text-white px-6 py-6">
          Tìm kiếm
        </Button>
      </form>

      {showSuggestions && searchTerm && filteredLocations.length > 0 && (
        <div className="absolute z-10 w-full max-w-3xl mx-auto bg-white shadow-lg rounded-lg mt-1 overflow-hidden">
          <ul>
            {filteredLocations.map((location, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-teal-50 cursor-pointer"
                onClick={() => {
                  setSearchTerm(location)
                  onSearch(location)
                  setShowSuggestions(false)
                }}
              >
                {location}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
