import { Sidebar } from "../components/Sidebar.js";
import { logout } from "../lib/api.js";
import { useState } from "../lib/hooks.js";
import { LoginPage } from "./LoginPage.js";

export const HomePage = () => {
  const main = document.querySelector('main');
  const page = document.getElementById('home-page').content.cloneNode(true);
  main.replaceChildren(page);

  const logoutBtn = document.getElementById('logout-button');
  logoutBtn.addEventListener('click', () => {
    logout().finally(() => LoginPage());
  });

  const [getSelectedChannel, setSelectedChannel, subSelectedChannel] = useState(null);

  Sidebar(setSelectedChannel, subSelectedChannel);
}
