// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const apiKey =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_FIREBASE_CONFIG_API_KEY
    : process.env.NEXT_PUBLIC_FIREBASE_CONFIG_API_KEY_DEV;
const authDomain =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_FIREBASE_CONFIG_AUTH_DOMAIN
    : process.env.NEXT_PUBLIC_FIREBASE_CONFIG_AUTH_DOMAIN_DEV;
const projectId =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_FIREBASE_CONFIG_PROJECT_ID
    : process.env.NEXT_PUBLIC_FIREBASE_CONFIG_PROJECT_ID_DEV;
const storageBucket =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_FIREBASE_CONFIG_STORAGE_BUCKET
    : process.env.NEXT_PUBLIC_FIREBASE_CONFIG_STORAGE_BUCKET_DEV;
const messagingSenderId =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_FIREBASE_CONFIG_MESSAGING_SENDER_ID
    : process.env.NEXT_PUBLIC_FIREBASE_CONFIG_MESSAGING_SENDER_ID_DEV;
const appId =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_FIREBASE_CONFIG_APP_ID
    : process.env.NEXT_PUBLIC_FIREBASE_CONFIG_APP_ID_DEV;
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { app, storage, firebaseConfig };
