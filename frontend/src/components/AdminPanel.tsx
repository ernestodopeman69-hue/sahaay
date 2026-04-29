import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { 
  TrashIcon, 
  NoSymbolIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  user_id: string;
  username: string;
  message_type: 'text' | 'image' | 'audio';
  content: string;
  created_at: string;
}

export default function AdminPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bannedIds, setBannedIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ADMIN_EMAIL = 'admin@sahaay.com'; // Admin Whitelist

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setIsAdmin(u?.email === ADMIN_EMAIL);
    });

    fetchMessages();
    fetchBans();

    const channel = supabase
      .channel('admin_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_messages' }, payload => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new as Message]);
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banned_users' }, () => {
        fetchBans();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase.from('community_messages').select('*').order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const fetchBans = async () => {
    const { data } = await supabase.from('banned_users').select('user_id');
    if (data) setBannedIds(data.map(b => b.user_id));
  };

  const deleteMessage = async (msg: Message) => {
    if (!isAdmin) return;

    // 1. Delete Media from Storage if exists
    if (msg.message_type === 'image' || msg.message_type === 'audio') {
      const bucket = msg.message_type === 'image' ? 'community-images' : 'community-audio';
      const path = msg.content.split('/').pop(); // Basic extraction
      if (path) {
        await supabase.storage.from(bucket).remove([path]);
      }
    }

    // 2. Delete from DB
    await supabase.from('community_messages').delete().eq('id', msg.id);
  };

  const banUser = async (userId: string) => {
    if (!isAdmin || bannedIds.includes(userId)) return;
    await supabase.from('banned_users').insert([{ user_id: userId }]);
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] glass-panel">
        <ExclamationTriangleIcon className="w-16 h-16 text-pink-500 mb-4 animate-pulse" />
        <h2 className="text-2xl font-black text-text-main">Access Denied</h2>
        <p className="text-text-muted mt-2">Only administrators can access this moderation panel.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] glass-panel overflow-hidden border border-red-500/20 relative">
      {/* Admin Header */}
      <div className="p-4 border-b border-red-500/20 bg-red-500/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-xl">
            <ShieldCheckIcon className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main">Community Moderation</h2>
            <p className="text-[10px] text-red-400 uppercase tracking-[0.2em] font-black">Admin Access Only</p>
          </div>
        </div>
        <div className="text-xs text-text-muted font-bold">
          Logged in as: <span className="text-red-400">{user?.email}</span>
        </div>
      </div>

      {/* Moderation Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.map((msg) => {
          const isBanned = bannedIds.includes(msg.user_id);
          return (
            <motion.div
              key={msg.id}
              layout
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-black uppercase tracking-wider ${isBanned ? 'text-red-500 line-through' : 'text-primary-light'}`}>
                    {msg.username} {isBanned && '(BANNED)'}
                  </span>
                  <span className="text-[10px] text-text-muted opacity-50">{msg.user_id}</span>
                </div>
                
                <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                  {msg.message_type === 'text' && <p className="text-sm text-text-main">{msg.content}</p>}
                  {msg.message_type === 'image' && (
                    <img src={msg.content} alt="Evidence" className="max-w-[200px] rounded-lg border border-white/10" />
                  )}
                  {msg.message_type === 'audio' && (
                    <audio src={msg.content} controls className="h-8 w-48 opacity-60" />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => deleteMessage(msg)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-500 rounded-lg border border-red-500/20 transition-all title='Delete Message'"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => banUser(msg.user_id)}
                  disabled={isBanned}
                  className={`p-2 rounded-lg border transition-all ${isBanned ? 'bg-gray-500/10 text-gray-500 border-gray-500/20' : 'bg-orange-500/10 hover:bg-orange-500/30 text-orange-500 border-orange-500/20'}`}
                  title="Ban User"
                >
                  <NoSymbolIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
