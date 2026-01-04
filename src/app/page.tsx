'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Profile from '@/components/Profile';
import Player from '@/components/Player';
import Search from '@/components/Search';
import StationList from '@/components/StationList';
import Sidebar from '@/components/Sidebar';
import { useRadioStore } from '@/store/radioStore';

export default function Home() {
  const { t } = useTranslation();
  const { searchStations, loadLastStation, currentStation } = useRadioStore();
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      // Set theme color to match app
      tg.setHeaderColor('#111827');
      tg.setBackgroundColor('#030712');
    }

    loadLastStation();
    searchStations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Fixed Search at top */}
      <div className="fixed top-0 left-0 right-0 bg-gray-950 border-b border-gray-800 z-10">
        <div className="max-w-md mx-auto p-4">
          <Search />
        </div>
      </div>

      {/* Station List takes remaining space */}
      <div className="pt-32 pb-32">
        <div className="max-w-md mx-auto px-4">
          <StationList />
        </div>
      </div>

      {/* Fixed Player at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="max-w-md mx-auto">
          <Player onSidebarToggle={() => setShowSidebar(true)} />
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
    </div>
  );
}