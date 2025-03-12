import { initializeApp, getApps } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyB5DygieJlH_R4dUbGPsNzdPcVQFrFHTc4",
  authDomain: "dependable-glow-439512-m5.firebaseapp.com",
  projectId: "dependable-glow-439512-m5",
  messagingSenderId: "94369390250",
  appId: "1:94369390250:web:e3015603c2938e2ecafad3",
  databaseURL: "",
  storageBucket: ""
};

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export { firebaseApp };
