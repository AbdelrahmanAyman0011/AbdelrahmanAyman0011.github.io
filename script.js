(function () {
  var root = document.documentElement;
  var btn = document.querySelector('.theme-toggle');

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0c0c0f' : '#fafaf9';
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  apply(root.getAttribute('data-theme') || 'light');

  if (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Follow system changes unless the user picked a theme explicitly
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener && mq.addEventListener('change', function (e) {
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) {}
    if (!saved) apply(e.matches ? 'dark' : 'light');
  });

  // Keep the active nav tab visible on narrow screens
  var active = document.querySelector('.nav-links a.active');
  if (active && active.scrollIntoView) active.scrollIntoView({ inline: 'center', block: 'nearest' });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && typeof closeModal === 'function') closeModal();
  });
})();

// Scroll reveal
(function () {
  var els = document.querySelectorAll('.reveal, .timeline .card, .blog-post');
  if (!('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js');
  els.forEach(function (el) { el.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  els.forEach(function (el) { io.observe(el); });
})();
