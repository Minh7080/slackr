import { createChannel, getChannels } from "../lib/api.js";

export const CreateChannelModal = ({ setChannels }) => {
  const mountpoint = document.getElementById('modal-container');
  const modal = document.getElementById('create-channel-modal-component').content.cloneNode(true);
  mountpoint.replaceChildren(modal);
  mountpoint.showModal();

  const name = document.getElementById('create-channel-name');
  const description = document.getElementById('create-channel-description');
  const isPrivate = document.getElementById('create-channel-is-private');
  const cancelBtn = document.getElementById('create-channel-cancel');
  const form = mountpoint.querySelector('form');

  cancelBtn.addEventListener('click', () => mountpoint.close());

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

  form.addEventListener('submit', e => {
    e.preventDefault();
    createChannel(name.value, isPrivate.checked, description.value)
      .then(() => { 
        getChannels()
          .then(data => {
            setChannels(data);
          })
      });
    mountpoint.close();
  });
}
