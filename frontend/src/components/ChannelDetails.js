import { getChannelDetails } from "../lib/api.js";
import { formatTextToHTML } from "../lib/formatTextToHTML.js";
import { EditChannelModal } from "./EditChannelModal.js";
import { Profile } from "./Profile.js";

const unsubscribers = [];

export const ChannelDetails = (subSelectedChannel, getSelectedChannel, doGetChannels) => {
  unsubscribers.forEach(unsub => unsub());
  unsubscribers.length = 0;

  const mountpoint = document.getElementById('channel-details-mountpoint');
  const channelDetailsTemplate = document.getElementById('channel-details-component').content.cloneNode(true);
  mountpoint.replaceChildren(channelDetailsTemplate);

  const channelDetailsElement = document.getElementById('channel-details-container');
  channelDetailsElement.classList.add('hidden');

  const name = document.getElementById('channel-details-name');
  const description = document.getElementById('channel-details-description');
  const date = document.getElementById('channel-details-date');
  const visiblity = document.getElementById('channel-details-visibility');
  const updateChannelBtn = document.getElementById('channel-details-edit-button');

  const setDescription = (message) => {
    if (!message.trim()) {
      description.classList.add('hidden');
      return;
    }
    description.classList.remove('hidden');
    description.replaceChildren(formatTextToHTML(message));
  }

  const setDate = (text) => {
    const opt = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
    date.textContent = `Created at ${new Date(text).toLocaleDateString('en-AU', opt)}`;
  }

  const setVisiblity = (isPrivate) => {
    const [privateSvg, publicSvg] = visiblity.querySelectorAll('svg');
    const textDisplay = visiblity.querySelector('p');

    if (isPrivate) {
      publicSvg.classList.add('hidden');
      privateSvg.classList.remove('hidden');
      textDisplay.textContent = 'Private';
    } else {
      publicSvg.classList.remove('hidden');
      privateSvg.classList.add('hidden');
      textDisplay.textContent = 'Public';
    }
  }

  const doGetChannelDetails = (selectedChannel) => {
    if (!selectedChannel || !selectedChannel.members.includes(parseInt(localStorage.getItem('userId')))){
      channelDetailsElement.classList.add('hidden');
      return;
    }

    getChannelDetails(selectedChannel.id)
      .then(data => {
        name.textContent = data.name;
        setDescription(data.description);
        setDate(data.createdAt);
        setVisiblity(data.private);
        Profile(data.creator, 'channel-details-profile-mountpoint');
      })
      .catch(() => channelDetailsElement.classList.add('hidden'))
      .then(() =>channelDetailsElement.classList.remove('hidden'));
  }

  unsubscribers.push(subSelectedChannel(selectedChannel => {
    doGetChannelDetails(selectedChannel);
  }));

  updateChannelBtn.addEventListener('click', () => EditChannelModal(doGetChannels, getSelectedChannel, doGetChannelDetails));

  doGetChannelDetails(getSelectedChannel());
};
