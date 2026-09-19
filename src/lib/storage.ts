import { useState } from "react";
export function readStorage<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): T {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    return validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
export const stringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
export function useStoredList(key: string) {
  const [items, setItems] = useState(() => readStorage(key, [], stringArray));
  const [failed, setFailed] = useState(false);
  const update = (next: string[]) => {
    setItems(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };
  return { items, update, failed };
}
