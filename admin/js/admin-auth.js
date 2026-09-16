// Admin Authentication
import { auth } from '../../js/firebase-config.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { setCurrentUser } from './admin-jobs.js';

const KAYLA_UID = "p7AzNLbUlfPy3agBd1mMtePsxPa2";

let currentUser = null;

async function initializeAdminAuth() {
  // Firebase is ready to use

  // Monitor auth state
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    setCurrentUser(user);
    if (user) {
      handleAuthSuccess(user);
    } else {
      handleAuthLogout();
    }
  });
}

function handleAuthSuccess(user) {
  if (user.uid === KAYLA_UID) {
    // Kayla is logged in
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    document.getElementById('admin-email-display').textContent = user.email;
  } else {
    // Non-Kayla user logged in - not authorized
    handleUnauthorizedUser(user.email);
  }
}

function handleUnauthorizedUser(email) {
  document.getElementById('login-form-container').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'none';

  const mainContent = document.getElementById('admin-main');
  mainContent.innerHTML = `
    <div style="text-align: center; padding: var(--space-3xl); color: var(--color-text-muted);">
      <p style="font-size: var(--font-size-base); margin-bottom: var(--space-md);">Access Denied</p>
      <p style="font-size: var(--font-size-sm); margin-bottom: var(--space-lg);">This admin panel is not available for your account.</p>
      <button id="access-denied-logout" style="padding: var(--space-sm) var(--space-md); background-color: var(--color-primary); color: var(--color-text-light); border: none; border-radius: var(--radius-sm); cursor: pointer; font-weight: var(--font-weight-semibold);">Log Out</button>
    </div>
  `;

  const deniedLogoutBtn = document.getElementById('access-denied-logout');
  if (deniedLogoutBtn) {
    deniedLogoutBtn.addEventListener('click', logoutAdmin);
  }
}

function handleAuthLogout() {
  document.getElementById('login-form-container').style.display = 'block';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').textContent = '';
}

async function loginAdmin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorDisplay = document.getElementById('login-error');

  if (!email || !password) {
    errorDisplay.textContent = 'Email and password are required.';
    return;
  }

  const loginButton = document.getElementById('login-button');
  loginButton.disabled = true;
  loginButton.textContent = 'Logging in...';
  errorDisplay.textContent = '';

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Success - auth state change handler will update UI
  } catch (error) {
    let message = 'Login failed. Please check your email and password.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      message = 'Incorrect email or password.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many failed attempts. Please try again later.';
    }
    errorDisplay.textContent = message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Log In';
  }
}

async function logoutAdmin(event) {
  if (event) {
    event.preventDefault();
  }

  try {
    await signOut(auth);
    // Success - auth state change handler will update UI
  } catch (error) {
    console.error('Logout failed:', error);
    alert('Logout failed. Please refresh the page.');
  }
}

// Initialize when page loads
function setupEventListeners() {
  const loginForm = document.getElementById('admin-login-form');
  const logoutButton = document.getElementById('logout-button');

  if (loginForm) {
    loginForm.addEventListener('submit', loginAdmin);
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', logoutAdmin);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeAdminAuth();
    setupEventListeners();
  });
} else {
  initializeAdminAuth();
  setupEventListeners();
}
