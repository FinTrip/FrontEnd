"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";
import "./Q&A.css";

const QA = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [cityInput, setCityInput] = useState("");
  const [customBudget, setCustomBudget] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();

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
    "Thừa Thiên Huế",
    "Tiền Giang",
    "TP Hồ Chí Minh",
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
    },
    {
      question: "Kinh phí dự định của bạn khoảng bao nhiêu?",
      type: "budget",
      icon: <FaMoneyBillWave />,
      options: [
        "A: 2 triệu đến 3 triệu",
        "B: 4 triệu đến 5 triệu",
        "C: 5 triệu đến 6 triệu",
        "D: Chưa có dự tính",
        "E: Khác",
      ],
    },
    {
      question: "Địa điểm bạn muốn đi từ đâu đến đâu",
      type: "location",
      icon: <FaMapMarkerAlt />,
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

  const handleNextQuestion = () => {
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

  const handleComplete = async () => {
    setShowSuccessMessage(true);

    // Chuẩn bị dữ liệu gửi API
    const requestBody = {
      start_day: dateRange.start,
      end_day: dateRange.end,
      province: selectedCities[0]?.toLowerCase() || "quảng nam", // Lấy tỉnh đầu tiên hoặc mặc định là "quảng nam"
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/recommend/travel-schedule/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch travel schedule");
      }

      const data = await response.json();
      // Lưu dữ liệu vào localStorage
      localStorage.setItem("travelSchedule", JSON.stringify(data));

      // Chuyển hướng sang /plan sau 1.5 giây
      setTimeout(() => {
        router.push("/plan");
      }, 1500);
    } catch (error) {
      console.error("Error fetching travel schedule:", error);
      setShowSuccessMessage(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    if (option === "E: Khác") {
      setCustomBudget("1000000");
    } else {
      handleNextQuestion();
    }
  };

  const handleCustomBudgetSubmit = () => {
    if (parseInt(customBudget) >= 1000000) {
      handleNextQuestion();
      setCustomBudget("");
    }
  };

  return (
    <div className="qa-container">
      <motion.div
        className="qa-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2>
              <span className="question-icon">
                {questions[currentQuestion].icon}
              </span>
              {questions[currentQuestion].question}
            </h2>

            {questions[currentQuestion].type === "date" ? (
              <motion.div
                className="date-range-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="date-input-group">
                  <label>Ngày đi:</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => handleDateChange("start", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="date-input-group">
                  <label>Ngày về:</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => handleDateChange("end", e.target.value)}
                    min={
                      dateRange.start || new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
                <motion.button
                  className="next-button"
                  onClick={handleNextQuestion}
                  disabled={!dateRange.start || !dateRange.end}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Tiếp theo <FaArrowRight />
                </motion.button>
              </motion.div>
            ) : questions[currentQuestion].type === "location" ? (
              <motion.div
                className="location-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="location-input-group">
                  <input
                    type="text"
                    placeholder="Nhập tên tỉnh thành..."
                    value={cityInput}
                    onChange={handleCityInputChange}
                    className="city-input"
                  />
                  {cityInput && (
                    <div className="suggestions-dropdown">
                      {filteredCities.map((city, index) => (
                        <motion.div
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleCitySelect(city)}
                          whileHover={{ backgroundColor: "#f0f9ff", x: 5 }}
                        >
                          {city}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="selected-cities">
                  <AnimatePresence>
                    {selectedCities.map((city, index) => (
                      <motion.span
                        key={city}
                        className="city-badge"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
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
                </div>
                {selectedCities.length > 0 && (
                  <motion.button
                    className="complete-button"
                    onClick={handleComplete}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Hoàn thành <FaCheck />
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                className="qa-options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {questions[currentQuestion].options &&
                  questions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>{option}</span>
                    </motion.button>
                  ))}
                {selectedOption === "E: Khác" && customBudget && (
                  <motion.div
                    className="custom-budget-container"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <input
                      type="number"
                      value={customBudget}
                      onChange={(e) => setCustomBudget(e.target.value)}
                      placeholder="Nhập số tiền mong muốn (tối thiểu 1 triệu VND)"
                      min="1000000"
                      className="custom-budget-input"
                    />
                    {parseInt(customBudget) < 1000000 ? (
                      <motion.p
                        className="error-message"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        Số tiền tối thiểu là 1 triệu VND.
                      </motion.p>
                    ) : (
                      <motion.button
                        className="next-button"
                        onClick={handleCustomBudgetSubmit}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Tiếp theo <FaArrowRight />
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            className="success-message"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <FaCheck /> Đang chuyển hướng đến trang lập kế hoạch...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QA;
