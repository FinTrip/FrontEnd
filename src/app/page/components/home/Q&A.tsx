"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./Q&A.css";

const QA = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const router = useRouter();

  const questions = [
    {
      question: "Bạn dự định ở lại bao nhiêu ngày?",
      options: ["A: 1 ngày", "B: 2 - 3 ngày", "C: 4 - 7 ngày", "D: Hơn 1 tuần"],
    },
    {
      question: "Kinh phí dự định của bạn khoảng bao nhiêu?",
      options: [
        "A: 2 triệu đến 3 triệu",
        "B: 4 triệu đến 5 triệu",
        "C: 5 triệu đến 6 triệu",
        "D: Chưa có dự tính",
      ],
    },
    {
      question: "Địa điểm bạn muốn đi từ đâu đến đâu",
      options: [
        "Hà Nội",
        "Đà Nẵng",
        "Nha Trang",
        "Hồ Chí Minh",
        "Huế",
        "Phú Quốc",
      ],
      isDropdown: true,
    },
  ];

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

  return (
    <div className="qa-container">
      <div className="qa-card">
        <h2>{questions[currentQuestion].question}</h2>
        {questions[currentQuestion].isDropdown ? (
          <div className="dropdown-container">
            <div className="city-options">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleCitySelect(option)}
                  className={selectedCities.includes(option) ? "selected" : ""}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="selected-cities">
              {selectedCities.map((city, index) => (
                <span key={index} className="city-badge">
                  {city}{" "}
                  <span
                    className="remove"
                    onClick={() => handleRemoveCity(city)}
                  >
                    x
                  </span>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="qa-options">
            {questions[currentQuestion].options.map((option, index) => (
              <button key={index} onClick={handleNextQuestion}>
                {option}
              </button>
            ))}
          </div>
        )}
        {currentQuestion === 2 && ( // Show the complete button only on the last question
          <button className="complete-button" onClick={handleComplete}>
            Hoàn thành
          </button>
        )}
      </div>
    </div>
  );
};

export default QA;
