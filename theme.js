(function () {
  var key = 'dheeraj-erpa-theme';
  var device = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  var themeSwitch = document.querySelector('.theme-switch');
  var preference;
  try { preference = localStorage.getItem(key); } catch (error) {}

  function render() {
    var dark = preference === 'dark' || (preference !== 'light' && device && device.matches);
    var theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]').content = dark ? '#171620' : '#fdfcfe';
    themeSwitch.setAttribute('aria-checked', String(theme === 'dark'));
    themeSwitch.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  function chooseTheme() {
    preference = themeSwitch.getAttribute('aria-checked') === 'true' ? 'light' : 'dark';
    try { localStorage.setItem(key, preference); } catch (error) {}
    render();
  }

  render();
  if (!window.addEventListener || !document.documentElement.style.setProperty || !window.CSS || !CSS.supports('color','var(--ink)')) return;
  themeSwitch.addEventListener('click', chooseTheme);
  themeSwitch.removeAttribute('hidden');
  if (device && device.addEventListener) device.addEventListener('change', render);
  else if (device && device.addListener) device.addListener(render);
  window.addEventListener('storage', function (event) {
    if (event.key === key || event.key === null) {
      preference = event.newValue;
      render();
    }
  });
})();
