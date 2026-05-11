// EventFlow client-side helpers.

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
