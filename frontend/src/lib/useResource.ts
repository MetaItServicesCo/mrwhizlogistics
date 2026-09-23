"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "./api";

function message(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Something went wrong.";
}

/**
 * Loads a list from the API and keeps it in sync after writes.
 *
 * `select` unwraps endpoints that return a paginated envelope
 * ({ items, total, ... }) rather than a bare array.
 */
export function useResource<T>(
  path: string,
  select?: (raw: unknown) => T[],
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await api.get<unknown>(path);
      const list = select
        ? select(raw)
        : Array.isArray(raw)
          ? (raw as T[])
          : ((raw as { items?: T[] })?.items ?? []);
      setItems(list);
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, [path, select]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, loading, error, reload: load, setItems };
}

/** Tracks the busy/error state of a single create-update-delete action. */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (fn: () => Promise<unknown>): Promise<boolean> => {
      setBusy(true);
      setError(null);
      try {
        await fn();
        return true;
      } catch (e) {
        setError(message(e));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return { busy, error, setError, run };
}

export { message as errorMessage };
