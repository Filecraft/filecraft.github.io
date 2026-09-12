/* Progressive enhancement only. No cookies, storage, network or app logic. */
(() => {
  const theme = document.querySelector('.theme-toggle');
  if (theme) {
    theme.hidden = false;
    theme.addEventListener('click', () => {
      const isDark = getComputedStyle(document.documentElement).colorScheme === 'dark';
      document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
      theme.setAttribute('aria-pressed', String(!isDark));
    });
  }
  const scene = document.querySelector('.paper-scene');
  if (scene) {
    scene.querySelector('.scene-tabs').hidden = false;
    scene.querySelectorAll('[data-scene]').forEach(button => {
      button.addEventListener('click', () => {
        scene.dataset.step = button.dataset.scene;
        scene.querySelectorAll('[data-scene]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        const status = scene.querySelector('.scene-status');
        status.textContent = status.dataset['state' + button.dataset.scene];
      });
    });
  }
  const languages = document.querySelector('.languages');
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && languages?.open) {
      languages.open = false;
      languages.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', event => {
    if (languages?.open && !languages.contains(event.target)) languages.open = false;
  });
})();
