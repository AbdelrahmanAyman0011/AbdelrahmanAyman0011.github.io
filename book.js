(function () {
  var HOST_TZ = 'Africa/Cairo';
  var HOST_EMAIL = 'abdelrahmanayman0011@gmail.com';
  var SLOTS = ['10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00'];

  var form = document.getElementById('book-form');
  var dateEl = document.getElementById('date');
  var slotsEl = document.getElementById('slots');
  var summary = document.getElementById('summary');
  var icsBtn = document.getElementById('ics');
  var selected = null;

  function pad(n) { return String(n).padStart(2, '0'); }

  // Convert a wall-clock time in HOST_TZ to a real Date (handles DST)
  function hostTimeToDate(dateStr, timeStr) {
    var d = dateStr.split('-').map(Number), t = timeStr.split(':').map(Number);
    var guess = Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1]);
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: HOST_TZ, hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'
    }).formatToParts(new Date(guess)).reduce(function (a, p) { a[p.type] = +p.value; return a; }, {});
    var asHost = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    return new Date(guess - (asHost - guess));
  }

  function fmtLocal(d) {
    return d.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  function icsDate(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z';
  }

  // Date input: tomorrow onward
  var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  dateEl.min = tomorrow.getFullYear() + '-' + pad(tomorrow.getMonth() + 1) + '-' + pad(tomorrow.getDate());

  function renderSlots() {
    slotsEl.innerHTML = '';
    selected = null;
    icsBtn.disabled = true;
    summary.className = 'summary';
    if (!dateEl.value) { slotsEl.innerHTML = '<p class="hint">Choose a date first.</p>'; return; }
    SLOTS.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'slot'; b.textContent = fmtLocal(hostTimeToDate(dateEl.value, t)).split(', ').pop();
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(slotsEl.children, function (c) { c.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        selected = hostTimeToDate(dateEl.value, t);
        icsBtn.disabled = false;
        summary.textContent = 'Selected: ' + fmtLocal(selected) + ' (your local time) · 30 min';
        summary.className = 'summary show';
      });
      slotsEl.appendChild(b);
    });
  }

  var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  document.getElementById('tz-hint').textContent = 'Times are shown in your timezone (' + tz + ').';
  slotsEl.innerHTML = '<p class="hint">Choose a date first.</p>';
  dateEl.addEventListener('change', renderSlots);

  function details() {
    return {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      topic: document.getElementById('topic').value,
      msg: document.getElementById('msg').value.trim()
    };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = details();
    if (!d.name || !/^\S+@\S+\.\S+$/.test(d.email)) { summary.textContent = 'Please enter your name and a valid email.'; summary.className = 'summary show'; return; }
    if (!selected) { summary.textContent = 'Please pick a date and time.'; summary.className = 'summary show'; return; }
    var body = 'Hi Abdelrahman,\n\nI would like to book a 30-minute call.\n\n' +
      'When: ' + fmtLocal(selected) + ' (' + tz + ')\n' +
      'UTC: ' + selected.toISOString() + '\n' +
      'Topic: ' + d.topic + '\n' +
      'Name: ' + d.name + '\nEmail: ' + d.email + '\n' +
      (d.msg ? '\nMessage:\n' + d.msg + '\n' : '');
    location.href = 'mailto:' + HOST_EMAIL + '?subject=' + encodeURIComponent('Call request: ' + d.topic + ' (' + d.name + ')') + '&body=' + encodeURIComponent(body);
  });

  icsBtn.addEventListener('click', function () {
    if (!selected) return;
    var end = new Date(selected.getTime() + 30 * 60000), d = details();
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Abdelrahman Mohamed//Booking//EN', 'BEGIN:VEVENT',
      'UID:' + selected.getTime() + '@abdelrahmanayman0011.github.io',
      'DTSTAMP:' + icsDate(new Date()), 'DTSTART:' + icsDate(selected), 'DTEND:' + icsDate(end),
      'SUMMARY:Call with Abdelrahman Mohamed' + (d.topic ? ' - ' + d.topic : ''),
      'DESCRIPTION:Requested via abdelrahmanayman0011.github.io (pending confirmation by email).',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'call-with-abdelrahman.ics';
    document.body.appendChild(a); a.click(); a.remove();
  });
})();
