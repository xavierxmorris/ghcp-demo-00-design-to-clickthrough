/* ============================================================================
   Terravale Field - hazard and safety observation reporting
   Click-through prototype for BRD-2026-031 v1.1.

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
  var riskForm    = document.getElementById('risk-form');

  // REQ-009 / BR-06 - the risk rating and the escalation it can trigger
  var riskInputs  = Array.prototype.slice.call(document.querySelectorAll('input[name="risk"]'));
  var riskWrap    = document.querySelector('.field-risk');
  var riskErr     = document.getElementById('e-risk');
  var riskAlert   = document.getElementById('risk-alert');
  var escalation  = document.getElementById('escalation');
  var sumRisk     = document.getElementById('sum-risk');
  var sumEscalation = document.getElementById('sum-escalation');

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
  var reviewScroll = document.querySelector('.review-scroll');

  var current = document.querySelector('.screen.is-active') || screens[0];
  var started = false;

  // --------------------------------------------- fields and business rules --
  // REQ-003 and REQ-009 define what is captured. BR-01 to BR-03 and BR-06
  // define what is valid. Each message names the field and says why it was
  // refused (REQ-004).

  var ORDER = ['name', 'email', 'date', 'category'];

  // BR-06 holds the supervisor's details to the same standard as the
  // reporter's own, so both sets are checked by the same two rules.
  var SUPERVISOR = ['supName', 'supEmail'];

  var EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // BR-01 - mandatory, at least two characters
  function nameRule(missing, tooShort) {
    return function (value) {
      var v = value.trim();
      if (!v) { return missing; }
      if (v.length < 2) { return tooShort; }
      return '';
    };
  }

  // BR-02 - mandatory, structurally valid address
  function emailRule(missing, malformed) {
    return function (value) {
      var v = value.trim();
      if (!v) { return missing; }
      if (!EMAIL_SHAPE.test(v)) { return malformed; }
      return '';
    };
  }

  var FIELDS = {
    name: {
      input: document.getElementById('f-name'),
      err: document.getElementById('e-name'),
      summary: document.getElementById('sum-name'),
      validate: nameRule(
        'Enter the reporter name. This field is required.',
        'Reporter name must be at least 2 characters.'
      )
    },

    email: {
      input: document.getElementById('f-email'),
      err: document.getElementById('e-email'),
      summary: document.getElementById('sum-email'),
      validate: emailRule(
        'Enter a contact email address. This field is required.',
        'Enter a valid email address, for example jordan.kelly@terravale.com.au'
      )
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
    },

    // REQ-009 / BR-06 - requested and checked only for a High potential rating
    supName: {
      input: document.getElementById('f-sup-name'),
      err: document.getElementById('e-sup-name'),
      summary: document.getElementById('sum-sup-name'),
      validate: nameRule(
        'Enter the name of the supervisor you notified. This field is required.',
        'Supervisor name must be at least 2 characters.'
      )
    },

    supEmail: {
      input: document.getElementById('f-sup-email'),
      err: document.getElementById('e-sup-email'),
      summary: document.getElementById('sum-sup-email'),
      validate: emailRule(
        'Enter the supervisor\u2019s contact email. This field is required.',
        'Enter a valid email address for the supervisor, for example priya.raman@terravale.com.au'
      )
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
  // slot, so the error messages never push the form out of the frame. Each step
  // that can refuse input gets its own counter.
  function alertSetter(boxId, textId, metaId) {
    var box = document.getElementById(boxId);
    var text = document.getElementById(textId);
    var meta = document.getElementById(metaId);

    return function (count) {
      if (!count) {
        box.hidden = true;
        meta.hidden = false;
        return;
      }
      text.textContent = count === 1
        ? '1 field needs your attention.'
        : count + ' fields need your attention.';
      box.hidden = false;
      meta.hidden = true;
    };
  }

  var setAlert     = alertSetter('details-alert', 'details-alert-text', 'details-meta');
  var setRiskAlert = alertSetter('risk-alert', 'risk-alert-text', 'risk-meta');

  // ------------------------------------ REQ-009: the risk rating itself -----

  function selectedRisk() {
    for (var i = 0; i < riskInputs.length; i++) {
      if (riskInputs[i].checked) { return riskInputs[i].value; }
    }
    return '';
  }

  function isHighPotential() { return selectedRisk() === 'High potential'; }

  function setRiskError(message) {
    riskWrap.classList.toggle('is-invalid', Boolean(message));
    riskErr.textContent = message || '';
    riskInputs.forEach(function (input) {
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    });
  }

  function checkRisk() {
    var message = selectedRisk()
      ? ''
      : 'Select a risk rating. This tells the supervisor how serious it was.';
    setRiskError(message);
    return message;
  }

  function syncRiskSelection() {
    riskInputs.forEach(function (input) {
      var option = input.closest('.risk-option');
      if (option) { option.classList.toggle('is-selected', input.checked); }
    });
  }

  // REQ-009: supervisor details are requested for High potential and for no
  // other rating. What was typed is left in the fields so a mis-tap on the
  // rating costs the reporter nothing (REQ-008), but while the block is hidden
  // those values are neither checked nor carried onto the review screen.
  function syncEscalation() {
    var high = isHighPotential();
    escalation.hidden = !high;
    if (!high) {
      SUPERVISOR.forEach(function (key) { setFieldError(key, ''); });
    }
  }

  function visibleRiskFaults() {
    var count = riskWrap.classList.contains('is-invalid') ? 1 : 0;
    if (isHighPotential()) {
      SUPERVISOR.forEach(function (key) {
        if (wrapOf(key).classList.contains('is-invalid')) { count += 1; }
      });
    }
    return count;
  }

  function clearAllErrors() {
    ORDER.concat(SUPERVISOR).forEach(function (key) { setFieldError(key, ''); });
    setRiskError('');
    setAlert(0);
    setRiskAlert(0);
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

    var scroller = next.querySelector('#hazard-form, #risk-form, .review-scroll');
    if (scroller) { scroller.scrollTop = 0; }
    syncReviewFade();

    if (started) {
      var heading = next.querySelector('[tabindex="-1"]');
      if (heading) { heading.focus({ preventScroll: true }); }
    }
    started = true;
  }

  function scrollIntoViewSafely(element) {
    if (!element) { return; }
    var wrap = (element.closest && element.closest('.field')) || element;
    try { wrap.scrollIntoView({ block: 'nearest' }); } catch (e) { wrap.scrollIntoView(); }
  }

  // An escalated report is taller than the review area, so the declaration can
  // start below the fold. The fade says so, and retires once it is reached.
  function syncReviewFade() {
    var left = reviewScroll.scrollHeight - reviewScroll.clientHeight - reviewScroll.scrollTop;
    reviewScroll.classList.toggle('has-more', left > 4);
  }

  reviewScroll.addEventListener('scroll', syncReviewFade);

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

  ORDER.concat(SUPERVISOR).forEach(function (key) {
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

  // REQ-009: choosing a rating reveals or withdraws the escalation block
  riskInputs.forEach(function (input) {
    input.addEventListener('change', function () {
      syncRiskSelection();
      if (riskWrap.classList.contains('is-invalid')) { checkRisk(); }
      syncEscalation();
      if (!riskAlert.hidden) { setRiskAlert(visibleRiskFaults()); }
    });
  });

  // ------------------------------------------------- REQ-004: refuse to go --

  function continueToRisk() {
    var failed = [];
    ORDER.forEach(function (key) {
      if (checkField(key)) { failed.push(key); }
    });

    if (failed.length) {
      setAlert(failed.length);
      scrollIntoViewSafely(FIELDS[failed[0]].input);
      FIELDS[failed[0]].input.focus();
      return;
    }

    setAlert(0);
    show('risk');
  }

  // REQ-004 again, this time over REQ-009 and BR-06
  function continueToReview() {
    var failures = 0;
    var first = null;

    if (checkRisk()) {
      failures += 1;
      first = riskInputs[0];
    }

    if (isHighPotential()) {
      SUPERVISOR.forEach(function (key) {
        if (checkField(key)) {
          failures += 1;
          if (!first) { first = FIELDS[key].input; }
        }
      });
    }

    if (failures) {
      setRiskAlert(failures);
      scrollIntoViewSafely(first);
      first.focus();
      return;
    }

    setRiskAlert(0);
    fillReview();
    show('review');
  }

  // ----------------------------------- REQ-005: show what was actually typed --

  function fillReview() {
    FIELDS.name.summary.textContent = FIELDS.name.input.value.trim();
    FIELDS.email.summary.textContent = FIELDS.email.input.value.trim();
    FIELDS.date.summary.textContent = FIELDS.date.input.value.trim();
    FIELDS.category.summary.textContent = FIELDS.category.input.value;

    // REQ-009: the rating every time, the supervisor only where it was asked for
    var rating = selectedRisk();
    while (sumRisk.firstChild) { sumRisk.removeChild(sumRisk.firstChild); }
    var pill = document.createElement('span');
    pill.className = 'risk-pill';
    pill.setAttribute('data-level', rating);
    pill.textContent = rating;
    sumRisk.appendChild(pill);

    var high = rating === 'High potential';
    sumEscalation.hidden = !high;
    FIELDS.supName.summary.textContent = high ? FIELDS.supName.input.value.trim() : '';
    FIELDS.supEmail.summary.textContent = high ? FIELDS.supEmail.input.value.trim() : '';
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

  document.getElementById('btn-continue').addEventListener('click', continueToRisk);
  document.getElementById('btn-risk-continue').addEventListener('click', continueToReview);

  form.addEventListener('submit', function (event) {
    event.preventDefault();                                 // BR-05: never posts
    continueToRisk();
  });

  riskForm.addEventListener('submit', function (event) {
    event.preventDefault();                                 // BR-05: never posts
    continueToReview();
  });

  document.getElementById('btn-restart').addEventListener('click', function () {
    form.reset();
    riskForm.reset();
    syncRiskSelection();
    syncEscalation();
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

    if (current.id === 'screen-details') {
      FIELDS.name.input.value = 'Jordan Kelly';
      FIELDS.email.input.value = 'jordan.kelly@terravale.com.au';
      FIELDS.date.input.value = todayAsDdMmYyyy();
      FIELDS.category.input.value = 'Vehicle and mobile plant';
      clearAllErrors();
      return;
    }

    // REQ-009: the escalation path is the one worth walking through, so the
    // helper picks High potential and names a supervisor.
    if (current.id === 'screen-risk') {
      document.getElementById('f-risk-high').checked = true;
      syncRiskSelection();
      syncEscalation();
      FIELDS.supName.input.value = 'Priya Raman';
      FIELDS.supEmail.input.value = 'priya.raman@terravale.com.au';
      clearAllErrors();
    }
  });

  // --------------------------------------------------------------- startup --

  setSubmitState();
  syncRiskSelection();
  syncEscalation();
  updateTrace(current);
}());
