import { create } from 'zustand';
import { auth, db } from '../config/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  instruction: string;
  routine: 'WAKE ROUTINE' | 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'BEDTIME';
  taken: boolean;
  iconType: 'pill' | 'square' | 'circle';
  iconColor: string;
  bgStyle: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface LovedOne {
  id: string;
  name: string;
  relation: string;
  age: number;
  adherence: number;
  risk: string;
  lastSeen: string;
  avatarInitials: string;
  avatarColors: [string, string];
  status: 'online' | 'offline' | 'warning';
}

export interface ActivityFeedItem {
  id: string;
  time: string;
  title: string;
  patientName: string;
  type: 'warning' | 'success' | 'vitals' | 'info';
}

interface AppState {
  user: {
    name: string;
    patientId: string;
    adherenceScore: number;
    daysActive: number;
    caregivers: number;
  } | null;
  medicines: Medicine[];
  notifications: Notification[];
  lovedOnes: LovedOne[];
  activityFeed: ActivityFeedItem[];
  isAuthLoading: boolean;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password?: string, isSignUp?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  takeMedicine: (id: string) => void;
  markNotificationsRead: () => void;
  initAuthListener: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isAuthLoading: true,
  firebaseUser: null,
  user: null,
  medicines: [
    {
      id: '0',
      name: 'Thyroxine',
      dosage: '50µg',
      time: '06:30',
      instruction: 'Empty stomach',
      routine: 'WAKE ROUTINE',
      taken: true,
      iconType: 'pill',
      iconColor: '#f9c846',
      bgStyle: 'pillBgRed'
    },
    {
      id: '1',
      name: 'Metformin',
      dosage: '500mg',
      time: '08:00',
      instruction: 'After food',
      routine: 'BREAKFAST',
      taken: true,
      iconType: 'pill',
      iconColor: '#f9c846',
      bgStyle: 'pillBgRed'
    },
    {
      id: '2',
      name: 'Lisinopril',
      dosage: '10mg',
      time: '09:00',
      instruction: 'With water',
      routine: 'BREAKFAST',
      taken: true,
      iconType: 'square',
      iconColor: '#0a84ff',
      bgStyle: 'pillBgBlue'
    },
    {
      id: '3',
      name: 'Atorvastatin',
      dosage: '20mg',
      time: '13:00',
      instruction: 'After meal',
      routine: 'LUNCH',
      taken: false,
      iconType: 'square',
      iconColor: '#ff9500',
      bgStyle: 'pillBgOrange'
    },
    {
      id: '4',
      name: 'Vitamin D3',
      dosage: '1000IU',
      time: '14:00',
      instruction: 'With meal',
      routine: 'LUNCH',
      taken: false,
      iconType: 'circle',
      iconColor: '#ffd60a',
      bgStyle: 'pillBgYellow'
    },
    {
      id: '5',
      name: 'Metformin',
      dosage: '500mg',
      time: '20:00',
      instruction: 'After food',
      routine: 'DINNER',
      taken: false,
      iconType: 'pill',
      iconColor: '#f9c846',
      bgStyle: 'pillBgRed'
    },
  ],
  notifications: [
    {
      id: 'n1',
      title: 'Time for Metformin',
      message: 'Please take your scheduled 500mg dose after breakfast.',
      time: '10 mins ago',
      read: false,
      type: 'info',
    },
    {
      id: 'n2',
      title: 'Weekly AI Report',
      message: 'Your adherence score has improved by 5%. Keep it up!',
      time: '2 hours ago',
      read: true,
      type: 'success',
    },
    {
      id: 'n3',
      title: 'Missed Dose Alert',
      message: 'You missed your Evening Lisinopril dose. Please consult guidelines.',
      time: 'Yesterday, 8:00 PM',
      read: true,
      type: 'error',
    },
  ],
  lovedOnes: [
    {
      id: 'lo1',
      name: 'Mary Thompson',
      relation: 'Mother',
      age: 72,
      adherence: 96,
      risk: 'Low',
      lastSeen: '2m ago',
      avatarInitials: 'MT',
      avatarColors: ['#00d2ff', '#00e676'],
      status: 'online',
    },
    {
      id: 'lo2',
      name: 'Robert Chen',
      relation: 'Father-in-law',
      age: 78,
      adherence: 74,
      risk: 'Medium',
      lastSeen: '18m ago',
      avatarInitials: 'RC',
      avatarColors: ['#ff9500', '#ff3d00'],
      status: 'warning',
    },
    {
      id: 'lo3',
      name: 'Linda Park',
      relation: 'Aunt',
      age: 68,
      adherence: 88,
      risk: 'Low',
      lastSeen: '5m ago',
      avatarInitials: 'LP',
      avatarColors: ['#9d00ff', '#00d2ff'],
      status: 'online',
    }
  ],
  activityFeed: [
    {
      id: 'af1',
      time: '11:42',
      title: 'Missed: Amlodipine 5mg (45 min overdue)',
      patientName: 'Robert Chen',
      type: 'warning'
    },
    {
      id: 'af2',
      time: '11:38',
      title: 'Verified: Metformin 500mg via camera (97.2%)',
      patientName: 'Mary Thompson',
      type: 'success'
    },
    {
      id: 'af3',
      time: '11:21',
      title: 'Heart rate normal • 74 bpm • resting',
      patientName: 'Linda Park',
      type: 'vitals'
    },
    {
      id: 'af4',
      time: '10:55',
      title: 'Smart pillbox opened — slot 2',
      patientName: 'Robert Chen',
      type: 'info'
    }
  ],
  login: async (email, password = 'password123', isSignUp = false) => {
    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const name = email.split('@')[0];
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        
        // Create initial profile in Firestore
        await setDoc(doc(db, 'users', userCred.user.uid), {
          name: formattedName,
          patientId: `#MG-${Math.floor(10000 + Math.random() * 90000)}`,
          adherenceScore: 100,
          daysActive: 1,
          caregivers: 0,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.warn('Firebase Auth Error, falling back to mock login for preview:', error.message);
      // Fallback to mock state if Firebase is not properly configured
      const name = email.split('@')[0];
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      set({
        user: {
          name: formattedName || 'User',
          patientId: `#MG-${Math.floor(10000 + Math.random() * 90000)}`,
          adherenceScore: 92,
          daysActive: 124,
          caregivers: 2,
        },
        isAuthLoading: false
      });
    }
  },
  logout: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.warn('Firebase Sign Out Error, falling back to mock logout:', error);
    } finally {
      set({ user: null, firebaseUser: null });
    }
  },
  takeMedicine: (id) => set((state) => ({
    medicines: state.medicines.map((med) =>
      med.id === id ? { ...med, taken: true } : med
    ),
  })),
  markNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
  })),
  initAuthListener: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            set({ firebaseUser, user: userDoc.data() as AppState['user'], isAuthLoading: false });
          } else {
            // Fallback for mocked accounts
            set({ 
              firebaseUser, 
              user: {
                name: firebaseUser.email?.split('@')[0] || 'User',
                patientId: '#MG-11111',
                adherenceScore: 90,
                daysActive: 10,
                caregivers: 1,
              }, 
              isAuthLoading: false 
            });
          }
        } catch (error) {
          console.error("Error fetching user data", error);
          set({ firebaseUser, isAuthLoading: false });
        }
      } else {
        set({ firebaseUser: null, user: null, isAuthLoading: false });
      }
    });
  }
}));
