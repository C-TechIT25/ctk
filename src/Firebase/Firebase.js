// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBConDdOXDPmTbqK_4zCSDHn9CMtcnnEmw",
  authDomain: "ctechfiesta.firebaseapp.com",
  projectId: "ctechfiesta",
  storageBucket: "ctechfiesta.firebasestorage.app",
  messagingSenderId: "145747295997",
  appId: "1:145747295997:web:42f81e461d525d8e7a0894"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


export default app;