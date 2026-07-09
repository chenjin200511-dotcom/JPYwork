"use client";

// Purpose: Loads API data from client components with refresh and error state.
import { useCallback, useEffect, useState } from "react";
import { apiRequest, type ApiClientError } from "./apiClient";

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(url));
  const [reloadIndex, setReloadIndex] = useState(0);

  const reload = useCallback(() => {
    setReloadIndex((current) => current + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function load() {
      if (!url) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const nextData = await apiRequest<T>(url);

        if (isActive) {
          setData(nextData);
        }
      } catch (requestError) {
        const typedError = requestError as ApiClientError;

        if (isActive) {
          setError(typedError.message || "请求失败");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [reloadIndex, url]);

  return {
    data,
    error,
    isLoading,
    reload,
  };
}
