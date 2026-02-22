// Storage abstraction for localStorage persistence

const STORAGE_KEYS = {
  GOALS: 'lifestudio_goals',
  EVENTS: 'lifestudio_events',
  SETTINGS: 'lifestudio_settings',
  ONBOARDING: 'lifestudio_onboarding',
};

export function loadFromStorage(key) {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveToStorage(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

export function clearStorage(key) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

export { STORAGE_KEYS };
