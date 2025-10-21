import { getChannels } from "../lib/api.js";
import { ChannelDetails } from "./ChannelDetails.js";
import { CreateChannelModal } from "./CreateChannelModal.js";

const unsubscribers = [];

export const Sidebar = (setSelectedChannel, subSelectedChannel, getSelectedChannel) => {
  unsubscribers.forEach(unsub => unsub());

  const mountpoint = document.getElementById('sidebar-mountpoint');
  const sidebar = document.getElementById('sidebar-component').content.cloneNode(true);
  mountpoint.replaceChildren(sidebar);

  const channelList = document.getElementById('channel-list');
  const createChannelBtn = document.getElementById('create-channel-button');

  const createChannelElement = (name, id, isPrivate) => {
    const channelTemplate = document.getElementById('channel-entry-component').content.cloneNode(true);
    const anchor = channelTemplate.querySelector('a');
    const channelHTML = channelTemplate.querySelector('li');

    anchor.prepend(document.createTextNode(name));
    if (isPrivate) {
      anchor.querySelector('svg').classList.remove('hidden');
    }

    return {
      getElement: () => channelHTML,
      getId: () => id
    };
  }

  const doGetChannels = () => {
    channelList.replaceChildren();
    getChannels()
      .then(data => data.forEach(x => {
        const channel = createChannelElement(x.name, x.id, x.private);

        const unsub = subSelectedChannel(value => {
          if (value.id === channel.getId()) {
            channel.getElement().children[0].classList.add('menu-active');
          } else {
            channel.getElement().children[0].classList.remove('menu-active');
          }
        })

        channel.getElement().addEventListener('click', () => {
          setSelectedChannel(x);
        });

        if (getSelectedChannel()?.id === channel.getId()) {
          channel.getElement().children[0].classList.add('menu-active');
        } else {
          channel.getElement().children[0].classList.remove('menu-active');
        }

        channelList.appendChild(channel.getElement());
        unsubscribers.push(unsub);
      }))
  }

  createChannelBtn.addEventListener('click', () => {
    CreateChannelModal(doGetChannels);
  })

  ChannelDetails(subSelectedChannel, getSelectedChannel, doGetChannels);
  doGetChannels();
}
