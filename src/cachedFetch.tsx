import {
  useEffect,
  useCallback,
  useContext,
  useReducer,
  useState,
  useMemo,
} from 'react';
import { CachedFetchContext } from './cachedFetchProvider';

interface ICachedFetchReducerState {
  isLoading: boolean;
  hasError: boolean;
}

interface ICachedFetchReducerAction {
  type: string;
}

interface IUseCachedFetchReturn<T> {
  data: T;
  isLoading: boolean;
  hasError: boolean;
  refresh(): void;
}

interface IUseCachedFetchOptionalOptions<T> {
  headers?: Headers;
  fetcher?: (route: string, headers: Headers) => Promise<T>;
  initialValue?: T;
  dependencies?: boolean[];
}

interface IUseCachedFetchOptions<T> {
  headers: Headers;
  fetcher: (route: string, headers: Headers) => Promise<T>;
  initialValue: T;
  dependencies: boolean[];
}

const cachedFetchReducer = (
  state: ICachedFetchReducerState,
  action: ICachedFetchReducerAction,
): ICachedFetchReducerState => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        isLoading: true,
        hasError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        isLoading: false,
        hasError: false,
      };
    case 'FETCH_FAILURE':
      return {
        isLoading: false,
        hasError: true,
      };
    default:
      throw new Error();
  }
};

export function useCachedFetch<T = any>(
  route: string,
  options?: IUseCachedFetchOptionalOptions<T>,
): IUseCachedFetchReturn<T> {
  const { cache, updateCache, globalOptions } = useContext(CachedFetchContext);

  const memoizedOptions = useMemo<IUseCachedFetchOptionalOptions<T>>(() => {
    if (!options) {
      return {};
    }

    return options;
  }, [options]);

  const unifiedOptions = useMemo<IUseCachedFetchOptions<T>>(() => {
    return { ...globalOptions, ...memoizedOptions };
  }, [globalOptions, memoizedOptions]);

  const [headers] = useState<Headers>(unifiedOptions.headers);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [isWaitingForDependencies, setIsWaitingForDependencies] = useState(
    true,
  );

  const [state, dispatch] = useReducer(cachedFetchReducer, {
    isLoading: false,
    hasError: false,
  });

  const fetchCallback = useCallback(unifiedOptions.fetcher, []);

  useEffect(() => {
    if (
      unifiedOptions.dependencies &&
      unifiedOptions.dependencies.some((dependency: boolean) => !dependency)
    ) {
      setIsWaitingForDependencies(true);
      return;
    }

    setIsWaitingForDependencies(false);
  }, [unifiedOptions.dependencies]);

  useEffect(() => {
    if (isWaitingForDependencies) {
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });

      try {
        const result = await fetchCallback(route, headers);

        if (mounted) {
          dispatch({ type: 'FETCH_SUCCESS' });
        }

        updateCache(route, result);
      } catch (error) {
        if (mounted) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [
    route,
    dispatch,
    updateCache,
    fetchCallback,
    shouldRefresh,
    headers,
    isWaitingForDependencies,
  ]);

  const refresh = useCallback(() => {
    setShouldRefresh((current: Boolean) => !current);
  }, []);

  return {
    data: cache[route] ?? unifiedOptions.initialValue,
    ...state,
    refresh,
  };
}
