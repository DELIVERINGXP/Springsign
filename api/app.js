document.getElementById("searchBtn").addEventListener("click", async () => {
  const query = document.getElementById("searchInput").value.trim();
  const resultsContainer = document.getElementById("resultsContainer");

  if (!query) {
    resultsContainer.innerHTML = `<p class="placeholder">Please enter a search term.</p>`;
    return;
  }

  resultsContainer.innerHTML = `<p class="placeholder">Searching for "${query}"...</p>`;

  const res = await fetch(`/api/jobs?q=${encodeURIComponent(query)}`);
  const data = await res.json();

  if (data.jobs.length === 0) {
    resultsContainer.innerHTML = `<p class="placeholder">No jobs found for "${query}".</p>`;
    return;
  }

  resultsContainer.innerHTML = data.jobs.map(job => `
    <div class="job-card">
      <h3>${job.title}</h3>
      <p><strong>Company:</strong> ${job.company}</p>
      <p><strong>Industry:</strong> ${job.industry}</p>
      <a href="${job.link}" target="_blank">View Details →</a>
    </div>
  `).join('');
});
  
