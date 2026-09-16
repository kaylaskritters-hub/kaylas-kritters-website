// Admin Authentication
import { auth } from '../../js/firebase-config.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { setCurrentUser, unsubscribeAdminJobs } from './admin-jobs.js';

const KAYLA_UID = "p7AzNLbUlfPy3agBd1mMtePsxPa2";
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

let currentUser = null;
let inactivityTimer = null;

async function initializeAdminAuth() {
  // Firebase is ready to use

  // Configure session-based persistence (not persistent across browser restarts)
  try {
    await setPersistence(auth, browserSessionPersistence);
  } catch (error) {
    console.error('Failed to set persistence:', error);
  }

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

function resetInactivityTimer() {
  // Clear existing timer if present
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  // Only set a new timer if Kayla is authenticated
  if (currentUser && currentUser.uid === KAYLA_UID) {
    inactivityTimer = setTimeout(() => {
      // Auto-logout after inactivity
      signOut(auth).catch(err => console.error('Auto-logout failed:', err));
    }, INACTIVITY_TIMEOUT_MS);
  }
}

function clearInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
}

function handleAuthSuccess(user) {
  if (user.uid === KAYLA_UID) {
    // Kayla is logged in
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    document.getElementById('admin-email-display').textContent = user.email;
    // Start inactivity timer for Kayla's session
    resetInactivityTimer();
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
  // Clear inactivity timer when user logs out
  clearInactivityTimer();
  unsubscribeAdminJobs();
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
    // Log actual Firebase error code for debugging
    console.error('Firebase Auth Error:', {
      code: error.code,
      message: error.message
    });

    let message = 'Login failed. Please check your email and password.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      message = 'Incorrect email or password.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/user-disabled') {
      message = 'This account has been disabled.';
    } else if (error.code === 'auth/operation-not-allowed') {
      message = 'Email/password authentication is not enabled.';
    } else if (error.code === 'auth/unauthorized-domain') {
      message = 'This domain is not authorized to access this application.';
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
  const adminPanel = document.getElementById('admin-panel');

  if (loginForm) {
    loginForm.addEventListener('submit', loginAdmin);
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', logoutAdmin);
  }

  // Track user activity to reset inactivity timer
  if (adminPanel) {
    adminPanel.addEventListener('mousemove', resetInactivityTimer);
    adminPanel.addEventListener('keydown', resetInactivityTimer);
    adminPanel.addEventListener('click', resetInactivityTimer);
    adminPanel.addEventListener('touchstart', resetInactivityTimer);
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
