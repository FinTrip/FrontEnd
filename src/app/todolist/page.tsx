"use client";

import React, { useState, useEffect } from "react";
import "../../app/styles/todolist.css";

interface TodoItem {
  id: number;
  text: string;
  time: string;
  completed: boolean;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [inputTime, setInputTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isDateConfirmed, setIsDateConfirmed] = useState(false);

  // Calculate countdown when start date changes
  useEffect(() => {
    if (startDate) {
      const tripDate = new Date(startDate).getTime();
      const today = new Date().getTime();
      const daysLeft = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));
      setCountdown(daysLeft);
    }
  }, [startDate]);

  // Add new todo
  const addTodo = () => {
    if (inputText.trim() !== "" && inputTime !== "") {
      const newTodo: TodoItem = {
        id: Date.now(),
        text: inputText,
        time: inputTime,
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setInputText("");
      setInputTime("");
    }
  };

  // Delete todo
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Toggle todo completion
  const toggleComplete = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Confirm start date
  const confirmDate = () => {
    if (startDate) {
      setIsDateConfirmed(true);
    }
  };

  // Save plan
  const savePlan = () => {
    alert(
      "Kế hoạch của bạn đã được lưu thành công! Chúc bạn có chuyến đi vui vẻ! 🎉"
    );
  };

  return (
    <div className="todo-container">
      <h1 className="main-title">
        Chào mừng bạn đến với ToDiList cùng FinTrip
      </h1>

      <div className="date-section">
        <p className="date-guide">
          ✨ Chuyến đi mơ ước bắt đầu ngày nào ta? Xác nhận để chuẩn bị đếm
          ngược thôi nào!
        </p>
        <div className="date-input-container">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
          <button onClick={confirmDate} className="confirm-button">
            Xác nhận
          </button>
        </div>
        {isDateConfirmed && countdown !== null && (
          <div className="countdown">
            <span className="countdown-number">{countdown}</span>
            <span className="countdown-text">
              ngày nữa đến chuyến đi của bạn!
            </span>
          </div>
        )}
      </div>

      <div className="content-container">
        <div className="left-column">
          <div className="add-todo">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập công việc cần làm..."
              className="todo-input"
            />
            <input
              type="time"
              value={inputTime}
              onChange={(e) => setInputTime(e.target.value)}
              className="time-input"
            />
            <button onClick={addTodo} className="add-button">
              +
            </button>
          </div>

          <ul className="todo-list">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`todo-item ${todo.completed ? "completed" : ""}`}
              >
                <div className="todo-content">
                  <span className="todo-text">{todo.text}</span>
                  <span className="todo-time">{todo.time}</span>
                </div>
                <div className="todo-actions">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo.id)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">
                      {todo.completed ? "Đã làm" : "Chưa làm"}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-button"
                  >
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="right-column">
          <div className="suggestion-note">
            <h3>Gợi ý công việc khi đi du lịch</h3>

            <div className="suggestion-item">
              <h4>✈️ Đặt phương tiện di chuyển chính</h4>
              <p>
                🛫 "Không có vé thì chỉ đi du lịch... trong mơ thôi đó! Đặt
                phương tiện để không lỡ chuyến phiêu lưu nha!"
              </p>
            </div>

            <div className="suggestion-item">
              <h4>🏨 Đặt nơi lưu trú</h4>
              <p>
                🏡 "Hành trình vui nhưng vẫn phải có nơi 'chui ra chui vào' chớ!
                Đặt chỗ nghỉ xịn xò ngay đi nào!"
              </p>
            </div>

            <div className="suggestion-item">
              <h4>🌦️ Kiểm tra thời tiết điểm đến</h4>
              <p>
                🌞🌧 "Nắng hay mưa – đâu ai biết trước? Xem thời tiết sớm để khỏi
                mang áo mưa đi dưới nắng nhé!"
              </p>
            </div>

            <div className="suggestion-item">
              <h4>🧳 Lên danh sách hành lý</h4>
              <p>
                🎒 "Hành lý không gọn – hành trình không vui! Soạn đồ xinh và đủ
                để đi du hí thật chill nào~"
              </p>
            </div>

            <div className="suggestion-item">
              <h4>🛂 Chuẩn bị giấy tờ cần thiết</h4>
              <p>
                📄 "Không có giấy tờ thì chỉ ngắm cảnh… qua mạng! Kiểm tra lại
                xem hộ chiếu/CMND còn hạn không nhé!"
              </p>
            </div>
          </div>
        </div>
      </div>

      <button onClick={savePlan} className="save-button">
        Lưu kế hoạch
      </button>
    </div>
  );
};

export default TodoList;
