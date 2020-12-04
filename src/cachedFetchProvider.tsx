import React, { useCallback, useState, useMemo, createContext } from 'react';

interface ICachedFetchGlobalOptions {
  headers: Headers;
  fetcher: (route: string, headers: Headers) => Promise<any>;
  initialValue: any;
  dependencies: boolean[];
}

interface ICachedFetchProviderGlobalOptions {
  headers?: Headers;
  fetcher?: (route: string, headers: Headers) => Promise<any>;
  initialValue?: any;
  dependencies?: boolean[];
}

interface ICachedFetchProviderProps {
  globalOptions?: ICachedFetchProviderGlobalOptions;
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
  fetcher: async (route: string, headers: Headers): Promise<any> => {
    const response = await fetch(route, { headers });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || response.statusText || 'Request failed.',
      );
    }

    return result;
  },
  headers: new Headers(),
  initialValue: undefined,
  dependencies: [],
};

export const CachedFetchProvider: React.FC<ICachedFetchProviderProps> = ({
  globalOptions,
  children,
}) => {
  const [cache, setCache] = useState<ICache>({});

  const updateCache = useCallback((key, data) => {
    setCache((current: ICache) => ({ ...current, [key]: data }));
  }, []);

  const memoizedGlobalOptions = useMemo<ICachedFetchGlobalOptions>(() => {
    if (!globalOptions) {
      return defaultOptions;
    }

    return { ...defaultOptions, ...globalOptions };
  }, [globalOptions]);

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
