(function () {
  var trigger = document.getElementById('download-cv');
  var dialog = document.getElementById('cv-dialog');
  if (window.location.protocol === 'file:' || !trigger || !dialog || !dialog.showModal || !window.fetch || !window.AbortController ||
      !window.URL || !URL.createObjectURL || !('download' in trigger)) return;

  var status = document.getElementById('cv-status');
  var save = document.getElementById('cv-save');
  var track = dialog.querySelector('.pixel-track');
  var close = document.getElementById('cv-close');
  var current = null;

  close.addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('close', function () {
    if (current) current.abort();
    current = null;
    trigger.focus();
  });
  trigger.addEventListener('click', async function (event) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || dialog.open) return;
    dialog.hidden = false;
    dialog.showModal();
    event.preventDefault();
    var request = new AbortController();
    current = request;
    status.textContent = 'Preparing your PDF…';
    save.href = trigger.href;
    save.hidden = true;
    track.hidden = false;
    close.focus();
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var entrance = new Promise(function (resolve) {
      window.setTimeout(resolve, reducedMotion ? 0 : 450);
    });
    try {
      var response = await fetch(trigger.href, {signal: request.signal});
      if (!response.ok) throw new Error('Download failed');
      var file = await response.blob();
      if (!file.size || (file.type && !/pdf|octet-stream/i.test(file.type))) throw new Error('Expected a PDF');
      await entrance;
      if (current !== request || !dialog.open) return;
      var url = URL.createObjectURL(file);
      try {
        save.href = url;
        save.click();
      } finally {
        save.href = trigger.href;
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
      }
      status.textContent = 'Your CV is ready. You can save another copy below.';
    } catch (error) {
      if (current !== request || !dialog.open) return;
      status.textContent = 'Use Save PDF to open the CV directly.';
    }
    track.hidden = true;
    save.hidden = false;
  });
})();
