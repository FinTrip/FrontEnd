"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
    },
    {
      question: "Kinh phí dự định của bạn khoảng bao nhiêu?",
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
        return prev.filter((c) => c !== city); // Remove city if already selected
      } else {
        return [...prev, city]; // Add city if not selected
      }
    });
  };

  const handleRemoveCity = (city: string) => {
    setSelectedCities((prev) => prev.filter((c) => c !== city));
  };

  const handleComplete = () => {
    // Navigate to the plan page
    router.push("/plan");
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
      setCustomBudget(""); // Reset custom budget after moving to next question
    }
  };

  return (
    <div className="qa-container">
      <div className="qa-card">
        <h2>{questions[currentQuestion].question}</h2>
        {questions[currentQuestion].type === "date" ? (
          <div className="date-range-container">
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
                min={dateRange.start || new Date().toISOString().split("T")[0]}
              />
            </div>
            <button
              className="next-button"
              onClick={handleNextQuestion}
              disabled={!dateRange.start || !dateRange.end}
            >
              Tiếp theo
            </button>
          </div>
        ) : questions[currentQuestion].type === "location" ? (
          <div className="location-container">
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
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="selected-cities">
              {selectedCities.map((city, index) => (
                <span key={index} className="city-badge">
                  {city}
                  <span
                    className="remove"
                    onClick={() => handleRemoveCity(city)}
                  >
                    ×
                  </span>
                </span>
              ))}
            </div>
            {selectedCities.length > 0 && (
              <button className="complete-button" onClick={handleComplete}>
                Hoàn thành
              </button>
            )}
          </div>
        ) : (
          <div className="qa-options">
            {questions[currentQuestion].options &&
              questions[currentQuestion].options.map((option, index) => (
                <button key={index} onClick={() => handleOptionSelect(option)}>
                  {option}
                </button>
              ))}
            {selectedOption === "E: Khác" && customBudget && (
              <div className="custom-budget-container">
                <input
                  type="number"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  placeholder="Nhập số tiền mong muốn (tối thiểu 1 triệu VND)"
                  min="1000000"
                  className="custom-budget-input"
                />
                {parseInt(customBudget) < 1000000 ? (
                  <p className="error-message">
                    Số tiền tối thiểu là 1 triệu VND.
                  </p>
                ) : (
                  <button
                    className="next-button"
                    onClick={handleCustomBudgetSubmit}
                  >
                    Tiếp theo
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QA;
