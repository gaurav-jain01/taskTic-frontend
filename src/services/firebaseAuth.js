import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD9Fujkp2XQ35hO6m3XYqJKdhIBYagHRy8",
    authDomain: "tasktic-fe539.firebaseapp.com",
    projectId: "tasktic-fe539",
    storageBucket: "tasktic-fe539.firebasestorage.app",
    messagingSenderId: "959160422529",
    appId: "1:959160422529:web:acafb6bc6c70da4780bd80"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);