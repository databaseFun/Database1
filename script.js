import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, setDoc, doc, serverTimestamp, query, orderBy, onSnapshot, getDoc 
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
const regNick = document.getElementById("regNick");
const registerBtn = document.getElementById("registerBtn");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");

const adminPanelDiv = document.getElementById("adminPanel");
const adminPasswordInput = document.getElementById("adminPassword");
const adminLoginBtn = document.getElementById("adminLoginBtn");

let isAdmin = false;

// регистрация
registerBtn.addEventListener("click", async () => {
  const email = regEmail.value.trim();
  const password = regPassword.value.trim();
  const nick = regNick.value.trim();
  if(!email || !password || !nick) { alert("Заполните все поля"); return; }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), { nick, createdAt: serverTimestamp() });
  } catch(e) { alert(e.message); console.error(e); }
});

// вход
loginBtn.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  if(!email || !password) { alert("Заполните все поля"); return; }
  try { await signInWithEmailAndPassword(auth, email, password); } 
  catch(e) { alert(e.message); console.error(e); }
});

// выход
logoutBtn.addEventListener("click", async () => { await signOut(auth); isAdmin = false; });

// отправка сообщений
sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if(!text) return;
  await addDoc(collection(db,"messages"),{
    uid: auth.currentUser.uid,
    text,
    createdAt: serverTimestamp()
  });
  messageInput.value="";
});

// admin login
adminLoginBtn.addEventListener("click", async () => {
  const password = adminPasswordInput.value.trim();
  if(!password) return;
  try {
    const res = await fetch("http://localhost:3000/admin/login",{ 
      method:"POST", 
      headers:{"Content-Type":"application/json"}, 
      body: JSON.stringify({password})
    });
    const data = await res.json();
    if(data.ok){ 
      isAdmin=true; 
      alert("Вы вошли как админ"); 
      adminPanelDiv.style.display="none";
      loadMessages();
    } else alert("Неверный пароль");
  } catch(e){ alert(e.message); console.error(e); }
});

// слежение за авторизацией
onAuthStateChanged(auth, user => {
  if(user){
    authBox.style.display="none";
    chatBox.style.display="block";
    adminPanelDiv.style.display="block";
    loadMessages();
  } else {
    authBox.style.display="block";
    chatBox.style.display="none";
    adminPanelDiv.style.display="none";
    isAdmin=false;
  }
});

// загрузка сообщений с корректной обработкой await
async function loadMessages() {
  const q = query(collection(db,"messages"), orderBy("createdAt"));
  onSnapshot(q, async snap => {
    messagesDiv.innerHTML="";
    for (let d of snap.docs) {
      const m = d.data();
      const id = d.id;

      const userDoc = await getDoc(doc(db,"users", m.uid));
      const nick = userDoc.exists() ? userDoc.data().nick : "Unknown";

      const div = document.createElement("div");
      div.className="msg";

      // текст сообщения + ник
      const nickSpan = document.createElement("span");
      nickSpan.className = "nick";
      nickSpan.innerText = (isAdmin && m.uid===auth.currentUser.uid) ? nick+" • Adm •" : nick;
      if(isAdmin && m.uid===auth.currentUser.uid) nickSpan.classList.add("admin");

      const textSpan = document.createElement("span");
      textSpan.innerText = ": " + m.text;

      div.appendChild(nickSpan);
      div.appendChild(textSpan);

      // кнопки админа
      if(isAdmin && m.uid!==auth.currentUser.uid){
        const btn = document.createElement("span");
        btn.className="msg-btn";
        btn.innerText="⋮";
        btn.onclick=()=>showAdminOptions(id, m.text);
        div.appendChild(btn);
      }

      messagesDiv.appendChild(div);
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// показать меню редактирования/удаления
function showAdminOptions(id, oldText){
  const action = prompt("Введите: delete или edit");
  if(action==="delete"){
    fetch(`http://localhost:3000/messages/${id}`, { method:"DELETE" });
  } else if(action==="edit"){
    const newText = prompt("Введите новый текст", oldText);
    if(newText) fetch(`http://localhost:3000/messages/${id}`, { 
      method:"PATCH", 
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({text:newText})
    });
  }
}
