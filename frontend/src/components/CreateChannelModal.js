import { createChannel, getChannels } from '../lib/api.js';

export const CreateChannelModal = ({ setChannels }) => {
  // Clone template and place it on the mountpoint
  const mountpoint = document.getElementById('modal-container');
  const modal = document.getElementById('create-channel-modal-component').content.cloneNode(true);
  mountpoint.replaceChildren(modal);
  mountpoint.showModal();

  // DOM selectors
  const name = document.getElementById('create-channel-name');
  const description = document.getElementById('create-channel-description');
  const isPrivate = document.getElementById('create-channel-is-private');
  const cancelBtn = document.getElementById('create-channel-cancel');
  const form = mountpoint.querySelector('form');

  // Close modal when cancelBtn pressed
  cancelBtn.addEventListener('click', () => mountpoint.close());

  // Resize textarea depending on the content
  description.addEventListener('input', () => {
    description.style.height = 'auto';
    description.style.height = description.scrollHeight + 'px';
  });

  // Toggle error style (input-error) based on name validity
  name.addEventListener('blur', () => {
    if (!name.checkValidity()) {
      name.classList.add('input-error');
    } else {
      name.classList.remove('input-error');
    }
  });

  // Create channel using an api when the form is submitted
  form.addEventListener('submit', event => {
    event.preventDefault();
    createChannel(name.value, isPrivate.checked, description.value)
      .then(() => getChannels())
      .then(data => setChannels(data))
      .then(() => mountpoint.close());
  });
};
