const API_BASE_URL = 'https://de1.api.radio-browser.info/';

export interface Station {
  id: string;
  name: string;
  url: string;
  url_resolved?: string;
  country: string;
  tags: string[];
  favicon?: string;
  codec?: string;
  bitrate?: number;
  homepage?: string;
}

class RadioAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async getCountries(limit: number = 250): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/countries`);
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('order', 'name');
      url.searchParams.set('hidebroken', 'true');
      
      console.log('Fetching countries from:', url.toString());
      
      const response = await fetch(url.toString());
      console.log('Countries response status:', response.status, response.ok);
      
      if (!response.ok) {
        console.warn(`HTTP error! status: ${response.status} for countries`);
        return [];
      }
      
      const data = await response.json();
      console.log('Countries data received:', Array.isArray(data) ? `${data.length} countries` : 'Invalid data');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('Sample countries:', data.slice(0, 3).map(c => c.name));
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      return [];
    }
  }

  async getLanguages(limit: number = 100): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/languages`);
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('order', 'name');
      url.searchParams.set('hidebroken', 'true');
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.warn(`HTTP error! status: ${response.status} for languages`);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      return [];
    }
  }

  async getTags(limit: number = 100): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/tags`);
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('order', 'stationcount');
      url.searchParams.set('reverse', 'true');
      url.searchParams.set('hidebroken', 'true');
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.warn(`HTTP error! status: ${response.status} for tags`);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      return [];
    }
  }

  async searchByName(name: string, country?: string, limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/byname/${encodeURIComponent(name)}`);
      if (limit) {
        url.searchParams.set('limit', limit.toString());
      }
      if (country) {
        url.searchParams.set('country', country);
      }
      
      console.log('Search by name URL:', url.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.warn(`HTTP error! status: ${response.status} for ${url.toString()}`);
        return [];
      }
      const data = await response.json();
      console.log('Search by country results:', data.length, 'stations found');
      // Filter out stations with names starting with dot
      return data.filter(station => station.name && !station.name.startsWith('.'));
    } catch (error) {
      console.error('Failed to search stations by country:', error);
      return [];
    }
  }

  async searchByTagExact(tag: string, country?: string, limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/bytagexact/${encodeURIComponent(tag)}`);
      if (limit) {
        url.searchParams.set('limit', limit.toString());
      }
      if (country) {
        url.searchParams.set('country', country);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.warn(`HTTP error! status: ${response.status} for ${url.toString()}`);
        return [];
      }
      const data = await response.json();
      console.log('Search results:', data.length, 'stations found');
      // Filter out stations with names starting with dot
      return data.filter(station => station.name && !station.name.startsWith('.'));
    } catch (error) {
      console.error('Failed to search stations by tag:', error);
      return [];
    }
  }

  async searchByLanguageExact(language: string, country?: string, limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/bylanguageexact/${encodeURIComponent(language)}`);
      if (limit) {
        url.searchParams.set('limit', limit.toString());
      }
      if (country) {
        url.searchParams.set('country', country);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.warn(`HTTP error! status: ${response.status} for ${url.toString()}`);
        return [];
      }
      const data = await response.json();
      console.log('Language search results:', data.length, 'stations found');
      return data;
    } catch (error) {
      console.error('Failed to search stations by language:', error);
      return [];
    }
  }

  async searchByCodecExact(codec: string, country?: string, limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/bycodecexact/${encodeURIComponent(codec)}`);
      if (limit) {
        url.searchParams.set('limit', limit.toString());
      }
      if (country) {
        url.searchParams.set('country', country);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.warn(`HTTP error! status: ${response.status} for ${url.toString()}`);
        return [];
      }
      const data = await response.json();
      console.log('Advanced search results:', data.length, 'stations found');
      // Filter out stations with names starting with dot
      return data.filter(station => station.name && !station.name.startsWith('.'));
    } catch (error) {
      console.error('Failed to search stations by codec:', error);
      return [];
    }
  }

  async searchStationsAdvanced(params: {
    name?: string;
    nameExact?: boolean;
    country?: string;
    countryExact?: boolean;
    countrycode?: string;
    state?: string;
    stateExact?: boolean;
    language?: string;
    languageExact?: boolean;
    tag?: string;
    tagExact?: boolean;
    tagList?: string[];
    codec?: string;
    bitrateMin?: number;
    bitrateMax?: number;
    has_geo_info?: 'both' | boolean;
    has_extended_info?: 'both' | boolean;
    is_https?: 'both' | boolean;
    geo_lat?: number;
    geo_long?: number;
    geo_distance?: number;
    order?: 'name' | 'url' | 'homepage' | 'favicon' | 'tags' | 'country' | 'state' | 'language' | 'votes' | 'codec' | 'bitrate' | 'lastcheckok' | 'lastchecktime' | 'clicktimestamp' | 'clickcount' | 'clicktrend' | 'changetimestamp' | 'random';
    reverse?: boolean;
    offset?: number;
    limit?: number;
    hidebroken?: boolean;
  }): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/search`);
      
      const {
        name,
        nameExact = false,
        country,
        countryExact = false,
        countrycode,
        state,
        stateExact = false,
        language,
        languageExact = false,
        tag,
        tagExact = false,
        tagList,
        codec,
        bitrateMin,
        bitrateMax,
        has_geo_info = 'both',
        has_extended_info = 'both',
        is_https = 'both',
        geo_lat,
        geo_long,
        geo_distance,
        order = 'name',
        reverse = false,
        offset = 0,
        limit = 50,
        hidebroken = true
      } = params;

      // Add parameters to URL only if they have values
      if (name) url.searchParams.set('name', name);
      if (nameExact) url.searchParams.set('nameExact', 'true');
      if (country) url.searchParams.set('country', country);
      if (countryExact) url.searchParams.set('countryExact', 'true');
      if (countrycode) url.searchParams.set('countrycode', countrycode);
      if (state) url.searchParams.set('state', state);
      if (stateExact) url.searchParams.set('stateExact', 'true');
      if (language) url.searchParams.set('language', language);
      if (languageExact) url.searchParams.set('languageExact', 'true');
      if (tag) url.searchParams.set('tag', tag);
      if (tagExact) url.searchParams.set('tagExact', 'true');
      if (tagList && tagList.length > 0) {
        url.searchParams.set('tagList', tagList.join(','));
      }
      if (codec) url.searchParams.set('codec', codec);
      if (bitrateMin !== undefined) url.searchParams.set('bitrateMin', bitrateMin.toString());
      if (bitrateMax !== undefined) url.searchParams.set('bitrateMax', bitrateMax.toString());
      if (has_geo_info !== 'both') url.searchParams.set('has_geo_info', has_geo_info.toString());
      if (has_extended_info !== 'both') url.searchParams.set('has_extended_info', has_extended_info.toString());
      if (is_https !== 'both') url.searchParams.set('is_https', is_https.toString());
      if (geo_lat !== undefined) url.searchParams.set('geo_lat', geo_lat.toString());
      if (geo_long !== undefined) url.searchParams.set('geo_long', geo_long.toString());
      if (geo_distance !== undefined) url.searchParams.set('geo_distance', geo_distance.toString());
      if (order) url.searchParams.set('order', order);
      if (reverse) url.searchParams.set('reverse', 'true');
      if (offset > 0) url.searchParams.set('offset', offset.toString());
      if (limit && limit !== 100000) url.searchParams.set('limit', limit.toString());
      if (hidebroken) url.searchParams.set('hidebroken', 'true');
      
      console.log('Advanced search URL:', url.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.warn(`HTTP error! status: ${response.status} for advanced search`);
        return [];
      }
      const data = await response.json();
      console.log('Advanced search results:', data.length, 'stations found');
      // Filter out stations with names starting with dot
      return data.filter(station => station.name && !station.name.startsWith('.'));
    } catch (error) {
      console.error('Failed to perform advanced search:', error);
      return [];
    }
  }

  async getTopStations(limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/topvote/${limit}`);
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.warn(`HTTP error! status: ${response.status}`);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get top stations:', error);
      return [];
    }
  }

  async getRandomStations(limit: number = 50): Promise<any[]> {
    try {
      // Use advanced search with random ordering instead of non-existent random endpoint
      return this.searchStationsAdvanced({
        limit,
        order: 'random',
        hidebroken: true
      });
    } catch (error) {
      console.error('Failed to get random stations:', error);
      return [];
    }
  }

  async getRecentlyClicked(limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/lastclick/${limit}`);
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.warn(`HTTP error! status: ${response.status}`);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get recently clicked stations:', error);
      return [];
    }
  }

  async getRecentlyChanged(limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/lastchange/${limit}`);
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.warn(`HTTP error! status: ${response.status}`);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get recently changed stations:', error);
      return [];
    }
  }

  async getStationsByUUID(uuid: string, limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/byuuid/${uuid}`);
      if (limit) {
        url.searchParams.set('limit', limit.toString());
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.warn(`HTTP error! status: ${response.status}`);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch stations by UUID:', error);
      return [];
    }
  }
}

export const radioAPI = new RadioAPI();