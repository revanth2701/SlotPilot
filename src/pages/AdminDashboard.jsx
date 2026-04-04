import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { supabase } from "@/integrations/supabase/client";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, CheckCircle, Home, AlertTriangle, User,
  Phone, Loader2, RefreshCw, MessageSquare, Mail, Users,
  BookOpen, Globe, GraduationCap, Search, Download, Briefcase, LogOut
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table";

/* Admin password gate removed — auth is handled by EmployerLoginRegister */

/* ──────────────────────────────────────────────
   Tab content transition wrapper
   ────────────────────────────────────────────── */
const TabPanel = ({ children, tabKey }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(true);

  const [activeTab, setActiveTab] = useState("hq");

  /* ── Firebase state (HQ Command) ── */
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  /* ── Supabase state (Recruitment) ── */
  const [studentsData, setStudentsData] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [docLoading, setDocLoading] = useState(false);

  /* ── Supabase state (Visas) ── */
  const [visaData, setVisaData] = useState([]);
  const [visaLoading, setVisaLoading] = useState(false);

  /* ── Mobile detection ── */
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ──────────────── LOGOUT ──────────────── */
  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch (e) { console.error(e); }
    localStorage.clear();
    sessionStorage.clear();
    navigate("/employer-login", { replace: true });
  };

  /* ──────────────── FIREBASE FETCHES ──────────────── */
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

  /* ──────────────── SUPABASE FETCHES ──────────────── */
  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const { data, error } = await supabase.from("Studentpersonaldata").select("*");
      setStudentsData(!error && data ? data : []);
    } catch { setStudentsData([]); }
    finally { setStudentsLoading(false); }
  };

  const fetchVisas = async () => {
    setVisaLoading(true);
    try {
      const { data, error } = await supabase.from("Visaappointments").select("*");
      setVisaData(!error && Array.isArray(data) ? data : []);
    } catch { setVisaData([]); }
    finally { setVisaLoading(false); }
  };

  /* ── Fetch all on initial auth ── */
  useEffect(() => {
    if (authenticated) { fetchPosts(); fetchTasks(); fetchStudents(); fetchVisas(); }
  }, [authenticated]);

  const refreshAll = () => { fetchPosts(); fetchTasks(); fetchStudents(); fetchVisas(); };

  /* ──────────────── FIREBASE ACTIONS ──────────────── */
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
    const processMap = { in_progress: "in-progress", done: "completed" };
    const processStatus = processMap[newStatus] || newStatus;
    try {
      await updateDoc(doc(db, "employee_tasks", taskId), { status: newStatus, processStatus });
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: newStatus, processStatus } : t)));
    } catch (e) { console.error(e); }
  };

  /* ──────────────── SUPABASE ACTIONS ──────────────── */
  const downloadStudentDocuments = async (student) => {
    setDocLoading(true);
    setSelectedStudent(student);

    const { data, error } = await supabase
      .from("student_documents")
      .select("*")
      .ilike("student_email", (student.Email || "").trim());

    if (error || !data || data.length === 0) {
      alert("No documents found for this student.");
      setDocLoading(false);
      return;
    }

    const zip = new JSZip();
    await Promise.all(
      data.map(async (d) => {
        try {
          const { data: fileData, error: fileError } = await supabase
            .storage.from("student-documents").download(d.file_path);
          if (fileError || !fileData) return;
          let blob = fileData instanceof Blob ? fileData
            : (fileData instanceof Response && fileData.body) ? await fileData.blob() : null;
          if (blob && blob.size > 0) {
            zip.file(d.file_name || d.document_type || d.file_path.split("/").pop(), blob);
          }
        } catch (err) { console.error("Error fetching file:", d.file_path, err); }
      })
    );

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(
        content,
        `${student?.["First Name"] || "student"}_${student?.["Last Name"] || ""}_documents.zip`
      );
    } catch (err) { console.error("Error generating zip:", err); }
    finally { setDocLoading(false); }
  };

  const formatCell = (val) => {
    if (val === null || val === undefined || val === "") return "—";
    if (typeof val === "string" && (/\d{4}-\d{2}-\d{2}T|\d{4}-\d{2}-\d{2}/).test(val)) {
      const d = new Date(val);
      if (!Number.isNaN(d.getTime())) return d.toLocaleString();
    }
    if (typeof val === "object") { try { return JSON.stringify(val); } catch { return String(val); } }
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return String(val);
  };

  const exportVisasAsCSV = () => {
    if (!visaData || visaData.length === 0) { alert("No visa data to download."); return; }
    const cols = Array.from(new Set(visaData.flatMap(Object.keys)));
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return "";
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const csv = [cols.map(escapeCsv).join(","), ...visaData.map(row => cols.map(col => escapeCsv(row[col])).join(","))].join("\r\n");
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `visa_applications_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  /* ──────────────── COMPUTED ──────────────── */
  const unverifiedPosts = posts.filter(p => !p.verified);
  const verifiedPosts = posts.filter(p => p.verified);
  const visaCols = visaData.length ? Array.from(new Set(visaData.flatMap(Object.keys))) : [];

  const filteredStudents = studentsData.filter(s =>
    (((s?.["First Name"] || "") + " " + (s?.["Last Name"] || "")).toLowerCase().includes(searchTerm.toLowerCase())) ||
    ((s?.Email || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredVisa = visaData.filter((row) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return Object.values(row).some(v => (v == null ? "" : String(v)).toLowerCase().includes(q));
  });

  /* Login gate removed — authentication is handled by EmployerLoginRegister */

  /* ════════════════════════════════════════════
     UNIFIED DASHBOARD
     ════════════════════════════════════════════ */
  const tabs = [
    { id: "hq", label: "HQ Command", icon: <Shield size={16} /> },
    { id: "recruitment", label: "Recruitment", icon: <Users size={16} /> },
    { id: "visas", label: "Visas", icon: <Globe size={16} /> },
  ];

  const statCards = [
    { label: "Unverified", value: unverifiedPosts.length, color: "text-amber-600 dark:text-amber-400", icon: <AlertTriangle size={16} />, tab: "hq" },
    { label: "Verified", value: verifiedPosts.length, color: "text-emerald-600 dark:text-emerald-400", icon: <CheckCircle size={16} />, tab: "hq" },
    { label: "Total Posts", value: posts.length, color: "text-blue-600 dark:text-blue-400", icon: <MessageSquare size={16} />, tab: "hq" },
    { label: "Stays Tasks", value: tasks.length, color: "text-violet-600 dark:text-violet-400", icon: <Home size={16} />, tab: "hq" },
    { label: "Students", value: studentsData.length, color: "text-cyan-600 dark:text-cyan-400", icon: <GraduationCap size={16} />, tab: "recruitment" },
    { label: "Visa Apps", value: visaData.length, color: "text-rose-600 dark:text-rose-400", icon: <Briefcase size={16} />, tab: "visas" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-800 dark:text-slate-200 font-sans antialiased overflow-x-hidden transition-colors duration-500">
      <style>{`
        @keyframes sp-flag-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        .sp-redflag-chip { animation: sp-flag-bob 2s ease-in-out infinite; }
      `}</style>
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/[0.06] dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/[0.04] dark:bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div className="flex items-center gap-3 sm:gap-4">
            <div>
              <h1 className="font-black tracking-tighter text-slate-900 dark:text-white italic" style={{ fontSize: "clamp(1.25rem, 4vw, 2.25rem)" }}>
                SLOT<span className="text-blue-600 dark:text-blue-500">PILOT</span> HQ
              </h1>
              <p className="text-blue-500/50 dark:text-blue-400/40 text-[10px] tracking-[0.3em] sm:tracking-[0.4em] font-bold mt-0.5 sm:mt-1 uppercase">
                UNIFIED COMMAND DASHBOARD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshAll}
              className="p-2.5 sm:p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl backdrop-blur-md hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <RefreshCw size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl sm:rounded-2xl backdrop-blur-md hover:bg-red-100 dark:hover:bg-red-500/20 transition-all shadow-sm dark:shadow-none min-h-[44px] text-red-600 dark:text-red-400 font-bold text-xs sm:text-sm uppercase tracking-wider"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </header>

        {/* ── Tab Navigation ── */}
        <nav className="flex justify-center p-1 sm:p-1.5 bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-[2rem] mb-8 sm:mb-10 max-w-fit mx-auto shadow-md dark:shadow-2xl">
          {tabs.map((tab) => (
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
                  layoutId="hqTab"
                  className="absolute inset-0 bg-blue-600 rounded-xl sm:rounded-[1.5rem] shadow-[0_0_20px_rgba(37,99,235,0.3)] sm:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Combined Stats Row ── */}
        <motion.div
          layout
          className={`mb-8 sm:mb-10 ${
            activeTab === "hq"
              ? "grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
              : "flex justify-center"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {statCards
              .filter((s) => s.tab === activeTab)
              .map((s) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  key={s.label}
                  className={`bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm border border-slate-200 dark:border-white/[0.08] rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center shadow-sm dark:shadow-none ${
                    activeTab !== "hq" ? "w-full max-w-sm" : ""
                  }`}
                >
                  <div className={`flex justify-center mb-1.5 sm:mb-2 ${s.color}`}>{s.icon}</div>
                  <p className="font-black text-slate-900 dark:text-white" style={{ fontSize: "clamp(1.25rem, 3vw, 1.875rem)" }}>{s.value}</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">
                    {s.label}
                  </p>
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>

        {/* ════════════════ TAB CONTENT ════════════════ */}

        {/* ── HQ COMMAND ── */}
        {activeTab === "hq" && (
          <TabPanel tabKey="hq">
            {/* Sub-section toggle for Verify / Stays */}
            <HqCommandTab
              posts={posts}
              postsLoading={postsLoading}
              unverifiedPosts={unverifiedPosts}
              verifiedPosts={verifiedPosts}
              verifying={verifying}
              handleVerify={handleVerify}
              tasks={tasks}
              tasksLoading={tasksLoading}
              handleTaskStatus={handleTaskStatus}
            />
          </TabPanel>
        )}

        {/* ── RECRUITMENT ── */}
        {activeTab === "recruitment" && (
          <TabPanel tabKey="recruitment">
            <RecruitmentTab
              studentsLoading={studentsLoading}
              filteredStudents={filteredStudents}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              downloadStudentDocuments={downloadStudentDocuments}
              docLoading={docLoading}
              selectedStudent={selectedStudent}
              isMobile={isMobile}
            />
          </TabPanel>
        )}

        {/* ── VISAS ── */}
        {activeTab === "visas" && (
          <TabPanel tabKey="visas">
            <VisasTab
              visaData={visaData}
              visaLoading={visaLoading}
              visaCols={visaCols}
              filteredVisa={filteredVisa}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              exportVisasAsCSV={exportVisasAsCSV}
              formatCell={formatCell}
              fetchVisas={fetchVisas}
              isMobile={isMobile}
            />
          </TabPanel>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   HQ COMMAND TAB (Verify Posts + Stays Tasks)
   ═══════════════════════════════════════════════ */
const HqCommandTab = ({
  posts, postsLoading, unverifiedPosts, verifiedPosts,
  verifying, handleVerify, tasks, tasksLoading, handleTaskStatus
}) => {
  const [hqView, setHqView] = useState("verify");

  return (
    <div>
      {/* Sub-nav */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "verify", label: "Verify Posts", icon: <CheckCircle size={14} /> },
          { id: "tasks", label: "Stays Tasks", icon: <Home size={14} /> },
        ].map((sub) => (
          <button
            key={sub.id}
            onClick={() => setHqView(sub.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all min-h-[44px] border ${
              hqView === sub.id
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                : "bg-white/70 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10"
            }`}
          >
            {sub.icon} {sub.label}
          </button>
        ))}
      </div>

      {/* Verify Posts */}
      {hqView === "verify" && (
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

      {/* Stays Tasks */}
      {hqView === "tasks" && (
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
                  const aReopen = a.isReopen ? 1 : 0;
                  const bReopen = b.isReopen ? 1 : 0;
                  if (aReopen !== bReopen) return bReopen - aReopen;
                  return 0;
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
  );
};

/* ═══════════════════════════════════════════════
   RECRUITMENT TAB (Student Applications)
   ═══════════════════════════════════════════════ */
const RecruitmentTab = ({
  studentsLoading, filteredStudents, searchTerm, setSearchTerm,
  downloadStudentDocuments, docLoading, selectedStudent, isMobile
}) => (
  <div>
    {/* Search */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
      <div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Student Applications</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage and review student applications for international studies</p>
      </div>
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
        />
      </div>
    </div>

    {/* Table */}
    <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm border border-slate-200 dark:border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
      {studentsLoading ? (
        <div className="flex items-center justify-center py-16 sm:py-20">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : !isMobile ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-white/[0.08]">
                <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Student Name</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Contact</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Passport</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Expiry</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Issued</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">No students found.</TableCell>
                </TableRow>
              ) : filteredStudents.map((student, idx) => (
                <TableRow key={(student.Email || "") + idx} className="border-slate-100 dark:border-white/[0.04] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell>
                    <p className="font-bold text-slate-900 dark:text-white">{student["First Name"]} {student["Last Name"]}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{student.Email}</p>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{student["contact Number"]}</TableCell>
                  <TableCell className="font-mono text-sm text-slate-700 dark:text-slate-300">{student["Passport Number"]}</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold border border-blue-200 dark:border-blue-500/20">
                      {student["Expiry Date"]}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{student["Issued Date"]}</TableCell>
                  <TableCell>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => downloadStudentDocuments(student)}
                      disabled={docLoading && selectedStudent?.Email === student.Email}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-600/20 transition-all disabled:opacity-50 min-h-[36px]"
                    >
                      <Download size={12} />
                      {docLoading && selectedStudent?.Email === student.Email ? "..." : "Docs"}
                    </motion.button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Mobile card view */
        <div className="p-3 space-y-3">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">No students found.</div>
          ) : filteredStudents.map((student, idx) => (
            <div key={(student.Email || "") + idx} className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/[0.06] shadow-sm">
              <p className="font-bold text-slate-900 dark:text-white">{student["First Name"]} {student["Last Name"]}</p>
              <p className="text-xs text-slate-500 mb-2">{student.Email}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-3">
                <span>📞 {student["contact Number"] || "—"}</span>
                <span>🛂 {student["Passport Number"] || "—"}</span>
              </div>
              <button
                onClick={() => downloadStudentDocuments(student)}
                disabled={docLoading && selectedStudent?.Email === student.Email}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 min-h-[40px] disabled:opacity-50"
              >
                <Download size={12} />
                {docLoading && selectedStudent?.Email === student.Email ? "Downloading..." : "Download Docs"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   VISAS TAB (Visa Applications)
   ═══════════════════════════════════════════════ */
const VisasTab = ({
  visaData, visaLoading, visaCols, filteredVisa,
  searchTerm, setSearchTerm, exportVisasAsCSV, formatCell, fetchVisas, isMobile
}) => (
  <div>
    {/* Header */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
      <div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Visa Applications</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Live list of applications submitted by users</p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search visas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-white/70 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={fetchVisas}
          className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          <RefreshCw size={16} />
        </motion.button>
      </div>
    </div>

    {/* Summary chips + Export */}
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <span className="px-3 py-1.5 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 backdrop-blur-sm">
        Total: {visaData.length}
      </span>
      <span className="px-3 py-1.5 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 backdrop-blur-sm">
        Countries: {Array.from(new Set(visaData.map(r => String(r["Country"] || r.country || "").trim()).filter(Boolean))).length || 0}
      </span>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={exportVisasAsCSV}
        disabled={visaLoading || visaData.length === 0}
        className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 min-h-[40px]"
      >
        <Download size={14} />
        Export CSV
      </motion.button>
    </div>

    {/* Visa Table */}
    <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm border border-slate-200 dark:border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
      {visaLoading ? (
        <div className="flex items-center justify-center py-16 sm:py-20">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : !isMobile ? (
        <div className="overflow-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-50/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm">
              <tr>
                {visaCols.length === 0 ? (
                  <th className="px-4 py-3 text-left text-sm text-slate-400">No Columns</th>
                ) : visaCols.map(col => (
                  <th key={col} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visaData.length === 0 ? (
                <tr>
                  <td colSpan={visaCols.length || 1} className="px-6 py-12 text-center">
                    <div className="inline-flex flex-col items-center gap-2">
                      <Globe size={40} className="text-slate-300 dark:text-slate-700" />
                      <div className="text-sm font-medium text-slate-500">No visa applications yet</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVisa.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-white/[0.04] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    {visaCols.map(col => (
                      <td key={col} className="px-4 py-3 align-top text-sm text-slate-700 dark:text-slate-300 break-words max-w-[220px]">
                        {formatCell(row[col])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile card view */
        <div className="p-3 space-y-3">
          {visaData.length === 0 ? (
            <div className="text-center py-12">
              <Globe size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">No visa applications yet</p>
            </div>
          ) : filteredVisa.map((row, idx) => {
            const colsToShow = visaCols.slice(0, 6);
            return (
              <div key={idx} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/[0.06] shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-400 font-bold">#{idx + 1}</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {formatCell(row["Full Name"] || row["name"] || row["ApplicantName"] || row["Email"] || "Applicant")}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full font-bold border border-blue-200 dark:border-blue-500/20 ml-2">
                    {formatCell(row["Country"] || row["country"] || "")}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {colsToShow.map(col => (
                    <div key={col} className="flex justify-between items-start text-xs">
                      <span className="text-slate-400 mr-2 truncate font-medium">{col}</span>
                      <span className="text-right text-slate-700 dark:text-slate-300 break-words">{formatCell(row[col])}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

export default AdminDashboard;
