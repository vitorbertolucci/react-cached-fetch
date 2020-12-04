import React, {
  useCallback,
  useState,
  createContext,
  FunctionComponent,
  useMemo,
} from 'react';

export interface ICachedFetchOptions {
  headers: Headers;
  fetcher: (route: string, headers: Headers) => any;
  initialValue: any;
  dependencies: boolean[];
}

export interface ICachedFetchProviderOptionalOptions {
  headers?: Headers;
  fetcher?: (route: string, headers: Headers) => any;
  initialValue?: any;
  dependencies?: boolean[];
}

interface ICachedFetchProviderProps {
  globalOptions?: ICachedFetchProviderOptionalOptions;
}

interface ICache {
  [key: string]: any;
}
interface ICachedFetchContextData {
  globalOptions: ICachedFetchOptions;
  cache: ICache;
  updateCache(key: string, data: any): void;
}

export const CachedFetchContext = createContext<ICachedFetchContextData>(
  {} as ICachedFetchContextData,
);

const defaultOptions: ICachedFetchOptions = {
  fetcher: async (route: string, headers: Headers): Promise<any> => {
    const response = await fetch(route, { headers });
    const result = await response.json();
    return result;
  },
  headers: new Headers(),
  initialValue: undefined,
  dependencies: [],
};

export const CachedFetchProvider: FunctionComponent<ICachedFetchProviderProps> = ({
  globalOptions,
  children,
}) => {
  const [cache, setCache] = useState<ICache>({});

  const updateCache = useCallback((key, data) => {
    setCache((current: ICache) => ({ ...current, [key]: data }));
  }, []);

  const memoizedGlobalOptions = useMemo<ICachedFetchOptions>(() => {
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
