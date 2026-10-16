import React from 'react';

interface FireyTreatLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const FireyTreatLogo: React.FC<FireyTreatLogoProps> = ({
  className = '',
  size = 44,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative shrink-0 rounded-full overflow-hidden shadow-lg shadow-black/80 border border-neutral-800 transition-transform duration-300 hover:scale-105"
        style={{ width: size, height: size }}
      >
        <img
          src="/firey_treat_logo.svg"
          alt="Firey Treat Logo"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-display font-black text-base sm:text-lg tracking-wider text-white flex items-center gap-1.5 leading-none">
            <span>FIREY</span>
            <span className="text-emerald-400">TREAT</span>
          </span>
          <span className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase leading-tight pt-0.5">
            It&apos;s a Fry &amp; Pie • Estd 2022
          </span>
        </div>
      )}
    </div>
  );
};
