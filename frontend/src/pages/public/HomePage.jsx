import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaNewspaper,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaUsers,
  FaBuilding,
  FaHome,
  FaHands,
  FaHeart,
  FaStar,
  FaShieldAlt,
  FaGlobe,
  FaRocket,
  FaLightbulb,
  FaArrowRight,
  FaPlay,
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
  FaQuoteRight,
  FaClock,
  FaEye,
  FaShareAlt,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaMoon,
  FaSun,
  FaLanguage,
  FaBars,
  FaTimes,
  FaImage,
  FaBookOpen
} from 'react-icons/fa';
import { getLatestNews } from '../../api/newsApi';
import { getEvents } from '../../api/eventsApi';
import logo from '../../assets/Logo.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('am');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [rightSlideIndex, setRightSlideIndex] = useState(0);
  const autoPlayRef = useRef(null);
  const rightAutoPlayRef = useRef(null);

  // Refs for sections
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const newsRef = useRef(null);
  const eventsRef = useRef(null);
  const galleryRef = useRef(null);
  const publicationsRef = useRef(null);

  // Translations
  const translations = {
    am: {
      headerTitle: 'Immigration & Citizenship',
      headerSub: 'የኢሚግሬሽንና ዜግነት አገልግሎት',
      home: 'Home',
      about: 'About',
      news: 'News',
      events: 'Events',
      gallery: 'Gallery',
      publications: 'Publications',
      login: 'Login',
      loading: 'Loading...',
      aboutUs: 'ስለ እኛ',
      latestNews: 'የቅርብ ዜናዎች',
      upcomingEvents: 'መጪ ዝግጅቶች',
      readMore: 'Read More',
      learnMore: 'Learn More',
      view: 'ይመልከቱ',
      join: 'ይግቡ',
      joinCommunity: 'የእኛን ማህበረሰብ ይቀላቀሉ',
      communityDesc: 'የኢትዮጵያን ህይወት የሚቀይሩ እንቅስቃሴዎች ይሳተፉ። ለብልጽግና እና ለአንድነት የሚሰሩ በሺዎች የሚቆጠሩ አባላት ይቀላቀሉ።',
      joinNow: 'አሁን ይቀላቀሉ',
      aboutUsDesc: 'የኢሚግሬሽንና ዜግነት አገልግሎት - ብልጽግና ፓርቲ ህብረት',
      featured: 'የቅርብ ጊዜ ዜና',
      principles: 'የብልጽግና ፓርቲ መርሆች',
      democratic: 'ዴሞክራሲያዊነት',
      ruleOfLaw: 'የሕግ የበላይነት',
      development: 'ልማትና ፍትሐዊ ተጠቃሚነት',
      sustainable: 'ዘላቂ ኢኮኖሚ',
      vision: 'የብልጽግና ፓርቲ ራዕይ',
      visionQuote: 'የበለጸገች ኢትዮጵያን እውን ማድረግ',
      joinUs: 'Join Our Community',
      noDescription: 'No description available.',
      dateTBA: 'Date TBA',
      quickLinks: 'Quick Links',
      services: 'Services',
      contact: 'Contact',
      aboutParty: 'የብልፅግና ፓርቲ ዓላማዎች',
      principlesList: 'ሕዝባዊነት፣ ዴሞክራሲያዊነት፣ የሕግ የበላይነት፣ ልማትና ፍትሐዊ ተጠቃሚነት',
      memberRegistration: 'Member Registration',
      eventParticipation: 'Event Participation',
      galleryAccess: 'Gallery Access',
      newsUpdates: 'News Updates',
      allRights: 'All rights reserved.'
    },
    en: {
      headerTitle: 'Immigration & Citizenship',
      headerSub: 'የኢሚግሬሽንና ዜግነት አገልግሎት',
      home: 'Home',
      about: 'About',
      news: 'News',
      events: 'Events',
      gallery: 'Gallery',
      publications: 'Publications',
      login: 'Login',
      loading: 'Loading...',
      aboutUs: 'About Us',
      latestNews: 'Latest News',
      upcomingEvents: 'Upcoming Events',
      readMore: 'Read More',
      learnMore: 'Learn More',
      view: 'View',
      join: 'Join',
      joinCommunity: 'Join Our Community',
      communityDesc: 'Join thousands of members working for prosperity and unity.',
      joinNow: 'Join Now',
      aboutUsDesc: 'Immigration & Citizenship Services - Prosperity Party Unity',
      featured: 'Latest News',
      principles: 'Prosperity Party Principles',
      democratic: 'Democratic',
      ruleOfLaw: 'Rule of Law',
      development: 'Development & Equitable Benefit',
      sustainable: 'Sustainable Economy',
      vision: 'Prosperity Party Vision',
      visionQuote: 'Realizing a Prosperous Ethiopia',
      joinUs: 'Join Our Community',
      noDescription: 'No description available.',
      dateTBA: 'Date TBA',
      quickLinks: 'Quick Links',
      services: 'Services',
      contact: 'Contact',
      aboutParty: 'Prosperity Party Objectives',
      principlesList: 'Populism, Democracy, Rule of Law, Development & Equitable Benefit',
      memberRegistration: 'Member Registration',
      eventParticipation: 'Event Participation',
      galleryAccess: 'Gallery Access',
      newsUpdates: 'News Updates',
      allRights: 'All rights reserved.'
    }
  };

  const t = translations[language];

  // Smooth scroll function
  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      const headerOffset = 80;
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  // Navigation handler
  const handleNavClick = (section) => {
    switch(section) {
      case 'home':
        scrollToSection(homeRef);
        break;
      case 'about':
        scrollToSection(aboutRef);
        break;
      case 'news':
        scrollToSection(newsRef);
        break;
      case 'events':
        scrollToSection(eventsRef);
        break;
      case 'publications':
        navigate('/publications');
        break;
      case 'gallery':
        navigate('/gallery');
        break;
      default:
        break;
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [newsRes, eventsRes] = await Promise.all([
          getLatestNews(6),
          getEvents({ limit: 6 })
        ]);
        setNews(newsRes.data || []);
        setEvents(eventsRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Show right panel after 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRightPanel(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-slide for main hero
  useEffect(() => {
    if (news.length === 0) return;
    
    const startAutoPlay = () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      if (isPlaying) {
        autoPlayRef.current = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % Math.min(news.length, 3));
        }, 6000);
      }
    };
    
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [news.length, isPlaying]);

  // Auto-slide for right panel
  useEffect(() => {
    if (news.length < 3) return;
    
    const startRightAutoPlay = () => {
      if (rightAutoPlayRef.current) clearInterval(rightAutoPlayRef.current);
      if (isPlaying) {
        rightAutoPlayRef.current = setInterval(() => {
          setRightSlideIndex((prev) => (prev + 1) % Math.min(news.length, 5));
        }, 4000);
      }
    };
    
    startRightAutoPlay();
    return () => {
      if (rightAutoPlayRef.current) clearInterval(rightAutoPlayRef.current);
    };
  }, [news.length, isPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.min(news.length, 3));
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 5000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.min(news.length, 3)) % Math.min(news.length, 3));
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 5000);
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return '/assets/images/default-news.jpg';
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
    if (imageName.startsWith('uploads/')) return `/${imageName}`;
    return `/uploads/${encodeURIComponent(imageName)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const limitWords = (text, maxWords = 8) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const heroNews = news.slice(0, 3);
  const rightPanelNews = news.slice(0, 5);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'am' ? 'en' : 'am');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const aboutCards = [
    {
      icon: FaStar,
      title: language === 'am' ? 'የብልፅግና ፓርቲ ዓላማዎች' : 'Prosperity Party Objectives',
      description: language === 'am' 
        ? 'ጠንካራ፣ ዴሞክራሲያዊ እና ዘላቂ ሀገረ-መንግሥት ማቋቋም፣ ልማትና ፍትሐዊ ተጠቃሚነትን የሚያረጋግጥ ኢኮኖሚን ማብረር።'
        : 'Build a strong, democratic and sustainable state, drive an economy that ensures development and equitable benefit.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: FaRocket,
      title: language === 'am' ? 'የብልፅግና ፓርቲ ዓላማዎች' : 'Prosperity Party Objectives',
      description: language === 'am'
        ? 'አካታች የኢኮኖሚ ሥርዓት መገንባት፤ ሁለንተናዊ ብልጽግናን የሚያሰፍን ማኅበራዊ ልማትን ማረጋገጥ፤ ሀገራዊ ክብርንና ጥቅምን ማዕከል ያደረገ የውጭ ግንኙነት ማካሄድ።'
        : 'Build an inclusive economic system, ensure social development that fosters universal prosperity, conduct foreign relations centered on national dignity and interests.',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      icon: FaShieldAlt,
      title: language === 'am' ? 'መርሆች' : 'Principles',
      description: language === 'am'
        ? 'ሕዝባዊነት፣ ዴሞክራሲያዊነት፣ የሕግ የበላይነት፣ ልማትና ፍትሐዊ ተጠቃሚነት'
        : 'Populism, Democracy, Rule of Law, Development & Equitable Benefit',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const rightPanelVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.9, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2
      }
    }
  };

  // Nav links with section references - Updated with Publications
  const navLinks = [
    { id: 'home', label: t.home, ref: homeRef },
    { id: 'about', label: t.about, ref: aboutRef },
    { id: 'news', label: t.news, ref: newsRef },
    { id: 'events', label: t.events, ref: eventsRef },
    { id: 'publications', label: t.publications, ref: publicationsRef, isExternal: true, path: '/publications' },
    { id: 'gallery', label: t.gallery, ref: galleryRef, isExternal: true, path: '/gallery' }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Transparent Header */}
      <header className={`${isDarkMode ? 'bg-black/40 border-gray-700' : 'bg-black/30 border-white/10'} backdrop-blur-md shadow-none border-b sticky top-0 z-50 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => scrollToSection(homeRef)}>
              <img 
                src={logo} 
                alt="ICS Logo" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-lg shadow-md shadow-black/10 transition-transform group-hover:scale-105"
              />
              <div className="hidden sm:block">
                <h1 className={`text-sm md:text-base font-bold text-white leading-tight drop-shadow-md`}>
                  {t.headerTitle}
                </h1>
                <span className={`text-xs text-gray-300`}>{t.headerSub}</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-4 lg:gap-8">
              <div className="flex items-center gap-4 lg:gap-6">
                {navLinks.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.isExternal && item.path) {
                        navigate(item.path);
                      } else if (item.ref) {
                        scrollToSection(item.ref);
                      }
                    }}
                    className={`text-white/90 hover:text-white font-medium text-sm transition-colors relative group`}
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-white to-white/60 transition-all duration-300 group-hover:w-full"></span>
                  </button>
                ))}
              </div>
              <button
                onClick={toggleLanguage}
                className={`p-2.5 rounded-xl transition-all duration-300 bg-white/10 text-white hover:bg-white/20`}
                aria-label="Toggle language"
              >
                <span className="text-xs ml-1 font-medium">{language === 'am' ? 'EN' : 'አማ'}</span>
              </button>
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-xl transition-all duration-300 bg-white/10 text-yellow-400 hover:bg-white/20`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
              </button>
              <Link 
                to="/login" 
                className="bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm flex items-center gap-2 whitespace-nowrap border border-white/20"
              >
                {t.login}
                <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
              </Link>
            </nav>

            <button
              onClick={toggleMobileMenu}
              className={`md:hidden p-2.5 rounded-xl transition-all duration-300 text-white hover:bg-white/10`}
            >
              {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden py-4 border-t border-white/10 bg-black/50 backdrop-blur-md rounded-b-2xl"
              >
                <nav className="flex flex-col gap-3">
                  {navLinks.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.isExternal && item.path) {
                          navigate(item.path);
                        } else if (item.ref) {
                          scrollToSection(item.ref);
                        }
                        setIsMobileMenuOpen(false);
                      }}
                      className={`text-white/90 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-left`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="flex items-center gap-3 px-4 py-2">
                    <button
                      onClick={toggleLanguage}
                      className={`flex-1 px-4 py-2 rounded-xl transition-all duration-300 bg-white/10 text-white hover:bg-white/20 flex items-center justify-center gap-2`}
                    >
                      <FaLanguage className="text-sm" />
                      <span className="text-sm font-medium">{language === 'am' ? 'English' : 'አማርኛ'}</span>
                    </button>
                    <button
                      onClick={toggleDarkMode}
                      className={`flex-1 px-4 py-2 rounded-xl transition-all duration-300 bg-white/10 text-yellow-400 hover:bg-white/20 flex items-center justify-center gap-2`}
                    >
                      {isDarkMode ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
                      <span className="text-sm font-medium">{isDarkMode ? 'Light' : 'Dark'}</span>
                    </button>
                  </div>
                  <Link 
                    to="/login" 
                    className="bg-black/60 backdrop-blur-sm text-white px-4 py-3 rounded-xl font-semibold text-center hover:bg-black/80 transition-all duration-300 border border-white/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t.login}
                  </Link>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Hero Section - Two Column */}
      <section ref={homeRef} className="relative overflow-hidden bg-black -mt-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] md:min-h-[650px]">
            {/* Left Column - 70% */}
            <div className="lg:col-span-8 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {heroNews.map((item, index) => {
                  const imageUrl = getImageUrl(item.news_image);
                  return (
                    currentSlide === index && (
                      <motion.div
                        key={item.id}
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                        
                        {/* Content at Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-10">
                          <div className="max-w-3xl">
                            <motion.div
                              initial={{ y: 30, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.3, duration: 0.6 }}
                            >
                              <span className="inline-flex items-center gap-2 bg-blue-600/30 backdrop-blur-sm text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-2 border border-blue-400/20">
                                <FaNewspaper className="text-xs" />
                                {formatDate(item.newsdate)}
                              </span>
                              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-2 drop-shadow-lg line-clamp-3">
                                {limitWords(item.news_title, 7)}
                              </h1>
                              <p className="text-gray-200 text-xs sm:text-sm md:text-base max-w-xl mb-3 drop-shadow-md line-clamp-2">
                                {truncateText(item.news_des, 100)}
                              </p>
                              <div className="flex flex-wrap gap-2 sm:gap-3">
                                <Link 
                                  to={`/news/${item.id}`} 
                                  className="bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-black/30 hover:shadow-black/50 hover:-translate-y-0.5 flex items-center gap-2 text-xs sm:text-sm border border-white/20"
                                >
                                  {t.view} <FaArrowRight className="text-sm" />
                                </Link>
                                <Link to="/login" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-semibold border border-white/30 hover:border-white/50 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-xs sm:text-sm">
                                  {t.join}
                                </Link>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  );
                })}
              </AnimatePresence>

              <div className="absolute bottom-20 left-4 flex items-center gap-3 z-10">
                {heroNews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      currentSlide === index
                        ? 'bg-white w-6 sm:w-8 h-1.5 sm:h-2 shadow-lg'
                        : 'bg-white/40 hover:bg-white/60 w-1.5 sm:w-2 h-1.5 sm:h-2'
                    }`}
                  />
                ))}
              </div>

              {heroNews.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110 z-10 hidden sm:flex"
                  >
                    <FaChevronLeft className="text-xs sm:text-sm" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110 z-10 hidden sm:flex"
                  >
                    <FaChevronRight className="text-xs sm:text-sm" />
                  </button>
                </>
              )}
            </div>

            {/* Right Column - 30% Sliding News Carousel */}
            <motion.div
              variants={rightPanelVariants}
              initial="hidden"
              animate={showRightPanel ? "visible" : "hidden"}
              className="hidden lg:flex lg:col-span-4 bg-gradient-to-br from-blue-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-sm p-4 md:p-6 flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-400 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-blue-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-400 rounded-full blur-2xl animate-pulse delay-700"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400 text-lg animate-pulse">✦</span>
                  <span className="text-blue-300 text-xs font-semibold uppercase tracking-wider">{t.featured}</span>
                </div>

                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {rightPanelNews.length > 0 && (
                      <motion.div
                        key={rightSlideIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                      >
                        {rightPanelNews[rightSlideIndex] && (
                          <div>
                            <div className="w-full h-28 rounded-lg overflow-hidden mb-3">
                              <img 
                                src={getImageUrl(rightPanelNews[rightSlideIndex].news_image)} 
                                alt={rightPanelNews[rightSlideIndex].news_title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = '/assets/images/default-news.jpg'; }}
                              />
                            </div>
                            <p className="text-blue-300 text-xs mb-1">
                              {formatDate(rightPanelNews[rightSlideIndex].newsdate)}
                            </p>
                            <h4 className="text-white text-sm font-semibold leading-tight mb-2 line-clamp-2">
                              {limitWords(rightPanelNews[rightSlideIndex].news_title, 6)}
                            </h4>
                            <Link 
                              to={`/news/${rightPanelNews[rightSlideIndex].id}`}
                              className="text-yellow-400 hover:text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              {t.readMore} <FaArrowRight className="text-xs" />
                            </Link>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-center gap-1.5 mt-3">
                    {rightPanelNews.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setRightSlideIndex(idx)}
                        className={`transition-all duration-300 rounded-full ${
                          rightSlideIndex === idx
                            ? 'bg-yellow-400 w-5 h-1.5'
                            : 'bg-white/30 hover:bg-white/50 w-1.5 h-1.5'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={() => scrollToSection(newsRef)}
                    className="flex-1 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white px-3 py-1.5 rounded-xl font-semibold text-xs transition-all text-center border border-white/20 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    {t.news}
                  </button>
                  <Link to="/register" className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all text-center shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:-translate-y-0.5">
                    {t.joinNow}
                  </Link>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 text-white/30 text-xs font-medium z-10 hidden lg:block">
                {rightSlideIndex + 1} / {rightPanelNews.length}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className={`py-12 sm:py-16 transition-colors duration-300 scroll-mt-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <span className={`inline-block ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2`}>About Us</span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {t.aboutUs}
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full mx-auto mt-3"></div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {aboutCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  className={`group relative ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-100'} rounded-2xl p-5 sm:p-6 border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-blue-500/20 mb-3 sm:mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="text-white" />
                  </div>
                  <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-600'} transition-colors mb-2`}>{card.title}</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm leading-relaxed`}>{card.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">{t.learnMore}</span>
                    <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* News Section */}
      <section ref={newsRef} className={`py-12 sm:py-16 transition-colors duration-300 scroll-mt-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <span className={`inline-block ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2`}>Latest Updates</span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {t.latestNews}
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full mx-auto mt-3"></div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {news.map((item) => {
              const imageUrl = getImageUrl(item.news_image);
              return (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  className={`group ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}
                >
                  <div className="relative overflow-hidden h-40 sm:h-48">
                    <img 
                      src={imageUrl} 
                      alt={item.news_title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.src = '/assets/images/default-news.jpg'; }}
                    />
                    <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      {formatDate(item.newsdate)}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-600'} transition-colors mb-2 line-clamp-2`}>
                      {limitWords(item.news_title, 6)}
                    </h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm leading-relaxed line-clamp-3`}>
                      {truncateText(item.news_des, 100)}
                    </p>
                    <button
                      onClick={() => setSelectedNews(item)}
                      className="mt-3 text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-2 group"
                    >
                      {t.readMore} 
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Events Section */}
      <section ref={eventsRef} className={`py-12 sm:py-16 transition-colors duration-300 scroll-mt-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <span className={`inline-block ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2`}>Upcoming</span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {t.upcomingEvents}
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full mx-auto mt-3"></div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {events.map((event) => {
              const imageUrl = event.photo ? getImageUrl(event.photo) : '/uploads/meeting.jpg';
              return (
                <motion.div
                  key={event.id}
                  variants={cardVariants}
                  className={`group ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'} rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border`}
                >
                  <div className="relative overflow-hidden h-36 sm:h-44">
                    <img 
                      src={imageUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.src = '/uploads/meeting.jpg'; }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <span className="text-white text-xs font-semibold flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-400" />
                        {event.date ? formatDate(event.date) : t.dateTBA}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className={`text-base sm:text-lg font-bold ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-600'} transition-colors mb-1 line-clamp-1`}>
                      {limitWords(event.title, 5)}
                    </h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm leading-relaxed line-clamp-2`}>
                      {event.description || t.noDescription}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 text-xs sm:text-sm flex items-center gap-2">
                        {t.learnMore} <FaArrowRight className="text-xs" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* News Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-3 right-3 sm:top-5 sm:right-5 w-9 h-9 sm:w-11 sm:h-11 bg-blue-600 text-white border-none rounded-full text-xl sm:text-2xl cursor-pointer z-10 transition-all duration-300 hover:bg-blue-700 hover:rotate-90 shadow-lg shadow-black/20 flex items-center justify-center"
                onClick={() => setSelectedNews(null)}
              >
                ×
              </button>
              
              <div className="w-full h-48 sm:h-64 md:h-80 overflow-hidden">
                <img 
                  src={getImageUrl(selectedNews.news_image)} 
                  alt={selectedNews.news_title} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/assets/images/default-news.jpg'; }}
                />
              </div>
              
              <div className="p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-12rem)] sm:max-h-[calc(90vh-16rem)] md:max-h-[calc(90vh-20rem)]">
                <div className="mb-3 sm:mb-4">
                  <div className="text-blue-600 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1 sm:mb-2">
                    {formatDate(selectedNews.newsdate)}
                  </div>
                  <h2 className="text-gray-800 text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                    {selectedNews.news_title}
                  </h2>
                </div>
                
                <div className="text-gray-700 text-sm sm:text-base leading-relaxed space-y-3">
                  {selectedNews.news_des?.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-yellow-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-block bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-white/20">
              <FaHeart className="inline mr-2" /> {t.joinUs}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
              {t.joinCommunity}
            </h2>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              {t.communityDesc}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
              <Link to="/register" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-2xl shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2">
                {t.joinNow}
                <FaArrowRight className="text-sm" />
              </Link>
              <Link to="/login" className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base border-2 border-white/30 hover:border-white/50 transition-all duration-300 hover:-translate-y-1">
                {t.login}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-900 border-gray-800'} text-white border-t`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="ICS Logo" className="w-8 sm:w-10 h-8 sm:h-10 object-contain rounded-xl" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">{t.headerTitle}</h3>
                  <span className="text-xs text-gray-400">{t.headerSub}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Building a united and prosperous Ethiopia through inclusion, justice and service.
              </p>
              <div className="flex gap-2">
                {['📱', '🐦', '📺', '✉️'].map((icon, i) => (
                  <a key={i} href="#" className="w-8 sm:w-9 h-8 sm:h-9 bg-gray-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <span className="text-gray-400 hover:text-white text-sm sm:text-base">{icon}</span>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4 text-white">{t.quickLinks}</h4>
              <ul className="space-y-2">
                {['About Us', 'News', 'Events', 'Gallery', 'Publications'].map((item) => {
                  const sectionMap = {
                    'About Us': aboutRef,
                    'News': newsRef,
                    'Events': eventsRef,
                    'Gallery': null,
                    'Publications': null
                  };
                  const ref = sectionMap[item];
                  return (
                    <li key={item}>
                      {ref ? (
                        <button onClick={() => scrollToSection(ref)} className="text-gray-400 hover:text-white transition-colors text-sm">
                          {item}
                        </button>
                      ) : (
                        <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                          {item}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4 text-white">{t.services}</h4>
              <ul className="space-y-2">
                {[t.memberRegistration, t.eventParticipation, t.galleryAccess, t.newsUpdates].map((item) => (
                  <li key={item}>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm sm:text-base mb-4 text-white">{t.contact}</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-2"><span className="text-base">📍</span> Addis Ababa, Ethiopia</li>
                <li className="flex items-start gap-2"><span className="text-base">📞</span> +251-911-000000</li>
                <li className="flex items-start gap-2"><span className="text-base">✉️</span> info@icspp.gov.et</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
            © 2026 ICS - {t.allRights}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;