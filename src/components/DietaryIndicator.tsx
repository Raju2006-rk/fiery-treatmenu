import React from 'react';

interface DietaryIndicatorProps {
  isVeg: boolean;
  isEgg?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const DietaryIndicator: React.FC<DietaryIndicatorProps> = ({
  isVeg,
  isEgg = false,
  size = 'md',
  showLabel = false,
}) => {
  const sizeClasses = {
    sm: {
      box: 'w-3.5 h-3.5 border-[1.5px] p-[2px]',
      dot: 'w-1.5 h-1.5',
      text: 'text-xs',
    },
    md: {
      box: 'w-4 h-4 border-[1.5px] p-[2.5px]',
      dot: 'w-2 h-2',
      text: 'text-xs font-medium',
    },
    lg: {
      box: 'w-5 h-5 border-2 p-[3px]',
      dot: 'w-2.5 h-2.5',
      text: 'text-sm font-semibold',
    },
  }[size];

  if (isEgg) {
    return (
      <div className="inline-flex items-center gap-1.5" title="Contains Egg">
        <div
          className={`${sizeClasses.box} border-amber-600 rounded-[3px] flex items-center justify-center bg-amber-950/20`}
        >
          <div className={`${sizeClasses.dot} rounded-full bg-amber-500`} />
        </div>
        {showLabel && <span className={`${sizeClasses.text} text-amber-400`}>Egg</span>}
      </div>
    );
  }

  if (isVeg) {
    return (
      <div className="inline-flex items-center gap-1.5" title="100% Pure Vegetarian">
        <div
          className={`${sizeClasses.box} border-emerald-600 rounded-[3px] flex items-center justify-center bg-emerald-950/20`}
        >
          <div className={`${sizeClasses.dot} rounded-full bg-emerald-500`} />
        </div>
        {showLabel && <span className={`${sizeClasses.text} text-emerald-400`}>Pure Veg</span>}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5" title="Non-Vegetarian">
      <div
        className={`${sizeClasses.box} border-rose-600 rounded-[3px] flex items-center justify-center bg-rose-950/20`}
      >
        <div className={`${sizeClasses.dot} rounded-full bg-rose-500`} />
      </div>
      {showLabel && <span className={`${sizeClasses.text} text-rose-400`}>Non-Veg</span>}
    </div>
  );
};
