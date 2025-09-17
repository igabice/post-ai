
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "studio-1412386785-35399",
  "appId": "1:668878524270:web:84ba2d1f737b58bc307b7f",
  "storageBucket": "studio-1412386785-35399.firebasestorage.app",
  "apiKey": "AIzaSyAg45fukczyMuARWkCNbnYmsH1kofbsWmE",
  "authDomain": "studio-1412386785-35399.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "668878524270"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
