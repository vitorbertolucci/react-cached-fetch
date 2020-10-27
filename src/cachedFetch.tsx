import {
  useEffect,
  useCallback,
  useContext,
  useReducer,
  useState
} from "react";
import { CachedFetchContext, ICachedFetchOptions } from "./cachedFetchProvider";

interface ICachedFetchReducerState {
  isLoading: boolean;
  hasError: boolean;
}

interface ICachedFetchReducerAction {
  type: string;
}

const cachedFetchReducer = (
  state: ICachedFetchReducerState,
  action: ICachedFetchReducerAction
): ICachedFetchReducerState => {
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

export const useCachedFetch = (
  route: string,
  options?: ICachedFetchOptions
) => {
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
    setShouldRefresh((current: Boolean) => !current);
  };

  return {
    data: cache[route] ?? unifiedOptions.initialValue,
    ...state,
    refresh
  };
};
