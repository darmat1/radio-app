import { create } from 'zustand';
import { radioAPI, Station } from '@/lib/radioAPI';

// Helper function to create proxy URL
const getProxyUrl = (originalUrl: string): string => {
  try {
    const url = new URL(originalUrl);
    const pathWithoutProtocol = url.toString().replace(/^https?:\/\//, '');
    return `/api/proxy/${pathWithoutProtocol}`;
  } catch (error) {
    console.error('Invalid URL for proxy:', originalUrl, error);
    return originalUrl;
  }
};

interface RadioStore {
  stations: Station[];
  currentStation: Station | null;
  isLoading: boolean;
  loadingStationId: string | null;
  playingStationId: string | null;
  errorStationId: string | null;
  searchQuery: string;
  selectedCountry: string;
  audio: HTMLAudioElement | null;
  hasError: boolean;
  
  setStations: (stations: Station[]) => void;
  setCurrentStation: (station: Station | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsAudioLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCountry: (country: string) => void;
  playStation: (station: Station) => void;
  pauseStation: () => void;
  searchStations: (query?: string, country?: string) => Promise<void>;
  setHasError: (hasError: boolean) => void;
  loadLastStation: () => void;
}

export const useRadioStore = create<RadioStore>((set, get) => {
  let audioInstance: HTMLAudioElement | null = null;

  const loadLastStation = () => {
    const lastStation = localStorage.getItem('lastPlayedStation');
    if (lastStation) {
      try {
        const station = JSON.parse(lastStation);
        set({ currentStation: station });
      } catch (error) {
        // Failed to parse station
      }
    }
  };

  return {
    stations: [],
    currentStation: null,
    isLoading: false,
    loadingStationId: null,
    playingStationId: null,
    errorStationId: null,
    searchQuery: '',
    selectedCountry: '',
    audio: null,
    hasError: false,

    setStations: (stations) => set({ stations }),
    setCurrentStation: (station) => set({ currentStation: station }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setIsAudioLoading: (loading) => set({ isAudioLoading: loading }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedCountry: (country) => set({ selectedCountry: country }),
    setHasError: (hasError) => set({ hasError }),

    playStation: async (station) => {
      set({ hasError: false, loadingStationId: station.id, playingStationId: null, errorStationId: null, currentStation: station });
      
      if (audioInstance) {
        try {
          audioInstance.pause();
          audioInstance.src = '';
          audioInstance.load();
        } catch (e) {
          // Ignore errors during cleanup
        }
        audioInstance.removeEventListener('error', () => {});
        audioInstance.removeEventListener('loadstart', () => {});
        audioInstance.removeEventListener('loadedmetadata', () => {});
        audioInstance.removeEventListener('canplay', () => {});
        audioInstance.removeEventListener('playing', () => {});
        audioInstance = null;
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      // Try direct URL first, only use proxy for CORS issues
      audioInstance = new Audio();
      audioInstance.preload = 'metadata';
      audioInstance.crossOrigin = null;
      audioInstance.src = station.url;
      
      const proxyUrl = getProxyUrl(station.url);

      audioInstance.addEventListener('loadstart', () => {
        const currentStore = get();
        if (currentStore.currentStation?.id === station.id) {
          set({ loadingStationId: null });
        }
      });

      audioInstance.addEventListener('error', (e) => {
        const currentStore = get();
        if (currentStore.currentStation?.id === station.id) {
          // Only try proxy if direct URL fails due to CORS
          if (!audioInstance.src?.includes('proxy')) {
            console.log('Direct URL failed due to CORS, trying proxy...');
            audioInstance.src = proxyUrl;
            audioInstance.crossOrigin = 'anonymous';
            audioInstance.load();
            audioInstance.play().then(() => {
              const currentStore2 = get();
              if (currentStore2.currentStation?.id === station.id) {
                set({ 
                  playingStationId: station.id,
                  loadingStationId: null,
                  errorStationId: null,
                  currentStation: station,
                  audio: audioInstance
                });
              }
            }).catch(fallbackError => {
              const currentStore3 = get();
              if (currentStore3.currentStation?.id === station.id) {
                set({ 
                  errorStationId: station.id,
                  loadingStationId: null,
                  playingStationId: null
                });
              }
            });
          } else {
            set({ 
              errorStationId: station.id,
              loadingStationId: null,
              playingStationId: null,
              audio: audioInstance
            });
          }
        }
      });

      try {
        audioInstance.load();
        await audioInstance.play();
        
        set({ 
          playingStationId: station.id,
          loadingStationId: null,
          errorStationId: null,
          currentStation: station,
          audio: audioInstance
        });
        
        localStorage.setItem('lastPlayedStation', JSON.stringify(station));
      } catch (error) {
        const currentStore = get();
        if (currentStore.currentStation?.id === station.id) {
          set({ 
            errorStationId: station.id,
            loadingStationId: null,
            playingStationId: null,
            audio: audioInstance
          });
        }
      }
    },

    pauseStation: () => {
      const currentState = get();
      if (currentState.audio && currentState.playingStationId) {
        currentState.audio.pause();
        set({ playingStationId: null });
      }
    },

    searchStations: async (query?: string, country?: string) => {
      set({ isLoading: true, hasError: false });
      
      try {
        let results;
        
        if (!query && country) {
          results = await radioAPI.searchByCountryExact(country, 30); // Reduced from 50
        } else if (query && !country) {
          results = await radioAPI.searchByName(query, undefined, 30); // Reduced from 50
        } else {
          results = await radioAPI.searchStationsAdvanced({
            name: query || undefined,
            country: country || undefined,
            countryExact: !!country,
            limit: 30, // Reduced from 50
            hidebroken: true,
            order: 'name'
          });
        }
        
        const formattedResults = results.map(station => ({
          id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
          name: station.name,
          url: station.url_resolved || station.url,
          country: station.country || '',
          tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
          favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
        }));
        
        set({ stations: formattedResults });
      } catch (error) {
        set({ hasError: true, stations: [] });
      } finally {
        set({ isLoading: false });
      }
    },

    loadLastStation
  };
});