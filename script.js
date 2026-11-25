import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, deleteDoc, doc, 
  query, where, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// APNA REAL FIREBASE CONFIG YAHAN PASTE KARO
const firebaseConfig = {
  apiKey: "AIzaSyDY_ErpEm8pcI3975wgcj2ZUb4f0-NCDyc",
  authDomain: "expense-tracker-ae63e.firebaseapp.com",
  projectId: "expense-tracker-ae63e",
  storageBucket: "expense-tracker-ae63e.firebasestorage.app",
  messagingSenderId: "993094637210",
  appId: "1:993094637210:web:38687c386f44ea6aa8b123",
  measurementId: "G-E56L31JZZ2"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// HTML Elements
const authCard = document.getElementById("authCard");
const trackerCard = document.getElementById("trackerCard");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const expenseForm = document.getElementById("expenseForm");
const inputName = document.getElementById("expenseName");
const inputAmount = document.getElementById("expenseAmount");
const expenseList = document.getElementById("expenseList");
const totalAmount = document.getElementById("totalAmount");

let currentUser = null;
let unsubscribe = null;

// 1. Sign Up
document.getElementById("signupBtn").addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(auth, authEmail.value, authPassword.value);
  } catch (error) {
    alert(error.message);
  }
});

// 2. Login
document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, authEmail.value, authPassword.value);
  } catch (error) {
    alert(error.message);
  }
});

// 3. Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth);
});

// 4. Auth State Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    authCard.style.display = "none";
    trackerCard.style.display = "block";
    document.getElementById("userEmail").textContent = user.email;
    
    console.log("Logged in UID:", user.uid); // Debug ke liye
    loadUserExpenses(user.uid);
  } else {
    currentUser = null;
    authCard.style.display = "block";
    trackerCard.style.display = "none";
    if (unsubscribe) unsubscribe();
    expenseList.innerHTML = "";
    totalAmount.textContent = "$0";
  }
});

// 5. Add Expense
expenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) return;

  const name = inputName.value.trim();
  const amount = Number(inputAmount.value.trim());

  if (!name || amount <= 0) {
    return alert("Please enter a valid expense name and amount!");
  }

  try {
    await addDoc(collection(db, "expenses"), {
      uid: currentUser.uid,
      name: name,
      amount: amount,
      createdAt: Date.now()
    });
    inputName.value = "";
    inputAmount.value = "";
  } catch (error) {
    alert("Error saving expense: " + error.message);
  }
});

// 6. Load & Delete Expenses
function loadUserExpenses(uid) {
  const q = query(collection(db, "expenses"), where("uid", "==", uid));

  unsubscribe = onSnapshot(q, (snapshot) => {
    console.log("Documents found:", snapshot.size); // Debug ke liye
    expenseList.innerHTML = "";
    let total = 0;

    snapshot.forEach((docSnap) => {
      const expense = docSnap.data();
      const docId = docSnap.id;
      total += Number(expense.amount);

      const item = document.createElement("div");
      item.classList.add("expense-item");
      item.innerHTML = `
        <div class="expense-info">
          <span class="expense-name">${expense.name}</span>
          <span class="expense-price">$${expense.amount}</span>
        </div>
        <button class="delete-btn">Delete</button>
      `;

      item.querySelector(".delete-btn").addEventListener("click", async () => {
        await deleteDoc(doc(db, "expenses", docId));
      });

      expenseList.appendChild(item);
    });

    totalAmount.textContent = `$${total}`;
  }, (error) => {
    console.error("Snapshot Error:", error); // Agar permission error ho toh dikhayega
  });
}