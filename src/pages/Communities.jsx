import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, getDocs, query, orderBy, addDoc, serverTimestamp,
  onSnapshot, where
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  MessageSquare, Plane, Home, ArrowLeft, Plus, X, Globe, Zap, Send,
  Loader2, Star, CheckCircle, DollarSign, Heart, Share2, Bookmark,
  Search, FileText, HelpCircle, Gem, AlertTriangle, ShieldCheck,
  Sparkles, Mail, Phone, User, RefreshCcw
} from "lucide-react";

import MistakeAnalysis from "../components/MistakeAnalysis";
import TravelReview from "../components/TravelReview";

/* ─────────────────────────────────────────────────────
   CSS-IN-JS: Theme-Adaptive Liquid Glass + Spatial UI
   ───────────────────────────────────────────────────── */
const SPATIAL_CSS = `
  /* ── BREATHING GLOW for verified posts ── */
  @keyframes sp-breathe {
    0%,100% {
      box-shadow: 0 0 20px rgba(59,130,246,0.12), 0 0 60px rgba(59,130,246,0.04), inset 0 1px 0 rgba(59,130,246,0.06);
      border-color: rgba(59,130,246,0.30);
    }
    50% {
      box-shadow: 0 0 35px rgba(59,130,246,0.25), 0 0 90px rgba(59,130,246,0.10), inset 0 1px 0 rgba(59,130,246,0.12);
      border-color: rgba(59,130,246,0.50);
    }
  }
  .sp-verified-breathe { animation: sp-breathe 3s ease-in-out infinite; }

  /* ── PARTICLE BURST on reaction ── */
  @keyframes sp-burst {
    0%   { transform: scale(0); opacity:1; }
    50%  { transform: scale(1.8); opacity:0.6; }
    100% { transform: scale(2.4); opacity:0; }
  }
  .sp-burst-ring {
    position:absolute; inset:-6px; border-radius:50%;
    border: 2px solid currentColor; opacity:0; pointer-events:none;
  }
  .sp-burst-active .sp-burst-ring { animation: sp-burst 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
  @keyframes sp-burst-dot {
    0%   { transform: translateY(0) scale(1); opacity:1; }
    100% { transform: translateY(-18px) scale(0); opacity:0; }
  }
  .sp-burst-active .sp-burst-dot { animation: sp-burst-dot 0.45s ease-out forwards; }

  /* ── HELP ICON PULSE ── */
  @keyframes sp-help-pulse {
    0%,100% { transform: scale(1); filter: drop-shadow(0 0 0 transparent); }
    50%     { transform: scale(1.15); filter: drop-shadow(0 0 6px rgba(251,191,36,0.5)); }
  }
  .sp-help-pulse { animation: sp-help-pulse 2s ease-in-out infinite; }

  /* ── GEM GLOW ── */
  @keyframes sp-gem-glow {
    0%,100% { filter: drop-shadow(0 0 2px rgba(168,85,247,0.2)); }
    50%     { filter: drop-shadow(0 0 6px rgba(168,85,247,0.4)); }
  }
  .sp-gem-glow { animation: sp-gem-glow 2.5s ease-in-out infinite; }

  /* ── LIVE RING ── */
  @keyframes sp-live-ring {
    0%   { transform: scale(1);   opacity:0.8; }
    100% { transform: scale(1.5); opacity:0; }
  }
  .sp-live-ring::after {
    content:''; position:absolute; inset:-3px; border-radius:50%;
    border: 2px solid #22c55e;
    animation: sp-live-ring 1.5s ease-out infinite;
  }

  /* ── HORIZONTAL NAV BAR ── */
  @keyframes sp-pill-glow {
    0%,100% { box-shadow: 0 0 12px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.08); }
    50%     { box-shadow: 0 0 24px rgba(59,130,246,0.30), inset 0 1px 0 rgba(255,255,255,0.12); }
  }
  .sp-pill-active { animation: sp-pill-glow 2.5s ease-in-out infinite; }

  /* ── RED FLAG CHIP ── */
  @keyframes sp-flag-bob {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-2px); }
  }
  .sp-redflag-chip { animation: sp-flag-bob 2s ease-in-out infinite; }

  /* ── SUCCESS CHECKMARK for contact modal ── */
  @keyframes sp-check-stroke {
    0%   { stroke-dashoffset: 48; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes sp-check-circle {
    0%   { stroke-dashoffset: 166; }
    100% { stroke-dashoffset: 0; }
  }
  .sp-check-circle {
    stroke-dasharray: 166; stroke-dashoffset: 166;
    animation: sp-check-circle 0.6s cubic-bezier(0.65,0,0.45,1) forwards;
  }
  .sp-check-mark {
    stroke-dasharray: 48; stroke-dashoffset: 48;
    animation: sp-check-stroke 0.35s cubic-bezier(0.65,0,0.45,1) 0.4s forwards;
  }

  /* ── STATUS BADGES for community cards ── */
  @keyframes sp-status-pulse {
    0%,100% { box-shadow: 0 0 8px rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.30); }
    50%     { box-shadow: 0 0 20px rgba(245,158,11,0.35); border-color: rgba(245,158,11,0.55); }
  }
  .sp-status-pulse { animation: sp-status-pulse 2s ease-in-out infinite; }

  @keyframes sp-status-glow {
    0%,100% { box-shadow: 0 0 8px rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.30); }
    50%     { box-shadow: 0 0 20px rgba(34,197,94,0.35); border-color: rgba(34,197,94,0.55); }
  }
  .sp-status-glow { animation: sp-status-glow 2.5s ease-in-out infinite; }
`;

/* ─────────────────────────────────────────────────────
   (Online Users section removed — sidebar removed)
   ───────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────
   POST TYPE CONFIG
   ───────────────────────────────────────────────────── */
const POST_TYPE_STYLES = {
  experience: {
    icon: FileText, label: "Visa Experience",
    badgeBg: "bg-emerald-500/10", badgeText: "text-emerald-600 dark:text-emerald-400", badgeBorder: "border-emerald-500/20",
  },
  companion: {
    icon: HelpCircle, label: "Question / Travel",
    badgeBg: "bg-amber-500/10", badgeText: "text-amber-600 dark:text-amber-400", badgeBorder: "border-amber-500/20",
    pulse: true,
  },
  accommodation: {
    icon: Gem, label: "Hidden Gem / Stay",
    badgeBg: "bg-violet-500/10", badgeText: "text-violet-600 dark:text-violet-400", badgeBorder: "border-violet-500/20",
    glow: true,
  },
};

/* ── STAGGERED REVEAL ── */
const RevealCard = ({ children, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  );
};

/* ── REACTION BUBBLE ── */
const ReactionBubble = ({ icon: Icon, count = 0, color }) => {
  const [burst, setBurst] = useState(false);
  const [localCount, setLocalCount] = useState(count);
  const handleClick = () => {
    setBurst(true); setLocalCount(c => c + 1);
    setTimeout(() => setBurst(false), 500);
  };
  return (
    <motion.button whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.85 }} onClick={handleClick}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300
        bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]
        hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:border-slate-300 dark:hover:border-white/10
        ${color} ${burst ? "sp-burst-active" : ""}`}
    >
      <span className="sp-burst-ring" />
      {burst && (
        <>
          <span className="sp-burst-dot absolute -top-1 left-1/2 w-1 h-1 rounded-full bg-current" style={{ animationDelay: "0s" }} />
          <span className="sp-burst-dot absolute -top-1 left-1/3 w-1 h-1 rounded-full bg-current" style={{ animationDelay: "0.05s" }} />
          <span className="sp-burst-dot absolute -top-1 left-2/3 w-1 h-1 rounded-full bg-current" style={{ animationDelay: "0.1s" }} />
        </>
      )}
      <Icon size={13} />
      {localCount > 0 && <span>{localCount}</span>}
    </motion.button>
  );
};

/* ── RED FLAG POPOVER ── */
const RedFlagChip = ({ rejectionInsights }) => {
  const [open, setOpen] = useState(false);
  if (!rejectionInsights?.mistakes?.length) return null;
  const first = rejectionInsights.mistakes[0];
  return (
    <div className="absolute top-4 right-4 z-20">
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => setOpen(!open)}
        className="sp-redflag-chip flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-500 dark:text-red-400 text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg shadow-red-500/10 cursor-pointer"
      >
        <AlertTriangle size={11} /> Red Flag
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.2 }}
            className="absolute right-0 top-10 w-72 p-4 rounded-2xl bg-white/95 dark:bg-[#0c1225]/95 backdrop-blur-2xl border border-red-200 dark:border-red-500/15 shadow-2xl shadow-red-500/5 z-30"
          >
            <p className="text-[10px] text-red-500/60 dark:text-red-400/60 font-black uppercase tracking-widest mb-2">Key Mistake</p>
            <p className="text-red-600 dark:text-red-300 text-sm font-semibold mb-2 leading-relaxed">"{first.text}"</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-3">{first.explanation}</p>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-200 dark:border-emerald-500/15">
              <p className="text-[9px] text-emerald-600/60 dark:text-emerald-400/60 font-black uppercase tracking-widest mb-1">Better approach</p>
              <p className="text-emerald-700 dark:text-emerald-300/80 text-xs leading-relaxed">{first.proTip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═════════════════════════════════════════════════════
   MAIN COMPONENT — THEME-ADAPTIVE
   ═════════════════════════════════════════════════════ */
const Communities = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("experience");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingPostId, setBookingPostId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Contact Modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Status sync: maps postId → latest processStatus from employee_tasks
  const [taskStatusMap, setTaskStatusMap] = useState({});
  const [taskDetailsMap, setTaskDetailsMap] = useState({});

  // Form state
  const [formData, setFormData] = useState({ title: "", content: "", country: "" });
  const [mistakeText, setMistakeText] = useState("");
  const [mistakeExplanation, setMistakeExplanation] = useState("");
  const [mistakeProTip, setMistakeProTip] = useState("");
  const [mistakes, setMistakes] = useState([]);
  const [travelRating, setTravelRating] = useState(0);
  const [travelPros, setTravelPros] = useState("");
  const [travelCons, setTravelCons] = useState("");
  const [travelGems, setTravelGems] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  // Live listener for employee_tasks → build status map per postId
  useEffect(() => {
    const q = query(
      collection(db, "employee_tasks"),
      where("type", "==", "secure_room")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const statusMap = {};
      const detailsMap = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        const pid = data.postId;
        // Keep the most recent task per postId (snapshot is unordered, so compare)
        if (!statusMap[pid]) {
          statusMap[pid] = data.processStatus || data.status || "pending";
          detailsMap[pid] = { ...data, id: d.id };
        } else {
          // If this entry is newer or is a re-open, prefer it
          const existing = detailsMap[pid];
          const existingTime = existing.createdAt?.toMillis?.() || 0;
          const newTime = data.createdAt?.toMillis?.() || 0;
          if (newTime > existingTime) {
            statusMap[pid] = data.processStatus || data.status || "pending";
            detailsMap[pid] = { ...data, id: d.id };
          }
        }
      });
      setTaskStatusMap(statusMap);
      setTaskDetailsMap(detailsMap);
    });
    return () => unsub();
  }, []);

  const addMistake = () => {
    if (!mistakeText) return;
    setMistakes([...mistakes, { text: mistakeText, explanation: mistakeExplanation, proTip: mistakeProTip }]);
    setMistakeText(""); setMistakeExplanation(""); setMistakeProTip("");
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", country: "" });
    setMistakes([]); setMistakeText(""); setMistakeExplanation(""); setMistakeProTip("");
    setTravelRating(0); setTravelPros(""); setTravelCons(""); setTravelGems("");
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setIsSubmitting(true);
    try {
      const postData = { ...formData, type: activeTab, createdAt: serverTimestamp() };
      if (activeTab === "experience" && mistakes.length > 0) postData.rejectionInsights = { mistakes };
      if (activeTab === "companion" && travelRating > 0) {
        postData.travelReview = {
          rating: travelRating,
          pros: travelPros.split("\n").map(s => s.trim()).filter(Boolean),
          cons: travelCons.split("\n").map(s => s.trim()).filter(Boolean),
          hiddenGems: travelGems.split("\n").map(s => s.trim()).filter(Boolean),
        };
      }
      await addDoc(collection(db, "posts"), postData);
      resetForm(); setShowModal(false); fetchPosts();
    } finally { setIsSubmitting(false); }
  };

  const handleSecureRoom = (post) => {
    setSelectedPost(post);
    setContactInfo({ name: "", email: "", phone: "" });
    setContactSubmitted(false);
    setShowContactModal(true);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone || !selectedPost) return;
    setContactSubmitting(true);
    try {
      await addDoc(collection(db, "employee_tasks"), {
        type: "secure_room",
        postId: selectedPost.id,
        postTitle: selectedPost.title || "Room Listing",
        landlordContact: selectedPost.country || "See post details",
        userRequest: "Secure the room",
        requestedBy: "community_user",
        userName: contactInfo.name,
        userEmail: contactInfo.email,
        userPhone: contactInfo.phone,
        status: "pending",
        processStatus: "pending",
        createdAt: serverTimestamp(),
      });
      setContactSubmitted(true);
      setTimeout(() => {
        setShowContactModal(false);
        setContactSubmitted(false);
        setSelectedPost(null);
        setContactInfo({ name: "", email: "", phone: "" });
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Please try again.");
    } finally {
      setContactSubmitting(false);
    }
  };

  const filteredPosts = posts
    .filter(p => p.type === activeTab)
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (p.title || "").toLowerCase().includes(q) || (p.content || "").toLowerCase().includes(q) || (p.country || "").toLowerCase().includes(q);
    });

  const tabs = [
    { id: "experience",    label: "Visa Experience", icon: ShieldCheck },
    { id: "companion",     label: "Travel",          icon: Plane },
    { id: "accommodation", label: "Stay",            icon: Home },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-200 selection:bg-blue-500/30 font-sans antialiased overflow-x-hidden transition-colors duration-500">
      <style>{SPATIAL_CSS}</style>

      {/* ── AMBIENT LIGHT LAYER ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-blue-400/[0.06] dark:bg-blue-600/[0.07] rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-violet-400/[0.05] dark:bg-violet-600/[0.05] rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[50%] w-[35%] h-[35%] bg-emerald-400/[0.03] dark:bg-emerald-600/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ════════════════════════════════════════════
            MAIN CONTENT
           ════════════════════════════════════════════ */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

          {/* ── HEADER ── */}
          <header className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
                className="p-2.5 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl backdrop-blur-md hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-all shadow-sm dark:shadow-none">
                <ArrowLeft size={18} className="text-slate-600 dark:text-slate-300" />
              </motion.button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                  SLOT<span className="bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">PILOT</span>
                </h1>
                <p className="text-[9px] text-slate-400 dark:text-slate-600 tracking-[0.3em] font-bold uppercase">Intelligence Hub</p>
              </div>
            </div>
          </header>

          {/* ════════════════════════════════════════════
              HORIZONTAL CATEGORY BAR
             ════════════════════════════════════════════ */}
          <nav className="flex flex-row items-center justify-start gap-3 sm:gap-4 overflow-x-auto pb-1 mb-8 scrollbar-none -mx-1 px-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-400 min-h-[44px]
                    backdrop-blur-xl border
                    ${isActive
                      ? "sp-pill-active bg-blue-500/15 dark:bg-blue-500/20 border-blue-400/40 dark:border-blue-400/50 text-blue-600 dark:text-blue-300 shadow-lg shadow-blue-500/10"
                      : "bg-white/60 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 hover:bg-blue-50/80 dark:hover:bg-blue-500/[0.08] hover:border-blue-300/50 dark:hover:border-blue-400/20 hover:text-blue-600 dark:hover:text-blue-300"
                    }`}
                >
                  <TabIcon size={16} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 rounded-full border-2 border-blue-400/30 dark:border-blue-400/40 pointer-events-none"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* ── FLOATING COMMAND BAR ── */}
          <div className="sticky top-3 z-40 mb-8">
            <div className="flex items-center h-12 px-4 rounded-2xl
              bg-white/80 dark:bg-slate-900/55 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06]
              shadow-lg dark:shadow-none shadow-slate-200/50
              transition-all duration-500 focus-within:border-blue-400 dark:focus-within:border-blue-500/30 focus-within:shadow-blue-100 dark:focus-within:shadow-none">
              <Search size={16} className="text-blue-500 dark:text-blue-400/60 flex-shrink-0" />
              <input placeholder="Search intelligence..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white px-3 h-full" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors">
                  <X size={14} className="text-slate-400 dark:text-slate-500" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.02]">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">⌘K</span>
              </div>
            </div>
          </div>

          {/* (Mobile tab switcher removed — horizontal category bar above handles all breakpoints) */}

          {/* ── SECTION HEADER (STATIC — anchored outside tab animation) ── */}
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-3">
              {(() => {
                const style = POST_TYPE_STYLES[activeTab];
                const TypeIcon = style.icon;
                return (<>
                  <div className={`p-2 rounded-xl ${style.badgeBg} border ${style.badgeBorder}`}>
                    <TypeIcon size={16} className={style.badgeText} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{style.label}</h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-semibold">{filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}</p>
                  </div>
                </>);
              })()}
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider hover:bg-blue-100 dark:hover:bg-blue-600/25 transition-all">
              <Plus size={14} /> New Post
            </motion.button>
          </div>

          {/* ── CONTENT AREA (stable height prevents footer jump) ── */}
          <div className="min-h-[70vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ── POSTS FEED ── */}
              <div className="space-y-5">
                {loading ? (
                  [1, 2, 3].map(n => (
                    <div key={n} className="h-48 rounded-[1.75rem] animate-pulse bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.04]" />
                  ))
                ) : filteredPosts.length === 0 ? (
                  <div className="w-full p-10 rounded-[1.75rem] bg-white/70 dark:bg-white/[0.025] backdrop-blur-[15px] border border-slate-200/80 dark:border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center min-h-[400px]">
                    <Sparkles size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <p className="text-slate-500 font-semibold">No posts yet</p>
                    <p className="text-slate-400 dark:text-slate-700 text-xs mt-1">Be the first to share intelligence</p>
                  </div>
              ) : (
                filteredPosts.map((post, index) => {
                  const style = POST_TYPE_STYLES[post.type] || POST_TYPE_STYLES.experience;
                  const TypeIcon = style.icon;
                  const isRejectionStory = post.type === "experience" && post.rejectionInsights?.mistakes?.length > 0;

                  return (
                    <RevealCard key={post.id} index={index}>
                      <div className={`relative p-6 sm:p-7 rounded-[1.75rem] overflow-hidden transition-all duration-500
                        bg-white/70 dark:bg-white/[0.025]
                        backdrop-blur-[15px] saturate-[1.3]
                        border border-slate-200/80 dark:border-white/[0.06]
                        shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_24px_rgba(0,0,0,0.06)]
                        dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.15)]
                        hover:bg-white/90 dark:hover:bg-white/[0.06]
                        hover:border-slate-300 dark:hover:border-white/[0.10]
                        hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_40px_rgba(0,0,0,0.08)]
                        dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.25)]
                        hover:-translate-y-[3px]
                        ${post.verified ? "sp-verified-breathe" : ""}
                      `}>
                        {/* Inner glow gradient overlay */}
                        <div className="absolute inset-0 rounded-[inherit] pointer-events-none bg-gradient-to-br from-white/30 dark:from-white/[0.03] via-transparent to-transparent" />

                        {/* Red Flag Chip */}
                        {isRejectionStory && <RedFlagChip rejectionInsights={post.rejectionInsights} />}

                        {/* ── POST HEADER ── */}
                        <div className="relative flex items-start gap-3 mb-4">
                          <div className={`p-2 rounded-xl ${style.badgeBg} border ${style.badgeBorder} flex-shrink-0`}>
                            <TypeIcon size={16} className={`${style.badgeText} ${style.pulse ? "sp-help-pulse" : ""} ${style.glow ? "sp-gem-glow" : ""}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${style.badgeBg} ${style.badgeText} ${style.badgeBorder}`}>
                                {style.label}
                              </span>
                              <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/[0.03] text-slate-500 rounded-full text-[9px] font-bold uppercase tracking-widest border border-slate-200 dark:border-white/[0.04]">
                                {post.country || "GLOBAL"}
                              </span>
                              {post.verified && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                                  className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-400/20 flex items-center gap-1">
                                  <CheckCircle size={9} /> Certified
                                </motion.span>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug pr-16">
                              {post.title}
                            </h3>
                          </div>
                        </div>

                        {/* ── CONTENT ── */}
                        <p className="relative text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-4 line-clamp-4 ml-[52px]">
                          {post.content}
                        </p>

                        {/* ── PRO FEATURES ── */}
                        {post.type === "experience" && post.rejectionInsights && (
                          <div className="ml-[52px]"><MistakeAnalysis rejectionInsights={post.rejectionInsights} /></div>
                        )}
                        {post.type === "companion" && post.travelReview && (
                          <div className="ml-[52px]"><TravelReview travelReview={post.travelReview} /></div>
                        )}
                        {post.type === "accommodation" && (() => {
                          const pStatus = taskStatusMap[post.id];
                          const taskDetail = taskDetailsMap[post.id];
                          return (
                            <div className="ml-[52px] mt-3 space-y-2.5">
                              {/* Status Badge */}
                              {pStatus === "in-progress" && (
                                <div className="sp-status-pulse flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-500/[0.06] border border-amber-300/40 dark:border-amber-500/20 backdrop-blur-sm">
                                  <Loader2 size={14} className="animate-spin text-amber-500" />
                                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Being Handled</span>
                                </div>
                              )}
                              {(pStatus === "completed" || pStatus === "done") && (
                                <div className="space-y-2">
                                  <div className="sp-status-glow flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-500/[0.06] border border-emerald-300/40 dark:border-emerald-500/20 backdrop-blur-sm">
                                    <CheckCircle size={14} className="text-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Process Completed</span>
                                  </div>
                                  <button
                                    onClick={async () => {
                                      if (!taskDetail) return;
                                      try {
                                        await addDoc(collection(db, "employee_tasks"), {
                                          type: "secure_room",
                                          postId: post.id,
                                          postTitle: post.title || "Room Listing",
                                          landlordContact: taskDetail.landlordContact || post.country || "See post details",
                                          userRequest: "Secure the room",
                                          requestedBy: taskDetail.requestedBy || "community_user",
                                          userName: taskDetail.userName || "",
                                          userEmail: taskDetail.userEmail || "",
                                          userPhone: taskDetail.userPhone || "",
                                          status: "pending",
                                          processStatus: "re-opened",
                                          isReopen: true,
                                          reopenNote: "User reported no contact after completion.",
                                          createdAt: serverTimestamp(),
                                        });
                                      } catch (err) { console.error(err); }
                                    }}
                                    className="w-full text-center text-[11px] text-slate-500 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer leading-relaxed py-1.5 px-3 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-500/[0.06]"
                                  >
                                    <span className="flex items-center justify-center gap-1.5">
                                      <RefreshCcw size={11} />
                                      If you haven't received a call or email yet, <span className="font-bold underline underline-offset-2">click here to re-submit</span>.
                                    </span>
                                  </button>
                                </div>
                              )}
                              {pStatus === "re-opened" && (
                                <div className="sp-status-pulse flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-500/[0.06] border border-amber-300/40 dark:border-amber-500/20 backdrop-blur-sm">
                                  <RefreshCcw size={14} className="text-amber-500" />
                                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Re-submitted · Being Reviewed</span>
                                </div>
                              )}

                              {/* Show Arrange button only if no task exists yet */}
                              {!pStatus && (
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                                  disabled={bookingPostId === post.id} onClick={() => handleSecureRoom(post)}
                                  className="w-full py-3 bg-gradient-to-r from-violet-600/80 to-blue-600/80 hover:from-violet-500/90 hover:to-blue-500/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-violet-500/20 backdrop-blur-sm transition-all disabled:opacity-50 shadow-md shadow-violet-500/10">
                                  {bookingPostId === post.id ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                                  Arrange via SlotPilot (Paid)
                                </motion.button>
                              )}
                            </div>
                          );
                        })()}

                        {/* ── REACTION BAR ── */}
                        <div className="relative flex items-center justify-between mt-5 ml-[52px]">
                          <div className="flex items-center gap-2">
                            <ReactionBubble icon={Heart} count={post.likes || 0} color="text-rose-500 dark:text-rose-400" />
                            <ReactionBubble icon={MessageSquare} count={post.comments || 0} color="text-blue-500 dark:text-blue-400" />
                            <ReactionBubble icon={Bookmark} count={0} color="text-amber-500 dark:text-amber-400" />
                            <ReactionBubble icon={Share2} count={0} color="text-emerald-500 dark:text-emerald-400" />
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-600 font-semibold">
                            {post.createdAt?.toDate?.()?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>

                        {/* ── NESTED COMMENT PREVIEW ── */}
                        {(post.comments || 0) > 0 && (
                          <div className="relative ml-[52px] mt-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.015] backdrop-blur-lg border border-slate-200/60 dark:border-white/[0.04]">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-md bg-slate-200 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.06] flex items-center justify-center text-[8px] font-bold text-slate-500">SP</div>
                              <span className="text-[10px] text-slate-500 font-semibold">SlotPilot Team</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">Thanks for sharing! This is valuable intel for the community. 🙌</p>
                          </div>
                        )}
                      </div>
                    </RevealCard>
                  );
                })
              )}
              </div>
            </motion.div>
          </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── FAB (mobile only) ── */}
      <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl shadow-[0_16px_40px_rgba(59,130,246,0.25)] flex items-center justify-center text-white z-50 group overflow-hidden md:hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Plus size={28} className="relative z-10" />
      </motion.button>

      {/* ════════════════════════════════════════════
          POST CREATION MODAL
         ════════════════════════════════════════════ */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowModal(false); resetForm(); }}
              className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-2xl" />

            <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }}
              className="relative w-full max-w-lg bg-white/95 dark:bg-[#0a0f1e]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.06] rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">

              <button onClick={() => { setShowModal(false); resetForm(); }} className="absolute top-6 right-6 text-slate-400 dark:text-slate-600 hover:text-slate-800 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                {(() => { const s = POST_TYPE_STYLES[activeTab]; const I = s.icon; return (
                  <div className={`p-2 rounded-xl ${s.badgeBg} border ${s.badgeBorder}`}><I size={18} className={s.badgeText} /></div>
                ); })()}
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">New Intel</h2>
                  <p className="text-[9px] text-slate-400 dark:text-slate-600 uppercase tracking-widest font-bold">{POST_TYPE_STYLES[activeTab].label}</p>
                </div>
              </div>

              <form onSubmit={handlePostSubmit} className="space-y-3">
                <input placeholder="Headline"
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] p-4 rounded-xl focus:ring-1 focus:ring-blue-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-bold text-sm text-slate-900 dark:text-white"
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <input placeholder="Country / Region"
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] p-4 rounded-xl focus:ring-1 focus:ring-blue-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 text-sm text-slate-900 dark:text-white"
                  value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                <textarea placeholder="Share your intelligence..." rows={3}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] p-4 rounded-xl focus:ring-1 focus:ring-blue-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none text-sm text-slate-900 dark:text-white"
                  value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />

                {/* ── EXPERIENCE: Mistake Analysis ── */}
                {activeTab === "experience" && (
                  <div className="border border-red-200 dark:border-red-500/10 rounded-xl p-4 space-y-2.5 bg-red-50/50 dark:bg-red-500/[0.02]">
                    <p className="text-[9px] text-red-500/70 dark:text-red-400/70 font-black uppercase tracking-widest">🔴 Mistake Analysis (Optional)</p>
                    <input placeholder="Mistake phrase" className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/[0.04] p-3 rounded-lg outline-none text-xs placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-900 dark:text-white" value={mistakeText} onChange={e => setMistakeText(e.target.value)} />
                    <input placeholder="Why it's wrong" className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/[0.04] p-3 rounded-lg outline-none text-xs placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-900 dark:text-white" value={mistakeExplanation} onChange={e => setMistakeExplanation(e.target.value)} />
                    <input placeholder="Pro Tip: correct approach" className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/[0.04] p-3 rounded-lg outline-none text-xs placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-900 dark:text-white" value={mistakeProTip} onChange={e => setMistakeProTip(e.target.value)} />
                    <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={addMistake} disabled={!mistakeText}
                      className="px-4 py-2 bg-red-100 dark:bg-red-600/15 text-red-600 dark:text-red-300 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-red-200 dark:border-red-500/15 disabled:opacity-20 transition-all">
                      + Add ({mistakes.length})
                    </motion.button>
                  </div>
                )}

                {/* ── COMPANION: Travel Review ── */}
                {activeTab === "companion" && (
                  <div className="border border-amber-200 dark:border-amber-500/10 rounded-xl p-4 space-y-2.5 bg-amber-50/50 dark:bg-amber-500/[0.02]">
                    <p className="text-[9px] text-amber-600/70 dark:text-amber-400/70 font-black uppercase tracking-widest">⭐ Review (Optional)</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-600 font-bold mr-1">Rate:</span>
                      {[1,2,3,4,5].map(n => (
                        <motion.button key={n} type="button" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => setTravelRating(n)}>
                          <Star size={16} className={`cursor-pointer ${n <= travelRating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-white/[0.06]"}`} />
                        </motion.button>
                      ))}
                      {travelRating > 0 && <span className="text-amber-500 dark:text-amber-400 text-[10px] font-bold ml-1">{travelRating}/5</span>}
                    </div>
                    <textarea placeholder="Pros (one per line)" rows={2} className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/[0.04] p-3 rounded-lg outline-none text-xs placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none text-slate-900 dark:text-white" value={travelPros} onChange={e => setTravelPros(e.target.value)} />
                    <textarea placeholder="Cons (one per line)" rows={2} className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/[0.04] p-3 rounded-lg outline-none text-xs placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none text-slate-900 dark:text-white" value={travelCons} onChange={e => setTravelCons(e.target.value)} />
                    <textarea placeholder="Hidden Gems (one per line)" rows={2} className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/[0.04] p-3 rounded-lg outline-none text-xs placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none text-slate-900 dark:text-white" value={travelGems} onChange={e => setTravelGems(e.target.value)} />
                  </div>
                )}

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} disabled={isSubmitting} type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/15 uppercase tracking-wider mt-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <><Send size={14} /> Post Intel</>}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════
          CONTACT DETAILS MODAL
         ════════════════════════════════════════════ */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (!contactSubmitting) { setShowContactModal(false); setSelectedPost(null); setContactInfo({ name: "", email: "", phone: "" }); setContactSubmitted(false); } }}
              className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-2xl" />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl
                bg-white/80 dark:bg-[#0a0f1e]/80
                backdrop-blur-2xl saturate-[1.4]
                border border-slate-200/60 dark:border-white/[0.08]
                shadow-[0_32px_80px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)]
                dark:shadow-[0_32px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]
                p-8"
            >
              {/* Decorative gradient blobs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-400/20 dark:bg-violet-600/15 rounded-full blur-[60px] pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-[50px] pointer-events-none" />

              {/* Close button */}
              {!contactSubmitting && !contactSubmitted && (
                <button onClick={() => { setShowContactModal(false); setSelectedPost(null); setContactInfo({ name: "", email: "", phone: "" }); }}
                  className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 dark:text-slate-600 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all z-10">
                  <X size={18} />
                </button>
              )}

              <AnimatePresence mode="wait">
                {contactSubmitted ? (
                  /* ── SUCCESS STATE ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="relative flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="w-20 h-20 mb-5">
                      <svg viewBox="0 0 52 52" className="w-full h-full">
                        <circle className="sp-check-circle" cx="26" cy="26" r="25" fill="none" stroke="url(#successGrad)" strokeWidth="2" />
                        <path className="sp-check-mark" fill="none" stroke="url(#successGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        <defs>
                          <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Request Sent!</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px]">
                      A SlotPilot concierge will reach out to you shortly.
                    </p>
                  </motion.div>
                ) : (
                  /* ── FORM STATE ── */
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
                    {/* Header */}
                    <div className="relative flex items-center gap-3 mb-7">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/15 to-blue-500/15 border border-violet-500/20">
                        <Home size={18} className="text-violet-500 dark:text-violet-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Concierge Contact Details</h2>
                        <p className="text-[9px] text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] font-bold">
                          {selectedPost?.title || "Accommodation"}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleContactSubmit} className="space-y-3.5">
                      {/* Full Name */}
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600">
                          <User size={15} />
                        </div>
                        <input
                          type="text" placeholder="Full Name" autoFocus
                          value={contactInfo.name}
                          onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                          className="w-full bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] pl-11 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 dark:focus:border-violet-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Email */}
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600">
                          <Mail size={15} />
                        </div>
                        <input
                          type="email" placeholder="Email Address"
                          value={contactInfo.email}
                          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                          className="w-full bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] pl-11 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 dark:focus:border-violet-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Phone */}
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600">
                          <Phone size={15} />
                        </div>
                        <input
                          type="tel" placeholder="+91 98765 43210"
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                          className="w-full bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] pl-11 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 dark:focus:border-violet-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                        />
                      </div>

                      <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center font-medium pt-1">
                        We'll only use this to coordinate your stay.
                      </p>

                      {/* Submit */}
                      <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                        disabled={!contactInfo.name || !contactInfo.email || !contactInfo.phone || contactSubmitting}
                        type="submit"
                        className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-wider mt-1 transition-all
                          bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500
                          text-white shadow-lg shadow-violet-600/15
                          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-violet-600 disabled:hover:to-blue-600"
                      >
                        {contactSubmitting ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <><Send size={14} /> Submit Request</>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Communities;