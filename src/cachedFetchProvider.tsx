import React, {
  useCallback,
  useState,
  useMemo,
  createContext,
  useEffect,
} from 'react';

export interface IHeaderOptions {
  [key: string]: string;
}

type IPersistenceType = 'none' | 'session' | 'local';

interface ICachedFetchGlobalOptions {
  headers: IHeaderOptions;
  fetcher: (route: string, headers: IHeaderOptions) => Promise<any>;
  initialValue: any;
  dependencies: boolean[];
}

interface ICachedFetchProviderGlobalOptions {
  headers?: IHeaderOptions;
  fetcher?: (route: string, headers: IHeaderOptions) => Promise<any>;
  initialValue?: any;
  dependencies?: boolean[];
}

interface ICachedFetchProviderProps {
  globalOptions?: ICachedFetchProviderGlobalOptions;
  persistence?: IPersistenceType;
  persistencePrefix?: string;
}

interface ICache {
  [key: string]: any;
}
interface ICachedFetchContextData {
  globalOptions: ICachedFetchGlobalOptions;
  cache: ICache;
  updateCache(key: string, data: any): void;
}

export const CachedFetchContext = createContext<ICachedFetchContextData>(
  {} as ICachedFetchContextData,
);

const defaultOptions: ICachedFetchGlobalOptions = {
  fetcher: async (route: string, headers: IHeaderOptions): Promise<any> => {
    const response = await fetch(route, { headers });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || response.statusText || 'Request failed.',
      );
    }

    return result;
  },
  headers: {},
  initialValue: undefined,
  dependencies: [],
};

export const CachedFetchProvider: React.FC<ICachedFetchProviderProps> = ({
  globalOptions,
  persistence = 'none',
  persistencePrefix,
  children,
}) => {
  const [cache, setCache] = useState<ICache>(() => {
    if (persistence === 'none') {
      return {};
    }

    if (!persistencePrefix) {
      throw new Error(
        'persistencePrefix must be provided when persistence is set to session or local',
      );
    }

    const storage = persistence === 'session' ? sessionStorage : localStorage;

    const persistedCache = storage.getItem(
      `${persistencePrefix}-react-cached-fetch`,
    );
    if (!persistedCache) {
      return {};
    }

    return JSON.parse(persistedCache);
  });

  const updateCache = useCallback((key, data) => {
    setCache((current: ICache) => ({ ...current, [key]: data }));
  }, []);

  const memoizedGlobalOptions = useMemo<ICachedFetchGlobalOptions>(() => {
    if (!globalOptions) {
      return defaultOptions;
    }

    return { ...defaultOptions, ...globalOptions };
  }, [globalOptions]);

  useEffect(() => {
    if (persistence === 'none' || !persistencePrefix) {
      return;
    }

    const storage = persistence === 'session' ? sessionStorage : localStorage;

    storage.setItem(
      `${persistencePrefix}-react-cached-fetch`,
      JSON.stringify(cache),
    );
  }, [persistence, persistencePrefix, cache]);

  return (
    <CachedFetchContext.Provider
      value={{
        cache,
        updateCache,
        globalOptions: memoizedGlobalOptions,
      }}
    >
      {children}
    </CachedFetchContext.Provider>
  );
};
