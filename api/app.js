/* Springsign frontend interactivity */
/* Simple client-side logic: menu toggle, profile dropdown, search, render jobs, cv storage, assessment, alerts */

const sideMenu = document.getElementById('sideMenu');
const menuBtn = document.getElementById('menuBtn');
const closeMenu = document.getElementById('closeMenu');
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultsInner = document.getElementById('resultsInner');
const jobTpl = document.getElementById('jobTpl');
const cvModal = document.getElementById('cvModal');
const cvInput = document.getElementById('cvInput');
const saveCv = document.getElementById('saveCv');
const cvBtn = document.getElementById('cvBtn');
const recModal = document.getElementById('recModal');
const recTitle = document.getElementById('recTitle');
const recBody = document.getElementById('recBody');
const addCertBtn = document.getElementById('addCertBtn');
const alertBtn = document.getElementById('alertBtn');
const alertBadge = document.getElementById('alertBadge');

let jobsCache = [];
let alerts = JSON.parse(localStorage.getItem('springsign_alerts') || '[]');
updateAlertBadge();

menuBtn.addEventListener('click', () => sideMenu.classList.add('open'));
closeMenu.addEventListener('click', () => sideMenu.classList.remove('open'));
document.querySelectorAll('[data-close]').forEach(btn=>{
  btn.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.close;
    document.getElementById(id).classList.add('hidden');
  });
});

profileBtn.addEventListener('click', () => {
  profileDropdown.classList.toggle('hidden');
});

searchBtn.addEventListener('click', () => {
  const q = searchInput.value.trim();
  fetchJobs(q);
});

cvBtn.addEventListener('click', () => {
  cvModal.classList.remove('hidden');
  cvModal.setAttribute('aria-hidden','false');
  const stored = localStorage.getItem('springsign_cv') || '';
  cvInput.value = stored;
});

saveCv.addEventListener('click', () => {
  localStorage.setItem('springsign_cv', cvInput.value || '');
  cvModal.classList.add('hidden');
  updateNotice('CV saved locally.');
});

function fetchJobs(q=''){
  resultsInner.innerHTML = `<p class="placeholder">Loading jobs…</p>`;
  const industry = document.getElementById('filterIndustry').value || '';
  // call the api
  fetch(`/api/jobs?q=${encodeURIComponent(q)}&industry=${encodeURIComponent(industry)}`)
    .then(r=>r.json())
    .then(data=>{
      jobsCache = data.jobs || [];
      renderJobs(jobsCache);
    })
    .catch(err=>{
      console.error(err);
      resultsInner.innerHTML = `<p class="placeholder">Failed to load jobs.</p>`;
    });
}

function renderJobs(list){
  if(!list || list.length === 0){
    resultsInner.innerHTML = `<p class="placeholder">No jobs found.</p>`;
    return;
  }
  resultsInner.innerHTML = '';
  list.forEach((job, idx) => {
    const node = jobTpl.content.cloneNode(true);
    node.querySelector('.company-logo').src = job.logo || 'assets/company-placeholder.png';
    node.querySelector('.company-name').textContent = job.company;
    node.querySelector('.company-details').textContent = `${job.location} • ${job.industry}`;
    node.querySelector('.job-title').textContent = job.title;
    node.querySelector('.posted').textContent = job.posted;
    node.querySelector('.deadline').textContent = job.deadline || '—';
    const linkEl = node.querySelector('.link');
    linkEl.href = job.link || '#';
    // meter
    const meterFill = node.querySelector('.meter-fill');
    const meterPercent = node.querySelector('.meter-percent');

    // action: assess
    const assessBtn = node.querySelector('.assessBtn');
    assessBtn.addEventListener('click', ()=>{
      assessCandidate(job, meterFill, meterPercent);
    });

    // bell alert
    const bell = node.querySelector('.bell-btn');
    bell.addEventListener('click', ()=>{
      addJobAlert(job);
      bell.textContent = '🔕';
    });

    resultsInner.appendChild(node);
  });
}

function assessCandidate(job, meterFill, meterPercent){
  const cvText = localStorage.getItem('springsign_cv') || '';
  // simple scoring: count matching keywords
  const keywords = (job.keywords || []).map(k=>k.toLowerCase());
  const cvLower = cvText.toLowerCase();
  let matches = 0;
  for(const kw of keywords){
    if(cvLower.includes(kw)) matches++;
  }
  // baseline skills weight
  const baseScore = Math.round((matches / Math.max(keywords.length,1)) * 100);
  // contributions or certifications stored on job? we simulate extras
  const extras = job.extras || 0;
  const final = Math.min(100, baseScore + extras);
  meterFill.style.width = final + '%';
  meterPercent.textContent = final + '%';

  // show recommendations modal with missing keywords as suggestions
  const missing = keywords.filter(k => !cvLower.includes(k));
  recTitle.textContent = `Recommendations — ${job.title} @ ${job.company}`;
  recBody.innerHTML = `
    <p class="muted">You scored <strong>${final}%</strong>. Improve with:</p>
    <ul>
      ${missing.length ? missing.map(m=>`<li>${m}</li>`).join('') : '<li>All core keywords present — consider highlighting experience and certifications.</li>'}
    </ul>
    <div class="muted">Tip: Click "Add Certification" to simulate adding a credential (this will increase your suitability score).</div>
  `;
  recModal.classList.remove('hidden');
  recModal.setAttribute('aria-hidden','false');

  // addCertBtn sets localStorage "certs" to increment extras for this job in memory:
  addCertBtn.onclick = () => {
    // store a certification that will increase score next assessment
    const certs = JSON.parse(localStorage.getItem('springsign_certs') || '{}');
    certs[job.id] = (certs[job.id] || 0) + 15; // +15 points for example
    localStorage.setItem('springsign_certs', JSON.stringify(certs));
    // update job extras and re-assess
    job.extras = certs[job.id];
    assessCandidate(job, meterFill, meterPercent);
  };
}

// alerts
function addJobAlert(job){
  alerts.push({id:job.id, title:job.title, company:job.company, ts:Date.now()});
  localStorage.setItem('springsign_alerts', JSON.stringify(alerts));
  updateAlertBadge();
  updateNotice('Alert saved for this job.');
}
function updateAlertBadge(){
  const count = alerts.length || 0;
  if(count>0){
    alertBadge.classList.remove('hidden');
    alertBadge.textContent = count;
  } else {
    alertBadge.classList.add('hidden');
  }
}
alertBtn.addEventListener('click', ()=>{
  // open a small alert drawer (for demo we show an alert list)
  const list = alerts.map(a=>`• ${a.title} @ ${a.company}`).join('<br>') || 'No alerts set.';
  alertBadge.classList.add('hidden');
  alertBadge.textContent = '0';
  alertBtn.blur();
  alertBadge.classList.toggle('hidden', alerts.length===0);
  updateNotice('Alerts: ' + (alerts.length ? alerts.length + ' saved' : 'no alerts'));
});

// small toaster
function updateNotice(msg){
  console.log('NOTICE:', msg);
  // optional: small in-page toast; for simplicity we use console and a brief ephemeral title change
  const old = document.title;
  document.title = msg;
  setTimeout(()=> document.title = old, 2200);
}

/* Initialize: fetch default jobs on load */
document.addEventListener('DOMContentLoaded', ()=> fetchJobs(''));
