import { leaveChannel, getChannels as getChannelsAPI } from '../lib/api.js';

const unsubscribers = [];

export const MessageDashboard = ({ subSelectedChannelId, getChannels, subChannels, getSelectedChannelId, setChannels }) => {
  unsubscribers.forEach(unsub => unsub());

  const mountpoint = document.getElementById('message-dashboard-mountpoint');
  const dashboard = document.getElementById('message-dashboard-component').content.cloneNode(true);
  mountpoint.replaceChildren(dashboard);

  const dashboardHeading = document.getElementById('message-dashboard-channel-name');
  const leaveChannelBtn = document.getElementById('message-dashboard-leave-button');

  const updateMessageDashboard = (selectedChannelId) => {
    if (selectedChannelId === -1) {
      dashboardHeading.parentElement.classList.add('hidden');
      return
    }
    dashboardHeading.parentElement.classList.remove('hidden');
    dashboardHeading.innerText = getChannels().find(x => x.id === selectedChannelId).name;
  }

  unsubscribers.push(subSelectedChannelId(selectedChannelId => {
    updateMessageDashboard(selectedChannelId);
  }));

  unsubscribers.push(subChannels(() => {
    updateMessageDashboard(getSelectedChannelId());
  }));

  leaveChannelBtn.addEventListener('click', () => leaveChannel(getSelectedChannelId()).then(() => getChannelsAPI().then(data => setChannels(data))));

};
