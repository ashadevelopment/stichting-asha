// components/Footer.tsx
import { Instagram, Facebook } from "lucide-react";
import Image from "next/image";
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
    <footer className="bg-[#07114D] border-t mt-12 py-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between">
        
        {/* Social Icons */}
        <div className="flex space-x-6 mb-4 md:mb-0">
          {/* X.com SVG */}
          <a href="https://x.com/ashastichting" target="_blank" rel="noopener noreferrer">
            <XIcon size={20} />
          </a>

          {/* Instagram Lucide Icon */}
          <a href="https://www.instagram.com/stichtingasha/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Instagram className="w-6 h-6 text-[#FFFF] hover:text-pink-500 transition" />
          </a>

          {/* Facebook Lucide Icon */}
          <a href="https://www.facebook.com/Stichtingasha/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <Facebook className="w-6 h-6 text-[#FFFF] hover:text-blue-600 transition" />
          </a>

          {/* Flickr SVG */}
          <a
            href="https://www.flickr.com/photos/187453167@N03/albums/72157713498754681/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-block"
            >
            <svg
                width={20}
                height={12}
                viewBox="0 0 60 25"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-all duration-200 mt-2" 
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

        {/* Copyright  with     Poppins*/}

        <p className={`text-sm text-gray-400 ${poppins.className} text-center md:text-right`}>
          &copy; {new Date().getFullYear()} Stichting Asha. Alle rechten voorbehouden.
        </p>
      </div>
    </footer>
  );
}