'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    loadLastStation();
    searchStations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <header className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Tg</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              FM
            </span>
          </div>
        </header>

        <main className="space-y-4">
          <Player />
          <Search />
          <StationList />
        </main>
      </div>
      
      {/* Sidebar Component */}
      <Sidebar />
    </div>
  );
}
