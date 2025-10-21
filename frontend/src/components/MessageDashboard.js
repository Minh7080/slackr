const unsubscribers = [];

export const MessageDashboard = (subSelectedChannel, getSelectedChannel) => {
  unsubscribers.forEach(unsub => unsub());

  const mountpoint = document.getElementById('message-dashboard-mountpoint');
  const dashboard = document.getElementById('message-dashboard-component').content.cloneNode(true);
  mountpoint.replaceChildren(dashboard);

  const dashboardHeading = document.getElementById('message-dashboard-channel-name');

  const updateMessageDashboard = (selectedChannel) => {
    if (!selectedChannel) {
      dashboardHeading.parentElement.classList.add('hidden');
      return
    }
    dashboardHeading.parentElement.classList.remove('hidden');
    dashboardHeading.innerText = selectedChannel?.name;
  }

  unsubscribers.push(subSelectedChannel(selectedChannel => {
    updateMessageDashboard(selectedChannel);
  }));

  updateMessageDashboard(getSelectedChannel());
};
