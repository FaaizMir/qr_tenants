"use client";
import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

const StarRatingInput = ({
  label,
  name,
  register,
  setValue,
  error,
  value,
  validation = {},
}) => {
  const [rating, setRating] = useState(value || 0);
  const [hover, setHover] = useState(0);

  // Sync local rating state with value prop
  useEffect(() => {
    setRating(Number(value) || 0);
  }, [value]);

  const handleSelect = (val) => {
    setRating(val);
    setValue(name, val);
  };

  return (
    <div className="flex flex-col space-y-3 mt-2">
      {label && (
        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.15em]">
          {label}
          {validation?.required && <span className="text-primary ml-1">*</span>}
        </label>
      )}
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1;
          const isActive = starValue <= (hover || rating);

          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(0)}
              onClick={() => handleSelect(starValue)}
              className="relative group transition-all duration-300 transform active:scale-90"
            >
              <Star
                className={`w-10 h-10 transition-all duration-300 ${isActive
                  ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                  : "fill-zinc-200 text-zinc-200 hover:text-zinc-300 hover:fill-zinc-300"
                  }`}
              />
              {isActive && (
                <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full scale-150 animate-pulse-slow -z-10"></div>
              )}
            </button>
          );
        })}
      </div>
      <input
        type="hidden"
        {...register(name, { required: "Rating is required" })}
      />
      {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1">{error.message}</p>}
    </div>
  );
};

export default StarRatingInput;
