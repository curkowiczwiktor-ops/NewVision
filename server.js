const http = require("http");
const fs = require("fs");
const path = require("path");

const host = "0.0.0.0";
const port = Number(process.env.PORT) || 3000;
const root = __dirname;
const votesFile = path.join(root, "votes.json");

const countryNames = [
  "Macedonia", "Panama", "Filipiny", "Dania", "Laos", "Bułgaria",
  "Chorwacja", "Francja", "Wietnam", "Polska", "Estonia", "Armenia",
  "Portugalia", "Hiszpania", "Włochy", "Japonia", "Watykan"
];

function emptyVotes() {
  return Object.fromEntries(countryNames.map(name => [name, 0]));
}

function readVotes() {
  try {
    const data = JSON.parse(fs.readFileSync(votesFile, "utf8"));
    const result = emptyVotes();
    countryNames.forEach(name => {
      if (Number.isInteger(data[name]) && data[name] >= 0) {
        result[name] = data[name];
      }
    });
    return result;
  } catch (error) {
    return emptyVotes();
  }
}

function writeVotes(votes) {
  fs.writeFileSync(votesFile, JSON.stringify(votes, null, 2), "utf8");
}

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(value));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", chunk => {
      body += chunk;
      if (body.length > 10000) {
        reject(new Error("Żądanie jest za duże."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Niepoprawny format danych."));
      }
    });
  });
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET" && url.pathname === "/api/votes") {
    sendJson(response, 200, readVotes());
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/votes") {
    try {
      const body = await readJson(request);
      const selected = body.countries;

      if (
        !Array.isArray(selected) ||
        selected.length !== 3 ||
        new Set(selected).size !== 3 ||
        selected.some(name => !countryNames.includes(name))
      ) {
        sendJson(response, 400, { error: "Wybierz dokładnie 3 różne kraje." });
        return;
      }

      const votes = readVotes();
      selected.forEach(name => votes[name]++);
      writeVotes(votes);
      sendJson(response, 200, { votes });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }

  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Metoda niedozwolona." });
    return;
  }

  let filePath = url.pathname === "/"
    ? path.join(root, "index.html")
    : path.join(root, url.pathname.replace(/^\/+/, ""));

  if (!filePath.startsWith(root + path.sep)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Nie znaleziono strony.");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`NewVision działa pod adresem http://localhost:${port}`);
});
