import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Твой API Key
const firebaseConfig = {
  apiKey: "AIzaSyAlrl1dwlRDTSkylFz7sSSH74OGAl1sKZM",
  authDomain: "firstsitee-7f870.firebaseapp.com",
  projectId: "firstsitee-7f870",
  storageBucket: "firstsitee-7f870.appspot.com",
  messagingSenderId: "586575021031",
  appId: "1:586575021031:android:6f2cb0bf62771dc148f342"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Элементы
const loginBox = document.getElementById("loginBox");
const registerBox = document.getElementById("registerBox");
const questionBox = document.getElementById("questionBox");
const adminBox = document.getElementById("adminBox");
const answersBox = document.getElementById("answersBox");
const answersList = document.getElementById("answersList");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");

const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const registerBtn = document.getElementById("registerBtn");

const showRegisterBtn = document.getElementById("showRegister");
const showLoginBtn = document.getElementById("showLogin");

const submitAnswerBtn = document.getElementById("submitAnswer");
const beAdminBtn = document.getElementById("beAdmin");
const notAdminBtn = document.getElementById("notAdmin");

// Переключение форм
showRegisterBtn.onclick = () => {
  loginBox.classList.add("hidden");
  registerBox.classList.remove("hidden");
};
showLoginBtn.onclick = () => {
  registerBox.classList.add("hidden");
  loginBox.classList.remove("hidden");
};

// Обработка ошибок
function handleAuthError(e) {
  switch(e.code){
    case "auth/invalid-email": alert("Введите почту правильно! (name@gmail.com)"); break;
    case "auth/user-not-found": alert("Пользователь не найден."); break;
    case "auth/wrong-password": alert("Неверный пароль."); break;
    case "auth/email-already-in-use": alert("Эта почта уже зарегистрирована."); break;
    case "auth/weak-password": alert("Пароль слишком простой."); break;
    default: alert(e.message); break;
  }
}

// Регистрация
registerBtn.onclick = async () => {
  try {
    await createUserWithEmailAndPassword(auth, regEmail.value, regPassword.value);
    alert("Регистрация успешна!");
  } catch(e) {
    handleAuthError(e);
  }
};

// Вход
loginBtn.onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
  } catch(e) {
    handleAuthError(e);
  }
};

// После входа
onAuthStateChanged(auth, async user => {
  if(user){
    loginBox.classList.add("hidden");
    registerBox.classList.add("hidden");

    // Показываем админ-бокс
    adminBox.classList.remove("hidden");

    // Сохраняем UID
    window.currentUser = user.uid;
  }
});

// Админ выбирает "Да"
beAdminBtn.onclick = () => {
  adminBox.classList.add("hidden");
  questionBox.classList.add("hidden");
  answersBox.classList.remove("hidden");

  // Показываем ответы всех пользователей
  displayAllAnswers();
};

// Админ выбирает "Нет"
notAdminBtn.onclick = () => {
  adminBox.classList.add("hidden");
  questionBox.classList.remove("hidden");
};

// Пользователь отправляет ответ
submitAnswerBtn.onclick = async () => {
  const radios = document.getElementsByName("answer");
  let selected = null;
  radios.forEach(r => { if(r.checked) selected = r.value; });
  if(!selected) { alert("Выберите вариант"); return; }

  // Сохраняем в Firestore
  await setDoc(doc(db, "answers", window.currentUser), { answer: selected });
  alert("Ответ отправлен!");
  questionBox.classList.add("hidden");
};

// Админ видит все ответы
async function displayAllAnswers(){
  answersList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "answers"));
  querySnapshot.forEach(docSnap => {
    const div = document.createElement("div");
    div.textContent = docSnap.id + ": " + docSnap.data().answer;
    answersList.appendChild(div);
  });
}
