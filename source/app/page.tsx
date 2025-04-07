"use client";

import Image from "next/image";
import { FolderKanban, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();


  return (
    <div className="relative w-full h-[1800px] overflow-hidden m-0 p-0 top-0 left-0">

      {/* SVG Curve Background */}
      <div className="absolute top-[0px] left-[150px] w-[calc(100%+300px)] h-[850px] z-0">
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

      {/* Main Content Positioned */}
        <div className="relative z-10 flex flex-col lg:flex-row justify-center items-start gap-20 px-10 mt-[700px]">

        {/* Stichting Asha Block - LEFT & ABOVE */}
        <div className="absolute top-[-20rem] left-[100px] max-w-xl">
          <h2 className="text-3xl font-bold text-[#1E2A78] mb-4">Stichting Asha</h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Stichting Asha (Asha betekent ‘hoop’ in het Hindi) is een vrijwilligersorganisatie van Surinaamse Hindostanen in de gemeente Utrecht.
            Opgericht in 1976, zet de stichting zich in om via haar activiteiten een waardevolle bijdrage te leveren aan het integratie- en participatiebeleid van de gemeente.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/projecten")}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-5 rounded-md text-base transition-all"
            >
              <FolderKanban size={18} />
              Projecten
            </button>
            <button
              onClick={() => router.push("/agenda")}
              className="flex items-center gap-2 border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white font-semibold py-3 px-5 rounded-md text-base transition-all"
            >
              <Calendar size={18} />
              Agenda
            </button>
          </div>
        </div>

        {/* Bestuur Members - RIGHT SIDE */}
        <div className="absolute top-[2rem] right-[100px] max-w-md w-full flex flex-col gap-6">
          {/* Member 1 */}
          <div className="flex items-center justify-end gap-4">
            <div className="flex flex-col text-right">
              <p className="font-bold text-xl text-gray-900">Ronald Kalka</p>
              <p className="text-base text-gray-600">Voorzitter</p>
              <p className="text-base text-gray-500">06 123456789</p>
            </div>
            <Image
              src="/ronald.png"
              alt="Ronald Kalka"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
          </div>

          {/* Member 2 */}
          <div className="flex items-center justify-end gap-4">
            <div className="flex flex-col text-right">
              <p className="font-bold text-xl text-gray-900">Radj Ramcharan</p>
              <p className="text-base text-gray-600">Secretaris</p>
              <p className="text-base text-gray-500">06 123456789</p>
            </div>
            <Image
              src="/radj.png"
              alt="Radj Ramcharan"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

