import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Sparkles, ScrollText, History } from "lucide-react";
import Sidebar from "./components/Sidebar";
import NarrativeView from "./components/NarrativeView";
import ChoiceButton from "./components/ChoiceButton";
import Chat from "./components/Chat";
import { GameState, ImageSize, StoryTurn } from "./types";
import { generateNextTurn, generateImage } from "./lib/gemini";

const INITIAL_STATE: GameState = {
  inventory: [],
  currentQuest: "",
  location: "The Boundary of Reality",
  characterDescription: "",
  visualStyle: ""
};

export default function App() {
  const [history, setHistory] = useState<StoryTurn[]>([]);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.S1K);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("aetherScroll_session");
    if (saved) {
      const parsed = JSON.parse(saved);
      setHistory(parsed.history);
      setGameState(parsed.history[parsed.history.length - 1]?.gameState || INITIAL_STATE);
    } else {
       // Auto-start initial adventure if empty
       startAdventure();
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("aetherScroll_session", JSON.stringify({ history }));
  }, [history]);

  const startAdventure = async () => {
    setIsLoading(true);
    try {
      const firstTurn = await generateNextTurn([], null, true);
      const imageUrl = await generateImage(firstTurn.imagePrompt, imageSize);
      const turnWithImage = { ...firstTurn, imageUrl };
      
      setHistory([turnWithImage]);
      setGameState(turnWithImage.gameState);
    } catch (error) {
      console.error("Failed to start adventure:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoice = async (choice: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const nextTurn = await generateNextTurn(history, choice);
      
      // Update UI with narrative immediately if possible (but we need the turn result)
      // Actually usually it's better to show turn result then fetch image
      setHistory(prev => [...prev, nextTurn]);
      setGameState(nextTurn.gameState);

      // Fetch image
      const imageUrl = await generateImage(nextTurn.imagePrompt, imageSize);
      
      setHistory(prev => {
        const newHistory = [...prev];
        const lastIndex = newHistory.length - 1;
        if (newHistory[lastIndex]) {
          newHistory[lastIndex] = { ...newHistory[lastIndex], imageUrl };
        }
        return newHistory;
      });
    } catch (error) {
      console.error("Failed to continue adventure:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTurn = history[history.length - 1];

  return (
    <div className="flex h-screen w-full bg-adventure-bg text-[#e2e2e7] overflow-hidden select-none">
      {/* Main Game Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header Bar */}
        <header className="h-16 px-10 flex items-center justify-between border-b border-adventure-border bg-adventure-bg z-20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-adventure-accent/10 rounded border border-adventure-accent/20">
              <ScrollText className="w-5 h-5 text-adventure-accent" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-stone-100 italic tracking-widest uppercase">EonScribe</h1>
              <p className="text-[9px] font-sans text-adventure-text-dim uppercase tracking-[2px] mt-0.5 font-semibold">Narrative Interface // v7.2</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <button 
              onClick={() => { if(confirm("Discard this journal and start anew?")) { localStorage.clear(); window.location.reload(); } }}
              className="group flex items-center gap-2 px-4 py-2 rounded border border-adventure-border hover:border-adventure-accent transition-all text-[10px] font-sans tracking-widest uppercase text-adventure-text-dim hover:text-adventure-accent"
             >
                <History className="w-3 h-3 group-hover:rotate-180 transition-transform duration-700" />
                <span>Format Session</span>
             </button>
          </div>
        </header>

        {/* Narrative & View */}
        <div className="flex-1 flex flex-col min-h-0 bg-adventure-bg">
          <AnimatePresence mode="wait">
            {!currentTurn ? (
              <motion.div 
                key="starter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-adventure-accent blur-[100px] opacity-10" />
                  <Sparkles className="w-16 h-16 text-adventure-accent relative" />
                </div>
                <h2 className="text-5xl font-serif text-white mb-4 italic tracking-tight">The Ledger Awaits</h2>
                <p className="text-adventure-text-dim max-w-sm font-sans leading-relaxed mb-10 text-lg">
                  Every epoch has a beginning. Step through the threshold and claim your agency.
                </p>
                <button 
                  onClick={startAdventure}
                  disabled={isLoading}
                  className="px-12 py-4 border border-adventure-accent bg-transparent text-adventure-accent font-sans font-bold uppercase tracking-[3px] text-xs hover:bg-adventure-accent hover:text-black transition-all active:scale-95 disabled:opacity-30 rounded shadow-lg shadow-adventure-accent/5"
                >
                  {isLoading ? "Inscribing Phase..." : "Initialize Singularity"}
                </button>
              </motion.div>
            ) : (
              <NarrativeView key={currentTurn.id} turn={currentTurn} isLoading={isLoading} />
            )}
          </AnimatePresence>

          {/* Choices Interface */}
          <footer className="h-auto p-12 border-t border-adventure-border bg-adventure-sidebar/30 relative">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[10px] font-sans text-adventure-text-dim uppercase tracking-[3px] font-bold">Vector Decisions</span>
                <div className="h-px flex-1 bg-adventure-border opacity-50" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {currentTurn?.options.map((option, idx) => (
                  <ChoiceButton 
                    key={idx} 
                    choice={option} 
                    index={idx} 
                    onClick={() => handleChoice(option)}
                    disabled={isLoading}
                  />
                ))}
              </div>

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-adventure-bg/60 backdrop-blur-sm flex items-center justify-center gap-4 z-40"
                >
                  <Loader2 className="w-6 h-6 animate-spin text-adventure-accent" />
                  <span className="text-sm font-serif italic tracking-widest text-[#e2e2e7]">Expanding the multiverse...</span>
                </motion.div>
              )}

              {/* Meta Footer */}
              <div className="flex justify-between items-center pt-8 border-t border-adventure-border font-sans text-[11px] text-adventure-text-dim tracking-wider uppercase font-medium">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-500/40" />
                  World State: Persistent // High Fidelity
                </div>
                <div>Plot Divergence: {history.length > 0 ? (history.length * 7) % 100 : 0}% from Baseline</div>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Dynamic Sidebar */}
      <Sidebar 
        state={gameState} 
        imageSize={imageSize}
        onImageSizeChange={setImageSize}
      />

      {/* Floating Chat */}
      <Chat />
    </div>
  );
}

