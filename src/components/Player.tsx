import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRadioStore } from '@/store/radioStore';
import StationFavicon from './StationFavicon';

export default function Player({ onSidebarToggle }: { onSidebarToggle: () => void }) {
  const { t } = useTranslation();
  const { currentStation, playingStationId, loadingStationId, errorStationId, playStation, pauseStation, audio } = useRadioStore();
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const savedVolume = localStorage.getItem('radioVolume');
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);

  useEffect(() => {
    if (audio) {
      audio.volume(volume);
      localStorage.setItem('radioVolume', volume.toString());
    }
  }, [audio, volume]);

  if (!currentStation) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg text-center">
        <div className="w-12 h-12 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-2">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm">{t('player.selectStation')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <StationFavicon
            station={currentStation}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm truncate">{currentStation.name}</h3>
            <p className="text-gray-400 text-xs">{currentStation.country}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {currentStation.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="px-1 py-0.5 bg-gray-800 text-gray-300 text-xs rounded">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              if (playingStationId === currentStation?.id) {
                pauseStation();
              } else {
                playStation(currentStation!);
              }
            }}
            disabled={loadingStationId === currentStation?.id}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-full flex items-center justify-center transition-colors flex-shrink-0 relative overflow-hidden"
          >
            {loadingStationId === currentStation?.id ? (
              <div className="relative">
                <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : errorStationId === currentStation?.id ? (
              <div className="relative">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-red-400 whitespace-nowrap">
                  {t('player.error')}
                </span>
              </div>
            ) : playingStationId === currentStation?.id ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>

          <button
            onClick={onSidebarToggle}
            className="w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}