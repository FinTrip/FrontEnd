"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import "./slider.css";

const destinations = [
  {
    id: 1,
    image: "/images/hagiang-home.jpg",
    title: "Hà Giang",
    location: "Vietnam",
  },
  {
    id: 2,
    image: "/images/phongnha-home.jpg",
    title: "Phong Nha",
    location: "Vietnam",
  },
  {
    id: 3,
    image: "/images/Quần thể di tích cố đô Huế.jpg",
    title: "Huế",
    location: "Vietnam",
  },
  {
    id: 4,
    image: "/images/Thánh địa Mỹ Sơn.jpg",
    title: "Mỹ Sơn",
    location: "Vietnam",
  },
  {
    id: 5,
    image: "/images/Phố cổ Hội An.jpg",
    title: "Hội An",
    location: "Vietnam",
  },
];

const HomeSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setCurrentSlide((prev) =>
          prev === destinations.length - 1 ? 0 : prev + 1
        );
        setTimeout(() => setIsAnimating(false), 500);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [isAnimating]);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) =>
      prev === destinations.length - 1 ? 0 : prev + 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) =>
      prev === 0 ? destinations.length - 1 : prev - 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Tính toán vị trí cho mỗi slide
  const getSlideStyle = (index: number) => {
    const rotation = index - currentSlide;

    return {
      transform: `translateX(${rotation * 100}%)`,
      opacity: index === currentSlide ? 1 : 0.7,
      zIndex: index === currentSlide ? 2 : 1,
      transition: "all 0.6s ease",
      filter: index === currentSlide ? "none" : "brightness(0.7)",
    };
  };

  return (
    <div className="main-container">
      <nav className="cc">
        <div className="nav-content">
          <div className="nav-brand">
            <Link href="/">
              <img
                src="/images/LOGO.png"
                alt="FinTrip Logo"
                className="nav-logo"
              />
            </Link>
          </div>
          <div className="nav-links">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/destinations" className="nav-link">
              Destinations
            </Link>
            <Link href="/tours" className="nav-link">
              Tours
            </Link>
            <Link href="/about" className="nav-link">
              About Us
            </Link>
          </div>
          <div className="auth-links">
            <Link href="/page/auth/login" className="nav-link login">
              Login
            </Link>
            <Link href="/page/auth/register" className="nav-link register">
              Register
            </Link>
          </div>
        </div>
      </nav>

      <div className="content-wrapper">
        <div className="left-content">
          <h1 className="main-title">FinTrip</h1>
          <p className="description">
            Welcome to our smart travel platform! Discover perfect destinations,
            optimize itineraries, get real-time weather updates, and enjoy
            personalized recommendations. Whether you seek relaxation, culture,
            or adventure, we make trip planning seamless and enjoyable. Start
            your journey today!
          </p>
          <a href="http://localhost:3000/homepage">
            <button className="see-more-btn">LET'S GO</button>
          </a>
        </div>

        <div className="slider-section">
          <div className="slider-container">
            <div className="slides-wrapper">
              {destinations.map((dest, index) => (
                <div
                  key={dest.id}
                  className={`slide-card ${
                    index === currentSlide ? "active" : ""
                  }`}
                  style={getSlideStyle(index)}
                >
                  <img
                    src={dest.image}
                    alt={dest.title}
                    className="card-image"
                  />
                  <div className="location-label">
                    {dest.title}
                    <br />
                    {dest.location}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="nav-button prev"
              style={{ display: "none" }}
              disabled={isAnimating || currentSlide === 0}
            >
              <ChevronLeft className="nav-icon" />
            </button>
            <button
              onClick={nextSlide}
              className="nav-button next"
              style={{ display: "none" }}
              disabled={isAnimating || currentSlide === destinations.length - 1}
            >
              <ChevronRight className="nav-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSlider;
