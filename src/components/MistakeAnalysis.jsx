import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown, Lightbulb, Search } from "lucide-react";

/**
 * MistakeAnalysis — "Red Flag" System (Theme-Adaptive)
 *
 * Props:
 *   rejectionInsights: {
 *     mistakes: [{ text: string, explanation: string, proTip: string }]
 *   }
 */
const MistakeAnalysis = ({ rejectionInsights }) => {
  const [expanded, setExpanded] = useState(false);

  if (!rejectionInsights?.mistakes?.length) return null;

  const { mistakes } = rejectionInsights;

  return (
    <div className="mt-5 sm:mt-6 rounded-xl sm:rounded-[2rem] overflow-hidden border border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-white/[0.04] backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-red-100 dark:border-white/5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <AlertTriangle className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-red-700 dark:text-white uppercase tracking-wider">
              Mistake Analysis
            </h4>
            <p className="text-[9px] sm:text-[10px] text-red-400/60 font-semibold uppercase tracking-widest">
              {mistakes.length} red flag{mistakes.length > 1 ? "s" : ""} detected
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 min-h-[44px] ${
            expanded
              ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/30"
              : "bg-red-600 text-white shadow-[0_8px_24px_rgba(239,68,68,0.3)]"
          }`}
        >
          <Search size={14} />
          <span className="hidden xs:inline">{expanded ? "Hide" : "Analyze Mistakes"}</span>
          <span className="xs:hidden">{expanded ? "Hide" : "Analyze"}</span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown size={14} />
          </motion.div>
        </motion.button>
      </div>

      {/* Expanded Analysis */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {mistakes.map((mistake, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl sm:rounded-2xl border border-red-200 dark:border-red-500/15 bg-red-50/80 dark:bg-red-500/[0.04] p-4 sm:p-5"
                >
                  {/* Highlighted mistake text */}
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className="mt-0.5 sm:mt-1 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[9px] sm:text-[10px] font-black flex items-center justify-center border border-red-200 dark:border-red-500/30">
                      {i + 1}
                    </span>
                    <p className="text-red-600 dark:text-red-300 font-semibold text-xs sm:text-sm leading-relaxed">
                      "{mistake.text}"
                    </p>
                  </div>

                  {/* Explanation */}
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs leading-relaxed ml-7 sm:ml-9 mb-2 sm:mb-3">
                    {mistake.explanation}
                  </p>

                  {/* Pro Tip Box */}
                  <div className="ml-7 sm:ml-9 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.08] border border-emerald-200 dark:border-emerald-500/20 p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                    <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 flex-shrink-0">
                      <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-black uppercase tracking-widest mb-0.5 sm:mb-1">
                        Pro Tip
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-300/90 text-[11px] sm:text-xs leading-relaxed">
                        {mistake.proTip}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MistakeAnalysis;
