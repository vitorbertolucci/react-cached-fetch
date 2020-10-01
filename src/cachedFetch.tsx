import {
  useEffect,
  useCallback,
  useContext,
  useReducer,
  useState
} from "react";
import { CachedFetchContext, Options } from "./cachedFetchProvider";

interface State {
  isLoading: boolean;
  hasError: boolean;
}

interface Action {
  type: string;
}

const cachedFetchReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        isLoading: true,
        hasError: false
      };
    case "FETCH_SUCCESS":
      return {
        isLoading: false,
        hasError: false
      };
    case "FETCH_FAILURE":
      return {
        isLoading: false,
        hasError: true
      };
    default:
      throw new Error();
  }
};

export const useCachedFetch = (route: string, options?: Options) => {
  const { cache, updateCache, globalOptions }: any = useContext(
    CachedFetchContext
  );
  const unifiedOptions = { ...globalOptions, ...options };
  const [headers] = useState(unifiedOptions.headers);
  const [state, dispatch] = useReducer(cachedFetchReducer, {
    isLoading: false,
    hasError: false
  });
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const fetchCallback = useCallback(unifiedOptions.fetcher, []);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });

      try {
        const result = await fetchCallback(route, headers);

        if (mounted) {
          dispatch({ type: "FETCH_SUCCESS" });
        }

        updateCache(route, result);
      } catch (error) {
        if (mounted) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [route, dispatch, updateCache, fetchCallback, shouldRefresh, headers]);

  const refresh = () => {
    setShouldRefresh(current => !current);
  };

  return { data: cache[route], ...state, refresh };
};
