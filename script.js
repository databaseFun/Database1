import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Вставь свой WEB firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyAlrl1dwlRDTSkylFz7sSSH74OGAl1sKZM",
  authDomain: "firstsitee-7f870.firebaseapp.com",
  projectId: "firstsitee-7f870",
  storageBucket: "firstsitee-7f870.appspot.com",
  messagingSenderId: "586575021031",
  appId: "1:586575021031:web:XXXXXXXXXXXXXXXX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Элементы
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

const adminPasswordInput = document.getElementById("adminPassword");
const adminBtn = document.getElementById("adminBtn");

let isAdmin = false;

// регистрация
registerBtn.addEventListener("click", async () => {
  const email = regEmail.value.trim();
  const password = regPassword.value.trim();
  if(!email || !password){ alert("Заполните все поля"); return; }
  try{
    await createUserWithEmailAndPassword(auth,email,password);
    authBox.style.display="none";
    chatBox.style.display="block";
    loadMessages();
  } catch(e){ alert(e.message); console.error(e); }
});

// вход
loginBtn.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  if(!email || !password){ alert("Заполните поля"); return; }
  try{ await signInWithEmailAndPassword(auth,email,password); }
  catch(e){ alert(e.message); console.error(e); }
});

// выход
logoutBtn.addEventListener("click", async () => { await signOut(auth); isAdmin=false; });

// отправка сообщений
sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if(!text) return;
  await addDoc(collection(db,"messages"),{
    email: auth.currentUser.email,
    text,
    createdAt: serverTimestamp()
  });
  messageInput.value="";
});

// admin login
adminBtn.addEventListener("click", () => {
  const pass = adminPasswordInput.value.trim();
  if(pass==="999111"){ 
    isAdmin=true; 
    alert("Вы стали админом");
    loadMessages();
  } else alert("Неверный пароль");
});

// слежение за авторизацией
onAuthStateChanged(auth, user => {
  if(user){
    authBox.style.display="none";
    chatBox.style.display="block";
    loadMessages();
  } else {
    authBox.style.display="block";
    chatBox.style.display="none";
    isAdmin=false;
  }
});

// загрузка сообщений
function loadMessages(){
  const q = query(collection(db,"messages"), orderBy("createdAt"));
  onSnapshot(q, snap => {
    messagesDiv.innerHTML="";
    snap.forEach(d => {
      const m = d.data();
      const div = document.createElement("div");
      div.className="msg";

      const emailSpan = document.createElement("span");
      emailSpan.className="email";
      emailSpan.innerText = m.email;
      if(isAdmin && m.email===auth.currentUser.email) {
        const badge = document.createElement("span");
        badge.className="admin-badge";
        badge.innerText=" A";
        emailSpan.appendChild(badge);
      }

      const textSpan = document.createElement("span");
      textSpan.innerText = ": " + m.text;

      div.appendChild(emailSpan);
      div.appendChild(textSpan);

      // кнопка удаления для админа
      if(isAdmin && m.email!==auth.currentUser.email){
        const delBtn = document.createElement("span");
        delBtn.className="msg-btn";
        delBtn.innerText="🗑";
        delBtn.onclick = async () => {
          if(confirm("Удалить это сообщение?")) await deleteDoc(doc(db,"messages",d.id));
        }
        div.appendChild(delBtn);
      }

      messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}
