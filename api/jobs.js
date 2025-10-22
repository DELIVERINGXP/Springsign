export default function handler(req, res) {
  const { q } = req.query;

  const sampleJobs = [
    { title: "IT Support Specialist", company: "TechBridge Kenya", industry: "IT", link: "https://techbridge.co.ke/careers" },
    { title: "Front-End Developer", company: "Andela", industry: "Software", link: "https://andela.com/careers" },
    { title: "Data Analyst", company: "Safaricom", industry: "Telecom", link: "https://careers.safaricom.co.ke" },
    { title: "Network Engineer", company: "Huawei Kenya", industry: "Telecom", link: "https://huawei.com/ke/careers" },
    { title: "Pharmacy Assistant", company: "Goodlife Pharmacy", industry: "Health", link: "https://goodlife.co.ke/careers" }
  ];

  const filtered = sampleJobs.filter(job =>
    job.title.toLowerCase().includes(q.toLowerCase()) ||
    job.company.toLowerCase().includes(q.toLowerCase()) ||
    job.industry.toLowerCase().includes(q.toLowerCase())
  );

  res.status(200).json({ jobs: filtered });
     }
     
