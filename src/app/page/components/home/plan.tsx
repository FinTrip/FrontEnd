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
  // Di chuyển khai báo planData lên đầu component
  const planData: DayPlan[] = [
    {
      "day": 1,
      "date": "14 Feb",
      "activities": [
        {
          "type": "transport",
          "title": "Di Chuyển",
          "description": "Khởi hành từ sân bay, bắt đầu chuyến hành trình đầy thú vị.",
          "icon": "✈️"
        },
        {
          "type": "place",
          "title": "Đặc Sản Trần",
          "description": "Thưởng thức các món ăn đặc sản Đà Nẵng tại nhà hàng nổi tiếng.",
          "image": "/images/DacSanTran.webp"
        },
        {
          "type": "service",
          "title": "Bana Hill",
          "description": "Khám phá một trong những dịa điểm được săn....",
          "image": "/images/cauvang.jpg"
        }
      ]
    },
    {
      "day": 2,
      "date": "15 Feb",
      "activities": [
        {
          "type": "food",
          "title": "Bữa sáng với Mì Quảng",
          "description": "Thưởng thức món Mì Quảng đặc trưng tại quán ăn địa phương.",
          "image": "/images/miquang.jpg"
        },
        {
          "type": "place",
          "title": "Chùa Linh Ứng",
          "description": "Tham quan ngôi chùa nổi tiếng với tượng Phật Quan Thế Âm cao nhất Việt Nam.",
          "image": "/images/chualinhung.jpg"
        },
        {
          "type": "activity",
          "title": "Dạo phố Bạch Đằng",
          "description": "Dạo bộ, khám phá không gian ven sông Hàn sôi động về đêm.",
          "image": "/images/phodibo.webp"
        }
      ]
    },
    {
      "day": 3,
      "date": "16 Feb",
      "activities": [
        {
          "type": "food",
          "title": "Bánh ép Huế",
          "description": "Thưởng thức món ăn vặt nổi tiếng của Huế, giòn thơm hấp dẫn.",
          "image": "/images/banh-ep-hue.jpeg"
        },
        {
          "type": "place",
          "title": "Quần thể di tích cố đô Huế",
          "description": "Khám phá cung điện, thành quách cổ kính của triều Nguyễn.",
          "image": "/images/Quần thể di tích cố đô Huế.jpg"
        },
        {
          "type": "activity",
          "title": "Dạo quanh thành phố",
          "description": "Tự do khám phá nét đẹp cổ kính của Huế bằng xe đạp hoặc đi bộ."
        }
      ]
    },
    {
      "day": 4,
      "date": "17 Feb",
      "activities": [
        {
          "type": "food",
          "title": "Bún Bò Huế O Cương",
          "description": "Thưởng thức tô bún bò Huế chuẩn vị với nước dùng đậm đà.",
          "image": "/images/bunbohue.jpg"
        },
        {
          "type": "place",
          "title": "Đại Nội Huế",
          "description": "Chiêm ngưỡng kiến trúc cung đình, khám phá lịch sử triều Nguyễn.",
          "image": "/images/Đại Nội Huế.jpg"
        },
        {
          "type": "activity",
          "title": "Chùa Thiên Mụ",
          "description": "Tham quan ngôi chùa cổ linh thiêng bên dòng sông Hương thơ mộng.",
          "image": "/images/Chùa Thiên Mụ.jpg"
        }
      ]
    },
    {
      "day": 5,
      "date": "18 Feb",
      "activities": [
        {
          "type": "food",
          "title": "Bánh Bèo - Nậm - Lọc",
          "description": "Thưởng thức bộ ba món bánh Huế nổi tiếng với hương vị đặc trưng.",
          "image": "/images/Bèo Nậm Lọc.jpg"
        },
        {
          "type": "place",
          "title": "Lăng Khải Định",
          "description": "Chiêm ngưỡng công trình lăng tẩm kết hợp tinh hoa kiến trúc Đông - Tây.",
          "image": "/images/Lăng Khải Định.jpg"
        },
        {
          "type": "activity",
          "title": "Du thuyền trên sông Hương",
          "description": "Thưởng ngoạn phong cảnh yên bình và lắng nghe ca Huế trên thuyền rồng.",
          "image": "/images/Đi thuyền trên sông Hương.jpg"
        }
      ]
    }
    
    // Thêm các ngày khác tương tự
  ];

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [draggedActivity, setDraggedActivity] = useState<any>(null);
  const [draggedDay, setDraggedDay] = useState<number | null>(null);
  const [activities, setActivities] = useState(planData);

  const startDragging = (e: React.MouseEvent | TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
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
    startDragging(e);
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
    startDragging(e);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    move(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    stopDragging();
  };

  // Handlers cho activity drag
  const handleDragStart = (
    e: React.DragEvent,
    activity: any,
    dayIndex: number
  ) => {
    setDraggedActivity(activity);
    setDraggedDay(dayIndex);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedActivity(null);
    setDraggedDay(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent,
    targetDayIndex: number,
    targetIndex: number
  ) => {
    e.preventDefault();
    if (!draggedActivity || draggedDay === null) return;

    const newActivities = [...activities];
    // Remove from original position
    const sourceDay = newActivities[draggedDay];
    const [removedActivity] = sourceDay.activities.splice(
      sourceDay.activities.indexOf(draggedActivity),
      1
    );

    // Add to new position
    const targetDay = newActivities[targetDayIndex];
    targetDay.activities.splice(targetIndex, 0, removedActivity);

    setActivities(newActivities);
  };

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

        <div className="flex flex-col items-center justify-center text-center">
  <h1 className="text-2xl font-bold">MY PLAN</h1>
  <p className="text-lg">14 Feb - 20 Feb</p>
  <p className="text-lg">Da Nang - Hue</p>
  {/* <button className="text-blue-400">Editar viaje</button> */}
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
        {activities.map((day, dayIndex) => (
          <div
            key={dayIndex}
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
                  className="border rounded-lg overflow-hidden draggable-activity"
                  draggable
                  onDragStart={(e) => handleDragStart(e, activity, dayIndex)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dayIndex, actIndex)}
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
              {/* <button className="text-blue-500">Ver Mapa</button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plan;
