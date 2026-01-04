import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRadioStore } from '@/store/radioStore';
import { radioAPI } from '@/lib/radioAPI';

export default function Search() {
  const { t } = useTranslation();
  const { searchQuery, selectedCountry, setSearchQuery, setSelectedCountry, searchStations, isLoading, setIsLoading, setStations, setHasError } = useRadioStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showCountries, setShowCountries] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<any[]>([]);

  useEffect(() => {
    // Load countries when component mounts
    const loadCountries = async () => {
      try {
        const countriesData = await radioAPI.getCountries(250);
        if (countriesData && countriesData.length > 0) {
          setCountries(countriesData);
        }
      } catch (error) {
        console.error('Failed to load countries:', error);
      }
    };
    loadCountries();
  }, []);



  const handleSearch = async (searchName?: string, forceCountry?: string) => {
    setIsLoading(true);
    setHasError(false);
    const queryToUse = searchName !== undefined ? searchName : localQuery;
    setSearchQuery(queryToUse);
    
    try {
      // Use search endpoint with all applicable parameters
      const results = await radioAPI.searchStationsAdvanced({
        name: queryToUse || undefined,
        country: forceCountry !== undefined ? forceCountry : (selectedCountry || undefined),
        countryExact: !!(forceCountry !== undefined ? forceCountry : selectedCountry),
        limit: 50,
        hidebroken: true,
        order: 'name'
      });
      
      // Format and update stations
      const formattedResults = results.map(station => ({
        id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
        name: station.name,
        url: station.url_resolved || station.url,
        country: station.country || '',
        tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
        favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
      }));
      
      setStations(formattedResults);
    } catch (error) {
      console.error('Search failed:', error);
      setHasError(true);
      setStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = async (country: string) => {
    setSelectedCountry(country);
    setShowCountries(false);
    setLocalQuery(''); // Clear search when country is selected
    setFilteredCountries([]); // Reset filtered countries
    setSearchQuery(''); // Clear actual search query in store
    
    // Small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Trigger search immediately with new country but no name parameter
    handleSearch('', country);
  };

  const clearFilters = () => {
    setLocalQuery('');
    setSearchQuery('');
    setSelectedCountry('');
    setFilteredCountries([]);
    // Load default stations
    searchStations();
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg space-y-3">
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('search.placeholder')}
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>
        <button
          onClick={() => handleSearch()}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => {
            setShowCountries(!showCountries);
            setFilteredCountries([]); // Reset filtered countries when opening/closing
            setLocalQuery(''); // Clear search when opening country list
          }}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
        >
          <span>{selectedCountry || t('search.byCountry')}</span>
          <svg className={`w-4 h-4 transition-transform ${showCountries ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showCountries && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg z-10 max-h-48 overflow-y-auto">
            <input
              type="text"
              placeholder={t('search.searchCountry')}
              value={localQuery}
              onChange={(e) => {
                const query = e.target.value.toLowerCase();
                setLocalQuery(query);
                const filtered = countries.filter(country => 
                  country.name.toLowerCase().includes(query)
                );
                setFilteredCountries(filtered);
              }}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              autoFocus
            />
            <button
              onClick={() => handleCountrySelect('')}
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors border-t border-gray-700"
            >
              {t('search.byCountry')}
            </button>
            {(filteredCountries.length > 0 ? filteredCountries : countries).map((country, index) => (
              <button
                key={`${country.name}-${index}`}
                onClick={() => handleCountrySelect(country.name)}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
              >
                {country.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {(searchQuery || selectedCountry) && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
        >
          {t('search.clearFilters')}
        </button>
      )}
    </div>
  );
}