// firebaseConfig.js
import { getApp, initializeApp } from '@react-native-firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyB5DygieJlH_R4dUbGPsNzdPcVQFrFHTc4",
    authDomain: "dependable-glow-439512-m5.firebaseapp.com",
    projectId: "dependable-glow-439512-m5",
    messagingSenderId: "94369390250",
    appId: "1:94369390250:web:e3015603c2938e2ecafad3",
  };

let firebaseApp;

try {
  firebaseApp = getApp();
} catch (error) {
  firebaseApp = initializeApp(firebaseConfig);
}

export { firebaseApp };