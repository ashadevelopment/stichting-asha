'use client';

export default function LogoSlider() {
  const logos = [
    "ah.png", "akder.png", "art.1.png", "buurtteam.png", "cosbo.png",
    "debibliotheek.png", "dock.jpg", "Gemeente-Utrecht.png", "hogeschool-utrecht.png",
    "jumbo.png", "MBO.png", "nisbo.png", "noom.png", "roc.png", "shrikrishna.png",
    "stichtinglezenschrijven.png", "taaldoetmeer.png", "tzonnetje.png",
    "u-centraal.png", "uindewijk.png", "uni-utrecht.png", "voedselbankplus.png"
  ];

  return (
    <div className="relative overflow-hidden py-10">
      {/* Left Gradient */}
      <div className="absolute left-0 top-0 h-full w-32 z-10 bg-gradient-to-r from-[#F2F2F2] to-transparent pointer-events-none" />
      {/* Right Gradient */}
      <div className="absolute right-0 top-0 h-full w-32 z-10 bg-gradient-to-l from-[#F2F2F2] to-transparent pointer-events-none" />

      {/* Scroll wrapper */}
      <div className="w-max flex animate-slide whitespace-nowrap hover:animate-none">
        {[...logos, ...logos].map((logo, index) => (
          <img
            key={index}
            src={`/partners/${logo}`}
            alt={`Logo ${index}`}
            className="h-12 mx-10"
          />
        ))}
      </div>
    </div>
  );
}
