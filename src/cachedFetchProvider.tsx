import React, {
  useCallback,
  useState,
  createContext,
  FunctionComponent
} from "react";

export interface Options {
  headers: Headers;
  fetcher(): any;
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
  }
};

type CachedFetchProvider = {
  globalOptions: Options;
};

export const CachedFetchProvider: FunctionComponent<CachedFetchProvider> = ({
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
