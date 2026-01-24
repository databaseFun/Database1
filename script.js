import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase config — вставь свои значения
const firebaseConfig = {
  apiKey: "ВСТАВЬ_API_KEY",
  authDomain: "firstsitee-7f870.firebaseapp.com",
  projectId: "firstsitee-7f870",
  storageBucket: "firstsitee-7f870.appspot.com",
  messagingSenderId: "586575021031",
  appId: "1:586575021031:web:XXXXXXXX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");

const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const registerBtn = document.getElementById("registerBtn");

// регистрация
registerBtn.onclick = async () => {
  try {
    await createUserWithEmailAndPassword(auth, regEmail.value, regPassword.value);
  } catch (e) {
    alert(e.message);
  }
};

// вход
loginBtn.onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
  } catch (e) {
    alert(e.message);
  }
};

// авто-вход
onAuthStateChanged(auth, user => {
  if (user) {
    alert("Вошёл как: " + user.email);
  }
});
