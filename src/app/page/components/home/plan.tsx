"use client";

import React, { useRef, useState, useEffect } from "react";
import type { MouseEvent, TouchEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import "./plan.css";
import { IoArrowBackOutline, IoClose, IoTrashOutline } from "react-icons/io5";
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
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import HomePage, { DestinationCard } from "./home_page";
import Screenshot from "../screenshot";

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
        <span className="time-separator">to</span>
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
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{
    day: number;
    index: number;
  } | null>(null);
  const [activities, setActivities] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu từ localStorage khi component mount
  useEffect(() => {
    const scheduleData = localStorage.getItem("travelSchedule");
    if (scheduleData) {
      try {
        const parsedData = JSON.parse(scheduleData);

        // Kiểm tra cấu trúc dữ liệu
        if (!parsedData || !Array.isArray(parsedData.schedule.schedule)) {
          throw new Error(
            "Dữ liệu không hợp lệ: 'schedule' không phải là mảng hoặc không tồn tại."
          );
        }

        const formattedActivities = parsedData.schedule.schedule.map(
          (dayItem: any, index: number) => {
            const dateMatch = dayItem.day.match(/\((.*?)\)/); // Trích xuất ngày từ "Day X (YYYY-MM-DD)"
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

        setActivities(formattedActivities);
        setLoading(false);
      } catch (err) {
        setError(
          "Dữ liệu không hợp lệ hoặc không đúng định dạng. Vui lòng kiểm tra lại."
        );
        setLoading(false);
        console.error("Lỗi khi phân tích dữ liệu:", err);
      }
    } else {
      setError("Không tìm thấy dữ liệu kế hoạch trong localStorage.");
      setLoading(false);
    }
  }, []);

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
      image: destination.image,
      location: destination.location,
      rating: destination.rating,
    };

    const newActivities = [...activities];
    newActivities[selectedDayIndex].activities.push(newActivity);
    setActivities(newActivities);

    const notification = document.createElement("div");
    notification.className = "success-notification";
    notification.textContent = `Added to Day ${
      selectedDayIndex + 1
    } successfully!`;
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

      const notification = document.createElement("div");
      notification.className = "success-notification";
      notification.innerHTML = `
        <div class="notification-content">
          <div class="notification-icon">✓</div>
          <div class="notification-message">Đã xóa hoạt động thành công!</div>
        </div>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.remove();
      }, 2000);

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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={`plan-wrapper ${showHomePage ? "with-sidebar" : ""}`}>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xóa địa điểm này không?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg"
                onClick={handleCancelDelete}
              >
                Không
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={handleConfirmDelete}
              >
                Có
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 overflow-hidden relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <IoClose size={24} />
            </button>

            {selectedActivity.image && (
              <div className="relative h-72 w-full">
                <Image
                  src={selectedActivity.image}
                  alt={selectedActivity.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedActivity.title}
                </h2>
                {selectedActivity.rating && (
                  <span className="rating text-xl">
                    ★ {selectedActivity.rating}
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                {selectedActivity.description}
              </p>

              {selectedActivity.location && (
                <p className="text-gray-500 flex items-center gap-2">
                  <span>📍</span>
                  {selectedActivity.location}
                </p>
              )}
            </div>
          </div>
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
        <Screenshot className="min-h-screen text-white">
          <div className="min-h-screen text-white">
            <div className="p-6">
              <Link href="/" className="flex items-center gap-2 text-white">
                <IoArrowBackOutline size={24} />
                <span>Back</span>
              </Link>

              <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold test_title">MY PLAN</h1>
                <p className="text-lg test_text">
                  {activities.length > 0
                    ? `${activities[0].date} - ${
                        activities[activities.length - 1].date
                      }`
                    : "No dates available"}
                </p>
                <p className="text-lg test_text">
                  {localStorage.getItem("travelSchedule")
                    ? JSON.parse(localStorage.getItem("travelSchedule")!)
                        .province
                    : "Unknown"}
                </p>
              </div>
            </div>

            <div
              ref={scrollContainerRef}
              className="scroll-container"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {activities.map((day, dayIndex) => (
                <div key={dayIndex} data-day={dayIndex} className="day-card">
                  <div className="day-header">
                    <h2>
                      Day {day.day} - {day.date}
                    </h2>
                  </div>

                  <div className="timeline"></div>

                  <div
                    className="activities-container"
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
                            <div className="drop-indicator" />
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
                            <div className="flex justify-between items-start">
                              <h3 className="activity-title">
                                {activity.title}
                              </h3>
                              <button
                                className="delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteActivity(dayIndex, actIndex);
                                }}
                                title="Delete activity"
                              >
                                <IoTrashOutline />
                              </button>
                            </div>
                            {activity.image && (
                              <div className="relative h-48 w-full">
                                <Image
                                  src={activity.image}
                                  alt={activity.title}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            )}
                            <p className="activity-description">
                              {activity.description}
                            </p>
                            <div className="flex justify-between items-center">
                              {activity.location && (
                                <p className="activity-location">
                                  <span>📍</span>
                                  {activity.location}
                                </p>
                              )}
                              {activity.rating && (
                                <span className="rating">
                                  <span>★</span>
                                  {activity.rating}
                                </span>
                              )}
                            </div>
                          </div>
                        </DraggableActivity>
                        {dragOverIndex?.day === dayIndex &&
                          dragOverIndex?.index === actIndex + 1 && (
                            <div className="drop-indicator" />
                          )}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="day-card-footer">
                    <button
                      className="add-activity-btn"
                      onClick={() => toggleHomePage(dayIndex)}
                    >
                      <FaPlus />
                      <span>Add Activity</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Screenshot>
      </div>
    </div>
  );
};

export default Plan;
