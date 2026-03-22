import { motion } from "framer-motion";
import { Star, ThumbsUp, ThumbsDown, Gem, MapPin } from "lucide-react";

/**
 * TravelReview — "Vibe Check" & Hidden Gems (Theme-Adaptive)
 *
 * Props:
 *   travelReview: { rating: number(1-5), pros: string[], cons: string[], hiddenGems: string[] }
 */
const TravelReview = ({ travelReview }) => {
  if (!travelReview) return null;

  const { rating = 0, pros = [], cons = [], hiddenGems = [] } = travelReview;

  const renderStars = (count) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={`transition-colors ${
          i < count ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-white/10"
        }`}
      />
    ));

  const Section = ({ icon: Icon, title, items, color, lightBg, darkBg, lightBorder, darkBorder, dotColor }) => {
    if (!items?.length) return null;
    return (
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center gap-2">
          <div className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg border ${lightBg} ${darkBg} ${lightBorder} ${darkBorder}`}>
            <Icon className={`w-3 h-3 ${color}`} />
          </div>
          <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${color}`}>
            {title}
          </span>
        </div>
        <ul className="space-y-1 sm:space-y-1.5 ml-6 sm:ml-8">
          {items.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed"
            >
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
              {item}
            </motion.li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="mt-4 sm:mt-5 rounded-xl sm:rounded-2xl overflow-hidden border border-indigo-200 dark:border-indigo-500/15 bg-indigo-50/50 dark:bg-white/[0.03] backdrop-blur-md">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-indigo-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h4 className="text-[10px] sm:text-xs font-bold text-indigo-700 dark:text-white uppercase tracking-wider">
              SlotPilot Review
            </h4>
            <p className="text-[8px] sm:text-[9px] text-indigo-400/50 font-semibold uppercase tracking-widest">
              Vibe Check · Trip Intelligence
            </p>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="flex gap-0.5">{renderStars(rating)}</div>
          <span className="text-[10px] sm:text-xs font-bold text-amber-500 dark:text-amber-400 ml-1">{rating}/5</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
        <Section icon={ThumbsUp} title="Pros" items={pros}
          color="text-emerald-600 dark:text-emerald-400"
          lightBg="bg-emerald-50" darkBg="dark:bg-emerald-500/10"
          lightBorder="border-emerald-200" darkBorder="dark:border-emerald-500/20"
          dotColor="bg-emerald-400" />

        <Section icon={ThumbsDown} title="Cons" items={cons}
          color="text-red-500 dark:text-red-400"
          lightBg="bg-red-50" darkBg="dark:bg-red-500/10"
          lightBorder="border-red-200" darkBorder="dark:border-red-500/20"
          dotColor="bg-red-400" />

        <Section icon={Gem} title="Hidden Gems" items={hiddenGems}
          color="text-amber-600 dark:text-amber-400"
          lightBg="bg-amber-50" darkBg="dark:bg-amber-500/10"
          lightBorder="border-amber-200" darkBorder="dark:border-amber-500/20"
          dotColor="bg-amber-400" />
      </div>
    </div>
  );
};

export default TravelReview;
