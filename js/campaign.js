/* Campaign edition.
   - "Join the movement" opens an email to Rachad with the recruiter's address
     filled in (a static site has nowhere else to send it).
   - Bills open as an official document: the workbench panels (still written in
     index.html, still switched by tabs.js) move into a dialog, and any link to
     #tp-panel-N opens that bill there. Without JavaScript the links just jump to
     the panels section further down. */
(function () {
  'use strict';

  var form = document.getElementById('cp-join');
  if (form) form.addEventListener('submit', function (event) {
    event.preventDefault();
    var email = form.elements.email.value.trim();
    var subject = 'Joining the movement: let\'s talk about a role';
    var body = 'Hi Rachad,\n\nI saw the campaign. You can reach me at ' + email + '.\n\n';
    window.location.href = 'mailto:Rachadelmtq@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });

  var dialog = document.getElementById('cp-bill-doc');
  var panels = document.querySelector('#project .tp-panels');
  if (!dialog || !panels || typeof dialog.showModal !== 'function') return;

  document.documentElement.classList.add('cp-js');
  var paper = dialog.querySelector('.cp-doc-paper');
  dialog.querySelector('.cp-doc-body').appendChild(panels);
  var tabs = Array.prototype.slice.call(document.querySelectorAll('#project .tp-tab'));
  var current = 0;

  // Bill number and title for each panel, read from the bill cards (two bills
  // share the flight & racing panel).
  var meta = tabs.map(function (tab, i) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.cp-bill[href="#tp-panel-' + i + '"]'));
    if (!cards.length) return { no: 'Bill ' + (i + 1), title: tab.textContent };
    return {
      no: cards.map(function (c) { return c.querySelector('.cp-no').textContent; }).join(' + '),
      title: cards.map(function (c) { return c.querySelector('h3').textContent; }).join(' + ')
    };
  });

  function pauseMedia() { panels.querySelectorAll('audio, video').forEach(function (m) { m.pause(); }); }

  function open(index) {
    current = (index + tabs.length) % tabs.length;
    pauseMedia();
    tabs[current].click();
    document.getElementById('cp-doc-no').textContent = meta[current].no;
    document.getElementById('cp-doc-title').textContent = meta[current].title;
    if (!dialog.open) dialog.showModal();
    paper.scrollTop = 0;
  }

  // Capture phase, so tabs.js (which would scroll down to the hidden section) sees a handled click.
  document.addEventListener('click', function (event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest('a[href^="#tp-panel-"]');
    if (!link) return;
    var index = parseInt(link.getAttribute('href').slice('#tp-panel-'.length), 10);
    if (isNaN(index) || !tabs[index]) return;
    event.preventDefault();
    open(index);
  }, true);

  dialog.querySelector('.cp-doc-close').addEventListener('click', function () { dialog.close(); });
  dialog.querySelector('.cp-doc-prev').addEventListener('click', function () { open(current - 1); });
  dialog.querySelector('.cp-doc-next').addEventListener('click', function () { open(current + 1); });
  dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', pauseMedia);

  var start = /^#tp-panel-(\d+)$/.exec(location.hash);
  if (start && tabs[+start[1]]) open(+start[1]);
})();
