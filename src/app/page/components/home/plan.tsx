"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  FaPlus,
  FaUtensils,
  FaMapMarkerAlt,
  FaCamera,
  FaLandmark,
  FaTrash,
  FaClock,
  FaCalendarAlt,
  FaSuitcase,
  FaGlobeAmericas,
  FaSun,
  FaCloud,
  FaCloudRain,
  FaWind,
  FaArrowRight,
  FaArrowLeft,
  FaTimes,
  FaStar,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

// Types
interface Activity {
  type: string;
  title: string;
  description: string;
  icon?: string | React.ReactNode;
  image?: string;
  location?: string;
  rating?: number;
  time?: string;
}

interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

interface WeatherForecast {
  Ngày: string;
  "Nhiệt độ tối đa": string;
  "Mô tả": string;
}

interface FlightData {
  base_price_vnd: string;
  cabin: string;
  fare_basis: string;
  outbound_flight_code: string;
  outbound_time: string;
  total_price_vnd: string;
}

interface HotelData {
  animates: string;
  description: string;
  hotel_class: string;
  img_origin: string;
  link: string;
  location_rating: string;
  name: string;
  name_nearby_place: string;
  price: string;
}

interface ScheduleData {
  schedule: {
    schedule: Array<{
      day: string;
      itinerary: Array<{
        type: string;
        details: {
          title: string;
          description: string;
          address: string;
          rating: number;
          img: string;
        };
        time: string;
      }>;
    }>;
    province: string;
  };
  weather_forecast: {
    forecast: WeatherForecast[];
  };
  flight: FlightData;
  hotel: HotelData;
}

interface DestinationCard {
  title: string;
  description?: string;
  img?: string;
  address?: string;
  rating: number;
}

// Hàm chuyển đổi thời gian sang phút để so sánh
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Hàm kiểm tra giao thoa thời gian
const isTimeOverlap = (time1: string, time2: string): boolean => {
  const [start1, end1] = time1.split(" - ").map(timeToMinutes);
  const [start2, end2] = time2.split(" - ").map(timeToMinutes);
  return start1 <= end2 && start2 <= end1;
};

// HomePage Component (Mocked for simplicity)
const HomePage: React.FC<{
  isInPlan?: boolean;
  onAddToPlan?: (destination: DestinationCard) => void;
  showAddButton?: boolean;
}> = ({ onAddToPlan }) => {
  const mockDestinations: DestinationCard[] = [
    {
      title: "Chợ Bến Thành",
      description:
        "Khám phá khu chợ truyền thống với nhiều mặt hàng đặc sản và đồ lưu niệm.",
      img: "https://images.unsplash.com/photo-1592812430165-1b1e5811b2e5",
      address: "Lê Lợi, Bến Thành, Quận 1, TP.HCM",
      rating: 4.3,
    },
  ];

  return (
    <div className="p-4">
      {mockDestinations.map((destination, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="font-bold">{destination.title}</h3>
          <p>{destination.description}</p>
          {onAddToPlan && (
            <button
              onClick={() => onAddToPlan(destination)}
              className="mt-2 bg-[#1a936f] hover:bg-[#114b5f] text-white px-4 py-2 rounded"
            >
              Thêm vào lịch trình
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// Main Component
export default function Plan() {
  const [showHomePage, setShowHomePage] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [activityToMove, setActivityToMove] = useState<{
    dayIndex: number;
    activityIndex: number;
    activity: Activity;
  } | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userId, setUserId] = useState<number | null>(7);
  const [scheduleId, setScheduleId] = useState<number | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [activities, setActivities] = useState<DayPlan[]>([]);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [flight, setFlight] = useState<FlightData | null>(null);
  const [hotel, setHotel] = useState<HotelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentHotelImageIndex, setCurrentHotelImageIndex] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);

        const scheduleData = localStorage.getItem("travelSchedule");
        if (!scheduleData) {
          throw new Error(
            "Không tìm thấy dữ liệu lịch trình trong localStorage."
          );
        }

        const parsedData: ScheduleData = JSON.parse(scheduleData);

        setFlight(parsedData.flight);
        if (parsedData.hotel) {
          setHotel({
            ...parsedData.hotel,
            img_origin: parsedData.hotel.img_origin
              .split(",")
              .map((img) => img.trim()),
          });
        }

        if (
          !parsedData ||
          !parsedData.schedule ||
          !Array.isArray(parsedData.schedule.schedule)
        ) {
          throw new Error(
            "Dữ liệu không hợp lệ: 'schedule' không phải là mảng hoặc không tồn tại."
          );
        }

        const formattedActivities = parsedData.schedule.schedule.map(
          (dayItem, index) => {
            const dateMatch =
              dayItem.day.match(/\$\$(.*?)\$\$/) ||
              dayItem.day.match(/\((.*?)\)/);
            const date = dateMatch ? dateMatch[1] : dayItem.day;

            const dayActivities = dayItem.itinerary.map((slot) => {
              const details = slot.details;
              return {
                type: slot.type,
                title: details.title || "Không có tiêu đề",
                description: details.description || "",
                location: details.address || "Không có địa chỉ",
                rating: details.rating || 0,
                image: details.img || "",
                time: slot.time || "Chưa có thời gian",
              };
            });

            return {
              day: index + 1,
              date: date,
              activities: dayActivities,
            };
          }
        );

        setActivities(formattedActivities);
        setWeatherForecast(parsedData.weather_forecast.forecast);
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading schedule:", err);
        toast.error("Không thể tải kế hoạch du lịch. Vui lòng thử lại!");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/recommend/login-user/",
        { email, password },
        { withCredentials: true }
      );
      if (response.data.message === "Đăng nhập thành công") {
        setUserId(response.data.user_id);
        setShowLoginModal(false);
        setLoginError(null);
        toast.success("Đăng nhập thành công!");
      } else {
        setLoginError("Đăng nhập thất bại");
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.error || "Lỗi khi đăng nhập");
      console.error("Login error:", err);
      toast.error("Lỗi khi đăng nhập");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/recommend/logout-user/",
        {},
        { withCredentials: true }
      );
      setUserId(null);
      setScheduleId(null);
      setShareLink(null);
      setShowLoginModal(true);
      toast.success("Đăng xuất thành công!");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Lỗi khi đăng xuất");
    }
  };

  const handleSaveAndShareSchedule = async () => {
    if (!userId) {
      setShowLoginModal(true);
      toast.error("Vui lòng đăng nhập để lưu lịch trình!");
      return;
    }

    try {
      toast("Đang lưu lịch trình của bạn...");

      const formattedData = {
        user_id: userId,
        schedule_name: "Chuyến đi Hồ Chí Minh",
        days: activities.map((day) => ({
          day_index: day.day,
          date_str: day.date,
          itinerary: day.activities.map((activity, actIndex) => {
            const item: any = {
              timeslot: activity.time || "08:00 - 09:00",
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

      const saveResponse = await axios.post(
        "http://127.0.0.1:8000/recommend/save-schedule/",
        formattedData,
        { withCredentials: true }
      );

      if (saveResponse.data && saveResponse.data.schedule_id) {
        const scheduleId = saveResponse.data.schedule_id;
        setScheduleId(scheduleId);
        toast.success("Lịch trình đã được lưu thành công!");

        const shareResponse = await axios.post(
          "http://127.0.0.1:8000/recommend/share-schedule/",
          { user_id: userId, schedule_id: scheduleId },
          { withCredentials: true }
        );

        if (shareResponse.data && shareResponse.data.share_link) {
          setShareLink(shareResponse.data.share_link);
          toast.success("Lịch trình đã được lưu và link chia sẻ đã được tạo!");
        }
      }
    } catch (err: any) {
      console.error("Error in save and share schedule:", err);
      toast.error(
        err.response?.data?.error || "Lỗi khi lưu hoặc chia sẻ lịch trình"
      );
    }
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  const handleDeleteActivity = (dayIndex: number, activityIndex: number) => {
    const newActivities = [...activities];
    newActivities[dayIndex].activities.splice(activityIndex, 1);
    setActivities(newActivities);
    toast.success("Hoạt động đã được xóa khỏi lịch trình");
  };

  const handleMoveActivity = (dayIndex: number, activityIndex: number) => {
    setActivityToMove({
      dayIndex,
      activityIndex,
      activity: activities[dayIndex].activities[activityIndex],
    });
    setShowMoveModal(true);
  };

  const handleConfirmMove = (targetDayIndex: number) => {
    if (!activityToMove) return;

    const { dayIndex, activityIndex, activity } = activityToMove;

    if (targetDayIndex === dayIndex) {
      setShowMoveModal(false);
      setActivityToMove(null);
      return;
    }

    // Kiểm tra trùng thời gian (giao thoa)
    const targetDayActivities = activities[targetDayIndex].activities;
    const isTimeConflict = targetDayActivities.some((act) =>
      isTimeOverlap(
        act.time || "00:00 - 00:00",
        activity.time || "00:00 - 00:00"
      )
    );

    if (isTimeConflict) {
      toast.error(
        "Thời gian của hoạt động này giao thoa với một hoạt động đã có trong ngày đích. Vui lòng điều chỉnh thời gian."
      );
      return;
    }

    // Nếu không giao thoa, thực hiện di chuyển và sắp xếp lại
    const newActivities = [...activities];
    newActivities[dayIndex].activities.splice(activityIndex, 1);
    newActivities[targetDayIndex].activities.push(activity);

    // Sắp xếp lại hoạt động trong ngày đích theo thời gian bắt đầu
    newActivities[targetDayIndex].activities.sort((a, b) => {
      const startA = timeToMinutes(a.time?.split(" - ")[0] || "00:00");
      const startB = timeToMinutes(b.time?.split(" - ")[0] || "00:00");
      return startA - startB;
    });

    setActivities(newActivities);
    setShowMoveModal(false);
    setActivityToMove(null);

    toast.success(`Hoạt động đã được chuyển sang Ngày ${targetDayIndex + 1}`);
  };

  const toggleHomePage = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setShowHomePage(!showHomePage);
  };

  const handleAddDestination = (destination: DestinationCard) => {
    const newActivities = [...activities];
    newActivities[selectedDayIndex].activities.push({
      type: "place",
      title: destination.title,
      description: destination.description || "",
      image: destination.img || "",
      location: destination.address || "",
      rating: destination.rating,
      time: "09:00 - 11:00",
    });
    setActivities(newActivities);
    setShowHomePage(false);
    toast.success(
      `Đã thêm ${destination.title} vào ngày ${selectedDayIndex + 1}`
    );
  };

  const nextSlide = () => {
    if (activities[selectedDayIndex]?.activities) {
      setCurrentSlide(
        (prev) => (prev + 1) % activities[selectedDayIndex].activities.length
      );
    }
  };

  const prevSlide = () => {
    if (activities[selectedDayIndex]?.activities) {
      setCurrentSlide(
        (prev) =>
          (prev - 1 + activities[selectedDayIndex].activities.length) %
          activities[selectedDayIndex].activities.length
      );
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#fef9f3]">
      <Toaster />
      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Đăng nhập</h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 rounded-full hover:bg-gray-200"
                >
                  <FaTimes />
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
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a936f]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a936f]"
                  />
                </div>
                {loginError && (
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}
                <button
                  onClick={handleLogin}
                  className="w-full bg-[#1a936f] hover:bg-[#114b5f] text-white px-4 py-2 rounded"
                >
                  Đăng nhập
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Activity Detail Modal */}
      <AnimatePresence>
        {showActivityModal && selectedActivity && (
          <ActivityDetailModal
            activity={selectedActivity}
            onClose={() => setShowActivityModal(false)}
            onSave={(newTime) => {
              const newActivities = [...activities];
              const dayIndex = activities.findIndex((day) =>
                day.activities.includes(selectedActivity)
              );
              const activityIndex = newActivities[
                dayIndex
              ].activities.findIndex((act) => act === selectedActivity);
              newActivities[dayIndex].activities[activityIndex].time = newTime;
              setActivities(newActivities);
              setSelectedActivity({ ...selectedActivity, time: newTime });
            }}
          />
        )}
      </AnimatePresence>
      {/* Move Activity Modal */}
      <AnimatePresence>
        {showMoveModal && activityToMove && (
          <MoveActivityModal
            days={activities.map((day) => ({ day: day.day, date: day.date }))}
            currentDayIndex={activityToMove.dayIndex}
            onMove={handleConfirmMove}
            onClose={() => {
              setShowMoveModal(false);
              setActivityToMove(null);
            }}
          />
        )}
      </AnimatePresence>
      {/* Sidebar for Adding Destinations */}
      <div
        className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ${
          showHomePage ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold">Thêm hoạt động</h2>
          <button
            onClick={() => setShowHomePage(false)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <FaTimes />
          </button>
        </div>
        <div className="overflow-auto h-[calc(100vh-64px)]">
          {showHomePage && (
            <HomePage
              isInPlan={true}
              onAddToPlan={handleAddDestination}
              showAddButton={true}
            />
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-10">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-[#d62828] transition-colors"
            >
              <IoArrowBackOutline size={24} />
              <span>Quay lại</span>
            </Link>

            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Kế Hoạch Du Lịch
              </h1>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  <FaCalendarAlt className="text-[#d62828]" />
                  <span>
                    {activities.length > 0
                      ? `${activities[0].date} - ${
                          activities[activities.length - 1].date
                        }`
                      : "Không có ngày"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  <FaMapMarkerAlt className="text-[#d62828]" />
                  <span>
                    {localStorage.getItem("travelSchedule")
                      ? JSON.parse(localStorage.getItem("travelSchedule")!)
                          .schedule.province
                      : "Hồ Chí Minh"}
                  </span>
                </div>
              </div>
            </div>

            <div className="invisible">
              <IoArrowBackOutline size={24} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Day Selector (Left Side) */}
          <div className="md:col-span-1">
            <DaySelector
              days={activities}
              selectedDayIndex={selectedDayIndex}
              onSelectDay={setSelectedDayIndex}
              weatherForecast={weatherForecast}
            />
          </div>

          {/* Activities Display (Right Side) */}
          <div className="md:col-span-3">
            <div
              key={selectedDayIndex}
              className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Ngày {activities[selectedDayIndex]?.day} -{" "}
                  {activities[selectedDayIndex]?.date}
                </h2>

                <button
                  onClick={() => toggleHomePage(selectedDayIndex)}
                  className="bg-[#1a936f] hover:bg-[#114b5f] text-white px-4 py-2 rounded flex items-center"
                >
                  <FaPlus className="mr-2" />
                  Thêm hoạt động
                </button>
              </div>

              {activities[selectedDayIndex]?.activities.length > 0 ? (
                <div className="px-4 -mx-4">
                  <div className="relative">
                    <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory">
                      {activities[selectedDayIndex].activities.map(
                        (activity, index) => (
                          <div
                            key={index}
                            className="min-w-[48%] flex-shrink-0 snap-start"
                          >
                            <ActivityCardSimple
                              activity={activity}
                              onActivityClick={() =>
                                handleActivityClick(activity)
                              }
                              onDeleteActivity={() =>
                                handleDeleteActivity(selectedDayIndex, index)
                              }
                              onMoveActivity={() =>
                                handleMoveActivity(selectedDayIndex, index)
                              }
                            />
                          </div>
                        )
                      )}
                    </div>

                    {/* Navigation Arrows */}
                    {activities[selectedDayIndex].activities.length > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
                          aria-label="Previous activity"
                        >
                          <FaArrowLeft className="text-gray-600" />
                        </button>
                        <button
                          onClick={nextSlide}
                          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md"
                          aria-label="Next activity"
                        >
                          <FaArrowRight className="text-gray-600" />
                        </button>
                      </>
                    )}

                    {/* Pagination dots */}
                    <div className="flex justify-center mt-4 gap-2">
                      {activities[selectedDayIndex].activities.map(
                        (_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                              index === currentSlide
                                ? "bg-[#1a936f]"
                                : "bg-gray-300"
                            }`}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Go to activity ${index + 1}`}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl">
                  <FaSuitcase className="text-5xl text-gray-300 mb-4" />
                  <p className="text-xl font-medium text-gray-600">
                    Chưa có hoạt động nào cho ngày này
                  </p>
                  <p className="text-gray-500 mt-2">
                    Thêm hoạt động để bắt đầu lập kế hoạch
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flight and Hotel Information */}
        <div className="mt-10 mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {flight && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Thông tin chuyến bay
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>Mã chuyến bay:</strong> {flight.outbound_flight_code}
                </p>
                <p>
                  <strong>Thời gian khởi hành:</strong>{" "}
                  {new Date(flight.outbound_time).toLocaleString()}
                </p>
                <p>
                  <strong>Khoang hành lý:</strong> {flight.cabin}
                </p>
                <p>
                  <strong>Giá cơ bản:</strong> {flight.base_price_vnd}
                </p>
                <p>
                  <strong>Tổng giá:</strong> {flight.total_price_vnd}
                </p>
              </div>
            </div>
          )}

          {hotel && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Thông tin khách sạn
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>Tên khách sạn:</strong> {hotel.name}
                </p>
                <p>
                  <strong>Mô tả:</strong> {hotel.description}
                </p>
                <p>
                  <strong>Đánh giá vị trí:</strong> {hotel.location_rating}
                </p>
                <p>
                  <strong>Tiện nghi:</strong> {hotel.animates}
                </p>
                <p>
                  <strong>Giá:</strong> {hotel.price} VNĐ
                </p>
                <p>
                  <strong>Liên kết:</strong>{" "}
                  <a
                    href={hotel.link}
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {hotel.link}
                  </a>
                </p>
                {hotel.img_origin && hotel.img_origin.length > 0 && (
                  <div className="mt-4 relative">
                    <div className="w-full h-[445px] overflow-hidden rounded-lg">
                      <Image
                        src={hotel.img_origin[currentHotelImageIndex]}
                        alt={`${hotel.name} - Image ${
                          currentHotelImageIndex + 1
                        }`}
                        width={1380}
                        height={445}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {hotel.img_origin.length > 1 && (
                      <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 transform -translate-y-1/2">
                        <button
                          onClick={() =>
                            setCurrentHotelImageIndex(
                              (prev) =>
                                (prev - 1 + hotel.img_origin.length) %
                                hotel.img_origin.length
                            )
                          }
                          className="bg-white p-2 rounded-full shadow-md"
                        >
                          <FaArrowLeft className="text-gray-600" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentHotelImageIndex(
                              (prev) => (prev + 1) % hotel.img_origin.length
                            )
                          }
                          className="bg-white p-2 rounded-full shadow-md"
                        >
                          <FaArrowRight className="text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Travel Tips */}
        <TravelTips />

        {/* Schedule Actions */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleSaveAndShareSchedule}
            className="bg-[#d62828] hover:bg-[#9e1a1a] text-white px-8 py-6 text-lg rounded-xl shadow-lg"
          >
            Lưu và chia sẻ lịch trình
          </button>
        </div>

        {shareLink && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <p className="text-[#1a936f] font-medium">
              Link chia sẻ:{" "}
              <a href={shareLink} className="underline">
                {shareLink}
              </a>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// DaySelector Component
function DaySelector({
  days,
  selectedDayIndex,
  onSelectDay,
  weatherForecast,
}: {
  days: DayPlan[];
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
  weatherForecast: WeatherForecast[];
}) {
  const getWeatherIcon = (description: string) => {
    if (description.includes("nắng"))
      return <FaSun className="text-yellow-500" />;
    if (description.includes("mây"))
      return <FaCloud className="text-gray-500" />;
    if (description.includes("mưa"))
      return <FaCloudRain className="text-blue-500" />;
    return <FaWind className="text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sticky top-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Lịch trình
      </h2>

      <div className="space-y-2">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => onSelectDay(index)}
            className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
              selectedDayIndex === index
                ? "bg-[#1a936f] text-gray-800 shadow-md"
                : "bg-gray-50 hover:bg-gray-100 text-gray-800"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">Ngày {day.day}</div>
                <div className="text-sm opacity-90">{day.date}</div>
              </div>

              {weatherForecast[index] && (
                <div className="flex items-center gap-1">
                  {getWeatherIcon(weatherForecast[index]["Mô tả"])}
                  <span className="text-sm">
                    {weatherForecast[index]["Nhiệt độ tối đa"]}°C
                  </span>
                </div>
              )}
            </div>

            <div
              className={`text-xs mt-2 ${
                selectedDayIndex === index ? "text-gray-800" : "text-gray-500"
              }`}
            >
              {day.activities.length} hoạt động
            </div>

            {selectedDayIndex === index && (
              <div className="h-1 bg-white rounded-full mt-2" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ActivityCardSimple Component
function ActivityCardSimple({
  activity,
  onActivityClick,
  onDeleteActivity,
  onMoveActivity,
}: {
  activity: Activity;
  onActivityClick: () => void;
  onDeleteActivity: () => void;
  onMoveActivity: () => void;
}) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "food":
        return <FaUtensils className="text-yellow-500" />;
      case "place":
        return <FaLandmark className="text-green-600" />;
      default:
        return <FaMapMarkerAlt className="text-blue-500" />;
    }
  };

  const renderRating = (rating: number | undefined) => {
    if (!rating) return null;
    return (
      <div className="flex items-center bg-yellow-500 text-white px-2 py-1 rounded-full text-xs absolute top-2 right-2">
        <span className="mr-1">★</span>
        <span>{rating.toFixed(1)}</span>
      </div>
    );
  };

  const handleDeleteClick = () => {
    // Hiển thị thông báo xác nhận
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa hoạt động "${activity.title}" không?`
    );
    if (confirmDelete) {
      onDeleteActivity(); // Nếu người dùng xác nhận, gọi hàm xóa
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 h-full">
      <div className="relative">
        {activity.image && (
          <div className="relative h-40 w-full">
            <Image
              src={activity.image || "/placeholder.svg"}
              alt={activity.title}
              fill
              className="object-cover"
            />
            {activity.rating && renderRating(activity.rating)}
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`p-1.5 rounded-full ${
                activity.type === "food" ? "bg-yellow-100" : "bg-green-100"
              }`}
            >
              {getActivityIcon(activity.type)}
            </div>
            <h3 className="font-bold text-lg">{activity.title}</h3>
          </div>

          <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
            <FaClock className="text-[#1a936f]" />
            <span>{activity.time || "Chưa có thời gian"}</span>
          </div>

          {activity.location && (
            <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
              <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
              <span className="line-clamp-1">{activity.location}</span>
            </div>
          )}

          <div className="flex justify-between mt-2 gap-2">
            <button
              onClick={onActivityClick}
              className="text-xs border border-[#1a936f] text-[#1a936f] hover:bg-[#1a936f] hover:text-white px-3 py-1 rounded"
            >
              Xem chi tiết
            </button>

            <div className="flex gap-1">
              <button
                onClick={onMoveActivity}
                className="flex items-center gap-1 text-xs border border-[#1a936f] text-[#1a936f] hover:bg-[#1a936f] hover:text-white px-3 py-1 rounded"
              >
                <FaArrowRight size={12} />
                Di chuyển
              </button>

              <button
                onClick={handleDeleteClick} // Sử dụng hàm mới để xác nhận trước khi xóa
                className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                <FaTrash size={12} />
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// MoveActivityModal Component
function MoveActivityModal({
  days,
  currentDayIndex,
  onMove,
  onClose,
}: {
  days: Array<{ day: number; date: string }>;
  currentDayIndex: number;
  onMove: (targetDayIndex: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Di chuyển hoạt động</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <FaTimes />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Chọn ngày bạn muốn di chuyển hoạt động này đến:
        </p>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {days.map((day, index) => (
            <motion.button
              key={index}
              onClick={() => onMove(index)}
              disabled={index === currentDayIndex}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                index === currentDayIndex
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-50 hover:bg-[#1a936f] hover:text-white"
              }`}
              whileHover={index !== currentDayIndex ? { scale: 1.02 } : {}}
              whileTap={index !== currentDayIndex ? { scale: 0.98 } : {}}
            >
              <div className="text-left">
                <div className="font-medium">Ngày {day.day}</div>
                <div className="text-sm opacity-80">{day.date}</div>
              </div>

              {index !== currentDayIndex && (
                <FaArrowRight className="opacity-70" />
              )}
            </motion.button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Hủy
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ActivityDetailModal Component
function ActivityDetailModal({
  activity,
  onClose,
  onSave,
}: {
  activity: Activity;
  onClose: () => void;
  onSave: (newTime: string) => void;
}) {
  const [editedTime, setEditedTime] = useState(activity.time || "");
  const [isEditing, setIsEditing] = useState(false);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "food":
        return <FaUtensils className="text-yellow-500" />;
      case "place":
        return <FaLandmark className="text-green-600" />;
      default:
        return <FaMapMarkerAlt className="text-blue-500" />;
    }
  };

  const handleTimeChange = (newTime: string) => {
    setEditedTime(newTime);
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(editedTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header with image */}
        <div className="relative">
          {activity.image ? (
            <div className="relative h-64 w-full">
              <Image
                src={activity.image || "/placeholder.svg"}
                alt={activity.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-r from-[#1a936f] to-[#114b5f]"></div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2"
          >
            <FaTimes />
          </button>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`p-2 rounded-full ${
                  activity.type === "food" ? "bg-yellow-500" : "bg-green-500"
                }`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <h2 className="text-2xl font-bold">{activity.title}</h2>
            </div>

            {activity.rating && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < Math.floor(activity.rating || 0)
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }
                  />
                ))}
                <span className="ml-1 text-white/90">{activity.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {activity.time && (
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <FaClock className="text-[#1a936f]" />
              <input
                type="text"
                value={editedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
              />
            </div>
          )}

          {activity.location && (
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <div className="bg-red-100 text-red-500 p-2 rounded-full">
                <FaMapMarkerAlt />
              </div>
              <span>{activity.location}</span>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-xl my-4">
            <h3 className="font-medium text-gray-800 mb-2">Mô tả</h3>
            <p className="text-gray-700 leading-relaxed">
              {activity.description}
            </p>
          </div>

          {activity.type === "place" && (
            <div className="bg-green-50 p-4 rounded-xl my-4">
              <h3 className="font-medium text-green-800 mb-2">
                Thông tin địa điểm
              </h3>
              <p className="text-green-700">
                Đây là một địa điểm tham quan nổi tiếng tại Hồ Chí Minh. Bạn nên
                dành khoảng 2 giờ để khám phá đầy đủ.
              </p>
            </div>
          )}

          {activity.type === "food" && (
            <div className="bg-yellow-50 p-4 rounded-xl my-4">
              <h3 className="font-medium text-yellow-800 mb-2">
                Thông tin ẩm thực
              </h3>
              <p className="text-yellow-700">
                Đây là một địa điểm ẩm thực nổi tiếng tại Hồ Chí Minh. Bạn nên
                thử các món đặc sản tại đây.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={isEditing ? handleSave : onClose}
            className="w-full bg-[#1a936f] hover:bg-[#114b5f] text-white px-4 py-2 rounded"
          >
            {isEditing ? "Lưu và đóng" : "Đóng"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// LoadingScreen Component
function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#fef9f3] flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            scale: {
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            },
          }}
          className="inline-block text-6xl text-[#d62828] mb-6"
        >
          <FaGlobeAmericas />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-gray-800 mb-2"
        >
          Đang tải kế hoạch du lịch
        </motion.h2>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="h-1 bg-[#1a936f] rounded-full max-w-xs mx-auto"
        />
      </div>
    </div>
  );
}

// TravelTips Component
function TravelTips() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="mt-16 bg-white rounded-2xl shadow-xl p-6 border-l-4 border-[#f3a712]"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={container}
    >
      <motion.h3
        className="text-2xl font-bold text-gray-800 mb-6"
        variants={item}
      >
        Lời khuyên cho chuyến đi
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="bg-gray-50 p-5 rounded-xl flex items-start gap-4"
          variants={item}
          whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
        >
          <div className="bg-[#f3a712]/10 p-3 rounded-full text-[#f3a712] text-xl">
            <FaSuitcase />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">
              Chuẩn bị hành lý
            </h4>
            <p className="text-gray-600">
              Đừng quên mang theo áo mưa và kem chống nắng cho chuyến đi của
              bạn!
            </p>
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-50 p-5 rounded-xl flex items-start gap-4"
          variants={item}
          whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
        >
          <div className="bg-[#f3a712]/10 p-3 rounded-full text-[#f3a712] text-xl">
            <FaMapMarkerAlt />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">
              Khám phá địa phương
            </h4>
            <p className="text-gray-600">
              Hãy thử các món ăn địa phương và tham gia các hoạt động văn hóa để
              trải nghiệm trọn vẹn.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-50 p-5 rounded-xl flex items-start gap-4"
          variants={item}
          whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
        >
          <div className="bg-[#f3a712]/10 p-3 rounded-full text-[#f3a712] text-xl">
            <FaCamera />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">
              Lưu giữ kỷ niệm
            </h4>
            <p className="text-gray-600">
              Đừng quên chụp ảnh và ghi lại những khoảnh khắc đáng nhớ trong
              chuyến đi!
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
