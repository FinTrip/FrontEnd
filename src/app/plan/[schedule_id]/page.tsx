"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUtensils,
  FaLandmark,
  FaGlobe,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  hotel_class: string | null;
  img_origin: string;
  link: string;
  location_rating: number;
  price: number | null;
  created_at: string;
  updated_at: string;
}

interface Flight {
  base_price_vnd: string;
  cabin: string;
  fare_basis: string;
  outbound_flight_code: string;
  outbound_time: string;
  total_price_vnd: string;
}

interface Itinerary {
  id: number;
  timeslot: string;
  food_title: string;
  food_rating: number | null;
  food_price: string;
  food_address: string;
  food_phone: string;
  food_link: string;
  food_image: string;
  place_title: string;
  place_rating: number | null;
  place_description: string;
  place_address: string;
  place_img: string;
  place_link: string;
  order: number;
  food_time: string | null;
  place_time: string | null;
}

interface Day {
  day_index: number;
  date_str: string;
  itineraries: Itinerary[];
}

interface Schedule {
  name: string;
  created_at: string;
  days: Day[];
}

interface ScheduleResponse {
  hotel: Hotel;
  flight: Flight;
  schedule: Schedule;
}

export default function PlanDetails() {
  const params = useParams();
  const scheduleId = params.schedule_id;
  const [scheduleData, setScheduleData] = useState<ScheduleResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/recommend/view-schedule/${scheduleId}/`
        );
        setScheduleData(response.data);
      } catch (error) {
        console.error("Error fetching schedule details:", error);
        toast.error("Không thể tải chi tiết lịch trình");
      } finally {
        setLoading(false);
      }
    };

    if (scheduleId) {
      fetchScheduleDetails();
    }
  }, [scheduleId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#fef9f3] flex items-center justify-center z-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
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
            <FaGlobe />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            Đang tải chi tiết lịch trình
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

  if (!scheduleData) {
    return (
      <div className="min-h-screen bg-[#fef9f3] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Không tìm thấy lịch trình
          </h2>
          <Link
            href="/"
            className="text-[#1a936f] hover:text-[#114b5f] underline"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const { hotel, schedule } = scheduleData;

  return (
    <div className="min-h-screen bg-[#fef9f3]">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-10">
          <div className="flex justify-between items-center">
            <Link
              href="http://localhost:3000/forum/profile"
              className="flex items-center gap-2 text-gray-700 hover:text-[#d62828] transition-colors"
            >
              <IoArrowBackOutline size={24} />
              <span>Quay lại</span>
            </Link>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {schedule.name}
              </h1>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  <FaCalendarAlt className="text-[#d62828]" />
                  <span>
                    {schedule.days[0].date_str} -{" "}
                    {schedule.days[schedule.days.length - 1].date_str}
                  </span>
                </div>
              </div>
            </div>
            <div className="invisible">
              <IoArrowBackOutline size={24} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-4 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Lịch trình
              </h2>
              <div className="space-y-2">
                {schedule.days.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDayIndex(index)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                      selectedDayIndex === index
                        ? "bg-[#1a936f] text-white shadow-md"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="font-bold">Ngày {day.day_index}</div>
                    <div className="text-sm opacity-90">{day.date_str}</div>
                    <div className="text-xs mt-2">
                      {day.itineraries.length} hoạt động
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Ngày {schedule.days[selectedDayIndex].day_index} -{" "}
                {schedule.days[selectedDayIndex].date_str}
              </h2>

              <div className="space-y-6">
                {schedule.days[selectedDayIndex].itineraries.map(
                  (itinerary, index) => (
                    <div
                      key={itinerary.id}
                      className="flex gap-4 p-4 rounded-xl bg-gray-50"
                    >
                      <div className="flex-shrink-0 w-24 text-center">
                        <div className="text-sm font-medium text-gray-600">
                          {itinerary.timeslot}
                        </div>
                      </div>

                      <div className="flex-grow">
                        {itinerary.food_title && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FaUtensils className="text-yellow-500" />
                              <h3 className="font-semibold text-gray-800">
                                {itinerary.food_title}
                              </h3>
                              {itinerary.food_rating && (
                                <span className="text-sm text-yellow-500">
                                  ★ {itinerary.food_rating}
                                </span>
                              )}
                            </div>
                            {itinerary.food_image && (
                              <div className="relative h-40 w-full mb-2">
                                <Image
                                  src={itinerary.food_image}
                                  alt={itinerary.food_title}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            )}
                            {itinerary.food_address && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <FaMapMarkerAlt className="text-red-500" />
                                <span>{itinerary.food_address}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {itinerary.place_title && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <FaLandmark className="text-green-500" />
                              <h3 className="font-semibold text-gray-800">
                                {itinerary.place_title}
                              </h3>
                              {itinerary.place_rating && (
                                <span className="text-sm text-yellow-500">
                                  ★ {itinerary.place_rating}
                                </span>
                              )}
                            </div>
                            {itinerary.place_img && (
                              <div className="relative h-40 w-full mb-2">
                                <Image
                                  src={itinerary.place_img}
                                  alt={itinerary.place_title}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            )}
                            {itinerary.place_address && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <FaMapMarkerAlt className="text-red-500" />
                                <span>{itinerary.place_address}</span>
                              </div>
                            )}
                            {itinerary.place_description && (
                              <p className="mt-2 text-sm text-gray-600">
                                {itinerary.place_description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {scheduleData.flight && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Thông tin chuyến bay
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>Mã chuyến bay:</strong>{" "}
                  {scheduleData.flight.outbound_flight_code}
                </p>
                <p>
                  <strong>Thời gian khởi hành:</strong>{" "}
                  {new Date(scheduleData.flight.outbound_time).toLocaleString()}
                </p>
                <p>
                  <strong>Khoang hành lý:</strong> {scheduleData.flight.cabin}
                </p>
                <p>
                  <strong>Giá cơ bản:</strong>{" "}
                  {scheduleData.flight.base_price_vnd}
                </p>
                <p>
                  <strong>Tổng giá:</strong>{" "}
                  {scheduleData.flight.total_price_vnd}
                </p>
              </div>
            </div>
          )}

          {hotel && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Thông tin khách sạn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotel.img_origin && (
                  <div className="relative h-64 w-full">
                    <Image
                      src={hotel.img_origin}
                      alt={hotel.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {hotel.name}
                  </h3>
                  {hotel.description && (
                    <p className="text-gray-600">{hotel.description}</p>
                  )}
                  {hotel.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaMapMarkerAlt className="text-red-500" />
                      <span>{hotel.address}</span>
                    </div>
                  )}
                  {hotel.location_rating && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-yellow-500">★</span>
                      <span>Đánh giá vị trí: {hotel.location_rating}</span>
                    </div>
                  )}
                  {hotel.price && (
                    <div className="text-gray-600">
                      Giá: {hotel.price.toLocaleString()} VNĐ
                    </div>
                  )}
                  {hotel.link && (
                    <a
                      href={hotel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1a936f] hover:text-[#114b5f] underline"
                    >
                      Xem thêm thông tin
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
