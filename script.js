import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Firebase config (ВСТАВЬ СВОЙ apiKey)
const firebaseConfig = {
  apiKey: "ВСТАВЬ_API_KEY",
  authDomain: "firstsitee-7f870.firebaseapp.com",
  projectId: "firstsitee-7f870",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔑 код учителя (можно потом вынести в Firestore)
const TEACHER_CODE = "12345";

const subjectsList = [
  "Biologia",
  "Chimia",
  "Educație tehnologică",
  "Fizica",
  "Geografia",
  "Informatica",
  "Istoria românilor și universală",
  "Limba engleză",
  "Limba și literatura română",
  "Matematică"
];

// элементы
const authBox = document.getElementById("auth");
const diaryBox = document.getElementById("diary");
const subjectsDiv = document.getElementById("subjects");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const teacherCodeInput = document.getElementById("teacherCode");

const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");

// регистрация
document.getElementById("registerBtn").onclick = async () => {
  const userCred = await createUserWithEmailAndPassword(
    auth,
    regEmail.value,
    regPassword.value
  );

  const grades = {};
  subjectsList.forEach(s => grades[s] = "-");

  await setDoc(doc(db, "grades", userCred.user.uid), grades);
};

// вход
document.getElementById("loginBtn").onclick = async () => {
  await signInWithEmailAndPassword(
    auth,
    loginEmail.value,
    loginPassword.value
  );
};

// выход
document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
};

// загрузка дневника
async function loadDiary(user, isTeacher) {
  subjectsDiv.innerHTML = "";

  const ref = doc(db, "grades", user.uid);
  const snap = await getDoc(ref);
  const data = snap.data();

  subjectsList.forEach(subject => {
    const div = document.createElement("div");
    div.className = "subject";

    if (isTeacher) {
      div.innerHTML = `
        ${subject}
        <input value="${data[subject]}" data-subject="${subject}">
      `;
    } else {
      div.innerHTML = `
        ${subject}
        <span class="grade">${data[subject]}</span>
      `;
    }

    subjectsDiv.appendChild(div);
  });

  if (isTeacher) {
    subjectsDiv.querySelectorAll("input").forEach(input => {
      input.onchange = async () => {
        await updateDoc(ref, {
          [input.dataset.subject]: input.value
        });
      };
    });
  }
}

// авто-вход
onAuthStateChanged(auth, user => {
  if (!user) {
    authBox.style.display = "block";
    diaryBox.style.display = "none";
    return;
  }

  authBox.style.display = "none";
  diaryBox.style.display = "block";

  const isTeacher = teacherCodeInput.value === TEACHER_CODE;
  loadDiary(user, isTeacher);
});
