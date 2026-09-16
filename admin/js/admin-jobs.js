// Admin Job Management
// CRUD operations for job listings

import { db } from '../../js/firebase-config.js';
import { collection, query, getDocs, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const KAYLA_UID = "p7AzNLbUlfPy3agBd1mMtePsxPa2";
let allJobs = [];
let currentUser = null;

// Export setter for currentUser (called by admin-auth.js)
export function setCurrentUser(user) {
  currentUser = user;
  if (user && user.uid === KAYLA_UID) {
    loadAdminJobs();
  }
}

async function loadAdminJobs() {
  const jobsQuery = query(collection(db, 'jobs'));

  // Real-time listener for all jobs (Kayla can see published and unpublished)
  onSnapshot(jobsQuery, (snapshot) => {
    allJobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    renderAdminJobsList();
  });
}

function renderAdminJobsList() {
  const jobsList = document.getElementById('admin-jobs-list');
  if (!jobsList) return;

  if (allJobs.length === 0) {
    jobsList.innerHTML = '<p style="color: var(--color-text-muted);">No jobs yet. Create your first job opening.</p>';
    return;
  }

  let html = '';
  allJobs.forEach(job => {
    const status = job.active ? '✓ Published' : '○ Draft';
    const statusColor = job.active ? 'var(--color-primary)' : 'var(--color-text-muted)';

    html += `
      <div style="padding: var(--space-md); background-color: var(--color-bg-cream); border-radius: var(--radius-sm); margin-bottom: var(--space-md); border-left: 4px solid ${statusColor};">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-sm);">
          <div>
            <div style="font-weight: var(--font-weight-semibold); color: var(--color-primary);">${escapeHtml(job.title)}</div>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-top: 4px;">${escapeHtml(job.shortDescription)}</div>
            <div style="font-size: var(--font-size-xs); color: ${statusColor}; margin-top: var(--space-sm);">${status}</div>
          </div>
        </div>
        <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
          <button onclick="editJob('${job.id}')" style="padding: 6px 12px; background-color: var(--color-primary); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--font-size-xs);">Edit</button>
          <button onclick="togglePublish('${job.id}', ${!job.active})" style="padding: 6px 12px; background-color: ${job.active ? 'var(--color-text-muted)' : 'var(--color-primary)'}; color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--font-size-xs);">${job.active ? 'Unpublish' : 'Publish'}</button>
          <button onclick="deleteJob('${job.id}')" style="padding: 6px 12px; background-color: #d32f2f; color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--font-size-xs);">Delete</button>
        </div>
      </div>
    `;
  });

  jobsList.innerHTML = html;
}

function showAddJobForm() {
  document.getElementById('job-form-container').style.display = 'block';
  document.getElementById('job-id-input').value = '';
  document.getElementById('job-title-input').value = '';
  document.getElementById('job-short-description-input').value = '';
  document.getElementById('job-schedule-input').value = '';
  document.getElementById('job-compensation-input').value = '';
  document.getElementById('job-location-input').value = '';
  document.getElementById('job-requirements-input').value = '';
  document.getElementById('job-details-input').value = '';
  document.getElementById('form-title').textContent = 'Add New Job';
  document.getElementById('form-error').textContent = '';
}

function cancelJobForm() {
  document.getElementById('job-form-container').style.display = 'none';
}

async function editJob(jobId) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  document.getElementById('job-id-input').value = jobId;
  document.getElementById('job-title-input').value = job.title || '';
  document.getElementById('job-short-description-input').value = job.shortDescription || '';
  document.getElementById('job-schedule-input').value = job.schedule || '';
  document.getElementById('job-compensation-input').value = job.compensation || '';
  document.getElementById('job-location-input').value = job.location || '';
  document.getElementById('job-requirements-input').value = job.requirements || '';
  document.getElementById('job-details-input').value = job.additionalDetails || '';
  document.getElementById('form-title').textContent = 'Edit Job';
  document.getElementById('form-error').textContent = '';
  document.getElementById('job-form-container').style.display = 'block';

  document.getElementById('job-title-input').focus();
}

async function saveJob() {
  const jobId = document.getElementById('job-id-input').value.trim();
  const title = document.getElementById('job-title-input').value.trim();
  const shortDescription = document.getElementById('job-short-description-input').value.trim();
  const schedule = document.getElementById('job-schedule-input').value.trim();
  const compensation = document.getElementById('job-compensation-input').value.trim();
  const location = document.getElementById('job-location-input').value.trim();
  const requirements = document.getElementById('job-requirements-input').value.trim();
  const details = document.getElementById('job-details-input').value.trim();
  const errorDisplay = document.getElementById('form-error');

  errorDisplay.textContent = '';

  if (!title || !shortDescription || !schedule || !requirements) {
    errorDisplay.textContent = 'Title, short description, schedule, and requirements are required.';
    return;
  }

  const saveButton = event.target;
  saveButton.disabled = true;
  saveButton.textContent = 'Saving...';

  try {
    const jobData = {
      title,
      shortDescription,
      schedule,
      compensation: compensation || null,
      location: location || null,
      requirements,
      additionalDetails: details || null,
      active: false,
      updatedAt: serverTimestamp()
    };

    if (!jobId) {
      // New job
      jobData.createdAt = serverTimestamp();
      const docRef = doc(collection(db, 'jobs'));
      await setDoc(docRef, jobData);
    } else {
      // Update existing
      const jobRef = doc(db, 'jobs', jobId);
      await setDoc(jobRef, jobData, { merge: true });
    }

    cancelJobForm();
  } catch (error) {
    console.error('Error saving job:', error);
    errorDisplay.textContent = 'Failed to save job. Please try again.';
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = 'Save Job';
  }
}

async function togglePublish(jobId, newActiveState) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  try {
    const jobRef = doc(db, 'jobs', jobId);
    await setDoc(jobRef, {
      active: newActiveState,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error toggling publish:', error);
    alert('Failed to update job. Please try again.');
  }
}

async function deleteJob(jobId) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  if (!confirm(`Are you sure you want to delete "${escapeHtml(job.title)}"? This cannot be undone.`)) {
    return;
  }

  try {
    const jobRef = doc(db, 'jobs', jobId);
    await deleteDoc(jobRef);
  } catch (error) {
    console.error('Error deleting job:', error);
    alert('Failed to delete job. Please try again.');
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize when admin panel loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadAdminJobs, 500);
  });
} else {
  setTimeout(loadAdminJobs, 500);
}
