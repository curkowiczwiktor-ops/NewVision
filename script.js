
const countries = [
  ["🇲🇰", "Macedonia"],
  ["🇵🇦","Panama"],
  ["🇵🇭","Filipiny"],
  ["🇩🇰","Dania"],
  ["🇱🇦","Laos"],
  ["🇧🇬","Bułgaria"],
  ["🇭🇷","Chorwacja"],
  ["🇫🇷","Francja"],
  ["🇻🇳","Wietnam"],
  ["🇵🇱","Polska"],
  ["🇪🇪","Estonia"],
  ["🇦🇲","Armenia"],
  ["🇵🇹","Portugalia"],
  ["🇪🇸","Hiszpania"],
  ["🇮🇹","Włochy"],
  ["🇯🇵","Japonia"],
  ["🇻🇦","Watykan"],
];

const ADMIN_PASSWORD = "55434Wiktor";

let selected = [];
let votes = JSON.parse(localStorage.getItem("votes") || "{}");

countries.forEach(([flag, name]) => {
  if (votes[name] === undefined) {
    votes[name] = 0;
  }
});

const container = document.getElementById("countries");

// WYŚWIETLANIE KRAJÓW

function render() {
  container.innerHTML = "";

  countries.forEach(([flag, name]) => {
    const button = document.createElement("button");

    button.className = "country" +
      (selected.includes(name) ? " selected" : "");

    button.textContent = flag + " " + name;

    button.onclick = () => {
      if (selected.includes(name)) {
        selected = selected.filter(country => country !== name);
      } else if (selected.length < 3) {
        selected.push(name);
      }

      render();
    };

    container.appendChild(button);
  });

  document.getElementById("counter").textContent =
    `Selected: ${selected.length}/3`;

  document.getElementById("submit").disabled =
    selected.length !== 3;
}

// ODDAWANIE GŁOSÓW I PRZEJŚCIE DO PODZIĘKOWANIA

document.getElementById("submit").onclick = () => {
  if (selected.length !== 3) {
    alert("Select exactly 3 countries!");
    return;
  }

  selected.forEach(name => {
    votes[name] = (votes[name] || 0) + 1;
  });

  localStorage.setItem("votes", JSON.stringify(votes));

  // Ukrycie głosowania
  document.getElementById("votingSection").classList.add("hidden");

  // Pokazanie ekranu podziękowania
  document.getElementById("thankYou").classList.remove("hidden");
};

// LOGOWANIE ADMINA

function login() {
  const password = document.getElementById("password").value;

  if (password === ADMIN_PASSWORD) {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");

    showResults();
  } else {
    alert("Wrong password!");
  }
}

// WYŚWIETLANIE WYNIKÓW

function showResults() {
  const board = document.getElementById("scoreboard");
  board.innerHTML = "";

  const sorted = countries
    .map(([flag, name]) => ({
      flag,
      name,
      score: votes[name] || 0
    }))
    .sort((a, b) => b.score - a.score);

  sorted.forEach((country, index) => {
    const row = document.createElement("div");
    row.className = "score";

    row.innerHTML = `
      <span>${index + 1}. ${country.flag} ${country.name}</span>
      <strong>${country.score}</strong>
    `;

    board.appendChild(row);
  });

  const total = Object.values(votes)
    .reduce((sum, score) => sum + score, 0);

  document.getElementById("totalVotes").textContent =
    "Total votes: " + total;
}

// RESET GŁOSÓW

function resetVotes() {
  if (!confirm("Are you sure you want to reset all votes?")) {
    return;
  }

  countries.forEach(([flag, name]) => {
    votes[name] = 0;
  });

  localStorage.setItem("votes", JSON.stringify(votes));

  selected = [];

  render();
  showResults();

  alert("Votes have been reset!");
}

// WYLOGOWANIE

function logout() {
  document.getElementById("results").classList.add("hidden");
  document.getElementById("login").classList.remove("hidden");
  document.getElementById("password").value = "";
}

render();
