"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import "../../app/styles/todolist.css"; // Ensure this path is correct

interface TodoItem {
  activity_id: number;
  itinerary_id: number | null;
  note_activities: string;
  description: string;
  date_activities: string;
  status: number;
  date_plan: string;
}

interface User {
  id: string | number;
}

interface AuthContext {
  user: User | null;
}

const TodoList: React.FC = () => {
  const { user } = useAuth() as AuthContext;
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [noteActivities, setNoteActivities] = useState("");
  const [dateActivities, setDateActivities] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isDateConfirmed, setIsDateConfirmed] = useState(false);

  // **Lấy danh sách công việc từ backend**
  const fetchTodos = useCallback(async () => {
    if (!user || !user.id) {
      setError("Bạn cần đăng nhập để xem danh sách công việc.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/recommend/todolist-get/?user_id=${user.id}`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách công việc.");
      }
      const data = await response.json();
      console.log("Dữ liệu từ API GET /todolist-get:", data);
      setTodos(data.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải danh sách.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // **Thêm công việc mới**
  const addTodo = async () => {
    if (!noteActivities.trim()) {
      alert("Vui lòng nhập tiêu đề ghi chú.");
      return;
    }
    if (!dateActivities) {
      alert("Vui lòng chọn ngày thực hiện.");
      return;
    }
    if (!description.trim()) {
      alert("Vui lòng nhập mô tả chi tiết.");
      return;
    }
    const newTodo = {
      note_activities: noteActivities,
      description: description,
      date_activities: dateActivities,
      status: 0,
      date_plan: startDate || new Date().toISOString().split("T")[0],
    };
    try {
      const response = await fetch("http://127.0.0.1:8000/recommend/todolist-create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          activities: [newTodo],
        }),
      });
      const responseData = await response.json();
      console.log("Phản hồi từ API POST /todolist-create:", responseData);
      if (!response.ok) {
        throw new Error(responseData.error || "Thêm công việc thất bại.");
      }
      setNoteActivities("");
      setDateActivities("");
      setDescription("");
      fetchTodos();
    } catch (err) {
      console.error("Lỗi khi thêm:", err);
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi thêm công việc.");
    }
  };

  // **Cập nhật công việc**
  const updateTodo = async (todo: TodoItem) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/recommend/todolist-update/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...todo, user_id: user?.id }),
      });
      const responseData = await response.json();
      console.log("Phản hồi từ API POST /todolist-update:", responseData);
      if (!response.ok) {
        throw new Error(responseData.error || "Cập nhật công việc thất bại.");
      }
      alert("Cập nhật công việc thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật công việc.");
    }
  };

  // **Xóa công việc**
  const deleteTodo = async (activity_id: number) => {
    const previousTodos = todos;
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.activity_id !== activity_id));
    try {
      const response = await fetch("http://127.0.0.1:8000/recommend/todolist-delete/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activity_id, user_id: user?.id }),
      });
      const responseData = await response.json();
      console.log("Phản hồi từ API POST /todolist-delete:", responseData);
      if (!response.ok) {
        throw new Error(responseData.error || "Xóa công việc thất bại.");
      }
      alert("Xóa công việc thành công!");
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      setTodos(previousTodos);
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa công việc.");
    }
  };

  // **Xử lý thay đổi input**
  const handleInputChange = (id: number, field: keyof TodoItem, value: string | number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.activity_id === id ? { ...todo, [field]: value } : todo
      )
    );
  };

  // **Tính toán đếm ngược**
  useEffect(() => {
    if (startDate) {
      const tripDate = new Date(startDate).getTime();
      const today = new Date().getTime();
      const daysLeft = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));
      setCountdown(daysLeft);
    }
  }, [startDate]);

  // **Gọi fetchTodos khi component mount hoặc user thay đổi**
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // **Xác nhận ngày bắt đầu**
  const confirmDate = () => {
    if (startDate) {
      setIsDateConfirmed(true);
    }
  };

  if (loading) return <div>Đang tải danh sách công việc...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="todo-container">
      <h1 className="main-title">Quản lý ToDoList cùng FinTrip</h1>

      {/* Phần chọn ngày bắt đầu và đếm ngược */}
      <div className="date-section">
        <p className="date-guide">✨ Chọn ngày bắt đầu chuyến đi của bạn:</p>
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
            <span className="countdown-text"> ngày nữa đến chuyến đi!</span>
          </div>
        )}
      </div>

      {/* Phần nội dung chính */}
      <div className="content-container">
        {/* Cột trái: Thêm và hiển thị Todo */}
        <div className="left-column">
          <div className="add-todo">
            <input
              type="text"
              value={noteActivities}
              onChange={(e) => setNoteActivities(e.target.value)}
              placeholder="Tiêu đề ghi chú"
              className="todo-input"
            />
            <input
              type="date"
              value={dateActivities}
              onChange={(e) => setDateActivities(e.target.value)}
              className="time-input"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết"
              className="todo-input"
            />
            <button onClick={addTodo} className="add-button">
              +
            </button>
          </div>

          <ul className="todo-list">
            {todos.length > 0 ? (
              todos.map((todo) => (
                <li key={todo.activity_id} className="todo-item">
                  <div className="todo-content">
                    <input
                      type="text"
                      value={todo.note_activities}
                      onChange={(e) =>
                        handleInputChange(todo.activity_id, "note_activities", e.target.value)
                      }
                      placeholder="Tiêu đề ghi chú"
                      className="todo-input"
                    />
                    <input
                      type="date"
                      value={todo.date_activities}
                      onChange={(e) =>
                        handleInputChange(todo.activity_id, "date_activities", e.target.value)
                      }
                      className="time-input"
                    />
                    <input
                      type="text"
                      value={todo.description}
                      onChange={(e) =>
                        handleInputChange(todo.activity_id, "description", e.target.value)
                      }
                      placeholder="Mô tả chi tiết"
                      className="todo-input"
                    />
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={todo.status === 1}
                        onChange={() =>
                          handleInputChange(
                            todo.activity_id,
                            "status",
                            todo.status === 0 ? 1 : 0
                          )
                        }
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">
                        {todo.status === 1 ? "Đã làm" : "Chưa làm"}
                      </span>
                    </label>
                  </div>
                  <div className="todo-actions">
                    <button onClick={() => updateTodo(todo)} className="save-button">
                      Lưu
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.activity_id)}
                      className="delete-button"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p>Không có công việc nào để hiển thị</p>
            )}
          </ul>
        </div>

        {/* Cột phải: Gợi ý công việc */}
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
    </div>
  );
};

export default TodoList;