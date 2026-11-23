
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  runTransaction,
  onValue
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAdFKakFclqd2jyl5wDaETgK-nTLwnlTQQ",
  authDomain: "wiktorcu.firebaseapp.com",
  databaseURL: "https://wiktorcu-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wiktorcu",
  storageBucket: "wiktorcu.firebasestorage.app",
  messagingSenderId: "215559486138",
  appId: "1:215559486138:web:c4dd503c60f825e7a66083",
  measurementId: "G-TV82PSTZXX"
};
const countries = [
  "Macedonia",
  "Panama",
  "Filipiny",
  "Dania",
  "Laos",
  "Bułgaria",
  "Choreacja",
  "Francja",
  "Wietnam",
  "Polska",
  "Estonia",
  "Armenia",
  "Portugal",
  "Hiszpania",
  "Japonia",
  "Watykan",
  "Albania"
];

// ELEMENTS
const statusEl = document.getElementById("connectionStatus");
const countriesEl = document.getElementById("countries");
const countEl = document.getElementById("selectionCount");
const selectedEl = document.getElementById("selectedCountries");
const voteButton = document.getElementById("voteButton");
const votingSection = document.getElementById("votingSection");
const thankYou = document.getElementById("thankYou");
const resultsEl = document.getElementById("results");

let selected = [];
let db = null;
let currentUser = null;
let isSubmitting = false;
let firebaseConnected = false;

// STATUS
function showStatus(message, type = "") {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = "status " + type;
}

// BUTTON STATE
function updateButton() {
  if (!voteButton) return;

  voteButton.disabled =
    selected.length !== 3 ||
    !firebaseConnected ||
    !currentUser ||
    isSubmitting;
}

// SELECTION
function renderSelection() {
  if (countEl) {
    countEl.textContent = selected.length + " / 3";
  }

  if (selectedEl) {
    selectedEl.textContent = selected.join(" · ");
  }

  updateButton();
}

// COUNTRIES
function renderCountries() {
  if (!countriesEl) return;

  countriesEl.innerHTML = "";

  countries.forEach(country => {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = country;
    button.className = "country";

    if (selected.includes(country)) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      if (selected.includes(country)) {
        selected = selected.filter(c => c !== country);
      } else if (selected.length < 3) {
        selected.push(country);
      }

      renderCountries();
      renderSelection();
    });

    countriesEl.appendChild(button);
  });
}

// CONNECT FIREBASE
async function connectFirebase() {
  try {
    showStatus("Connecting to Firebase...", "");

    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);

    const auth = getAuth(app);

    await signInAnonymously(auth);

    onAuthStateChanged(auth, user => {
      currentUser = user;

      if (user) {
        firebaseConnected = true;
        showStatus("Connected to Firebase!", "ok");
      } else {
        firebaseConnected = false;
        showStatus("Firebase login failed.", "error");
      }

      updateButton();
    });

    // LISTEN FOR VOTE RESULTS
    onValue(
      ref(db, "votes"),
      snapshot => {
        const votes = snapshot.val() || {};

        if (!resultsEl) return;

        resultsEl.innerHTML = "";

        countries.forEach(country => {
          const row = document.createElement("div");
          row.className = "result-row";

          const name = document.createElement("span");
          name.textContent = country;

          const total = document.createElement("strong");
          total.textContent = votes[country] || 0;

          row.appendChild(name);
          row.appendChild(total);
          resultsEl.appendChild(row);
        });
      },
      error => {
        console.error("Firebase read error:", error);
        showStatus("Database read error: " + error.message, "error");
      }
    );

  } catch (error) {
    console.error("Firebase connection error:", error);

    firebaseConnected = false;

    showStatus(
      "Firebase error: " + (error.code || error.message),
      "error"
    );

    updateButton();
  }
}

// SUBMIT VOTE
async function submitVote() {
  if (
    selected.length !== 3 ||
    !currentUser ||
    !firebaseConnected ||
    isSubmitting
  ) {
    return;
  }

  isSubmitting = true;
  updateButton();

  try {
    const votesRef = ref(db, "votes");

    const result = await runTransaction(votesRef, currentVotes => {
      const votes = currentVotes || {};

      selected.forEach(country => {
        votes[country] = (Number(votes[country]) || 0) + 1;
      });

      return votes;
    });

    if (!result.committed) {
      throw new Error("Vote was not saved.");
    }

    votingSection.classList.add("hidden");
    thankYou.classList.remove("hidden");

    showStatus("Your vote has been saved!", "ok");

  } catch (error) {
    console.error("Vote submit error:", error);

    showStatus(
      "Vote error: " + (error.code || error.message),
      "error"
    );

    alert(
      "Nie udało się zapisać głosu. Sprawdź połączenie z Firebase i reguły bazy."
    );

  } finally {
    isSubmitting = false;
    updateButton();
  }
}

// BUTTON
if (voteButton) {
  voteButton.addEventListener("click", submitVote);
}

// START
renderCountries();
renderSelection();
connectFirebase();
