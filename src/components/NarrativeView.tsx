import React from "react";
import { motion } from "motion/react";
import { StoryTurn } from "../types";

export interface NarrativeViewProps {
  turn: StoryTurn;
  isLoading: boolean;
  key?: string | number;
}

export default function NarrativeView({ turn, isLoading }: NarrativeViewProps) {
  return (
    <div className="flex-1 overflow-y-auto px-[60px] py-[40px] custom-scrollbar relative">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="relative group aspect-[21/9] rounded-xl overflow-hidden border border-adventure-border bg-adventure-sidebar shadow-2xl scene-scanlines">
          {turn.imageUrl ? (
            <motion.img
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              key={turn.imageUrl}
              src={turn.imageUrl}
              alt="Visual memory"
              className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-adventure-text-dim italic text-sm font-serif">
               {isLoading ? "Consulting the Loom..." : "The vision is obscured."}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-adventure-bg via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-4 left-4">
             <div className="text-[10px] font-mono text-stone-200 bg-black/60 px-2.5 py-1 rounded border border-white/20 uppercase tracking-widest">
                Art Engine // Rev-04
             </div>
          </div>

          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
             <span className="text-[10px] font-mono text-adventure-accent uppercase tracking-widest opacity-80 bg-black/40 px-2 py-0.5 rounded">
                {turn.gameState.location}
             </span>
             <span className="text-[10px] font-mono text-adventure-text-dim uppercase tracking-widest opacity-60">
                Lumen-78
             </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          key={turn.id}
          className="space-y-8 narrative-container"
        >
          {turn.narrative.split("\n\n").map((para, i) => (
            <p
              key={i}
              className="text-[20px] leading-[1.6] font-serif text-[#d1d1d6] drop-shadow-sm transition-colors duration-500 first-letter:text-4xl first-letter:font-bold first-letter:text-adventure-accent first-letter:float-left first-letter:mr-3 first-letter:mt-1"
            >
              {para}
            </p>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
