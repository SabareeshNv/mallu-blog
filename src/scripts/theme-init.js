// Runs inline in <head>, before the first paint, so the page never flashes the wrong theme.
// It applies the saved choice (or the operating system's preference) and marks the page as JavaScript-enabled.
// The theme switch (components/layout/ThemeSwitcher.astro) uses the same storage key, "theme".
(() => {
  const root = document.documentElement;
  let theme;
  try {
    theme = localStorage.getItem('theme');
  } catch {}
  if (theme !== 'light' && theme !== 'dark') {
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.dataset.theme = theme;
  root.dataset.js = '';
})();
