import React from 'react';

interface BrandMarkProps {
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md';
}

export const INTERGRID_LOGO_SRC =
  '/assets/aistudio/afed7722-ed36-42e9-bf6a-5affdc02d6e6_40c18a9b.jpg';

export const BrandMark: React.FC<BrandMarkProps> = ({ theme = 'light', size = 'md' }) => {
  const textColor = theme === 'dark' ? 'text-white' : 'text-[#09090B]';
  const ringBorder = theme === 'dark' ? 'border-white/25' : 'border-[#E4E4E7]';
  const iconDim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const textClass = size === 'sm' ? 'text-[15px]' : 'text-[17px]';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <span
        className={`${iconDim} rounded-full overflow-hidden bg-[#09090B] border ${ringBorder} inline-flex items-center justify-center shrink-0`}
      >
        <img
          src={INTERGRID_LOGO_SRC}
          alt="Intergrid IT logo"
          className="w-full h-full object-cover"
          style={{ transform: 'scale(1.36) translateY(5.5%)' }}
        />
      </span>
      <span className={`font-display font-semibold tracking-tight ${textClass} ${textColor}`}>
        Intergrid IT
      </span>
    </span>
  );
};

