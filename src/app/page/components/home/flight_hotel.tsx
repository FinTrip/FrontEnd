"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  FaPlane, 
  FaHotel, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaSearch,
  FaSuitcase,
  FaUmbrellaBeach,
  FaQuestionCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import "./flight_hotel.css";

// Interface for Hotel
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

// Sample hotels data
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
    img_origin: "/placeholder.svg?height=400&width=600",
    location_rating: 4.8,
    amenities: ["Hồ bơi", "Spa", "Nhà hàng", "Phòng gym", "Bar"],
  },
  {
    id: 2,
    name: "Novotel Huế",
    link: "/placeholder.svg?height=400&width=600",
    description:
      "Tọa lạc bên sông Hương thơ mộng, khách sạn cung cấp không gian nghỉ dưỡng yên tĩnh và sang trọng.",
    price: "1,800,000 VND",
    name_nearby_place: "Cầu Trường Tiền",
    hotel_class: "4 sao",
    img_origin: "/placeholder.svg?height=400&width=600",
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
    img_origin: "/placeholder.svg?height=400&width=600",
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
    img_origin: "/placeholder.svg?height=400&width=600",
    location_rating: 4.7,
    amenities: ["Nhà hàng Pháp", "Spa", "Hồ bơi", "Bar", "Dịch vụ xe đạp"],
  },
];

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const slideUp = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100
    }
  }
};

const slideRight = {
  hidden: { x: -30, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100
    }
  }
};

// Thêm component hiển thị gợi ý với highlight từ khóa tìm kiếm
const LocationSuggestionItem = ({ 
  province, 
  searchText, 
  onClick,
  isSelected = false
}: { 
  province: string; 
  searchText: string; 
  onClick: (e: React.MouseEvent) => void;
  isSelected?: boolean;
}) => {
  // Tạo class cho item
  const itemClassName = `dropdown-item ${isSelected ? 'selected-item' : ''}`;
  
  if (!searchText) {
    return (
      <div className={itemClassName} onClick={onClick}>
        <FaMapMarkerAlt className="dropdown-icon" />
        {province}
      </div>
    );
  }

  const index = province.toLowerCase().indexOf(searchText.toLowerCase());
  if (index === -1) {
    return (
      <div className={itemClassName} onClick={onClick}>
        <FaMapMarkerAlt className="dropdown-icon" />
        {province}
      </div>
    );
  }

  return (
    <div className={itemClassName} onClick={onClick}>
      <FaMapMarkerAlt className="dropdown-icon" />
      {province.substring(0, index)}
      <span className="match-highlight">
        {province.substring(index, index + searchText.length)}
      </span>
      {province.substring(index + searchText.length)}
    </div>
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
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("flight");

  const departureDropdownRef = useRef<HTMLDivElement>(null);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);

  const vietnamProvinces = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", 
    "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", 
    "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", 
    "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", 
    "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", 
    "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", 
    "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", 
    "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", 
    "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", 
    "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", 
    "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", 
    "Huế", "Tiền Giang", "Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", 
    "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
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
    const value = e.target.value;
    setDepartureInput(value);
    
    // Luôn hiển thị dropdown khi có sự thay đổi trong input
    if (!showDepartureDropdown) {
      setShowDepartureDropdown(true);
    }
    
    // Nếu có một địa điểm chính xác khớp với giá trị nhập vào
    const exactMatch = vietnamProvinces.find(
      province => province.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch) {
      // Tự động chọn nếu khớp hoàn toàn
      setDepartureInput(exactMatch);
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationInput(value);
    
    // Luôn hiển thị dropdown khi có sự thay đổi trong input
    if (!showDestinationDropdown) {
      setShowDestinationDropdown(true);
    }
    
    // Nếu có một địa điểm chính xác khớp với giá trị nhập vào
    const exactMatch = vietnamProvinces.find(
      province => province.toLowerCase() === value.toLowerCase()
    );
    
    if (exactMatch) {
      // Tự động chọn nếu khớp hoàn toàn
      setDestinationInput(exactMatch);
    }
  };

  const handleProvinceSelect = (
    province: string,
    type: "departure" | "destination"
  ) => {
    if (type === "departure") {
      setDepartureInput(province);
      setTimeout(() => setShowDepartureDropdown(false), 150);
    } else {
      setDestinationInput(province);
      setTimeout(() => setShowDestinationDropdown(false), 150);
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
    setIsLoading(true);
    setFlights([]); // Reset flights data
    setRecommendedHotels([]); // Reset hotels data
    
    // Kiểm tra xem đã nhập đủ thông tin chưa
    if (!departureInput || !destinationInput || !flightDate) {
      alert("Vui lòng nhập đầy đủ thông tin điểm đi, điểm đến và ngày đi");
      setIsLoading(false);
      return;
    }
    
    const flightPayload = {
      origin: departureInput,
      destination: destinationInput,
      departure_date: flightDate
    };
    
    try {
      console.log("Đang tìm kiếm chuyến bay:", flightPayload);
      
      // Gọi API tìm chuyến bay
      const flightResponse = await fetch(
        "http://127.0.0.1:8000/recommend/rcm-flight/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flightPayload),
        }
      );
      
      const flightData = await flightResponse.json();
      console.log("Dữ liệu chuyến bay nhận được:", flightData);
      
      if (flightData && Array.isArray(flightData) && flightData.length > 0) {
        setFlights(flightData);
        console.log("Đã tìm thấy", flightData.length, "chuyến bay");
      } else {
        // Tạo dữ liệu mẫu nếu API không trả về kết quả
        console.log("API không trả về dữ liệu chuyến bay, tạo dữ liệu mẫu");
        const sampleFlights = [
          {
            outbound_flight_code: `VN${Math.floor(Math.random() * 1000)}`,
            cabin: "Economy",
            outbound_time: "08:30",
            fare_basis: "Economy Flex",
            base_price_vnd: "1,200,000 VND",
            total_price_vnd: "1,500,000 VND"
          },
          {
            outbound_flight_code: `VJ${Math.floor(Math.random() * 1000)}`,
            cabin: "Business",
            outbound_time: "12:15",
            fare_basis: "Business Flex",
            base_price_vnd: "2,500,000 VND",
            total_price_vnd: "3,200,000 VND"
          }
        ];
        setFlights(sampleFlights);
      }
      
    } catch (error) {
      console.error("Lỗi khi tìm kiếm chuyến bay:", error);
      // Tạo dữ liệu mẫu trong trường hợp lỗi
      const sampleFlights = [
        {
          outbound_flight_code: `VN${Math.floor(Math.random() * 1000)}`,
          cabin: "Economy",
          outbound_time: "08:30",
          fare_basis: "Economy Flex",
          base_price_vnd: "1,200,000 VND",
          total_price_vnd: "1,500,000 VND"
        }
      ];
      setFlights(sampleFlights);
    } finally {
      // Luôn gọi tìm kiếm khách sạn sau khi tìm kiếm chuyến bay
      // dù thành công hay thất bại
      await handleSearchHotels();
      setIsLoading(false);
    }
  };

  const handleSearchHotels = async () => {
    try {
      setIsLoading(true);
      // Tạo payload với đầy đủ thông tin cần thiết
      const hotelPayload = { 
        destination: destinationInput,
        checkInDate: flightDate, 
        adults: 2,
        nights: 1
      };
      
      console.log(`Đang tìm khách sạn tại: ${destinationInput}`);
      
      const hotelResponse = await fetch(
        "http://127.0.0.1:8000/recommend/rcm-hotel/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(hotelPayload),
        }
      );
      
      const hotelData = await hotelResponse.json();
      console.log("Dữ liệu khách sạn nhận được:", hotelData);
      
      // Kiểm tra dữ liệu trả về và xử lý phù hợp
      if (hotelData && hotelData.hotels && hotelData.hotels.length > 0) {
        // Nếu có dữ liệu, sử dụng dữ liệu từ API
        const hotelsArray = hotelData.hotels.slice(0, 12);
        setRecommendedHotels(hotelsArray);
        console.log(`Đã tìm thấy ${hotelsArray.length} khách sạn tại ${destinationInput}`);
      } else {
        // Nếu không có dữ liệu từ API, sử dụng dữ liệu mẫu
        console.log("Không có dữ liệu từ API, sử dụng dữ liệu mẫu");
        
        // Tạo dữ liệu mẫu cho địa điểm cụ thể
        const sampleHotelsForDestination = createSampleHotelsForLocation(destinationInput);
        setRecommendedHotels(sampleHotelsForDestination);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm khách sạn:", error);
      
      // Trong trường hợp lỗi, vẫn hiển thị dữ liệu mẫu
      const sampleHotelsForDestination = createSampleHotelsForLocation(destinationInput);
      setRecommendedHotels(sampleHotelsForDestination);
      console.log(`Đã tạo dữ liệu mẫu cho ${destinationInput}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Tạo hàm mới để tạo dữ liệu mẫu dựa trên địa điểm
  const createSampleHotelsForLocation = (location: string): HotelCard[] => {
    // Tạo dữ liệu mẫu phù hợp với từng địa điểm
    type LocationData = {
      imgPrefix: string;
      nearbyPlaces: string[];
      priceRange: string[];
    };
    
    let locationSpecificData: LocationData = {
      imgPrefix: "/placeholder.svg",
      nearbyPlaces: ["Trung tâm thành phố", "Khu du lịch", "Khu mua sắm", "Công viên"],
      priceRange: ["1,500,000", "2,000,000", "2,800,000", "3,200,000"]
    };
    
    switch(location.toLowerCase()) {
      case "đà nẵng":
        locationSpecificData = {
          imgPrefix: "https://i.pinimg.com/736x/bd/b3/06/bdb3065fbfc55969e85606b203f08501.jpg",
          nearbyPlaces: ["Bãi biển Mỹ Khê", "Cầu Rồng", "Bà Nà Hills", "Sơn Trà"],
          priceRange: ["1,800,000", "2,500,000", "3,200,000", "4,000,000"]
        };
        break;
      case "hà nội":
        locationSpecificData = {
          imgPrefix: "https://i.pinimg.com/736x/a8/00/14/a80014131a8b5726a9e65df7cda9aee7.jpg",
          nearbyPlaces: ["Hồ Gươm", "Phố Cổ", "Văn Miếu", "Lăng Bác"],
          priceRange: ["1,500,000", "2,200,000", "3,000,000", "3,500,000"]
        };
        break;
      case "hồ chí minh":
        locationSpecificData = {
          imgPrefix: "https://i.pinimg.com/736x/23/67/ce/2367ce2b72eb90da3ec983bf605ca36e.jpg",
          nearbyPlaces: ["Phố đi bộ Nguyễn Huệ", "Chợ Bến Thành", "Nhà thờ Đức Bà", "Phố Tây"],
          priceRange: ["1,600,000", "2,300,000", "3,100,000", "3,800,000"]
        };
        break;
    }
    
    // Tạo mảng khách sạn mẫu với thông tin phù hợp với địa điểm
    return Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      name: `${getHotelNamePrefix(index)} ${location}`,
      link: `https://example.com/hotel-${index + 1}`,
      description: `Khách sạn sang trọng tại ${location} với vị trí đắc địa gần ${locationSpecificData.nearbyPlaces[index % locationSpecificData.nearbyPlaces.length]}. Cung cấp đầy đủ tiện nghi và dịch vụ cao cấp.`,
      price: `${locationSpecificData.priceRange[index % locationSpecificData.priceRange.length]} VND`,
      name_nearby_place: locationSpecificData.nearbyPlaces[index % locationSpecificData.nearbyPlaces.length],
      hotel_class: `${Math.min(5, Math.max(3, Math.floor(Math.random() * 3) + 3))} sao`,
      img_origin: index < 4 ? locationSpecificData.imgPrefix : "/placeholder.svg",
      location_rating: parseFloat((4 + Math.random()).toFixed(1)),
      amenities: ["Hồ bơi", "Wifi miễn phí", "Nhà hàng", "Phòng gym", "Spa", "Dịch vụ đưa đón"]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4 + Math.floor(Math.random() * 3))
    }));
  };

  // Hàm trợ giúp để tạo tên khách sạn đa dạng
  const getHotelNamePrefix = (index: number): string => {
    const prefixes = [
      "Vinpearl Resort", "Melia Hotel", "Novotel", "Hilton", 
      "Continental", "Intercontinental", "Marriott", "Sheraton",
      "Pullman", "Hyatt Regency", "Renaissance", "Sofitel",
      "Crowne Plaza", "Grand Mercure", "Holiday Inn", "Anantara"
    ];
    return prefixes[index % prefixes.length];
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.target as HTMLImageElement;
    if (!target.src.includes('placeholder.svg')) {
      target.src = "/placeholder.svg";
      target.onerror = null; // Prevent infinite loop if placeholder also fails
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Xử lý dropdown điểm đi
      if (departureDropdownRef.current && !departureDropdownRef.current.contains(event.target as Node)) {
        setShowDepartureDropdown(false);
      }
      
      // Xử lý dropdown điểm đến
      if (destinationDropdownRef.current && !destinationDropdownRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Thêm hàm tìm kiếm gợi ý phù hợp
  const getFilteredProvinces = (input: string) => {
    if (!input) return vietnamProvinces.slice(0, 5);
    
    // Tìm chính xác trước (ưu tiên cao nhất)
    const exactMatches = vietnamProvinces.filter(province => 
      province.toLowerCase() === input.toLowerCase()
    );
    
    // Tìm những tỉnh/thành phố bắt đầu bằng input (ưu tiên thứ hai)
    const startsWithMatches = vietnamProvinces.filter(province => 
      province.toLowerCase().startsWith(input.toLowerCase()) && 
      !exactMatches.includes(province)
    );
    
    // Tìm những tỉnh/thành phố chứa input ở bất kỳ vị trí nào (ưu tiên thứ ba)
    const containsMatches = vietnamProvinces.filter(province => 
      province.toLowerCase().includes(input.toLowerCase()) && 
      !exactMatches.includes(province) && 
      !startsWithMatches.includes(province)
    );
    
    // Kết hợp các kết quả theo thứ tự ưu tiên
    return [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, 10);
  };

  return (
    <div className="flight-hotel-container">
      {/* Hero Section */}
      <motion.div 
        className="hero-section"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="hero-overlay"></div>
        <div className="floating-elements">
          <motion.div 
            className="floating-element plane-1"
            animate={{ 
              x: [0, 100, 200, 100, 0],
              y: [0, 30, 0, -30, 0],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 20,
              ease: "linear" 
            }}
          >
            <FaPlane size={60} />
          </motion.div>
          <motion.div 
            className="floating-element plane-2"
            animate={{ 
              x: [200, 100, 0, -100, -200, -100, 0, 100, 200],
              y: [50, 30, 0, -30, 0, 30, 60, 30, 50],
              rotate: [10, 5, 0, -5, -10, -5, 0, 5, 10]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 25,
              ease: "linear" 
            }}
          >
            <FaPlane size={40} />
          </motion.div>
          <motion.div 
            className="floating-element hotel-1"
            animate={{ 
              y: [0, 15, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 6,
              ease: "easeInOut" 
            }}
          >
            <FaHotel size={70} />
          </motion.div>
          <motion.div 
            className="floating-element beach"
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 8,
              ease: "easeInOut" 
            }}
          >
            <FaUmbrellaBeach size={50} />
          </motion.div>
          <motion.div 
            className="floating-element suitcase"
            animate={{ 
              y: [0, -15, 0],
              x: [0, 10, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 7,
              ease: "easeInOut" 
            }}
          >
            <FaSuitcase size={45} />
          </motion.div>
        </div>
        
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">Khám Phá Điểm Đến Mơ Ước</h1>
            <p className="hero-subtitle">Tìm kiếm chuyến bay và khách sạn cho chuyến đi của bạn</p>
          </motion.div>
          
          <motion.div 
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Khách sạn</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Điểm đến</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Hỗ trợ</span>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="scroll-indicator"
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut" 
          }}
        >
          <span>Khám phá ngay</span>
          <div className="scroll-arrow"></div>
        </motion.div>
      </motion.div>

      {/* Search Section */}
      <motion.div 
        className="search-container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={slideUp}
      >
        <div className="search-tabs">
          <button 
            className={`tab-button ${activeTab === 'flight' ? 'active' : ''}`}
            onClick={() => setActiveTab('flight')}
          >
            <FaPlane className="tab-icon" />
            <span>Chuyến bay & Khách sạn</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'hotel' ? 'active' : ''}`}
            onClick={() => setActiveTab('hotel')}
          >
            <FaHotel className="tab-icon" />
            <span>Chỉ khách sạn</span>
          </button>
        </div>
        
        <div className="search-form">
          <div className="search-row">
            <div className="search-field">
              <label>
                <FaMapMarkerAlt className="field-icon" /> Điểm đi
              </label>
              <div className="input-container" ref={departureDropdownRef}>
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  value={departureInput}
                  onChange={handleDepartureChange}
                  placeholder="Chọn điểm khởi hành"
                  onFocus={() => setShowDepartureDropdown(true)}
                  className={showDepartureDropdown ? "active-input" : ""}
                />
                {showDepartureDropdown && (
                  <div className="dropdown-menu">
                    {getFilteredProvinces(departureInput).map((province, index) => (
                      <LocationSuggestionItem
                        key={index}
                        province={province}
                        searchText={departureInput}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProvinceSelect(province, "departure");
                        }}
                        isSelected={province === departureInput}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="search-field">
              <label>
                <FaMapMarkerAlt className="field-icon" /> Điểm đến
              </label>
              <div className="input-container" ref={destinationDropdownRef}>
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  value={destinationInput}
                  onChange={handleDestinationChange}
                  placeholder="Chọn điểm đến"
                  onFocus={() => setShowDestinationDropdown(true)}
                  className={showDestinationDropdown ? "active-input" : ""}
                />
                {showDestinationDropdown && (
                  <div className="dropdown-menu">
                    {getFilteredProvinces(destinationInput).map((province, index) => (
                      <LocationSuggestionItem
                        key={index}
                        province={province}
                        searchText={destinationInput}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProvinceSelect(province, "destination");
                        }}
                        isSelected={province === destinationInput}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="search-row">
            <div className="search-field">
              <label>
                <FaCalendarAlt className="field-icon" /> Ngày đi
              </label>
              <input
                type="date"
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
                className="date-input"
              />
            </div>

            <button className="search-button" onClick={handleSearchFlight} disabled={isLoading}>
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <FaSearch className="search-icon" />
                  Tìm kiếm
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Popular Destinations */}
      <motion.section 
        className="popular-destinations"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="section-header">
          <h2>Điểm Đến Phổ Biến</h2>
          <p>Khám phá những điểm đến được yêu thích nhất tại Việt Nam</p>
        </div>
        
        <motion.div 
          className="destinations-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="destination-card" variants={slideUp}>
            <div className="destination-image">
              <Image 
                src="https://i.pinimg.com/736x/c8/6c/0a/c86c0ae0fb335d348bb24b0e8ae2bb73.jpg" 
                alt="Đà Nẵng" 
                width={600} 
                height={400}
                className="img-cover"
              />
              <div className="destination-overlay">
                <h3>Đà Nẵng</h3>
                <p>Thành phố của những cây cầu</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div className="destination-card" variants={slideUp}>
            <div className="destination-image">
              <Image 
                src="https://i.pinimg.com/736x/d4/33/3f/d4333f98a2aff25837708d84847ebee5.jpg" 
                alt="Hà Nội" 
                width={600} 
                height={400}
                className="img-cover"
              />
              <div className="destination-overlay">
                <h3>Hà Nội</h3>
                <p>Thủ đô ngàn năm văn hiến</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div className="destination-card" variants={slideUp}>
            <div className="destination-image">
              <Image 
                src="https://i.pinimg.com/736x/23/67/ce/2367ce2b72eb90da3ec983bf605ca36e.jpg" 
                alt="Hồ Chí Minh" 
                width={600} 
                height={400}
                className="img-cover"
              />
              <div className="destination-overlay">
                <h3>Hồ Chí Minh</h3>
                <p>Thành phố không ngủ</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div className="destination-card" variants={slideUp}>
            <div className="destination-image">
              <Image 
                src="https://i.pinimg.com/736x/bd/b3/06/bdb3065fbfc55969e85606b203f08501.jpg" 
                alt="Huế" 
                width={600} 
                height={400}
                className="img-cover"
              />
              <div className="destination-overlay">
                <h3>Huế</h3>
                <p>Cố đô lịch sử</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Flight Results */}
      {flights.length > 0 && (
        <motion.section 
          className="results-section"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="section-header">
            <h2>Kết Quả Tìm Kiếm Chuyến Bay</h2>
            <p>Từ {departureInput} đến {destinationInput}</p>
          </div>
          
          <motion.div 
            className="results-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {flights.map((flight, index) => (
              <motion.div 
                key={index} 
                className="flight-card"
                variants={slideUp}
              >
                <div className="flight-header">
                  <div className="flight-code">{flight.outbound_flight_code}</div>
                  <div className="flight-class">{flight.cabin}</div>
                </div>
                
                <div className="flight-body">
                  <div className="flight-route">
                    <div className="route-point">
                      <div className="point-marker departure"></div>
                      <div className="point-details">
                        <span className="point-city">{departureInput}</span>
                        <span className="point-time">{flight.outbound_time}</span>
                      </div>
                    </div>
                    
                    <div className="route-line">
                      <FaPlane className="route-plane" />
                    </div>
                    
                    <div className="route-point">
                      <div className="point-marker arrival"></div>
                      <div className="point-details">
                        <span className="point-city">{destinationInput}</span>
                        <span className="point-time">Arrival</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flight-details">
                    <div className="detail-item">
                      <span className="detail-label">Loại vé:</span>
                      <span className="detail-value">{flight.fare_basis}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Giá cơ bản:</span>
                      <span className="detail-value">{flight.base_price_vnd}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flight-footer">
                  <div className="flight-price">{flight.total_price_vnd}</div>
                  <button className="select-button">Chọn</button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Recommended Hotels */}
      {recommendedHotels.length > 0 && (
        <motion.section 
          className="results-section"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="section-header">
            <h2>Khách Sạn Được Đề Xuất</h2>
            <p>Tại {destinationInput}</p>
          </div>
          
          <motion.div 
            className="hotels-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {recommendedHotels.map((hotel, index) => (
              <motion.div 
                key={index} 
                className="hotel-card"
                variants={slideUp}
                onClick={() => handleHotelClick(hotel)}
              >
                <div className="hotel-image">
                  <Image 
                    src={hotel.img_origin || "/placeholder.svg"} 
                    alt={hotel.name} 
                    width={600} 
                    height={400}
                    onError={handleImageError}
                    className="img-cover"
                  />
                  <div className="hotel-badge">{hotel.hotel_class}</div>
                </div>
                
                <div className="hotel-content">
                  <h3 className="hotel-name">{hotel.name}</h3>
                  
                  <div className="hotel-location">
                    <FaMapMarkerAlt className="location-icon" />
                    <span>{hotel.name_nearby_place}</span>
                  </div>
                  
                  <div className="hotel-rating">
                    {Array.from({ length: Math.floor(hotel.location_rating) }).map((_, i) => (
                      <span key={i} className="star-icon">★</span>
                    ))}
                    <span className="rating-number">{hotel.location_rating}</span>
                  </div>
                  
                  <p className="hotel-description">
                    {hotel.description.length > 100
                      ? hotel.description.substring(0, 100) + "..."
                      : hotel.description}
                  </p>
                  
                  <div className="hotel-footer">
                    <div className="hotel-price">{hotel.price}<span>/đêm</span></div>
                    <button className="view-button">Xem chi tiết</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Featured Hotels */}
      <motion.section 
        className="featured-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="section-header">
          <h2>Khách Sạn Nổi Bật</h2>
          <p>Những lựa chọn hàng đầu cho chuyến đi của bạn</p>
        </div>
        
        <motion.div 
          className="hotels-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {hotels.map((hotel, index) => (
            <motion.div 
              key={hotel.id} 
              className="hotel-card"
              variants={slideUp}
              onClick={() => handleHotelClick(hotel)}
            >
              <div className="hotel-image">
                <Image 
                  src={hotel.img_origin || "/placeholder.svg"} 
                  alt={hotel.name} 
                  width={600} 
                  height={400}
                  onError={handleImageError}
                  className="img-cover"
                />
                <div className="hotel-badge">{hotel.hotel_class}</div>
              </div>
              
              <div className="hotel-content">
                <h3 className="hotel-name">{hotel.name}</h3>
                
                <div className="hotel-location">
                  <FaMapMarkerAlt className="location-icon" />
                  <span>{hotel.name_nearby_place}</span>
                </div>
                
                <div className="hotel-rating">
                  {Array.from({ length: Math.floor(hotel.location_rating) }).map((_, i) => (
                    <span key={i} className="star-icon">★</span>
                  ))}
                  <span className="rating-number">{hotel.location_rating}</span>
                </div>
                
                <p className="hotel-description">
                  {hotel.description.length > 100
                    ? hotel.description.substring(0, 100) + "..."
                    : hotel.description}
                </p>
                
                <div className="hotel-amenities">
                  {hotel.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className="amenity-tag">{amenity}</span>
                  ))}
                  {hotel.amenities.length > 3 && (
                    <span className="amenity-more">+{hotel.amenities.length - 3}</span>
                  )}
                </div>
                
                <div className="hotel-footer">
                  <div className="hotel-price">{hotel.price}<span>/đêm</span></div>
                  <button className="view-button">Xem chi tiết</button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Hotel Detail Modal */}
      {showHotelDetail && selectedHotel && (
        <motion.div 
          className="hotel-detail-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="modal-overlay" onClick={handleCloseHotelDetail}></div>
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <button className="modal-close" onClick={handleCloseHotelDetail}>×</button>
            
            <div className="modal-header">
              <Image 
                src={selectedHotel.img_origin || "/placeholder.svg"} 
                alt={selectedHotel.name} 
                width={800} 
                height={400}
                onError={handleImageError}
                className="modal-image"
              />
              <div className="modal-title">
                <h2>{selectedHotel.name}</h2>
                <div className="modal-subtitle">
                  <span className="hotel-class">{selectedHotel.hotel_class || "Khách sạn"}</span>
                  <span className="location">
                    <FaMapMarkerAlt /> {selectedHotel.name_nearby_place || "Vị trí đẹp"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="modal-description">
                <h3>Thông tin</h3>
                <p>{selectedHotel.description || "Khách sạn sang trọng với nhiều tiện nghi hiện đại."}</p>
              </div>
              
              <div className="modal-amenities">
                <h3>Tiện nghi</h3>
                <div className="amenities-grid">
                  {(selectedHotel.amenities && selectedHotel.amenities.length > 0) ? (
                    selectedHotel.amenities.map((amenity, index) => (
                      <div key={index} className="amenity-item">
                        <div className="amenity-icon">✓</div>
                        <div className="amenity-name">{amenity}</div>
                      </div>
                    ))
                  ) : (
                    // Tiện ích mặc định nếu không có dữ liệu
                    ["Wifi", "Nhà hàng", "Bể bơi", "Spa", "Phòng gym"].map((amenity, index) => (
                      <div key={index} className="amenity-item">
                        <div className="amenity-icon">✓</div>
                        <div className="amenity-name">{amenity}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="modal-price-section">
                <div className="price-box">
                  <div className="price-label">Giá mỗi đêm từ</div>
                  <div className="price-value">{selectedHotel.price || "1,500,000 VND"}</div>
                  <div className="price-includes">Đã bao gồm thuế và phí</div>
                </div>
                
                <button className="book-button">Chọn địa điểm này</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add before the newsletter section */}
      <motion.section 
        className="plan-assistance-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="plan-assistance-decoration decoration-1"></div>
        <div className="plan-assistance-decoration decoration-2"></div>
        
        <motion.div 
          className="plan-assistance-container"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div 
            className="plan-assistance-content"
            variants={slideUp}
          >
            <h2 className="plan-assistance-title">Cần trợ giúp lập kế hoạch?</h2>
            <p className="plan-assistance-text">
              Để chuyến đi của bạn trở nên hoàn hảo hơn, hãy để chúng tôi giúp bạn lên kế hoạch chi tiết.
              Từ việc chọn chuyến bay, khách sạn đến các hoạt động thú vị - tất cả đều được tối ưu hóa cho bạn.
            </p>
            <Link href="/Q&A">
              <motion.div 
                className="plan-assistance-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaQuestionCircle className="plan-assistance-icon" />
                <span>Nhận hỗ trợ ngay</span>
              </motion.div>
            </Link>
          </motion.div>
          
          <motion.div 
            className="plan-assistance-image"
            variants={slideRight}
          >
            <img 
              src="https://i.pinimg.com/736x/33/df/4c/33df4cda6c650782b67d2e53d717cc05.jpg" 
              alt="Travel planning assistance"
              className="rounded-lg shadow-xl"
              style={{ maxWidth: "400px", width: "100%" }}
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Newsletter Section */}
      <motion.section 
        className="newsletter-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="newsletter-container">
          <motion.div 
            className="newsletter-content"
            variants={slideUp}
          >
            <h2>Đăng ký nhận thông tin ưu đãi</h2>
            <p>Nhận thông báo về các ưu đãi đặc biệt và khuyến mãi mới nhất</p>
            
            <div className="newsletter-form">
              <input type="email" placeholder="Địa chỉ email của bạn" />
              <button>Đăng ký</button>
            </div>
          </motion.div>
          
          <motion.div 
            className="newsletter-image"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Image 
              src="/placeholder.svg?height=400&width=600" 
              alt="Newsletter" 
              width={600} 
              height={400}
              className="img-cover"
            />
          </motion.div>
        </div>
      </motion.section>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* <Link href="/Q&A">
            <div className="qa-navigation-button">
              <FaQuestionCircle className="qa-icon" />
              <span className="qa-text">Hỗ trợ lập kế hoạch</span>
            </div>
          </Link> */}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FlightHotel;
