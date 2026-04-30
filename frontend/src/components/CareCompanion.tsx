import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BeakerIcon, 
  MapIcon, 
  SunIcon, 
  SparklesIcon, 
  MusicalNoteIcon, 
  NoSymbolIcon,
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';
import axios from 'axios';

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
  "You are doing great, keep it up ❤️",
  "One small step is enough today",
  "You’ve got this",
  "Be kind to yourself today",
  "Take a deep breath. You're doing fine."
];

const translations: Record<string, Record<string, string>> = {
  'English': {
    title: 'Sahaay Care Companion',
    subtitle: 'Small steps to take care of yourself today.'
  },
  'हिंदी': {
    title: 'सहाय केयर कम्पैनियन',
    subtitle: 'आज अपना ख्याल रखने के लिए छोटे कदम।'
  },
  'ಕನ್ನಡ': {
    title: 'ಸಹಾಯ ಕೇರ್ ಕಂಪ್ಯಾನಿಯನ್',
    subtitle: 'ಇಂದು ನಿಮ್ಮ ಬಗ್ಗೆ ಕಾಳಜಿ ವಹಿಸಲು ಸಣ್ಣ ಹಂತಗಳು.'
  }
};

export default function CareCompanion({ onNavigate, language = 'English' }: { onNavigate: (tab: string) => void, language?: string }) {
  const t = translations[language] || translations['English'];
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'water', title: 'Water Reminder', description: 'Drink a glass of water (~300 ml)', icon: BeakerIcon, done: false, skipped: false },
    { id: 'walk', title: 'Walking Reminder', description: 'Take a short 300m walk', icon: MapIcon, done: false, skipped: false },
    { id: 'sunlight', title: 'Sunlight Reminder', description: 'Step outside for some sunlight', icon: SunIcon, done: false, skipped: false },
    { id: 'yoga', title: 'Yoga / Meditation', description: '2–5 minute breathing or meditation', icon: SparklesIcon, done: false, skipped: false },
    { id: 'sounds', title: 'Calm Sounds', description: 'Listen to calming audio', icon: MusicalNoteIcon, action: () => onNavigate('hub'), done: false, skipped: false },
    { id: 'phone', title: 'No Phone Break', description: 'Take a 20-minute break from your phone', icon: NoSymbolIcon, done: false, skipped: false },
  ]);

  const [notification, setNotification] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const doneCount = tasks.filter(t => t.done).length;

  // Notification logic
  useEffect(() => {
    const interval = setInterval(() => {
      const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setNotification(randomQuote);
      setTimeout(() => setNotification(null), 5000);
    }, 120000); // Every 2 minutes for demo, real would be longer

    return () => clearInterval(interval);
  }, []);

  const handleDone = async (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: true, skipped: false } : t));
    setFeedback("Great job taking care of yourself! ❤️");
    setTimeout(() => setFeedback(null), 3000);

    // Track in DB
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        userId: user?.id || 'guest',
        taskId: id,
        completed: true
      });
    } catch (e) {
      console.warn("Failed to track task completion", e);
    }
  };

  const handleSkip = async (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: false, skipped: true } : t));
    setFeedback("That’s okay, we’ll try later.");
    setTimeout(() => setFeedback(null), 3000);

    // Track in DB
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        userId: user?.id || 'guest',
        taskId: id,
        completed: false
      });
    } catch (e) {
      console.warn("Failed to track task skip", e);
    }
  };

  const currentTask = tasks.find(t => !t.done && !t.skipped);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
          <HeartIcon className="w-6 h-6 text-pink-500" />
          {t.title}
        </h2>
        <p className="text-sm text-text-muted">{t.subtitle}</p>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {currentTask ? (
            <motion.div
              key={currentTask.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-primary/10 to-transparent"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-light shadow-lg">
                <currentTask.icon className="w-8 h-8" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-text-main mb-1">{currentTask.title}</h3>
                <p className="text-text-muted mb-4">{currentTask.description}</p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <button 
                    onClick={() => handleDone(currentTask.id)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all font-bold text-sm"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Done
                  </button>
                  <button 
                    onClick={() => handleSkip(currentTask.id)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 text-text-muted border border-white/10 hover:bg-white/10 transition-all font-bold text-sm"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Skip
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel p-12 text-center"
            >
              <SparklesIcon className="w-12 h-12 text-primary-light mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-main mb-2">You've completed all tasks!</h3>
              <p className="text-text-muted">Take some time to rest. You deserve it.</p>
              <button 
                onClick={() => setTasks(tasks.map(t => ({ ...t, done: false, skipped: false })))}
                className="mt-6 text-primary-light hover:underline text-sm font-bold"
              >
                Restart Daily Guider
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Feedback */}
        {doneCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-sm font-medium text-pink-400"
          >
            You took {doneCount} small steps today ❤️
          </motion.div>
        )}

        {/* Floating Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="fixed bottom-8 right-8 z-[100] glass-panel p-4 pr-12 border-primary/30 max-w-xs shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <SparklesIcon className="w-5 h-5 text-primary-light" />
                </div>
                <p className="text-sm font-medium text-text-main leading-relaxed">{notification}</p>
              </div>
              <button onClick={() => setNotification(null)} className="absolute top-2 right-2 text-text-muted hover:text-text-main">
                <XCircleIcon className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="bg-dark-900/90 backdrop-blur-md border border-white/10 px-8 py-4 rounded-2xl shadow-2xl">
                <p className="text-lg font-bold text-text-main">{feedback}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
