import { login } from "../lib/api.js";
import { HomePage } from "./HomePage.js";
import { RegisterPage } from "./RegisterPage.js";

export const LoginPage = () => {
  const main = document.querySelector('main');
  const page = document.getElementById('login-page').content.cloneNode(true);
  main.replaceChildren(page);

  const form = main.querySelector('form');
  const email = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  const registerLink = document.getElementById('register-link');

  form.addEventListener('submit', e => {
    e.preventDefault();
    login(email.value, password.value)
      .then(() => HomePage())
      .catch(() => {
        password.value = '';
        password.focus();
      });
  });

  registerLink.addEventListener('click', e => {
    e.preventDefault();
    RegisterPage();
  });

  [email, password].forEach(x => x.addEventListener('blur', () => {
    if (!x.checkValidity()) {
      x.classList.add('input-error');
    } else {
      x.classList.remove('input-error');
    }
  }))
}
