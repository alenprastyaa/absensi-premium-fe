const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.applicationservice.id';

export function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  if (typeof input === 'string') {
    if (/^https?:\/\//.test(input)) {
      return globalThis.fetch(input, init);
    }

    return globalThis.fetch(`${API_BASE_URL}${input}`, init);
  }

  return globalThis.fetch(input, init);
}
