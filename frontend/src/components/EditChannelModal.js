import { editChannelDetails, getChannelDetails } from '../lib/api.js';

export const EditChannelModal = (doGetChannels, getSelectedChannel, doGetChannelDetails ) => {
  const mountpoint = document.getElementById('modal-container');
  const modal = document.getElementById('edit-channel-modal-component').content.cloneNode(true);
  mountpoint.replaceChildren(modal);

  const name = document.getElementById('edit-channel-name');
  const description = document.getElementById('edit-channel-description');
  const cancelBtn = document.getElementById('edit-channel-cancel');
  const submitBtn = document.getElementById('edit-channel-submit');
  const form = mountpoint.querySelector('form');

  cancelBtn.addEventListener('click', () => mountpoint.close());

  submitBtn.disabled = true;
  [name, description].forEach(x => x.addEventListener('input', () => {submitBtn.disabled = false}));

  description.addEventListener('input', () => {
    description.style.height = 'auto';
    description.style.height = description.scrollHeight + 'px';
  })

  name.addEventListener('blur', () => {
    if (!name.checkValidity()) {
      name.classList.add('input-error');
    } else {
      name.classList.remove('input-error');
    }
  });

  getChannelDetails(getSelectedChannel().id).then(data => {
    name.value = data.name;
    description.value = data.description;
    description.style.height = description.scrollHeight + 'px';
    mountpoint.showModal();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    editChannelDetails(getSelectedChannel().id, name.value, description.value)
      .then(doGetChannels())
      .then(doGetChannelDetails(getSelectedChannel()))
      .then(mountpoint.close());
  });
}
