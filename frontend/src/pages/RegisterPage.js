import { register } from '../lib/api.js';
import { HomePage } from './HomePage.js';
import { LoginPage } from './LoginPage.js';

export const RegisterPage = () => {
  const main = document.querySelector('main');
  const page = document.getElementById('register-page').content.cloneNode(true);
  main.replaceChildren(page);

  const form = main.querySelector('form');
  const email = document.getElementById('register-email');
  const password = document.getElementById('register-password');
  const passwordRetype = document.getElementById('register-password-confirm');
  const name = document.getElementById('register-name');
  const loginLink = document.getElementById('login-link');

  form.addEventListener('submit', e => {
    e.preventDefault();
    register(email.value, password.value, name.value)
      .then(() => HomePage())
      .catch(() => {
        // Clear fields on failure and refocus
        password.value = '';
        passwordRetype.value = '';
        password.focus();
      });
  });

  loginLink.addEventListener('click', e => {
    e.preventDefault();
    LoginPage();
  });

  passwordRetype.addEventListener('input', () => {
    if (passwordRetype.value !== password.value) {
      passwordRetype.setCustomValidity('Does not match password');
    } else {
      passwordRetype.setCustomValidity('');
    }
  });

  [email, password, name, passwordRetype].forEach(x => x.addEventListener('blur', () => {
    if (!x.checkValidity()) {
      x.classList.add('input-error');
    } else {
      x.classList.remove('input-error');
    }
  }));
};
