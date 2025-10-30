import { leaveChannel, getChannels as getChannelsAPI, getMessages, getPinnedMessages } from '../lib/api.js';
import { InviteUserModal } from './InviteUserModal.js';
import { Message } from './Message.js';
import { MessageInput } from './MessageInput.js';
import { PinnedMessage } from './PinnedMessage.js';

const unsubscribers = [];

export const MessageDashboard = ({ subSelectedChannelId, getChannels, subChannels, getSelectedChannelId, setChannels }) => {
  unsubscribers.forEach(unsub => unsub());

  const mountpoint = document.getElementById('message-dashboard-mountpoint');
  const dashboard = document.getElementById('message-dashboard-component').content.cloneNode(true);
  mountpoint.replaceChildren(dashboard);

  const dashboardHeading = document.getElementById('message-dashboard-channel-name');
  const leaveChannelBtn = document.getElementById('message-dashboard-leave-button');
  const inviteBtn = document.getElementById('invite-user-button');
  const pinnedBtn = document.getElementById('pinned-button');

  const loadingElement = document.getElementById('message-loading-component').content.firstElementChild.cloneNode(true);

  inviteBtn.addEventListener('click', () => InviteUserModal({ getSelectedChannelId }));

  let isPinnedDashboardCollapsed = false;

  const updatePinnedDashboardCollaspe = () => {
    if (isPinnedDashboardCollapsed) {
      document.getElementById('pinned-message-dashboard').classList.add('translate-x-full');

      setTimeout(() => {
        document.getElementById('pinned-message-dashboard').classList.add('hidden');
        pinnedBtn.classList.remove('btn-active');
      }, 200)

    } else {
      document.getElementById('pinned-message-dashboard').classList.remove('hidden');
      requestAnimationFrame(() => {
        document.getElementById('pinned-message-dashboard').classList.remove('translate-x-full');
        pinnedBtn.classList.add('btn-active');
      })
    }
  };

  pinnedBtn.addEventListener('click', () => {
    isPinnedDashboardCollapsed = !isPinnedDashboardCollapsed;
    updatePinnedDashboardCollaspe();
  });

  const mediaQuery = window.matchMedia('(min-width: 1024px)');

  mediaQuery.addEventListener('change', e => {
    e.matches ? isPinnedDashboardCollapsed = false : isPinnedDashboardCollapsed = true;
    updatePinnedDashboardCollaspe();
  });

  mediaQuery.matches ? isPinnedDashboardCollapsed = false : isPinnedDashboardCollapsed = true;
  updatePinnedDashboardCollaspe();

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

  const loadPinnedMessages = () => {
    const mountpoint = document.getElementById('pinned-messages-mountpoint');
    mountpoint.replaceChildren(loadingElement);
    getPinnedMessages(getSelectedChannelId())
      .then(messages => {
        mountpoint.replaceChildren();
        const messagePromises = messages.map(message => PinnedMessage({ message }));
        return Promise.all(messagePromises);
      })
      .then(messages => {
        messages.forEach(message => {
          mountpoint.append(message);
        });
      });
  }

  // Message content
  let loading = false;
  let currentChannelId = getSelectedChannelId();
  let startIdx = 0;
  const messagesMountpoint = document.getElementById('message-mountpoint');

  const loadMessages = (isInitial = false) => {
    if (loading) return Promise.resolve();
    loading = true;

    messagesMountpoint.prepend(loadingElement);

    return getMessages(currentChannelId, startIdx)
      .then(data => {
        const messagePromises = data.map(message => Message({ message, getSelectedChannelId, loadPinnedMessages }));
        return Promise.all(messagePromises);
      })
      .then(messages => {
        messages.forEach(x => messagesMountpoint.prepend(x));

        if (isInitial && messagesMountpoint.lastElementChild) {
          messagesMountpoint.scrollTop = messagesMountpoint.scrollHeight;
        }

        startIdx += messages.length;
      })
      .finally(() => {
        loading = false;
        loadingElement.remove();
      });
  };

  const resetAndLoadMessages = () => {
    const newChannelId = getSelectedChannelId();
    if (newChannelId !== currentChannelId) {
      currentChannelId = newChannelId;
      startIdx = 0;
      messagesMountpoint.innerHTML = '';
    }
    return loadMessages(true);
  };

  unsubscribers.push(subSelectedChannelId(() => resetAndLoadMessages()));
  unsubscribers.push(subChannels(() => resetAndLoadMessages()));

  messagesMountpoint.addEventListener('scroll', () => {
    if (messagesMountpoint.scrollTop <= 0 && !loading) {
      const previousHeight = messagesMountpoint.scrollHeight;
      loadMessages().then(() => {
        const newHeight = messagesMountpoint.scrollHeight;
        messagesMountpoint.scrollTop = newHeight - previousHeight;
      });
    }
  });

  resetAndLoadMessages();

  MessageInput({ getSelectedChannelId, loadPinnedMessages });


  loadPinnedMessages();
};
