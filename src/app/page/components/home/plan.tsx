"use client";

import React, { useRef, useState, MouseEvent, TouchEvent } from "react";
import "./plan.css";
import { IoArrowBackOutline, IoClose, IoTrashOutline } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import HomePage, { DestinationCard } from "./home_page";

// Định nghĩa interface cho Activity
interface Activity {
  type: string;
  title: string;
  description: string;
  icon?: string | React.ReactNode;
  image?: string;
  location?: string;
  rating?: number;
}

// Định nghĩa interface cho Day
interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

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
    activity: Activity,
    dayIndex: number
  ) => {
    setDraggedActivity(activity);
    setDraggedDay(dayIndex);
    e.currentTarget.classList.add("dragging");
    // Thêm data để phân biệt với destination card
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "activity",
        data: activity,
        sourceDay: dayIndex,
      })
    );
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedActivity(null);
    setDraggedDay(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.add("drag-over");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("drag-over");
  };

  const handleDrop = (
    e: React.DragEvent,
    targetDayIndex: number,
    targetIndex: number
  ) => {
    e.preventDefault();
    try {
      const droppedData = JSON.parse(
        e.dataTransfer.getData("application/json")
      );

      if (droppedData.type === "destination") {
        // Xử lý kéo thả từ HomePage
        const newActivities = [...activities];
        const destinationActivity: Activity = {
          type: "place",
          title: droppedData.data.title,
          description: droppedData.data.description,
          image: droppedData.data.image,
          location: droppedData.data.location,
          rating: droppedData.data.rating,
        };

        const targetDay = newActivities[targetDayIndex];
        targetDay.activities.splice(targetIndex, 0, destinationActivity);
        setActivities(newActivities);

        // Thêm hiệu ứng cho card mới
        requestAnimationFrame(() => {
          const dayContainer = document.querySelector(
            `[data-day="${targetDayIndex}"]`
          );
          if (dayContainer) {
            const cards = dayContainer.querySelectorAll(".draggable-activity");
            const newCard = cards[targetIndex];
            if (newCard) {
              newCard.classList.add("destination-dropped");
              setTimeout(() => {
                newCard.classList.remove("destination-dropped");
              }, 500);
            }
          }
        });
      } else if (droppedData.type === "activity") {
        // Xử lý kéo thả trong Plan
        const sourceDayIndex = droppedData.sourceDay;
        const newActivities = [...activities];

        // Xóa activity từ vị trí cũ
        const sourceDay = newActivities[sourceDayIndex];
        const [movedActivity] = sourceDay.activities.splice(
          sourceDay.activities.findIndex(
            (act) => act.title === droppedData.data.title
          ),
          1
        );

        // Thêm vào vị trí mới
        const targetDay = newActivities[targetDayIndex];
        targetDay.activities.splice(targetIndex, 0, movedActivity);

        setActivities(newActivities);

        // Thêm hiệu ứng cho card được di chuyển
        requestAnimationFrame(() => {
          const cards = document.querySelectorAll(".draggable-activity");
          const movedCard = Array.from(cards).find(
            (card) =>
              card.querySelector(".font-medium")?.textContent ===
              movedActivity.title
          );
          if (movedCard) {
            movedCard.classList.add("activity-moved");
            setTimeout(() => {
              movedCard.classList.remove("activity-moved");
            }, 500);
          }
        });
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
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
  const handleDeleteClick = (
    dayIndex: number,
    activityIndex: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Ngăn không cho modal detail hiện lên
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

      // Hiển thị thông báo xóa thành công
      const notification = document.createElement("div");
      notification.className = "success-notification";
      notification.textContent = "Deleted successfully!";
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.remove();
      }, 2000);
    }
    setShowDeleteModal(false);
    setActivityToDelete(null);
  };

  // Thêm hàm hủy xóa
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setActivityToDelete(null);
  };

  return (
    <div className={`plan-wrapper ${showHomePage ? "with-sidebar" : ""}`}>
      {/* Thêm Delete Confirmation Modal */}
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
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
        <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white">
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
                data-day={dayIndex}
                className="flex-shrink-0 bg-white rounded-xl p-4 w-[320px] text-black"
                style={{ touchAction: "pan-y pinch-zoom" }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold">
                    Day {day.day} - {day.date}
                  </h2>
                </div>

                {/* Activities */}
                <div
                  className="space-y-4 drop-container"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {day.activities.map((activity, actIndex) => (
                    <div
                      key={actIndex}
                      className="border rounded-lg overflow-hidden draggable-activity test_card"
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, activity, dayIndex)
                      }
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add("drag-over");
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("drag-over");
                      }}
                      onDrop={(e) => handleDrop(e, dayIndex, actIndex)}
                    >
                      <div className="p-3 flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {activity.icon && renderIcon(activity.icon)}
                          <span className="font-medium">{activity.title}</span>
                        </div>
                      </div>

                      {activity.image && (
                        <div
                          className="relative h-48 w-full cursor-pointer"
                          onClick={() => handleActivityClick(activity)}
                        >
                          <Image
                            src={activity.image}
                            alt={activity.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="p-3">
                        <div className="flex items-center justify-between gap-2 p-4">
                          {activity.rating && (
                            <span className="rating">★ {activity.rating}</span>
                          )}
                          <button
                            className="delete-btn"
                            onClick={(e) =>
                              handleDeleteClick(dayIndex, actIndex, e)
                            }
                            aria-label="Delete activity"
                          >
                            <IoTrashOutline className="text-gray-500 hover:text-red-500 transition-colors" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {activity.description}
                        </p>
                        {activity.location && (
                          <p className="text-sm text-gray-500 mt-2 truncate">
                            <span>📍</span> {activity.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Drop zone indicator */}
                  <div
                    className="drop-zone"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) =>
                      handleDrop(e, dayIndex, day.activities.length)
                    }
                  ></div>
                </div>

                {/* Update Add Activity Button */}
                <div className="mt-4 flex justify-between items-center">
                  <button
                    className="flex items-center gap-2 text-blue-500"
                    onClick={() => toggleHomePage(dayIndex)}
                  >
                    <FaPlus size={12} />
                    <span>Add activities</span>
                  </button>
                  {/* <button className="text-blue-500">Ver Mapa</button> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan;
