import { getUserDetails } from '../lib/api.js';

export const InviteProfile = ({ userId, selectedUserIdsSet }) => {
  const profileTemplate = document
    .getElementById('invite-profile-component').content.cloneNode(true);
  const profileElement = profileTemplate.firstElementChild;

  const name = profileElement.querySelector('.invite-member-name');
  const email = profileElement.querySelector('.invite-member-email');
  const img = profileElement.querySelector('img');
  const checkbox = profileElement.querySelector('input');

  return getUserDetails(userId)
    .then(data => {
      checkbox.id = `invite-profile-${userId}`;
      profileElement.htmlFor = checkbox.id;

      checkbox.addEventListener('change', event => {
        // Track selected user ids in the provided set
        if (event.target.checked) {
          selectedUserIdsSet.add(userId);
        } else {
          selectedUserIdsSet.delete(userId);
        }
      });

      name.textContent = data.name;
      email.textContent = data.email;
      img.src = data.image ? data.image : 'assets/avatar.svg';
      img.alt = `${data.name} profile picture`;
      return profileElement;
    });
};
