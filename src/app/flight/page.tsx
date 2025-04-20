"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaPlane,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import "../../app/styles/flight_hotel.css";

interface Flight {
  outbound_flight_code: string;
  cabin: string;
  outbound_time: string;
  fare_basis: string;
  base_price_vnd: string;
  total_price_vnd: string;
}

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

const Flight = () => {
  const router = useRouter();
  const [departureInput, setDepartureInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [flightDate, setFlightDate] = useState("");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const departureDropdownRef = useRef<HTMLDivElement>(null);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);

  const vietnamProvinces = [
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Định",
    "Bình Dương",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cần Thơ",
    "Cao Bằng",
    "Đà Nẵng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Nội",
    "Hà Tĩnh",
    "Hải Dương",
    "Hải Phòng",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Huế",
    "Tiền Giang",
    "Hồ Chí Minh",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
  ];

  useEffect(() => {
    const loadSessionData = () => {
      const sessionData = localStorage.getItem("travelSession");
      if (sessionData) {
        const { province, dates } = JSON.parse(sessionData);
        setDestinationInput(province || "");
        if (dates) {
          setFlightDate(dates.start_day || "");
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

      if (!flightResponse.ok) {
        throw new Error("Không thể lấy danh sách chuyến bay");
      }

      const flightData = await flightResponse.json();
      if (flightData && Array.isArray(flightData) && flightData.length > 0) {
        setFlights(flightData);
      } else {
        const sampleFlights: Flight[] = [
          {
            outbound_flight_code: `VN${Math.floor(Math.random() * 1000)}`,
            cabin: "Economy",
            outbound_time: "08:30",
            fare_basis: "Economy Flex",
            base_price_vnd: "1,200,000 VND",
            total_price_vnd: "1,500,000 VND",
          },
          {
            outbound_flight_code: `VJ${Math.floor(Math.random() * 1000)}`,
            cabin: "Business",
            outbound_time: "12:15",
            fare_basis: "Business Flex",
            base_price_vnd: "2,500,000 VND",
            total_price_vnd: "3,200,000 VND",
          },
        ];
        setFlights(sampleFlights);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm chuyến bay:", error);
      const sampleFlights: Flight[] = [
        {
          outbound_flight_code: `VN${Math.floor(Math.random() * 1000)}`,
          cabin: "Economy",
          outbound_time: "08:30",
          fare_basis: "Economy Flex",
          base_price_vnd: "1,200,000 VND",
          total_price_vnd: "1,500,000 VND",
        },
      ];
      setFlights(sampleFlights);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlightSelect = async (flight: Flight) => {
    const sessionData = localStorage.getItem("travelSession");
    const updatedSession = sessionData
      ? { ...JSON.parse(sessionData), flight }
      : { flight };
    localStorage.setItem("travelSession", JSON.stringify(updatedSession));

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/recommend/select-flight/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flight_info: flight }), // Sửa ở đây
        }
      );

      if (!response.ok) {
        throw new Error("Không thể lưu lựa chọn chuyến bay");
      }

      localStorage.setItem("completedStep", "flight");
      router.push("/Q&A");
    } catch (error) {
      console.error("Lỗi khi lưu chuyến bay:", error);
      localStorage.setItem("completedStep", "flight");
      router.push("/Q&A");
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
    const exactMatches = vietnamProvinces.filter(
      (province) => province.toLowerCase() === input.toLowerCase()
    );
    const startsWithMatches = vietnamProvinces.filter(
      (province) =>
        province.toLowerCase().startsWith(input.toLowerCase()) &&
        !exactMatches.includes(province)
    );
    const containsMatches = vietnamProvinces.filter(
      (province) =>
        province.toLowerCase().includes(input.toLowerCase()) &&
        !exactMatches.includes(province) &&
        !startsWithMatches.includes(province)
    );
    return [...exactMatches, ...startsWithMatches, ...containsMatches].slice(
      0,
      10
    );
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
                    {getFilteredProvinces(departureInput).map(
                      (province, index) => (
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
                      )
                    )}
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
                  placeholder="Chưa chọn điểm đến"
                  onFocus={() => setShowDestinationDropdown(true)}
                  className={showDestinationDropdown ? "active-input" : ""}
                  disabled
                />
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
                value={flightDate || "Chưa chọn"}
                onChange={(e) => setFlightDate(e.target.value)}
                className="date-input"
                disabled
              />
            </div>

            <button
              className="search-button"
              onClick={handleSearchFlight}
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

      {flights.length > 0 && (
        <motion.section
          className="results-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-header">
            <h2>Kết Quả Tìm Kiếm Chuyến Bay</h2>
            <p>
              Từ {departureInput} đến {destinationInput}
            </p>
          </div>

          <motion.div
            className="results-grid"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ staggerChildren: 0.2 }}
          >
            {flights.map((flight, index) => (
              <motion.div
                key={index}
                className="flight-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
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
                        <span className="point-city">{departureInput}</span>
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
                      <span className="detail-value">
                        {flight.base_price_vnd}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flight-footer">
                  <div className="flight-price">{flight.total_price_vnd}</div>
                  <button
                    className="select-button"
                    onClick={() => handleFlightSelect(flight)}
                  >
                    Chọn
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}
    </div>
  );
};

export default Flight;
