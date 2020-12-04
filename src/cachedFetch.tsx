import {
  useEffect,
  useCallback,
  useContext,
  useReducer,
  useState,
} from 'react';
import {
  CachedFetchContext,
  ICachedFetchDefaultOptions,
  ICachedFetchOptions,
} from './cachedFetchProvider';

interface ICachedFetchReducerState {
  isLoading: boolean;
  hasError: boolean;
}

interface ICachedFetchReducerAction {
  type: string;
}

interface IUseCachedFetchReturn {
  data: any;
  isLoading: boolean;
  hasError: boolean;
  refresh(): void;
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

export const useCachedFetch = (
  route: string,
  options?: ICachedFetchOptions,
): IUseCachedFetchReturn => {
  const { cache, updateCache, globalOptions }: any = useContext(
    CachedFetchContext,
  );
  const unifiedOptions: ICachedFetchDefaultOptions = {
    ...globalOptions,
    ...options,
  };
  const [headers] = useState<Headers>(unifiedOptions.headers);
  const [state, dispatch] = useReducer(cachedFetchReducer, {
    isLoading: false,
    hasError: false,
  });
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [isWaitingForDependencies, setIsWaitingForDependencies] = useState(
    true,
  );

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

  const refresh = () => {
    setShouldRefresh((current: Boolean) => !current);
  };

  return {
    data: cache[route] ?? unifiedOptions.initialValue,
    ...state,
    refresh,
  };
};
