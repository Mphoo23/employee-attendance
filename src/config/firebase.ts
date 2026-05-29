import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDZt4Fdwpx6RmgK77wihs2MKrJyzyx3GTY",
  authDomain: "employee-38d1e.firebaseapp.com",
  projectId: "employee-38d1e",
  storageBucket: "employee-38d1e.appspot.com",
  messagingSenderId: "618399953290",
  appId: "1:618399953290:web:221c8547465de40b8e5873"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);