import { getChannels } from "../lib/api.js";

const unsubscribers = [];

export const Sidebar = (setSelectedChannel, subSelectedChannel) => {
  unsubscribers.forEach(unsub => unsub());

  const mountpoint = document.getElementById('sidebar-mountpoint');
  const sidebar = document.getElementById('sidebar-component').content.cloneNode(true);
  mountpoint.replaceChildren(sidebar);

  const channelList = document.getElementById('channel-list');

  const createChannel = (name, id, isPrivate) => {
    const channelTemplate = document.getElementById('channel-entry-component').content.cloneNode(true);
    const anchor = channelTemplate.querySelector('a');
    const channelHTML = channelTemplate.querySelector('li');

    anchor.prepend(document.createTextNode(name));
    if (isPrivate) {
      const img = document.createElement('img');
      img.src = '../../assets/lock.svg'
      anchor.appendChild(img);
    }

    return {
      getElement: () => channelHTML,
      getId: () => id
    };
  }

  getChannels()
    .then(data => data.forEach(x => {
      const channel = createChannel(x.name, x.id);

      channel.getElement().addEventListener('click', () => {
        setSelectedChannel(x);
      });

      const unsub = subSelectedChannel(value => {
        if (value.id === channel.getId()) {
          channel.getElement().classList.add('menu-active');
        } else {
          channel.getElement().classList.remove('menu-active');
        }
      })

      channelList.appendChild(channel.getElement());
      unsubscribers.push(unsub);
    }));
}
