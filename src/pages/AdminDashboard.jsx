import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, CheckCircle, Home, AlertTriangle, User,
  Phone, Loader2, RefreshCw, MessageSquare, Mail
} from "lucide-react";

const ADMIN_PASSWORD = "SLOTPILOT_ADMIN";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("verify");

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { setAuthenticated(true); setError(""); }
    else { setError("Invalid password. Access denied."); }
  };

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setPostsLoading(false); }
  };

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const q = query(collection(db, "employee_tasks"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setTasksLoading(false); }
  };

  useEffect(() => {
    if (authenticated) { fetchPosts(); fetchTasks(); }
  }, [authenticated]);

  const handleVerify = async (postId) => {
    setVerifying(postId);
    try {
      await updateDoc(doc(db, "posts", postId), {
        verified: true, verifiedAt: serverTimestamp(), verifiedBy: "employee",
      });
      setPosts(prev => prev.map(p => (p.id === postId ? { ...p, verified: true } : p)));
    } catch (e) { console.error(e); }
    finally { setVerifying(null); }
  };

  const handleTaskStatus = async (taskId, newStatus) => {
    // Map UI status to processStatus
    const processMap = { in_progress: "in-progress", done: "completed" };
    const processStatus = processMap[newStatus] || newStatus;
    try {
      await updateDoc(doc(db, "employee_tasks", taskId), { status: newStatus, processStatus });
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus, processStatus } : t)));
    } catch (e) { console.error(e); }
  };

  const unverifiedPosts = posts.filter(p => !p.verified);
  const verifiedPosts = posts.filter(p => p.verified);

  // ──── LOGIN GATE ────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-800 dark:text-slate-200 font-sans antialiased flex items-center justify-center p-4 sm:p-6 transition-colors duration-500">
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/[0.06] dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/[0.04] dark:bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-md bg-white/80 dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-xl dark:shadow-2xl"
        >
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-100 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
            </div>
            {/* Fluid heading using clamp() */}
            <h1 className="font-black text-slate-900 dark:text-white italic" style={{ fontSize: "clamp(1.5rem, 4vw, 1.875rem)" }}>
              COMMAND <span className="text-blue-600 dark:text-blue-500">CENTER</span>
            </h1>
            <p className="text-blue-500/50 dark:text-blue-400/40 text-[10px] tracking-[0.4em] font-bold mt-2 uppercase">
              Employee Access Only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* min-h-[44px] ensures 44px touch target */}
            <input
              type="password"
              placeholder="Enter access code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-4 sm:p-5 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-bold text-center tracking-widest min-h-[44px] text-slate-900 dark:text-white"
            />
            {error && (
              <p className="text-red-500 dark:text-red-400 text-xs text-center font-semibold">{error}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-tighter min-h-[48px]"
            >
              <Shield size={20} />
              Access Dashboard
            </motion.button>
          </form>

          <button
            onClick={() => navigate("/")}
            className="mt-6 text-slate-400 dark:text-slate-600 text-xs hover:text-slate-700 dark:hover:text-slate-400 transition-colors w-full text-center min-h-[44px] flex items-center justify-center"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  // ──── DASHBOARD ────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-800 dark:text-slate-200 font-sans antialiased overflow-x-hidden transition-colors duration-500">
      <style>{`
        @keyframes sp-flag-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        .sp-redflag-chip { animation: sp-flag-bob 2s ease-in-out infinite; }
      `}</style>
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/[0.06] dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/[0.04] dark:bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-16">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/")}
              className="p-2.5 sm:p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl backdrop-blur-md hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <div>
              {/* Fluid title */}
              <h1 className="font-black tracking-tighter text-slate-900 dark:text-white italic" style={{ fontSize: "clamp(1.25rem, 4vw, 2.25rem)" }}>
                SLOT<span className="text-blue-600 dark:text-blue-500">PILOT</span> HQ
              </h1>
              <p className="text-blue-500/50 dark:text-blue-400/40 text-[10px] tracking-[0.3em] sm:tracking-[0.4em] font-bold mt-0.5 sm:mt-1 uppercase">
                Employee Command Dashboard
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { fetchPosts(); fetchTasks(); }}
            className="p-2.5 sm:p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl backdrop-blur-md hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <RefreshCw size={18} />
          </motion.button>
        </header>

        {/* Tab Switcher */}
        <nav className="flex justify-center p-1 sm:p-1.5 bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-[2rem] mb-8 sm:mb-12 max-w-fit mx-auto shadow-md dark:shadow-2xl">
          {[
            { id: "verify", label: "Verify Posts", icon: <CheckCircle size={16} /> },
            { id: "tasks", label: "Stays Tasks", icon: <Home size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-[1.5rem] flex items-center gap-2 text-xs sm:text-sm font-bold transition-all duration-500 min-h-[44px] ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="adminTab"
                  className="absolute inset-0 bg-blue-600 rounded-xl sm:rounded-[1.5rem] shadow-[0_0_20px_rgba(37,99,235,0.3)] sm:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Stats Row — auto-fit grid wraps naturally */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {[
            { label: "Unverified", value: unverifiedPosts.length, color: "text-amber-600 dark:text-amber-400", icon: <AlertTriangle size={16} /> },
            { label: "Verified", value: verifiedPosts.length, color: "text-emerald-600 dark:text-emerald-400", icon: <CheckCircle size={16} /> },
            { label: "Total Posts", value: posts.length, color: "text-blue-600 dark:text-blue-400", icon: <MessageSquare size={16} /> },
            { label: "Stays Tasks", value: tasks.length, color: "text-violet-600 dark:text-violet-400", icon: <Home size={16} /> },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm border border-slate-200 dark:border-white/[0.08] rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center shadow-sm dark:shadow-none"
            >
              <div className={`flex justify-center mb-1.5 sm:mb-2 ${s.color}`}>{s.icon}</div>
              {/* Fluid stat number */}
              <p className="font-black text-slate-900 dark:text-white" style={{ fontSize: "clamp(1.25rem, 3vw, 1.875rem)" }}>{s.value}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ──── VERIFY TAB ──── */}
        {activeTab === "verify" && (
          <div className="space-y-3 sm:space-y-4">
            {postsLoading ? (
              <div className="flex items-center justify-center py-16 sm:py-20">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : unverifiedPosts.length === 0 ? (
              <div className="text-center py-16 sm:py-20">
                <CheckCircle size={48} className="mx-auto text-emerald-500/30 mb-4" />
                <p className="text-slate-500 font-semibold">All posts verified!</p>
              </div>
            ) : (
              <AnimatePresence>
                {unverifiedPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm border border-slate-200 dark:border-white/[0.08] p-4 sm:p-6 rounded-xl sm:rounded-[2rem] hover:bg-white/90 dark:hover:bg-white/[0.06] transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 shadow-sm dark:shadow-none"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                        <span className="px-2.5 sm:px-3 py-1 bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-500/20">
                          {post.type || "general"}
                        </span>
                        <span className="px-2.5 sm:px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-transparent">
                          {post.country || "GLOBAL"}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm line-clamp-2">
                        {post.content}
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      disabled={verifying === post.id}
                      onClick={() => handleVerify(post.id)}
                      className="flex-shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 min-h-[44px] min-w-[44px] w-full sm:w-auto"
                    >
                      {verifying === post.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Verify
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* ──── STAYS TASKS TAB ──── */}
        {activeTab === "tasks" && (
          <div className="space-y-3 sm:space-y-4">
            {tasksLoading ? (
              <div className="flex items-center justify-center py-16 sm:py-20">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16 sm:py-20">
                <Home size={48} className="mx-auto text-blue-500/20 mb-4" />
                <p className="text-slate-500 font-semibold">No stays tasks yet</p>
              </div>
            ) : (
              <AnimatePresence>
                {[...tasks]
                  .sort((a, b) => {
                    // Re-opened tasks float to top
                    const aReopen = a.isReopen ? 1 : 0;
                    const bReopen = b.isReopen ? 1 : 0;
                    if (aReopen !== bReopen) return bReopen - aReopen;
                    return 0; // preserve createdAt desc from Firestore
                  })
                  .map((task, idx) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm border border-slate-200 dark:border-white/[0.08] p-4 sm:p-6 rounded-xl sm:rounded-[2rem] hover:bg-white/90 dark:hover:bg-white/[0.06] transition-all duration-300 shadow-sm dark:shadow-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
                          <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${
                            task.processStatus === "completed" || task.status === "done"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                              : task.processStatus === "in-progress" || task.status === "in_progress"
                              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                              : task.processStatus === "re-opened"
                              ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                              : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
                          }`}>
                            {task.processStatus || task.status || "pending"}
                          </span>
                          {task.isReopen && (
                            <span className="sp-redflag-chip px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25 flex items-center gap-1">
                              <AlertTriangle size={10} /> High Priority
                            </span>
                          )}
                          <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
                            Secure a Room
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                          {task.postTitle || "Room Request"}
                        </h3>

                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <User size={14} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                            <span className="text-slate-500 dark:text-slate-400">
                              Contact Name: <span className="text-slate-800 dark:text-white font-semibold">{task.userName || "Not provided"}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <Mail size={14} className="text-rose-500 dark:text-rose-400 flex-shrink-0" />
                            <span className="text-slate-500 dark:text-slate-400">
                              Email: <span className="text-slate-800 dark:text-white font-semibold">{task.userEmail || "Not provided"}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <Phone size={14} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                            <span className="text-slate-500 dark:text-slate-400">
                              Phone: <span className="text-slate-800 dark:text-white font-semibold">{task.userPhone || "Not provided"}</span>
                            </span>
                          </div>

                          <div className="h-px bg-slate-100 dark:bg-white/[0.04] my-1" />

                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <User size={14} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                            <span className="text-slate-500 dark:text-slate-400">
                              Requested by: <span className="text-slate-800 dark:text-white font-semibold">{task.requestedBy || "Anonymous"}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <Home size={14} className="text-violet-500 dark:text-violet-400 flex-shrink-0" />
                            <span className="text-slate-500 dark:text-slate-400">
                              Landlord: <span className="text-slate-800 dark:text-white font-semibold">{task.landlordContact || "Contact in post"}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <MessageSquare size={14} className="text-violet-500 dark:text-violet-400 flex-shrink-0" />
                            <span className="text-slate-500 dark:text-slate-400">
                              Request: <span className="text-slate-800 dark:text-white font-semibold">{task.userRequest || "Secure the room"}</span>
                            </span>
                          </div>

                          {/* Re-open note */}
                          {task.isReopen && task.reopenNote && (
                            <>
                              <div className="h-px bg-red-200 dark:bg-red-500/10 my-1" />
                              <div className="flex items-start gap-2 text-xs sm:text-sm">
                                <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <span className="text-red-600 dark:text-red-400 font-semibold">{task.reopenNote}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div className="flex flex-row sm:flex-col gap-2">
                        {task.status !== "in_progress" && task.status !== "done" && task.processStatus !== "in-progress" && task.processStatus !== "completed" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleTaskStatus(task.id, "in_progress")}
                            className="px-4 py-2 bg-amber-50 dark:bg-amber-600/20 hover:bg-amber-100 dark:hover:bg-amber-600/30 text-amber-600 dark:text-amber-300 rounded-xl text-xs font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-500/20 transition-all min-h-[44px] flex-1 sm:flex-none flex items-center justify-center"
                          >
                            Start
                          </motion.button>
                        )}
                        {task.status !== "done" && task.processStatus !== "completed" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleTaskStatus(task.id, "done")}
                            className="px-4 py-2 bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 text-emerald-600 dark:text-emerald-300 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20 transition-all min-h-[44px] flex-1 sm:flex-none flex items-center justify-center"
                          >
                            Done
                          </motion.button>
                        )}
                        {(task.status === "done" || task.processStatus === "completed") && (
                          <span className="px-4 py-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider text-center min-h-[44px] flex items-center justify-center">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
