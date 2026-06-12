import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

window.db = db;
window.collection = collection;
window.addDoc = addDoc;
window.getDocs = getDocs;
window.deleteDoc = deleteDoc;
window.doc = doc;

console.log("Firebase connected!");