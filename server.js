import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import admin from "firebase-admin";

import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(bodyParser.json());

const ADMIN_PASSWORD = "supersecret"; // пароль админа

// проверка админа
app.post("/admin/login", async (req, res) => {
  const { password } = req.body;
  if(password === ADMIN_PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, msg: "Неверный пароль" });
  }
});

// удалить сообщение по ID
app.delete("/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("messages").doc(id).delete();
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

// редактировать сообщение
app.patch("/messages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    await db.collection("messages").doc(id).update({ text });
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

app.listen(3000, () => console.log("Server started on port 3000"));
