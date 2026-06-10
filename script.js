let currentEmail = '';

window.addEventListener('load', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showToast('Ласкаво повернувся!', 'success');
        // window.location.href = '/dashboard.html';
    }
});

function switchTab(tab) {
  const tabs   = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.form-panel');

  tabs.forEach(t => t.classList.remove('active'));
  panels.forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  const tabEl = document.getElementById('tab-' + tab);
  if (tabEl) tabEl.classList.add('active');

  const panel = document.getElementById('panel-' + tab);
  if (panel) {
    panel.style.display = 'flex';
    void panel.offsetWidth;
    panel.classList.add('active');
  }
}

function handleSignIn() {
    const username = document.getElementById('si-username').value;
    const password = document.getElementById('si-password').value;

    fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.text().then(text => ({ ok: res.ok, text })))
    .then(({ ok, text }) => {
        if (ok) {
            localStorage.setItem('token', text);
            showToast('Вхід виконано!', 'success');
            // window.location.href = '/dashboard.html';
        } else {
            showToast(text, 'error');
        }
    })
    .catch(() => showToast('Помилка з\'єднання з сервером', 'error'));
}

function handleSignUp() {
    const username = document.getElementById('su-username').value;
    const password = document.getElementById('su-password').value;
    const repeatpassword = document.getElementById('su-repeat').value;
    const email = document.getElementById('su-email').value;

    if (!validatePassword(password, repeatpassword)) return;

    currentEmail = email;

    fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
    })
    .then(res => res.text().then(text => ({ ok: res.ok, text })))
    .then(({ ok, text }) => {
        if (ok) {
            switchTab('verify');
            startVerifyTimer();
        } else {
            showToast(text, 'error');
        }
    })
    .catch(() => showToast('Помилка з\'єднання з сервером', 'error'));
}

function validatePassword(password, repeatpassword) {
    if (password !== repeatpassword)  { showToast('Паролі не збігаються', 'error');     return false; }
    if (password.length < 8)          { showToast('Мінімум 8 символів', 'error');       return false; }
    if (!/[A-Z]/.test(password))      { showToast('Потрібна велика літера', 'error');   return false; }
    if (!/\d/.test(password))         { showToast('Потрібна цифра', 'error');           return false; }
    if (/\s/.test(password))          { showToast('Пароль не може містити пробіли', 'error'); return false; }
    return true;
}

function showToast(msg, type) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast show ' + type;
    setTimeout(() => toast.className = 'toast', 3000);
}

const EYE_OPEN = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const EYE_OFF  = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`;

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const svg   = btn.querySelector('svg');
  const isHidden = input.type === 'password';
  input.type  = isHidden ? 'text' : 'password';
  svg.innerHTML = isHidden ? EYE_OFF : EYE_OPEN;
  btn.setAttribute('aria-label', isHidden ? 'Приховати пароль' : 'Показати пароль');
}

let timerInterval = null;

function startVerifyTimer() {
  let seconds = 60;
  const el = document.getElementById('verify-timer');
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    seconds--;
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    el.textContent = `${m}:${s}`;
    if (seconds <= 0) {
      clearInterval(timerInterval);
      el.textContent = '00:00';
    }
  }, 1000);
}

function resendCode() {
    fetch('http://localhost:8080/auth/register/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentEmail })
    })
    .then(res => res.text().then(text => ({ ok: res.ok, text })))
    .then(({ ok, text }) => {
        if (ok) {
            startVerifyTimer();
            showToast('Код відправлено знову', 'success');
        } else {
            showToast(text, 'error');
        }
    })
    .catch(() => showToast('Помилка з\'єднання з сервером', 'error'));
}

function handleVerify() {
    const code = document.getElementById('verify-code').value;
    if (!code) { showToast('Введи код', 'error'); return; }

    fetch('http://localhost:8080/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentEmail, code })
    })
    .then(res => res.text().then(text => ({ ok: res.ok, text })))
    .then(({ ok, text }) => {
        if (ok) {
            showToast('Реєстрація успішна!', 'success');
            switchTab('signin');
        } else {
            showToast(text, 'error');
        }
    })
    .catch(() => showToast('Помилка з\'єднання з сервером', 'error'));
}