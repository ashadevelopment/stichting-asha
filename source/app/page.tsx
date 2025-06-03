"use client";

import Image from "next/image";
import { FolderKanban, Calendar, ChevronLeft, ChevronRight, CircleAlert, MapPin, Mail, Handshake, BookCopy, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import Footer from "../components/Footer";

import { animate } from 'animejs';
import LogoSlider from "../components/LogoSlider";

// Define the NoticeType interface
interface NoticeType {
  _id: string;
  title: string;
  message: string;
  roles: string[];
  expirationDate: string;
  author: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define Project interface
interface Project {
  _id: string;
  title: string;
  description: string;
  image?: {
    contentType: string;
    data: string;
  };
  projectDate: string;
}

// Define CarouselItem interface for projects
interface CarouselItem {
  id: string;
  title: string;
  description?: string;
  imageData?: string;
  imageContentType?: string;
  date?: string;
}

interface PartnerLogo {
  id: number;
  src: string;
  alt: string;
}

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [notice, setNotice] = useState<NoticeType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Animation refs
  const visieRef = useRef(null);
  const missieRef = useRef(null);
  const mediaRef = useRef(null);
  const meerOverTitleRef = useRef(null);
  const geschiedenisRef = useRef(null);
  const brugRef = useRef(null);
  const imageRef = useRef(null);
  const featuresRef = useRef(null);
  const bottomBannerRef = useRef(null);
  
  // Carousel states
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselError, setCarouselError] = useState<string | null>(null);

  const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>([]);
  const [partnerLogosLoading, setPartnerLogosLoading] = useState(true);
  const [partnerLogosError, setPartnerLogosError] = useState<string | null>(null);

  // Animation useEffect
  useEffect(() => {
    const animateOnScroll = (element: HTMLElement) => {
      animate(element, {
        opacity: [0, 1],
        translateY: [50, 0],
        easing: "easeOutExpo",
        duration: 1000,
      });
    };

    const animateTitle = (element: HTMLElement) => {
      animate(element, {
        opacity: [0, 1],
        scale: [0.8, 1],
        translateY: [30, 0],
        easing: "easeOutElastic(1, .8)",
        duration: 1200,
      });
    };

    const animateFromLeft = (element: HTMLElement) => {
      animate(element, {
        opacity: [0, 1],
        translateX: [-100, 0],
        easing: "easeOutCubic",
        duration: 1000,
      });
    };

    const animateFromRight = (element: HTMLElement) => {
      animate(element, {
        opacity: [0, 1],
        translateX: [100, 0],
        easing: "easeOutCubic",
        duration: 1000,
      });
    };

    const animateStagger = (element: HTMLElement) => {
      const children = element.children;
      Array.from(children).forEach((child, index) => {
        animate(child as HTMLElement, {
          opacity: [0, 1],
          translateY: [60, 0],
          scale: [0.9, 1],
          easing: "easeOutBack(1.7)",
          duration: 800,
          delay: index * 200,
        });
      });
    };

    const animateBounce = (element: HTMLElement) => {
      animate(element, {
        opacity: [0, 1],
        translateY: [80, 0],
        scale: [0.7, 1.1, 1],
        easing: "easeOutElastic(1, .6)",
        duration: 1500,
      });
    };
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;

            // Pas specifieke animaties toe op bepaalde elementen
            if (element === meerOverTitleRef.current) {
              animateTitle(element);
            } else if (element === geschiedenisRef.current) {
              animateFromLeft(element);
            } else if (element === brugRef.current) {
              animateFromLeft(element);
            } else if (element === imageRef.current) {
              animateFromRight(element);
            } else if (element === featuresRef.current) {
              animateStagger(element);
            } else if (element === bottomBannerRef.current) {
              animateBounce(element);
            } else {
              // Fallback voor algemene elementen
              animateOnScroll(element);
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 } // of 0.2, afhankelijk van je voorkeur
    );
  
    if (visieRef.current) observer.observe(visieRef.current);
    if (missieRef.current) observer.observe(missieRef.current);
    if (mediaRef.current) observer.observe(mediaRef.current);
    if (meerOverTitleRef.current) observer.observe(meerOverTitleRef.current);
    if (geschiedenisRef.current) observer.observe(geschiedenisRef.current);
    if (brugRef.current) observer.observe(brugRef.current);
    if (imageRef.current) observer.observe(imageRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);
    if (bottomBannerRef.current) observer.observe(bottomBannerRef.current);
  
    return () => observer.disconnect();
  }, []);

  // Fetch notice on component mount
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/notices/latest');
        
        if (!response.ok) {
          throw new Error('Failed to fetch latest notice');
        }
        
        const data = await response.json();
        if (data) {
          setNotice(data);
        }
      } catch (err) {
        console.error('Error fetching notice:', err);
        setError('Could not load notice');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotice();
  }, []);

  // Fetch projects for carousel
  useEffect(() => {
    const fetchCarouselContent = async () => {
      try {
        setCarouselLoading(true);
        
        // Fetch projects
        const projectsResponse = await fetch('/api/projects');
        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projectsData: Project[] = await projectsResponse.json();
        
        // Transform projects data
        const projectItems: CarouselItem[] = projectsData
          .filter(project => project.image && project.image.data)
          .map(project => ({
            id: project._id,
            title: project.title,
            description: project.description,
            imageData: project.image?.data,
            imageContentType: project.image?.contentType,
            date: project.projectDate
          }));
        
        setCarouselItems(projectItems);
      } catch (err) {
        console.error('Error fetching carousel content:', err);
        setCarouselError('Could not load projects');
      } finally {
        setCarouselLoading(false);
      }
    };

    fetchCarouselContent();
  }, []);

  useEffect(() => {
    const fetchPartnerLogos = async () => {
      try {
        setPartnerLogosLoading(true);
        const response = await fetch('/api/partners');
        if (!response.ok) {
          throw new Error('Failed to fetch partner logos');
        }
        const data = await response.json();
        console.log('Fetched partner logos:', data);
        setPartnerLogos(data);
      } catch (err) {
        console.error('Error fetching partner logos:', err);
        setPartnerLogosError('Could not load partner logos');
      } finally {
        setPartnerLogosLoading(false);
      }
    };
  
    fetchPartnerLogos();
  }, []);

  // Carousel navigation
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
    );
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (carouselItems.length > 0) {
      const interval = setInterval(goToNext, 5000);
      return () => clearInterval(interval);
    }
  }, [carouselItems.length]);

  // Handle carousel item click
  const handleCarouselItemClick = (item: CarouselItem) => {
    router.push(`/projecten?id=${item.id}`);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#F2F2F2]">

      {/* Notice Display */}
      <div className="absolute top-[95px] left-0 w-full z-20 flex justify-center px-4">
        {isLoading ? (
          <div className="p-4 sm:p-6 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-gray-100 rounded-md shadow-md animate-pulse">
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mb-2 sm:mb-3"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ) : error ? (
          <p className="text-center text-gray-500">{error}</p>
        ) : notice ? (
          <div className="p-4 sm:p-6 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-yellow-200 opacity-90 rounded-md shadow-md">
            <h2 className="text-base sm:text-xl font-bold text-yellow-900 flex items-center gap-2 mb-1 sm:mb-2">
              <CircleAlert className="w-4 h-4 sm:w-5 sm:h-5" />
              {notice.title}
            </h2>
            <p className="text-sm sm:text-base text-yellow-800">{notice.message}</p>
            <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-yellow-700 flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
              <span>Verloopt op: {new Date(notice.expirationDate).toLocaleDateString('nl-NL')}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* SVG Curve Background */}
      <div className="absolute top-0 left-0 md:left-[50px] lg:left-[150px] w-full md:w-[calc(100%+150px)] lg:w-[calc(100%+300px)] h-[400px] md:h-[600px] lg:h-[850px] z-0">
        <svg
          viewBox="0 0 3100 1700"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          <defs>
            <clipPath id="clip-curve">
              <path d="M0,0 C0,500 1400,1900 3100,0 L3100,0 L0,0 Z" />
            </clipPath>
          </defs>

          <image
            href="/oase.png"
            x="-290"
            y="-280"
            width="3500"
            height="1800"
            clipPath="url(#clip-curve)"
            preserveAspectRatio="xMidYMid slice"
          />

          <path
            d="M0,0 C0,500 1400,1900 3100,0"
            fill="none"
            stroke="#FFD700"
            strokeWidth="12"
          />
        </svg>
      </div>

      {/* Hoofdinhoud specifiek voor mobiel verder naar beneden geplaatst */}
      <div className="relative w-full z-10 pt-[280px] md:pt-[400px] lg:pt-[600px]">
        {/* Stichting Asha Block */}
        <div className="mx-6 md:ml-[50px] lg:ml-[100px] max-w-[90%] md:max-w-lg lg:max-w-xl mb-10 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E2A78] mb-2 md:mb-4">Stichting Asha</h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-700 mb-4 md:mb-8 leading-relaxed">
            Stichting Asha (Asha betekent 'hoop' in het Hindi) is een vrijwilligersorganisatie van Surinaamse Hindostanen in de gemeente Utrecht.
            Opgericht in 1976, zet de stichting zich in om via haar activiteiten een waardevolle bijdrage te leveren aan het integratie- en participatiebeleid van de gemeente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button
              onClick={() => router.push("/projecten")}
              className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 md:py-3 px-4 md:px-5 rounded-md text-sm md:text-base transition-all shadow-lg"
            >
              <FolderKanban className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              Projecten
            </button>
            <button
              onClick={() => router.push("/agenda")}
              className="flex items-center justify-center gap-2 border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white font-semibold py-2 md:py-3 px-4 md:px-5 rounded-md text-sm md:text-base transition-all shadow-lg"
            >
              <Calendar className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              Agenda
            </button>
          </div>
        </div>

        {/* Information location */}
        <div className="mb-10 md:mb-25 text-right mr-4 md:mr-16 mt-4 md:-mt-16 relative group">
          <div className="flex justify-end items-center mb-2 cursor-pointer transition-all duration-300">
            <p className="text-xl md:text-2xl font-semibold text-[#1E2A78] mr-2">Locatie</p>
            <MapPin className="w-7 h-7 text-[#1E2A78] group-hover:text-yellow-400 transition-colors duration-300" />
          </div>
          <div className="mr-1 mt-2">
            <p className="text-lg md:text-xl text-gray-700">Cartesiusweg 11</p>
            <p className="text-lg md:text-xl text-gray-700">3534 BA, Utrecht</p>
          </div>
          
          {/* Hover Map */}
          <div className="absolute top-full right-0 mt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-30">
            <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-200 overflow-hidden w-80 md:w-96">
              <div className="p-3 bg-[#1E2A78] text-white">
                <h4 className="font-semibold text-sm">Stichting Asha - Buurtcentrum Oase</h4>
                <p className="text-xs text-gray-200">Cartesiusweg 11, 3534 BA Utrecht</p>
              </div>
              <div className="relative h-48 md:h-56">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2451.8234567890123!2d5.0833333!3d52.0833333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c665f4d4b4b4b4%3A0x1234567890abcdef!2sCartesiusweg%2011%2C%203534%20BA%20Utrecht%2C%20Netherlands!5e0!3m2!1sen!2snl!4v1234567890123!5m2!1sen!2snl"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>
                <div className="absolute bottom-2 right-2">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Cartesiusweg+11+3534+BA+Utrecht"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/90 hover:bg-white px-2 py-1 rounded text-xs text-gray-700 hover:text-[#1E2A78] transition-all duration-200 shadow-md"
                  >
                    Open in Maps
                  </a>
                </div>
              </div>
              <div className="p-3 bg-gray-50 text-xs text-gray-600 flex items-center justify-between">
                <span>Hover om kaart te bekijken</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Utrecht, Nederland</span>
                </div>
              </div>
            </div>
            {/* Arrow pointing up */}
            <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l-2 border-t-2 border-gray-200 transform rotate-45"></div>
          </div>
        </div>

        {/* Information Sections */}
        <h3 className="text-2xl md:text-3xl font-bold text-[#1E2A78] text-center mb-8 mt-12">
          Visie, Missie en Media
        </h3>
        <div className="container mx-auto px-4 py-12 space-y-24">
          {/* Visie Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-12">
            <div ref={visieRef} className="md:w-1/2 opacity-0">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-xl font-bold text-[#1E2A78] mb-4">Visie</h2>
                <p className="text-gray-700">
                  Stichting Asha vindt het belangrijk dat de Hindostaanse gemeenschap in Utrecht de eigen
                  cultuur en identiteit beleeft. Zo kunnen de leden van de gemeenschap de kracht opdoen om
                  zich verder te ontwikkelen. Bovendien bevordert cultuur- en identiteitsbeleving een vlotte
                  inburgering in de Nederlandse samenleving.
                </p>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
              <Image
                src="/meeting.png"
                alt="Hindostaanse gemeenschap evenement"
                width={600}
                height={400}
                className="rounded-lg shadow-lg object-cover w-full md:w-[65%] h-auto"
              />
            </div>
          </div>

          {/* Missie Section */}
          <div className="flex flex-col md:flex-row-reverse items-center md:items-start md:space-x-reverse md:space-x-12">
            <div ref={missieRef} className="md:w-1/2 opacity-0">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-xl font-bold text-[#1E2A78] mb-4">Missie</h2>
                <p className="text-gray-700">
                  Door het organiseren van projecten en activiteiten voor de Hindostaanse gemeenschap en
                  andere groepen in de Utrechtse samenleving, wil Stichting Asha een bijdrage leveren aan de
                  multiculturele samenleving. Samenwerkingen met de gemeente, onderwijsinstellingen, het
                  bedrijfsleven en welzijnsorganisaties is daardoor essentieel.
                </p>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
              <Image
                src="/bestuur.png"
                alt="Multiculturele samenleving"
                width={700}
                height={400}
                className="rounded-lg shadow-lg object-cover w-full md:w-[70%] h-auto"
              />
            </div>
          </div>

          {/* Media Section */}
          <div className="flex justify-center">
            <div ref={mediaRef} className="bg-white rounded-lg shadow-lg p-8 md:w-2/3 opacity-0">
              <h2 className="text-xl font-bold text-[#1E2A78] mb-4">Media</h2>
              <p className="text-gray-700 p-3">
                Stichting Asha wordt voortdurend door de Media benaderd. Met name de projecten sollicitatie
                Helpdesk, ouderen en huiswerkbegeleiding haalt veelvuldig de media. Verder zijn de
                praktijkvoorbeelden interessant, een verzameling daarvan ziet u bij onze projecten.
              </p>
            </div>
          </div>
        </div>
        {/* Maak kennis met Asha Section */}
        <div className="w-full px-4 md:px-0 mt-20 mb-10 md:mb-40">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E2A78] mb-6">
              Maak kennis met Asha
            </h2>
            <div className="relative w-full pb-[56.25%] h-0 rounded-lg shadow-lg overflow-hidden">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/yloGClcO8hY"
                title="Maak kennis met Asha"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <br />
            <div className="flex justify-center mt-4">
              <button
                onClick={() => router.push("/nieuwsbrief")}
                className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 md:py-3 px-4 md:px-5 rounded-md text-sm md:text-base transition-all shadow-lg"
              >
                <Mail className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                Nieuwsbrief
              </button>
            </div>
          </div>
        </div>

        {/* Projects Carousel Banner */}
        <div className="w-full bg-[#2E376E] py-12 md:py-16 mt-22 mb-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">Onze Projecten</h2>
            
            {carouselLoading ? (
              <div className="flex justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : carouselError ? (
              <p className="text-center text-white/80">{carouselError}</p>
            ) : carouselItems.length === 0 ? (
              <p className="text-center text-white/80">Geen projecten beschikbaar</p>
            ) : (
              <div className="relative">
                {/* Carousel Navigation */}
                <button 
                  onClick={goToPrev}
                  className="hidden md:block absolute top-1/2 left-2 md:left-[-12rem] z-10 -translate-y-1/2 bg-white/30 hover:bg-white/60 p-4 rounded-full text-white"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Next button */}
                <button 
                  onClick={goToNext}
                  className="hidden md:block absolute top-1/2 right-2 md:right-[-12rem] z-10 -translate-y-1/2 bg-white/30 hover:bg-white/60 p-4 rounded-full text-white"
                  aria-label="Next slide"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Carousel Items */}
                <div className="overflow-hidden">
                  <div className="flex flex-wrap md:flex-nowrap gap-6 md:gap-8">
                    {/* Current item */}
                    {carouselItems[currentIndex] && (
                      <div 
                        className="w-full md:w-2/3 bg-white/10 backdrop-blur-md rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                        onClick={() => handleCarouselItemClick(carouselItems[currentIndex])}
                      >
                        <div className="h-64 md:h-80 lg:h-96 overflow-hidden">
                          {carouselItems[currentIndex].imageData && (
                            <img 
                              src={`data:${carouselItems[currentIndex].imageContentType};base64,${carouselItems[currentIndex].imageData}`}
                              alt={carouselItems[currentIndex].title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center mb-2">
                            <span className="bg-yellow-400 text-xs font-medium text-white px-2 py-1 rounded">
                              Project
                            </span>
                            {carouselItems[currentIndex].date && (
                              <span className="ml-2 text-white/80 text-sm">
                                {new Date(carouselItems[currentIndex].date).toLocaleDateString('nl-NL')}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-white">{carouselItems[currentIndex].title}</h3>
                          {carouselItems[currentIndex].description && (
                            <p className="text-white/80 mt-2 line-clamp-2">{carouselItems[currentIndex].description}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Preview items (only shown on md+ screens) */}
                    <div className="hidden md:flex md:w-1/3 flex-col gap-4">
                      {[
                        (currentIndex + 1) % carouselItems.length,
                        (currentIndex + 2) % carouselItems.length
                      ].map((index) => (
                        carouselItems[index] && (
                          <div
                            key={`preview-${carouselItems[index].id}`}
                            className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden cursor-pointer h-[calc(50%-0.5rem)] transition-transform duration-300 hover:scale-[1.02]"
                            onClick={() => setCurrentIndex(index)}
                          >
                            <div className="h-32">
                              {carouselItems[index].imageData && (
                                <img 
                                  src={`data:${carouselItems[index].imageContentType};base64,${carouselItems[index].imageData}`}
                                  alt={carouselItems[index].title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="text-sm font-medium text-white">{carouselItems[index].title}</h4>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dots navigation */}
                <div className="flex justify-center mt-6 gap-2">
                  {carouselItems.map((_, index) => (
                    <button
                      key={`dot-${index}`}
                      className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Call to action button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => router.push("/projecten")}
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-6 rounded-md transition-all"
              >
                Bekijk alle projecten
              </button>
            </div>
          </div>
        </div>
        
        {/* Over Stichting Asha Section */}
        <div className="w-full py-16 mt-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E2A78] text-center mb-12">
              Meer over Stichting Asha
            </h2>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Left Column - Main Story */}
              <div className="space-y-8">
                <div ref={geschiedenisRef} className="bg-white rounded-xl shadow-lg p-8 opacity-0 transform hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-[#1E2A78] mb-4">Onze Geschiedenis</h3>
                  <p className="text-gray-700 text-base leading-relaxed mb-4">
                    Stichting Asha is een maatschappelijk betrokken organisatie in Utrecht die zich sinds 1992 inzet voor Hindostaanse ouderen. Wat ooit begon als een kleinschalige ontmoeting is uitgegroeid tot een bloeiend project waar wekelijks tientallen deelnemers samenkomen.
                  </p>
                  <p className="text-gray-700 text-base leading-relaxed">
                    Met meer dan 30 jaar ervaring vormen we een veilige en vertrouwde plek waar ouderen zich gezien, gehoord en gewaardeerd voelen in Buurtcentrum Oase.
                  </p>
                </div>
                
                <div ref={brugRef} className="bg-white rounded-xl shadow-lg p-8 opacity-0 transform hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-[#1E2A78] mb-4">Brug tussen Generaties</h3>
                  <p className="text-gray-700 text-base leading-relaxed">
                    We helpen ouderen actief mee te doen in de Nederlandse samenleving, zonder hun eigen cultuur en identiteit te verliezen. We bieden praktische ondersteuning, kennisdeling en ruimte voor persoonlijke groei door middel van diverse activiteiten en programma's.
                  </p>
                </div>
              </div>
              
              {/* Right Column - Image */}
              <div className="flex justify-center items-start">
                <div ref={imageRef} className="relative opacity-0 transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/activity.png"
                    alt="Stichting Asha groepsfoto"
                    width={600}
                    height={400}
                    className="rounded-xl shadow-lg object-cover w-full h-auto"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-yellow-400 text-white p-4 rounded-lg shadow-lg">
                    <p className="font-bold text-sm">30+ jaar</p>
                    <p className="text-xs">ervaring</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features Grid */}
            <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center opacity-0 transform hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:rotate-12 transition-transform duration-300">
                  <span className="text-white font-bold text-xl"><Handshake /></span>
                </div>
                <h4 className="text-lg font-bold text-[#1E2A78] mb-2">Inclusief & Welkom</h4>
                <p className="text-gray-700 text-sm">
                  Iedereen is welkom, ongeacht afkomst, religie of achtergrond. We geloven in de kracht van diversiteit.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center opacity-0 transform hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:rotate-12 transition-transform duration-300">
                  <span className="text-white font-bold text-xl"><BookCopy /></span>
                </div>
                <h4 className="text-lg font-bold text-[#1E2A78] mb-2">Digitale Vaardigheden</h4>
                <p className="text-gray-700 text-sm">
                  We ondersteunen ouderen bij het ontwikkelen van digitale zelfredzaamheid in onze moderne samenleving.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center opacity-0 transform hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:rotate-12 transition-transform duration-300">
                  <span className="text-white font-bold text-xl"><Globe /></span>
                </div>
                <h4 className="text-lg font-bold text-[#1E2A78] mb-2">Cultuur & Traditie</h4>
                <p className="text-gray-700 text-sm">
                  Ruimte voor cultuur, spiritualiteit en zingeving, waarbij tradities worden gekoesterd en gedeeld.
                </p>
              </div>
            </div>
            
            {/* Bottom Banner */}
            <div className="bg-[#1E2A78] rounded-xl p-8 text-center text-white transform hover:bg-[#2E376E] transition-colors duration-300 cursor-pointer">
              <h3 className="text-xl font-bold mb-4">Wordt onderdeel van onze gemeenschap</h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Of je nu op zoek bent naar ontmoeting, ondersteuning of gewoon gezelligheid - bij Stichting Asha vind je een warme gemeenschap die je verwelkomt zoals je bent.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2 text-yellow-400 transform hover:scale-110 transition-transform duration-200">
                  <MapPin className="w-5 h-5" />
                  <span>Cartesiusweg 11, Utrecht</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-white/30"></div>
                <div className="flex items-center gap-2 text-yellow-400 transform hover:scale-110 transition-transform duration-200">
                  <Calendar className="w-5 h-5" />
                  <span>Elke week nieuwe activiteiten</span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Partner Logos Carousel */}
        <div className="flex items-center justify-center mt-12 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E2A78]">Onze Partners</h2>
        </div>
        <LogoSlider />
      </div>
      <Footer />
    </div>
  );
}