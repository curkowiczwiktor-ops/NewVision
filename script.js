import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Konfiguracja z Twojego projektu Firebase:
const firebaseConfig = {
  apiKey: "AIzaSyAdFKakFclqd2jyl5DaETgK-nLwnlTQQ",
  authDomain: "wiktorcu.firebaseapp.com",
  databaseURL: "https://wiktorcu-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wiktorcu",
  storageBucket: "wiktorcu.firebasestorage.app",
  messagingSenderId: "215559486138",
  appId: "1:215559486138:web:c4dd503c60f825e7a66083",
  measurementId: "G-TV82PSTZXX"
};

const countries = [
  "Albania", "Armenia", "Cyprus", "France", "Georgia", "Ireland",
  "Italy", "Malta", "Montenegro", "Netherlands", "North Macedonia",
  "Poland", "Portugal", "San Marino", "Spain", "Ukraine"
];

const statusEl = document.querySelector("#connectionStatus");
const countriesEl = document.querySelector("#countries");
const countEl = document.querySelector("#selectionCount");
const selectedEl = document.querySelector("#selectedCountries");
const voteButton = document.querySelector("#voteButton");
const votingSection = document.querySelector("#votingSection");
const thankYou = document.querySelector("#thankYou");
const resultsEl = document.querySelector("#results");

let selected = [];
let database = null;
let currentUser = null;
let isSubmitting = false;

function showStatus(message, kind = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${kind}`;
}

function renderSelection() {
  countEl.textContent = `${selected.length} / 3`;
  selectedEl.textContent = selected.join(" · ");
  voteButton.disabled = selected.length !== 3 || !currentUser || isSubmitting;
}

function renderCountries() {
  countriesEl.replaceChildren();
  countries.forEach(country => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `country${selected.includes(country) ? " selected" : ""}`;
    button.textContent = country;
    button.setAttribute("aria-pressed", String(selected.includes(country)));
    button.addEventListener("click", () => {
      if (selected.includes(country)) {
        selected = selected.filter(item => item !== country);
      } else if (selected.length < 3) {
        selected = [...selected, country];
      }
      renderCountries();
      renderSelection();
    });
    countriesEl.append(button);
  });
}

async function startFirebase() {
  try {
    showStatus("Łączenie z Firebase…");
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    database = getDatabase(app);

    await signInAnonymously(auth);
    onAuthStateChanged(auth, user => {
      currentUser = user;
      if (user) {
        showStatus("Połączono z Firebase. Możesz głosować.", "ok");
        voteButton.disabled = selected.length !== 3 || isSubmitting;
      } else {
        showStatus("Nie udało się zalogować anonimowo. Sprawdź Authentication → Sign-in method → Anonymous.", "error");
      }
    });

    onValue(ref(database, "votes"), snapshot => {
      const votes = snapshot.val() || {};
      resultsEl.replaceChildren();
      countries.forEach(country => {
        const row = document.createElement("div");
        row.className = "result-row";
        const name = document.createElement("span");
        name.textContent = country;
        const total = document.createElement("strong");
        total.textContent = String(Number(votes[country] || 0));
        row.append(name, total);
        resultsEl.append(row);
      });
    }, error => {
      showStatus(`Błąd odczytu bazy: ${error.message}. Sprawdź reguły Realtime Database.`, "error");
    });
  } catch (error) {
    console.error("Firebase error:", error);
    showStatus(`Nie udało się połączyć: ${error.code || error.message}`, "error");
  }
}

voteButton.addEventListener("click", async () => {
  if (!currentUser || selected.length !== 3 || isSubmitting) return;
  isSubmitting = true;
  renderSelection();
  try {
    const votesRef = ref(database, "votes");
    const result = await runTransaction(votesRef, current => {
      const next = current && typeof current === "object" ? current : {};
      selected.forEach(country => {
        next[country] = Number(next[country] || 0) + 1;
      });
      return next;
    });
    if (!result.committed) throw new Error("Głos nie został zapisany.");
    votingSection.classList.add("hidden");
    thankYou.classList.remove("hidden");
    showStatus("Głos zapisany w Firebase.", "ok");
  } catch (error) {
    console.error("Vote error:", error);
    showStatus(`Nie udało się zapisać głosu: ${error.code || error.message}. Sprawdź reguły bazy.`, "error");
  } finally {
    isSubmitting = false;
    renderSelection();
  }
});

renderCountries();
renderSelection();
startFirebase();
