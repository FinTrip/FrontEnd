"use client";

import React, { useRef, useState, MouseEvent, TouchEvent } from "react";
import "./plan.css";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

// Định nghĩa interface cho Activity
interface Activity {
  type: string;
  title: string;
  description: string;
  icon?: string | React.ReactNode;
  image?: string;
}

// Định nghĩa interface cho Day
interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

const Plan = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const startDragging = (clientX: number) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(clientX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const move = (clientX: number) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = clientX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Mouse Event Handlers
  const handleMouseDown = (e: MouseEvent) => {
    startDragging(e.pageX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    move(e.pageX);
  };

  const handleMouseUp = () => {
    stopDragging();
  };

  // Touch Event Handlers
  const handleTouchStart = (e: TouchEvent) => {
    startDragging(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    move(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    stopDragging();
  };

  // Khai báo planData với type cụ thể
  const planData: DayPlan[] = [
    {
      day: 1,
      date: "14 Feb",
      activities: [
        {
          type: "transport",
          title: "Di Chuyển",
          description: "Giờ bay...",
          icon: "✈️",
        },
        {
          type: "place",
          title: "Địa điểm Trần",
          description: "Mô tả chi tiết về địa điểm tham quan...",
          image: "/images/DacSanTran.webp",
        },
        {
          type: "service",
          title: "Dịch vụ",
          description: "Chi tiết dịch vụ...",
          image: "/images/cauvang.jpg",
        },
      ],
    },
    {
      day: 2,
      date: "15 Feb",
      activities: [
        {
          type: "food",
          title: "Món ăn",
          description: "Bữa sáng tại nhà hàng...",
          image: "/images/miquang.jpg",
        },
        {
          type: "place",
          title: "Chùa Linh Ứng",
          description: "Ngôi chùa nổi tiếng với vị trí...",
          image: "/images/chualinhung.jpg",
        },
        {
          type: "activity",
          title: "Phố đi bộ Bạch Đằng",
          description: "Đi dạo tự do khám phá văn hoá...",
          image: "/images/phodibo.webp",
        },
      ],
    },
    {
      day: 3,
      date: "16 Feb",
      activities: [
        {
          type: "food",
          title: "Food",
          description: "Bữa sáng tại nhà hàng...",
        },
        {
          type: "place",
          title: "Fushimi Inari-taisha",
          description: "Đền thờ nổi tiếng với các cổng torii đỏ...",
          image: "/images/fushimi.jpg",
        },
        {
          type: "activity",
          title: "Caminata Libre",
          description: "Đi dạo tự do khám phá...",
        },
      ],
    },
    {
      day: 4,
      date: "17 Feb",
      activities: [
        {
          type: "food",
          title: "Food",
          description: "Bữa sáng tại nhà hàng...",
        },
        {
          type: "place",
          title: "Fushimi Inari-taisha",
          description: "Đền thờ nổi tiếng với các cổng torii đỏ...",
          image: "/images/fushimi.jpg",
        },
        {
          type: "activity",
          title: "Caminata Libre",
          description: "Đi dạo tự do khám phá...",
        },
      ],
    },
    {
      day: 5,
      date: "18 Feb",
      activities: [
        {
          type: "food",
          title: "Food",
          description: "Bữa sáng tại nhà hàng...",
        },
        {
          type: "place",
          title: "Fushimi Inari-taisha",
          description: "Đền thờ nổi tiếng với các cổng torii đỏ...",
          image: "/images/fushimi.jpg",
        },
        {
          type: "activity",
          title: "Caminata Libre",
          description: "Đi dạo tự do khám phá...",
        },
      ],
    },
    // Thêm các ngày khác tương tự
  ];

  const renderIcon = (icon: string | React.ReactNode) => {
    if (typeof icon === "string") {
      return <span>{icon}</span>;
    }
    return icon;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white">
      {/* Header */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <IoArrowBackOutline size={24} />
          <span>Back</span>
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold">MY PLAN</h1>
          <p className="text-lg">14 Feb - 20 Feb</p>
          <p className="text-lg">Da Nang - Hue</p>
          <button className="text-blue-400">Editar viaje</button>
        </div>
      </div>

      {/* Timeline Cards Container */}
      <div
        ref={scrollContainerRef}
        className={`scroll-container flex overflow-x-auto gap-4 p-6 ${
          isDragging ? "dragging" : ""
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        {planData.map((day, index) => (
          <div
            key={index}
            className="flex-shrink-0 bg-white rounded-xl p-4 w-[320px] text-black"
            style={{ touchAction: "pan-y pinch-zoom" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">
                Day {day.day} - {day.date}
              </h2>
            </div>

            {/* Activities */}
            <div className="space-y-4">
              {day.activities.map((activity, actIndex) => (
                <div
                  key={actIndex}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="p-3 flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {activity.icon && renderIcon(activity.icon)}
                      <span className="font-medium">{activity.title}</span>
                    </div>
                    <button className="text-gray-500">...</button>
                  </div>

                  {activity.image && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={activity.image}
                        alt={activity.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {activity.description && (
                    <div className="p-3">
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Activity Button */}
            <div className="mt-4 flex justify-between items-center">
              <button className="flex items-center gap-2 text-blue-500">
                <FaPlus size={12} />
                <span>Add activities</span>
              </button>
              <button className="text-blue-500">Ver Mapa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plan;
