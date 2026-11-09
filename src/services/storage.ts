// Cross-platform authentication storage helper

let memoryStorage: Record<string, string> = {};

const getLocalStorage = (): Storage | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Handled in sandboxed or SSR environments
  }
  return null;
};

export const storage = {
  setItem: (key: string, value: string): void => {
    // Dual store: memory is always immediate and synchronous
    memoryStorage[key] = value;
    const ls = getLocalStorage();
    if (ls) {
      try {
        ls.setItem(key, value);
      } catch (err) {
        console.warn('[Storage] localStorage setItem failed:', err);
      }
    }
  },

  getItem: (key: string): string | null => {
    const ls = getLocalStorage();
    if (ls) {
      try {
        const val = ls.getItem(key);
        if (val !== null && val !== undefined && val !== 'undefined') {
          memoryStorage[key] = val;
          return val;
        }
      } catch (err) {
        console.warn('[Storage] localStorage getItem failed:', err);
      }
    }
    return memoryStorage[key] || null;
  },

  removeItem: (key: string): void => {
    delete memoryStorage[key];
    const ls = getLocalStorage();
    if (ls) {
      try {
        ls.removeItem(key);
      } catch (err) {
        console.warn('[Storage] localStorage removeItem failed:', err);
      }
    }
  },

  clear: (): void => {
    memoryStorage = {};
    const ls = getLocalStorage();
    if (ls) {
      try {
        ls.clear();
      } catch (err) {
        console.warn('[Storage] localStorage clear failed:', err);
      }
    }
  },
};

const TOKEN_KEY = 'smart_bharat_auth_token';
const USER_KEY = 'smart_bharat_auth_user';

export const saveAuthData = (token: string, user: any) => {
  if (!token) return;
  const cleanToken = token.toString().replace(/^["']|["']$/g, '').trim();
  storage.setItem(TOKEN_KEY, cleanToken);
  if (user) {
    storage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getAuthToken = (): string | null => {
  const token = storage.getItem(TOKEN_KEY);
  if (!token || token === 'null' || token === 'undefined') return null;
  const clean = token.replace(/^["']|["']$/g, '').trim();
  return clean.length > 10 ? clean : null;
};

export const getStoredUser = (): any | null => {
  const data = storage.getItem(USER_KEY);
  if (!data || data === 'undefined' || data === 'null') return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const clearAuthData = () => {
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
};
