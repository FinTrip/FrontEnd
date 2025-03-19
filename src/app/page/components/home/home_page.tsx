"use client";
import React, { useState, DragEvent } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import "./home_page.css";
import { FaPlus, FaChevronDown } from "react-icons/fa";

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

// Thêm interface để chia sẻ kiểu dữ liệu giữa các component
export interface DestinationCard {
  id: number;
  image: string;
  title: string;
  rating: number;
  location: string;
  description: string;
}

// Thêm interface cho props
interface HomePageProps {
  isInPlan?: boolean;
  onAddToPlan?: (destination: DestinationCard) => void;
  showAddButton?: boolean;
}

// Thêm interface cho Hotel
export interface HotelCard {
  id: number;
  name: string;
  link: string;
  description: string;
  price: string;
  name_nearby_place: string;
  hotel_class: string;
  img_origin: string;
  location_rating: number;
  amenities: string[];
}

// Thêm data hotels
const hotels = [
  {
    id: 1,
    name: "Melia Vinpearl Đà Nẵng",
    link: "https://example.com/hotel1",
    description:
      "Khách sạn 5 sao sang trọng với tầm nhìn ra biển, cung cấp dịch vụ spa cao cấp và nhiều tiện nghi giải trí.",
    price: "2,500,000 VND",
    name_nearby_place: "Bãi biển Mỹ Khê",
    hotel_class: "5 sao",
    img_origin: "/images/melia-vinpearl.jpg",
    location_rating: 4.8,
    amenities: ["Hồ bơi", "Spa", "Nhà hàng", "Phòng gym", "Bar"],
  },
  {
    id: 2,
    name: "Novotel Huế",
    link: "/images/NovotelHuế.jpg",
    description:
      "Tọa lạc bên sông Hương thơ mộng, khách sạn cung cấp không gian nghỉ dưỡng yên tĩnh và sang trọng.",
    price: "1,800,000 VND",
    name_nearby_place: "Cầu Trường Tiền",
    hotel_class: "4 sao",
    img_origin: "/images/NovotelHuế.jpg",
    location_rating: 4.6,
    amenities: ["Wifi miễn phí", "Nhà hàng", "Phòng họp", "Dịch vụ đưa đón"],
  },
  {
    id: 3,
    name: "Sheraton Grand Đà Nẵng",
    link: "https://example.com/hotel3",
    description:
      "Resort sang trọng với kiến trúc hiện đại, cung cấp dịch vụ đẳng cấp 5 sao và tầm nhìn tuyệt đẹp ra biển.",
    price: "3,200,000 VND",
    name_nearby_place: "Cầu Rồng",
    hotel_class: "5 sao",
    img_origin: "/images/sheraton-danang.jpg",
    location_rating: 4.9,
    amenities: ["Bãi biển riêng", "Spa", "Nhà hàng", "Bar", "Hồ bơi vô cực"],
  },
  {
    id: 4,
    name: "La Residence Huế",
    link: "https://example.com/hotel4",
    description:
      "Khách sạn boutique với phong cách Art Deco độc đáo, mang đến trải nghiệm lưu trú đẳng cấp tại cố đô.",
    price: "2,800,000 VND",
    name_nearby_place: "Đại Nội Huế",
    hotel_class: "5 sao",
    img_origin: "/images/la-residence-hue.jpg",
    location_rating: 4.7,
    amenities: ["Nhà hàng Pháp", "Spa", "Hồ bơi", "Bar", "Dịch vụ xe đạp"],
  },
];

const HomePage = ({
  isInPlan = false,
  onAddToPlan,
  showAddButton = false,
}: HomePageProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  console.log("Is Home Page:", isHomePage);

  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelCard | null>(null);
  const [showHotelDetail, setShowHotelDetail] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả địa điểm");
  const [filteredDestinations, setFilteredDestinations] =
    useState(destinations);

  const categories = [
    "Tất cả địa điểm",
    "Đà Nẵng",
    "Huế",
    "Nha Trang",
    "Hà Nội",
  ];

  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);

    // Filter destinations based on selected category
    if (category === "Tất cả địa điểm") {
      setFilteredDestinations(destinations);
    } else {
      const filtered = destinations.filter(
        (dest) => dest.location === category
      );
      setFilteredDestinations(filtered);
    }
  };

  const handleCardClick = (dest: any) => {
    setSelectedDestination(dest);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedDestination(null);
  };

  const handleDragStart = (
    e: DragEvent<HTMLDivElement>,
    destination: DestinationCard
  ) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "destination",
        data: {
          type: "place",
          title: destination.title,
          description: destination.description,
          image: destination.image,
          location: destination.location,
          rating: destination.rating,
        },
      })
    );
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("dragging");
  };

  const handleAddToPlan = (dest: DestinationCard, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn việc mở detail modal
    if (onAddToPlan) {
      onAddToPlan(dest);
    }
  };

  const handleHotelClick = (hotel: HotelCard) => {
    setSelectedHotel(hotel);
    setShowHotelDetail(true);
  };

  const handleCloseHotelDetail = () => {
    setShowHotelDetail(false);
    setSelectedHotel(null);
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
        <div
          className={`category-dropdown ${
            isCategoryDropdownOpen ? "active" : ""
          }`}
        >
          <div
            className="category-dropdown-header"
            onClick={toggleCategoryDropdown}
          >
            <span>{selectedCategory}</span>
            <FaChevronDown />
          </div>
          <div className="category-list">
            {categories.map((category, index) => (
              <div
                key={index}
                className="category-item"
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="destinations-section">
        <h2>Popular Destinations</h2>
        <div className="destinations-grid">
          {filteredDestinations.map((dest) => (
            <div
              key={dest.id}
              className="destination-card"
              draggable
              onDragStart={(e) => handleDragStart(e, dest)}
              onDragEnd={handleDragEnd}
            >
              <div className="relative">
                <img src={dest.image} alt={dest.title} />
                <button
                  className="add-to-plan-btn"
                  onClick={(e) => handleAddToPlan(dest, e)}
                  aria-label="Add to plan"
                >
                  <FaPlus />
                </button>
              </div>
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
          {filteredDestinations.slice(0, 3).map((dest) => (
            <div key={dest.id} className="destination-card">
              <div className="relative">
                <img src={dest.image} alt={dest.title} />
                <button
                  className="add-to-plan-btn"
                  onClick={(e) => handleAddToPlan(dest, e)}
                  aria-label="Add to plan"
                >
                  <FaPlus />
                </button>
              </div>
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
          {filteredDestinations.map((dest) => (
            <div key={dest.id} className="destination-card">
              <div className="relative">
                <img src={dest.image} alt={dest.title} />
                <button
                  className="add-to-plan-btn"
                  onClick={(e) => handleAddToPlan(dest, e)}
                  aria-label="Add to plan"
                >
                  <FaPlus />
                </button>
              </div>
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
          {filteredDestinations.map((dest) => (
            <div key={dest.id} className="destination-card">
              <div className="relative">
                <img src={dest.image} alt={dest.title} />
                <button
                  className="add-to-plan-btn"
                  onClick={(e) => handleAddToPlan(dest, e)}
                  aria-label="Add to plan"
                >
                  <FaPlus />
                </button>
              </div>
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

      <section className="hotels-section">
        <h2>Recommended Hotels</h2>
        <div className="destinations-grid">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="destination-card hotel-card"
              onClick={() => handleHotelClick(hotel)}
            >
              <div className="relative">
                <img src={hotel.img_origin} alt={hotel.name} />
                {isInPlan && (
                  <button
                    className="add-to-plan-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle adding hotel to plan
                    }}
                    aria-label="Add to plan"
                  >
                    <FaPlus />
                  </button>
                )}
              </div>
              <div className="card-content">
                <h3>{hotel.name}</h3>
                <div className="card-details">
                  <div className="hotel-info">
                    <span className="hotel-class">{hotel.hotel_class}</span>
                    <span className="rating">★ {hotel.location_rating}</span>
                  </div>
                  <div className="trip-info">
                    <h1>{hotel.name_nearby_place}</h1>
                    <span className="price">{hotel.price}/đêm</span>
                    <span className="description">
                      {hotel.description.length > 100
                        ? hotel.description.substring(0, 100) + "..."
                        : hotel.description}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showHotelDetail && selectedHotel && (
        <div
          className="destination-detail-overlay active"
          onClick={handleCloseHotelDetail}
        >
          <div
            className="destination-detail-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-image-container">
              <img src={selectedHotel.img_origin} alt={selectedHotel.name} />
              <button
                className="detail-close-btn"
                onClick={handleCloseHotelDetail}
              >
                ×
              </button>
            </div>
            <div className="detail-content">
              <div className="detail-header">
                <h2 className="detail-title">{selectedHotel.name}</h2>
                <div className="detail-rating">
                  <span>★</span> {selectedHotel.location_rating}
                </div>
              </div>

              <div className="hotel-info-section">
                <h3>Thông tin chung</h3>
                <div className="hotel-info-grid">
                  <div className="hotel-info-item">
                    <span className="hotel-info-label">Hạng khách sạn</span>
                    <span className="hotel-info-value hotel-class-badge">
                      {selectedHotel.hotel_class}
                    </span>
                  </div>
                  <div className="hotel-info-item">
                    <span className="hotel-info-label">Giá phòng</span>
                    <span className="hotel-info-value hotel-price">
                      {selectedHotel.price}/đêm
                    </span>
                  </div>
                  <div className="hotel-info-item">
                    <span className="hotel-info-label">Địa điểm lân cận</span>
                    <span className="hotel-info-value">
                      <span>📍</span> {selectedHotel.name_nearby_place}
                    </span>
                  </div>
                  <div className="hotel-info-item">
                    <span className="hotel-info-label">Đánh giá vị trí</span>
                    <span className="hotel-info-value">
                      <span>★</span> {selectedHotel.location_rating}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="hotel-info-section">
                <h3>Mô tả</h3>
                <div className="detail-description">
                  {selectedHotel.description}
                </div>
              </div>

              <div className="hotel-info-section">
                <h3>Tiện nghi</h3>
                <div className="amenities-grid">
                  {selectedHotel.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-tag">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hotel-info-section">
                <h3>Đặt phòng</h3>
                <div className="hotel-booking">
                  <a
                    href={selectedHotel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="booking-link"
                  >
                    Xem chi tiết và đặt phòng
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* {isHomePage && (
      )} */}
        <Link href="/Q&A">
          <div className="fixed-logo">
            <img src="/images/LOGO.png" alt="Website Logo" />
          </div>
        </Link>
    </div>
  );
};

export default HomePage;
