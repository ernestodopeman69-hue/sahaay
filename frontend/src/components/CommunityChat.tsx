import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { 
  PaperAirplaneIcon, 
  PhotoIcon, 
  MicrophoneIcon,
  StopIcon,
  UserGroupIcon,
  LockClosedIcon,
  TrashIcon,
  UserPlusIcon,
  CheckIcon,
  UsersIcon,
  NoSymbolIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  user_id: string;
  username: string;
  message_type: 'text' | 'image' | 'audio';
  content: string;
  created_at: string;
}

interface ChatMessageProps {
  msg: Message;
  user: any;
  onAddFriend: (userId: string, username: string) => void;
  friendStatus: 'none' | 'pending' | 'accepted';
}

function ChatMessage({ msg, user, onAddFriend, friendStatus }: ChatMessageProps) {
  const isOwn = msg.user_id === user?.id;
  const isMsgAnon = msg.username === 'Anonymous';
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
    >
      <div className="flex items-center gap-2 mb-1 px-1">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isMsgAnon ? 'text-pink-400' : 'text-text-muted'}`}>
          {isMsgAnon ? '🕶 Anonymous' : msg.username}
        </span>
        {!isOwn && !isMsgAnon && user && (
          <button 
            onClick={() => {
              console.log("Friend button clicked for user:", msg.user_id);
              onAddFriend(msg.user_id, msg.username);
            }}
            disabled={friendStatus !== 'none'}
            className={`transition-all duration-300 p-1 rounded-md relative z-50 pointer-events-auto ${
              friendStatus === 'accepted' ? 'text-emerald-400 bg-emerald-500/10' :
              friendStatus === 'pending' ? 'text-blue-400 bg-blue-500/10 animate-pulse' :
              'text-text-muted hover:text-primary-light hover:bg-white/5'
            }`}
            title={friendStatus === 'accepted' ? 'Friend' : friendStatus === 'pending' ? 'Request Sent' : 'Add Friend'}
          >
            {friendStatus === 'accepted' ? <UsersIcon className="w-3 h-3" /> :
             friendStatus === 'pending' ? <CheckIcon className="w-3 h-3" /> :
             <UserPlusIcon className="w-3 h-3" />}
          </button>
        )}
        <span className="text-[10px] text-text-muted opacity-50">
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <div className={`max-w-[75%] p-3.5 rounded-2xl shadow-xl transition-all ${isOwn ? 'bg-gradient-to-br from-primary/30 to-primary/10 text-text-main rounded-tr-none border border-primary/20' : 'bg-white/5 text-text-main rounded-tl-none border border-white/10 backdrop-blur-sm'}`}>
        {!isAvailable ? (
          <div className="flex items-center gap-2 text-text-muted italic text-[11px] py-1">
            <TrashIcon className="w-4 h-4" />
            This media is no longer available
          </div>
        ) : (
          <div className="relative group">
            {msg.message_type === 'text' && <p className="text-sm leading-relaxed">{msg.content}</p>}
            {msg.message_type === 'image' && msg.content && (
              <img 
                src={msg.content} 
                alt="Community Upload" 
                className="max-w-full rounded-xl border border-white/10 shadow-2xl hover:scale-[1.02] transition-transform duration-300" 
                onError={(e: any) => {
                  console.log("BROKEN IMAGE URL:", msg.content);
                  e.target.style.display = "none";
                  setIsAvailable(false);
                }}
              />
            )}
            {msg.message_type === 'audio' && (
              <audio 
                src={msg.content} 
                controls 
                className="h-10 w-56 opacity-80 filter invert grayscale brightness-200" 
                onError={() => setIsAvailable(false)}
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

const translations: Record<string, Record<string, string>> = {
  'English': {
    title: 'Sahaay Community',
    subtitle: 'Global Support Chat',
    anonymous: 'Send Anonymous',
    anonHint: 'Your identity will be hidden',
    loginReq: 'Login required',
    placeholder: 'Share your thoughts...',
    friends: 'Friends',
    messages: 'Messages',
    global: 'Global'
  },
  'हिंदी': {
    title: 'सहाय कम्युनिटी',
    subtitle: 'ग्लोबल सपोर्ट चैट',
    anonymous: 'अनाम भेजें',
    anonHint: 'आपकी पहचान छिपी रहेगी',
    loginReq: 'लॉगिन आवश्यक',
    placeholder: 'अपने विचार साझा करें...',
    friends: 'दोस्त',
    messages: 'संदेश',
    global: 'ग्लोबल'
  },
  'ಕನ್ನಡ': {
    title: 'ಸಹಾಯ ಸಮುದಾಯ',
    subtitle: 'ಜಾಗತಿಕ ಬೆಂಬಲ ಚಾಟ್',
    anonymous: 'ಅನಾಮಧೇಯವಾಗಿ ಕಳುಹಿಸಿ',
    anonHint: 'ನಿಮ್ಮ ಗುರುತನ್ನು ಮರೆಮಾಡಲಾಗುತ್ತದೆ',
    loginReq: 'ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ',
    placeholder: 'ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ...',
    friends: 'ಗೆಳೆಯರು',
    messages: 'ಸಂದೇಶಗಳು',
    global: 'ಜಾಗತಿಕ'
  }
};

export default function CommunityChat({ language = 'English' }: { language?: string }) {
  const t = translations[language] || translations['English'];
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'messages'>('global');
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Aggressive refetch on tab switch
  useEffect(() => {
    if (activeTab === 'friends' && user) {
      fetchFriendRequests();
      fetchFriends();
    }
  }, [activeTab, user?.id]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) checkBanStatus(u.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) checkBanStatus(u.id);
    });

    fetchMessages();
    if (user) {
      fetchFriendRequests();
      fetchFriends();
    }

    // Realtime subscriptions
    const channel = supabase.channel('community_hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_messages' }, payload => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new as Message]);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests' }, payload => {
        const relevantId = (payload.new as any)?.receiver_id || (payload.old as any)?.receiver_id || (payload.new as any)?.sender_id || (payload.old as any)?.sender_id;
        if (relevantId === user?.id) {
          console.log("Real-time friend request update detected:", payload.eventType);
          fetchFriendRequests();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'private_messages' }, () => {
        // Private messages are now handled globally or silently refreshed
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [user?.id]);


  const fetchFriendRequests = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('friend_requests')
        .select('*, profiles:sender_id(username, avatar_url)')
        .eq('receiver_id', currentUser.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      console.log(`[Visibility Check] Found ${data?.length || 0} requests for ${currentUser.id}`);
      setFriendRequests(data || []);
    } catch (err) {
      console.error("Critical visibility error:", err);
    }
  };

  const fetchFriends = async () => {
    // Get all friendships where the user is involved
    const { data } = await supabase
      .from('friends')
      .select('*, friend_profile:friend_id(id, username, avatar_url)')
      .eq('user_id', user.id);
    if (data) setFriends(data);
  };

  const handleAddFriend = async (friendId: string, friendName: string) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error("No authenticated user found");
        return;
      }

      console.log(`Attempting to send friend request from ${currentUser.id} to ${friendId} (${friendName})`);

      const { error } = await supabase.from('friend_requests').insert([{
        sender_id: currentUser.id,
        receiver_id: friendId,
        status: 'pending'
      }]);

      if (error) {
        console.error("Friend request INSERT error:", error);
        if (error.code === '23505') {
          alert('Friend request already sent to this user!');
        } else {
          alert('Failed to send friend request. Please try again.');
        }
        throw error;
      }

      console.log("Friend request successfully saved to database");
      alert("Friend request sent!");
      fetchFriendRequests();
    } catch (err: any) {
      console.error("Detailed handleAddFriend error:", err);
    }
  };

  const checkBanStatus = async (userId: string) => {
    const { data } = await supabase.from('banned_users').select('*').eq('user_id', userId).single();
    if (data) setIsBanned(true);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) {
      console.log("Fetched messages:", data);
      setMessages(data);
    }
    if (error) console.error("Error fetching messages:", error);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (type: 'text' | 'image' | 'audio', content: string) => {
    console.log("Starting sendMessage process...", { type, content, user });
    if (!user) {
      console.error("Cannot send message: No authenticated user found.");
      return;
    }
    
    const displayName = isAnonymous ? 'Anonymous' : (user.email?.split('@')[0] || 'User');
    
    const newMessage = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      username: displayName,
      message_type: type,
      content,
      created_at: new Date().toISOString(),
    };

    // 1. FORCE OPTIMISTIC UPDATE (Instant visibility)
    console.log("Applying optimistic update:", newMessage);
    setMessages(prev => [...prev, newMessage]);

    // 2. INSERT INTO DATABASE
    try {
      const { data, error } = await supabase.from('community_messages').insert([{
        user_id: user.id,
        username: displayName,
        message_type: type,
        content,
      }]).select();

      if (error) {
        console.error('Supabase Insert Error:', error);
        // Remove optimistic message on error so UI reflects reality
        setMessages(prev => prev.filter(m => m.id !== newMessage.id));
        return;
      }

      if (data && data[0]) {
        console.log("Message successfully saved in DB:", data[0]);
        // 3. RECONCILE STATE: Replace temp message with real one from DB
        setMessages(prev => prev.map(m => m.id === newMessage.id ? data[0] : m));
      }
    } catch (err) {
      console.error("Unexpected error during sendMessage:", err);
      setMessages(prev => prev.filter(m => m.id !== newMessage.id));
    }
  };

  const handleSendText = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) {
      console.warn("Attempted to send empty message. Aborting.");
      return;
    }
    
    console.log("User submitted text:", trimmedText);
    setInputText(''); // Clear input immediately for better UX
    await sendMessage('text', trimmedText);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 0. AUTH CHECK
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log("UPLOAD AUTH CHECK - USER:", currentUser);
      
      if (!currentUser) {
        alert("You must be logged in to upload images.");
        return;
      }

      // 1. FILE VALIDATION
      if (!file.type.startsWith("image/")) {
        alert("Only images (PNG, JPG, WebP) are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large (max 5MB).");
        return;
      }

      console.log("Uploading file:", file.name, "Type:", file.type, "Size:", file.size);
      setIsUploading(true);

      // 2. PATH GENERATION (Sanitized)
      const fileExt = file.name.split('.').pop();
      const sanitizedName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `public/${sanitizedName}`;

      console.log("Target upload path:", filePath);

      // 3. UPLOAD TO STORAGE
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('community-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("🚨 REAL UPLOAD ERROR:", uploadError);
        alert(`Upload Error: ${uploadError.message}`);
        setIsUploading(false);
        return;
      }

      console.log("Upload successful! Response data:", uploadData);

      // 4. GET PUBLIC URL
      const { data: { publicUrl } } = supabase.storage
        .from('community-images')
        .getPublicUrl(filePath);

      console.log("GENERATED PUBLIC URL:", publicUrl);

      // 5. SAVE TO DATABASE
      if (publicUrl) {
        console.log("Saving image URL to database...");
        await sendMessage('image', publicUrl);
      } else {
        console.error("Failed to generate public URL.");
        alert("Upload succeeded but URL generation failed.");
      }

    } catch (err: any) {
      console.error("Unexpected error during image upload process:", err);
      alert(`Unexpected error: ${err.message || 'Check console'}`);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting audio recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (blob: Blob) => {
    if (!user) return;
    setIsUploading(true);
    const fileName = `${Math.random()}.webm`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('community-audio')
      .upload(filePath, blob);

    if (uploadError) {
      console.error('Error uploading audio:', uploadError);
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('community-audio')
        .getPublicUrl(filePath);
      await sendMessage('audio', publicUrl);
    }
    setIsUploading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] glass-panel overflow-hidden border border-white/5 relative">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-xl">
            <UserGroupIcon className="w-6 h-6 text-primary-light" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-main">{t.title}</h2>
            <div className="flex items-center gap-4 mt-1">
              <button 
                onClick={() => setActiveTab('global')}
                className={`text-[10px] uppercase tracking-widest transition-all ${activeTab === 'global' ? 'text-primary-light font-black underline underline-offset-4' : 'text-text-muted hover:text-white'}`}
              >
                {t.global || 'Global'}
              </button>
              <button 
                onClick={() => setActiveTab('friends')}
                className={`text-[10px] uppercase tracking-widest transition-all relative ${activeTab === 'friends' ? 'text-primary-light font-black underline underline-offset-4' : 'text-text-muted hover:text-white'}`}
              >
                {t.friends || 'Friends'}
                {friendRequests.length > 0 && <span className="absolute -top-2 -right-2 w-2 h-2 bg-pink-500 rounded-full animate-ping" />}
              </button>
              <button 
                onClick={() => setActiveTab('messages')}
                className={`text-[10px] uppercase tracking-widest transition-all ${activeTab === 'messages' ? 'text-primary-light font-black underline underline-offset-4' : 'text-text-muted hover:text-white'}`}
              >
                {t.messages || 'Messages'}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">{t.anonymous}</span>
            <button 
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-8 h-4 rounded-full relative transition-all duration-300 ${isAnonymous ? 'bg-primary' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isAnonymous ? 'left-4.5' : 'left-0.5'}`} />
            </button>
          </div>
          {!user && (
            <div className="flex items-center gap-2 text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full text-xs font-bold">
              <LockClosedIcon className="w-4 h-4" />
              {t.loginReq}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide relative">
        {activeTab === 'global' && (
          <>
            {messages.map((msg) => {
              const request = friendRequests.find(r => r.sender_id === msg.user_id || r.receiver_id === msg.user_id);
              const isFriend = friends.find(f => f.user_id === msg.user_id || f.friend_id === msg.user_id);
              const status = isFriend ? 'accepted' : (request ? 'pending' : 'none');
              
              return (
                <ChatMessage 
                  key={msg.id} 
                  msg={msg} 
                  user={user} 
                  onAddFriend={handleAddFriend}
                  friendStatus={status as any}
                />
              );
            })}
          </>
        )}

        {activeTab === 'friends' && (
          <FriendsSection 
            user={user} 
            requests={friendRequests} 
            friends={friends} 
            onRefresh={() => { fetchFriendRequests(); fetchFriends(); }}
            onOpenChat={() => { setActiveTab('messages'); /* logic to select friend */ }}
          />
        )}

        {activeTab === 'messages' && (
          <PrivateMessagesSection 
            user={user} 
            friends={friends}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-black/30 backdrop-blur-md">
        {!user ? (
          <div className="text-center py-4 text-text-muted text-sm font-bold bg-white/5 rounded-xl border border-white/10">
            {t.loginReq} ❤️
          </div>
        ) : isBanned ? (
          <div className="flex items-center justify-center gap-3 py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-black uppercase tracking-widest animate-pulse">
            <NoSymbolIcon className="w-5 h-5" />
            Banned
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-3">
            {isAnonymous && (
              <div className="text-[10px] text-pink-400/80 font-bold uppercase tracking-widest text-center animate-pulse">
                🕶 {t.anonHint}
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-all border border-white/10 group">
                <PhotoIcon className="w-6 h-6 text-text-muted group-hover:text-primary-light" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
              </label>

              <button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`p-3 rounded-xl transition-all border group ${isRecording ? 'bg-red-500/20 border-red-500/50 text-red-500 animate-pulse' : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:text-primary-light'}`}
              >
                {isRecording ? <StopIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                  placeholder={t.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-3.5 outline-none focus:border-primary/50 transition-all text-text-main placeholder:text-text-muted"
                />
                <button
                  onClick={handleSendText}
                  disabled={!inputText.trim() || isUploading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary/20 hover:bg-primary/30 text-primary-light rounded-lg disabled:opacity-30 transition-all"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary-light animate-pulse" />
      )}
    </div>
  );
}

// ─── Friends Section ────────────────────────────────────────────────────────
function FriendsSection({ user, requests, friends, onRefresh, onOpenChat }: any) {
  const handleRequest = async (requestId: string, senderId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status })
        .eq('id', requestId);
      
      if (updateError) throw updateError;
      
      if (status === 'accepted') {
        // Bidirectional friendship
        const { error: friendError } = await supabase.from('friends').insert([
          { user_id: user.id, friend_id: senderId },
          { user_id: senderId, friend_id: user.id }
        ]);
        if (friendError) throw friendError;
      }
      onRefresh();
    } catch (err) {
      console.error("Error handling friend request:", err);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Requests */}
      {requests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-500">Pending Requests ({requests.length})</h3>
          <div className="grid gap-3">
            {requests.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  {r.profiles?.avatar_url ? (
                    <img src={r.profiles.avatar_url} className="w-10 h-10 rounded-full border border-white/10" alt="Avatar" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                      {(r.profiles?.username || 'U').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-bold text-text-main block">{r.profiles?.username || 'Unknown User'}</span>
                    <span className="text-[10px] text-text-muted">Sent you a request</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleRequest(r.id, r.sender_id, 'accepted')}
                    className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/30 transition-all border border-emerald-500/20 shadow-sm"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleRequest(r.id, r.sender_id, 'rejected')}
                    className="px-4 py-1.5 bg-white/5 text-text-muted rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary-light">My Connections</h3>
        <div className="grid gap-3">
          {friends.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-text-muted text-sm italic">No friends added yet. Start connecting in Global Chat!</p>
            </div>
          ) : (
            friends.map((f: any) => {
              const friend = f.friend_profile;
              if (!friend) return null;
              return (
                <div key={f.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-primary/30 transition-all group shadow-sm">
                  <div className="flex items-center gap-4">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} className="w-12 h-12 rounded-2xl border border-white/10" alt="Avatar" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center text-primary-light border border-white/10 shadow-inner">
                        <UsersIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-text-main">{friend.username || `Caregiver #${friend.id.slice(0, 4)}`}</h4>
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Online
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onOpenChat(friend.id)}
                    className="p-3 bg-primary/10 text-primary-light rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/20 border border-primary/20 shadow-lg"
                  >
                    <EnvelopeIcon className="w-5 h-5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Private Messages Section ───────────────────────────────────────────────
function PrivateMessagesSection({ user, friends }: any) {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!selectedFriend) return;

    fetchPrivateMessages();

    const channel = supabase.channel(`private_${selectedFriend}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_messages' }, payload => {
        if ((payload.new.sender_id === user.id && payload.new.receiver_id === selectedFriend) ||
            (payload.new.sender_id === selectedFriend && payload.new.receiver_id === user.id)) {
          setMessages(prev => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedFriend]);

  const fetchPrivateMessages = async () => {
    const { data } = await supabase
      .from('private_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedFriend}),and(sender_id.eq.${selectedFriend},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedFriend) return;
    try {
      const { error } = await supabase.from('private_messages').insert([{
        sender_id: user.id,
        receiver_id: selectedFriend,
        message: inputText,
        message_type: 'text'
      }]);
      if (error) throw error;
      setInputText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Friend List Sidebar */}
      <div className="w-64 border-r border-white/5 space-y-2 pr-4 overflow-y-auto">
        {friends.map((f: any) => {
          const friend = f.friend_profile;
          if (!friend) return null;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFriend(friend.id)}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${selectedFriend === friend.id ? 'bg-primary/20 border border-primary/30 shadow-lg' : 'hover:bg-white/5'}`}
            >
              {friend.avatar_url ? (
                <img src={friend.avatar_url} className="w-8 h-8 rounded-lg flex-shrink-0 border border-white/10" alt="Avatar" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex-shrink-0 shadow-sm" />
              )}
              <span className="text-xs font-bold text-text-main truncate">{friend.username || `User #${friend.id.slice(0, 4)}`}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedFriend ? (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 pb-4">
              {messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs ${m.sender_id === user.id ? 'bg-primary text-dark-900 font-bold' : 'bg-white/10 text-text-main border border-white/10'}`}>
                    {m.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary/50"
                placeholder="Type a message..."
              />
              <button onClick={handleSend} className="p-2 bg-primary/20 text-primary-light rounded-xl">
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted space-y-4 opacity-30">
            <EnvelopeIcon className="w-16 h-16" />
            <p className="text-sm font-bold uppercase tracking-widest">Select a friend to chat</p>
          </div>
        )}
      </div>
    </div>
  );
}
