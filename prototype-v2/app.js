/* ============================================================================
   Aurora click-through prototype
   Plain browser JavaScript. No framework, no build step, no server — this file
   runs straight off the filesystem.
   ========================================================================= */

(function () {
  'use strict';

  var FLOW = ['welcome', 'details', 'review', 'done'];

  /* Any account type whose name says "joint" asks for a second applicant. */
  var JOINT_TYPE = /joint/i;

  var screens = {};
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-screen]'),
    function (el) { screens[el.dataset.screen] = el; }
  );

  var state = {
    name: '',
    email: '',
    dob: '',
    accountType: 'Everyday Account',
    jointName: '',
    jointEmail: '',
    account: ''
  };

  var current = 'welcome';

  /* ------------------------------------------------------------ routing -- */

  function show(next, direction) {
    if (!screens[next] || next === current) { return; }

    screens[current].classList.remove('is-active', 'is-back');
    screens[next].classList.remove('is-back');
    if (direction === 'back') { screens[next].classList.add('is-back'); }
    screens[next].classList.add('is-active');

    current = next;

    if (next === 'review') { paintReview(); }
    if (next === 'done')   { paintDone(); }

    var focusable = screens[next].querySelector('input:not([type=checkbox]), button');
    if (focusable && next !== 'welcome') { focusable.focus({ preventScroll: true }); }
  }

  document.addEventListener('click', function (event) {
    var go = event.target.closest('[data-go]');
    if (go) { show(go.dataset.go, 'forward'); return; }

    var back = event.target.closest('[data-back]');
    if (back) { show(back.dataset.back, 'back'); return; }

    var restart = event.target.closest('[data-restart]');
    if (restart) { reset(); }
  });

  /* --------------------------------------------------------- validation -- */

  var form = document.getElementById('details-form');
  var typeSelect = form.elements.accountType;
  var jointFields = form.querySelectorAll('[data-joint]');
  var jointRows = document.querySelectorAll('[data-joint-row]');

  /* The second applicant is held to exactly the same rules as the first: the
     two entries below are the same functions, not copies of them. */
  var isFullName = function (v) { return v.trim().length >= 2; };
  var isEmail    = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); };

  var RULES = {
    name:  isFullName,
    email: isEmail,
    dob:   function (v) { return /^\d{2}\s*\/\s*\d{2}\s*\/\s*\d{4}$/.test(v.trim()); },
    jointName:  isFullName,
    jointEmail: isEmail
  };

  function isJoint(accountType) { return JOINT_TYPE.test(accountType); }

  /* Show or hide the second-applicant fields. Hidden fields are disabled too,
     so they are skipped by validation and never carry stale input forward. */
  function syncJointFields() {
    var on = isJoint(typeSelect.value);

    Array.prototype.forEach.call(jointFields, function (field) {
      var input = field.querySelector('input');
      field.hidden = !on;
      input.disabled = !on;
      if (!on) {
        input.value = '';
        field.classList.remove('has-error');
      }
    });

    form.classList.toggle('is-joint', on);

    return on;
  }

  typeSelect.addEventListener('change', function () {
    if (syncJointFields()) { form.elements.jointName.focus(); }
  });

  function validateField(input) {
    var rule = RULES[input.name];
    if (!rule || input.disabled) { return true; }
    var ok = rule(input.value);
    input.closest('.field').classList.toggle('has-error', !ok);
    return ok;
  }

  form.addEventListener('input', function (event) {
    var input = event.target;
    if (input.name === 'dob') { input.value = formatDob(input.value); }
    if (input.closest('.field').classList.contains('has-error')) { validateField(input); }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var inputs = form.querySelectorAll('input, select');
    var firstBad = null;

    Array.prototype.forEach.call(inputs, function (input) {
      if (!validateField(input) && !firstBad) { firstBad = input; }
    });

    if (firstBad) {
      firstBad.focus();
      toast('Check the highlighted fields');
      return;
    }

    state.name = form.elements.name.value.trim();
    state.email = form.elements.email.value.trim();
    state.dob = form.elements.dob.value.trim();
    state.accountType = form.elements.accountType.value;

    var joint = isJoint(state.accountType);
    state.jointName = joint ? form.elements.jointName.value.trim() : '';
    state.jointEmail = joint ? form.elements.jointEmail.value.trim() : '';

    show('review', 'forward');
  });

  function formatDob(raw) {
    var digits = raw.replace(/\D/g, '').slice(0, 8);
    var parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)];
    return parts.filter(function (p) { return p.length; }).join(' / ');
  }

  /* ------------------------------------------------------------ binding -- */

  function bind(key, value) {
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-bind="' + key + '"]'),
      function (el) { el.textContent = value; }
    );
  }

  function paintReview() {
    var joint = isJoint(state.accountType);

    bind('name', state.name || '—');
    bind('email', state.email || '—');
    bind('dob', state.dob || '—');
    bind('accountType', state.accountType);
    bind('jointName', state.jointName || '—');
    bind('jointEmail', state.jointEmail || '—');

    Array.prototype.forEach.call(jointRows, function (row) { row.hidden = !joint; });
  }

  function paintDone() {
    if (!state.account) { state.account = makeAccountNumber(); }
    bind('account', state.account);

    var firstName = state.name.split(/\s+/)[0];
    bind('welcome', firstName
      ? firstName + ', your digital card is ready to add to your wallet.'
      : 'Your digital card is ready to add to your wallet.');
  }

  function makeAccountNumber() {
    var block = function (n) {
      var out = '';
      for (var i = 0; i < n; i++) { out += Math.floor(Math.random() * 10); }
      return out;
    };
    return '032\u2011114 \u00b7 ' + block(4) + ' ' + block(4);
  }

  /* ------------------------------------------------------------- review -- */

  var consent = document.getElementById('f-consent');
  var consentBox = document.getElementById('consent');

  consent.addEventListener('change', function () {
    consentBox.classList.remove('has-error');
  });

  document.getElementById('confirm-btn').addEventListener('click', function () {
    if (!consent.checked) {
      consentBox.classList.add('has-error');
      toast('Please accept the terms to continue');
      return;
    }
    show('done', 'forward');
  });

  document.getElementById('wallet-btn').addEventListener('click', function () {
    toast('Card added to wallet');
  });

  /* -------------------------------------------------------------- toast -- */

  var toastEl = document.getElementById('toast');
  var toastTimer;

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2200);
  }

  /* -------------------------------------------------------------- reset -- */

  function reset() {
    form.reset();
    syncJointFields();
    Array.prototype.forEach.call(
      form.querySelectorAll('.field'),
      function (field) { field.classList.remove('has-error'); }
    );
    consent.checked = false;
    consentBox.classList.remove('has-error');
    state = {
      name: '', email: '', dob: '',
      accountType: 'Everyday Account',
      jointName: '', jointEmail: '',
      account: ''
    };
    show('welcome', 'back');
  }

  /* Presenter convenience: fill the form instantly so a 90-second run never
     stalls on typing. Press "d" anywhere outside a text field. */
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'd' || /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) { return; }
    form.elements.name.value = 'Jordan Blake';
    form.elements.email.value = 'jordan@example.com';
    form.elements.dob.value = '14 / 03 / 1991';
    if (isJoint(form.elements.accountType.value)) {
      form.elements.jointName.value = 'Sam Rivera';
      form.elements.jointEmail.value = 'sam@example.com';
    }
    toast('Demo details filled');
  });
})();
