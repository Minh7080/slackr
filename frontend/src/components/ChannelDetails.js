import { getChannelDetails } from '../lib/api.js';
import { formatTextToHTML } from '../lib/formatTextToHTML.js';
import { EditChannelModal } from './EditChannelModal.js';
import { Profile } from './Profile.js';

const unsubscribers = [];

export const ChannelDetails = ({
  subSelectedChannelId,
  setChannels,
  getSelectedChannelId,
  subChannels,
}) => {

  // Clean up unsubscribers when this function is called
  unsubscribers.forEach(unsub => unsub());
  unsubscribers.length = 0;

  // Clone template and setup html
  const mountpoint = document.getElementById('channel-details-mountpoint');
  const channelDetailsTemplate = document
    .getElementById('channel-details-component').content.cloneNode(true);
  mountpoint.replaceChildren(channelDetailsTemplate);

  // DOM selectors
  const channelDetailsElement = document.getElementById('channel-details-container');
  const name = document.getElementById('channel-details-name');
  const description = document.getElementById('channel-details-description');
  const date = document.getElementById('channel-details-date');
  const visiblity = document.getElementById('channel-details-visibility');
  const updateChannelBtn = document.getElementById('channel-details-edit-button');

  // Helper functions to render info
  const setDescription = (message) => {
    if (!message.trim()) {
      description.classList.add('hidden');
      return;
    }
    description.classList.remove('hidden');
    description.replaceChildren(formatTextToHTML(message));
  };

  const setDate = (text) => {
    const opt = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    date.textContent = `Created at ${new Date(text).toLocaleDateString('en-AU', opt)}`;
  };

  const setVisiblity = (isPrivate) => {
    // Toggle icon and label based on privacy
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
  };

  const updateChannelDetails = (selectedChannelId) => {
    // Fetch and render details for the active channel
    if (selectedChannelId === -1) return;
    getChannelDetails(selectedChannelId)
      .then(data => {
        channelDetailsElement.classList.remove('hidden');
        name.textContent = data.name;
        setDescription(data.description);
        setDate(data.createdAt);
        setVisiblity(data.private);
        Profile(data.creator, 'channel-details-profile-mountpoint');
      })
      .catch(() => channelDetailsElement.classList.add('hidden'));
  };

  // Made the inital load of channed details hidden
  channelDetailsElement.classList.add('hidden');

  // Update the DOM when the selected channels or the channels info changes
  unsubscribers.push(subSelectedChannelId(selectedChannelId => {
    updateChannelDetails(selectedChannelId);
  }));
  unsubscribers.push(subChannels(() => updateChannelDetails(getSelectedChannelId())));

  // Pop up EditChannelModal if the edit button is clicked
  updateChannelBtn.addEventListener('click', () => {
    EditChannelModal({ setChannels, updateChannelDetails, getSelectedChannelId });
  });
};
