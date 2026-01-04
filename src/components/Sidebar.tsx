'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRadioStore } from '@/store/radioStore';
import { radioAPI } from '@/lib/radioAPI';
import LanguageSelector from '@/components/LanguageSelector';

export default function Sidebar() {
  const { t } = useTranslation();
  const { 
    searchStations, 
    setIsLoading, 
    searchQuery, 
    setSearchQuery,
    selectedCountry,
    setSelectedCountry 
  } = useRadioStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  
  // Form state for advanced filters
  const [filters, setFilters] = useState({
    country: '',
    language: '',
    tag: '',
    codec: '',
    name: '',
    sortBy: 'topvote',
    limit: '50'
  });

  useEffect(() => {
    console.log('Sidebar useEffect triggered, isOpen:', isOpen);
    if (isOpen) {
      console.log('Loading filter data...');
      loadFilterData();
    }
  }, [isOpen]);

  const loadFilterData = async () => {
    try {
      const languagesData = await radioAPI.getLanguages(100);
      if (languagesData && languagesData.length > 0) {
        setLanguages(languagesData);
      }
      
      const tagsData = await radioAPI.getTags(100);
      if (tagsData && tagsData.length > 0) {
        setTags(tagsData);
      }
    } catch (error) {
      console.error('Failed to load filter data:', error);
      setLanguages([]);
      setTags([]);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const results = await radioAPI.searchStationsAdvanced({
        name: filters.name || undefined,
        language: filters.language || undefined,
        tag: filters.tag || undefined,
        codec: filters.codec || undefined,
        limit: parseInt(filters.limit) || 50
      });
      
      // Update store with results
      const formattedResults = results.map(station => ({
        id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
        name: station.name,
        url: station.url_resolved || station.url,
        country: station.country || '',
        tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
        favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
      }));
      
      useRadioStore.setState({
        stations: formattedResults,
        isLoading: false,
        searchQuery: filters.name || '',
        selectedCountry: '',
        hasError: false
      });
      
      // Close sidebar after search
      setIsOpen(false);
    } catch (error) {
      console.error('Search failed:', error);
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      country: '',
      language: '',
      tag: '',
      codec: '',
      name: '',
      sortBy: 'topvote',
      limit: '50'
    });
  };

  const loadStationsByType = async (type: string) => {
    setIsLoading(true);
    try {
      let results;
      switch (type) {
        case 'topvote':
          results = await radioAPI.getTopStations(100);
          break;
        case 'lastclick':
          results = await radioAPI.getRecentlyClicked(100);
          break;
        case 'lastchange':
          results = await radioAPI.getRecentlyChanged(100);
          break;
        case 'random':
          results = await radioAPI.getRandomStations(100);
          break;
        default:
          results = await radioAPI.getTopStations(100);
      }
      
      const formattedResults = results.map(station => ({
        id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
        name: station.name,
        url: station.url_resolved || station.url,
        country: station.country || '',
        tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
        favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
      }));
      
      useRadioStore.setState({
        stations: formattedResults,
        isLoading: false,
        searchQuery: '',
        selectedCountry: '',
        hasError: false
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to load stations:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-gray-900 transform transition-transform z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{t('sidebar.title')}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="p-4 border-b border-gray-800">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('sidebar.language')}
            </label>
            <LanguageSelector />
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-800">
            <h4 className="text-sm font-medium text-gray-300 mb-3">{t('sidebar.quickActions')}</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => loadStationsByType('topvote')}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                {t('sidebar.topVoted')}
              </button>
              <button
                onClick={() => loadStationsByType('lastclick')}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
              >
                {t('sidebar.recentlyClicked')}
              </button>
              <button
                onClick={() => loadStationsByType('lastchange')}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
              >
                {t('sidebar.recentlyChanged')}
              </button>
              <button
                onClick={() => loadStationsByType('random')}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors"
              >
                {t('sidebar.random')}
              </button>
            </div>
          </div>

          {/* Advanced Search */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-300">{t('sidebar.advancedSearch')}</h4>
              <button
                onClick={() => {
                setFilters({
                  country: '',
                  language: '',
                  tag: '',
                  codec: '',
                  name: '',
                  sortBy: 'topvote',
                  limit: '50'
                });
                setSearchQuery('');
                setSelectedCountry('');
              }}
                className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
              >
                {t('sidebar.clearFilters')}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                {t('sidebar.limit')}
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({...filters, limit: e.target.value, country: filters.country, language: filters.language, tag: filters.tag, codec: filters.codec, name: filters.name, sortBy: filters.sortBy})}
                className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded border border-gray-700 focus:border-blue-500 focus:outline-none mb-3"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                {t('sidebar.stationName')}
              </label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => setFilters({...filters, name: e.target.value, limit: filters.limit})}
                className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                placeholder={t('sidebar.namePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                {t('sidebar.language')}
              </label>
              <select
                value={filters.language}
                onChange={(e) => setFilters({...filters, language: e.target.value, limit: filters.limit})}
                className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="">{t('sidebar.selectLanguage')}</option>
                {languages.map((lang, index) => (
                  <option key={`${lang.name}-${index}`} value={lang.name}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                {t('sidebar.tag')}
              </label>
              <select
                value={filters.tag}
                onChange={(e) => setFilters({...filters, tag: e.target.value, limit: filters.limit})}
                className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="">{t('sidebar.selectTag')}</option>
                {tags.map((tag, index) => (
                  <option key={`${tag.name}-${index}`} value={tag.name}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
            >
              {t('sidebar.search')}
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-l-lg shadow-lg flex items-center justify-center z-30 transition-all hover:pr-2 group"
      >
        <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}