import { create } from 'zustand';
import { radioAPI, Station } from '@/lib/radioAPI';
import { Howl } from 'howler';

interface RadioStore {
  stations: Station[];
  currentStation: Station | null;
  isLoading: boolean;
  isAudioLoading: boolean;
  loadingStationId: string | null;
  playingStationId: string | null;
  errorStationId: string | null;
  searchQuery: string;
  selectedCountry: string;
  audio: Howl | null;
  hasError: boolean;
  
  setStations: (stations: Station[]) => void;
  setCurrentStation: (station: Station | null) => void;
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
  let audioInstance: Howl | null = null;

  const loadLastStation = () => {
    const lastStation = localStorage.getItem('lastPlayedStation');
    if (lastStation) {
      try {
        const station = JSON.parse(lastStation);
        set({ currentStation: station });
      } catch (error) {
      }
    }
  };

  return {
    stations: [],
    currentStation: null,
    isLoading: false,
    isAudioLoading: false,
    loadingStationId: null,
    playingStationId: null,
    errorStationId: null,
    searchQuery: '',
    selectedCountry: '',
    audio: null,
    hasError: false,

    setStations: (stations) => set({ stations }),
    setCurrentStation: (station) => set({ currentStation: station }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setIsAudioLoading: (loading) => set({ isAudioLoading: loading }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedCountry: (country) => set({ selectedCountry: country }),
    setHasError: (hasError) => set({ hasError }),

    playStation: async (station) => {
      set({ hasError: false, loadingStationId: station.id, playingStationId: null, errorStationId: null, currentStation: station });
      
      if (audioInstance) {
        audioInstance.unload();
        audioInstance = null;
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      const setupMediaSession = (station: Station) => {
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: station.name,
            artist: station.country || 'Online Stream',
            album: 'Radio App',
            artwork: station.favicon && station.favicon !== 'null' ? [
              { src: station.favicon, sizes: '96x96', type: 'image/png' },
              { src: station.favicon, sizes: '512x512', type: 'image/png' }
            ] : [
              { src: '/default-radio-icon-96.png', sizes: '96x96', type: 'image/png' },
              { src: '/default-radio-icon-512.png', sizes: '512x512', type: 'image/png' }
            ]
          });

          navigator.mediaSession.setActionHandler('play', () => {
            const currentStore = get();
            if (currentStore.currentStation) {
              audioInstance?.play();
              set({ playingStationId: currentStore.currentStation.id });
            }
          });
          
          navigator.mediaSession.setActionHandler('pause', () => {
            audioInstance?.pause();
            set({ playingStationId: null });
          });
        }
      };

      let hasLoaded = false;
      let hasPlayed = false;
      let loadTimeoutId: ReturnType<typeof setTimeout> | null = null;

      // Set a timeout to handle slow connections
      const clearTimeouts = () => {
        if (loadTimeoutId) {
          clearTimeout(loadTimeoutId);
          loadTimeoutId = null;
        }
      };

      const handleLoadError = () => {
        // Only show error if not already loaded or playing
        if (!hasLoaded && !hasPlayed) {
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
      };

      try {
        audioInstance = new Howl({
          src: [station.url],
          html5: true,
          preload: true,
          format: ['mp3', 'aac', 'ogg'],
          onload: () => {
            clearTimeouts();
            hasLoaded = true;
            console.log('Stream loaded successfully:', station.name);
          },
          onplay: () => {
            clearTimeouts();
            hasPlayed = true;
            const currentStore = get();
            if (currentStore.currentStation?.id === station.id) {
              set({ 
                playingStationId: station.id,
                loadingStationId: null,
                errorStationId: null,
                currentStation: station,
                audio: audioInstance
              });
              setupMediaSession(station);
              localStorage.setItem('lastPlayedStation', JSON.stringify(station));
            }
          },
          onloaderror: (id, error) => {
            console.log('Load error:', error, 'for station:', station.name);
            // Wait a moment before showing error to allow for slow connections
            loadTimeoutId = setTimeout(() => {
              handleLoadError();
            }, 3000);
          },
          onplayerror: (id, error) => {
            console.log('Play error:', error, 'for station:', station.name);
            // Wait a moment before showing error to allow for slow connections
            loadTimeoutId = setTimeout(() => {
              handleLoadError();
            }, 3000);
          },
          onend: () => {
            // Handle stream ending (reconnect logic can be added here)
            console.log('Stream ended for:', station.name);
          },
          onstop: () => {
            console.log('Stream stopped for:', station.name);
          }
        });

        // Start playing
        await audioInstance.play();
        
      } catch (error) {
        clearTimeouts();
        console.log('Playback error:', error);
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
        
        if ('mediaSession' in navigator) {
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
        }
      }
    },

    searchStations: async (query?: string, country?: string) => {
      set({ isLoading: true, hasError: false });
      
      try {
        let results;
        
        if (!query && country) {
          results = await radioAPI.searchByCountryExact(country, 30);
        } else if (query && !country) {
          results = await radioAPI.searchByName(query, undefined, 30);
        } else {
          results = await radioAPI.searchStationsAdvanced({
            name: query || undefined,
            country: country || undefined,
            countryExact: !!country,
            limit: 30,
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