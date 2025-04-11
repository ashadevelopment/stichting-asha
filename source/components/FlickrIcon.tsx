import React from 'react';

const FlickrIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size * 0.42}
    viewBox="0 0 60 25"
    xmlns="http://www.w3.org/2000/svg"
    className="group transition-all duration-200"
  >
    <g className="group-hover:fill-current">
      <circle
        cx="17"
        cy="12.5"
        r="10"
        className="fill-white group-hover:text-[#0063dc]"
      />
      <circle
        cx="43"
        cy="12.5"
        r="10"
        className="fill-white group-hover:text-[#ff0084]"
      />
    </g>
  </svg>
);

export default FlickrIcon;