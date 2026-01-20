import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 ВАЖНО: твой WEB firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyAlrl1dwlRDTSkylFz7sSSH74OGAl1sKZM", // твой API Key
  authDomain: "firstsitee-7f870.firebaseapp.com",
  projectId: "firstsitee-7f870",
  storageBucket: "firstsitee-7f870.appspot.com",
  messagingSenderId: "586575021031",
  appId: "1:586575021031:web:XXXXXXXXXXXXXXXX" // web app id (должен содержать :web:)
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// получение элементов страницы
const authBox = document.getElementById("auth");
const chatBox = document.getElementById("chat");
const messagesDiv = document.getElementById("messages");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");

const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const registerBtn = document.getElementById("registerBtn");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");

// регистрация
registerBtn.addEventListener("click", async () => {
  try {
    const email = regEmail.value.trim();
    const password = regPassword.value.trim();
    if (!email || !password) { alert("Введите email и пароль"); return; }
    
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    
    // сразу сохраняем пользователя в Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      createdAt: serverTimestamp()
    });
  } catch (e) { 
    alert(e.message); 
    console.error(e); 
  }
});

// вход
loginBtn.addEventListener("click", async () => {
  try { 
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value); 
  } catch (e) { 
    alert(e.message); 
    console.error(e); 
  }
});

// выход
logoutBtn.addEventListener("click", async () => { await signOut(auth); });

// отправка сообщений
sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    uid: auth.currentUser.uid,
    email: auth.currentUser.email,
    text,
    createdAt: serverTimestamp()
  });

  messageInput.value = "";
});

// отслеживание состояния авторизации
onAuthStateChanged(auth, user => {
  if (user) {
    authBox.style.display = "none";
    chatBox.style.display = "block";
    loadMessages();
  } else {
    authBox.style.display = "block";
    chatBox.style.display = "none";
  }
});

// загрузка всех сообщений (включая старые)
function loadMessages() {
  const q = query(collection(db, "messages"), orderBy("createdAt"));
  onSnapshot(q, snap => {
    messagesDiv.innerHTML = "";
    snap.forEach(d => {
      const m = d.data();
      const div = document.createElement("div");
      div.className = "msg";
      div.innerHTML = `<span class="email">${m.email}:</span> ${m.text}`;
      messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}
