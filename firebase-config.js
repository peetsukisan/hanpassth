// Firebase Configuration

const firebaseConfig = {
    apiKey: "AIzaSyBnWxFn0luYDejWisIKtxSFPkVPc0Lzy41",
    authDomain: "hanpass-promo.firebaseapp.com",
    projectId: "hanpass-promo",
    storageBucket: "hanpass-promo.firebasestorage.app",
    messagingSenderId: "455629320584",
    appId: "1:455629320584:web:c288669dda698436b691cd"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Export for use in other scripts
window.db = db;

console.log('Firebase initialized successfully');
