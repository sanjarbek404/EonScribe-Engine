import { motion, AnimatePresence } from "motion/react";
import { Package, MapPin, Feather, Sword, Settings } from "lucide-react";
import { GameState, ImageSize } from "../types";

interface SidebarProps {
  state: GameState;
  imageSize: ImageSize;
  onImageSizeChange: (size: ImageSize) => void;
}

export default function Sidebar({ state, imageSize, onImageSizeChange }: SidebarProps) {
  return (
    <div className="w-[280px] h-full border-l border-adventure-border bg-adventure-sidebar p-8 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div>
        <h2 className="text-[20px] font-serif text-adventure-accent mb-1 italic tracking-wider">EonScribe Engine</h2>
      </div>

      {/* Current Quest */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-adventure-text-dim uppercase text-[11px] tracking-[1.5px] font-sans font-medium">
          <Feather className="w-3 h-3 text-adventure-accent opacity-70" />
          <span>Current Quest</span>
        </div>
        <div className="bg-adventure-card p-4 border border-adventure-border rounded-lg shadow-sm">
          <p className="text-[14px] font-sans font-semibold text-stone-200 mb-1">Active Objective</p>
          <p className="text-[12px] font-sans leading-relaxed text-adventure-text-dim italic">
            {state.currentQuest || "Locating the next plot thread..."}
          </p>
        </div>
      </section>

      {/* Location */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-adventure-text-dim uppercase text-[11px] tracking-[1.5px] font-sans font-medium">
          <MapPin className="w-3 h-3 text-adventure-accent opacity-70" />
          <span>Location</span>
        </div>
        <p className="text-[13px] font-sans text-stone-200 px-1">{state.location || "The Hidden Path"}</p>
      </section>

      {/* Inventory */}
      <section className="flex-1">
        <div className="flex items-center gap-2 mb-4 text-adventure-text-dim uppercase text-[11px] tracking-[1.5px] font-sans font-medium">
          <Package className="w-3 h-3 text-adventure-accent opacity-70" />
          <span>Inventory</span>
        </div>
        <div className="space-y-0.5">
          <AnimatePresence mode="popLayout">
            {state.inventory.length > 0 ? (
              state.inventory.map((item, idx) => (
                <motion.div
                  key={item + idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  className="py-2 border-b border-white/5 flex items-center gap-2 text-[13px] text-stone-300 font-sans"
                >
                  <div className="w-1 h-1 rounded-full bg-adventure-accent" />
                  {item}
                </motion.div>
              ))
            ) : (
              <p className="text-[12px] text-adventure-text-dim italic font-sans">No artifacts collected.</p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Image Settings */}
      <section className="mt-auto pt-8 border-t border-adventure-border">
        <div className="flex items-center gap-2 mb-4 text-adventure-text-dim uppercase text-[11px] tracking-[1.5px] font-sans font-medium">
          <Settings className="w-3 h-3 text-adventure-text-dim opacity-50" />
          <span>Gen Quality</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(ImageSize).map((size) => (
            <button
              key={size}
              onClick={() => onImageSizeChange(size)}
              className={`px-3 py-1.5 rounded text-[10px] font-mono border transition-all ${
                imageSize === size
                  ? "bg-adventure-accent/10 border-adventure-accent text-adventure-accent"
                  : "bg-transparent border-adventure-border text-adventure-text-dim hover:border-adventure-accent hover:text-stone-200"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
