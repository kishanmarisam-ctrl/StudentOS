import { Job, StudentBackground } from './types';

export const INDIA_LOCATIONS = [
  {
    state: "Andhra Pradesh",
    cities: [
      { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, districts: ["Visakhapatnam", "Anakapalli"] },
      { name: "Vijayawada", lat: 16.5062, lng: 80.6480, districts: ["NTR", "Krishna"] },
      { name: "Tirupati", lat: 13.6288, lng: 79.4192, districts: ["Tirupati", "Chittoor"] }
    ]
  },
  {
    state: "Telangana",
    cities: [
      { name: "Hyderabad", lat: 17.3850, lng: 78.4867, districts: ["Hyderabad", "Rangareddy", "Medchal-Malkajgiri", "Sangareddy"] },
      { name: "Warangal", lat: 17.9689, lng: 79.5941, districts: ["Warangal", "Hanamkonda"] }
    ]
  },
  {
    state: "Karnataka",
    cities: [
      { name: "Bengaluru", lat: 12.9716, lng: 77.5946, districts: ["Bengaluru Urban", "Bengaluru Rural"] },
      { name: "Mysuru", lat: 12.2958, lng: 76.6394, districts: ["Mysuru"] },
      { name: "Hubballi", lat: 15.3647, lng: 75.1240, districts: ["Dharwad"] }
    ]
  },
  {
    state: "Maharashtra",
    cities: [
      { name: "Mumbai", lat: 19.0760, lng: 72.8777, districts: ["Mumbai City", "Mumbai Suburban", "Thane"] },
      { name: "Pune", lat: 18.5204, lng: 73.8567, districts: ["Pune"] },
      { name: "Nagpur", lat: 21.1458, lng: 79.0882, districts: ["Nagpur"] }
    ]
  },
  {
    state: "Tamil Nadu",
    cities: [
      { name: "Chennai", lat: 13.0827, lng: 80.2707, districts: ["Chennai", "Kancheepuram", "Tiruvallur"] },
      { name: "Coimbatore", lat: 11.0168, lng: 76.9558, districts: ["Coimbatore"] },
      { name: "Madurai", lat: 9.9252, lng: 78.1198, districts: ["Madurai"] }
    ]
  },
  {
    state: "Delhi (UT)",
    cities: [
      { name: "New Delhi", lat: 28.6139, lng: 77.2090, districts: ["New Delhi", "Central Delhi", "South Delhi", "NCR"] }
    ]
  },
  {
    state: "Uttar Pradesh",
    cities: [
      { name: "Noida", lat: 28.5355, lng: 77.3910, districts: ["Gautam Buddha Nagar"] },
      { name: "Lucknow", lat: 26.8467, lng: 80.9462, districts: ["Lucknow"] }
    ]
  },
  {
    state: "Gujarat",
    cities: [
      { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, districts: ["Ahmedabad"] },
      { name: "Surat", lat: 21.1702, lng: 72.8311, districts: ["Surat"] },
      { name: "Vadodara", lat: 22.3072, lng: 73.1812, districts: ["Vadodara"] }
    ]
  },
  {
    state: "West Bengal",
    cities: [
      { name: "Kolkata", lat: 22.5726, lng: 88.3639, districts: ["Kolkata", "Howrah", "North 24 Parganas"] }
    ]
  },
  {
    state: "Haryana",
    cities: [
      { name: "Gurugram", lat: 28.4595, lng: 77.0266, districts: ["Gurugram"] }
    ]
  }
];

export const MOCK_JOBS: Job[] = [
  // --- IT & SOFTWARE ---
  {
    id: '1',
    title: 'Junior React Developer',
    company: 'TechMahindra Innovation',
    state: 'Telangana',
    city: 'Hyderabad',
    district: 'Rangareddy',
    location: 'Hitech City, Hyderabad',
    lat: 17.4435, lng: 78.3772,
    distanceKm: 0,
    salary: 450000,
    requiredSkills: ['React', 'JavaScript', 'HTML5', 'CSS3'],
    description: 'Frontend specialist role in the heart of Hyderabad tech hub.',
    postedDate: '2023-10-25',
    minExperienceYears: 0,
    isRemote: false,
    applyUrl: 'https://example.com/apply/in1',
    category: StudentBackground.ENGINEERING
  },
  {
    id: '11',
    title: 'Python Developer Trainee',
    company: 'Wipro Digital',
    state: 'Karnataka',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    location: 'Sarjapur, Bengaluru',
    lat: 12.9229, lng: 77.6744,
    distanceKm: 0,
    salary: 420000,
    requiredSkills: ['Python', 'SQL', 'Django', 'Git'],
    description: 'Build backend systems for large scale cloud infrastructure.',
    postedDate: '2023-10-30',
    minExperienceYears: 0,
    isRemote: false,
    applyUrl: 'https://example.com/apply/in11',
    category: StudentBackground.ENGINEERING
  },
  {
    id: '12',
    title: 'Data Science Intern',
    company: 'Zomato AI',
    state: 'Haryana',
    city: 'Gurugram',
    district: 'Gurugram',
    location: 'DLF Phase 5, Gurugram',
    lat: 28.4595, lng: 77.0266,
    distanceKm: 0,
    salary: 600000,
    requiredSkills: ['Python', 'Statistics', 'Pandas', 'SQL'],
    description: 'Help optimize delivery routes using predictive modeling.',
    postedDate: '2023-10-31',
    minExperienceYears: 0,
    isRemote: false,
    applyUrl: 'https://example.com/apply/in12',
    category: StudentBackground.SCIENCE
  },

  // --- AUTOMOBILE & MECHANICAL ---
  {
    id: '3',
    title: 'Graduate Engineer Trainee',
    company: 'Tata Motors',
    state: 'Maharashtra',
    city: 'Pune',
    district: 'Pune',
    location: 'Pimpri-Chinchwad, Pune',
    lat: 18.6298, lng: 73.7997,
    distanceKm: 0,
    salary: 500000,
    requiredSkills: ['AutoCAD', 'Thermodynamics', 'Production Planning'],
    description: 'GET role in EV manufacturing assembly line.',
    postedDate: '2023-10-27',
    minExperienceYears: 0,
    isRemote: false,
    applyUrl: 'https://example.com/apply/in3',
    category: StudentBackground.ENGINEERING
  },
  {
    id: '13',
    title: 'Industrial Designer',
    company: 'Godrej & Boyce',
    state: 'Maharashtra',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    location: 'Vikhroli, Mumbai',
    lat: 19.1030, lng: 72.9250,
    distanceKm: 0,
    salary: 480000,
    requiredSkills: ['SolidWorks', 'Product Design', 'Keyshot'],
    description: 'Design the next generation of consumer home appliances.',
    postedDate: '2023-10-29',
    minExperienceYears: 0,
    isRemote: false,
    applyUrl: 'https://example.com/apply/in13',
    category: StudentBackground.ENGINEERING
  },

  // --- PHARMA & SCIENCE ---
  {
    id: '5',
    title: 'QC Chemist',
    company: 'Dr. Reddy\'s Labs',
    state: 'Telangana',
    city: 'Hyderabad',
    district: 'Medchal-Malkajgiri',
    location: 'Bachupally, Hyderabad',
    lat: 17.5254, lng: 78.3713,
    distanceKm: 0,
    salary: 300000,
    requiredSkills: ['Chemistry', 'HPLC', 'Lab Safety'],
    description: 'Drug quality assurance and documentation.',
    postedDate: '2023-10-28',
    minExperienceYears: 0,
    isRemote: false,
    applyUrl: 'https://example.com/apply/in5',
    category: StudentBackground.PHARMA
  },

  // --- COMMERCE & FINANCE ---
  {
    id: '6',
    title: 'Retail Banking Officer',
    company: 'HDFC Bank',
    state: 'Maharashtra',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    location: 'Andheri East, Mumbai',
    lat: 19.1136, lng: 72.8697,
    distanceKm: 0,
    salary: 320000,
    requiredSkills: ['Banking', 'Sales', 'Communication'],
    description: 'Branch banking role focusing on retail customer acquisition.',
    postedDate: '2023-10-25',
    minExperienceYears: 0,
    isRemote: false,
    applyUrl: 'https://example.com/apply/in6',
    category: StudentBackground.COMMERCE
  },
  {
    id: '14',
    title: 'Accounts Executive',
    company: 'Reliance Retail',
    state: 'Maharashtra',
    city: 'Mumbai',
    district: 'Thane',
    location: 'Ghansoli, Navi Mumbai',
    lat: 19.1245, lng: 73.0010,
    distanceKm: 0,
    salary: 280000,
    requiredSkills: ['Tally', 'GST', 'Excel', 'Accounting'],
    description: 'Manage store-level financial operations and compliance.',
    postedDate: '2023-10-28',
    minExperienceYears: 0,
    isRemote: false,
    applyUrl: 'https://example.com/apply/in14',
    category: StudentBackground.COMMERCE
  },

  // --- ARTS & CONTENT ---
  {
    id: '9',
    title: 'Social Media Executive',
    company: 'Nykaa',
    state: 'Maharashtra',
    city: 'Mumbai',
    district: 'Mumbai City',
    location: 'Lower Parel, Mumbai',
    lat: 18.9977, lng: 72.8376,
    distanceKm: 0,
    salary: 360000,
    requiredSkills: ['Instagram', 'Content Writing', 'Canva'],
    description: 'Drive growth for India\'s leading beauty platform.',
    postedDate: '2023-10-21',
    minExperienceYears: 0,
    isRemote: false,
    applyUrl: 'https://example.com/apply/in9',
    category: StudentBackground.ARTS
  },
  {
    id: '15',
    title: 'UX Researcher (Fresher)',
    company: 'PhonePe',
    state: 'Karnataka',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    location: 'Bellandur, Bengaluru',
    lat: 12.9279, lng: 77.6784,
    distanceKm: 0,
    salary: 550000,
    requiredSkills: ['User Research', 'Empathy', 'Communication', 'Figma'],
    description: 'Understand user pain points for India\'s payment app.',
    postedDate: '2023-10-31',
    minExperienceYears: 0,
    isRemote: false,
    applyUrl: 'https://example.com/apply/in15',
    category: StudentBackground.ARTS
  },
  
  // --- GENERALIST / OTHER ---
  {
    id: '16',
    title: 'Operations Coordinator',
    company: 'Delhivery',
    state: 'Delhi (UT)',
    city: 'New Delhi',
    district: 'South Delhi',
    location: 'Okhla, Delhi',
    lat: 28.5355, lng: 77.2639,
    distanceKm: 0,
    salary: 300000,
    requiredSkills: ['Excel', 'Logistics', 'Problem Solving'],
    description: 'Monitor intra-city hub shipments and vendor management.',
    postedDate: '2023-11-01',
    minExperienceYears: 0,
    isRemote: false,
    applyUrl: 'https://example.com/apply/in16',
    category: StudentBackground.OTHER
  }
];

export const INITIAL_SKILLS = [
  "Communication", "Excel", "Tally", "Java", "Python",
  "AutoCAD", "SolidWorks", "Site Mgmt", "Accounting", "GST",
  "Teaching", "Photoshop", "Video Editing", "Sales", "Banking",
  "React", "JavaScript", "SQL", "Spring Boot", "Figma", "Canva"
];