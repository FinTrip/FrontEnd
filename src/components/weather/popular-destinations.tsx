"use client"

import Image from "next/image"

interface PopularDestinationsProps {
  onSelectLocation: (location: string) => void
}

const destinations = [
  {
    name: "Hà Nội",
    image: "/placeholder.svg?height=100&width=150",
    description: "Thủ đô với kiến trúc cổ và hiện đại",
  },
  {
    name: "Hạ Long",
    image: "/placeholder.svg?height=100&width=150",
    description: "Vịnh biển với hàng nghìn hòn đảo đá vôi",
  },
  {
    name: "Đà Nẵng",
    image: "/placeholder.svg?height=100&width=150",
    description: "Thành phố biển với cầu Rồng nổi tiếng",
  },
  {
    name: "Hội An",
    image: "/placeholder.svg?height=100&width=150",
    description: "Phố cổ với đèn lồng và kiến trúc truyền thống",
  },
  {
    name: "Nha Trang",
    image: "/placeholder.svg?height=100&width=150",
    description: "Thành phố biển với bãi biển dài và đẹp",
  },
  {
    name: "Đà Lạt",
    image: "/placeholder.svg?height=100&width=150",
    description: "Thành phố sương mù với khí hậu mát mẻ",
  },
]

export default function PopularDestinations({ onSelectLocation }: PopularDestinationsProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Điểm đến phổ biến</h3>
      <div className="grid grid-cols-2 gap-3">
        {destinations.map((destination, index) => (
          <div
            key={index}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectLocation(destination.name)}
          >
            <div className="relative h-20">
              <Image
                src={destination.image || "/placeholder.svg"}
                alt={destination.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-2">
              <h4 className="font-medium text-teal-800">{destination.name}</h4>
              <p className="text-xs text-gray-600 line-clamp-2">{destination.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
