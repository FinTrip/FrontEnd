"use client";
import React, { useState } from "react";
import Link from "next/link";
import "./home_page.css";

const destinations = [
  {
    id: 1,
    image: "/images/chùa một cột.jpg",
    title: "Chùa Một Cột",
    rating: 4.8,
    location: "Hà Nội",
    description:
      "Chùa Một Cột là một trong những biểu tượng văn hóa của Hà Nội, nổi bật với kiến trúc độc đáo hình bông sen. Được xây dựng từ thời Lý, ngôi chùa mang ý nghĩa tâm linh và lịch sử quan trọng.",
  },
  {
    id: 2,
    image: "/images/Đảo Bình Ba.jpg",
    title: "Đảo Bình Ba",
    rating: 4.7,
    location: "Nha Trang",
    description:
      "Đảo Bình Ba, được mệnh danh là 'đảo tôm hùm', sở hữu những bãi biển hoang sơ và làn nước trong xanh. Đây là điểm đến lý tưởng cho du khách yêu thích lặn ngắm san hô và thưởng thức hải sản tươi ngon.",
  },
  {
    id: 3,
    image: "/images/Tháp Bà Ponagar.webp",
    title: "Tháp Bà Ponagar",
    rating: 4.9,
    location: "Nha Trang",
    description:
      "Tháp Bà Ponagar là di tích Chăm Pa cổ, mang đậm dấu ấn kiến trúc và văn hóa Hindu. Du khách có thể chiêm ngưỡng các tượng thần tinh xảo và trải nghiệm tắm bùn khoáng gần đó.",
  },
  {
    id: 4,
    image: "/images/phodibo.webp",
    title: "Phố đi bộ",
    rating: 4.6,
    location: "Đà Nẵng",
    description:
      "Phố đi bộ Đà Nẵng là nơi tụ hội nhiều hoạt động giải trí về đêm, với các quán cà phê, cửa hàng lưu niệm và nghệ sĩ đường phố. Đây là điểm dừng chân lý tưởng để tận hưởng không khí sôi động của thành phố biển.",
  },
  // {
  //   id: 5,
  //   image: "/images/Lăng Chủ tịch Hồ Chí Minh.jpg",
  //   title: "Lăng Chủ tịch Hồ Chí Minh",
  //   rating: 4.6,
  //   location: "Hà Nội",
  //   description:
  //     "Lăng Chủ tịch Hồ Chí Minh là nơi an nghỉ của vị lãnh tụ kính yêu, nằm trong quần thể quảng trường Ba Đình lịch sử. Du khách đến đây để bày tỏ lòng thành kính và tìm hiểu về lịch sử Việt Nam.",
  // },
];


const HomePage = () => {
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleCardClick = (dest: any) => {
    setSelectedDestination(dest);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedDestination(null);
  };

  return (
    <div className="home-container">
      <header className="hero-section">
        <h1>Smart planning – Easy success...</h1>
        <div className="search-bar">
          <input type="text" placeholder="Search destinations..." />
          <button>Search</button>
        </div>
      </header>

      <section className="top-categories">
        <h2>Top Categories</h2>
        <div className="category-grid">
          <div className="category-item">Đà Nẵng</div>
          <div className="category-item">Huế</div>
          <div className="category-item">Nha Trang</div>
          <div className="category-item">Hà Nội</div>
        </div>
      </section>

      <section className="destinations-section">
        <h2>Popular Destinations</h2>
        <div className="destinations-grid">
          {destinations.map((dest) => (
            <div key={dest.id} className="destination-card">
              <img src={dest.image} alt={dest.title} />
              <div
                className="card-content"
                onClick={() => handleCardClick(dest)}
              >
                <h3>{dest.title}</h3>
                <div className="card-details">
                  <span className="rating">★ {dest.rating}</span>
                  <div className="trip-info">
                    <h1>{dest.location}</h1>
                    <span>
                      Mô tả:{" "}
                      {dest.description.length > 100
                        ? dest.description.substring(0, 100) + "..."
                        : dest.description}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showDetail && selectedDestination && (
        <div
          className="destination-detail-overlay active"
          onClick={handleCloseDetail}
        >
          <div
            className="destination-detail-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-image-container">
              <img
                src={selectedDestination.image}
                alt={selectedDestination.title}
              />
              <button className="detail-close-btn" onClick={handleCloseDetail}>
                ×
              </button>
            </div>
            <div className="detail-content">
              <div className="detail-header">
                <h2 className="detail-title">{selectedDestination.title}</h2>
                <div className="detail-rating">
                  <span>★</span> {selectedDestination.rating}
                </div>
              </div>
              <div className="detail-location">
                <span>📍</span> {selectedDestination.location}
              </div>
              <div className="detail-description">
                {selectedDestination.description}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="recently-viewed">
        <h2>Recently Viewed</h2>
        <div className="destinations-grid">
          {destinations.slice(0, 3).map((dest) => (
            <div key={dest.id} className="destination-card">
              <img src={dest.image} alt={dest.title} />
              <div
                className="card-content"
                onClick={() => handleCardClick(dest)}
              >
                <h3>{dest.title}</h3>
                <div className="card-details">
                  <span className="rating">★ {dest.rating}</span>
                  <div className="trip-info">
                    <h1>{dest.location}</h1>
                    <span>
                      Mô tả:{" "}
                      {dest.description.length > 100
                        ? dest.description.substring(0, 100) + "..."
                        : dest.description}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="packages-section">
        <h2>All Inclusive Packages!</h2>
        <div className="destinations-grid">
          {destinations.map((dest) => (
            <div key={dest.id} className="destination-card">
              <img src={dest.image} alt={dest.title} />
              <div
                className="card-content"
                onClick={() => handleCardClick(dest)}
              >
                <h3>{dest.title}</h3>
                <div className="card-details">
                  <span className="rating">★ {dest.rating}</span>
                  <div className="trip-info">
                    <h1>{dest.location}</h1>
                    <span>
                      Mô tả:{" "}
                      {dest.description.length > 100
                        ? dest.description.substring(0, 100) + "..."
                        : dest.description}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="honeymoon-section">
        <h2>Honeymoon Packages Special!</h2>
        <div className="destinations-grid">
          {destinations.map((dest) => (
            <div key={dest.id} className="destination-card">
              <img src={dest.image} alt={dest.title} />
              <div
                className="card-content"
                onClick={() => handleCardClick(dest)}
              >
                <h3>{dest.title}</h3>
                <div className="card-details">
                  <span className="rating">★ {dest.rating}</span>
                  <div className="trip-info">
                    <h1>{dest.location}</h1>
                    <span>
                      Mô tả:{" "}
                      {dest.description.length > 100
                        ? dest.description.substring(0, 100) + "..."
                        : dest.description}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Travel</h3>
            <p>About Us</p>
            <p>Contact Us</p>
            <p>Terms & Conditions</p>
          </div>
          <div className="footer-section">
            <h3>Support</h3>
            <p>Customer Support</p>
            <p>Privacy Policy</p>
            <p>FAQ</p>
          </div>
          <div className="footer-section">
            <h3>Social</h3>
            <div className="social-links">
              <Link href="#">Facebook</Link>
              <Link href="#">Twitter</Link>
              <Link href="#">Instagram</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
