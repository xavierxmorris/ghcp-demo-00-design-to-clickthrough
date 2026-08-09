/* ============================================================================
   Aurora — Everyday Account, click-through prototype
   BRD-2026-014 v1.1

   Traceability
     REQ-001  intro screen, account name + three headline benefits   screen 1
     REQ-002  start the application in a single action               screen 1
     REQ-003  capture name, email, date of birth, account type       screen 2
     REQ-004  block progression, say which field and why             screen 2
     REQ-005  review every entered value before submission           screen 3
     REQ-006  explicit PDS + TMD acceptance                          screen 3
     REQ-007  confirmation with BSB / account number + wallet        screen 4
     REQ-008  progress indicator and lossless back navigation        screens 2-4
     REQ-009  Joint Everyday Account: offer the type, capture the
              second applicant, show both on review                  screens 2-3
     BR-01    full name mandatory, at least two characters
     BR-02    email mandatory, structurally valid
     BR-03    date of birth mandatory, DD / MM / YYYY
     BR-04    no submission until the disclosure acceptance is given
     BR-05    nothing is transmitted or stored
     BR-06    on a joint account the second applicant's name and email are
              mandatory and validated to BR-01 / BR-02

   BR-05 is enforced by construction: there is no fetch, no XMLHttpRequest, no
   form action, no cookie, no localStorage and no sessionStorage anywhere in
   this file. Every value lives in the `state` object below, inside this
   closure, and dies with the browser tab.
   ========================================================================= */

(function () {
  'use strict';

  var TOTAL_STEPS = 4;

  /* REQ-009 — the one account type that pulls in a second applicant. */
  var JOINT_ACCOUNT = 'Joint Everyday Account';

  /* ------------------------------------------------------------- state --- */

  function blankState() {
    return {
      name: '',
      email: '',
      dob: '',
      account: 'Everyday Account',
      name2: '',
      email2: '',
      consent: false,
      bsb: '',
      number: ''
    };
  }

  var state = blankState();
  var current = 1;
  var showErrors = false;   /* only nag after the customer has tried to continue */

  /* ------------------------------------------------------------- lookup -- */

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  var screens   = $$('.screen');
  var stage     = $('.stage');
  var stageHead = $('.stage-head');
  var traceEl   = $('.trace');
  var traceStep = $('#trace-step');
  var traceName = $('#trace-name');
  var traceRefs = $('#trace-refs');
  var traceMode = $('#trace-mode');
  var live      = $('#live-region');

  var form      = $('#details-form');
  var inputs    = {
    name:    $('#f-name'),
    email:   $('#f-email'),
    dob:     $('#f-dob'),
    account: $('#f-account'),
    name2:   $('#f-name2'),
    email2:  $('#f-email2')
  };
  var jointGroup = $('#joint-group');
  var fieldStack = $('#details-form .field-stack');
  var consent   = $('#f-consent');
  var consentBlock = $('#consent-block');
  var toast     = $('#toast');

  /* --------------------------------------------------- business rules ---- */

  /* BR-02: structural check only. Deliberately permissive about the local
     part — the rule is "structurally valid", not "deliverable". */
  var EMAIL_RE = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
  var DOB_RE = /^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/;

  var validators = {
    /* BR-01 — mandatory, at least two characters. */
    name: function (value) {
      var v = value.trim();
      if (!v) { return 'Enter your full name.'; }
      if (v.length < 2) { return 'Your full name must be at least 2 characters.'; }
      return null;
    },

    /* BR-02 — mandatory, structurally valid address. */
    email: function (value) {
      var v = value.trim();
      if (!v) { return 'Enter your email address.'; }
      if (!EMAIL_RE.test(v)) { return 'Enter an email address like name@example.com.'; }
      return null;
    },

    /* BR-03 — mandatory, entered as DD / MM / YYYY. */
    dob: function (value) {
      var v = value.trim();
      if (!v) { return 'Enter your date of birth.'; }

      var parts = DOB_RE.exec(v);
      if (!parts) { return 'Enter your date of birth as DD / MM / YYYY.'; }

      var day = parseInt(parts[1], 10);
      var month = parseInt(parts[2], 10);
      var year = parseInt(parts[3], 10);

      if (month < 1 || month > 12) { return 'The month must be between 01 and 12.'; }
      if (day < 1) { return 'The day must be between 01 and 31.'; }

      var probe = new Date(year, month - 1, day);
      if (probe.getFullYear() !== year || probe.getMonth() !== month - 1 || probe.getDate() !== day) {
        return 'That date does not exist. Check the day and month.';
      }
      if (probe.getTime() > Date.now()) { return 'Your date of birth cannot be in the future.'; }
      if (year < 1900) { return 'Check the year — it should be 1900 or later.'; }
      return null;
    },

    /* BR-06 — the second applicant's name, held to the same bar as BR-01. */
    name2: function (value) {
      var v = value.trim();
      if (!v) { return 'Enter the second applicant\u2019s full name.'; }
      if (v.length < 2) { return 'Their full name must be at least 2 characters.'; }
      return null;
    },

    /* BR-06 — the second applicant's email, held to the same bar as BR-02. */
    email2: function (value) {
      var v = value.trim();
      if (!v) { return 'Enter the second applicant\u2019s email address.'; }
      if (!EMAIL_RE.test(v)) { return 'Enter their email address like name@example.com.'; }
      return null;
    }
  };

  var APPLICANT_FIELDS = ['name', 'email', 'dob'];
  var JOINT_FIELDS = ['name2', 'email2'];
  var ALL_FIELDS = APPLICANT_FIELDS.concat(JOINT_FIELDS);

  /* REQ-009 — a second applicant is only ever part of a joint account. */
  function isJoint() { return state.account === JOINT_ACCOUNT; }

  /* REQ-009 / BR-06 — the joint fields are mandatory when, and only when,
     the joint account type is the one selected. */
  function requiredFields() {
    return isJoint() ? ALL_FIELDS : APPLICANT_FIELDS;
  }

  /* ------------------------------------------------------- field errors -- */

  function errorEl(field) { return document.getElementById('e-' + field); }
  function fieldEl(field) { return document.querySelector('.field[data-field="' + field + '"]'); }

  function setFieldError(field, message) {
    var wrap = fieldEl(field);
    var err = errorEl(field);
    if (!wrap || !err) { return; }

    if (message) {
      err.textContent = message;
      err.hidden = false;
      wrap.classList.add('is-invalid');
      inputs[field].setAttribute('aria-invalid', 'true');
    } else {
      err.textContent = '';
      err.hidden = true;
      wrap.classList.remove('is-invalid');
      inputs[field].removeAttribute('aria-invalid');
    }
    syncStackFade();          /* a message appearing changes what fits */
  }

  function setConsentError(message) {
    var err = $('#e-consent');
    if (message) {
      err.textContent = message;
      err.hidden = false;
      consentBlock.classList.add('is-invalid');
      consent.setAttribute('aria-invalid', 'true');
    } else {
      err.textContent = '';
      err.hidden = true;
      consentBlock.classList.remove('is-invalid');
      consent.removeAttribute('aria-invalid');
    }
  }

  function clearAllErrors() {
    ALL_FIELDS.forEach(function (f) { setFieldError(f, null); });
    setConsentError(null);
  }

  /* REQ-009 — reveal or retire the second applicant as the account type
     changes. Nothing is asked for on any other account type, and any message
     left over from a joint selection is retired with the fields. */
  function syncJointVisibility() {
    var joint = isJoint();
    if (jointGroup.hidden === !joint) { return; }
    jointGroup.hidden = !joint;
    /* Six fields no longer fit the fixed frame, so the stack scrolls while,
       and only while, the second applicant is being asked for. */
    fieldStack.classList.toggle('is-scrollable', joint);
    if (joint) {
      revealJointGroup();
    } else {
      JOINT_FIELDS.forEach(function (f) { setFieldError(f, null); });
      fieldStack.scrollTop = 0;
    }
    syncStackFade();
  }

  /* Choosing a joint account asks two new questions. Bring them into view
     rather than leaving them below the fold for the customer to find. */
  function revealJointGroup() {
    window.requestAnimationFrame(function () {
      var room = fieldStack.scrollHeight - fieldStack.clientHeight;
      if (room <= 0) { return; }
      var reduce = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      try {
        fieldStack.scrollTo({ top: room, behavior: reduce ? 'auto' : 'smooth' });
      } catch (e) {
        fieldStack.scrollTop = room;
      }
      syncStackFade();
    });
  }

  /* Soften whichever edge has content beyond it, so it is obvious there is
     more of the form than the frame can show. */
  function syncStackFade() {
    var scrollable = fieldStack.classList.contains('is-scrollable');
    var room = fieldStack.scrollHeight - fieldStack.clientHeight;
    fieldStack.classList.toggle('has-above', scrollable && fieldStack.scrollTop > 2);
    fieldStack.classList.toggle('has-below', scrollable && fieldStack.scrollTop < room - 2);
  }

  fieldStack.addEventListener('scroll', syncStackFade);

  /* REQ-004 — refuse to progress, and say which field is at fault and why. */
  function validateDetails() {
    var failures = [];
    requiredFields().forEach(function (field) {
      var message = validators[field](state[field]);
      setFieldError(field, message);
      if (message) { failures.push(field); }
    });
    return failures;
  }

  function shake(el) {
    if (!el) { return; }
    el.classList.remove('is-shake');
    void el.offsetWidth;              /* force reflow so the animation replays */
    el.classList.add('is-shake');
  }

  /* -------------------------------------------------------- form wiring -- */

  function readInputs() {
    state.name = inputs.name.value;
    state.email = inputs.email.value;
    state.dob = inputs.dob.value;
    state.account = inputs.account.value;
    state.name2 = inputs.name2.value;
    state.email2 = inputs.email2.value;
  }

  /* REQ-008 — coming back to this step must not lose anything. */
  function restoreInputs() {
    inputs.name.value = state.name;
    inputs.email.value = state.email;
    inputs.dob.value = state.dob;
    inputs.account.value = state.account;
    inputs.name2.value = state.name2;
    inputs.email2.value = state.email2;
    consent.checked = state.consent;
    syncJointVisibility();
  }

  /* BR-03 — nudge the typed value into DD / MM / YYYY as it is entered. */
  function maskDob() {
    var el = inputs.dob;
    var atEnd = el.selectionStart === null || el.selectionStart === el.value.length;
    var digits = el.value.replace(/\D/g, '').slice(0, 8);
    var out = digits.slice(0, 2);
    if (digits.length > 2) { out += ' / ' + digits.slice(2, 4); }
    if (digits.length > 4) { out += ' / ' + digits.slice(4, 8); }

    if (atEnd && out !== el.value) {
      el.value = out;
      try { el.setSelectionRange(out.length, out.length); } catch (e) { /* not selectable */ }
    }
  }

  ALL_FIELDS.concat(['account']).forEach(function (field) {
    var el = inputs[field];
    var handler = function () {
      if (field === 'dob') { maskDob(); }
      readInputs();
      if (field === 'account') { syncJointVisibility(); }
      if (showErrors && validators[field]) {
        setFieldError(field, validators[field](state[field]));
      }
    };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();          /* BR-05 — nothing is ever posted anywhere */
    readInputs();
    showErrors = true;

    var failures = validateDetails();
    if (failures.length) {
      var first = failures[0];
      var wrap = fieldEl(first);
      shake(wrap);
      /* REQ-004 — the fault has to be visible, even if it is below the fold
         once the second applicant is on screen. */
      if (wrap && typeof wrap.scrollIntoView === 'function') {
        wrap.scrollIntoView({ block: 'nearest' });
      }
      inputs[first].focus();
      announce(failures.length === 1
        ? 'One field needs your attention.'
        : failures.length + ' fields need your attention.');
      return;
    }
    goTo(3);
  });

  consent.addEventListener('change', function () {
    state.consent = consent.checked;
    if (consent.checked) { setConsentError(null); }
  });

  /* ------------------------------------------------------------- review -- */

  /* REQ-005 — play back exactly what the customer typed, never sample data.
     REQ-009 — on a joint account that means both applicants. */
  function renderReview() {
    var joint = isJoint();

    $('#r-name').textContent = state.name.trim();
    $('#r-email').textContent = state.email.trim();
    $('#r-dob').textContent = state.dob.trim();
    $('#r-account').textContent = state.account;

    $('#r-name2').textContent = joint ? state.name2.trim() : '';
    $('#r-email2').textContent = joint ? state.email2.trim() : '';
    $('#row-name2').hidden = !joint;
    $('#row-email2').hidden = !joint;
  }

  /* ------------------------------------------------------- confirmation -- */

  function makeAccountNumber() {
    var digits = '';
    for (var i = 0; i < 8; i += 1) {
      digits += Math.floor(Math.random() * 10);
    }
    return {
      bsb: '032\u2011114',
      number: digits.slice(0, 4) + ' ' + digits.slice(4)
    };
  }

  /* REQ-007 — new BSB and account number on the confirmation screen. */
  function renderConfirmation() {
    var generated = makeAccountNumber();
    state.bsb = generated.bsb;
    state.number = generated.number;

    $('#r-account-number').textContent = state.bsb + ' \u00b7 ' + state.number;

    var firstName = state.name.trim().split(/\s+/)[0];
    $('#done-lede').textContent =
      'Your ' + state.account + ' is open, ' + firstName +
      '. Your digital card is ready to add to your wallet.';
  }

  $('#confirm-btn').addEventListener('click', function () {
    /* BR-04 — the disclosure acceptance gates submission. */
    if (!consent.checked) {
      state.consent = false;
      setConsentError('You need to accept the Product Disclosure Statement and Target Market Determination before we can open your account.');
      shake(consentBlock);
      consent.focus();
      announce('You need to accept the Product Disclosure Statement and Target Market Determination.');
      return;
    }
    state.consent = true;
    setConsentError(null);
    renderConfirmation();
    goTo(4);
  });

  var toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.hidden = true; }, 3200);
  }

  $('#wallet-btn').addEventListener('click', function () {
    showToast('Digital card added to your Aurora wallet.');
  });

  $('#home-btn').addEventListener('click', function () {
    resetJourney();
  });

  function resetJourney() {
    state = blankState();
    showErrors = false;
    clearAllErrors();
    restoreInputs();
    toast.hidden = true;
    goTo(1);
  }

  /* --------------------------------------------------------- navigation -- */

  $$('[data-go]').forEach(function (el) {
    el.addEventListener('click', function () { goTo(parseInt(el.dataset.go, 10)); });
  });

  /* REQ-008 — back, with everything still filled in. */
  $$('[data-back]').forEach(function (el) {
    el.addEventListener('click', function () { goTo(parseInt(el.dataset.back, 10)); });
  });

  function goTo(step) {
    if (step === 2) { restoreInputs(); }
    if (step === 3) { renderReview(); }

    current = step;
    screens.forEach(function (section) {
      var isTarget = parseInt(section.dataset.screen, 10) === step;
      section.hidden = !isTarget;
      section.classList.toggle('is-active', isTarget);
    });

    var active = activeScreen();
    if (step === 2) {
      fieldStack.scrollTop = 0;    /* the form always opens at its first field */
    }
    syncStackFade();
    updateTrace(active);
    applyFit();
    announce('Screen ' + step + ' of ' + TOTAL_STEPS + ', ' + active.dataset.name + '.');

    /* Focus the heading, not the first input: it announces the step to screen
       readers and keeps the mobile keyboard down until the customer taps. */
    window.setTimeout(function () {
      var target = active.querySelector('[data-focus]');
      if (target && typeof target.focus === 'function') {
        try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
      }
    }, 30);
  }

  function activeScreen() {
    return screens.filter(function (s) { return !s.hidden; })[0] || screens[0];
  }

  /* ------------------------------------------- traceability to the BRD --- */

  function updateTrace(section) {
    var refs = (section.getAttribute('data-req') || '')
      .split(',')
      .map(function (r) { return r.trim(); })
      .filter(Boolean);

    traceStep.textContent = 'Screen ' + section.dataset.screen + ' of ' + TOTAL_STEPS;
    traceName.textContent = section.dataset.name;

    traceRefs.textContent = '';
    refs.forEach(function (ref) {
      var chip = document.createElement('span');
      chip.className = 'ref' + (ref.indexOf('BR-') === 0 ? ' is-rule' : '');
      chip.textContent = ref;
      traceRefs.appendChild(chip);
    });
  }

  traceMode.addEventListener('change', function () {
    document.body.classList.toggle('trace-on', traceMode.checked);
    applyFit();
  });

  function announce(message) {
    live.textContent = message;
  }

  /* ------------------------------------------------------------ fitting -- */

  /* Keep the design system's own frame size whole on any window, without a
     scrollbar. Dimensions come from --frame-w / --frame-h in screens.css. */
  function applyFit() {
    var root = window.getComputedStyle(document.documentElement);
    var frameW = parseFloat(root.getPropertyValue('--frame-w')) || 390;
    var frameH = parseFloat(root.getPropertyValue('--frame-h')) || 844;

    var styles = window.getComputedStyle(stage);
    var padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    var gap = (parseFloat(styles.rowGap) || 20) * 2;
    var chrome = stageHead.offsetHeight + traceEl.offsetHeight + padding + gap + 6;

    var byHeight = (window.innerHeight - chrome) / frameH;
    var byWidth = (window.innerWidth - 56) / frameW;
    var fit = Math.min(1, byHeight, byWidth);
    if (!isFinite(fit) || fit < 0.42) { fit = 0.42; }

    document.documentElement.style.setProperty('--fit', (Math.floor(fit * 1000) / 1000).toString());
  }

  var fitTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(fitTimer);
    fitTimer = window.setTimeout(applyFit, 80);
  });

  /* ------------------------------------------------- presenter shortcut -- */

  /* Press "d" on the details screen to fill it in — for live demos only. */
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'd' && event.key !== 'D') { return; }
    if (event.metaKey || event.ctrlKey || event.altKey) { return; }
    if (current !== 2) { return; }

    var tag = (event.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') { return; }

    event.preventDefault();
    inputs.name.value = 'Jordan Blake';
    inputs.email.value = 'jordan@example.com';
    inputs.dob.value = '14 / 03 / 1991';
    if (isJoint()) {                      /* REQ-009 — the joint pair as well */
      inputs.name2.value = 'Sam Okafor';
      inputs.email2.value = 'sam@example.com';
    }
    readInputs();
    clearAllErrors();
    announce('Demo details filled in.');
  });

  /* --------------------------------------------------------------- boot -- */

  /* Browsers restore form values on a soft reload, so read them back before
     deciding whether the second applicant (REQ-009) belongs on screen. */
  readInputs();
  syncJointVisibility();
  applyFit();
  updateTrace(activeScreen());
})();
