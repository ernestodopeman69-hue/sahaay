import { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import CalmHub from './components/CalmHub';
import CalmVisuals from './components/CalmVisuals';
import Games from './components/Games';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './components/Login';
import FloatingCompanion from './components/FloatingCompanion';
import CommunityChat from './components/CommunityChat';
import AdminPanel from './components/AdminPanel';
import { supabase } from './supabaseClient';
import axios from 'axios';
import { API_URL } from './config/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [language, setLanguage] = useState('English');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Initial Production Connection Test
    const testConnection = async () => {
      console.log("🚀 Sahaay App Load: Initializing connection test...");
      try {
        const res = await axios.get(`${API_URL}/health`);
        console.log("🌐 API Connection Status:", res.status === 200 ? "Online" : "Check Backend", res.data);
      } catch (err) {
        console.warn("⚠️ API Connection Failed. Is API_URL set in production?", err);
      }
    };
    testConnection();

    // Check for real session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
      } else {
        // Check for guest session if no real session
        const guestData = localStorage.getItem('sahaay_guest_session');
        if (guestData) {
          setSession(JSON.parse(guestData));
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        localStorage.removeItem('sahaay_guest_session'); // Clear guest if logged in
      } else {
        // If logged out, check if we should keep guest or clear all
        const guestData = localStorage.getItem('sahaay_guest_session');
        if (guestData) {
          setSession(JSON.parse(guestData));
        } else {
          setSession(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Fixed Left */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} language={language} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col ml-20 min-h-screen">
        {/* Global Floating Companion */}
        <FloatingCompanion onNavigate={setActiveTab} />

        {/* Top Navbar */}
        <Navbar 
          language={language} 
          setLanguage={setLanguage} 
          userEmail={session.user.email || 'Guest User'} 
        />

        {/* Dynamic Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === 'home' && <Dashboard onNavigate={setActiveTab} language={language} />}

            {activeTab === 'chat' && <ChatInterface language={language} onNavigate={setActiveTab} />}
            {activeTab === 'hub' && <CalmHub onNavigate={setActiveTab} language={language} />}
            {activeTab === 'visuals' && <CalmVisuals />}
            {activeTab === 'games' && <Games />}
            {activeTab === 'community' && <CommunityChat language={language} />}
            {activeTab === 'admin' && <AdminPanel />}
            {activeTab === 'profile' && <div className="text-center p-12">User Profile & Settings</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
