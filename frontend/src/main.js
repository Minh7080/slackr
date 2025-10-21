import { ToastError } from './components/ToastError.js';
import { HomePage } from './pages/HomePage.js';
import { LoginPage } from './pages/LoginPage.js';

/* window.addEventListener('error', e => ToastError(e.message));
window.addEventListener('unhandledrejection', e => ToastError(e.reason)); */

localStorage.getItem('token') ? HomePage() : LoginPage();
