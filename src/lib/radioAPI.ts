const API_BASE_URL = 'http://de1.api.radio-browser.info/';

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

// Функция для фильтрации нежелательного контента
const isStationAllowed = (station: Station): boolean => {
  const blockedKeywords = [
    'Abdul', 'abdul', 'Abdul', 'terrorist', 'isis', 'isil',
    'аллах', 'джихад', 'террорист', 'экстремист',
    'terror', 'extremist', 'radical', 'radical'
  ];

  // Только проверка названия станции
  const stationNameLower = station.name.toLowerCase();
  if (blockedKeywords.some(keyword => stationNameLower.includes(keyword.toLowerCase()))) {
    return false;
  }
  return true;
};

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

      const response = await fetch(url.toString());

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data;
    } catch (error) {
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
        return [];
      }
      const data = await response.json();
      return data.filter((station: any) => {
        const stationObj: Station = {
          id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
          name: station.name,
          url: station.url_resolved || station.url,
          country: station.country || '',
          tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
          favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
        };

        return station.name && !station.name.startsWith('.') && isStationAllowed(stationObj);
      });
    } catch (error) {
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
        return [];
      }
      const data = await response.json();
      return data.filter((station: any) => {
        const stationObj: Station = {
          id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
          name: station.name,
          url: station.url_resolved || station.url,
          country: station.country || '',
          tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
          favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
        };

        return station.name && !station.name.startsWith('.') && isStationAllowed(stationObj);
      });
    } catch (error) {
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

      const response = await fetch(url.toString());
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.filter((station: any) => {
        const stationObj: Station = {
          id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
          name: station.name,
          url: station.url_resolved || station.url,
          country: station.country || '',
          tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
          favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
        };

        return station.name && !station.name.startsWith('.') && isStationAllowed(stationObj);
      });
    } catch (error) {
      return [];
    }
  }

  async searchByCountryExact(country: string, limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/bycountryexact/${encodeURIComponent(country)}`);
      if (limit) {
        url.searchParams.set('limit', limit.toString());
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.filter((station: any) => {
        const stationObj: Station = {
          id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
          name: station.name,
          url: station.url_resolved || station.url,
          country: station.country || '',
          tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
          favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
        };

        return station.name && !station.name.startsWith('.') && isStationAllowed(stationObj);
      });
    } catch (error) {
      return [];
    }
  }

  async searchByCountry(country: string, limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/bycountry/${encodeURIComponent(country)}`);
      if (limit) {
        url.searchParams.set('limit', limit.toString());
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.filter((station: any) => {
        const stationObj: Station = {
          id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
          name: station.name,
          url: station.url_resolved || station.url,
          country: station.country || '',
          tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
          favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
        };

        return station.name && !station.name.startsWith('.') && isStationAllowed(stationObj);
      });
    } catch (error) {
      return [];
    }
  }

  async searchByUrl(url: string, limit: number = 50): Promise<any[]> {
    try {
      const searchUrl = new URL(`${this.baseURL}json/stations/byurl/${encodeURIComponent(url)}`);
      if (limit) {
        searchUrl.searchParams.set('limit', limit.toString());
      }

      const response = await fetch(searchUrl.toString());
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.filter((station: any) => {
        const stationObj: Station = {
          id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
          name: station.name,
          url: station.url_resolved || station.url,
          country: station.country || '',
          tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
          favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
        };

        return station.name && !station.name.startsWith('.') && isStationAllowed(stationObj);
      });
    } catch (error) {
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
        return [];
      }
      return await response.json();
    } catch (error) {
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
        return [];
      }
      return await response.json();
    } catch (error) {
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
        return [];
      }
      return await response.json();
    } catch (error) {
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

      const response = await fetch(url.toString());
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.filter((station: any) => {
        const stationObj: Station = {
          id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
          name: station.name,
          url: station.url_resolved || station.url,
          country: station.country || '',
          tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
          favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
        };

        return station.name && !station.name.startsWith('.') && isStationAllowed(stationObj);
      });
    } catch (error) {
      return [];
    }
  }

  async getTopStations(limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/topvote/${limit}`);
      const response = await fetch(url.toString());
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.filter((station: any) => {
        const stationObj: Station = {
          id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
          name: station.name,
          url: station.url_resolved || station.url,
          country: station.country || '',
          tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
          favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
        };

        return station.name && !station.name.startsWith('.') && isStationAllowed(stationObj);
      });
    } catch (error) {
      return [];
    }
  }

  async getRandomStations(limit: number = 50): Promise<any[]> {
    try {
      return this.searchStationsAdvanced({
        limit,
        order: 'random',
        hidebroken: true
      });
    } catch (error) {
      return [];
    }
  }

  async getRecentlyClicked(limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/lastclick/${limit}`);
      const response = await fetch(url.toString());
      if (!response.ok) {
        return [];
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async getRecentlyChanged(limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/lastchange/${limit}`);
      const response = await fetch(url.toString());
      if (!response.ok) {
        return [];
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async searchByUUID(uuid: string, limit: number = 50): Promise<any[]> {
    try {
      const url = new URL(`${this.baseURL}json/stations/byuuid/${uuid}`);
      if (limit) {
        url.searchParams.set('limit', limit.toString());
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.filter((station: any) => {
        const stationObj: Station = {
          id: station.id || station.stationuuid || Math.random().toString(36).substr(2, 9),
          name: station.name,
          url: station.url_resolved || station.url,
          country: station.country || '',
          tags: Array.isArray(station.tags) ? station.tags : (station.tags ? station.tags.split(',') : []),
          favicon: station.favicon && station.favicon !== 'null' ? station.favicon : undefined
        };

        return station.name && !station.name.startsWith('.') && isStationAllowed(stationObj);
      });
    } catch (error) {
      return [];
    }
  }
}

export const radioAPI = new RadioAPI();