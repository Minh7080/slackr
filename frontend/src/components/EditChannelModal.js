import { editChannelDetails, getChannelDetails, getChannels } from '../lib/api.js';

export const EditChannelModal = ({ setChannels, updateChannelDetails, getSelectedChannelId }) => {
  // Clone template and place it on the mountpoint
  const mountpoint = document.getElementById('modal-container');
  const modal = document.getElementById('edit-channel-modal-component').content.cloneNode(true);
  mountpoint.replaceChildren(modal);

  // DOM selectors
  const name = document.getElementById('edit-channel-name');
  const description = document.getElementById('edit-channel-description');
  const cancelBtn = document.getElementById('edit-channel-cancel');
  const submitBtn = document.getElementById('edit-channel-submit');
  const form = mountpoint.querySelector('form');

  // Close modal when cancelBtn pressed
  cancelBtn.addEventListener('click', () => mountpoint.close());

  // The submitBtn is disabled on default.
  // It will be enable when the user interact with name or description
  submitBtn.disabled = true;
  [name, description].forEach(element => element.addEventListener('input', () => { 
    submitBtn.disabled = false;
  }));

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

  // Fill the fields with default value
  getChannelDetails(getSelectedChannelId()).then(data => {
    name.value = data.name;
    description.value = data.description;
    description.style.height = description.scrollHeight + 'px';
    mountpoint.showModal();
  });

  // Edit channel using an api when the form is submitted
  form.addEventListener('submit', event => {
    event.preventDefault();
    editChannelDetails(getSelectedChannelId(), name.value, description.value)
      .then(() => getChannels().then(data => setChannels(data)))
      .then(() => updateChannelDetails(getSelectedChannelId()))
      .then(() => mountpoint.close());
  });

};
