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
  playStation: (station: Station, useProxy?: boolean) => void;
  pauseStation: () => void;
  searchStations: (query?: string, country?: string) => Promise<void>;
  setHasError: (hasError: boolean) => void;
  loadLastStation: () => void;
  playNext: () => void;
  playPrevious: () => void;
  syncMediaSession: () => void;
}

export const useRadioStore = create<RadioStore>((set, get) => {
  let audioInstance: Howl | null = null;
  let heartbeatAudio: HTMLAudioElement | null = null;
  let heartbeatInterval: any = null;

  // Small base64 silence MP3 (1 second)
  const SILENCE_SRC = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';

  const initHeartbeat = () => {
    if (typeof window === 'undefined') return;
    if (!heartbeatAudio) {
      heartbeatAudio = new Audio(SILENCE_SRC);
      heartbeatAudio.loop = true;
      heartbeatAudio.volume = 0.01; // Low volume just in case
    }
  };

  const startHeartbeat = () => {
    initHeartbeat();
    heartbeatAudio?.play().catch(() => { });

    // Periodic MediaSession refresh to fool OS throttling
    if (!heartbeatInterval) {
      heartbeatInterval = setInterval(() => {
        get().syncMediaSession();
      }, 10000);
    }
  };

  const stopHeartbeat = () => {
    heartbeatAudio?.pause();
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
  };

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

    playStation: async (station, useProxy = false) => {
      // Don't reset state if we are retrying with proxy to avoid UI flickering
      if (!useProxy) {
        set({ hasError: false, loadingStationId: station.id, playingStationId: null, errorStationId: null, currentStation: station });
      } else {
        console.log('Retrying with proxy for:', station.name);
      }

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
              { src: station.favicon, sizes: '128x128', type: 'image/png' },
              { src: station.favicon, sizes: '192x192', type: 'image/png' },
              { src: station.favicon, sizes: '256x256', type: 'image/png' },
              { src: station.favicon, sizes: '384x384', type: 'image/png' },
              { src: station.favicon, sizes: '512x512', type: 'image/png' }
            ] : [
              { src: '/default-radio-icon-96.png', sizes: '96x96', type: 'image/png' },
              { src: '/default-radio-icon-512.png', sizes: '512x512', type: 'image/png' }
            ]
          });

          navigator.mediaSession.playbackState = 'playing';

          navigator.mediaSession.setActionHandler('play', () => {
            console.log('MediaSession: play');
            const currentStore = get();
            if (currentStore.audio) {
              currentStore.audio.play();
              set({ playingStationId: currentStore.currentStation?.id || null });
              navigator.mediaSession.playbackState = 'playing';
            }
          });

          navigator.mediaSession.setActionHandler('pause', () => {
            console.log('MediaSession: pause');
            const currentStore = get();
            if (currentStore.audio) {
              currentStore.audio.pause();
              set({ playingStationId: null });
              navigator.mediaSession.playbackState = 'paused';
            }
          });

          // Add stop handler to help with background management
          navigator.mediaSession.setActionHandler('stop', () => {
            get().pauseStation();
          });

          navigator.mediaSession.setActionHandler('nexttrack', () => {
            console.log('MediaSession: nexttrack');
            get().playNext();
          });

          navigator.mediaSession.setActionHandler('previoustrack', () => {
            console.log('MediaSession: previoustrack');
            get().playPrevious();
          });
        }
      };

      let hasPlayed = false;

      try {
        const streamUrl = useProxy
          ? `/api/proxy?url=${encodeURIComponent(station.url)}`
          : station.url;

        const urlsToTry = [streamUrl];

        audioInstance = new Howl({
          src: urlsToTry,
          html5: true,
          preload: true,
          format: ['mp3', 'aac', 'ogg'],
          onload: () => {
            console.log('Stream loaded successfully:', station.name, useProxy ? '(via proxy)' : '(direct)');
          },
          onplay: () => {
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
              startHeartbeat();

              // Ensure playback state is updated in MediaSession
              if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
              }
            }
          },
          onloaderror: (id, error) => {
            console.log('Load error:', error, 'for station:', station.name, useProxy ? '(proxy failed)' : '(trying proxy fallback)');
            const currentStore = get();

            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'none';
            }

            if (currentStore.currentStation?.id === station.id) {
              if (!useProxy) {
                // Initial attempt failed, retry with proxy
                get().playStation(station, true);
              } else {
                set({
                  errorStationId: station.id,
                  loadingStationId: null,
                  playingStationId: null,
                  audio: audioInstance
                });
              }
            }
          },
          onplayerror: (id, error) => {
            console.log('Play error:', error, 'for station:', station.name, useProxy ? '(proxy failed)' : '(trying proxy fallback)');
            const currentStore = get();

            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'none';
            }

            if (currentStore.currentStation?.id === station.id) {
              if (!useProxy) {
                // Initial attempt failed, retry with proxy
                get().playStation(station, true);
              } else {
                set({
                  errorStationId: station.id,
                  loadingStationId: null,
                  playingStationId: null,
                  audio: audioInstance
                });
              }
            }
          },
          onend: () => {
            console.log('Stream ended for:', station.name);
          },
          onstop: () => {
            console.log('Stream stopped for:', station.name);
          }
        });

        await audioInstance.play();

      } catch (error) {
        console.log('Playback error:', error);
        if (!useProxy) {
          get().playStation(station, true);
        } else {
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
      }
    },

    pauseStation: () => {
      const currentState = get();
      if (currentState.audio) {
        currentState.audio.pause();
        set({ playingStationId: null });
        stopHeartbeat();

        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      }
    },

    syncMediaSession: () => {
      const { currentStation, playingStationId } = get();
      if (currentStation && playingStationId && 'mediaSession' in navigator) {
        // Re-apply metadata to keep it fresh in system's mind
        navigator.mediaSession.playbackState = 'playing';
        // Subtle metadata update to trigger system refresh
        if (navigator.mediaSession.metadata) {
          const backup = navigator.mediaSession.metadata;
          navigator.mediaSession.metadata = new MediaMetadata({
            title: backup.title,
            artist: backup.artist,
            album: backup.album,
            artwork: [...backup.artwork]
          });
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

    playNext: () => {
      const { stations, currentStation, playStation } = get();
      if (stations.length === 0 || !currentStation) return;

      const currentIndex = stations.findIndex(s => s.id === currentStation.id);
      if (currentIndex === -1) {
        // If current not in list (e.g. search changed), play first
        playStation(stations[0]);
        return;
      }

      const nextIndex = (currentIndex + 1) % stations.length;
      playStation(stations[nextIndex]);
    },

    playPrevious: () => {
      const { stations, currentStation, playStation } = get();
      if (stations.length === 0 || !currentStation) return;

      const currentIndex = stations.findIndex(s => s.id === currentStation.id);
      if (currentIndex === -1) {
        // If current not in list, play last
        playStation(stations[stations.length - 1]);
        return;
      }

      const prevIndex = (currentIndex - 1 + stations.length) % stations.length;
      playStation(stations[prevIndex]);
    },

    loadLastStation
  };
});