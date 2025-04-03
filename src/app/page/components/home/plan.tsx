"use client";

import React, { useRef, useState, useEffect } from "react";
import type { MouseEvent, TouchEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  AnimatePresence
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

const TiltActivityCard: React.FC<TiltActivityCardProps> = ({ children, onMouseMove, onMouseLeave }) => {
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
  onDragStart: (e: React.DragEvent, dayIndex: number, activityIndex: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, dayIndex: number, activityIndex: number) => void;
  onActivityClick: (activity: Activity) => void;
  onTimeChange?: (dayIndex: number, activityIndex: number, startTime: string, endTime: string) => void;
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
  const [localStartTime, setLocalStartTime] = useState(activity.startTime || "");
  const [localEndTime, setLocalEndTime] = useState(activity.endTime || "");

  // Update local time when activity prop changes
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
    // Include time data in drag event
    const dragData = {
      dayIndex,
      activityIndex,
      startTime: localStartTime,
      endTime: localEndTime
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
  // Thêm state để kiểm soát việc hiển thị HomePage
  const [showHomePage, setShowHomePage] = useState(false);
  // Thêm state cho selected day
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Thêm state cho modal
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);

  // Thêm state cho delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<{
    dayIndex: number;
    activityIndex: number;
  } | null>(null);

  // Di chuyển khai báo planData lên đầu component
  const planData: DayPlan[] = [
    {
      day: 1,
      date: "14 Feb",
      activities: [
        {
          type: "transport",
          title: "Di Chuyển",
          description:
            "Bắt đầu hành trình từ sân bay Đà Nẵng, tận hưởng không khí nhộn nhịp và sẵn sàng cho một chuyến đi đầy trải nghiệm. Sau khi hạ cánh, bạn có thể dễ dàng di chuyển đến khách sạn bằng taxi hoặc xe đưa đón. Hành trình khám phá thành phố biển chính thức bắt đầu!",
          icon: "✈️",
          location: "Sân bay Đà Nẵng",
          rating: 4.5,
        },
        {
          type: "place",
          title: "Đặc Sản Trần",
          description:
            "Đây là một trong những nhà hàng nổi tiếng nhất Đà Nẵng, chuyên phục vụ các món ăn đặc sản miền Trung như bánh tráng cuốn thịt heo, mì Quảng và nem lụi. Món ăn được chế biến tỉ mỉ với nguyên liệu tươi ngon, kết hợp cùng nước chấm đặc trưng tạo nên hương vị đậm đà khó quên.",
          image: "/images/DacSanTran.webp",
          location: "K280/23 Hoàng Diệu, Đà Nẵng",
          rating: 4.8,
        },
        {
          type: "service",
          title: "Bana Hill",
          description:
            "Một trong những địa điểm du lịch nổi bật nhất của Đà Nẵng, Bà Nà Hills được mệnh danh là 'châu Âu thu nhỏ' với khí hậu mát mẻ quanh năm. Bạn sẽ được trải nghiệm cáp treo dài nhất thế giới, khám phá Làng Pháp cổ kính, tham quan Cầu Vàng nổi tiếng, và tham gia nhiều hoạt động vui chơi hấp dẫn trong khu giải trí Fantasy Park.",
          image: "/images/cauvang.jpg",
          location: "Thôn An Sơn, Hoà Ninh, Hòa Vang, Đà Nẵng",
          rating: 4.9,
        },
      ],
    },
    {
      day: 2,
      date: "15 Feb",
      activities: [
        {
          type: "food",
          title: "Bữa sáng với Mì Quảng",
          description:
            "Không thể bỏ lỡ món Mì Quảng - đặc sản nổi tiếng của Đà Nẵng. Sợi mì dai mềm, nước dùng đậm đà, kết hợp cùng tôm, thịt gà, và đậu phộng rang thơm lừng. Đặc biệt, ăn kèm với bánh tráng nướng giòn và rau sống tươi ngon sẽ làm cho hương vị càng thêm hấp dẫn.",
          image: "/images/miquang.jpg",
          location: "Mì Quảng Bà Mua, 19 Trần Bình Trọng, Đà Nẵng",
          rating: 4.7,
        },
        {
          type: "place",
          title: "Chùa Linh Ứng",
          description:
            "Nằm trên bán đảo Sơn Trà, chùa Linh Ứng là ngôi chùa linh thiêng với tượng Phật Quan Thế Âm cao nhất Việt Nam (67m). Từ đây, bạn có thể phóng tầm mắt ngắm nhìn toàn cảnh biển xanh mênh mông và thành phố Đà Nẵng hiện đại, tạo nên một không gian thanh tịnh và yên bình.",
          image: "/images/chualinhung.jpg",
          location: "Bãi Bụt, Sơn Trà, Đà Nẵng",
          rating: 4.8,
        },
        {
          type: "activity",
          title: "Dạo phố Bạch Đằng",
          description:
            "Phố Bạch Đằng là con đường đi bộ nổi tiếng ven sông Hàn, nơi du khách có thể tận hưởng không khí mát mẻ và sôi động về đêm. Bạn có thể ngắm nhìn cầu Rồng phun lửa vào cuối tuần, thưởng thức âm nhạc đường phố và thưởng thức các món ăn vặt đặc trưng của Đà Nẵng.",
          image: "/images/phodibo.webp",
          location: "Phố Bạch Đằng, Hải Châu, Đà Nẵng",
          rating: 4.6,
        },
      ],
    },
    {
      day: 3,
      date: "16 Feb",
      activities: [
        {
          type: "food",
          title: "Bánh ép Huế",
          description:
            "Một món ăn vặt độc đáo của Huế, bánh ép có lớp vỏ mỏng giòn, nhân thịt và trứng được ép chặt rồi nướng trên bếp than tạo nên hương thơm hấp dẫn. Món ăn này thường được ăn kèm với nước mắm chua ngọt và rau sống, mang đến một trải nghiệm ẩm thực thú vị.",
          image: "/images/banh-ep-hue.jpeg",
          location: "Đường Trương Định, Huế",
          rating: 4.5,
        },
        {
          type: "place",
          title: "Quần thể di tích cố đô Huế",
          description:
            "Là di sản thế giới được UNESCO công nhận, quần thể di tích cố đô Huế bao gồm Đại Nội, các lăng tẩm vua Nguyễn, và nhiều công trình kiến trúc cổ kính. Đây là nơi lý tưởng để tìm hiểu về lịch sử, văn hóa và kiến trúc đặc sắc của triều đình phong kiến Việt Nam.",
          image: "/images/Quần thể di tích cố đô Huế.jpg",
          location: "Thành phố Huế, Thừa Thiên Huế",
          rating: 4.9,
        },
        {
          type: "activity",
          title: "Dạo quanh thành phố",
          description:
            "Huế không chỉ có di tích lịch sử mà còn có những con phố yên bình, cây xanh rợp bóng. Hãy thuê một chiếc xe đạp hoặc đi bộ dọc theo sông Hương, tận hưởng không khí trong lành và khám phá những quán cà phê vintage mang đậm chất Huế.",
          location: "Trung tâm thành phố Huế",
          rating: 4.7,
        },
      ],
    },
    {
      day: 4,
      date: "17 Feb",
      activities: [
        {
          type: "food",
          title: "Bún Bò Huế O Cương",
          description:
            "Bún bò Huế là linh hồn của ẩm thực Huế với nước dùng đậm đà, thịt bò mềm thơm, chả cua ngon ngọt, ăn kèm rau sống tươi ngon. Tô bún nóng hổi, cay nồng sẽ giúp bạn nạp đầy năng lượng cho hành trình khám phá thành phố.",
          image: "/images/bunbohue.jpg",
          location: "11 Lý Thường Kiệt, Huế",
          rating: 4.8,
        },
        {
          type: "place",
          title: "Đại Nội Huế",
          description:
            "Chiêm ngưỡng kiến trúc cung đình, khám phá lịch sử triều Nguyễn.",
          image: "/images/Đại Nội Huế.jpg",
          location: "23 Tống Duy Tân, Huế",
          rating: 4.9,
        },
        {
          type: "activity",
          title: "Chùa Thiên Mụ",
          description:
            "Tham quan ngôi chùa cổ linh thiêng bên dòng sông Hương thơ mộng.",
          image: "/images/Chùa Thiên Mụ.jpg",
          location: "Kim Long, Huế",
          rating: 4.8,
        },
      ],
    },
    {
      day: 5,
      date: "18 Feb",
      activities: [
        {
          type: "food",
          title: "Bánh Bèo - Nậm - Lọc",
          description:
            "Thưởng thức bộ ba món bánh Huế nổi tiếng với hương vị đặc trưng.",
          image: "/images/Bèo Nậm Lọc.jpg",
          location: "Đường Kinh Dương Vương, Huế",
          rating: 4.7,
        },
        {
          type: "place",
          title: "Lăng Khải Định",
          description:
            "Chiêm ngưỡng công trình lăng tẩm kết hợp tinh hoa kiến trúc Đông - Tây.",
          image: "/images/Lăng Khải Định.jpg",
          location: "Khải Định, Thủy Bằng, Hương Thủy, Huế",
          rating: 4.8,
        },
        {
          type: "activity",
          title: "Du thuyền trên sông Hương",
          description:
            "Thưởng ngoạn phong cảnh yên bình và lắng nghe ca Huế trên thuyền rồng.",
          image: "/images/Đi thuyền trên sông Hương.jpg",
          location: "Bến thuyền Tòa Khâm, Huế",
          rating: 4.6,
        },
      ],
    },

    // Thêm các ngày khác tương tự
  ];

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [draggedActivity, setDraggedActivity] = useState<any>(null);
  const [draggedDay, setDraggedDay] = useState<number | null>(null);
  const [activities, setActivities] = useState<DayPlan[]>(planData);

  const [dragOverIndex, setDragOverIndex] = useState<{ day: number; index: number } | null>(null);

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
  const handleDragStart = (e: React.DragEvent, dayIndex: number, activityIndex: number) => {
    e.dataTransfer.setData("text/plain", `${dayIndex}-${activityIndex}`);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, dayIndex: number, activityIndex: number) => {
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

    if (sourceDayIndex === targetDayIndex && sourceActivityIndex === targetIndex) return;

    const newActivities = [...activities];
    const sourceDay = newActivities[sourceDayIndex];
    const targetDay = newActivities[targetDayIndex];

    const [movedActivity] = sourceDay.activities.splice(sourceActivityIndex, 1);
    targetDay.activities.splice(targetIndex, 0, movedActivity);

    setActivities(newActivities);
    setDragOverIndex(null);
  };

  const renderIcon = (icon: string | React.ReactNode) => {
    if (typeof icon === "string") {
      return <span>{icon}</span>;
    }
    return icon;
  };

  // Cập nhật function để toggle HomePage với day index
  const toggleHomePage = (dayIndex?: number) => {
    if (dayIndex !== undefined) {
      setSelectedDayIndex(dayIndex);
    }
    setShowHomePage(!showHomePage);
  };

  // Cập nhật hàm xử lý thêm destination vào plan
  const handleAddDestination = (destination: DestinationCard) => {
    const newActivity: Activity = {
      type: "place",
      title: destination.title,
      description: destination.description,
      image: destination.image,
      location: destination.location,
      rating: destination.rating,
    };

    // Thêm activity vào ngày được chọn
    const newActivities = [...activities];
    newActivities[selectedDayIndex].activities.push(newActivity);
    setActivities(newActivities);

    // Hiệu ứng thông báo thành công
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

  // Thêm hàm xử lý click vào card
  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  // Thêm hàm đóng modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedActivity(null);
  };

  // Thêm hàm xử lý hiển thị modal xác nhận xóa
  const handleDeleteActivity = (dayIndex: number, activityIndex: number) => {
    setActivityToDelete({ dayIndex, activityIndex });
    setShowDeleteModal(true);
  };

  // Thêm hàm xử lý xóa activity
  const handleConfirmDelete = () => {
    if (activityToDelete) {
      const { dayIndex, activityIndex } = activityToDelete;
      const newActivities = [...activities];
      newActivities[dayIndex].activities.splice(activityIndex, 1);
      setActivities(newActivities);

      // Hiển thị thông báo thành công
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

  // Thêm hàm hủy xóa
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setActivityToDelete(null);
  };

  // Cập nhật hàm getActivityIcon
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

  const handleTimeChange = (dayIndex: number, activityIndex: number, startTime: string, endTime: string) => {
    const newActivities = [...activities];
    newActivities[dayIndex].activities[activityIndex].startTime = startTime;
    newActivities[dayIndex].activities[activityIndex].endTime = endTime;
    setActivities(newActivities);
  };

  return (
    <div className={`plan-wrapper ${showHomePage ? "with-sidebar" : ""}`}>
      {/* Modal xác nhận xóa */}
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

      {/* Modal hiển thị thông tin chi tiết */}
      {showModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 overflow-hidden relative">
            {/* Nút đóng */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <IoClose size={24} />
            </button>

            {/* Ảnh */}
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

            {/* Nội dung */}
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

      {/* Thêm slide panel cho HomePage */}
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

      {/* Thêm overlay khi HomePage được hiển thị */}
      {showHomePage && (
        <div
          className="panel-overlay"
          onClick={() => toggleHomePage(selectedDayIndex)}
        ></div>
      )}

      <div className={`plan-container ${showHomePage ? "shifted" : ""}`}>
        <Screenshot className="min-h-screen text-white">
          <div className="min-h-screen text-white">
            {/* Header */}
            <div className="p-6">
              <Link href="/" className="flex items-center gap-2 text-white">
                <IoArrowBackOutline size={24} />
                <span>Back</span>
              </Link>

              <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold test_title">MY PLAN</h1>
                <p className="text-lg test_text">14 Feb - 20 Feb</p>
                <p className="text-lg test_text">Da Nang - Hue</p>
              </div>
            </div>

            {/* Timeline Cards Container */}
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
                        setDragOverIndex({ day: dayIndex, index: day.activities.length });
                      }
                    }}
                  >
                    {day.activities.map((activity, actIndex) => (
                      <React.Fragment key={actIndex}>
                        {dragOverIndex?.day === dayIndex && dragOverIndex?.index === actIndex && (
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
                            className={`activity-icon-container ${getActivityIcon(activity.type).className}`}
                          >
                            {getActivityIcon(activity.type).icon}
                          </div>
                          <div className="activity-content">
                            <div className="flex justify-between items-start">
                              <h3 className="activity-title">{activity.title}</h3>
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
                            <p className="activity-description">{activity.description}</p>
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
                          dragOverIndex?.index === actIndex + 1 && <div className="drop-indicator" />}
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
