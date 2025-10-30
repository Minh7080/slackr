import { getUserDetails } from '../lib/api.js';
import { ProfileModal } from './ProfileModal.js';

export const OwnProfile = () => {
  const userId = parseInt(localStorage.getItem('userId'));
  const mountpoint = document.getElementById('own-profile-mountpoint');
  const profileTemplate = document.getElementById('profile-component').content.cloneNode(true);
  const profileElement = profileTemplate.querySelector('div');

  mountpoint.replaceChildren(profileTemplate);

  const name = profileElement.querySelector('p');
  const email = profileElement.querySelector('small');
  const img = profileElement.querySelector('img');

  getUserDetails(userId).then(data => {
    name.textContent = data.name;
    email.textContent = data.email;
    img.src = data.image ? data.image : 'assets/avatar.svg';
    img.alt = `${data.name} profile picture`;

    profileElement.addEventListener('click', () => {
      ProfileModal({ userId });
    });
  });
};
