// components/Footer.tsx
import { Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import XIcon from '../components/Xicon';
import FlickrIcon from "../components/FlickrIcon";

// Poppins font
import { Poppins } from "next/font/google";
const poppins = Poppins({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
});

export default function Footer() {
  return (
    <footer className="bg-[#07114D] mt-12">
      <div className="w-full px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Organization Info */}
          <div className="md:col-span-2">
            <h3 className={`text-2xl font-bold text-white mb-6 ${poppins.className}`}>
              Stichting Asha
            </h3>
            <p className={`text-gray-300 text-base leading-relaxed mb-6 ${poppins.className}`}>
              Stichting Asha is een maatschappelijk betrokken organisatie in Utrecht die zich 
              sinds 1992 met veel toewijding inzet voor Hindostaanse ouderen.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div className={`text-gray-300 text-m ${poppins.className}`}>
                  <div>Cartesiusweg 11</div>
                  <div>3534 BA, Utrecht</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <a 
                  href="mailto:info@stichtingasha.nl" 
                  className={`text-gray-300 text-m hover:text-yellow-400 transition-colors ${poppins.className}`}
                >
                  info@stichtingasha.nl
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className={`text-lg font-semibold text-white mb-6 ${poppins.className}`}>
              Navigatie
            </h4>
            <nav className="space-y-4">
              <Link 
                href="/" 
                className={`block text-gray-300 hover:text-yellow-400 transition-colors ${poppins.className}`}
              >
                Home
              </Link>
              <Link 
                href="/agenda" 
                className={`block text-gray-300 hover:text-yellow-400 transition-colors ${poppins.className}`}
              >
                Agenda
              </Link>
              <Link 
                href="/projecten" 
                className={`block text-gray-300 hover:text-yellow-400 transition-colors ${poppins.className}`}
              >
                Projecten
              </Link>
              <Link 
                href="/contact" 
                className={`block text-gray-300 hover:text-yellow-400 transition-colors ${poppins.className}`}
              >
                Contact
              </Link>
              <Link 
                href="/nieuwsbrief" 
                className={`block text-gray-300 hover:text-yellow-400 transition-colors ${poppins.className}`}
              >
                Nieuwsbrief
              </Link>
              <Link 
                href="/fotoboek" 
                className={`block text-gray-300 hover:text-yellow-400 transition-colors ${poppins.className}`}
              >
                Fotoboek
              </Link>
            </nav>
          </div>

          {/* Social Media */}
          <div>
            <h4 className={`text-lg font-semibold text-white mb-6 ${poppins.className}`}>
              Volg Ons
            </h4>
            <div className="flex space-x-4 mb-6">
              {/* X.com SVG */}
              <a 
                href="https://x.com/ashastichting" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="X (Twitter)"
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors"
              >
                <XIcon size={20} />
              </a>

              {/* Instagram Lucide Icon */}
              <a 
                href="https://www.instagram.com/stichtingasha/?hl=en" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className="bg-gray-700 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 p-3 rounded-lg transition-all"
              >
                <Instagram className="w-6 h-6 text-white" />
              </a>

              {/* Facebook Lucide Icon */}
              <a 
                href="https://www.facebook.com/Stichtingasha/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook"
                className="bg-gray-700 hover:bg-blue-600 p-3 rounded-lg transition-colors"
              >
                <Facebook className="w-6 h-6 text-white" />
              </a>

              {/* Flickr SVG */}
              <a
                href="https://www.flickr.com/photos/187453167@N03/albums/72157713498754681/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-pink-600 p-3 rounded-lg transition-colors group"
                aria-label="Flickr"
              >
                <svg
                    width={20}
                    height={12}
                    viewBox="0 0 60 25"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-all duration-200" 
                >
                    <circle
                    cx="17"
                    cy="12.5"
                    r="10"
                    className="fill-white group-hover:fill-[#0063dc] transition-colors duration-200"
                    />
                    <circle
                    cx="43"
                    cy="12.5"
                    r="10"
                    className="fill-white group-hover:fill-[#ff0084] transition-colors duration-200"
                    />
                </svg>
             </a>
            </div>
            
            <p className={`text-gray-400 text-sm ${poppins.className}`}>
              Blijf op de hoogte van onze activiteiten en projecten
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-700">
        <div className="w-full px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center ml-22">
            <p className={`text-sm text-gray-400 ${poppins.className}`}>
              © {new Date().getFullYear()} Stichting Asha. Alle rechten voorbehouden.
            </p>
            <p className={`text-sm text-gray-400 mt-2 mr-22 md:mt-0 ${poppins.className}`}>
              Sinds 1992 • Utrecht, Nederland
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}