
const countries = [
  ["🇵🇱", "Polska"],
  ["🇲🇰", "Macedonia"],
  ["🇦🇲", "Armenia"],
  ["🇪🇸", "Hiszpania"],
  ["🇵🇦", "Panama"],
  ["🇵🇭", "Filipiny"],
  ["🇮🇹", "Włochy"],
  ["🇩🇰", "Dania"],
  ["🇱🇦", "Laos"],
  ["🇵🇹", "Portugalia"],
  ["🇧🇬", "Bulgaria"],
  ["🇭🇷", "Chorwacja"],
  ["🇻🇳", "Wietnam"],
  ["🇪🇪", "Estonia"]
];

const ADMIN_PASSWORD = "55434Wiktor";

let selected = [];
let votes = JSON.parse(localStorage.getItem("votes") || "{}");

countries.forEach(([flag, name]) => {
  votes[name] = votes[name] || 0;
});

const container = document.getElementById("countries");

function render() {
  container.innerHTML = "";

  countries.forEach(([flag, name]) => {
    const button = document.createElement("button");
    button.className = "country" +
      (selected.includes(name) ? " selected" : "");

    button.textContent = flag + " " + name;

    button.onclick = () => {
      if (selected.includes(name)) {
        selected = selected.filter(x => x !== name);
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

document.getElementById("submit").onclick = () => {
  if (localStorage.getItem("alreadyVoted") === "yes") {
    document.getElementById("message").textContent =
      "You have already voted!";
    return;
  }

  selected.forEach(name => votes[name]++);

  localStorage.setItem("votes", JSON.stringify(votes));
  localStorage.setItem("alreadyVoted", "yes");

  selected = [];
  render();

  document.getElementById("message").textContent =
    "Thank you for voting!";
};

function login() {
  if (document.getElementById("password").value === ADMIN_PASSWORD) {
    document.getElementById("results").classList.remove("hidden");
    showResults();
  } else {
    alert("Wrong password!");
  }
}

function showResults() {
  const board = document.getElementById("scoreboard");
  board.innerHTML = "";

  Object.entries(votes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, score]) => {
      const p = document.createElement("p");
      p.textContent = `${name}: ${score} votes`;
      board.appendChild(p);
    });
}

render();
