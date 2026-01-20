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
  onSnapshot, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Вставь свой WEB firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyAlrl1dwlRDTSkylFz7sSSH74OGAl1sKZM",
  authDomain: "firstsitee-7f870.firebaseapp.com",
  projectId: "firstsitee-7f870",
  storageBucket: "firstsitee-7f870.appspot.com",
  messagingSenderId: "586575021031",
  appId: "1:586575021031:web:XXXXXXXXXXXXXXXX" // web app id
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// элементы страницы
const authBox = document.getElementById("auth");
const chatBox = document.getElementById("chat");
const messagesDiv = document.getElementById("messages");

const loginNick = document.getElementById("loginNick");
const loginBtn = document.getElementById("loginBtn");

const regNick = document.getElementById("regNick");
const registerBtn = document.getElementById("registerBtn");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");

// регистрация по нику
registerBtn.addEventListener("click", async () => {
  const nick = regNick.value.trim();
  if (!nick) { alert("Введите ник"); return; }

  try {
    const fakeEmail = nick + "@chat.local"; // фиктивный email
    const password = "123456"; // фиксированный пароль

    const cred = await createUserWithEmailAndPassword(auth, fakeEmail, password);

    await setDoc(doc(db, "users", cred.user.uid), {
      nick,
      createdAt: serverTimestamp()
    });

  } catch (e) {
    alert(e.message);
    console.error(e);
  }
});

// вход по нику
loginBtn.addEventListener("click", async () => {
  const nick = loginNick.value.trim();
  if (!nick) { alert("Введите ник"); return; }

  try {
    const fakeEmail = nick + "@chat.local";
    const password = "123456";
    await signInWithEmailAndPassword(auth, fakeEmail, password);
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
    text,
    createdAt: serverTimestamp()
  });

  messageInput.value = "";
});

// слежение за авторизацией
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

// загрузка сообщений и отображение никнеймов
function loadMessages() {
  const q = query(collection(db, "messages"), orderBy("createdAt"));
  onSnapshot(q, async snap => {
    messagesDiv.innerHTML = "";

    for (let d of snap.docs) {
      const m = d.data();
      const userRef = doc(db, "users", m.uid);
      const userSnap = await getDoc(userRef);
      const nick = userSnap.exists() ? userSnap.data().nick : "Unknown";

      const div = document.createElement("div");
      div.className = "msg";
      div.innerHTML = `<span class="email">${nick}:</span> ${m.text}`;
      messagesDiv.appendChild(div);
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}
