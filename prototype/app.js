/* ============================================================================
   Terravale Field - hazard and safety observation reporting
   Click-through prototype for BRD-2026-031 v1.0.

   BR-05: nothing here transmits or stores anything. There is no fetch, no
   XMLHttpRequest, no localStorage, no sessionStorage and no cookie. Entered
   values live in the DOM for the length of the visit and nowhere else.
   ========================================================================= */

(function () {
  'use strict';

  // ------------------------------------------------------------- elements --

  var body        = document.body;
  var screens     = Array.prototype.slice.call(document.querySelectorAll('.screen'));
  var form        = document.getElementById('hazard-form');
  var alertBox    = document.getElementById('details-alert');
  var alertText   = document.getElementById('details-alert-text');
  var detailsMeta = document.getElementById('details-meta');

  var declare      = document.getElementById('f-declare');
  var consentBlock = document.getElementById('consent-block');
  var declareErr   = document.getElementById('e-declare');
  var submitBtn    = document.getElementById('btn-submit');

  var refOut       = document.getElementById('hazard-ref');
  var notifyBtn    = document.getElementById('btn-notify');
  var notifyStatus = document.getElementById('notify-status');

  var traceScreen = document.getElementById('trace-screen');
  var traceChips  = document.getElementById('trace-chips');
  var toggleRefs  = document.getElementById('toggle-refs');

  var current = document.querySelector('.screen.is-active') || screens[0];
  var started = false;

  // --------------------------------------------- fields and business rules --
  // REQ-003 defines what is captured. BR-01 to BR-03 define what is valid.
  // Each message names the field and says why it was refused (REQ-004).

  var ORDER = ['name', 'email', 'date', 'category'];

  var FIELDS = {
    name: {
      input: document.getElementById('f-name'),
      err: document.getElementById('e-name'),
      summary: document.getElementById('sum-name'),
      // BR-01 - mandatory, at least two characters
      validate: function (value) {
        var v = value.trim();
        if (!v) { return 'Enter the reporter name. This field is required.'; }
        if (v.length < 2) { return 'Reporter name must be at least 2 characters.'; }
        return '';
      }
    },

    email: {
      input: document.getElementById('f-email'),
      err: document.getElementById('e-email'),
      summary: document.getElementById('sum-email'),
      // BR-02 - mandatory, structurally valid address
      validate: function (value) {
        var v = value.trim();
        if (!v) { return 'Enter a contact email address. This field is required.'; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
          return 'Enter a valid email address, for example jordan.kelly@terravale.com.au';
        }
        return '';
      }
    },

    date: {
      input: document.getElementById('f-date'),
      err: document.getElementById('e-date'),
      summary: document.getElementById('sum-date'),
      // BR-03 - mandatory, entered as DD / MM / YYYY
      validate: function (value) {
        var v = value.trim();
        if (!v) { return 'Enter the date you observed the hazard. This field is required.'; }

        var parts = /^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/.exec(v);
        if (!parts) { return 'Enter the date observed as DD / MM / YYYY.'; }

        var day = Number(parts[1]);
        var month = Number(parts[2]);
        var year = Number(parts[3]);

        if (month < 1 || month > 12) {
          return 'That date does not exist. The month must be between 01 and 12.';
        }
        var daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) {
          return 'That date does not exist. That month has ' + daysInMonth + ' days.';
        }
        return '';
      }
    },

    category: {
      input: document.getElementById('f-category'),
      err: document.getElementById('e-category'),
      summary: document.getElementById('sum-category'),
      // REQ-003 - one of the five listed categories
      validate: function (value) {
        if (!value) { return 'Select the hazard category that best fits what you saw.'; }
        return '';
      }
    }
  };

  function wrapOf(key) { return FIELDS[key].input.closest('.field'); }

  function setFieldError(key, message) {
    var field = FIELDS[key];
    var wrap = wrapOf(key);
    if (wrap) { wrap.classList.toggle('is-invalid', Boolean(message)); }
    field.err.textContent = message || '';
    field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function checkField(key) {
    var message = FIELDS[key].validate(FIELDS[key].input.value);
    setFieldError(key, message);
    return message;
  }

  // The summary and the standing "every field is required" line occupy the same
  // slot, so the four error messages never push the form out of the frame.
  function setAlert(count) {
    if (!count) {
      alertBox.hidden = true;
      detailsMeta.hidden = false;
      return;
    }
    alertText.textContent = count === 1
      ? '1 field needs your attention.'
      : count + ' fields need your attention.';
    alertBox.hidden = false;
    detailsMeta.hidden = true;
  }

  function clearAllErrors() {
    ORDER.forEach(function (key) { setFieldError(key, ''); });
    setAlert(0);
  }

  // ------------------------------------------------- screens and the trace --

  function updateTrace(section) {
    var refs = (section.getAttribute('data-req') || '')
      .split(',')
      .map(function (ref) { return ref.trim(); })
      .filter(Boolean);

    traceScreen.textContent = 'Screen ' + section.getAttribute('data-screen') +
                              ' of ' + screens.length;

    while (traceChips.firstChild) { traceChips.removeChild(traceChips.firstChild); }
    refs.forEach(function (ref) {
      var chip = document.createElement('span');
      chip.className = 'trace-chip ' + (ref.indexOf('REQ') === 0 ? 'is-req' : 'is-br');
      chip.textContent = ref;
      traceChips.appendChild(chip);
    });
  }

  function show(name) {
    var next = document.getElementById('screen-' + name);
    if (!next) { return; }

    screens.forEach(function (section) {
      section.classList.toggle('is-active', section === next);
    });
    current = next;
    updateTrace(next);

    var scroller = next.querySelector('#hazard-form, .review-scroll');
    if (scroller) { scroller.scrollTop = 0; }

    if (started) {
      var heading = next.querySelector('[tabindex="-1"]');
      if (heading) { heading.focus({ preventScroll: true }); }
    }
    started = true;
  }

  function scrollFieldIntoView(key) {
    var wrap = wrapOf(key);
    if (!wrap) { return; }
    try { wrap.scrollIntoView({ block: 'nearest' }); } catch (e) { wrap.scrollIntoView(); }
  }

  // ------------------------------------------------------------ date entry --
  // BR-03 asks for DD / MM / YYYY, so the field formats itself as it is typed.

  function maskDate(raw) {
    var digits = String(raw).replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) { return digits; }
    if (digits.length <= 4) { return digits.slice(0, 2) + ' / ' + digits.slice(2); }
    return digits.slice(0, 2) + ' / ' + digits.slice(2, 4) + ' / ' + digits.slice(4);
  }

  function todayAsDdMmYyyy() {
    var now = new Date();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return pad(now.getDate()) + ' / ' + pad(now.getMonth() + 1) + ' / ' + now.getFullYear();
  }

  FIELDS.date.input.addEventListener('input', function () {
    var input = FIELDS.date.input;
    var atEnd = input.selectionStart === null || input.selectionStart === input.value.length;
    if (!atEnd) { return; }

    var masked = maskDate(input.value);
    if (masked !== input.value) {
      input.value = masked;
      try { input.setSelectionRange(masked.length, masked.length); } catch (e) { /* no-op */ }
    }
  });

  document.getElementById('btn-today').addEventListener('click', function () {
    FIELDS.date.input.value = todayAsDdMmYyyy();
    checkField('date');
    FIELDS.date.input.focus();
  });

  // ------------------------------------------------------- live validation --

  ORDER.forEach(function (key) {
    var field = FIELDS[key];

    // clear a visible error the moment the reporter fixes it
    field.input.addEventListener('input', function () {
      if (wrapOf(key).classList.contains('is-invalid')) { checkField(key); }
    });
    field.input.addEventListener('change', function () {
      if (wrapOf(key).classList.contains('is-invalid')) { checkField(key); }
    });
    // and check on leaving a field the reporter has actually used
    field.input.addEventListener('blur', function () {
      if (field.input.value.trim() !== '') { checkField(key); }
    });
  });

  // ------------------------------------------------- REQ-004: refuse to go --

  function continueToReview() {
    var failed = [];
    ORDER.forEach(function (key) {
      if (checkField(key)) { failed.push(key); }
    });

    if (failed.length) {
      setAlert(failed.length);
      scrollFieldIntoView(failed[0]);
      FIELDS[failed[0]].input.focus();
      return;
    }

    setAlert(0);
    fillReview();
    show('review');
  }

  // ----------------------------------- REQ-005: show what was actually typed --

  function fillReview() {
    FIELDS.name.summary.textContent = FIELDS.name.input.value.trim();
    FIELDS.email.summary.textContent = FIELDS.email.input.value.trim();
    FIELDS.date.summary.textContent = FIELDS.date.input.value.trim();
    FIELDS.category.summary.textContent = FIELDS.category.input.value;
  }

  // ------------------------------------- REQ-006 / BR-04: the declaration ----

  function setSubmitState() {
    var confirmed = declare.checked;
    // BR-04 blocks submission, but the control stays operable and focusable so
    // it can say why. aria-disabled would hide that explanation from anyone
    // using a screen reader, so the state is carried on data-blocked instead.
    submitBtn.classList.toggle('is-blocked', !confirmed);
    submitBtn.setAttribute('data-blocked', confirmed ? 'false' : 'true');
    if (confirmed) {
      consentBlock.classList.remove('is-invalid');
      declareErr.textContent = '';
      declareErr.classList.remove('is-shown');
    }
  }

  declare.addEventListener('change', setSubmitState);

  function refuseSubmission() {
    declareErr.textContent = 'Confirm the declaration above before you submit this report.';
    declareErr.classList.add('is-shown');
    consentBlock.classList.remove('is-invalid');
    void consentBlock.offsetWidth;           // restart the nudge
    consentBlock.classList.add('is-invalid');
    try { consentBlock.scrollIntoView({ block: 'nearest' }); } catch (e) { /* no-op */ }
    declare.focus();
  }

  // ---------------------------------------------- REQ-007: the confirmation --

  function newHazardReference() {
    var serial = String(Math.floor(Math.random() * 90000) + 10000);
    return 'HZ-' + new Date().getFullYear() + '-' + serial;
  }

  function resetNotify() {
    notifyBtn.disabled = false;
    notifyBtn.classList.remove('is-blocked');
    notifyBtn.textContent = 'Notify shift supervisor';
    notifyStatus.textContent = '';
  }

  submitBtn.addEventListener('click', function () {
    if (!declare.checked) { refuseSubmission(); return; }   // BR-04

    refOut.textContent = newHazardReference();
    resetNotify();
    show('done');
  });

  notifyBtn.addEventListener('click', function () {
    if (notifyBtn.disabled) { return; }
    notifyBtn.disabled = true;
    notifyBtn.classList.add('is-blocked');
    notifyBtn.textContent = 'Shift supervisor notified';
    notifyStatus.textContent =
      '\u2713 Sent to the Pit 4 shift supervisor. Simulated for this prototype - nothing leaves this device.';
  });

  // ------------------------------------------------------------- wiring up --

  document.getElementById('btn-start').addEventListener('click', function () {
    show('details');                                        // REQ-002
  });

  // REQ-008: back to a previous step. Nothing is reset, so nothing is lost.
  Array.prototype.forEach.call(document.querySelectorAll('[data-goto]'), function (button) {
    button.addEventListener('click', function () {
      show(button.getAttribute('data-goto'));
    });
  });

  document.getElementById('btn-continue').addEventListener('click', continueToReview);

  form.addEventListener('submit', function (event) {
    event.preventDefault();                                 // BR-05: never posts
    continueToReview();
  });

  document.getElementById('btn-restart').addEventListener('click', function () {
    form.reset();
    clearAllErrors();
    declare.checked = false;
    setSubmitState();
    resetNotify();
    show('intro');
  });

  // ------------------------------------------ the requirement-label toggle --

  toggleRefs.addEventListener('change', function () {
    body.classList.toggle('show-refs', toggleRefs.checked);
  });

  // ------------------------------------------------------ presenter helper --
  // "d" fills the form so a walkthrough does not depend on typing with gloves
  // on. Ignored while a form control has focus, so it never eats a keystroke.

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'd' && event.key !== 'D') { return; }
    if (event.ctrlKey || event.metaKey || event.altKey) { return; }

    var target = event.target;
    if (target && (target.isContentEditable ||
        /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName || ''))) { return; }

    if (current.id === 'screen-intro') { show('details'); }
    if (current.id !== 'screen-details') { return; }

    FIELDS.name.input.value = 'Jordan Kelly';
    FIELDS.email.input.value = 'jordan.kelly@terravale.com.au';
    FIELDS.date.input.value = todayAsDdMmYyyy();
    FIELDS.category.input.value = 'Vehicle and mobile plant';
    clearAllErrors();
  });

  // --------------------------------------------------------------- startup --

  setSubmitState();
  updateTrace(current);
}());
