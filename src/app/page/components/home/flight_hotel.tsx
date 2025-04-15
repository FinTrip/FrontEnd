"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaPlane,
  FaHotel,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSearch,
  FaSuitcase,
  FaUmbrellaBeach,
  FaQuestionCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import "./flight_hotel.css";

// Interface cho HotelCard
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

// Các hiệu ứng animation
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const slideUp = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", damping: 15, stiffness: 100 },
  },
};

const slideRight = {
  hidden: { x: -30, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 15, stiffness: 100 },
  },
};

// Component gợi ý địa điểm với highlight từ khóa
const LocationSuggestionItem = ({
  province,
  searchText,
  onClick,
  isSelected = false,
}: {
  province: string;
  searchText: string;
  onClick: (e: React.MouseEvent) => void;
  isSelected?: boolean;
}) => {
  const itemClassName = `dropdown-item ${isSelected ? "selected-item" : ""}`;

  if (!searchText) {
    return (
      <div className={itemClassName} onClick={onClick}>
        <FaMapMarkerAlt className="dropdown-icon" />
        {province}
      </div>
    );
  }

  const index = province.toLowerCase().indexOf(searchText.toLowerCase());
  if (index === -1) {
    return (
      <div className={itemClassName} onClick={onClick}>
        <FaMapMarkerAlt className="dropdown-icon" />
        {province}
      </div>
    );
  }

  return (
    <div className={itemClassName} onClick={onClick}>
      <FaMapMarkerAlt className="dropdown-icon" />
      {province.substring(0, index)}
      <span className="match-highlight">
        {province.substring(index, index + searchText.length)}
      </span>
      {province.substring(index + searchText.length)}
    </div>
  );
};

const FlightHotel = () => {
  const router = useRouter();
  const [selectedHotel, setSelectedHotel] = useState<HotelCard | null>(null);
  const [showHotelDetail, setShowHotelDetail] = useState(false);
  const [departureInput, setDepartureInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [flightDate, setFlightDate] = useState("");
  const [flights, setFlights] = useState<any[]>([]);
  const [recommendedHotels, setRecommendedHotels] = useState<HotelCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("flight");

  const departureDropdownRef = useRef<HTMLDivElement>(null);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);

  const vietnamProvinces = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
    "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
    "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng",
    "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp",
    "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh",
    "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên",
    "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng",
    "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An",
    "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình",
    "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
    "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
    "Huế", "Tiền Giang", "Hồ Chí Minh", "Trà Vinh", "Tuyên Quang",
    "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
  ];

  const handleHotelClick = (hotel: HotelCard) => {
    setSelectedHotel(hotel);
    setShowHotelDetail(true);
  };

  const handleCloseHotelDetail = () => {
    setShowHotelDetail(false);
    setSelectedHotel(null);
  };

  const handleDepartureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDepartureInput(value);
    if (!showDepartureDropdown) setShowDepartureDropdown(true);
    const exactMatch = vietnamProvinces.find(
      (province) => province.toLowerCase() === value.toLowerCase()
    );
    if (exactMatch) setDepartureInput(exactMatch);
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationInput(value);
    if (!showDestinationDropdown) setShowDestinationDropdown(true);
    const exactMatch = vietnamProvinces.find(
      (province) => province.toLowerCase() === value.toLowerCase()
    );
    if (exactMatch) setDestinationInput(exactMatch);
  };

  const handleProvinceSelect = (
    province: string,
    type: "departure" | "destination"
  ) => {
    if (type === "departure") {
      setDepartureInput(province);
      setTimeout(() => setShowDepartureDropdown(false), 150);
    } else {
      setDestinationInput(province);
      setTimeout(() => setShowDestinationDropdown(false), 150);
    }
  };

  const handleSearchFlight = async () => {
    setIsLoading(true);
    setFlights([]);
    setRecommendedHotels([]);

    if (!departureInput || !destinationInput || !flightDate) {
      alert("Vui lòng nhập đầy đủ thông tin điểm đi, điểm đến và ngày đi");
      setIsLoading(false);
      return;
    }

    const flightPayload = {
      origin: departureInput,
      destination: destinationInput,
      departure_date: flightDate,
    };

    try {
      const flightResponse = await fetch(
        "http://127.0.0.1:8000/recommend/rcm-flight/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flightPayload),
        }
      );
      const flightData = await flightResponse.json();

      if (flightData && Array.isArray(flightData) && flightData.length > 0) {
        setFlights(flightData);
      } else {
        alert("Không tìm thấy chuyến bay nào.");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm chuyến bay:", error);
      alert("Có lỗi xảy ra khi tìm kiếm chuyến bay.");
    } finally {
      await handleSearchHotels();
      setIsLoading(false);
    }
  };

  const handleSearchHotels = async () => {
    try {
      setIsLoading(true);
      const hotelPayload = {
        destination: destinationInput,
        checkInDate: flightDate,
        adults: 2,
        nights: 1,
      };

      const hotelResponse = await fetch(
        "http://127.0.0.1:8000/recommend/rcm-hotel/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hotelPayload),
        }
      );
      const hotelData = await hotelResponse.json();

      if (hotelData && hotelData.hotels && hotelData.hotels.length > 0) {
        setRecommendedHotels(hotelData.hotels);
      } else {
        alert("Không tìm thấy khách sạn nào.");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm khách sạn:", error);
      alert("Có lỗi xảy ra khi tìm kiếm khách sạn.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFlight = async (flight: any) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/recommend/select-flight/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flight_info: flight }),
        }
      );
      if (response.ok) {
        alert("Chuyến bay đã được chọn và lưu vào session.");
      } else {
        alert("Có lỗi xảy ra khi lưu chuyến bay.");
      }
    } catch (error) {
      console.error("Lỗi khi chọn chuyến bay:", error);
      alert("Có lỗi xảy ra khi lưu chuyến bay.");
    }
  };

  const handleSelectHotel = async (hotel: HotelCard) => {
    try {
      // Kiểm tra dữ liệu hotel trước khi gửi
      if (!hotel || !hotel.id || !hotel.name) {
        alert("Dữ liệu khách sạn không hợp lệ. Vui lòng kiểm tra lại.");
        return;
      }

      // Lấy CSRF token từ cookie
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

      if (!csrfToken) {
        alert("Không tìm thấy CSRF token. Vui lòng kiểm tra lại cấu hình.");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/recommend/select_hotel/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken, // Thêm CSRF token vào header
        },
        body: JSON.stringify({ hotel_info: hotel }), // Gửi dữ liệu hotel_info
      });

      const data = await response.json();

      if (response.ok) {
        // Thành công (status 200)
        alert("Khách sạn đã được chọn và lưu vào session.");
      } else {
        // Lỗi từ server (status 400, 403, 500, v.v.)
        alert(`Có lỗi xảy ra khi lưu khách sạn: ${data.error || "Không rõ chi tiết lỗi"}`);
      }
    } catch (error) {
      // Lỗi mạng hoặc ngoại lệ khác
      console.error("Lỗi khi chọn khách sạn:", error);
      alert("Có lỗi xảy ra khi lưu khách sạn. Vui lòng kiểm tra kết nối mạng.");
    }
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    if (!target.src.includes("placeholder.svg")) {
      target.src = "/placeholder.svg";
      target.onerror = null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        departureDropdownRef.current &&
        !departureDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDepartureDropdown(false);
      }
      if (
        destinationDropdownRef.current &&
        !destinationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDestinationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFilteredProvinces = (input: string) => {
    if (!input) return vietnamProvinces.slice(0, 5);
    return vietnamProvinces
      .filter((province) => province.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 10);
  };

  return (
    <div className="flight-hotel-container">
      {/* Hero Section */}
      <motion.div className="hero-section" initial="hidden" animate="visible" variants={fadeIn}>
        <div className="hero-overlay"></div>
        <div className="floating-elements">
          <motion.div
            className="floating-element plane-1"
            animate={{ x: [0, 100, 200, 100, 0], y: [0, 30, 0, -30, 0], rotate: [0, 5, 0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          >
            <FaPlane size={60} />
          </motion.div>
          <motion.div
            className="floating-element plane-2"
            animate={{
              x: [200, 100, 0, -100, -200, -100, 0, 100, 200],
              y: [50, 30, 0, -30, 0, 30, 60, 30, 50],
              rotate: [10, 5, 0, -5, -10, -5, 0, 5, 10],
            }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          >
            <FaPlane size={40} />
          </motion.div>
          <motion.div
            className="floating-element hotel-1"
            animate={{ y: [0, 15, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            <FaHotel size={70} />
          </motion.div>
          <motion.div
            className="floating-element beach"
            animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          >
            <FaUmbrellaBeach size={50} />
          </motion.div>
          <motion.div
            className="floating-element suitcase"
            animate={{ y: [0, -15, 0], x: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          >
            <FaSuitcase size={45} />
          </motion.div>
        </div>

        <div className="hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="hero-title">Khám Phá Điểm Đến Mơ Ước</h1>
            <p className="hero-subtitle">Tìm kiếm chuyến bay và khách sạn cho chuyến đi của bạn</p>
          </motion.div>
          <motion.div className="hero-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Khách sạn</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Điểm đến</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Hỗ trợ</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Search Section */}
      <motion.div className="search-container" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideUp}>
        <div className="search-tabs">
          <button className={`tab-button ${activeTab === "flight" ? "active" : ""}`} onClick={() => setActiveTab("flight")}>
            <FaPlane className="tab-icon" />
            <span>Chuyến bay & Khách sạn</span>
          </button>
          <button className={`tab-button ${activeTab === "hotel" ? "active" : ""}`} onClick={() => setActiveTab("hotel")}>
            <FaHotel className="tab-icon" />
            <span>Chỉ khách sạn</span>
          </button>
        </div>

        <div className="search-form">
          <div className="search-row">
            <div className="search-field">
              <label>
                <FaMapMarkerAlt className="field-icon" /> Điểm đi
              </label>
              <div className="input-container" ref={departureDropdownRef}>
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  value={departureInput}
                  onChange={handleDepartureChange}
                  placeholder="Chọn điểm khởi hành"
                  onFocus={() => setShowDepartureDropdown(true)}
                  className={showDepartureDropdown ? "active-input" : ""}
                />
                {showDepartureDropdown && (
                  <div className="dropdown-menu">
                    {getFilteredProvinces(departureInput).map((province, index) => (
                      <LocationSuggestionItem
                        key={index}
                        province={province}
                        searchText={departureInput}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProvinceSelect(province, "departure");
                        }}
                        isSelected={province === departureInput}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="search-field">
              <label>
                <FaMapMarkerAlt className="field-icon" /> Điểm đến
              </label>
              <div className="input-container" ref={destinationDropdownRef}>
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  value={destinationInput}
                  onChange={handleDestinationChange}
                  placeholder="Chọn điểm đến"
                  onFocus={() => setShowDestinationDropdown(true)}
                  className={showDestinationDropdown ? "active-input" : ""}
                />
                {showDestinationDropdown && (
                  <div className="dropdown-menu">
                    {getFilteredProvinces(destinationInput).map((province, index) => (
                      <LocationSuggestionItem
                        key={index}
                        province={province}
                        searchText={destinationInput}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProvinceSelect(province, "destination");
                        }}
                        isSelected={province === destinationInput}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="search-row">
            <div className="search-field">
              <label>
                <FaCalendarAlt className="field-icon" /> Ngày đi
              </label>
              <input
                type="date"
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
                className="date-input"
              />
            </div>
            <button className="search-button" onClick={handleSearchFlight} disabled={isLoading}>
              {isLoading ? <div className="loading-spinner"></div> : (
                <>
                  <FaSearch className="search-icon" />
                  Tìm kiếm
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Popular Destinations */}
      <motion.section className="popular-destinations" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
        <div className="section-header">
          <h2>Điểm Đến Phổ Biến</h2>
          <p>Khám phá những điểm đến được yêu thích nhất tại Việt Nam</p>
        </div>
        <motion.div className="destinations-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div className="destination-card" variants={slideUp}>
            <div className="destination-image">
              <Image src="https://i.pinimg.com/736x/c8/6c/0a/c86c0ae0fb335d348bb24b0e8ae2bb73.jpg" alt="Đà Nẵng" width={600} height={400} className="img-cover" />
              <div className="destination-overlay">
                <h3>Đà Nẵng</h3>
                <p>Thành phố của những cây cầu</p>
              </div>
            </div>
          </motion.div>
          <motion.div className="destination-card" variants={slideUp}>
            <div className="destination-image">
              <Image src="https://i.pinimg.com/736x/d4/33/3f/d4333f98a2aff25837708d84847ebee5.jpg" alt="Hà Nội" width={600} height={400} className="img-cover" />
              <div className="destination-overlay">
                <h3>Hà Nội</h3>
                <p>Thủ đô ngàn năm văn hiến</p>
              </div>
            </div>
          </motion.div>
          <motion.div className="destination-card" variants={slideUp}>
            <div className="destination-image">
              <Image src="https://i.pinimg.com/736x/23/67/ce/2367ce2b72eb90da3ec983bf605ca36e.jpg" alt="Hồ Chí Minh" width={600} height={400} className="img-cover" />
              <div className="destination-overlay">
                <h3>Hồ Chí Minh</h3>
                <p>Thành phố không ngủ</p>
              </div>
            </div>
          </motion.div>
          <motion.div className="destination-card" variants={slideUp}>
            <div className="destination-image">
              <Image src="https://i.pinimg.com/736x/bd/b3/06/bdb3065fbfc55969e85606b203f08501.jpg" alt="Huế" width={600} height={400} className="img-cover" />
              <div className="destination-overlay">
                <h3>Huế</h3>
                <p>Cố đô lịch sử</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Flight Results */}
      {flights.length > 0 && (
        <motion.section className="results-section" initial="hidden" animate="visible" variants={fadeIn}>
          <div className="section-header">
            <h2>Kết Quả Tìm Kiếm Chuyến Bay</h2>
            <p>Từ {departureInput} đến {destinationInput}</p>
          </div>
          <motion.div className="results-grid" variants={staggerContainer} initial="hidden" animate="visible">
            {flights.map((flight, index) => (
              <motion.div key={index} className="flight-card" variants={slideUp}>
                <div className="flight-header">
                  <div className="flight-code">{flight.outbound_flight_code}</div>
                  <div className="flight-class">{flight.cabin}</div>
                </div>
                <div className="flight-body">
                  <div className="flight-route">
                    <div className="route-point">
                      <div className="point-marker departure"></div>
                      <div className="point-details">
                        <span className="point-city">{departureInput}</span>
                        <span className="point-time">{flight.outbound_time}</span>
                      </div>
                    </div>
                    <div className="route-line">
                      <FaPlane className="route-plane" />
                    </div>
                    <div className="route-point">
                      <div className="point-marker arrival"></div>
                      <div className="point-details">
                        <span className="point-city">{destinationInput}</span>
                        <span className="point-time">Arrival</span>
                      </div>
                    </div>
                  </div>
                  <div className="flight-details">
                    <div className="detail-item">
                      <span className="detail-label">Loại vé:</span>
                      <span className="detail-value">{flight.fare_basis}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Giá cơ bản:</span>
                      <span className="detail-value">{flight.base_price_vnd}</span>
                    </div>
                  </div>
                </div>
                <div className="flight-footer">
                  <div className="flight-price">{flight.total_price_vnd}</div>
                  <button className="select-button" onClick={() => handleSelectFlight(flight)}>
                    Chọn
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Recommended Hotels */}
      {recommendedHotels.length > 0 && (
        <motion.section className="results-section" initial="hidden" animate="visible" variants={fadeIn}>
          <div className="section-header">
            <h2>Khách Sạn Được Đề Xuất</h2>
            <p>Tại {destinationInput}</p>
          </div>
          <motion.div className="hotels-grid" variants={staggerContainer} initial="hidden" animate="visible">
            {recommendedHotels.map((hotel, index) => {
              const imageUrls = hotel.img_origin ? hotel.img_origin.split(/, */) : [];
              const displayImage = imageUrls.length > 0 ? imageUrls[0] : "/placeholder.svg";

              return (
                <motion.div key={index} className="hotel-card" variants={slideUp} onClick={() => handleHotelClick(hotel)}>
                  <div className="hotel-image">
                    <Image
                      src={displayImage}
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
                      {Array.from({ length: Math.floor(hotel.location_rating) }).map((_, i) => (
                        <span key={i} className="star-icon">★</span>
                      ))}
                      <span className="rating-number">{hotel.location_rating}</span>
                    </div>
                    <p className="hotel-description">
                      {hotel.description.length > 100 ? hotel.description.substring(0, 100) + "..." : hotel.description}
                    </p>
                    <div className="hotel-footer">
                      <div className="hotel-price">
                        {hotel.price}
                        <span>/đêm</span>
                      </div>
                      <button className="view-button" onClick={(e) => { e.stopPropagation(); handleSelectHotel(hotel); }}>
                        Chọn địa điểm này
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>
      )}

      {/* Hotel Detail Modal */}
      {showHotelDetail && selectedHotel && (() => {
        const imageUrlsModal = selectedHotel.img_origin ? selectedHotel.img_origin.split(/, */) : [];
        const displayImageModal = imageUrlsModal.length > 0 ? imageUrlsModal[0] : "/placeholder.svg";

        return (
          <motion.div className="hotel-detail-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="modal-overlay" onClick={handleCloseHotelDetail}></div>
            <motion.div className="modal-content" initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", damping: 25 }}>
              <button className="modal-close" onClick={handleCloseHotelDetail}>×</button>
              <div className="modal-header">
                <Image
                  src={displayImageModal}
                  alt={selectedHotel.name}
                  width={800}
                  height={400}
                  onError={handleImageError}
                  className="modal-image"
                />
                <div className="modal-title">
                  <h2>{selectedHotel.name}</h2>
                  <div className="modal-subtitle">
                    <span className="hotel-class">{selectedHotel.hotel_class}</span>
                    <span className="location">
                      <FaMapMarkerAlt /> {selectedHotel.name_nearby_place}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-body">
                <div className="modal-description">
                  <h3>Thông tin</h3>
                  <p>{selectedHotel.description}</p>
                </div>
                <div className="modal-amenities">
                  <h3>Tiện nghi</h3>
                  <div className="amenities-grid">
                    {selectedHotel.amenities.map((amenity, index) => (
                      <div key={index} className="amenity-item">
                        <div className="amenity-icon">✓</div>
                        <div className="amenity-name">{amenity}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-price-section">
                  <div className="price-box">
                    <div className="price-label">Giá mỗi đêm từ</div>
                    <div className="price-value">{selectedHotel.price}</div>
                    <div className="price-includes">Đã bao gồm thuế và phí</div>
                  </div>
                  <button className="book-button" onClick={() => handleSelectHotel(selectedHotel)}>
                    Chọn địa điểm này
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })()}
      <motion.section 
        className="plan-assistance-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="plan-assistance-decoration decoration-1"></div>
        <div className="plan-assistance-decoration decoration-2"></div>
        
        <motion.div 
          className="plan-assistance-container"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div 
            className="plan-assistance-content"
            variants={slideUp}
          >
            <h2 className="plan-assistance-title">Sẵn sàng cho chuyến đi của bạn?</h2>
            <p className="plan-assistance-text">
              Hãy để chúng tôi giúp bạn lập kế hoạch cho một chuyến đi hoàn hảo. 
              Từ việc chọn điểm đến, đặt chỗ ở đến lịch trình chi tiết - tất cả đều được cá nhân hóa theo sở thích của bạn.
            </p>
            <Link href="/Q&A">
              <motion.div 
                className="plan-assistance-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaQuestionCircle className="plan-assistance-icon" />
                <span>Bắt đầu lập kế hoạch ngay</span>
              </motion.div>
            </Link>
          </motion.div>
          
          <motion.div 
            className="plan-assistance-image"
            variants={slideRight}
          >
            <img 
              src="https://i.pinimg.com/736x/33/df/4c/33df4cda6c650782b67d2e53d717cc05.jpg" 
              alt="Plan your trip"
              className="rounded-lg shadow-xl"
              style={{ maxWidth: "400px", width: "100%" }}
            />
          </motion.div>
        </motion.div>
      </motion.section>
      {/* <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          { <Link href="/Q&A">
            <div className="qa-navigation-button">
              <FaQuestionCircle className="qa-icon" />
              <span className="qa-text">Hỗ trợ lập kế hoạch</span>
            </div>
          </Link> }
        </motion.div>
      </AnimatePresence> */}
    </div>
  );
};

export default FlightHotel;