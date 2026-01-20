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

/* 🔥 ВСТАВЬ СВОЙ CONFIG */
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authBox = document.getElementById("auth");
const chatBox = document.getElementById("chat");
const messagesDiv = document.getElementById("messages");

// регистрация
registerBtn.onclick = async () => {
  const email = regEmail.value;
  const password = regPassword.value;

  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    createdAt: serverTimestamp()
  });
};

// вход
loginBtn.onclick = async () => {
  await signInWithEmailAndPassword(
    auth,
    loginEmail.value,
    loginPassword.value
  );
};

// выход
logoutBtn.onclick = async () => {
  await signOut(auth);
};

// отправка сообщений
sendBtn.onclick = async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    uid: auth.currentUser.uid,
    email: auth.currentUser.email,
    text,
    createdAt: serverTimestamp()
  });

  messageInput.value = "";
};

// отслеживание входа
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
  const q = query(
    collection(db, "messages"),
    orderBy("createdAt")
  );

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
