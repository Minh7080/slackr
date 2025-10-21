import { MessageDashboard } from "../components/MessageDashboard.js";
import { MessageDashboardWarning } from "../components/MessageDashboardWarning.js";
import { Sidebar } from "../components/Sidebar.js";
import { logout } from "../lib/api.js";
import { useState } from "../lib/hooks.js";
import { LoginPage } from "./LoginPage.js";

export const HomePage = () => {
  const main = document.querySelector('main');
  const page = document.getElementById('home-page').content.cloneNode(true);
  main.replaceChildren(page);

  const [getSelectedChannel, setSelectedChannel, subSelectedChannel] = useState(null);
  Sidebar(setSelectedChannel, subSelectedChannel, getSelectedChannel);

  const updateDashboard = (selectedChannel) => {
    if (!selectedChannel) {
      MessageDashboardWarning();
      return;
    }
    MessageDashboard(subSelectedChannel, getSelectedChannel);
  }

  subSelectedChannel(selectedChannel => {
    updateDashboard(selectedChannel);
    console.log(selectedChannel);
  });

  updateDashboard(getSelectedChannel());

  const logoutBtn = document.getElementById('logout-button');
  logoutBtn.addEventListener('click', () => {
    logout().finally(() => LoginPage());
  });
}
