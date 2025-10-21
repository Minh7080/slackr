import { getUserDetails } from '../lib/api.js';

export const Profile = (userId, mountpointId) => {
  const mountpoint = document.getElementById(mountpointId);
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
    img.alt = `${data.name} profile picture`
  });
};
