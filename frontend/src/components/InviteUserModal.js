import { getChannelDetails, getUsers, inviteToChannel } from '../lib/api.js';
import { InviteProfile } from './InviteProfile.js';

export const InviteUserModal = ({ getSelectedChannelId }) => {
  const mountpoint = document.getElementById('modal-container');
  const modal = document.getElementById('invite-modal-component').content.cloneNode(true);
  mountpoint.replaceChildren(modal);

  const cancelBtn = document.getElementById('invite-cancel-button');
  const heading = document.getElementById('invite-heading');
  const form = document.querySelector('form');
  const profileMountpoint = document.getElementById('invite-profile-mountpoint');

  cancelBtn.addEventListener('click', () => mountpoint.close());

  const selectedUserIdsSet = new Set();

  form.addEventListener('submit', event => {
    event.preventDefault();

    const usersPromises = [...selectedUserIdsSet]
      .map(userId => inviteToChannel(getSelectedChannelId(), userId));

    Promise.all(usersPromises).then(() => mountpoint.close());
  });

  getChannelDetails(getSelectedChannelId()).then(channel => {
    heading.textContent = `Invite people to ${channel.name}`;
    return getUsers().then(users => {
      return users.filter(user => !channel.members.includes(user.id));
    });
  })
    .then(users => Promise.all(users.map(user => InviteProfile({
      userId: user.id, selectedUserIdsSet,
    }))))
    .then(elements => profileMountpoint.replaceChildren(...(elements)
      .sort((elementA, elementB) => {
        const nameA = elementA.querySelector('.invite-member-name').textContent.toLowerCase();
        const nameB = elementB.querySelector('.invite-member-name').textContent.toLowerCase();
        return nameA.localeCompare(nameB);
      })))
    .then(() => mountpoint.showModal());
};
