"use client";

import React, { useRef, useState, useEffect } from "react";
import type { MouseEvent, TouchEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import "./plan.css";
import { IoArrowBackOutline, IoClose } from "react-icons/io5";
import {
  FaPlus,
  FaPlane,
  FaUtensils,
  FaMapMarkerAlt,
  FaCamera,
  FaWalking,
  FaHotel,
  FaTicketAlt,
  FaLandmark,
  FaTrash,
  FaClock,
  FaCalendarAlt,
  FaSuitcase,
  FaGlobeAmericas,
  FaUmbrellaBeach,
  FaMountain,
  FaSun,
  FaCloudSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaWind,
  FaRoute,
  FaStar,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import HomePage, { type DestinationCard } from "./home_page";
import Screenshot from "../screenshot";
import {
  WeatherData,
  getCoordinates,
  getWeatherForDate,
  getVietnameseDescription,
} from "../../utils/weatherService";

// Định nghĩa interface cho Activity
interface Activity {
  type: string;
  title: string;
  description: string;
  icon?: string | React.ReactNode;
  image?: string;
  location?: string;
  rating?: number;
  startTime?: string;
  endTime?: string;
}

// Định nghĩa interface cho Hotel
interface Hotel {
  name: string;
  link: string;
  description: string;
  price: string;
  name_nearby_place: string;
  hotel_class: string;
  img_origin: string;
  location_rating: number;
  province: string;
  amenities: string[];
}

// Định nghĩa interface cho Flight
interface Flight {
  outbound_flight_code: string;
  outbound_time: string;
  total_price_vnd: string;
  base_price_vnd: string;
  fare_basis: string;
  cabin: string;
}

// Định nghĩa interface cho Day
interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

interface TiltActivityCardProps {
  children: React.ReactNode;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

const ROTATION_RANGE = 12.5;
const HALF_ROTATION_RANGE = 12.5 / 2;

// Weather icon mapping
const getWeatherIcon = (iconCode: string) => {
  switch (iconCode) {
    case "01d":
    case "01n":
      return FaSun;
    case "02d":
    case "02n":
      return FaCloudSun;
    case "03d":
    case "03n":
    case "04d":
    case "04n":
      return FaCloud;
    case "09d":
    case "09n":
    case "10d":
    case "10n":
      return FaCloudRain;
    case "11d":
    case "11n":
      return FaCloudRain;
    case "13d":
    case "13n":
      return FaSnowflake;
    case "50d":
    case "50n":
      return FaWind;
    default:
      return FaCloud;
  }
};

const TiltActivityCard: React.FC<TiltActivityCardProps> = ({
  children,
  onMouseMove,
  onMouseLeave,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
    onMouseMove?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    x.set(0);
    y.set(0);
    onMouseLeave?.(e);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      className="activity-card-container"
    >
      <div
        style={{
          transform: "translateZ(25px)",
          transformStyle: "preserve-3d",
        }}
        className="activity-card-inner"
      >
        {children}
      </div>
    </motion.div>
  );
};

interface DraggableActivityProps {
  activity: Activity;
  onDelete: (dayIndex: number, activityIndex: number) => void;
  dayIndex: number;
  activityIndex: number;
  onDragStart: (
    e: React.DragEvent,
    dayIndex: number,
    activityIndex: number
  ) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (
    e: React.DragEvent,
    dayIndex: number,
    activityIndex: number
  ) => void;
  onActivityClick: (activity: Activity) => void;
  onTimeChange?: (
    dayIndex: number,
    activityIndex: number,
    startTime: string,
    endTime: string
  ) => void;
  children?: React.ReactNode;
}

const DraggableActivity: React.FC<DraggableActivityProps> = ({
  activity,
  onDelete,
  dayIndex,
  activityIndex,
  onDragStart,
  onDragEnd,
  onDragOver,
  onActivityClick,
  onTimeChange,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localStartTime, setLocalStartTime] = useState(
    activity.startTime || ""
  );
  const [localEndTime, setLocalEndTime] = useState(activity.endTime || "");

  useEffect(() => {
    setLocalStartTime(activity.startTime || "");
    setLocalEndTime(activity.endTime || "");
  }, [activity.startTime, activity.endTime]);

  const handleTimeChange = (newStartTime: string, newEndTime: string) => {
    setLocalStartTime(newStartTime);
    setLocalEndTime(newEndTime);
    if (onTimeChange) {
      onTimeChange(dayIndex, activityIndex, newStartTime, newEndTime);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    const dragData = {
      dayIndex,
      activityIndex,
      startTime: localStartTime,
      endTime: localEndTime,
    };
    e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    onDragStart(e, dayIndex, activityIndex);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    onDragEnd(e);
    e.currentTarget.classList.remove("dragging");
    e.currentTarget.classList.add("dropped");
    setTimeout(() => {
      e.currentTarget.classList.remove("dropped");
    }, 300);
  };

  const handleDelete = (e: MouseEvent<Element>) => {
    e.stopPropagation();
    onDelete(dayIndex, activityIndex);
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onActivityClick(activity);
  };

  return (
    <motion.div
      className="activity-card-container"
      style={{ perspective: 2000 }}
      onDragOver={(e) => onDragOver(e, dayIndex, activityIndex)}
    >
      <motion.div
        className="activity-card-inner"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={`draggable-activity ${isDragging ? "dragging" : ""}`}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <TimePicker
            startTime={localStartTime}
            endTime={localEndTime}
            onChange={handleTimeChange}
          />
          <motion.button
            className="delete-btn"
            onClick={handleDelete}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FaTrash />
          </motion.button>
          <div className="activity-content" onClick={handleContentClick}>
            {children}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface TimePickerProps {
  startTime: string;
  endTime: string;
  onChange: (startTime: string, endTime: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({
  startTime,
  endTime,
  onChange,
}) => {
  return (
    <div className="time-selector-container">
      <div className="time-picker">
        <div className="time-label">
          <FaClock className="time-icon" size={14} />
          <span>Start</span>
        </div>
        <input
          type="time"
          value={startTime}
          onChange={(e) => onChange(e.target.value, endTime)}
          className="time-input"
        />
        <div className="time-label">
          <FaClock className="time-icon" size={14} />
          <span>End</span>
        </div>
        <input
          type="time"
          value={endTime}
          onChange={(e) => onChange(startTime, e.target.value)}
          className="time-input"
        />
      </div>
    </div>
  );
};

const Plan = () => {
  const [showHomePage, setShowHomePage] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<{
    dayIndex: number;
    activityIndex: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftOffset, setScrollLeftOffset] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{
    day: number;
    index: number;
  } | null>(null);
  const [activities, setActivities] = useState<DayPlan[]>([]);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  const slideUp = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const slideRight = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  // Lấy dữ liệu từ localStorage và gọi API thời tiết
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const scheduleData = localStorage.getItem("travelSchedule");
        console.log("Raw data from localStorage:", scheduleData);
        if (!scheduleData) {
          throw new Error(
            "Không tìm thấy dữ liệu kế hoạch trong localStorage."
          );
        }

        const parsedData = JSON.parse(scheduleData);
        console.log("Parsed data from localStorage:", parsedData);
        if (
          !parsedData ||
          !parsedData.schedule ||
          !Array.isArray(parsedData.schedule.schedule)
        ) {
          throw new Error(
            "Dữ liệu không hợp lệ: 'schedule' không phải là mảng hoặc không tồn tại."
          );
        }

        // Lấy province, hotel và flight từ dữ liệu
        const province = parsedData.schedule.province;
        const selectedHotel = parsedData.hotel?.hotel_details || null;
        const selectedFlight = parsedData.flight?.flight_details || null;

        setHotel(selectedHotel);
        setFlight(selectedFlight);

        const formattedActivities = parsedData.schedule.schedule.map(
          (dayItem: any, index: number) => {
            const dateMatch = dayItem.day.match(/\((.*?)\)/);
            const date = dateMatch ? dateMatch[1] : dayItem.day;

            const dayActivities = dayItem.itinerary.flatMap((slot: any) => {
              const activities: Activity[] = [];

              if (slot.food) {
                activities.push({
                  type: "food",
                  title: slot.food.title || "Không có tiêu đề",
                  description: slot.food.description || "",
                  location: slot.food.address || "Không có địa chỉ",
                  rating: slot.food.rating || 0,
                  image: slot.food.img || "",
                });
              }

              if (slot.place) {
                activities.push({
                  type: "place",
                  title: slot.place.title || "Không có tiêu đề",
                  description: slot.place.description || "",
                  location: slot.place.address || "Không có địa chỉ",
                  rating: slot.place.rating || 0,
                  image: slot.place.img || "",
                });
              }

              return activities;
            });

            return {
              day: index + 1,
              date: date,
              activities: dayActivities,
            };
          }
        );

        console.log("Formatted Activities:", formattedActivities);
        setActivities(formattedActivities);

        // Lấy dữ liệu thời tiết
        setIsLoadingWeather(true);
        setWeatherError(null);

        try {
          const coordinates = await getCoordinates(province);
          console.log("Coordinates for province:", coordinates);
          
          const weatherPromises = formattedActivities.map(
            async (day: DayPlan) => {
              return await getWeatherForDate(
                coordinates.lat,
                coordinates.lon,
                day.date
              );
            }
          );

          const weatherResults = await Promise.all(weatherPromises);
          setWeatherData(weatherResults.filter(Boolean));
        } catch (weatherError: any) {
          console.error("Error fetching weather:", weatherError);
          setWeatherError("Không thể tải dữ liệu thời tiết");
        } finally {
          setIsLoadingWeather(false);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
        setLoading(false);
        console.error("Lỗi:", err);
      }
    };

    fetchData();
  }, []);

  const startDragging = (e: React.MouseEvent | TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setStartX(clientX - scrollContainerRef.current.offsetLeft);
    setScrollLeftOffset(scrollContainerRef.current.scrollLeft);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const move = (clientX: number) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = clientX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeftOffset - walk;
  };

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

  const handleDragStart = (
    e: React.DragEvent,
    dayIndex: number,
    activityIndex: number
  ) => {
    e.dataTransfer.setData("text/plain", `${dayIndex}-${activityIndex}`);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
    setDragOverIndex(null);
  };

  const handleDragOver = (
    e: React.DragEvent,
    dayIndex: number,
    activityIndex: number
  ) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midPoint = rect.top + rect.height / 2;
    const isBefore = e.clientY < midPoint;

    const newIndex = isBefore ? activityIndex : activityIndex + 1;
    setDragOverIndex({ day: dayIndex, index: newIndex });
  };

  const handleDrop = (e: React.DragEvent, targetDayIndex: number) => {
    e.preventDefault();
    const [sourceDayIndex, sourceActivityIndex] = e.dataTransfer
      .getData("text/plain")
      .split("-")
      .map(Number);

    if (!dragOverIndex) return;

    const targetIndex =
      dragOverIndex.day === targetDayIndex
        ? dragOverIndex.index
        : activities[targetDayIndex].activities.length;

    if (
      sourceDayIndex === targetDayIndex &&
      sourceActivityIndex === targetIndex
    )
      return;

    const newActivities = [...activities];
    const sourceDay = newActivities[sourceDayIndex];
    const targetDay = newActivities[targetDayIndex];

    const [movedActivity] = sourceDay.activities.splice(sourceActivityIndex, 1);
    targetDay.activities.splice(targetIndex, 0, movedActivity);

    setActivities(newActivities);
    setDragOverIndex(null);

    showSuccessNotification(
      `Đã di chuyển hoạt động sang Ngày ${targetDayIndex + 1}`
    );
  };

  const toggleHomePage = (dayIndex?: number) => {
    if (dayIndex !== undefined) {
      setSelectedDayIndex(dayIndex);
    }
    setShowHomePage(!showHomePage);
  };

  const handleAddDestination = (destination: DestinationCard) => {
    const newActivity: Activity = {
      type: "place",
      title: destination.title,
      description: destination.description,
      image: destination.img,
      location: destination.address,
      rating: destination.rating,
    };

    const newActivities = [...activities];
    newActivities[selectedDayIndex].activities.push(newActivity);
    setActivities(newActivities);

    showSuccessNotification(
      `Đã thêm vào Ngày ${selectedDayIndex + 1} thành công!`
    );
  };

  const showSuccessNotification = (message: string) => {
    const notification = document.createElement("div");
    notification.className = "success-notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 2000);
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedActivity(null);
  };

  const handleDeleteActivity = (dayIndex: number, activityIndex: number) => {
    setActivityToDelete({ dayIndex, activityIndex });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (activityToDelete) {
      const { dayIndex, activityIndex } = activityToDelete;
      const newActivities = [...activities];
      newActivities[dayIndex].activities.splice(activityIndex, 1);
      setActivities(newActivities);

      showSuccessNotification("Đã xóa hoạt động thành công!");

      setShowDeleteModal(false);
      setActivityToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setActivityToDelete(null);
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "transport":
        return {
          icon: <FaPlane size={16} />,
          className: "icon-transport",
        };
      case "food":
        return {
          icon: <FaUtensils size={16} />,
          className: "icon-food",
        };
      case "place":
        return {
          icon: <FaMapMarkerAlt size={16} />,
          className: "icon-place",
        };
      case "service":
        return {
          icon: <FaCamera size={16} />,
          className: "icon-service",
        };
      case "walking":
        return {
          icon: <FaWalking size={16} />,
          className: "icon-place",
        };
      case "hotel":
        return {
          icon: <FaHotel size={16} />,
          className: "icon-service",
        };
      case "ticket":
        return {
          icon: <FaTicketAlt size={16} />,
          className: "icon-service",
        };
      case "attraction":
        return {
          icon: <FaLandmark size={16} />,
          className: "icon-place",
        };
      default:
        return {
          icon: <FaMapMarkerAlt size={16} />,
          className: "icon-place",
        };
    }
  };

  const handleTimeChange = (
    dayIndex: number,
    activityIndex: number,
    startTime: string,
    endTime: string
  ) => {
    const newActivities = [...activities];
    newActivities[dayIndex].activities[activityIndex].startTime = startTime;
    newActivities[dayIndex].activities[activityIndex].endTime = endTime;
    setActivities(newActivities);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader">
          <div className="loader-icon">
            <FaGlobeAmericas className="globe-icon" />
          </div>
          <div className="loader-text">Đang tải kế hoạch du lịch...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <FaGlobeAmericas />
        </div>
        <h2>Không thể tải kế hoạch</h2>
        <p>{error}</p>
        <Link href="/" className="error-button">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className={`plan-wrapper ${showHomePage ? "with-sidebar" : ""}`}>
      {showDeleteModal && (
        <div className="modal-overlay">
          <motion.div
            className="delete-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa hoạt động này không?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCancelDelete}>
                Hủy bỏ
              </button>
              <button className="confirm-btn" onClick={handleConfirmDelete}>
                Xóa
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showModal && selectedActivity && (
        <div className="modal-overlay">
          <motion.div
            className="activity-detail-modal"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <button onClick={handleCloseModal} className="modal-close-btn">
              <IoClose size={24} />
            </button>

            {selectedActivity.image && (
              <div className="modal-image">
                <Image
                  src={selectedActivity.image || "/placeholder.svg"}
                  alt={selectedActivity.title}
                  fill
                  className="object-cover"
                />
                <div className="modal-image-overlay"></div>
              </div>
            )}

            <div className="modal-content">
              <div className="modal-header">
                <h2>{selectedActivity.title}</h2>
                {selectedActivity.rating && (
                  <div className="modal-rating">
                    <span className="star">★</span>
                    <span>{selectedActivity.rating}</span>
                  </div>
                )}
              </div>

              {selectedActivity.location && (
                <div className="modal-location">
                  <FaMapMarkerAlt />
                  <span>{selectedActivity.location}</span>
                </div>
              )}

              <div className="modal-description">
                <p>{selectedActivity.description}</p>
              </div>

              <div className="modal-actions">
                <button className="modal-action-btn">
                  <FaMapMarkerAlt /> Xem trên bản đồ
                </button>
                <button className="modal-action-btn secondary">
                  <FaCamera /> Xem ảnh
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className={`slide-panel ${showHomePage ? "active" : ""}`}>
        <button
          className="close-panel-btn"
          onClick={() => toggleHomePage(selectedDayIndex)}
          aria-label="Close homepage panel"
        >
          <IoClose size={24} />
        </button>
        <HomePage
          isInPlan={true}
          onAddToPlan={handleAddDestination}
          showAddButton={true}
        />
      </div>

      {showHomePage && (
        <div
          className="panel-overlay"
          onClick={() => toggleHomePage(selectedDayIndex)}
        ></div>
      )}

      <div className={`plan-container ${showHomePage ? "shifted" : ""}`}>
        <Screenshot className="min-h-screen">
          <div className="plan-content">
            <div className="plan-background">
              <div className="bg-element plane-1">
                <FaPlane />
              </div>
              <div className="bg-element plane-2">
                <FaPlane />
              </div>
              <div className="bg-element mountain">
                <FaMountain />
              </div>
              <div className="bg-element beach">
                <FaUmbrellaBeach />
              </div>
              <div className="bg-element route">
                <FaRoute />
              </div>
            </div>

            <header className="plan-header">
              <div className="header-content">
                <Link href="/" className="back-link">
                  <IoArrowBackOutline size={24} />
                  <span>Quay lại</span>
                </Link>

                <motion.div
                  className="plan-title"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h1>Kế Hoạch Du Lịch</h1>
                  <div className="plan-info">
                    <div className="plan-date">
                      <FaCalendarAlt />
                      <span>
                        {activities.length > 0
                          ? `${activities[0].date} - ${
                              activities[activities.length - 1].date
                            }`
                          : "No dates available"}
                      </span>
                    </div>
                    <div className="plan-location">
                      <FaMapMarkerAlt />
                      <span>
                        {localStorage.getItem("travelSchedule")
                          ? JSON.parse(localStorage.getItem("travelSchedule")!)
                              .schedule.province
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </header>

            {/* Flight Section */}
            {flight && (
              <motion.section
                className="flight-section"
                initial={slideUp.hidden}
                animate={slideUp.visible}
              >
                <div className="section-header">
                  <h3>Thông Tin Chuyến Bay</h3>
                </div>
                <div className="flight-card">
                  <div className="flight-header">
                    <div className="flight-code">
                      {flight.outbound_flight_code}
                    </div>
                    <div className="flight-class">{flight.cabin}</div>
                  </div>
                  <div className="flight-body">
                    <div className="flight-route">
                      <div className="route-point">
                        <div className="point-marker departure"></div>
                        <div className="point-details">
                          <span className="point-city">
                            {JSON.parse(localStorage.getItem("travelSession")!)
                              .flight.origin || "Unknown"}
                          </span>
                          <span className="point-time">
                            {flight.outbound_time}
                          </span>
                        </div>
                      </div>
                      <div className="route-line">
                        <FaPlane className="route-plane" />
                      </div>
                      <div className="route-point">
                        <div className="point-marker arrival"></div>
                        <div className="point-details">
                          <span className="point-city">
                            {JSON.parse(localStorage.getItem("travelSession")!)
                              .flight.destination || "Unknown"}
                          </span>
                          <span className="point-time">Arrival</span>
                        </div>
                      </div>
                    </div>
                    <div className="flight-details">
                      <div className="detail-item">
                        <span className="detail-label">Loại vé:</span>
                        <span className="detail-value">
                          {flight.fare_basis}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Giá cơ bản:</span>
                        <span className="detail-value">
                          {flight.base_price_vnd}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Tổng giá:</span>
                        <span className="detail-value">
                          {flight.total_price_vnd}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Hotel Section */}
            {hotel && (
              <motion.section
                className="hotel-section"
                initial={slideUp.hidden}
                animate={slideUp.visible}
              >
                <div className="section-header">
                  <h3>Thông Tin Khách Sạn</h3>
                </div>
                <div className="hotel-card">
                  <div className="hotel-image">
                    <Image
                      src={hotel.img_origin || "/placeholder.svg"}
                      alt={hotel.name}
                      width={600}
                      height={400}
                      className="img-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes("placeholder.svg")) {
                          target.src = "/placeholder.svg";
                          target.onerror = null;
                        }
                      }}
                    />
                    <div className="hotel-badge">{hotel.hotel_class}</div>
                  </div>
                  <div className="hotel-content">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <div className="hotel-location">
                      <FaMapMarkerAlt className="location-icon" />
                      <span>{hotel.name_nearby_place}</span>
                    </div>
                    <div className="hotel-rating">
                      {Array.from({
                        length: Math.floor(hotel.location_rating),
                      }).map((_, i) => (
                        <span key={i} className="star-icon">
                          <FaStar />
                        </span>
                      ))}
                      <span className="rating-number">
                        {hotel.location_rating}
                      </span>
                    </div>
                    <p className="hotel-description">{hotel.description}</p>
                    <div className="hotel-amenities">
                      <h4>Tiện nghi:</h4>
                      <ul>
                        {hotel.amenities.map((amenity, index) => (
                          <li key={index}>{amenity}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="hotel-footer">
                      <div className="hotel-price">
                        {hotel.price}
                        <span>/đêm</span>
                      </div>
                      <a
                        href={hotel.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-button"
                      >
                        Xem chi tiết
                      </a>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            <div className="travel-summary">
              <div className="summary-header">
                <h3>Tổng quan chuyến đi</h3>
              </div>
              <div className="summary-stats">
                <div className="stat-item">
                  <div className="stat-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{activities.length}</span>
                    <span className="stat-label">Ngày</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">
                      {activities.reduce(
                        (total, day) => total + day.activities.length,
                        0
                      )}
                    </span>
                    <span className="stat-label">Hoạt động</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <FaUtensils />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">
                      {activities.reduce(
                        (total, day) =>
                          total +
                          day.activities.filter((a) => a.type === "food")
                            .length,
                        0
                      )}
                    </span>
                    <span className="stat-label">Bữa ăn</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">
                    <FaLandmark />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">
                      {activities.reduce(
                        (total, day) =>
                          total +
                          day.activities.filter((a) => a.type === "place")
                            .length,
                        0
                      )}
                    </span>
                    <span className="stat-label">Địa điểm</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="days-container"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {activities.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  className="day-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: dayIndex * 0.1 }}
                >
                  <div className="day-header">
                    <div className="day-header-content">
                      <h2>
                        Ngày {day.day} - {day.date}
                      </h2>
                      {weatherData[dayIndex] ? (
                        <div className="day-weather">
                          {isLoadingWeather ? (
                            <div className="weather-loading">
                              Đang tải thời tiết...
                            </div>
                          ) : weatherError ? (
                            <span className="weather-error">
                              {weatherError}
                            </span>
                          ) : (
                            <>
                              <div className="weather-icon">
                                {React.createElement(
                                  getWeatherIcon(weatherData[dayIndex].icon)
                                )}
                              </div>
                              <div className="weather-info">
                                <span className="weather-temp">
                                  {weatherData[dayIndex].temp}°C
                                </span>
                                <span className="weather-desc">
                                  {getVietnameseDescription(
                                    weatherData[dayIndex].description
                                  )}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="day-weather">
                          <div className="weather-loading">
                            Đang tải thời tiết...
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="timeline-container">
                    <div className="timeline"></div>

                    <div
                      className="activities-list"
                      onDrop={(e) => handleDrop(e, dayIndex)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (!dragOverIndex || dragOverIndex.day !== dayIndex) {
                          setDragOverIndex({
                            day: dayIndex,
                            index: day.activities.length,
                          });
                        }
                      }}
                    >
                      {day.activities.map((activity, actIndex) => (
                        <React.Fragment key={actIndex}>
                          {dragOverIndex?.day === dayIndex &&
                            dragOverIndex?.index === actIndex && (
                              <div className="drop-indicator active" />
                            )}
                          <DraggableActivity
                            activity={activity}
                            onDelete={handleDeleteActivity}
                            dayIndex={dayIndex}
                            activityIndex={actIndex}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onActivityClick={handleActivityClick}
                            onTimeChange={handleTimeChange}
                          >
                            <div
                              className={`activity-icon-container ${
                                getActivityIcon(activity.type).className
                              }`}
                            >
                              {getActivityIcon(activity.type).icon}
                            </div>
                            <div className="activity-content">
                              <div className="activity-header">
                                <h3 className="activity-title">
                                  {activity.title}
                                </h3>
                                {activity.rating && (
                                  <div className="activity-rating">
                                    <span className="star">★</span>
                                    <span>{activity.rating}</span>
                                  </div>
                                )}
                              </div>

                              {activity.image && (
                                <div className="activity-image">
                                  <Image
                                    src={activity.image || "/placeholder.svg"}
                                    alt={activity.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}

                              <p className="activity-description">
                                {activity.description}
                              </p>

                              {activity.location && (
                                <div className="activity-location">
                                  <FaMapMarkerAlt />
                                  <span>{activity.location}</span>
                                </div>
                              )}
                            </div>
                          </DraggableActivity>
                          {dragOverIndex?.day === dayIndex &&
                            dragOverIndex?.index === actIndex + 1 && (
                              <div className="drop-indicator active" />
                            )}
                        </React.Fragment>
                      ))}

                      {day.activities.length === 0 && (
                        <div className="empty-activities">
                          <div className="empty-icon">
                            <FaSuitcase />
                          </div>
                          <p>Chưa có hoạt động nào cho ngày này</p>
                          <p className="empty-subtitle">
                            Thêm hoạt động để bắt đầu lập kế hoạch
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="day-footer">
                    <button
                      className="add-activity-btn"
                      onClick={() => toggleHomePage(dayIndex)}
                    >
                      <FaPlus />
                      <span>Thêm hoạt động</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="travel-tips">
              <div className="tips-header">
                <h3>Lời khuyên cho chuyến đi</h3>
              </div>
              <div className="tips-content">
                <div className="tip-card">
                  <div className="tip-icon">
                    <FaSuitcase />
                  </div>
                  <div className="tip-text">
                    <h4>Chuẩn bị hành lý</h4>
                    <p>
                      Đừng quên mang theo áo mưa và kem chống nắng cho chuyến đi
                      của bạn!
                    </p>
                  </div>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="tip-text">
                    <h4>Khám phá địa phương</h4>
                    <p>
                      Hãy thử các món ăn địa phương và tham gia các hoạt động
                      văn hóa để trải nghiệm trọn vẹn.
                    </p>
                  </div>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">
                    <FaCamera />
                  </div>
                  <div className="tip-text">
                    <h4>Lưu giữ kỷ niệm</h4>
                    <p>
                      Đừng quên chụp ảnh và ghi lại những khoảnh khắc đáng nhớ
                      trong chuyến đi!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Screenshot>
      </div>
    </div>
  );
};

export default Plan;
