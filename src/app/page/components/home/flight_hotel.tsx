"use client";

import React, { useState } from "react";
import "./flight_hotel.css";
import { FaPlus, FaSearch, FaMapMarkerAlt, FaPlane, FaHotel } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import "./home_page.css";
import { useRouter } from "next/navigation";

// Interface cho Hotel
interface HotelCard {
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

const CircularText = () => {
  return (
    <svg className="circular-text" viewBox="0 0 500 500">
      <path id="curve" fill="transparent" d="M250,250 m-150,0 a150,150 0 1,1 300,0 a150,150 0 1,1 -300,0" />
      <text>
        <textPath xlinkHref="#curve">
          Are you looking for a hotel and flight for your upcoming trip?
        </textPath>
      </text>
    </svg>
  );
};

const FlightHotel = () => {
  const router = useRouter();
  const [selectedHotel, setSelectedHotel] = useState<HotelCard | null>(null);
  const [showHotelDetail, setShowHotelDetail] = useState(false);
  const [departureInput, setDepartureInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showSearchCard, setShowSearchCard] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [flights, setFlights] = useState<any[]>([]);
  const [recommendedHotels, setRecommendedHotels] = useState<HotelCard[]>([]);

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

  const handleHotelClick = (hotel: HotelCard) => {
    setSelectedHotel(hotel);
    setShowHotelDetail(true);
  };

  const handleCloseHotelDetail = () => {
    setShowHotelDetail(false);
    setSelectedHotel(null);
  };

  const handleDepartureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepartureInput(e.target.value);
    setShowDepartureDropdown(true);
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestinationInput(e.target.value);
    setShowDestinationDropdown(true);
  };

  const handleProvinceSelect = (
    province: string,
    type: "departure" | "destination"
  ) => {
    if (type === "departure") {
      setDepartureInput(province);
      setShowDepartureDropdown(false);
    } else {
      setDestinationInput(province);
      setShowDestinationDropdown(false);
    }
  };

  const handleSearchButtonClick = () => {
    setShowSearchCard(true);
  };

  const handleCloseSearchCard = () => {
    setShowSearchCard(false);
    setSelectedLocation("");
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      router.push(`/?location=${selectedLocation}`);
    }
  };

  const handleSearchFlight = async () => {
    const flightPayload = {
        origin: departureInput,
        destination: destinationInput,
        departure_date: flightDate
    };
    try {
        const flightResponse = await fetch(
            "http://127.0.0.1:8000/recommend/rcm-flight/",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(flightPayload),
            }
        );
        const flightData = await flightResponse.json();
        setFlights(flightData);
        // Sau khi tìm chuyến bay thành công, gọi API recommend khách sạn
        handleSearchHotels();
    } catch (error) {
        console.error("Error fetching flights:", error);
    }
  };

  const handleSearchHotels = async () => {
    const hotelPayload = { destinationInput };
    try {
        const hotelResponse = await fetch(
            "http://127.0.0.1:8000/recommend/rcm-hotel/",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(hotelPayload),
            }
        );
        //Dũng  code trang này .... 
        const hotelData = await hotelResponse.json();
        const hotelsArray = hotelData.hotels ? hotelData.hotels.slice(0, 12) : [];
        setRecommendedHotels(hotelsArray);
    } catch (error) {
        console.error("Error fetching hotels:", error);
    }
  };

  return (
    <div className="flight-hotel-container">
      <div className="hero-header">
        <div className="hero-icons">
          <div className="plane-icon">
            <FaPlane size={120} />
          </div>
          <div className="plane-icon">
            <FaPlane size={120} />
          </div>
          <div className="hotel-icon">
            <FaHotel size={150} />
          </div>
          <div className="hotel-icon">
            <FaHotel size={150} />
          </div>
        </div>
        <CircularText />
        <div className="hero-content">
          <h1>Find Your Perfect Stay & Flight</h1>
        </div>
      </div>

      <div className="flight-search-container">
        <div className="flight-search-input">
          <div className="input-group">
            <span className="input-icon">✈️</span>
            <div className="input-wrapper">
              <label>Departure</label>
              <input
                type="text"
                value={departureInput}
                onChange={handleDepartureChange}
                placeholder="From where?"
                onFocus={() => setShowDepartureDropdown(true)}
              />
              {showDepartureDropdown && (
                <div className="province-dropdown">
                  {vietnamProvinces
                    .filter((province) =>
                      province
                        .toLowerCase()
                        .includes(departureInput.toLowerCase())
                    )
                    .map((province, index) => (
                      <div
                        key={index}
                        className="province-item"
                        onClick={() =>
                          handleProvinceSelect(province, "departure")
                        }
                      >
                        {province}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="input-group">
            <span className="input-icon">🏁</span>
            <div className="input-wrapper">
              <label>Destination</label>
              <input
                type="text"
                value={destinationInput}
                onChange={handleDestinationChange}
                placeholder="Where to?"
                onFocus={() => setShowDestinationDropdown(true)}
              />
              {showDestinationDropdown && (
                <div className="province-dropdown">
                  {vietnamProvinces
                    .filter((province) =>
                      province
                        .toLowerCase()
                        .includes(destinationInput.toLowerCase())
                    )        //Dũng  code trang này .... 

                    .map((province, index) => (
                      <div
                        key={index}
                        className="province-item"
                        onClick={() =>
                          handleProvinceSelect(province, "destination")
                        }
                      >
                        {province}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="input-group">
            <span className="input-icon">📅</span>
            <div className="input-wrapper">
              <label>Ngày đi</label>
              <input
                type="date"
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
              />
            </div>
          </div>

          {/* <div className="input-group">
            <span className="input-icon">📅</span>
            <div className="input-wrapper">
              <label>Check-out</label>
              <input type="date" />
            </div>
          </div> */}
        </div>

        <button className="search-flight-btn" onClick={handleSearchFlight}>
          Tìm chuyến bay
        </button>
      </div>

      {flights.length > 0 && (
        <section className="flight-results-section">
          <h2>Kết quả chuyến bay</h2>
          <div className="destinations-grid">
            {flights.map((flight, index) => (
              <div key={index} className="destination-card">
                <div className="card-content">
                  <h3>Chuyến bay: {flight.outbound_flight_code}</h3>
                  <div className="card-details">
                    <div className="trip-info">
                      <p>Thời gian khởi hành: {flight.outbound_time}</p>
                      <p>Giá vé: {flight.total_price_vnd}</p>
                      <p>Giá cơ bản: {flight.base_price_vnd}</p>
                      <p>Loại vé: {flight.fare_basis}</p>
                      <p>Hạng ghế: {flight.cabin}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recommendedHotels.length > 0 && (
        <section className="recommended-hotels-section">
          <h2>Khách sạn được đề xuất tại {destinationInput}</h2>
          <div className="destinations-grid">
            {recommendedHotels.map((hotel, index) => (
              <div
                key={index}
                className="destination-card hotel-card"
                onClick={() => handleHotelClick(hotel)}
              >
                <div className="relative">
                  <img src={hotel.img_origin.split(",")[0].trim()} alt={hotel.name} />
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
      )}

      <section className="hotels-section">
        <h2>Featured Hotels</h2>
        <div className="hotels-grid">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="hotel-card" onClick={() => handleHotelClick(hotel)}>
              <img 
                src={hotel.img_origin} 
                alt={hotel.name} 
                className="hotel-image"
              />
              <div className="hotel-content">
                <h3 className="hotel-title">{hotel.name}</h3>
                <div className="hotel-info">
                  <div className="hotel-rating">
                    <span>★</span>
                    <span>{hotel.location_rating}</span>
                  </div>
                  <div className="hotel-class">{hotel.hotel_class}</div>
                </div>
                <div className="hotel-location">
                  <span>📍</span>
                  <span>{hotel.name_nearby_place}</span>
                </div>
                <div className="hotel-price">{hotel.price}</div>
                <p className="hotel-description">{hotel.description}</p>
                <div className="hotel-amenities">
                  {hotel.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-tag">
                      {amenity}
                    </span>
                  ))}
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
          {/* ... existing hotel detail modal ... */}
        </div>
      )}
    </div>
  );
};

export default FlightHotel;
