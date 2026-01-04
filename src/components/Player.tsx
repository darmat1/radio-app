import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRadioStore } from '@/store/radioStore';

export default function Player() {
  const { t } = useTranslation();
  const { currentStation, playingStationId, loadingStationId, playStation, pauseStation, audio } = useRadioStore();
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const savedVolume = localStorage.getItem('radioVolume');
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
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
    <div className="bg-gray-900 p-4 rounded-lg">
      <div className="flex items-center space-x-3 mb-3">
        {currentStation.favicon && currentStation.favicon !== 'null' ? (
          <img 
            src={currentStation.favicon} 
            alt={currentStation.name}
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              // Hide image on error to prevent broken images
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}
        
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
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
        >
          {loadingStationId === currentStation?.id ? (
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
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
      </div>

      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
          }}
        />
        <span className="text-xs text-gray-400 w-8 text-right">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}