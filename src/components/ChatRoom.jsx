import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ChatRoom = ({ room = "community" }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [name, setName] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const presenceIntervalRef = useRef(null);
  const [reactionsMap, setReactionsMap] = useState({});
  const [selectedThread, setSelectedThread] = useState(null);
  const [threads, setThreads] = useState({});
  const [attachmentFile, setAttachmentFile] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    // get current user and prefill name
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        const display = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "";
        setName(display);
      } else {
        setUser(null);
      }
    }).catch(() => {});

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("community_messages")
          .select("id, user_name, content, created_at")
          .order("created_at", { ascending: true })
          .limit(200);
        if (error) throw error;
        if (mounted && data) setMessages(data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    load();

    // realtime subscription (Supabase v2 channel API)
    const channel = supabase
      .channel(`public:community_messages`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages" },
        (payload) => {
          if (payload?.new) setMessages((m) => [...m, payload.new]);
        }
      )
      .subscribe();

    // presence & typing subscriptions
    const presenceChannel = supabase
      .channel(`public:chat_presence`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_presence" },
        () => {
          fetchPresence();
        }
      )
      .subscribe();

    const typingChannel = supabase
      .channel(`public:chat_typing`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_typing" },
        () => {
          fetchTyping();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      try { channel.unsubscribe(); } catch (e) { /* ignore */ }
      try { supabase.removeChannel?.(channel); } catch (e) { /* ignore */ }
      try { presenceChannel.unsubscribe(); } catch (e) { }
      try { typingChannel.unsubscribe(); } catch (e) { }
      stopPresence();
      stopTyping();
    };
  }, [room]);

  // Presence helpers
  const fetchPresence = async () => {
    try {
      const { data } = await supabase
        .from("chat_presence")
        .select("user_id, user_name, last_active, room")
        .eq("room", room)
        .order("last_active", { ascending: false });
      const now = Date.now();
      const recent = (data || []).filter(p => new Date(p.last_active).getTime() + 45000 > now);
      setOnlineUsers(recent);
    } catch (err) { console.error("fetchPresence", err); }
  };

  const startPresence = async () => {
    if (!user) return;
    try {
      await supabase.from("chat_presence").upsert({ user_id: user.id, user_name: name || user.email, room, last_active: new Date().toISOString() });
      // periodically refresh last_active
      presenceIntervalRef.current = setInterval(async () => {
        try {
          await supabase.from("chat_presence").upsert({ user_id: user.id, user_name: name || user.email, room, last_active: new Date().toISOString() });
        } catch (e) { /* ignore */ }
      }, 15000);
      fetchPresence();
    } catch (err) { console.error("startPresence", err); }
  };

  const stopPresence = async () => {
    if (presenceIntervalRef.current) clearInterval(presenceIntervalRef.current);
    if (!user) return;
    try { await supabase.from("chat_presence").delete().eq("user_id", user.id).eq("room", room); } catch (e) { }
  };

  // Typing helpers
  const fetchTyping = async () => {
    try {
      const { data } = await supabase
        .from("chat_typing")
        .select("user_id, user_name, room, expires_at")
        .eq("room", room);
      const now = Date.now();
      const active = (data || []).filter(t => new Date(t.expires_at).getTime() > now && t.user_id !== user?.id);
      setTypingUsers(active.map(a => a.user_name));
    } catch (err) { console.error("fetchTyping", err); }
  };

  const touchTyping = async () => {
    if (!user) return;
    try {
      const expires = new Date(Date.now() + 6000).toISOString();
      await supabase.from("chat_typing").upsert({ user_id: user.id, user_name: name || user.email, room, expires_at: expires });
    } catch (err) { /* ignore */ }
  };

  const stopTyping = async () => {
    if (!user) return;
    try { await supabase.from("chat_typing").delete().eq("user_id", user.id).eq("room", room); } catch (e) { }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  useEffect(() => {
    // scroll to bottom on new message
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault?.();
    const text = newMessage.trim();
    if (!text) return;
    try {
      // require authenticated user to post (guest allowed if server policy permits)
      const payload = { user_name: name || "Anonymous", content: text };
      if (user) payload.user_id = user.id;
      await supabase.from("community_messages").insert([payload]);
      setNewMessage("");
    } catch (err) {
      console.error("Send failed", err);
      alert("Failed to send message. Check console.");
    }
  };

  // when user types, touch typing row (throttled)
  const handleTypingEvent = (text) => {
    setNewMessage(text);
    if (!user) return;
    touchTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      // allow row to expire on server
    }, 7000);
  };

  // Reactions
  const fetchReactionsFor = async (messageIds) => {
    if (!messageIds || messageIds.length === 0) return;
    try {
      const { data } = await supabase.from("message_reactions").select("id, message_id, user_id, reaction").in("message_id", messageIds);
      const map = {};
      (data || []).forEach(r => {
        map[r.message_id] = map[r.message_id] || [];
        map[r.message_id].push(r);
      });
      setReactionsMap(prev => ({ ...prev, ...map }));
    } catch (e) { console.error("fetchReactions", e); }
  };

  const toggleReaction = async (messageId, emoji) => {
    if (!user) { navigate('/student-login'); return; }
    try {
      const { data: existing } = await supabase.from('message_reactions').select('*').eq('message_id', messageId).eq('user_id', user.id).eq('reaction', emoji).maybeSingle();
      if (existing) {
        await supabase.from('message_reactions').delete().eq('id', existing.id);
      } else {
        await supabase.from('message_reactions').insert([{ message_id: messageId, user_id: user.id, reaction: emoji }]);
      }
      await fetchReactionsFor([messageId]);
    } catch (err) { console.error('toggleReaction', err); }
  };

  // Threads (replies)
  const fetchThreads = async (messageId) => {
    try {
      const { data } = await supabase.from('message_threads').select('id, parent_message_id, user_id, user_name, content, created_at').eq('parent_message_id', messageId).order('created_at', { ascending: true });
      setThreads(prev => ({ ...prev, [messageId]: data || [] }));
    } catch (e) { console.error('fetchThreads', e); }
  };

  const postThread = async (parentId, text) => {
    if (!user) { navigate('/student-login'); return; }
    try {
      await supabase.from('message_threads').insert([{ parent_message_id: parentId, user_id: user.id, user_name: name || user.email, content: text }]);
      await fetchThreads(parentId);
    } catch (e) { console.error('postThread', e); }
  };

  // fetch reactions when messages change
  useEffect(() => {
    const ids = (messages || []).map(m => m.id).filter(Boolean);
    if (ids.length) fetchReactionsFor(ids);
  }, [messages]);

  return (
    <div className="w-full max-w-3xl mx-auto mb-6">
      <div className="rounded-2xl border bg-white/80 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.04] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">Community Chat</h3>
          <p className="text-xs text-slate-500">Public room — be respectful</p>
        </div>

        
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs text-slate-500">Online: {onlineUsers.length}</div>
          <div className="text-xs text-slate-500">{typingUsers.length > 0 ? `${typingUsers.join(', ')} typing...` : ''}</div>
        </div>

        {user ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-36 px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.04] text-sm outline-none" />
            <input placeholder="Write a message..." value={newMessage} onChange={(e) => handleTypingEvent(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.04] text-sm outline-none" />
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">Send</button>
          </form>
        ) : (
          <div className="flex gap-2 items-center">
            <div className="text-sm text-slate-500">Sign in to participate in the chat.</div>
            <button onClick={() => navigate('/student-login')} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-bold">Sign in</button>
          </div>
          )}

          <div ref={containerRef} className="h-56 overflow-y-auto p-2 space-y-2 mb-3 bg-transparent">
            {messages.map((m) => (
              <div key={m.id} className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{m.user_name || "Anonymous"}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {/* reactions summary */}
                    { (reactionsMap[m.id] || []).length > 0 && (
                      <div className="flex items-center gap-1">
                        {Array.from(reactionsMap[m.id].reduce((acc, r) => acc.set(r.reaction, (acc.get(r.reaction)||0)+1), new Map()).entries()).map(([emo,count]) => (
                          <span key={emo} className="px-2 py-0.5 bg-white/80 dark:bg-white/[0.02] rounded-full text-[11px]">{emo} {count}</span>
                        ))}
                      </div>
                    )}
                    <button onClick={() => toggleReaction(m.id, '👍')} className="text-xs px-2">👍</button>
                    <button onClick={() => toggleReaction(m.id, '❤️')} className="text-xs px-2">❤️</button>
                    <button onClick={() => toggleReaction(m.id, '😂')} className="text-xs px-2">😂</button>
                    <button onClick={() => { setSelectedThread(m.id); fetchThreads(m.id); }} className="text-xs px-2">Reply</button>
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{m.content}</div>
                {m.attachment_url && (
                  <div className="mt-2">
                    <img src={m.attachment_url} alt="attachment" className="max-w-full rounded-lg" />
                  </div>
                )}
                <div className="text-[10px] text-slate-400 mt-1">{new Date(m.created_at).toLocaleString()}</div>
                {/* thread preview */}
                {selectedThread === m.id && (
                  <div className="mt-3 ml-2 p-3 rounded-lg bg-white/60 dark:bg-white/[0.02]">
                    <div className="space-y-2">
                      {(threads[m.id] || []).map(t => (
                        <div key={t.id} className="text-sm">
                          <div className="text-[11px] font-semibold">{t.user_name}</div>
                          <div className="text-[13px] text-slate-600">{t.content}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <form onSubmit={async (e) => { e.preventDefault(); const v = e.target.elements.reply?.value; if (v) { await postThread(m.id, v); e.target.reset(); } }} className="flex gap-2">
                        <input name="reply" placeholder="Write a reply..." className="flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-white/[0.03]" />
                        <button type="submit" className="px-3 py-2 rounded-lg bg-blue-600 text-white">Reply</button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default ChatRoom;
 
