export default function handler(req, res) {
  // simple mocked job data with keywords
  const jobs = [
    {
      id: 'j-001',
      title: 'IT Support Specialist',
      company: 'TechBridge Kenya',
      industry: 'IT',
      location: 'Nairobi, Kenya',
      posted: '2025-10-20',
      deadline: '2025-11-05',
      link: 'https://techbridge.co.ke/careers',
      logo: '/assets/techbridge.png',
      keywords: ['it support','troubleshooting','network','windows','support'],
      extras: 0
    },
    {
      id: 'j-002',
      title: 'Front-End Developer',
      company: 'Andela',
      industry: 'Software',
      location: 'Remote',
      posted: '2025-10-21',
      deadline: '2025-11-10',
      link: 'https://andela.com/careers',
      logo: '/assets/andela.png',
      keywords: ['javascript','react','html','css','frontend'],
      extras: 0
    },
    {
      id: 'j-003',
      title: 'Pharmacy Assistant',
      company: 'Goodlife Pharmacy',
      industry: 'Health',
      location: 'Nairobi, Kenya',
      posted: '2025-10-18',
      deadline: '2025-11-01',
      link: 'https://goodlife.co.ke/careers',
      logo: '/assets/goodlife.png',
      keywords: ['pharmacy','customer service','inventory','dispensing','healthcare'],
      extras: 0
    },
    {
      id: 'j-004',
      title: 'Data Analyst',
      company: 'Safaricom',
      industry: 'Telecom',
      location: 'Nairobi, Kenya',
      posted: '2025-10-10',
      deadline: '2025-11-20',
      link: 'https://careers.safaricom.co.ke',
      logo: '/assets/safaricom.png',
      keywords: ['data analysis','sql','excel','python','analytics'],
      extras: 0
    }
  ];

  const q = (req.query.q || '').toLowerCase();
  const industry = (req.query.industry || '').toLowerCase();

  let filtered = jobs.filter(j => {
    let matchQ = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.industry || '').toLowerCase().includes(q);
    let matchIndustry = !industry || (j.industry && j.industry.toLowerCase() === industry);
    return matchQ && matchIndustry;
  });

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=59');
  res.status(200).json({ jobs: filtered });
}
