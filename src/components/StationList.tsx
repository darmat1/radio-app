import { useTranslation } from 'react-i18next';
import { useRadioStore } from '@/store/radioStore';

export default function StationList() {
  const { t } = useTranslation();
  const { stations, currentStation, isLoading, hasError, loadingStationId, playingStationId, errorStationId, playStation, searchQuery, selectedCountry } = useRadioStore();
  


  // Only show loading skeleton when stations are being loaded, not when audio is loading
  if (isLoading && stations.length === 0) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg animate-pulse">
              <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Only show error when there are no stations and we have a loading error
  if (hasError && stations.length === 0) {
    return (
      <div className="bg-gray-900 p-6 rounded-lg text-center">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-400">{t('stations.error')}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          {t('stations.retry')}
        </button>
      </div>
    );
  }

  if (stations.length === 0) {
    const hasActiveFilters = searchQuery || selectedCountry;
    return (
      <div className="bg-gray-900 p-6 rounded-lg text-center">
        <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <p className="text-gray-400">{t('stations.noResults')}</p>
        <p className="text-gray-500 text-sm mt-1">
          {hasActiveFilters ? t('stations.tryChangeFilters') : t('stations.tryDifferentSearch')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <h2 className="text-white font-medium mb-3">{t('stations.title')} ({stations.length})</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {stations.map((station, index) => (
          <button
            key={`${station.id}-${index}`}
            onClick={() => playStation(station)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
              currentStation?.id === station.id
                ? 'bg-blue-600' 
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            {station.favicon && station.favicon !== 'null' ? (
              <img 
                src={station.favicon} 
                alt={station.name}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  // Hide image on error to prevent broken images
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium truncate ${
                currentStation?.id === station.id ? 'text-white' : 'text-gray-200'
              }`}>
                {station.name}
              </h3>
              <p className={`text-sm ${
                currentStation?.id === station.id ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {station.country}
              </p>
            </div>
            
            <div className="flex-shrink-0">
              {(() => {
                // Check if this is the current station being processed
                if (currentStation?.id !== station.id) return null;
                
                if (loadingStationId === station.id) {
                  return (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-yellow-300">{t('stations.loading')}</span>
                    </div>
                  );
                }
                
                if (playingStationId === station.id) {
                  return (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-xs text-white">{t('stations.nowPlaying')}</span>
                    </div>
                  );
                }
                
                if (errorStationId === station.id) {
                  return (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-red-300">{t('stations.error')}</span>
                    </div>
                  );
                }
                
                return null;
              })()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}