"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaArrowRight,
  FaCheck,
  FaLeaf,
  FaUmbrellaBeach,
  FaMountain,
  FaLandmark,
} from "react-icons/fa"
import "./Q&A.css"

const QA = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  })
  const [cityInput, setCityInput] = useState("")
  const [customBudget, setCustomBudget] = useState<string>("")
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Set animation complete after initial load
    const timer = setTimeout(() => {
      setAnimationComplete(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

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
  ]

  const questions = [
    {
      question: "Bạn dự định đi trong khoảng thời gian nào?",
      type: "date",
      icon: <FaCalendarAlt />,
      description: "Chọn ngày bắt đầu và kết thúc chuyến đi của bạn",
    },
    {
      question: "Kinh phí dự định của bạn khoảng bao nhiêu?",
      type: "budget",
      icon: <FaMoneyBillWave />,
      description: "Chọn mức ngân sách phù hợp với kế hoạch của bạn",
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
      description: "Chọn các tỉnh thành bạn muốn ghé thăm",
    },
  ]

  const handleDateChange = (type: "start" | "end", value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityInput(e.target.value)
  }

  const filteredCities = vietnamProvinces.filter((city) => city.toLowerCase().includes(cityInput.toLowerCase()))

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleCitySelect = (city: string) => {
    setSelectedCities((prev) => {
      if (prev.includes(city)) {
        return prev.filter((c) => c !== city)
      } else {
        return [...prev, city]
      }
    })
    setCityInput("")
  }

  const handleRemoveCity = (city: string) => {
    setSelectedCities((prev) => prev.filter((c) => c !== city))
  }

  const handleComplete = async () => {
    setShowSuccessMessage(true)

    // Chuẩn bị dữ liệu gửi API
    const requestBody = {
      start_day: dateRange.start,
      end_day: dateRange.end,
      province: selectedCities[0]?.toLowerCase() || "quảng nam", // Lấy tỉnh đầu tiên hoặc mặc định là "quảng nam"
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/recommend/travel-schedule/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch travel schedule")
      }

      const data = await response.json()
      // Lưu dữ liệu vào localStorage
      localStorage.setItem("travelSchedule", JSON.stringify(data))

      // Chuyển hướng sang /plan sau 1.5 giây
      setTimeout(() => {
        router.push("/plan")
      }, 2500)
    } catch (error) {
      console.error("Error fetching travel schedule:", error)
      setShowSuccessMessage(false)
    }
  }

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
    if (option === "E: Khác") {
      setCustomBudget("1000000")
    } else {
      handleNextQuestion()
    }
  }

  const handleCustomBudgetSubmit = () => {
    if (Number.parseInt(customBudget) >= 1000000) {
      handleNextQuestion()
      setCustomBudget("")
    }
  }

  // Animation variants
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
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  const cardVariants = {
    initial: { y: 30, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const floatingElements = [
    { icon: <FaLeaf />, className: "floating-element leaf-1" },
    { icon: <FaUmbrellaBeach />, className: "floating-element beach-1" },
    { icon: <FaMountain />, className: "floating-element mountain-1" },
    { icon: <FaLandmark />, className: "floating-element landmark-1" },
    { icon: <FaLeaf />, className: "floating-element leaf-2" },
  ]

  return (
    <div className="qa-container">
      {/* Decorative elements */}
      <div className="vietnam-pattern-overlay"></div>
      <div className="lantern lantern-left"></div>
      <div className="lantern lantern-right"></div>

      {/* Floating elements */}
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

      {/* Banner */}
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

      <motion.div className="qa-card" variants={cardVariants} initial="initial" animate="animate">
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
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
            className="question-container"
          >
            <motion.div className="question-header" variants={itemVariants}>
              <div className="question-icon-wrapper">{questions[currentQuestion].icon}</div>
              <h2>{questions[currentQuestion].question}</h2>
              <p className="question-description">{questions[currentQuestion].description}</p>
            </motion.div>

            {questions[currentQuestion].type === "date" ? (
              <motion.div
                className="date-range-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div className="date-input-group" variants={itemVariants}>
                  <label>Ngày đi:</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => handleDateChange("start", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    <span className="input-icon">
                      <FaCalendarAlt />
                    </span>
                  </div>
                </motion.div>
                <motion.div className="date-input-group" variants={itemVariants}>
                  <label>Ngày về:</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => handleDateChange("end", e.target.value)}
                      min={dateRange.start || new Date().toISOString().split("T")[0]}
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
                <motion.div className="location-input-group" variants={itemVariants}>
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
                      {filteredCities.map((city, index) => (
                        <motion.div
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleCitySelect(city)}
                          whileHover={{ backgroundColor: "rgba(208, 40, 40, 0.1)", x: 5 }}
                        >
                          {city}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
                <motion.div className="selected-cities" variants={itemVariants}>
                  <AnimatePresence>
                    {selectedCities.map((city, index) => (
                      <motion.span
                        key={city}
                        className="city-badge"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {city}
                        <span className="remove" onClick={() => handleRemoveCity(city)}>
                          ×
                        </span>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </motion.div>
                {selectedCities.length > 0 && (
                  <motion.button
                    className="complete-button"
                    onClick={handleComplete}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    variants={itemVariants}
                  >
                    Hoàn thành <FaCheck />
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div className="qa-options" variants={containerVariants} initial="hidden" animate="visible">
                {questions[currentQuestion].options &&
                  questions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      whileHover={{ scale: 1.03, x: 5 }}
                      whileTap={{ scale: 0.97 }}
                      variants={itemVariants}
                      className={selectedOption === option ? "selected" : ""}
                    >
                      <span>{option}</span>
                    </motion.button>
                  ))}
                {selectedOption === "E: Khác" && customBudget && (
                  <motion.div
                    className="custom-budget-container"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="input-wrapper">
                      <input
                        type="number"
                        value={customBudget}
                        onChange={(e) => setCustomBudget(e.target.value)}
                        placeholder="Nhập số tiền mong muốn (tối thiểu 1 triệu VND)"
                        min="1000000"
                        className="custom-budget-input"
                      />
                      <span className="input-icon">
                        <FaMoneyBillWave />
                      </span>
                    </div>
                    {Number.parseInt(customBudget) < 1000000 ? (
                      <motion.p className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        Số tiền tối thiểu là 1 triệu VND.
                      </motion.p>
                    ) : (
                      <motion.button
                        className="next-button"
                        onClick={handleCustomBudgetSubmit}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
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

        <div className="progress-indicator">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === currentQuestion ? "active" : ""} ${index < currentQuestion ? "completed" : ""}`}
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
  )
}

export default QA

