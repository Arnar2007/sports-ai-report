import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNddU67YVTVxtu2JwifpXI5UnRwEhto1g",
  authDomain: "sports-ai-report.firebaseapp.com",
  projectId: "sports-ai-report",
  storageBucket: "sports-ai-report.appspot.com",
  messagingSenderId: "1058088511938",
  appId: "1:1058088511938:web:3c6f6cef2e77ad29930e5b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

window.db = db;
window.auth = auth;
window.provider = provider;

window.collection = collection;
window.addDoc = addDoc;
window.getDocs = getDocs;
window.deleteDoc = deleteDoc;
window.doc = doc;
window.query = query;
window.where = where;
window.updateDoc = updateDoc;

window.signInWithPopup = signInWithPopup;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;

console.log("Firebase + Google Login connected!");