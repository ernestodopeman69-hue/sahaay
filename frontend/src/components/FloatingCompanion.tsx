import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BeakerIcon, 
  MapIcon, 
  SunIcon, 
  SparklesIcon, 
  MusicalNoteIcon, 
  NoSymbolIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';

interface Task {
  id: string;
  title: string;
  description: string;
  icon: any;
  action?: () => void;
  done: boolean;
  skipped: boolean;
}

const QUOTES = [
  "You're doing great, keep going 💙",
  "Small steps matter.",
  "One small step is enough today.",
  "You've got this!",
  "Take a deep breath."
];

export default function FloatingCompanion({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'water', title: 'Water Reminder', description: 'Drink a glass of water (~300 ml)', icon: BeakerIcon, done: false, skipped: false },
    { id: 'walk', title: 'Walking Reminder', description: 'Take a short 300m walk', icon: MapIcon, done: false, skipped: false },
    { id: 'sunlight', title: 'Sunlight Reminder', description: 'Step outside for some sunlight', icon: SunIcon, done: false, skipped: false },
    { id: 'yoga', title: 'Yoga / Meditation', description: '2–5 minute breathing or meditation', icon: SparklesIcon, done: false, skipped: false },
    { id: 'sounds', title: 'Calm Sounds', description: 'Listen to calming audio', icon: MusicalNoteIcon, action: () => onNavigate('hub'), done: false, skipped: false },
    { id: 'phone', title: 'No Phone Break', description: 'Take a 20-minute break from your phone', icon: NoSymbolIcon, done: false, skipped: false },
  ]);

  // Browser Notification Permission
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const sendBrowserNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: '/logo192.png' });
    }
  };

  const addNotification = (content: any) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, content }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  // Scheduler for reminders
  useEffect(() => {
    // Initial trigger for testing/visibility
    const initialTimer = setTimeout(() => {
      const pendingTasks = tasks.filter(t => !t.done && !t.skipped);
      if (pendingTasks.length > 0) {
        const task = pendingTasks[0];
        console.log("Notification Triggered:", task.description);
        addNotification(task);
        sendBrowserNotification("Care Reminder", task.description);
      }
    }, 5000);

    const timer = setInterval(() => {
      const shouldShowQuote = Math.random() > 0.7;
      if (shouldShowQuote) {
        const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        console.log("Quote Triggered:", quote);
        addNotification(quote);
        sendBrowserNotification("Sahaay Support", quote);
      } else {
        const pendingTasks = tasks.filter(t => !t.done && !t.skipped);
        if (pendingTasks.length > 0) {
          const task = pendingTasks[Math.floor(Math.random() * pendingTasks.length)];
          console.log("Notification Triggered:", task.description);
          addNotification(task);
          sendBrowserNotification("Care Reminder", task.description);
        }
      }
    }, 120000); // Every 2 mins for demo

    return () => {
      clearTimeout(initialTimer);
      clearInterval(timer);
    };
  }, [tasks]);

  // Friend Request Listener
  useEffect(() => {
    let channel: any;
    
    const setupFriendListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('friend-system-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'friend_requests',
          },
          (payload) => {
            if (payload.new.receiver_id === user.id) {
              addNotification("You have a new friend request! Check the Community Hub.");
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'friend_requests',
          },
          (payload) => {
            if (payload.new.sender_id === user.id && payload.new.status === 'accepted') {
              addNotification("Your friend request was accepted! You can now chat privately.");
            }
          }
        )
        .subscribe();
    };

    setupFriendListener();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleDone = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: true } : t));
    setNotifications(prev => prev.filter(n => typeof n.content === 'string' || n.content.id !== id));
  };

  const handleSkip = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, skipped: true } : t));
    setNotifications(prev => prev.filter(n => typeof n.content === 'string' || n.content.id !== id));
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Chat-Style Floating Notifications Area */}
      <div className="flex flex-col items-end gap-3 mb-2">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 30, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
              className="pointer-events-auto w-[320px] bg-dark-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl relative group"
            >
              {/* Chat Bubble Tail */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-dark-900/90 border-r border-b border-white/10 transform rotate-45" />
              
              <div className="flex items-start gap-3">
                {/* Logo/Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-primary-light uppercase tracking-widest">Sahay Companion</span>
                    <span className="text-[10px] text-text-muted">Just now</span>
                  </div>
                  
                  {typeof n.content === 'string' ? (
                    <p className="text-sm text-text-main font-medium leading-relaxed">{n.content}</p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-text-main font-bold leading-tight">{n.content.description}</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDone(n.content.id)}
                          className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-black py-2 rounded-lg border border-emerald-500/20 transition-all uppercase"
                        >
                          Done
                        </button>
                        <button 
                          onClick={() => handleSkip(n.content.id)}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-text-muted text-[10px] font-black py-2 rounded-lg border border-white/10 transition-all uppercase"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
                className="absolute top-2 right-2 p-1 text-text-muted hover:text-text-main opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Widget Button */}
      <div className="relative pointer-events-auto">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-20 right-0 w-80 bg-dark-900/95 backdrop-blur-2xl p-6 border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-main">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-xl border border-white/10">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-text-main tracking-tight text-lg">Care Companion</h3>
                    <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold">Always by your side</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto scrollbar-hide pr-1">
                  {tasks.filter(t => !t.done).map(task => (
                    <div 
                      key={task.id}
                      className={`p-4 rounded-[1.5rem] border transition-all duration-300 ${task.skipped ? 'bg-white/5 border-white/5 opacity-60' : 'bg-white/5 border-white/10 hover:border-primary/40 group/item'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${task.skipped ? 'bg-white/5' : 'bg-primary/10 text-primary-light group-hover/item:bg-primary/20'}`}>
                          <task.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${task.skipped ? 'text-text-muted line-through' : 'text-text-main'}`}>{task.title}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{task.description}</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleDone(task.id)} className="p-2 hover:bg-emerald-500/20 rounded-xl text-emerald-500 transition-colors">
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          {!task.skipped && (
                            <button onClick={() => handleSkip(task.id)} className="p-2 hover:bg-red-500/20 rounded-xl text-red-500 transition-colors">
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {tasks.every(t => t.done) && (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <SparklesIcon className="w-8 h-8 text-primary-light" />
                      </div>
                      <p className="text-sm text-text-main font-black">You're all caught up!</p>
                      <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">Great job taking care of yourself</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(102,252,241,0.3)] relative group overflow-hidden border border-white/10
            ${isOpen ? 'bg-white text-primary' : 'bg-gradient-to-br from-primary to-pink-500 text-white'}`}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {isOpen ? <XMarkIcon className="w-8 h-8" /> : <SparklesIcon className="w-8 h-8" />}
          
          {!isOpen && (
            <>
              <div className="absolute inset-0 rounded-full animate-ping bg-primary/30 pointer-events-none" />
              {notifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-dark-900 flex items-center justify-center text-[10px] font-black text-white">
                  {notifications.length}
                </div>
              )}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
