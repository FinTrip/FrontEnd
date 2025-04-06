'use client';

import React, { useState, useEffect, useRef } from 'react';
import './page.css';

const BOT_IMG = "/images/Fintrip.png";
const PERSON_IMG = "/images/person.jpg";
const LOGO_EDUCARE = "/images/Fintrip.png";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      name: "FinTrip",
      img: BOT_IMG,
      side: "left",
      text: "Xin chào! Tôi là FinTrip, trợ lý ảo của bạn. Tôi có thể giúp gì cho bạn?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prevMessages => 
        prevMessages.map(msg => ({
          ...msg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = {
      name: "You",
      img: PERSON_IMG,
      side: "right",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/chatbot/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          text: input,
          user_id: "default_user",
          session_id: "default_session"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage = {
        name: "FinTrip",
        img: BOT_IMG,
        side: "left",
        text: data.response || "Xin lỗi, tôi không thể trả lời ngay lúc này.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        name: "FinTrip",
        img: BOT_IMG,
        side: "left",
        text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <div className="chatbot-icon" onClick={toggleChat}>
          <img src={BOT_IMG} alt="Chat" />
        </div>
      )}
      
      {isOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <div className="main-title">
              <img src={LOGO_EDUCARE} alt="Logo" className="logo-educare" />
              <span>FinTrip Chat</span>
            </div>
            <button className="chatbox-close-btn" onClick={toggleChat}>×</button>
          </div>
          
          <div className="chatbox-body">
            {messages.map((msg, index) => (
              <div key={index} className={`msg ${msg.side}-msg`}>
                <img src={msg.img} alt={msg.name} className="msg-img" />
                <div className="msg-bubble">
                  <div className="msg-info">
                    <div className="msg-info-name">{msg.name}</div>
                    <div className="msg-info-time">{msg.time}</div>
                  </div>
                  <div className="msg-text">{msg.text}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="msg left-msg">
                <img src={BOT_IMG} alt="FinTrip" className="msg-img" />
                <div className="msg-bubble">
                  <div className="msg-info">
                    <div className="msg-info-name">FinTrip</div>
                    <div className="msg-info-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="msger-inputarea">
            <input
              type="text"
              className="msger-input"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="msger-send-btn" onClick={sendMessage}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
}