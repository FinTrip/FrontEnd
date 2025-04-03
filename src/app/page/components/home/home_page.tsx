"use client";
import React, {
  useState,
  DragEvent,
  useEffect,
  useTransition,
  useDeferredValue,
  ElementType,
} from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import "./home_page.css";
import {
  FaPlus,
  FaChevronDown,
  FaMapMarkerAlt,
  FaSearch,
} from "react-icons/fa";
import { animated, useSpring } from "@react-spring/web";
import { motion } from "framer-motion";
import Image from "next/image";

const destinations = [
  {
    id: 1,
    img: "/images/chùa một cột.jpg",
    title: "Chùa Một Cột",
    rating: 4.8,
    address: "Hà Nội",
    description:
      "Chùa Một Cột là một trong những biểu tượng văn hóa của Hà Nội, nổi bật với kiến trúc độc đáo hình bông sen. Được xây dựng từ thời Lý, ngôi chùa mang ý nghĩa tâm linh và lịch sử quan trọng.",
  },
  {
    id: 2,
    img: "/images/Đảo Bình Ba.jpg",
    title: "Đảo Bình Ba",
    rating: 4.7,
    address: "Nha Trang",
    description:
      "Đảo Bình Ba, được mệnh danh là 'đảo tôm hùm', sở hữu những bãi biển hoang sơ và làn nước trong xanh. Đây là điểm đến lý tưởng cho du khách yêu thích lặn ngắm san hô và thưởng thức hải sản tươi ngon.",
  },
  {
    id: 3,
    img: "/images/Tháp Bà Ponagar.webp",
    title: "Tháp Bà Ponagar",
    rating: 4.9,
    address: "Nha Trang",
    description:
      "Tháp Bà Ponagar là di tích Chăm Pa cổ, mang đậm dấu ấn kiến trúc và văn hóa Hindu. Du khách có thể chiêm ngưỡng các tượng thần tinh xảo và trải nghiệm tắm bùn khoáng gần đó.",
  },
  {
    id: 4,
    img: "/images/phodibo.webp",
    title: "Phố đi bộ",
    rating: 4.6,
    address: "Đà Nẵng",
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
// export interface DestinationCard {
//   id: number;
//   image: string;
//   title: string;
//   rating: number;
//   location: string;
//   description: string;
// }
export interface DestinationCard {
  // id: number; // Có thể bỏ nếu không cần
  img: string;
  title: string;
  rating: number;
  address: string;
  description: string;
  // link?: string; // Thêm link nếu cần sử dụng
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
//Thêm interface cho địa điểm
interface Item {
  title: string;
  rating: number;
  description: string;
  address: string;
  img?: string;
}
//Thêm interface cho món ăn
interface SearchResult {
  province: string;
  food: Item[];
  places: Item[];
}

// Thêm data hotels
// const hotels = [
//   {
//     id: 1,
//     name: "Melia Vinpearl Đà Nẵng",
//     link: "https://example.com/hotel1",
//     description:
//       "Khách sạn 5 sao sang trọng với tầm nhìn ra biển, cung cấp dịch vụ spa cao cấp và nhiều tiện nghi giải trí.",
//     price: "2,500,000 VND",
//     name_nearby_place: "Bãi biển Mỹ Khê",
//     hotel_class: "5 sao",
//     img_origin: "/images/melia-vinpearl.jpg",
//     location_rating: 4.8,
//     amenities: ["Hồ bơi", "Spa", "Nhà hàng", "Phòng gym", "Bar"],
//   },
//   {
//     id: 2,
//     name: "Novotel Huế",
//     link: "/images/NovotelHuế.jpg",
//     description:
//       "Tọa lạc bên sông Hương thơ mộng, khách sạn cung cấp không gian nghỉ dưỡng yên tĩnh và sang trọng.",
//     price: "1,800,000 VND",
//     name_nearby_place: "Cầu Trường Tiền",
//     hotel_class: "4 sao",
//     img_origin: "/images/NovotelHuế.jpg",
//     location_rating: 4.6,
//     amenities: ["Wifi miễn phí", "Nhà hàng", "Phòng họp", "Dịch vụ đưa đón"],
//   },
//   {
//     id: 3,
//     name: "Sheraton Grand Đà Nẵng",
//     link: "https://example.com/hotel3",
//     description:
//       "Resort sang trọng với kiến trúc hiện đại, cung cấp dịch vụ đẳng cấp 5 sao và tầm nhìn tuyệt đẹp ra biển.",
//     price: "3,200,000 VND",
//     name_nearby_place: "Cầu Rồng",
//     hotel_class: "5 sao",
//     img_origin: "/images/sheraton-danang.jpg",
//     location_rating: 4.9,
//     amenities: ["Bãi biển riêng", "Spa", "Nhà hàng", "Bar", "Hồ bơi vô cực"],
//   },
//   {
//     id: 4,
//     name: "La Residence Huế",
//     link: "https://example.com/hotel4",
//     description:
//       "Khách sạn boutique với phong cách Art Deco độc đáo, mang đến trải nghiệm lưu trú đẳng cấp tại cố đô.",
//     price: "2,800,000 VND",
//     name_nearby_place: "Đại Nội Huế",
//     hotel_class: "5 sao",
//     img_origin: "/images/la-residence-hue.jpg",
//     location_rating: 4.7,
//     amenities: ["Nhà hàng Pháp", "Spa", "Hồ bơi", "Bar", "Dịch vụ xe đạp"],
//   },
// ];

// Thêm component mới để tạo text animation
const AnimatedText = ({ text }: { text: string }) => {
  const springs = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 300, friction: 10 },
    reset: true,
    loop: true,
  });

  const AnimatedDiv = animated.div as ElementType;

  return (
    <div className="search-btn-text">
      <AnimatedDiv
        style={{
          transform: springs.y.to((y) => `translateY(${y}px)`),
          opacity: springs.opacity,
        }}
      >
        {text.split("").map((char, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
            {char}
          </span>
        ))}
      </AnimatedDiv>
    </div>
  );
};

// Add interface for SquishySearchCard props
interface SquishySearchCardProps {
  showSearchCard: boolean;
  onClose: () => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  onConfirm: () => void;
  vietnamProvinces: string[];
}

const SquishySearchCard = ({
  showSearchCard,
  onClose,
  selectedLocation,
  onLocationChange,
  onConfirm,
  vietnamProvinces,
}: SquishySearchCardProps) => {
  return (
    <motion.div
      className={`search-card ${showSearchCard ? "active" : ""}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: showSearchCard ? 1 : 0,
        scale: showSearchCard ? 1 : 0.8,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      <div className="search-card-content">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="search-card-title"
        >
          Tìm nơi bạn dự định sẽ đến
        </motion.span>

        <motion.div
          className="location-dropdown"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
          >
            <option value="">Chọn tỉnh thành</option>
            {vietnamProvinces.map((province: string, index: number) => (
              <option key={index} value={province}>
                {province}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div
          className="search-card-buttons"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className="search-card-btn cancel"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Hủy
          </motion.button>
          <motion.button
            className="search-card-btn confirm"
            onClick={onConfirm}
            disabled={!selectedLocation}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            OK
          </motion.button>
        </motion.div>
      </div>
      <Background />
    </motion.div>
  );
};

const Background = () => {
  return (
    <motion.svg
      width="320"
      height="384"
      viewBox="0 0 320 384"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.circle cx="160.5" cy="114.5" r="101.5" fill="#262626" />
      <motion.ellipse
        cx="160.5"
        cy="265.5"
        rx="101.5"
        ry="43.5"
        fill="#262626"
      />
    </motion.svg>
  );
};

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
  const [departureInput, setDepartureInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showSearchCard, setShowSearchCard] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  //Tạo các state riêng biệt:
  const [topDestinations, setTopDestinations] = useState([]);
  const [favoriteDestinations, setFavoriteDestinations] = useState([]);
  const [mustVisitCities, setMustVisitCities] = useState([]);

  // Sử dụng useTransition cho animation
  const [isPending, startTransition] = useTransition();

  // Tối ưu cho search và filter
  const deferredLocation = useDeferredValue(selectedLocation);

  const categories = [
    "Tất cả địa điểm",
    "Đà Nẵng",
    "Huế",
    "Nha Trang",
    "Hà Nội",
  ];

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
      // Wrap trong startTransition để animation mượt hơn
      startTransition(() => {
        handleCategorySelect(selectedLocation);
        setShowSearchCard(false);
      });
    }
  };

  // Sử dụng deferredLocation để tối ưu hiệu suất
  useEffect(() => {
    if (deferredLocation) {
      const filtered = destinations.filter(
        (dest) => dest.location === deferredLocation
      );
      setFilteredDestinations(filtered);
    }
  }, [deferredLocation]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const locationParam = searchParams.get("location");

    if (locationParam) {
      handleCategorySelect(locationParam);
    }
  }, []);

  //Thêm logic để fetch dữ liệu từ API
  // useEffect(() => {
  //   const fetchDestinations = async () => {
  //     try {
  //       const response = await fetch(
  //         "http://127.0.0.1:8000/recommend/homepage-place/"
  //       );
  //       const data = await response.json();
  //       setFilteredDestinations(data.places); // Cập nhật state với dữ liệu từ API
  //     } catch (error) {
  //       console.error("Error fetching destinations:", error);
  //     }
  //   };

  //   fetchDestinations();
  // }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/recommend/homepage-place/"
        );
        const data = await response.json();
        setTopDestinations(data.places.slice(0, 8)); // Chỉ lấy 3 địa điểm
        setFavoriteDestinations(data.places.slice(10, 14)); // Toàn bộ dữ liệu
        setMustVisitCities(data.places.slice(0, 4)); // Toàn bộ dữ liệu (hoặc lọc theo điều kiện khác)
      } catch (error) {
        console.error("Error fetching destinations:", error);
      }
    };

    fetchDestinations();
  }, []);

  const buttonSpring = useSpring({
    from: { scale: 1 },
    to: [{ scale: 1.1 }, { scale: 1 }],
    config: { tension: 300, friction: 10 },
    loop: true,
  });

  const AnimatedDiv = animated.div as ElementType;

  return (
    <div className="home-container">
      <header className="hero-section">
        <h1>The whole world awaits.</h1>

        <div className="search-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search destinations, hotels, activities..."
              onChange={(e) => {
                // Handle search input
                console.log(e.target.value);
              }}
            />
          </div>
        </div>
      </header>

      <div className="search-location-btn" onClick={handleSearchButtonClick}>
        <FaMapMarkerAlt />
      </div>
      <div className="search-btn-text">Bạn chưa biết phải đi đâu?</div>

      <div
        className={`overlay ${showSearchCard ? "active" : ""}`}
        onClick={handleCloseSearchCard}
      />

      <SquishySearchCard
        showSearchCard={showSearchCard}
        onClose={handleCloseSearchCard}
        selectedLocation={selectedLocation}
        onLocationChange={(value) => setSelectedLocation(value)}
        onConfirm={handleConfirmLocation}
        vietnamProvinces={vietnamProvinces}
      />

      <section className="destinations-section">
        <h2>Điểm Đến Được Yêu Thích Nhất</h2>
        <div className="destinations-grid">
          {favoriteDestinations.map((dest) => (
            <div
              key={dest.id}
              className="destination-card"
              draggable
              onDragStart={(e) => handleDragStart(e, dest)}
              onDragEnd={handleDragEnd}
            >
              <div className="relative">
                <img src={dest.img} alt={dest.title} />
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
        <h2>Top Địa Điểm Du Lịch Hấp Dẫn</h2>
        <div className="destinations-grid">
          {topDestinations.map((dest) => (
            <div className="destination-card" key={dest.title}>
              <div className="relative">
                <img src={dest.img} alt={dest.title} />
                {/* <Image
                  src={dest.img}
                  alt={dest.title}
                  width={300} // Chiều rộng cố định
                  height={200} // Chiều cao cố định
                  style={{ objectFit: "cover" }} // Thay thế objectFit
                /> */}
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
                    <h1>{dest.address}</h1>
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
        <h2>Những Thành Phố Không Thể Bỏ Lỡ!</h2>
        <div className="destinations-grid">
          {mustVisitCities.map((dest) => (
            <div key={dest.id} className="destination-card">
              <div className="relative">
                <img src={dest.img} alt={dest.title} />
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

      {/* <section className="honeymoon-section">
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
        </section> */}

      {/* <section className="hotels-section">
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
        </section> */}

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
