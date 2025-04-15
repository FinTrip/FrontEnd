"use client"

import React, { useRef, useState, useEffect } from "react"
import type { MouseEvent, TouchEvent } from "react"
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion"
import "./plan.css"
import { IoArrowBackOutline, IoClose } from "react-icons/io5"
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
  FaSignOutAlt,
} from "react-icons/fa"
import Image from "next/image"
import Link from "next/link"
import HomePage, { type DestinationCard } from "./home_page"
import Screenshot from "../screenshot"
import axios from "axios"

const ROTATION_RANGE = 25.0
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2

interface Activity {
  type: string
  title: string
  description: string
  icon?: string | React.ReactNode
  image?: string
  location?: string
  rating?: number
  startTime?: string
  endTime?: string
}

interface DayPlan {
  day: number
  date: string
  activities: Activity[]
}

interface WeatherForecast {
  Ngày: string
  "Nhiệt độ tối đa": string
  "Mô tả": string
}

interface ScheduleData {
  schedule: {
    schedule: Array<{
      day: string
      itinerary: Array<{
        food?: { title: string; description: string; address: string; rating: number; img: string }
        place?: { title: string; description: string; address: string; rating: number; img: string }
      }>
    }>
  }
  weather_forecast: {
    forecast: WeatherForecast[]
  }
}

interface TiltActivityCardProps {
  children: React.ReactNode
  onMouseMove?: (e: React.MouseEvent) => void
  onMouseLeave?: (e: React.MouseEvent) => void
}

interface DraggableActivityProps {
  activity: Activity
  onDelete: (dayIndex: number, activityIndex: number) => void
  dayIndex: number
  activityIndex: number
  onDragStart: (e: React.DragEvent, dayIndex: number, activityIndex: number) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent, dayIndex: number, activityIndex: number) => void
  onActivityClick: (activity: Activity) => void
  onTimeChange?: (dayIndex: number, activityIndex: number, startTime: string, endTime: string) => void
  children: React.ReactNode
}

interface TimePickerProps {
  startTime: string
  endTime: string
  onChange: (startTime: string, endTime: string) => void
}

const TiltActivityCard: React.FC<TiltActivityCardProps> = ({ children, onMouseMove, onMouseLeave }) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSpring = useSpring(x)
  const ySpring = useSpring(y)

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1
    const rY = mouseX / width - HALF_ROTATION_RANGE

    x.set(rX)
    y.set(rY)
    onMouseMove?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    x.set(0)
    y.set(0)
    onMouseLeave?.(e)
  }

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
  )
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
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [localStartTime, setLocalStartTime] = useState(activity.startTime || "")
  const [localEndTime, setLocalEndTime] = useState(activity.endTime || "")

  useEffect(() => {
    setLocalStartTime(activity.startTime || "")
    setLocalEndTime(activity.endTime || "")
  }, [activity.startTime, activity.endTime])

  const handleTimeChange = (newStartTime: string, newEndTime: string) => {
    setLocalStartTime(newStartTime)
    setLocalEndTime(newEndTime)
    if (onTimeChange) {
      onTimeChange(dayIndex, activityIndex, newStartTime, newEndTime)
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    const dragData = {
      dayIndex,
      activityIndex,
      startTime: localStartTime,
      endTime: localEndTime,
    }
    e.dataTransfer.setData("text/plain", JSON.stringify(dragData))
    onDragStart(e, dayIndex, activityIndex)
    e.currentTarget.classList.add("dragging")
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)
    onDragEnd(e)
    e.currentTarget.classList.remove("dragging")
    e.currentTarget.classList.add("dropped")
    setTimeout(() => {
      e.currentTarget.classList.remove("dropped")
    }, 300)
  }

  const handleDelete = (e: MouseEvent<Element>) => {
    e.stopPropagation()
    onDelete(dayIndex, activityIndex)
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onActivityClick(activity)
  }

  return (
    <motion.div
      className="activity-card-container"
      style={{ perspective: 2000 }}
      onDragOver={(e) => onDragOver(e, dayIndex, activityIndex)}
    >
      <motion.div className="activity-card-inner" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
        <div
          className={`draggable-activity ${isDragging ? "dragging" : ""}`}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <TimePicker startTime={localStartTime} endTime={localEndTime} onChange={handleTimeChange} />
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
  )
}

const TimePicker: React.FC<TimePickerProps> = ({ startTime, endTime, onChange }) => {
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
  )
}

const Plan = () => {
  const [showHomePage, setShowHomePage] = useState(false)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activityToDelete, setActivityToDelete] = useState<{
    dayIndex: number
    activityIndex: number
  } | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(7)
  const [scheduleId, setScheduleId] = useState<number | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftOffset, setScrollLeftOffset] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [dragOverIndex, setDragOverIndex] = useState<{
    day: number
    index: number
  } | null>(null)
  const [activities, setActivities] = useState<DayPlan[]>([])
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([])
  const [loading, setLoading] = useState(false)

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  }

  const slideUp = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  const slideRight = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  // Fetch schedule data after login
  useEffect(() => {
    if (userId) {
      const fetchSchedule = async () => {
        try {
          setLoading(true)
          console.log("Fetching schedule data for user_id:", userId)
          const response = await axios.post(
            "http://127.0.0.1:8000/recommend/travel-schedule/",
            {
              province: "Hồ Chí Minh",
              start_day: "2025-04-15",
              end_day: "2025-04-20",
            },
            {
              withCredentials: true,
              timeout: 10000,
            }
          )

          if (!response.data || !response.data.schedule || !Array.isArray(response.data.schedule.schedule)) {
            throw new Error("Dữ liệu lịch trình không đúng định dạng")
          }

          const formattedActivities = response.data.schedule.schedule.map((dayItem: any, index: number) => {
            if (!dayItem.day || typeof dayItem.day !== "string") {
              console.warn(`Day item at index ${index} has invalid day field:`, dayItem.day)
              return {
                day: index + 1,
                date: "Ngày không xác định",
                activities: [],
              }
            }

            const dateMatch = dayItem.day.match(/\$\$(.*?)\$\$/)
            const date = dateMatch ? dateMatch[1] : dayItem.day

            const dayActivities = Array.isArray(dayItem.itinerary)
              ? dayItem.itinerary.flatMap((slot: any) => {
                  const activities: Activity[] = []
                  if (slot.food) {
                    activities.push({
                      type: "food",
                      title: slot.food.title || "Không có tiêu đề",
                      description: slot.food.description || "",
                      location: slot.food.address || "Không có địa chỉ",
                      rating: slot.food.rating || 0,
                      image: slot.food.img || "",
                    })
                  }
                  if (slot.place) {
                    activities.push({
                      type: "place",
                      title: slot.place.title || "Không có tiêu đề",
                      description: slot.place.description || "",
                      location: slot.place.address || "Không có địa chỉ",
                      rating: slot.place.rating || 0,
                      image: slot.place.img || "",
                    })
                  }
                  return activities
                })
              : []

            return {
              day: index + 1,
              date: date,
              activities: dayActivities,
            }
          })

          setActivities(formattedActivities)
          setWeatherForecast(response.data.weather_forecast.forecast)
          setLoading(false)
        } catch (err) {
          console.error("Error fetching schedule:", err)
          setErrorMessage("Không thể tải kế hoạch du lịch. Vui lòng thử lại!")
          setTimeout(() => setErrorMessage(null), 3000)
          setLoading(false)
        }
      }

      fetchSchedule()
    }
  }, [userId])

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/recommend/login-user/",
        {
          email,
          password,
        },
        { withCredentials: true }
      )
      if (response.data.message === "Đăng nhập thành công") {
        setUserId(response.data.user_id)
        setShowLoginModal(false)
        setLoginError(null)
        setSuccessMessage("Đăng nhập thành công!")
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setLoginError("Đăng nhập thất bại")
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.error || "Lỗi khi đăng nhập")
      console.error("Login error:", err)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/recommend/logout-user/",
        {},
        { withCredentials: true }
      )
      setUserId(null)
      setScheduleId(null)
      setShareLink(null)
      setShowLoginModal(true)
      setSuccessMessage("Đăng xuất thành công!")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error("Logout error:", err)
      setErrorMessage("Lỗi khi đăng xuất")
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setStartX(e.pageX - scrollLeftOffset)
    if (scrollContainerRef.current) {
      setScrollLeftOffset(scrollContainerRef.current.scrollLeft)
    }
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - startX
    scrollContainerRef.current.scrollLeft = scrollLeftOffset - x
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX - scrollLeftOffset)
    if (scrollContainerRef.current) {
      setScrollLeftOffset(scrollContainerRef.current.scrollLeft)
    }
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return
    const x = e.touches[0].pageX - startX
    scrollContainerRef.current.scrollLeft = scrollLeftOffset - x
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleDragStart = (e: React.DragEvent, dayIndex: number, activityIndex: number) => {
    // Logic kéo thả
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, dayIndex: number, activityIndex: number) => {
    e.preventDefault()
    setDragOverIndex({ day: dayIndex, index: activityIndex })
  }

  const handleDrop = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData("text/plain"))
    const newActivities = [...activities]
    const draggedActivity = newActivities[data.dayIndex].activities[data.activityIndex]
    newActivities[data.dayIndex].activities.splice(data.activityIndex, 1)
    newActivities[dayIndex].activities.splice(dragOverIndex?.index || 0, 0, draggedActivity)
    setActivities(newActivities)
    setDragOverIndex(null)
  }

  const handleDeleteActivity = (dayIndex: number, activityIndex: number) => {
    const newActivities = [...activities]
    newActivities[dayIndex].activities.splice(activityIndex, 1)
    setActivities(newActivities)
  }

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity)
    setShowModal(true)
  }

  const handleTimeChange = (dayIndex: number, activityIndex: number, startTime: string, endTime: string) => {
    const newActivities = [...activities]
    newActivities[dayIndex].activities[activityIndex] = {
      ...newActivities[dayIndex].activities[activityIndex],
      startTime,
      endTime,
    }
    setActivities(newActivities)
  }

  const toggleHomePage = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex)
    setShowHomePage(!showHomePage)
  }

  const handleAddDestination = (destination: DestinationCard) => {
    const newActivities = [...activities]
    newActivities[selectedDayIndex].activities.push({
      type: "place",
      title: destination.title,
      description: destination.description || "",
      image: destination.img || "",
      location: destination.address || "",
      rating: destination.rating,
    })
    setActivities(newActivities)
    setShowHomePage(false)
  }

  const handleSaveAndShareSchedule = async () => {
    console.log("handleSaveAndShareSchedule called");
    console.log("user id:", userId);
    if (!userId) {
      setShowLoginModal(true);
      setErrorMessage("Vui lòng đăng nhập để lưu lịch trình!");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    try {
      // Prepare the data for saving the schedule
      const formattedData = {
        user_id: userId,
        schedule_name: "Chuyến đi Hồ Chí Minh",
        days: activities.map((day, index) => ({
          day_index: day.day,
          date_str: day.date,
          itinerary: day.activities.map((activity, actIndex) => {
            const item: any = {
              timeslot: `${activity.startTime || "08:00"} - ${activity.endTime || "09:00"}`,
              order: actIndex + 1,
            };
            if (activity.type === "food") {
              item.food_title = activity.title;
              item.food_description = activity.description;
              item.food_address = activity.location;
              item.food_rating = activity.rating;
              item.food_image = activity.image;
            } else if (activity.type === "place") {
              item.place_title = activity.title;
              item.place_description = activity.description;
              item.place_address = activity.location;
              item.place_rating = activity.rating;
              item.place_img = activity.image;
            }
            return item;
          }),
        })),
      };

      console.log("Sending data to save schedule:", formattedData);

      // Step 1: Save the schedule
      const saveResponse = await axios.post(
        "http://127.0.0.1:8000/recommend/save-schedule/",
        formattedData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Save schedule response:", saveResponse.data);

      if (saveResponse.data && saveResponse.data.schedule_id) {
        const scheduleId = saveResponse.data.schedule_id;
        setScheduleId(scheduleId);
        setErrorMessage(null);
        setSuccessMessage("Lịch trình đã được lưu thành công!");
        setTimeout(() => setSuccessMessage(null), 3000);

        // Step 2: Automatically generate the share link
        const shareResponse = await axios.post(
          "http://127.0.0.1:8000/recommend/share-schedule/",
          { user_id: userId, schedule_id: scheduleId },
          { withCredentials: true }
        );

        console.log("Share schedule response:", shareResponse.data);

        if (shareResponse.data && shareResponse.data.share_link) {
          setShareLink(shareResponse.data.share_link);
          setSuccessMessage("Lịch trình đã được lưu và link chia sẻ đã được tạo!");
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setErrorMessage(shareResponse.data?.error || "Lỗi khi tạo link chia sẻ");
          setTimeout(() => setErrorMessage(null), 3000);
        }
      } else {
        setErrorMessage(saveResponse.data?.error || "Lỗi khi lưu lịch trình");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (err: any) {
      console.error("Error in save and share schedule:", err);
      setErrorMessage(err.response?.data?.error || "Lỗi khi lưu hoặc chia sẻ lịch trình");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "food":
        return { icon: <FaUtensils />, className: "food-icon" }
      case "place":
        return { icon: <FaLandmark />, className: "place-icon" }
      default:
        return { icon: <FaMapMarkerAlt />, className: "default-icon" }
    }
  }

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
    )
  }

  return (
    <div className={`plan-wrapper ${showHomePage ? "with-sidebar" : ""}`}>
      {/* Toast Notifications */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {errorMessage}
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Đăng nhập</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setShowLoginModal(false)}
                aria-label="Close login modal"
              >
                <IoClose size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for Adding Destinations */}
      <div className={`slide-panel ${showHomePage ? "active" : ""}`}>
        <button
          className="close-panel-btn"
          onClick={() => toggleHomePage(selectedDayIndex)}
          aria-label="Close homepage panel"
        >
          <IoClose size={24} />
        </button>
        <HomePage isInPlan={true} onAddToPlan={handleAddDestination} showAddButton={true} />
      </div>

      {showHomePage && <div className="panel-overlay" onClick={() => toggleHomePage(selectedDayIndex)}></div>}

      <div className={`plan-container ${showHomePage ? "shifted" : ""}`}>
        <Screenshot className="min-h-screen">
          <div className="plan-content relative">
            {/* Background Elements */}
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

            {/* Header */}
            <header className="plan-header relative">
              <div className="header-content flex justify-between items-center">
                <Link href="/" className="back-link flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <IoArrowBackOutline size={24} />
                  <span>Quay lại</span>
                </Link>

                <motion.div
                  className="plan-title text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h1 className="text-3xl font-bold text-gray-800">Kế Hoạch Du Lịch</h1>
                  <div className="plan-info flex justify-center space-x-4 mt-2">
                    <div className="plan-date flex items-center space-x-1 text-gray-600">
                      <FaCalendarAlt />
                      <span>
                        {activities.length > 0
                          ? `${activities[0].date} - ${activities[activities.length - 1].date}`
                          : "No dates available"}
                      </span>
                    </div>
                    <div className="plan-location flex items-center space-x-1 text-gray-600">
                      <FaMapMarkerAlt />
                      <span>
                        {localStorage.getItem("travelSchedule")
                          ? JSON.parse(localStorage.getItem("travelSchedule")!).province
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <div></div> {/* Placeholder to maintain layout */}
              </div>
            </header>

            {/* Days Container */}
            <div
              ref={scrollContainerRef}
              className="days-container mt-8"
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
                  className="day-card bg-white shadow-lg rounded-lg p-6 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: dayIndex * 0.1 }}
                >
                  <div className="day-header flex justify-between items-center mb-4">
                    <div className="day-header-content">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Ngày {day.day} - {day.date}
                      </h2>
                      {weatherForecast[dayIndex] ? (
                        <div className="day-weather flex items-center space-x-2 mt-2">
                          <div className="weather-icon text-yellow-500">
                            {weatherForecast[dayIndex]["Mô tả"].includes("nắng") ? (
                              <FaSun />
                            ) : weatherForecast[dayIndex]["Mô tả"].includes("mây") ? (
                              <FaCloud />
                            ) : weatherForecast[dayIndex]["Mô tả"].includes("mưa") ? (
                              <FaCloudRain />
                            ) : (
                              <FaWind />
                            )}
                          </div>
                          <div className="weather-info text-gray-600">
                            <span className="weather-temp">{weatherForecast[dayIndex]["Nhiệt độ tối đa"]}°C</span>
                            <span className="weather-desc ml-2">{weatherForecast[dayIndex]["Mô tả"]}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Không có dữ liệu thời tiết</span>
                      )}
                    </div>
                  </div>

                  <div className="timeline-container relative">
                    <div className="timeline"></div>

                    <div
                      className="activities-list"
                      onDrop={(e) => handleDrop(e, dayIndex)}
                      onDragOver={(e) => {
                        e.preventDefault()
                        if (!dragOverIndex || dragOverIndex.day !== dayIndex) {
                          setDragOverIndex({
                            day: dayIndex,
                            index: day.activities.length,
                          })
                        }
                      }}
                    >
                      {day.activities.map((activity, actIndex) => (
                        <React.Fragment key={actIndex}>
                          {dragOverIndex?.day === dayIndex && dragOverIndex?.index === actIndex && (
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
                            <div className={`activity-icon-container ${getActivityIcon(activity.type).className}`}>
                              {getActivityIcon(activity.type).icon}
                            </div>
                            <div className="activity-content">
                              <div className="activity-header flex justify-between items-center">
                                <h3 className="activity-title text-lg font-medium text-gray-800">{activity.title}</h3>
                                {activity.rating && (
                                  <div className="activity-rating flex items-center space-x-1 text-yellow-500">
                                    <span className="star">★</span>
                                    <span>{activity.rating}</span>
                                  </div>
                                )}
                              </div>

                              {activity.image && (
                                <div className="activity-image relative h-40 mt-2 rounded-lg overflow-hidden">
                                  <Image
                                    src={activity.image || "/placeholder.svg"}
                                    alt={activity.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}

                              <p className="activity-description text-gray-600 mt-2">{activity.description}</p>

                              {activity.location && (
                                <div className="activity-location flex items-center space-x-1 text-gray-600 mt-2">
                                  <FaMapMarkerAlt />
                                  <span>{activity.location}</span>
                                </div>
                              )}
                            </div>
                          </DraggableActivity>
                          {dragOverIndex?.day === dayIndex && dragOverIndex?.index === actIndex + 1 && (
                            <div className="drop-indicator active" />
                          )}
                        </React.Fragment>
                      ))}

                      {day.activities.length === 0 && (
                        <div className="empty-activities text-center py-6">
                          <div className="empty-icon text-gray-400 text-4xl">
                            <FaSuitcase />
                          </div>
                          <p className="text-gray-600 mt-2">Chưa có hoạt động nào cho ngày này</p>
                          <p className="text-gray-500 mt-1">Thêm hoạt động để bắt đầu lập kế hoạch</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="day-footer mt-4">
                    <button
                      className="add-activity-btn flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      onClick={() => toggleHomePage(dayIndex)}
                    >
                      <FaPlus />
                      <span>Thêm hoạt động</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Travel Tips */}
            <div className="travel-tips mt-8">
              <div className="tips-header">
                <h3 className="text-2xl font-semibold text-gray-800">Lời khuyên cho chuyến đi</h3>
              </div>
              <div className="tips-content grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="tip-card bg-white shadow-md rounded-lg p-4 flex items-start space-x-4">
                  <div className="tip-icon text-blue-500 text-3xl">
                    <FaSuitcase />
                  </div>
                  <div className="tip-text">
                    <h4 className="text-lg font-medium text-gray-800">Chuẩn bị hành lý</h4>
                    <p className="text-gray-600">Đừng quên mang theo áo mưa và kem chống nắng cho chuyến đi của bạn!</p>
                  </div>
                </div>
                <div className="tip-card bg-white shadow-md rounded-lg p-4 flex items-start space-x-4">
                  <div className="tip-icon text-blue-500 text-3xl">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="tip-text">
                    <h4 className="text-lg font-medium text-gray-800">Khám phá địa phương</h4>
                    <p className="text-gray-600">Hãy thử các món ăn địa phương và tham gia các hoạt động văn hóa để trải nghiệm trọn vẹn.</p>
                  </div>
                </div>
                <div className="tip-card bg-white shadow-md rounded-lg p-4 flex items-start space-x-4">
                  <div className="tip-icon text-blue-500 text-3xl">
                    <FaCamera />
                  </div>
                  <div className="tip-text">
                    <h4 className="text-lg font-medium text-gray-800">Lưu giữ kỷ niệm</h4>
                    <p className="text-gray-600">Đừng quên chụp ảnh và ghi lại những khoảnh khắc đáng nhớ trong chuyến đi!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Actions */}
            <div className="schedule-actions mt-8 flex space-x-4 justify-center">
              <button
                onClick={handleSaveAndShareSchedule}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Lưu lịch trình
              </button>
            </div>

            {shareLink && (
              <p className="mt-4 text-center text-blue-600">
                Link chia sẻ: <a href={shareLink} className="underline">{shareLink}</a>
              </p>
            )}
          </div>
        </Screenshot>
      </div>
    </div>
  )
}

export default Plan