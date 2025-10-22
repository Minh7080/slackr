import { ChannelDetails } from "./ChannelDetails.js";
import { CreateChannelModal } from "./CreateChannelModal.js";

const unsubscribers = [];

export const Sidebar = ({ setSelectedChannelId, getSelectedChannelId, subSelectedChannelId, subChannels, getChannels, setChannels }) => {
  unsubscribers.forEach(unsub => unsub());

  const mountpoint = document.getElementById('sidebar-mountpoint');
  const sidebar = document.getElementById('sidebar-component').content.cloneNode(true);
  mountpoint.replaceChildren(sidebar);

  const channelListElement = document.getElementById('channel-list');
  const createChannelBtn = document.getElementById('create-channel-button');

  const createChannelElement = (name, id, isPrivate) => {
    const channelTemplate = document.getElementById('channel-entry-component').content.cloneNode(true);
    const anchor = channelTemplate.querySelector('a');
    const channelHTML = channelTemplate.querySelector('li');

    anchor.querySelector('p').textContent = name;
    if (isPrivate) {
      anchor.querySelector('svg').classList.remove('hidden');
    }

    return {
      getElement: () => channelHTML,
      getId: () => id
    };
  }

  const updateSelectedChannel = (channels) => {
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
      })

        if (getSelectedChannelId() === channel.id) {
          channelElement.getElement().children[0].classList.add('menu-active');
        } else {
          channelElement.getElement().children[0].classList.remove('menu-active');
        }

      channelListElement.append(channelElement.getElement());
    });
  }

  unsubscribers.push(subChannels(channels => {
    updateSelectedChannel(channels);
  }));

  updateSelectedChannel(getChannels());
  createChannelBtn.addEventListener('click', () => {
    CreateChannelModal({ setChannels });
  })

  ChannelDetails({ subSelectedChannelId, setChannels, getSelectedChannelId, subChannels });
}
