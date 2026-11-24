(function () {
  'use strict';

  var scene = document.getElementById('opening-scene');
  if (!scene || !document.addEventListener) return;
  var progress = document.getElementById('opening-progress');
  var fill = document.getElementById('signature-fill');
  var percent = document.getElementById('opening-percent');
  var enter = document.getElementById('enter-portfolio');
  var replay;
  var timer;
  var replaying = false;
  var value = 0;

  function dismiss() {
    window.clearTimeout(timer);
    if (scene.hidden) return;
    if (scene.open && typeof scene.close === 'function') scene.close();
    scene.removeAttribute('open');
    scene.hidden = true;
    if (replaying && replay) replay.focus();
  }

  function closeWhenReady() {
    if (value !== 100 || scene.hidden) return;
    window.clearTimeout(timer);
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer = window.setTimeout(dismiss, reduced ? 0 : 650);
  }

  function render(next) {
    if (next === value) return;
    value = next;
    fill.setAttribute('width', String(240 * value / 100));
    percent.textContent = value + '%';
    progress.setAttribute('aria-valuenow', String(value));
    closeWhenReady();
  }

  function display(fromLogo) {
    if (!scene.hidden) return;
    replaying = fromLogo;
    scene.hidden = false;
    if (typeof scene.showModal === 'function') {
      scene.showModal();
    } else {
      scene.setAttribute('role', 'dialog');
      scene.setAttribute('aria-modal', 'true');
      scene.setAttribute('open', '');
    }
    enter.focus();
    closeWhenReady();
  }

  function watchPage() {
    replay = document.getElementById('opening-replay');
    replay.setAttribute('aria-label', 'Dheeraj Erpa, replay the opening scene');
    replay.setAttribute('title', 'Replay the opening scene');
    replay.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
      event.preventDefault();
      display(true);
    });

    // Count each initial image request once, even when the same logo appears twice.
    // Parsing the document and finishing the page load each contribute one more step.
    var images = [];
    var sources = [];
    for (var i = 0; i < document.images.length; i++) {
      var image = document.images[i];
      var source = image.currentSrc || image.src;
      if (!source || image.loading === 'lazy' || sources.indexOf(source) !== -1) continue;
      images.push(image);
      sources.push(source);
      image.addEventListener('load', update);
      image.addEventListener('error', update);
    }

    function update() {
      if (document.readyState === 'complete') {
        render(100);
        return;
      }
      var ready = 1;
      for (var i = 0; i < images.length; i++) {
        if (images[i].complete) ready++;
      }
      render(Math.round(100 * ready / (images.length + 2)));
    }
    window.addEventListener('load', function () { render(100); });
    update();
  }

  enter.addEventListener('click', dismiss);
  scene.addEventListener('cancel', function (event) {
    event.preventDefault();
    dismiss();
  });
  scene.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      event.preventDefault();
      dismiss();
    } else if (event.key === 'Tab' || event.keyCode === 9) {
      event.preventDefault();
      enter.focus();
    }
  });
  window.addEventListener('pagehide', dismiss);
  var navigation = window.performance && window.performance.getEntriesByType
    ? window.performance.getEntriesByType('navigation')[0] : null;
  if (!window.location.hash && !(navigation && navigation.type === 'back_forward')) display(false);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchPage);
  else watchPage();
})();
