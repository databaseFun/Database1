// 🔹 Импорты Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 Конфиг Firebase (твой проект)
const firebaseConfig = {
  apiKey: "AIzaSyAlrl1dwlRDTSkylFz7sSSH74OGAl1sKZM",
  authDomain: "firstsitee-7f870.firebaseapp.com",
  projectId: "firstsitee-7f870",
  storageBucket: "firstsitee-7f870.appspot.com",
  messagingSenderId: "586575021031",
  appId: "1:586575021031:web:replace_this_for_web"
};

// 🔹 Инициализация
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let countdownInterval; // для таймера обратного отсчета

// 🔹 Регистрация (30 секунд жизни аккаунта)
window.register = async function() {
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPass").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 1000); // +30 секунд

    await setDoc(doc(db, "users", user.uid), {
      email: email,
      registeredAt: now.toISOString(),
      expiresAt: expires.toISOString()
    });

    alert("Регистрация успешна! Аккаунт будет жить 30 секунд.");
  } catch (error) {
    alert(error.message);
  }
}

// 🔹 Вход + таймер обратного отсчета
window.login = async function() {
  const email = document.getElementById("logEmail").value;
  const pass = document.getElementById("logPass").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) throw new Error("Данных пользователя нет");

    const data = docSnap.data();
    const expires = new Date(data.expiresAt);
    const registeredAt = new Date(data.registeredAt);

    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("welcome").style.display = "block";
    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "none";

    // запускаем таймер
    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(async () => {
      const now = new Date();
      const diff = Math.floor((expires - now) / 1000); // разница в секундах

      if (diff <= 0) {
        clearInterval(countdownInterval);
        alert("Время аккаунта истекло!");
        await deleteDoc(docRef);
        await deleteUser(user);
        document.getElementById("welcome").style.display = "none";
        document.getElementById("login").style.display = "block";
        document.getElementById("register").style.display = "block";
      } else {
        document.getElementById("accountTime").textContent =
          `Осталось: ${diff} секунд (с ${registeredAt.toLocaleTimeString()} до ${expires.toLocaleTimeString()})`;
      }
    }, 1000);

  } catch (error) {
    alert(error.message);
  }
}

// 🔹 Выход
window.logout = async function() {
  if (countdownInterval) clearInterval(countdownInterval);
  await signOut(auth);
  document.getElementById("welcome").style.display = "none";
  document.getElementById("login").style.display = "block";
  document.getElementById("register").style.display = "block";
}
