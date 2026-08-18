/* =========================================================
   STACKLY — auth.js
   Shared behaviour for login.html and signup.html:
   role toggle (Customer / Admin), password visibility,
   confirm-password check, and a fake submit-loading state.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Role toggle (Customer / Admin) ---------- */
  const roleBtns = document.querySelectorAll('.au-role-btn');
  const roleIndicator = document.getElementById('auRoleIndicator');
  const roleLabelEls = document.querySelectorAll('.au-role-label');
  const orbitSat = document.getElementById('auOrbitSat');
  const satIcon = document.getElementById('auSatIcon');
  const roleField = document.getElementById('auRoleField');

  function setRole(role, btn) {
    roleBtns.forEach(b => b.classList.toggle('active', b === btn));
    if (roleIndicator) {
      roleIndicator.style.transform = role === 'admin' ? 'translateX(100%)' : 'translateX(0)';
      roleIndicator.classList.toggle('role-admin', role === 'admin');
    }
    roleLabelEls.forEach(el => { el.textContent = role === 'admin' ? 'admin' : 'customer'; });
    if (roleField) roleField.value = role;

    if (orbitSat) orbitSat.classList.toggle('role-admin', role === 'admin');
    if (satIcon) {
      orbitSat.classList.add('icon-pop');
      setTimeout(() => {
        satIcon.classList.remove('fa-user', 'fa-shield-halved');
        satIcon.classList.add(role === 'admin' ? 'fa-shield-halved' : 'fa-user');
        orbitSat.classList.remove('icon-pop');
      }, 160);
    }
  }

  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => setRole(btn.dataset.role, btn));
  });

  /* ---------- Password visibility toggle ---------- */
  document.querySelectorAll('.au-pass-toggle').forEach(toggle => {
    const field = toggle.closest('.au-field');
    const input = field ? field.querySelector('input') : null;
    if (!input) return;
    toggle.addEventListener('click', () => {
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      const icon = toggle.querySelector('i');
      icon.classList.toggle('fa-eye', showing);
      icon.classList.toggle('fa-eye-slash', !showing);
      toggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });
  });

  /* ---------- Login form — fake loading state ---------- */
  const loginForm = document.getElementById('auLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('.au-submit-btn');
      if (!btn || btn.classList.contains('is-loading')) return;
      btn.classList.add('is-loading');
      setTimeout(() => { btn.classList.remove('is-loading'); }, 1600);
    });
  }

  /* ---------- Signup form — confirm-password check + loading state ---------- */
  const signupForm = document.getElementById('auSignupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('auPassword');
      const confirm = document.getElementById('auConfirm');
      const btn = signupForm.querySelector('.au-submit-btn');
      if (!btn || btn.classList.contains('is-loading')) return;

      if (pass && confirm && pass.value !== confirm.value) {
        const field = confirm.closest('.au-field');
        field.classList.add('au-field-error');
        confirm.focus();
        setTimeout(() => field.classList.remove('au-field-error'), 500);
        return;
      }

      btn.classList.add('is-loading');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1600);
    });
  }

});