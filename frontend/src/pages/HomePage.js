import { MessageDashboard } from "../components/MessageDashboard.js";
import { MessageDashboardUnaccessable } from "../components/MessageDashboardUnaccessable.js";
import { MessageDashboardWarning } from "../components/MessageDashboardWarning.js";
import { Sidebar } from "../components/Sidebar.js";
import { getChannels as getChannelsAPI, logout } from "../lib/api.js";
import { useState } from "../lib/hooks.js";
import { LoginPage } from "./LoginPage.js";

export const HomePage = () => {
  const main = document.querySelector('main');
  const page = document.getElementById('home-page').content.cloneNode(true);
  main.replaceChildren(page);

  const [getSelectedChannelId, setSelectedChannelId, subSelectedChannelId] = useState(-1);
  const [getChannels, setChannels, subChannels] = useState([]);

  getChannelsAPI().then(data => {
    setChannels(data);
  });

  Sidebar({ setSelectedChannelId, getSelectedChannelId ,subSelectedChannelId, subChannels, getChannels, setChannels });

  const updateDashboard = (selectedChannelId) => {
    if (selectedChannelId === -1) {
      MessageDashboardWarning();
      return;
    }

    if (!getChannels().find(x => x.id === getSelectedChannelId()).members.includes(parseInt(localStorage.getItem('userId')))) {
      MessageDashboardUnaccessable({ setChannels, subChannels, getSelectedChannelId });
      return;
    }

    MessageDashboard({ subSelectedChannelId, getChannels, subChannels, getSelectedChannelId, setChannels });

  }

  subSelectedChannelId(selectedChannelId => {
    updateDashboard(selectedChannelId);
  });

  subChannels(() => {
    updateDashboard(getSelectedChannelId());
  });

  updateDashboard(getSelectedChannelId());

  const logoutBtn = document.getElementById('logout-button');
  logoutBtn.addEventListener('click', () => {
    logout().finally(() => LoginPage());
  });
}
