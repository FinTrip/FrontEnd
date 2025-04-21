"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaCheck,
  FaLeaf,
  FaUmbrellaBeach,
  FaMountain,
  FaLandmark,
  FaPlane,
  FaHotel,
} from "react-icons/fa";
import "../../app/styles/Q&A.css";

const QA = () => {
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const savedQuestion = localStorage.getItem("currentQuestion");
    return savedQuestion ? parseInt(savedQuestion, 10) : 0;
  });
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [cityInput, setCityInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();

  // Load data from localStorage and travelSession on mount
  useEffect(() => {
    const loadData = () => {
      // Load travelSession first to restore dateRange and selectedCities
      const sessionData = localStorage.getItem("travelSession");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.dates) {
          setDateRange({
            start: session.dates.start_day || "",
            end: session.dates.end_day || "",
          });
        }
        if (session.province) {
          setSelectedCities([session.province]);
        }
      }

      // Load selectedCities from localStorage as fallback
      const savedCities = localStorage.getItem("selectedCities");
      if (savedCities) {
        const parsedCities = JSON.parse(savedCities);
        if (Array.isArray(parsedCities) && parsedCities.length > 0) {
          setSelectedCities(parsedCities);
        }
      }

      // Load dateRange from localStorage as fallback
      const savedDateRange = localStorage.getItem("dateRange");
      if (savedDateRange) {
        const parsedDateRange = JSON.parse(savedDateRange);
        if (parsedDateRange.start || parsedDateRange.end) {
          setDateRange({
            start: parsedDateRange.start || "",
            end: parsedDateRange.end || "",
          });
        }
      }

      // Load completed step
      const completedStep = localStorage.getItem("completedStep");
      if (completedStep === "flight") {
        setCurrentQuestion(3);
        localStorage.removeItem("completedStep");
      } else if (completedStep === "hotel") {
        setCurrentQuestion(4);
        localStorage.removeItem("completedStep");
      }
    };

    // Load initial data
    loadData();

    // Listen for changes in localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === "selectedCities" ||
        event.key === "dateRange" ||
        event.key === "travelSession"
      ) {
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("currentQuestion", currentQuestion.toString());
    localStorage.setItem("selectedCities", JSON.stringify(selectedCities));
    localStorage.setItem("dateRange", JSON.stringify(dateRange));
  }, [currentQuestion, selectedCities, dateRange]);

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

  const questions = [
    {
      question: "Bạn dự định đi trong khoảng thời gian nào?",
      type: "date",
      icon: <FaCalendarAlt />,
      description: "Chọn ngày bắt đầu và kết thúc chuyến đi của bạn",
    },
    {
      question: "Địa điểm bạn muốn đi từ đâu đến đâu?",
      type: "location",
      icon: <FaMapMarkerAlt />,
      description: "Chọn các tỉnh thành bạn muốn ghé thăm",
    },
    {
      question: "Chọn phương tiện?",
      type: "transport",
      icon: <FaPlane />,
      description: "Bạn có muốn chọn chuyến bay không?",
      options: ["Có", "Không"],
    },
    {
      question: "Chọn hotel cho chuyến đi?",
      type: "hotel",
      icon: <FaHotel />,
      description: "Bạn có muốn chọn khách sạn không?",
      options: ["Có", "Không"],
    },
    {
      question: "Xác nhận thông tin chuyến đi",
      type: "confirm",
      icon: <FaCheck />,
      description: "Vui lòng kiểm tra lại thông tin trước khi tạo kế hoạch",
    },
  ];

  const handleDateChange = (type: "start" | "end", value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityInput(e.target.value);
  };

  const filteredCities = vietnamProvinces.filter((city) =>
    city.toLowerCase().includes(cityInput.toLowerCase())
  );

  const handleNextQuestion = async () => {
    if (currentQuestion === 0) {
      if (!dateRange.start || !dateRange.end) {
        alert("Vui lòng chọn ngày đi và ngày về trước khi tiếp tục!");
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/recommend/set-dates/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              start_day: dateRange.start,
              end_day: dateRange.end,
            }),
          }
        );
        if (!response.ok) throw new Error("Failed to set dates");
        const sessionData = localStorage.getItem("travelSession");
        const updatedSession = sessionData
          ? {
              ...JSON.parse(sessionData),
              dates: { start_day: dateRange.start, end_day: dateRange.end },
            }
          : { dates: { start_day: dateRange.start, end_day: dateRange.end } };
        localStorage.setItem("travelSession", JSON.stringify(updatedSession));
      } catch (error) {
        console.error("Error setting dates:", error);
      }
    } else if (currentQuestion === 1) {
      if (selectedCities.length === 0) {
        alert("Vui lòng chọn ít nhất một điểm đến trước khi tiếp tục!");
        return;
      }

      try {
        const province = selectedCities[0];
        const response = await fetch(
          "http://127.0.0.1:8000/recommend/set-province/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ province: province.toLowerCase() }),
          }
        );
        if (!response.ok) throw new Error("Failed to set province");
        const sessionData = localStorage.getItem("travelSession");
        const updatedSession = sessionData
          ? {
              ...JSON.parse(sessionData),
              province: province.toLowerCase(),
            }
          : { province: province.toLowerCase() };
        localStorage.setItem("travelSession", JSON.stringify(updatedSession));
      } catch (error) {
        console.error("Error setting province:", error);
      }
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCities((prev) => {
      if (prev.includes(city)) {
        return prev.filter((c) => c !== city);
      } else {
        return [...prev, city];
      }
    });
    setCityInput("");
  };

  const handleRemoveCity = (city: string) => {
    setSelectedCities((prev) => prev.filter((c) => c !== city));
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    if (currentQuestion === 2) {
      if (option === "Có") {
        router.push("/flight");
      } else {
        setCurrentQuestion(3);
      }
    } else if (currentQuestion === 3) {
      if (option === "Có") {
        router.push("/hotel");
      } else {
        setCurrentQuestion(4);
      }
    }
  };

  const handleComplete = async () => {
    const sessionData = localStorage.getItem("travelSession");
    const session = sessionData ? JSON.parse(sessionData) : {};

    if (
      !session.dates?.start_day ||
      !session.dates?.end_day ||
      !session.province
    ) {
      alert("Vui lòng nhập đầy đủ thông tin ngày đi, ngày về và điểm đến!");
      setCurrentQuestion(0);
      return;
    }

    setShowSuccessMessage(true);
    const requestBody = {
      start_day: session.dates.start_day,
      end_day: session.dates.end_day,
      province: session.province,
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/recommend/travel-schedule/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch travel schedule");

      const data = await response.json();
      localStorage.setItem("travelSchedule", JSON.stringify(data));
      // Xóa dữ liệu sau khi hoàn thành và điều hướng
      localStorage.removeItem("currentQuestion");
      localStorage.removeItem("selectedCities");
      localStorage.removeItem("dateRange");
      localStorage.removeItem("travelSession");
      setTimeout(() => {
        router.push("/plan");
      }, 2500);
    } catch (error) {
      console.error("Error fetching travel schedule:", error);
      setShowSuccessMessage(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    initial: { y: 30, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const floatingElements = [
    { icon: <FaLeaf />, className: "floating-element leaf-1" },
    { icon: <FaUmbrellaBeach />, className: "floating-element beach-1" },
    { icon: <FaMountain />, className: "floating-element mountain-1" },
    { icon: <FaLandmark />, className: "floating-element landmark-1" },
    { icon: <FaLeaf />, className: "floating-element leaf-2" },
  ];

  return (
    <div className="qa-container" style={{ paddingTop: "64px" }}>
      <div className="vietnam-pattern-overlay"></div>
      <div className="lantern lantern-left"></div>
      <div className="lantern lantern-right"></div>

      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className={element.className}
          initial={{ y: 0 }}
          animate={{
            y: [0, -15, 0],
            rotate: index % 2 === 0 ? [0, 5, 0] : [0, -5, 0],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 3 + index,
            ease: "easeInOut",
          }}
        >
          {element.icon}
        </motion.div>
      ))}

      <div className="vietnam-banner">
        <div className="banner-content">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Khám Phá Việt Nam
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Hãy bắt đầu hành trình khám phá vẻ đẹp của đất nước hình chữ S
          </motion.p>
        </div>
      </div>

      <motion.div
        className="qa-card"
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
        <div className="card-decoration top-left"></div>
        <div className="card-decoration top-right"></div>
        <div className="card-decoration bottom-left"></div>
        <div className="card-decoration bottom-right"></div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="question-container"
          >
            <motion.div className="question-header" variants={itemVariants}>
              <div className="question-icon-wrapper">
                {questions[currentQuestion].icon}
              </div>
              <h2>{questions[currentQuestion].question}</h2>
              <p className="question-description">
                {questions[currentQuestion].description}
              </p>
            </motion.div>

            {questions[currentQuestion].type === "date" ? (
              <motion.div
                className="date-range-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="date-input-group"
                  variants={itemVariants}
                >
                  <label>Ngày đi:</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        handleDateChange("start", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <span className="input-icon">
                      <FaCalendarAlt />
                    </span>
                  </div>
                </motion.div>
                <motion.div
                  className="date-input-group"
                  variants={itemVariants}
                >
                  <label>Ngày về:</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => handleDateChange("end", e.target.value)}
                      min={
                        dateRange.start ||
                        new Date().toISOString().split("T")[0]
                      }
                    />
                    <span className="input-icon">
                      <FaCalendarAlt />
                    </span>
                  </div>
                </motion.div>
                <motion.button
                  className="next-button"
                  onClick={handleNextQuestion}
                  disabled={!dateRange.start || !dateRange.end}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  variants={itemVariants}
                >
                  Tiếp theo <FaArrowRight />
                </motion.button>
              </motion.div>
            ) : questions[currentQuestion].type === "location" ? (
              <motion.div
                className="location-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="location-input-group"
                  variants={itemVariants}
                >
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Nhập tên tỉnh thành..."
                      value={cityInput}
                      onChange={handleCityInputChange}
                      className="city-input"
                    />
                    <span className="input-icon">
                      <FaMapMarkerAlt />
                    </span>
                  </div>
                  {cityInput && (
                    <div className="suggestions-dropdown">
                      {filteredCities.map((city) => (
                        <motion.div
                          key={city}
                          className="suggestion-item"
                          onClick={() => handleCitySelect(city)}
                          whileHover={{
                            backgroundColor: "rgba(208, 40, 40, 0.1)",
                            x: 5,
                          }}
                        >
                          {city}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
                <motion.div className="selected-cities" variants={itemVariants}>
                  <AnimatePresence>
                    {selectedCities.map((city) => (
                      <motion.span
                        key={city}
                        className="city-badge"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {city}
                        <span
                          className="remove"
                          onClick={() => handleRemoveCity(city)}
                        >
                          ×
                        </span>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </motion.div>
                {selectedCities.length > 0 && (
                  <motion.button
                    className="next-button"
                    onClick={handleNextQuestion}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    variants={itemVariants}
                  >
                    Tiếp theo <FaArrowRight />
                  </motion.button>
                )}
              </motion.div>
            ) : questions[currentQuestion].type === "transport" ||
              questions[currentQuestion].type === "hotel" ? (
              <motion.div
                className="qa-options"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {questions[currentQuestion].options?.map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    whileHover={{ scale: 1.03, x: 5 }}
                    whileTap={{ scale: 0.97 }}
                    variants={itemVariants}
                    className={selectedOption === option ? "selected" : ""}
                  >
                    <span>{option}</span>
                  </motion.button>
                ))}
              </motion.div>
            ) : questions[currentQuestion].type === "confirm" ? (
              <motion.div
                className="confirm-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <p>
                    <strong>Ngày đi:</strong>{" "}
                    {(() => {
                      const sessionData = localStorage.getItem("travelSession");
                      if (sessionData) {
                        const { dates } = JSON.parse(sessionData);
                        return dates?.start_day || "Chưa chọn";
                      }
                      return dateRange.start || "Chưa chọn";
                    })()}
                  </p>
                  <p>
                    <strong>Ngày về:</strong>{" "}
                    {(() => {
                      const sessionData = localStorage.getItem("travelSession");
                      if (sessionData) {
                        const { dates } = JSON.parse(sessionData);
                        return dates?.end_day || "Chưa chọn";
                      }
                      return dateRange.end || "Chưa chọn";
                    })()}
                  </p>
                  <p>
                    <strong>Điểm đến:</strong>{" "}
                    {(() => {
                      const sessionData = localStorage.getItem("travelSession");
                      if (sessionData) {
                        const { province } = JSON.parse(sessionData);
                        return province || "Chưa chọn";
                      }
                      return selectedCities.length > 0
                        ? selectedCities.join(", ")
                        : "Chưa chọn";
                    })()}
                  </p>
                  {(() => {
                    const sessionData = localStorage.getItem("travelSession");
                    if (sessionData) {
                      const { flight, hotel } = JSON.parse(sessionData);
                      return (
                        <>
                          {flight && (
                            <p>
                              <strong>Chuyến bay:</strong>{" "}
                              {flight.outbound_flight_code} - {flight.cabin} -{" "}
                              {flight.total_price_vnd}
                            </p>
                          )}
                          {hotel && (
                            <p>
                              <strong>Khách sạn:</strong> {hotel.name} -{" "}
                              {hotel.price}
                            </p>
                          )}
                        </>
                      );
                    }
                    return null;
                  })()}
                </motion.div>
                <motion.button
                  className="complete-button"
                  onClick={handleComplete}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  variants={itemVariants}
                >
                  Hoàn thành <FaCheck />
                </motion.button>
              </motion.div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="progress-indicator">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${
                index === currentQuestion
                  ? "active"
                  : index < currentQuestion
                  ? "completed"
                  : ""
              }`}
            />
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            className="success-message"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="success-icon">
              <FaCheck />
            </div>
            <p>Đang tạo kế hoạch du lịch tuyệt vời cho bạn...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QA;
