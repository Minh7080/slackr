import {
  leaveChannel,
  getChannels as getChannelsAPI,
  getMessages,
  getPinnedMessages,
} from '../lib/api.js';
import { subscribeChannel } from '../lib/ws.js';
import { InviteUserModal } from './InviteUserModal.js';
import { Message } from './Message.js';
import { MessageInput } from './MessageInput.js';
import { PinnedMessage } from './PinnedMessage.js';

const unsubscribers = [];

export const MessageDashboard = ({
  subSelectedChannelId,
  getChannels,
  subChannels,
  getSelectedChannelId,
  setChannels,
}) => {
  unsubscribers.forEach(unsub => unsub());

  const mountpoint = document.getElementById('message-dashboard-mountpoint');
  const dashboard = document.getElementById('message-dashboard-component').content.cloneNode(true);
  mountpoint.replaceChildren(dashboard);

  const dashboardHeading = document.getElementById('message-dashboard-channel-name');
  const leaveChannelBtn = document.getElementById('message-dashboard-leave-button');
  const inviteBtn = document.getElementById('invite-user-button');
  const pinnedBtn = document.getElementById('pinned-button');

  const loadingElement = document.getElementById('message-loading-component')
    .content.firstElementChild.cloneNode(true);

  inviteBtn.addEventListener('click', () => InviteUserModal({ getSelectedChannelId }));

  let isPinnedDashboardCollapsed = false;

  const updatePinnedDashboardCollaspe = () => {
    // Slide pinned panel in/out with small animation and button state
    if (isPinnedDashboardCollapsed) {
      document.getElementById('pinned-message-dashboard').classList.add('translate-x-full');

      setTimeout(() => {
        document.getElementById('pinned-message-dashboard').classList.add('hidden');
        pinnedBtn.classList.remove('btn-active');
      }, 200);

    } else {
      document.getElementById('pinned-message-dashboard').classList.remove('hidden');
      requestAnimationFrame(() => {
        document.getElementById('pinned-message-dashboard').classList.remove('translate-x-full');
        pinnedBtn.classList.add('btn-active');
      });
    }
  };

  pinnedBtn.addEventListener('click', () => {
    isPinnedDashboardCollapsed = !isPinnedDashboardCollapsed;
    updatePinnedDashboardCollaspe();
  });

  const mediaQuery = window.matchMedia('(min-width: 1024px)');

  mediaQuery.addEventListener('change', event => {
    event.matches ? isPinnedDashboardCollapsed = false : isPinnedDashboardCollapsed = true;
    updatePinnedDashboardCollaspe();
  });

  mediaQuery.matches ? isPinnedDashboardCollapsed = false : isPinnedDashboardCollapsed = true;
  updatePinnedDashboardCollaspe();

  const updateMessageDashboard = (selectedChannelId) => {
    // Show/hide header based on selection and update channel name
    if (selectedChannelId === -1) {
      dashboardHeading.parentElement.classList.add('hidden');
      return;
    }
    dashboardHeading.parentElement.classList.remove('hidden');
    dashboardHeading.innerText = getChannels().find(x => x.id === selectedChannelId).name;
  };

  unsubscribers.push(subSelectedChannelId(selectedChannelId => {
    updateMessageDashboard(selectedChannelId);
  }));

  unsubscribers.push(subChannels(() => {
    updateMessageDashboard(getSelectedChannelId());
  }));

  // Leave channel then refresh channel list
  leaveChannelBtn.addEventListener('click', () => leaveChannel(getSelectedChannelId())
    .then(() => getChannelsAPI()
      .then(data => setChannels(data))));

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
  };

  // Message content
  let loading = false;
  let currentChannelId = getSelectedChannelId();
  let startIdx = 0;
  const messagesMountpoint = document.getElementById('message-mountpoint');
  const messagesById = new Map();

  const loadMessages = (isInitial = false) => {
    // Load a page of messages, prepend older ones and maintain scroll position
    if (loading) return Promise.resolve();
    loading = true;

    messagesMountpoint.prepend(loadingElement);

    return getMessages(currentChannelId, startIdx)
      .then(data => {
        const messagePromises = data.map(message => Message({
          message,
          getSelectedChannelId,
          loadPinnedMessages,
        }));

        return Promise.all(messagePromises);
      })
      .then(messages => {
        messages.forEach(element => {
          messagesMountpoint.prepend(element);
          messagesById.set(element.message.id, { element });
        });

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
      messagesById.clear();
    }
    return loadMessages(true);
  };

  const handleChannelEvent = (event) => {
    if (!event || !event.type) return;
    const { type, payload } = event;

    if (type === 'MESSAGE_SENT') {
      const incoming = payload.message;
      if (messagesById.has(incoming.id)) return;
      const wasNearBottom =
        messagesMountpoint.scrollHeight
        - messagesMountpoint.scrollTop
        - messagesMountpoint.clientHeight < 50;
      const isOwn = incoming.sender === parseInt(localStorage.getItem('userId'));
      Message({
        message: incoming,
        getSelectedChannelId,
        loadPinnedMessages,
      }).then(element => {
        if (!messagesById.has(incoming.id)) {
          messagesById.set(incoming.id, { element });
          messagesMountpoint.appendChild(element);
        }
        if (isOwn || wasNearBottom) {
          element.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      });
      return;
    }

    if (type === 'MESSAGE_UPDATED') {
      const entry = messagesById.get(payload.message.id);
      if (entry) entry.element.updateMessage(payload.message);
      return;
    }

    if (type === 'MESSAGE_DELETED') {
      const entry = messagesById.get(payload.messageId);
      if (entry) {
        entry.element.remove();
        messagesById.delete(payload.messageId);
      }
      loadPinnedMessages();
      return;
    }

    if (type === 'MESSAGE_PINNED' || type === 'MESSAGE_UNPINNED') {
      const entry = messagesById.get(payload.messageId);
      if (entry) entry.element.updateMessage({ pinned: type === 'MESSAGE_PINNED' });
      loadPinnedMessages();
      return;
    }

    if (type === 'REACTION_ADDED') {
      const entry = messagesById.get(payload.messageId);
      if (!entry) return;
      const current = entry.element.message.reacts || [];
      const exists = current.some(r => r.user === payload.userId && r.react === payload.react);
      if (exists) return;
      entry.element.updateMessage({
        reacts: [...current, { react: payload.react, user: payload.userId }],
      });
      return;
    }

    if (type === 'REACTION_REMOVED') {
      const entry = messagesById.get(payload.messageId);
      if (!entry) return;
      const current = entry.element.message.reacts || [];
      entry.element.updateMessage({
        reacts: current.filter(
          r => !(r.user === payload.userId && r.react === payload.react),
        ),
      });
      return;
    }
  };

  unsubscribers.push(subscribeChannel(currentChannelId, handleChannelEvent));

  unsubscribers.push(subSelectedChannelId(() => resetAndLoadMessages()));
  unsubscribers.push(subChannels(() => resetAndLoadMessages()));

  messagesMountpoint.addEventListener('scroll', () => {
    // Infinite scroll, load more when scrolled to top
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
