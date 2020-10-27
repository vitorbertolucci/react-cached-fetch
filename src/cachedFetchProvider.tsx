import React, {
  useCallback,
  useState,
  createContext,
  FunctionComponent
} from "react";

export interface ICachedFetchOptions {
  headers?: Headers;
  fetcher?: (route: string, headers: Headers) => any;
  initialValue?: any;
}

interface ICachedFetchProviderProps {
  globalOptions?: ICachedFetchOptions;
}

export const CachedFetchContext = createContext({});

const defaultOptions = {
  fetcher: async (route: string, headers: Headers): Promise<any> => {
    const response = await fetch(route, { headers });
    const result = await response.json();
    return result;
  },
  headers: {
    method: "GET"
  },
  initialValue: undefined
};

export const CachedFetchProvider: FunctionComponent<ICachedFetchProviderProps> = ({
  globalOptions = defaultOptions,
  children
}) => {
  const [cache, setCache] = useState<any>({});

  const updateCache = useCallback((key, data) => {
    setCache((current: any) => ({ ...current, [key]: data }));
  }, []);

  return (
    <CachedFetchContext.Provider
      value={{
        cache,
        updateCache,
        globalOptions: { ...defaultOptions, ...globalOptions }
      }}
    >
      {children}
    </CachedFetchContext.Provider>
  );
};
