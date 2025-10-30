import { getChannels, joinChannel } from '../lib/api.js';

const unsubscribers = [];
export const MessageDashboardUnaccessable = ({
  setChannels,
  subChannels,
  getSelectedChannelId,
}) => {
  unsubscribers.forEach(unsub => unsub());

  const mounpoint = document.getElementById('message-dashboard-mountpoint');
  const dashboardWarning = document.getElementById('message-dashboard-unaccessable-component')
    .content.cloneNode(true);
  mounpoint.replaceChildren(dashboardWarning);

  const channelName = document.getElementById('message-dashboard-unaccessable-name');
  const joinBtn = document.getElementById('message-dashboard-unaccessable-join-button');

  const updateTitle = (data) => {
    // Show channel name and invite to join
    channelName.textContent = data.find(x => x.id === getSelectedChannelId()).name;
  };

  unsubscribers.push(subChannels(data => {
    updateTitle(data);
  }));

  getChannels().then(x => updateTitle(x));

  joinBtn.addEventListener('click', () => {
    const channelId = getSelectedChannelId();
    joinChannel(channelId)
      .then(() => getChannels())
      .then(setChannels);
  });
};
