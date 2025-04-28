"use client";

import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaSearch, FaCalendarAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import "../../app/styles/flight_hotel.css";

interface HotelCard {
  id: number;
  name: string;
  link: string;
  description: string;
  price: string;
  name_nearby_place: string;
  hotel_class: string;
  img_origin: string;
  location_rating: number;
  amenities: string[];
}

const Hotel = () => {
  const router = useRouter();
  const [destinationInput, setDestinationInput] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [recommendedHotels, setRecommendedHotels] = useState<HotelCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSessionData = () => {
      const sessionData = localStorage.getItem("travelSession");
      if (sessionData) {
        const { province, dates } = JSON.parse(sessionData);
        setDestinationInput(province || "");
        if (dates) {
          setCheckInDate(dates.start_day || "");
        }
      }
    };

    loadSessionData();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "travelSession") {
        loadSessionData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSearchHotels = async () => {
    setIsLoading(true);
    setRecommendedHotels([]);
    const hotelPayload = {
      destination: destinationInput,
      checkInDate: checkInDate,
      adults: 2,
      nights: 1,
    };

    try {
      const hotelResponse = await fetch(
        "http://127.0.0.1:8000/recommend/rcm-hotel/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hotelPayload),
        }
      );

      if (!hotelResponse.ok) {
        throw new Error("Không thể lấy danh sách khách sạn");
      }

      const hotelData = await hotelResponse.json();
      if (hotelData && hotelData.hotels && hotelData.hotels.length > 0) {
        const hotelsArray = hotelData.hotels.slice(0, 12);
        setRecommendedHotels(hotelsArray);
      } else {
        const sampleHotelsForDestination =
          createSampleHotelsForLocation(destinationInput);
        setRecommendedHotels(sampleHotelsForDestination);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm khách sạn:", error);
      const sampleHotelsForDestination =
        createSampleHotelsForLocation(destinationInput);
      setRecommendedHotels(sampleHotelsForDestination);
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleHotelsForLocation = (location: string): HotelCard[] => {
    type LocationData = {
      imgPrefix: string;
      nearbyPlaces: string[];
      priceRange: string[];
    };

    let locationSpecificData: LocationData = {
      imgPrefix: "/placeholder.svg",
      nearbyPlaces: [
        "Trung tâm thành phố",
        "Khu du lịch",
        "Khu mua sắm",
        "Công viên",
      ],
      priceRange: ["1,500,000", "2,000,000", "2,800,000", "3,200,000"],
    };

    switch (location.toLowerCase()) {
      case "đà nẵng":
        locationSpecificData = {
          imgPrefix:
            "https://i.pinimg.com/736x/bd/b3/06/bdb3065fbfc55969e85606b203f08501.jpg",
          nearbyPlaces: [
            "Bãi biển Mỹ Khê",
            "Cầu Rồng",
            "Bà Nà Hills",
            "Sơn Trà",
          ],
          priceRange: ["1,800,000", "2,500,000", "3,200,000", "4,000,000"],
        };
        break;
      case "hà nội":
        locationSpecificData = {
          imgPrefix:
            "https://i.pinimg.com/736x/a8/00/14/a80014131a8b5726a9e65df7cda9aee7.jpg",
          nearbyPlaces: ["Hồ Gươm", "Phố Cổ", "Văn Miếu", "Lăng Bác"],
          priceRange: ["1,500,000", "2,200,000", "3,000,000", "3,500,000"],
        };
        break;
      case "hồ chí minh":
        locationSpecificData = {
          imgPrefix:
            "https://i.pinimg.com/736x/23/67/ce/2367ce2b72eb90da3ec983bf605ca36e.jpg",
          nearbyPlaces: [
            "Phố đi bộ Nguyễn Huệ",
            "Chợ Bến Thành",
            "Nhà thờ Đức Bà",
            "Phố Tây",
          ],
          priceRange: ["1,600,000", "2,300,000", "3,100,000", "3,800,000"],
        };
        break;
    }

    return Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      name: `${getHotelNamePrefix(index)} ${location}`,
      link: `https://example.com/hotel-${index + 1}`,
      description: `Khách sạn sang trọng tại ${location} với vị trí đắc địa gần ${
        locationSpecificData.nearbyPlaces[
          index % locationSpecificData.nearbyPlaces.length
        ]
      }. Cung cấp đầy đủ tiện nghi và dịch vụ cao cấp.`,
      price: `${
        locationSpecificData.priceRange[
          index % locationSpecificData.priceRange.length
        ]
      } VND`,
      name_nearby_place:
        locationSpecificData.nearbyPlaces[
          index % locationSpecificData.nearbyPlaces.length
        ],
      hotel_class: `${Math.min(
        5,
        Math.max(3, Math.floor(Math.random() * 3) + 3)
      )} sao`,
      img_origin:
        index < 4 ? locationSpecificData.imgPrefix : "/placeholder.svg",
      location_rating: parseFloat((4 + Math.random()).toFixed(1)),
      amenities: [
        "Hồ bơi",
        "Wifi miễn phí",
        "Nhà hàng",
        "Phòng gym",
        "Spa",
        "Dịch vụ đưa đón",
      ]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4 + Math.floor(Math.random() * 3)),
    }));
  };

  const getHotelNamePrefix = (index: number): string => {
    const prefixes = [
      "Vinpearl Resort",
      "Melia Hotel",
      "Novotel",
      "Hilton",
      "Continental",
      "Intercontinental",
      "Marriott",
      "Sheraton",
      "Pullman",
      "Hyatt Regency",
      "Renaissance",
      "Sofitel",
      "Crowne Plaza",
      "Grand Mercure",
      "Holiday Inn",
      "Anantara",
    ];
    return prefixes[index % prefixes.length];
  };

  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = event.target as HTMLImageElement;
    if (!target.src.includes("placeholder.svg")) {
      target.src = "/placeholder.svg";
      target.onerror = null;
    }
  };

  const handleHotelSelect = async (hotel: HotelCard) => {
    const sessionData = localStorage.getItem("travelSession");
    const updatedSession = sessionData
      ? { ...JSON.parse(sessionData), hotel }
      : { hotel };
    localStorage.setItem("travelSession", JSON.stringify(updatedSession));

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/recommend/select_hotel/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hotel_info: hotel }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lưu lựa chọn khách sạn");
      }

      localStorage.setItem("completedStep", "hotel");
      router.push("/Q&A");
    } catch (error) {
      console.error("Lỗi khi lưu khách sạn:", error);
      localStorage.setItem("completedStep", "hotel");
      router.push("/Q&A");
    }
  };

  return (
    <div className="flight-hotel-container" style={{ paddingTop: "64px" }}>
      <motion.div
        className="search-container"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="search-form">
          <div className="search-row">
            <div className="search-field">
              <label>
                <FaMapMarkerAlt className="field-icon" /> Điểm đến
              </label>
              <div className="input-container">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  placeholder="Chưa chọn điểm đến"
                  disabled
                />
              </div>
            </div>

            <div className="search-field">
              <label>
                <FaCalendarAlt className="field-icon" /> Ngày nhận phòng
              </label>
              <input
                type="date"
                value={checkInDate || "Chưa chọn"}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="date-input"
                disabled
              />
            </div>

            <button
              className="search-button"
              onClick={handleSearchHotels}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <FaSearch className="search-icon" />
                  Tìm kiếm
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {recommendedHotels.length > 0 && (
        <motion.section
          className="results-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-header">
            <h2>Khách Sạn Được Đề Xuất</h2>
            <p>Tại {destinationInput}</p>
          </div>

          <motion.div
            className="hotels-grid"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ staggerChildren: 0.2 }}
          >
            {recommendedHotels.map((hotel) => (
              <motion.div
                key={hotel.id}
                className="hotel-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                onClick={() => handleHotelSelect(hotel)}
              >
                <div className="hotel-image">
                  <Image
                    src={hotel.img_origin || "/placeholder.svg"}
                    alt={hotel.name}
                    width={600}
                    height={400}
                    onError={handleImageError}
                    className="img-cover"
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
                        ★
                      </span>
                    ))}
                    <span className="rating-number">
                      {hotel.location_rating}
                    </span>
                  </div>

                  <p className="hotel-description">
                    {hotel.description.length > 100
                      ? hotel.description.substring(0, 100) + "..."
                      : hotel.description}
                  </p>

                  <div className="hotel-footer">
                    <div className="hotel-price">
                      {hotel.price}
                      <span>/đêm</span>
                    </div>
                    <button className="view-button">Chọn</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}
    </div>
  );
};

export default Hotel;
