import { getUserDetails } from '../lib/api.js';

export const ProfileModal = ({ userId }) => {
  const mountpoint = document.getElementById('modal-container');
  const modal = document.getElementById('profile-modal-component').content.cloneNode(true);
  mountpoint.replaceChildren(modal);

  const cancelBtn = document.getElementById('profile-modal-cancel');
  const profileImg = document.getElementById('profile-image');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileBio = document.getElementById('profile-bio');
  const profileBioHeading = document.getElementById('profile-bio-heading');

  cancelBtn.addEventListener('click', () => mountpoint.close());

  getUserDetails(userId).then(user => {
    profileEmail.textContent = user.email;
    profileName.textContent = user.name;
    profileImg.src = user.image ? user.image : 'assets/avatar.svg';
    if (user.bio) {
      profileBio.classList.remove('hidden');
      profileBioHeading.classList.remove('hidden');
      profileBio.textContent = user.bio;
    } else {
      profileBio.classList.add('hidden');
      profileBioHeading.classList.add('hidden');
    }
    mountpoint.showModal();
  });

}
