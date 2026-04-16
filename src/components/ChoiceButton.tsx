import React from "react";
import { motion } from "motion/react";

export interface ChoiceButtonProps {
  choice: string;
  onClick: () => void;
  disabled: boolean;
  index: number;
  key?: string | number;
}

export default function ChoiceButton({ choice, onClick, disabled, index }: ChoiceButtonProps) {
  const roman = ["I", "II", "III", "IV"];
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full text-left p-4 px-6 rounded-lg border transition-all relative group flex justify-between items-center
        ${disabled 
          ? "opacity-30 cursor-not-allowed border-adventure-border text-adventure-text-dim bg-transparent" 
          : "border-adventure-border hover:border-adventure-accent bg-transparent hover:bg-adventure-card text-[#e2e2e7] shadow-sm"
        }
      `}
    >
      <span className="text-[14px] font-sans leading-snug max-w-[85%]">
        {choice}
      </span>
      
      <span className="text-sm font-serif italic text-adventure-accent opacity-60 group-hover:opacity-100 transition-opacity">
        {roman[index] || index + 1}
      </span>
    </motion.button>
  );
}
