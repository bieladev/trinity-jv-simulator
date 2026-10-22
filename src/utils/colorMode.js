// Light/dark preference. An explicit choice is stored in localStorage; with no
// stored choice the app follows the operating system (prefers-color-scheme).
// Every storage access is guarded: private windows and blocked storage must
// never break the app.

export const COLOR_MODE_KEY = 'lotline-color-mode';

export const getStoredColorMode = () => {
  try {
    const value = window.localStorage.getItem(COLOR_MODE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
};

export const getSystemColorMode = () => {
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const getInitialColorMode = () => getStoredColorMode() || getSystemColorMode();

export const storeColorMode = (mode) => {
  try {
    window.localStorage.setItem(COLOR_MODE_KEY, mode);
  } catch {
    /* storage unavailable — preference lasts for this session only */
  }
};
