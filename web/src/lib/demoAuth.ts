export interface DemoAccount {
  role: 'doctor' | 'patient' | 'family';
  name: string;
  email: string;
  password: string;
  title: string;
  subtitle: string;
  badge: string;
  color: 'purple' | 'neon' | 'emerald';
  id: string;
  route: string;
  details: Record<string, string>;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'doctor',
    name: 'Dr. Rajesh Kumar',
    email: 'dr.rajesh.kumar@apollo.in',
    password: 'Password@123',
    title: 'Dr. Rajesh Kumar',
    subtitle: 'Chief Cardiologist • Apollo Hospitals',
    badge: 'Doctor Portal',
    color: 'purple',
    id: '00000000-0000-0000-0000-000000400001',
    route: '/doctor',
    details: {
      specialization: 'Cardiology',
      hospital: 'Apollo Hospitals, Bangalore',
      licenseId: 'KMC10234',
      experience: '15 years',
      phone: '+91 98765 43210'
    }
  },
  {
    role: 'patient',
    name: 'Amit Patel',
    email: 'amit.patel@email.in',
    password: 'Password@123',
    title: 'Amit Patel (MG-PAT-1001)',
    subtitle: 'Cardiac Patient • Daily Adherence 92%',
    badge: 'Patient Portal',
    color: 'neon',
    id: '00000000-0000-0000-0000-000000600001',
    route: '/patient',
    details: {
      age: '58',
      gender: 'Male',
      bloodGroup: 'O+',
      emergencyContact: '+91 98765 43210',
      phone: '+91 98765 43211',
      medicalConditions: 'Hypertension'
    }
  },
  {
    role: 'family',
    name: 'Suresh Patel',
    email: 'suresh.patel@email.in',
    password: 'Password@123',
    title: 'Suresh Patel',
    subtitle: 'Primary Caregiver for Amit Patel',
    badge: 'Family Portal',
    color: 'emerald',
    id: '00000000-0000-0000-0000-000000500001',
    route: '/family',
    details: {
      phone: '+91 98765 43210',
      relation: 'Son / Caregiver'
    }
  }
];

export function findDemoAccount(query: string): DemoAccount | undefined {
  const q = query.toLowerCase().trim();
  if (!q) return undefined;

  // Direct match by email
  const direct = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === q);
  if (direct) return direct;

  // Shortcut match
  if (q === 'doctor' || q.includes('rajesh') || q.includes('kumar') || q.includes('jenkins') || q === 'doc') {
    return DEMO_ACCOUNTS.find(a => a.role === 'doctor');
  }
  if (q === 'patient' || q.includes('amit') || q.includes('patel') || q.includes('alex') || q === 'pat') {
    return DEMO_ACCOUNTS.find(a => a.role === 'patient');
  }
  if (q === 'family' || q === 'caregiver' || q.includes('suresh') || q.includes('mom') || q.includes('sarah')) {
    return DEMO_ACCOUNTS.find(a => a.role === 'family');
  }

  // Fallback match by role prefix if any
  if (q.includes('doctor')) return DEMO_ACCOUNTS.find(a => a.role === 'doctor');
  if (q.includes('patient')) return DEMO_ACCOUNTS.find(a => a.role === 'patient');
  if (q.includes('caregiver') || q.includes('family')) return DEMO_ACCOUNTS.find(a => a.role === 'family');

  return undefined;
}

export function getDemoFormData(role: string) {
  if (role === 'doctor') {
    return {
      fullName: 'Dr. Rajesh Kumar',
      email: 'dr.rajesh.kumar@apollo.in',
      phone: '+91 98765 43210',
      password: 'Password@123',
      specialization: 'Cardiology',
      hospital: 'Apollo Hospitals, Bangalore',
      licenseId: 'KMC10234',
      experience: '15 years',
      age: '',
      gender: '',
      emergencyContact: '',
      medicalConditions: ''
    };
  }
  
  // Default to Patient demo data
  return {
    fullName: 'Amit Patel',
    email: 'amit.patel@email.in',
    phone: '+91 98765 43211',
    password: 'Password@123',
    specialization: '',
    hospital: '',
    licenseId: '',
    experience: '',
    age: '58',
    gender: 'Male',
    emergencyContact: '+91 98765 43210',
    medicalConditions: 'Hypertension'
  };
}
