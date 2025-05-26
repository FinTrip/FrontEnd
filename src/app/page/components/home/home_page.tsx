"use client"
import type React from "react"
import { useState, type DragEvent, useEffect, useTransition, useDeferredValue, type ElementType } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import "./home_page.css"
import {
  FaPlus,
  FaMapMarkerAlt,
  FaSearch,
  FaHotel,
  FaCompass,
  FaGlobeAsia,
  FaUmbrellaBeach,
  FaMountain,
  FaArrowRight,
  FaRegClock,
  FaQuestionCircle,
} from "react-icons/fa"
import { animated, useSpring } from "@react-spring/web"
import { motion, AnimatePresence } from "framer-motion"

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
]

export interface DestinationCard {
  img: string
  title: string
  rating: number
  address: string
  description: string
}

interface HomePageProps {
  isInPlan?: boolean
  onAddToPlan?: (destination: DestinationCard) => void
  showAddButton?: boolean
}

export interface HotelCard {
  id: number
  name: string
  link: string
  description: string
  price: string
  name_nearby_place: string
  hotel_class: string
  img_origin: string
  location_rating: number
  amenities: string[]
}

interface Item {
  title: string
  rating: number
  description: string
  address: string
  img?: string
}

interface SearchResult {
  province: string
  food: Item[]
  places: Item[]
}

// Animated text component
const AnimatedText = ({ text }: { text: string }) => {
  const springs = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 300, friction: 10 },
    reset: true,
    loop: true,
  })

  const AnimatedDiv = animated.div as ElementType

  return (
    <div className="search-btn-text">
      <AnimatedDiv
        style={{
          transform: springs.y.to((y: any) => `translateY(${y}px)`),
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
  )
}

// Search card component
interface SquishySearchCardProps {
  showSearchCard: boolean
  onClose: () => void
  selectedLocation: string
  onLocationChange: (value: string) => void
  onConfirm: () => void
  vietnamProvinces: string[]
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
      <div className="search-card-decoration decoration-1"></div>
      <div className="search-card-decoration decoration-2"></div>

      <div className="search-card-content">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="search-card-title"
        >
          Bạn muốn đi đâu?
          <span>Chọn điểm đến mơ ước của bạn</span>
        </motion.span>

        <motion.div
          className="location-dropdown"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <select value={selectedLocation} onChange={(e) => onLocationChange(e.target.value)}>
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
            <span>Hủy</span>
          </motion.button>
          <motion.button
            className="search-card-btn confirm"
            onClick={onConfirm}
            disabled={!selectedLocation}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaSearch />
            <span>Tìm kiếm</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

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
      <motion.ellipse cx="160.5" cy="265.5" rx="101.5" ry="43.5" fill="#262626" />
    </motion.svg>
  )
}

// Add these interfaces near the top of the file, after existing interfaces
interface Destination {
  id: number;
  img: string;
  title: string;
  rating: number;
  address: string;
  description: string;
}

const HomePage = ({ isInPlan = false, onAddToPlan, showAddButton = false }: HomePageProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  const [selectedDestination, setSelectedDestination] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<HotelCard | null>(null)
  const [showHotelDetail, setShowHotelDetail] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("Tất cả địa điểm")
  const [filteredDestinations, setFilteredDestinations] = useState(destinations)
  const [departureInput, setDepartureInput] = useState("")
  const [destinationInput, setDestinationInput] = useState("")
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false)
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)
  const [showSearchCard, setShowSearchCard] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("")
  const [topDestinations, setTopDestinations] = useState<Destination[]>([])
  const [favoriteDestinations, setFavoriteDestinations] = useState<Destination[]>([])
  const [mustVisitCities, setMustVisitCities] = useState<Destination[]>([])
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  }

  const slideUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const slideRight = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const deferredLocation = useDeferredValue(selectedLocation)

  const categories = ["Tất cả địa điểm", "Đà Nẵng", "Huế", "Nha Trang", "Hà Nội"]

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
  ]

  const heroSlides = [
    {
      id: 1,
      title: "Khám phá Việt Nam",
      // subtitle: "Di sản thiên nhiên thế giới",
      image: "https://i.pinimg.com/736x/a8/00/14/a80014131a8b5726a9e65df7cda9aee7.jpg",
      code: "01",
    },
    {
      id: 2,
      title: "Khám phá Việt Nam",
      // subtitle: "Thành phố đèn lồng cổ kính",
      image: "https://i.pinimg.com/736x/11/90/c2/1190c224084a8c630a4f9d05d1281c60.jpg",
      code: "02",
    },
    {
      id: 3,
      title: "Khám phá Việt Nam",
      // subtitle: "Thiên đường trong sương",
      image: "https://i.pinimg.com/736x/4d/01/59/4d01591cb3b8b83fa0a50c00fc151e76.jpg",
      code: "03",
    },
  ]

  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setIsCategoryDropdownOpen(false)

    if (category === "Tất cả địa điểm") {
      setFilteredDestinations(destinations)
    } else {
      const filtered = destinations.filter((dest) => dest.address === category)
      setFilteredDestinations(filtered)
    }
  }

  const handleCardClick = (dest: any) => {
    setSelectedDestination(dest)
    setShowDetail(true)
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedDestination(null)
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, destination: DestinationCard) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "destination",
        data: {
          type: "place",
          title: destination.title,
          description: destination.description,
          image: destination.img,
          location: destination.address,
          rating: destination.rating,
        },
      })
    )
    e.currentTarget.classList.add("dragging")
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("dragging")
  }

  const handleAddToPlan = (dest: DestinationCard, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddToPlan) {
      onAddToPlan(dest)
    }
  }

  const handleHotelClick = (hotel: HotelCard) => {
    setSelectedHotel(hotel)
    setShowHotelDetail(true)
  }

  const handleCloseHotelDetail = () => {
    setShowHotelDetail(false)
    setSelectedHotel(null)
  }

  const handleDepartureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepartureInput(e.target.value)
    setShowDepartureDropdown(true)
  }

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestinationInput(e.target.value)
    setShowDestinationDropdown(true)
  }

  const handleProvinceSelect = (province: string, type: "departure" | "destination") => {
    if (type === "departure") {
      setDepartureInput(province)
      setShowDepartureDropdown(false)
    } else {
      setDestinationInput(province)
      setShowDestinationDropdown(false)
    }
  }

  const handleSearchButtonClick = () => {
    setShowSearchCard(true)
  }

  const handleCloseSearchCard = () => {
    setShowSearchCard(false)
    setSelectedLocation("")
  }

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      startTransition(() => {
        handleCategorySelect(selectedLocation)
        setShowSearchCard(false)
      })
    }
  }

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))
  }

  const goToSlide = (index: number) => {
    setActiveSlide(index)
  }

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // // Auto slide change
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     nextSlide()
  //   }, 5000)
  //   return () => clearInterval(interval)
  // }, [activeSlide])

  useEffect(() => {
    if (deferredLocation) {
      const filtered = destinations.filter((dest) => dest.address === deferredLocation)
      setFilteredDestinations(filtered)
    }
  }, [deferredLocation])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const locationParam = searchParams.get("location")

    if (locationParam) {
      handleCategorySelect(locationParam)
    }
  }, [])

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/recommend/homepage-place/")
        const data = await response.json()
        setTopDestinations(data.places.slice(0, 8))
        setFavoriteDestinations(data.places.slice(10, 14))
        setMustVisitCities(data.places.slice(0, 4))
      } catch (error) {
        console.error("Error fetching destinations:", error)
        // Use sample data if API fails
        setTopDestinations(destinations)
        setFavoriteDestinations(destinations)
        setMustVisitCities(destinations)
      }
    }

    fetchDestinations()
  }, [])

  const buttonSpring = useSpring({
    from: { scale: 1 },
    to: [{ scale: 1.1 }, { scale: 1 }],
    config: { tension: 300, friction: 10 },
    loop: true,
  })

  const AnimatedDiv = animated.div as ElementType

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.target as HTMLImageElement;
    if (!target.src.includes('placeholder.svg')) {
      target.src = "/placeholder.svg";
      target.onerror = null; // Prevent infinite loop if placeholder also fails
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader">
          <div className="loader-circle"></div>
          <div className="loader-text">Khám Phá Việt Nam</div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>

        <div className="hero-slider">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              className="hero-slide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div
                className="hero-slide-bg"
                style={{
                  backgroundImage: `url(${heroSlides[activeSlide].image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>

              <div className="hero-content">
                <motion.div
                  className="hero-slide-code"
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {heroSlides[activeSlide].code}
                </motion.div>

                <motion.h1
                  className="hero-title"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {heroSlides[activeSlide].title}
                </motion.h1>

                <motion.p
                  className="hero-subtitle"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {/* {heroSlides[activeSlide].subtitle} */}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="hero-controls">
            <button className="hero-arrow prev" onClick={prevSlide}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="hero-dots">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`hero-dot ${activeSlide === index ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                ></button>
              ))}
            </div>
            <button className="hero-arrow next" onClick={nextSlide}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Search Container */}
      {/* <motion.div
        className="search-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="search-bar">
          <div className="search-icon-wrapper">
            <FaSearch className="search-icon" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm điểm đến, khách sạn, hoạt động..."
            onChange={(e) => {
              console.log(e.target.value)
            }}
          />
          <button className="search-button">
            <FaSearch />
            Tìm kiếm
          </button>
        </div>
      </motion.div> */}

      {/* Explore Section */}
      {/* <motion.section
        className="explore-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="section-header">
          <motion.h2 variants={slideUp}>Khám Phá Việt Nam</motion.h2>
          <motion.p variants={slideUp}>Những điểm đến tuyệt vời đang chờ đón bạn</motion.p>
        </div>

        <motion.div
          className="explore-categories"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="explore-category" variants={slideUp}>
            <div className="category-icon">
              <FaMountain />
            </div>
            <h3>Núi</h3>
          </motion.div>
          <motion.div className="explore-category" variants={slideUp}>
            <div className="category-icon">
              <FaUmbrellaBeach />
            </div>
            <h3>Biển</h3>
          </motion.div>
          <motion.div className="explore-category" variants={slideUp}>
            <div className="category-icon">
              <FaHotel />
            </div>
            <h3>Khách sạn</h3>
          </motion.div>
          <motion.div className="explore-category" variants={slideUp}>
            <div className="category-icon">
              <FaCompass />
            </div>
            <h3>Khám phá</h3>
          </motion.div>
        </motion.div>
      </motion.section> */}


      {/* Add after explore-section and before destinations-section */}
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
            <h2 className="plan-assistance-title">Sẵn sàng cho chuyến đi của bạn?</h2>
            <p className="plan-assistance-text">
              Hãy để chúng tôi giúp bạn lập kế hoạch cho một chuyến đi hoàn hảo.
              Từ việc chọn điểm đến, đặt chỗ ở đến lịch trình chi tiết - tất cả đều được cá nhân hóa theo sở thích của bạn.
            </p>
            <Link href="/Q&A">
              <motion.div
                className="plan-assistance-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaQuestionCircle className="plan-assistance-icon" />
                <span>Bắt đầu lập kế hoạch ngay</span>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            className="plan-assistance-image"
            variants={slideRight}
          >
            <img
              src="https://i.pinimg.com/736x/33/df/4c/33df4cda6c650782b67d2e53d717cc05.jpg"
              alt="Plan your trip"
              className="rounded-lg shadow-xl"
              style={{ maxWidth: "400px", width: "100%" }}
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Add after plan-assistance-section and before destinations-section */}
      <motion.section
        className="search-banner"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="search-banner-pattern"></div>
        <div className="search-banner-border"></div>

        <motion.div
          className="search-banner-container"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            className="search-banner-content"
            variants={slideUp}
          >
            <h2 className="search-banner-title">Chưa biết đi đâu cho kỳ nghỉ sắp tới?</h2>
            <p className="search-banner-text">
              Khám phá vẻ đẹp Việt Nam với những điểm đến đầy mê hoặc. Từ những bãi biển xanh ngắt đến ruộng bậc thang mùa lúa chín, hay những phố cổ đậm chất lịch sử - chúng tôi sẽ giúp bạn tìm ra điểm đến hoàn hảo.
            </p>
            <motion.div
              className="search-banner-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearchButtonClick}
            >
              <FaMapMarkerAlt className="search-banner-icon" />
              <span>Khám phá điểm đến</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="search-banner-image"
            variants={slideRight}
          >
            <div className="lantern lantern-1"></div>
            <div className="lantern lantern-2"></div>
            <img
              src="https://i.pinimg.com/736x/97/b2/11/97b211143649cfadb5622e6e6db2a2d6.jpg"
              alt="Bản đồ Việt Nam"
              className="floating-map"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      <div className={`overlay ${showSearchCard ? "active" : ""}`} onClick={handleCloseSearchCard} />

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
        <div className="search-card-decoration decoration-1"></div>
        <div className="search-card-decoration decoration-2"></div>

        <div className="search-card-content">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="search-card-title"
          >
            Bạn muốn đi đâu?
            <span>Chọn điểm đến mơ ước của bạn</span>
          </motion.span>

          <motion.div
            className="location-dropdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
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
              onClick={handleCloseSearchCard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Hủy</span>
            </motion.button>
            <motion.button
              className="search-card-btn confirm"
              onClick={handleConfirmLocation}
              disabled={!selectedLocation}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSearch />
              <span>Tìm kiếm</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Featured Destinations */}
      <motion.section
        className="destinations-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="section-header">
          <motion.h2 variants={slideUp}>Điểm Đến Được Yêu Thích Nhất</motion.h2>
          <motion.p variants={slideUp}>Những địa điểm du lịch hàng đầu tại Việt Nam</motion.p>
        </div>

        <motion.div
          className="destinations-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {favoriteDestinations.map((dest: any, index) => (
            <motion.div
              key={dest.id || index}
              className="destination-card-wrapper"
              variants={slideUp}
            >
              <div
                className="destination-card"
                draggable
                onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, dest)}
                onDragEnd={(e: React.DragEvent<HTMLDivElement>) => handleDragEnd(e)}
              >
                <div className="card-image-container">
                  <img
                    src={dest.img || "/placeholder.svg"}
                    alt={dest.title}
                    onError={handleImageError}
                    className="card-image"
                  />
                  <div className="card-overlay"></div>
                  <div className="card-rating">
                    <span className="star">★</span> {dest.rating}
                  </div>
                  <button className="add-to-plan-btn" onClick={(e) => handleAddToPlan(dest, e)} aria-label="Add to plan">
                    <FaPlus />
                  </button>
                </div>
                <div className="card-content" onClick={() => handleCardClick(dest)}>
                  <h3>{dest.title}</h3>
                  <div className="card-details">
                    <div className="card-location">
                      <FaMapMarkerAlt className="location-icon" />
                      <span>{dest.address}</span>
                    </div>
                    <p className="card-description">
                      {dest.description.length > 100 ? dest.description.substring(0, 100) + "..." : dest.description}
                    </p>
                    <div className="card-footer">
                      <span className="explore-link">
                        Khám phá <FaArrowRight className="arrow-icon" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Top Destinations */}
      <motion.section
        className="recently-viewed"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="section-header">
          <motion.h2 variants={slideUp}>Top Địa Điểm Du Lịch Hấp Dẫn</motion.h2>
          <motion.p variants={slideUp}>Những điểm đến không thể bỏ lỡ trong hành trình khám phá Việt Nam</motion.p>
        </div>

        <motion.div
          className="destinations-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {topDestinations.map((dest: any, index) => (
            <motion.div key={dest.id || index} className="destination-card" variants={slideUp}>
              <div className="card-image-container">
                <img
                  src={dest.img || "/placeholder.svg"}
                  alt={dest.title}
                  onError={handleImageError}
                  className="card-image"
                />
                <div className="card-overlay"></div>
                <div className="card-rating">
                  <span className="star">★</span> {dest.rating}
                </div>
                <button className="add-to-plan-btn" onClick={(e) => handleAddToPlan(dest, e)} aria-label="Add to plan">
                  <FaPlus />
                </button>
              </div>
              <div className="card-content" onClick={() => handleCardClick(dest)}>
                <h3>{dest.title}</h3>
                <div className="card-details">
                  <div className="card-location">
                    <FaMapMarkerAlt className="location-icon" />
                    <span>{dest.address}</span>
                  </div>
                  <p className="card-description">
                    {dest.description.length > 100 ? dest.description.substring(0, 100) + "..." : dest.description}
                  </p>
                  <div className="card-footer">
                    <span className="explore-link">
                      Khám phá <FaArrowRight className="arrow-icon" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Must Visit Cities */}
      <motion.section
        className="packages-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="section-header">
          <motion.h2 variants={slideUp}>Những Thành Phố Không Thể Bỏ Lỡ!</motion.h2>
          <motion.p variants={slideUp}>Khám phá vẻ đẹp độc đáo của các thành phố nổi tiếng</motion.p>
        </div>

        <motion.div
          className="destinations-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {mustVisitCities.map((dest: any, index) => (
            <motion.div key={dest.id || index} className="destination-card featured-card" variants={slideUp}>
              <div className="card-image-container">
                <img
                  src={dest.img || "/placeholder.svg"}
                  alt={dest.title}
                  onError={handleImageError}
                  className="card-image"
                />
                <div className="card-overlay gradient-overlay"></div>
                <div className="card-rating">
                  <span className="star">★</span> {dest.rating}
                </div>
                <button className="add-to-plan-btn" onClick={(e) => handleAddToPlan(dest, e)} aria-label="Add to plan">
                  <FaPlus />
                </button>
                <div className="featured-badge">
                  <FaRegClock /> Xu hướng
                </div>
              </div>
              <div className="card-content" onClick={() => handleCardClick(dest)}>
                <h3>{dest.title}</h3>
                <div className="card-details">
                  <div className="card-location">
                    <FaMapMarkerAlt className="location-icon" />
                    <span>{dest.address || dest.location}</span>
                  </div>
                  <p className="card-description">
                    {dest.description.length > 100 ? dest.description.substring(0, 100) + "..." : dest.description}
                  </p>
                  <div className="card-footer">
                    <span className="explore-link">
                      Khám phá <FaArrowRight className="arrow-icon" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Destination Detail Modal */}
      {showDetail && selectedDestination && (
        <motion.div
          className="destination-detail-overlay active"
          onClick={handleCloseDetail}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="destination-detail-box"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="detail-image-container">
              <img
                src={selectedDestination.img || selectedDestination.image}
                alt={selectedDestination.title}
                onError={handleImageError}
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
                <FaMapMarkerAlt />
                <span>{selectedDestination.address || selectedDestination.location}</span>
              </div>
              <div className="detail-description">{selectedDestination.description}</div>
              <div className="detail-actions">
                <button className="detail-action-btn primary">
                  <FaPlus className="btn-icon" /> Thêm vào kế hoạch
                </button>
                {/* <button className="detail-action-btn secondary">
                  <FaGlobeAsia className="btn-icon" /> Xem trên bản đồ
                </button> */}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Hotel Detail Modal */}
      {showHotelDetail && selectedHotel && (
        <motion.div
          className="destination-detail-overlay active"
          onClick={handleCloseHotelDetail}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="destination-detail-box"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="detail-image-container">
              <img
                src={selectedHotel.img_origin || "/placeholder.svg"}
                alt={selectedHotel.name}
                onError={handleImageError}
              />
              <button className="detail-close-btn" onClick={handleCloseHotelDetail}>
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
                    <span className="hotel-info-value hotel-class-badge">{selectedHotel.hotel_class}</span>
                  </div>
                  <div className="hotel-info-item">
                    <span className="hotel-info-label">Giá phòng</span>
                    <span className="hotel-info-value hotel-price">{selectedHotel.price}/đêm</span>
                  </div>
                  <div className="hotel-info-item">
                    <span className="hotel-info-label">Địa điểm lân cận</span>
                    <span className="hotel-info-value">
                      <FaMapMarkerAlt /> {selectedHotel.name_nearby_place}
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
                <div className="detail-description">{selectedHotel.description}</div>
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
                  <a href={selectedHotel.link} target="_blank" rel="noopener noreferrer" className="booking-link">
                    Xem chi tiết và đặt phòng
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Newsletter Section */}
      <motion.section
        className="newsletter-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="newsletter-container">
          <motion.div className="newsletter-content" variants={slideRight}>
            <h3>Đăng ký nhận thông tin</h3>
            <h2>Nhận thông báo về các ưu đãi đặc biệt</h2>
            <p>Đăng ký để nhận thông tin về các điểm đến hấp dẫn và ưu đãi du lịch mới nhất</p>

            <div className="newsletter-form">
              <input type="email" placeholder="Địa chỉ email của bạn" />
              <button>Đăng ký</button>
            </div>
          </motion.div>

          <motion.div className="newsletter-image" variants={slideUp}>
            <img
              src="/images/Đảo Bình Ba.jpg"
              alt="Newsletter"
              onError={handleImageError}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Khám Phá</h3>
            <p>Về Chúng Tôi</p>
            <p>Liên Hệ</p>
            <p>Điều Khoản & Điều Kiện</p>
          </div>
          <div className="footer-section">
            <h3>Hỗ Trợ</h3>
            <p>Hỗ Trợ Khách Hàng</p>
            <p>Chính Sách Bảo Mật</p>
            <p>Câu Hỏi Thường Gặp</p>
          </div>
          <div className="footer-section">
            <h3>Kết Nối</h3>
            <div className="social-links">
              <Link href="#">Facebook</Link>
              <Link href="#">Twitter</Link>
              <Link href="#">Instagram</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2023 Khám Phá Việt Nam. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>

      <AnimatePresence>
        {(pathname === "/" || pathname === "/flight_hotel") && (
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
        )}
      </AnimatePresence>
    </div>
  )
}

export default HomePage