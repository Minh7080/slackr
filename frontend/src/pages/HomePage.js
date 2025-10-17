import { logout } from "../lib/api.js";
import { LoginPage } from "./LoginPage.js";

export const HomePage = () => {
  const main = document.querySelector('main');
  const page = document.getElementById('home-page').content.cloneNode(true);
  main.replaceChildren(page);

  const logoutBtn = document.getElementById('logout-button');
  logoutBtn.addEventListener('click', () => {
    logout().finally(() => LoginPage());
  });
}
