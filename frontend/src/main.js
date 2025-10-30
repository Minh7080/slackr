import { ProfileModal } from './components/ProfileModal.js';
import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { setSelectedChannelId } from './stores/channels.js';

// On initial load, render the appropriate page based on auth state
localStorage.getItem('token') ? HomePage() : LoginPage();

// Fragment based URL routing
const navigate = (hashString) => {
  if (hashString === 'profile') {
    const userId = parseInt(localStorage.getItem('userId'));
    ProfileModal({ userId: userId });

  } else if (hashString.startsWith('profile=')) {
    const userId = parseInt(hashString.split('=')[1]);
    ProfileModal({ userId: userId });

  } else if (hashString.startsWith('channel=')) {
    const channedId = parseInt(hashString.split('=')[1]);
    setSelectedChannelId(channedId);
  }
};

window.addEventListener('hashchange', () => {
  const locationHash = window.location.hash.substring(1);
  navigate(locationHash);
});
navigate(window.location.hash.substring(1));
