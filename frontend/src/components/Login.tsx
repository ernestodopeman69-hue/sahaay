import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion, type Variants } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import SplineScene from './SplineScene';


export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#0a0510] overflow-hidden relative">
      
      {/* ── Background Aesthetics ── */}
      <div className="absolute inset-0 bg-[#0a0510] -z-20" />
      <div className="absolute top-[20%] left-[-10%] w-[60%] h-[60%] bg-[#FF4DFF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── LEFT SIDE: Figma-Perfect Auth Form ── */}
      <div className="w-full md:w-1/2 flex items-center justify-start px-8 md:px-16 lg:px-24 py-12 z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[460px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          {/* Subtle logo / header */}
          <motion.div variants={itemVariants} className="mb-12">
            <h1 className="text-4xl font-black text-[#FF4DFF] tracking-tighter mb-2">
              Sahaay
            </h1>
            <p className="text-gray-400 font-medium text-lg">Welcome back to your safe space 💙</p>
          </motion.div>

          <form onSubmit={handleAuth} className="space-y-6">
            {/* Email Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Email Address</label>
              <div className="relative flex items-center group">
                <EnvelopeIcon className="absolute left-4 w-5 h-5 text-gray-500 group-focus-within:text-[#FF4DFF] transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 group-focus-within:border-[#FF4DFF]/40 rounded-2xl pl-12 pr-4 py-4 text-white outline-none placeholder:text-gray-600 font-medium transition-all"
                  placeholder="caregiver@example.com"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Password</label>
              <div className="relative flex items-center group">
                <LockClosedIcon className="absolute left-4 w-5 h-5 text-gray-500 group-focus-within:text-[#FF4DFF] transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 group-focus-within:border-[#FF4DFF]/40 rounded-2xl pl-12 pr-12 py-4 text-white outline-none placeholder:text-gray-600 font-medium transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold bg-red-400/10 py-3 rounded-xl text-center border border-red-400/20">
                {error}
              </motion.div>
            )}

            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-4 rounded-full transition-all duration-300 shadow-[0_10px_25px_rgba(236,72,153,0.3)] disabled:opacity-50 text-lg mt-4"
            >
              {loading ? 'Authenticating...' : (isSignUp ? 'Create My Account' : 'Sign In')}
            </motion.button>

            {!isSignUp && (
              <motion.button 
                type="button"
                onClick={() => {
                  const guestSession = {
                    user: {
                      id: `guest_${Date.now()}`,
                      email: 'Guest User',
                      isGuest: true
                    }
                  };
                  localStorage.setItem('sahaay_guest_session', JSON.stringify(guestSession));
                  window.location.reload();
                }}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white/5 border border-white/10 text-gray-300 font-bold py-3.5 rounded-full transition-all duration-300 hover:bg-white/10 hover:text-white mt-2"
              >
                Continue as Guest
              </motion.button>
            )}
          </form>

          {/* Social / Divider */}
          <motion.div variants={itemVariants} className="mt-8 flex items-center gap-4 text-gray-600">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-xs uppercase font-bold tracking-widest">or</span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center gap-4">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-semibold text-gray-400 hover:text-[#FF4DFF] transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
            {!isSignUp && (
              <button className="text-[11px] font-bold text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors">
                Forgot Password?
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* ── RIGHT SIDE: Spline 3D Earth ── */}
      <div className="hidden md:flex w-1/2 relative items-center justify-center">
        {/* Glow behind Earth */}
        <div className="absolute w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
          className="w-[600px] h-[600px] relative z-10 flex items-center justify-center overflow-hidden rounded-full"
        >
          <SplineScene 
            scene="https://my.spline.design/holographicearthwithdynamiclines-mb8PoIwwxyvSSr0fjNArQEEq/"
            className="w-full h-full scale-110"
          />
        </motion.div>

      </div>

    </div>
  );
}



