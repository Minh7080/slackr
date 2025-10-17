import { ToastError } from './components/ToastError.js';
import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';

localStorage.getItem('token') ? HomePage() : LoginPage();
/* window.addEventListener('keydown', e => {
  if (e.key === 'k') {
    ToastError('test');
  }
}) */
