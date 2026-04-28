import { updateUserProfile, uploadImage } from '../lib/api.js';
import { fileToDataUrl } from '../lib/imageToUrl.js';
import { ProfileModal } from './ProfileModal.js';

export const ProfileEditModal = ({ user }) => {
  const mountpoint = document.getElementById('modal-container');
  const modal = document.getElementById('profile-edit-modal-component').content.cloneNode(true);
  const form = modal.firstElementChild;
  mountpoint.replaceChildren(modal);

  const cancelBtn = document.getElementById('profile-edit-close-button');
  const backBtn = document.getElementById('profile-edit-back-button');
  const submitBtn = document.getElementById('profile-edit-submit');

  const image = document.getElementById('profile-edit-image');
  const name = document.getElementById('profile-edit-name');
  const email = document.getElementById('profile-edit-email');
  const password = document.getElementById('profile-edit-password');
  const passwordCheckbox = document.getElementById('profile-edit-password-checkbox');
  const bio = document.getElementById('profile-edit-bio');

  const imageBtn = document.getElementById('profile-edit-image-button');
  const imageInput = document.getElementById('profile-edit-image-input');

  name.value = user.name;
  email.value = user.email;
  bio.value = user.bio;
  image.src = user.image ? user.image : 'assets/avatar.svg';

  bio.addEventListener('input', () => {
    bio.style.height = 'auto';
    bio.style.height = bio.scrollHeight + 'px';
  });

  passwordCheckbox.addEventListener('change', event => {
    if (event.target.checked) {
      passwordCheckbox.ariaLabel = 'hide';
      password.type = 'input';
    } else {
      passwordCheckbox.ariaLabel = 'show';
      password.type = 'password';
    }
  });

  [name, email].forEach(element => element.addEventListener('blur', event => {
    if (!event.target.checkValidity()) {
      event.target.classList.add('input-error');
    } else {
      event.target.classList.remove('input-error');
    }

  }));

  bio.style.height = bio.scrollHeight + 'px';

  imageBtn.addEventListener('click', () => {
    imageInput.click();
  });

  cancelBtn.addEventListener('click', () => mountpoint.close());

  backBtn.addEventListener('click', () =>  {
    ProfileModal({ userId: parseInt(localStorage.getItem('userId')) });
    mountpoint.close();
  });

  submitBtn.disabled = true;
  [name, email, password, bio].forEach(element => element.addEventListener('input', () => {
    submitBtn.disabled = false;
  }));

  imageInput.addEventListener('change', () => {
    if (imageInput.files.length >= 1) {
      fileToDataUrl(imageInput.files[0]).then(url => image.src = url);
      submitBtn.disabled = false;
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const cleanedEmail = !(email.value.trim()) || email.value.trim() === user.email
      ? undefined
      : email.value;

    const cleanedName = !(name.value.trim()) || name.value.trim() === user.value
      ? undefined
      : name.value;

    const cleanedBio = !(bio.value.trim()) || bio.value.trim() === user.value
      ? undefined
      : bio.value;

    const cleanedPassword = !(password.value.trim()) || password.value.trim() === user.value
      ? undefined
      : password.value;

    let promise;
    if (imageInput.files.length >= 1) {
      const form = new FormData();
      form.append('file', imageInput.files[0]);
      promise = uploadImage(form).then(fileName => {
        updateUserProfile(cleanedEmail, cleanedName, cleanedBio, cleanedPassword, fileName);
      });
    } else {
      promise = updateUserProfile(cleanedEmail, cleanedName, cleanedBio, cleanedPassword);
    }

    promise.then(() => mountpoint.close());
  });

  mountpoint.showModal();
};
