import { DEFAULT_THEME, THEMES } from '../constants/terminal.js';

export function applyTheme(themeKey, darkMode) {
  const theme = THEMES[themeKey];

  if (!theme) {
    return;
  }

  const vars = darkMode ? theme.dark : theme.light;
  const root = document.documentElement;

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  localStorage.setItem('cogsworth-theme', themeKey);
}

export function getSavedTheme() {
  return localStorage.getItem('cogsworth-theme') || DEFAULT_THEME;
}
