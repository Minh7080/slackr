import { MessageDashboard } from "../components/MessageDashboard.js";
import { MessageDashboardUnaccessable } from "../components/MessageDashboardUnaccessable.js";
import { MessageDashboardWarning } from "../components/MessageDashboardWarning.js";
import { OwnProfile } from "../components/OwnProfile.js";
import { Sidebar } from "../components/Sidebar.js";
import { getChannels as getChannelsAPI, getMessages, logout } from "../lib/api.js";
import { useState } from "../lib/hooks.js";
import { LoginPage } from "./LoginPage.js";
import {
  getSelectedChannelId,
  setSelectedChannelId,
  subSelectedChannelId,
  getChannels,
  setChannels,
  subChannels,
} from '../stores/channels.js';

export const HomePage = () => {
  const main = document.querySelector('main');
  const page = document.getElementById('home-page').content.cloneNode(true);
  main.replaceChildren(page);


  getChannelsAPI().then(data => {
    setChannels(data);
  });

  Sidebar({ setSelectedChannelId, getSelectedChannelId ,subSelectedChannelId, subChannels, getChannels, setChannels });

  const updateDashboard = (selectedChannelId) => {
    if (selectedChannelId === -1 || !getChannels().map(x => x.id).includes(selectedChannelId)) {
      MessageDashboardWarning();
      return;
    }

    const isUserInChannel = getChannels().find(x => x.id === getSelectedChannelId())?.members.includes(parseInt(localStorage.getItem('userId')));

    if (!isUserInChannel) {
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

  OwnProfile();
}
