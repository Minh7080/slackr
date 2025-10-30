import { ChannelDetails } from './ChannelDetails.js';
import { CreateChannelModal } from './CreateChannelModal.js';

const unsubscribers = [];

export const Sidebar = ({
  setSelectedChannelId,
  getSelectedChannelId,
  subSelectedChannelId,
  subChannels,
  getChannels,
  setChannels,
}) => {
  unsubscribers.forEach(unsub => unsub());

  const mountpoint = document.getElementById('sidebar-mountpoint');
  const sidebarDocument = document.getElementById('sidebar-component').content.cloneNode(true);
  const sidebarElement = sidebarDocument.firstElementChild;
  mountpoint.replaceChildren(sidebarDocument);

  const channelListElement = document.getElementById('channel-list');
  const createChannelBtn = document.getElementById('create-channel-button');
  const sidebarCollapseBtn = document.getElementById('sidebar-collapse-button');

  const createChannelElement = (name, id, isPrivate) => {
    // Build a single channel list item from template
    const channelTemplate = document.getElementById('channel-entry-component')
      .content.cloneNode(true);
    const anchor = channelTemplate.querySelector('a');
    const channelHTML = channelTemplate.querySelector('li');

    anchor.querySelector('p').textContent = name;
    if (isPrivate) {
      anchor.querySelector('svg').classList.remove('hidden');
    }

    return {
      getElement: () => channelHTML,
      getId: () => id,
    };
  };

  const updateSelectedChannel = (channels) => {
    // Render the channel list and wire selection state
    channelListElement.replaceChildren();
    channels.forEach(channel => {
      const channelElement = createChannelElement(channel.name, channel.id, channel.private);

      unsubscribers.push(subSelectedChannelId(selectedChannelId => {
        if (selectedChannelId === channel.id) {
          channelElement.getElement().children[0].classList.add('menu-active');
        } else {
          channelElement.getElement().children[0].classList.remove('menu-active');
        }
      }));

      channelElement.getElement().addEventListener('click', () => {
        setSelectedChannelId(channel.id);
      });

      if (getSelectedChannelId() === channel.id) {
        channelElement.getElement().children[0].classList.add('menu-active');
      } else {
        channelElement.getElement().children[0].classList.remove('menu-active');
      }

      channelListElement.append(channelElement.getElement());
    });
  };

  unsubscribers.push(subChannels(channels => {
    updateSelectedChannel(channels);
  }));

  updateSelectedChannel(getChannels());
  createChannelBtn.addEventListener('click', () => {
    CreateChannelModal({ setChannels });
  });

  let isSidebarCollapsed = false;

  const updateSidebarCollapse = () => {
    // Slide sidebar for small screens and adjust dashboard padding
    if (isSidebarCollapsed) {
      sidebarElement.classList.add('-translate-x-75');
      sidebarElement.classList.remove('relative', 'left-0');
      setTimeout(() => sidebarElement.classList.add('absolute'), 100);

      document.getElementById('message-dashboard-mountpoint').classList.add('pl-8');
    } else {
      sidebarElement.classList.remove('absolute' , '-translate-x-75');
      sidebarElement.classList.add('relative', 'left-0');

      document.getElementById('message-dashboard-mountpoint').classList.remove('pl-8');
    }
  };

  sidebarCollapseBtn.addEventListener('click', () => {
    isSidebarCollapsed = !isSidebarCollapsed;
    updateSidebarCollapse();
  });

  const mediaQuery = window.matchMedia('(min-width: 768px)');

  mediaQuery.addEventListener('change', event => {
    event.matches ? isSidebarCollapsed = false : isSidebarCollapsed = true;
    updateSidebarCollapse();
  });

  mediaQuery.matches ? isSidebarCollapsed = false : isSidebarCollapsed = true;
  updateSidebarCollapse();

  ChannelDetails({ subSelectedChannelId, setChannels, getSelectedChannelId, subChannels });
};
