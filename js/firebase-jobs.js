// Public Jobs Loading from Firestore
// Queries only active (published) jobs for public display

import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

async function loadPublicJobs() {
  try {

    const jobsQuery = query(
      collection(db, 'jobs'),
      where('active', '==', true)
    );

    const snapshot = await getDocs(jobsQuery);
    const publicJobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by createdAt (newest first) client-side to avoid index requirement
    publicJobs.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });

    renderPublicJobs(publicJobs);
  } catch (error) {
    console.error("Error loading jobs:", error);
    renderJobsError();
  }
}

function renderPublicJobs(jobs) {
  const jobsList = document.getElementById('jobs-list');
  if (!jobsList) return;

  if (jobs.length === 0) {
    jobsList.innerHTML = `
      <p class="jobs-empty">We're not currently hiring, but check back frequently for new opportunities.</p>
      <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-top: var(--space-md);">Interested in working with Kayla's Kritters? You can send your resume or introduce yourself anytime.</p>
      <p style="margin-top: var(--space-md);"><a href="mailto:kkpcjobs@gmail.com" style="color: var(--color-primary); text-decoration: none; font-weight: var(--font-weight-semibold);">kkpcjobs@gmail.com</a></p>
    `;
    return;
  }

  let jobsHTML = '';
  jobs.forEach(job => {
    const safeTitle = escapeHtml(job.title || '');
    const safeShortDescription = escapeHtml(job.shortDescription || '');
    const safeSchedule = escapeHtml(job.schedule || '');
    const safeRequirements = escapeHtml(job.requirements || '');
    const safeCompensation = job.compensation ? escapeHtml(job.compensation) : null;
    const safeLocation = job.location ? escapeHtml(job.location) : null;
    const safeAdditionalDetails = job.additionalDetails ? escapeHtml(job.additionalDetails) : null;

    jobsHTML += `
      <div class="job-item">
        <div class="job-title">${safeTitle}</div>
        <div class="job-short-description" style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-md);">${safeShortDescription}</div>
        ${safeSchedule ? `<div class="job-detail"><span class="job-detail-label">Schedule:</span> ${safeSchedule}</div>` : ''}
        ${safeCompensation ? `<div class="job-detail"><span class="job-detail-label">Compensation:</span> ${safeCompensation}</div>` : ''}
        ${safeLocation ? `<div class="job-detail"><span class="job-detail-label">Location:</span> ${safeLocation}</div>` : ''}
        <div class="job-detail"><span class="job-detail-label">Requirements:</span> ${safeRequirements}</div>
        ${safeAdditionalDetails ? `<div class="job-detail"><span class="job-detail-label">Details:</span> ${safeAdditionalDetails}</div>` : ''}
        <div style="margin-top: var(--space-md);"><a href="mailto:kkpcjobs@gmail.com" style="color: var(--color-primary); text-decoration: none; font-weight: var(--font-weight-semibold);">Apply: kkpcjobs@gmail.com</a></div>
      </div>
    `;
  });

  jobsList.innerHTML = jobsHTML;
}

function renderJobsError() {
  const jobsList = document.getElementById('jobs-list');
  if (!jobsList) return;

  jobsList.innerHTML = `
    <p class="jobs-empty">We're temporarily unable to load our job listings. Please check back shortly.</p>
    <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-top: var(--space-md);">You can also reach us at <a href="mailto:kkpcjobs@gmail.com" style="color: var(--color-primary);">kkpcjobs@gmail.com</a></p>
  `;
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

// Load jobs when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPublicJobs);
} else {
  loadPublicJobs();
}
