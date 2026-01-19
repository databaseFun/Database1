import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Конфиг Firebase для твоего проекта
const firebaseConfig = {
  apiKey: "AIzaSyAlrl1dwlRDTSkylFz7sSSH74OGAl1sKZM",  // твой ключ
  authDomain: "firstsitee-7f870.firebaseapp.com",
  projectId: "firstsitee-7f870",
  storageBucket: "firstsitee-7f870.appspot.com",
  messagingSenderId: "586575021031",                   // твой ID
  appId: "1:586575021031:web:replace_this_for_web"    // временно оставь
};

// 🔹 Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Регистрация
window.register = async function() {
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPass").value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    // сохраняем email в базу данных Firestore
    await setDoc(doc(db, "users", user.uid), { email: email });
    alert("Регистрация успешна!");
  } catch (error) {
    alert(error.message);
  }
}

// 🔹 Вход
window.login = async function() {
  const email = document.getElementById("logEmail").value;
  const pass = document.getElementById("logPass").value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("welcome").style.display = "block";
    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "none";
  } catch (error) {
    alert(error.message);
  }
}

// 🔹 Выход
window.logout = async function() {
  await signOut(auth);
  document.getElementById("welcome").style.display = "none";
  document.getElementById("login").style.display = "block";
  document.getElementById("register").style.display = "block";
}
