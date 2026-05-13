// EventFlow client-side helpers.

// ── Theme toggle ──
(function () {
  const html = document.documentElement;
  const STORAGE_KEY = 'ef-theme';
  const DEFAULT = 'dark';

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT;
    applyTheme(saved);

    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }
  });
})();

// Auto-dismiss flash alerts after a few seconds.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.alert.auto-dismiss').forEach((alert) => {
    setTimeout(() => {
      const inst = bootstrap.Alert.getOrCreateInstance(alert);
      inst.close();
    }, 5000);
  });

  // Generic confirmation handler — used by delete forms.
  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const msg = form.getAttribute('data-confirm') || 'Are you sure?';
      if (!window.confirm(msg)) {
        e.preventDefault();
      }
    });
  });
});
