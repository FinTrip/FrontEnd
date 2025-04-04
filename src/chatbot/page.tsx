import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Chatbot.css';

const BOT_IMG = "/static/img/Fintrip.png";
const PERSON_IMG = "/static/img/person.png";
const LOGO_EDUCARE = "/static/img/Fintrip.png";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      name: 'FinTrip Bot',
      img: BOT_IMG,
      side: 'left',
      text: 'FinTrip xin chào! Hãy cùng chúng tôi lên kế hoạch cho hành trình đáng nhớ tiếp theo của bạn.',
      time: getCurrentTime(),
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  const updateMessageTimes = useCallback(() => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => ({ ...msg, time: getCurrentTime() }))
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      updateMessageTimes();
    }, 60000);
    return () => clearInterval(timer);
  }, [updateMessageTimes]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const sendMessage = async () => {
    if (userInput.trim() === '') return;

    const newMessage = {
      name: 'You',
      img: PERSON_IMG,
      side: 'right',
      text: userInput,
      time: getCurrentTime(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserInput('');
    setIsBotTyping(true);

    try {
      const response = await fetch('http://localhost:8000/chatbot/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userInput }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      const botMessage = {
        name: 'FinTrip Bot',
        img: BOT_IMG,
        side: 'left',
        text: data.response || 'Sorry, there was an error processing your request.',
        time: getCurrentTime(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        name: 'FinTrip Bot',
        img: BOT_IMG,
        side: 'left',
        text: 'There was an error. Please try again later.',
        time: getCurrentTime(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleKeyPress = (e:React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <div className="chatbot-icon" onClick={toggleChat}>
          <img src={BOT_IMG} alt="Open Chat" className="chat-icon" height={50} width={50} />
        </div>
      )}

      {isOpen && (
        <div className="chatbox" style={{ height: '450px', width: '300px' }}>
          <div className="chatbox-header">
            <div className="main-title">
              <img 
                src={LOGO_EDUCARE} 
                alt="EduCare Logo" 
                className="logo-educare" 
                style={{ width: '45px', height: '45px' }} 
              />
              FinTrip Bot
            </div>
            <button className="chatbox-close-btn" onClick={toggleChat}>
              ✕
            </button>
          </div>
          <div className="chatbox-body" style={{ paddingLeft: '5px' }}>
            {messages.map((msg, index) => (
              <div key={index} className={`msg ${msg.side}-msg`} style={{ marginRight: '2px' }}>
                {msg.side === 'left' && (
                  <div
                    className="msg-img"
                    style={{
                      backgroundImage: `url(${msg.img})`,
                      marginRight: '0px'
                    }}
                  ></div>
                )}
                <div className="msg-bubble" style={{ paddingLeft: '2px' }}>
                  <div className="msg-info">
                    <span className="msg-info-name">{msg.name}</span>
                    <span className="msg-info-time">{msg.time}</span>
                  </div>
                  <div className="msg-text">{msg.text}</div>
                </div>
                {msg.side === 'right' && (
                  <div
                    className="msg-img"
                    style={{
                      backgroundImage: `url(${msg.img})`,
                    }}
                  ></div>
                )}
              </div>
            ))}
            {isBotTyping && (
              <div className="msg left-msg" style={{ marginRight: '2px' }}>
                <div
                  className="msg-img"
                  style={{
                    backgroundImage: `url(${BOT_IMG})`,
                    marginRight: '0px'
                  }}
                ></div>
                <div className="msg-bubble" style={{ paddingLeft: '2px' }}>
                  <div className="msg-info">
                    <span className="msg-info-name">FinTrip Bot</span>
                    <span className="msg-info-time">{getCurrentTime()}</span>
                  </div>
                  <div className="msg-text" aria-label="Bot đang gõ">
                    <span className="typing-indicator">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <form className="msger-inputarea" style={{ margin: '0px' }} onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <input
              type="text"
              className="msger-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
            />
            <button type="submit" className="msger-send-btn">
              ►
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;