export const MessageDashboardWarning = () => {
  const mounpoint = document.getElementById('message-dashboard-mountpoint');
  const dashboardWarning = document.getElementById('message-dashboard-warning-component').content.cloneNode(true);
  mounpoint.replaceChildren(dashboardWarning);
}
