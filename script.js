let currentImage = "";
let savedReportsCache = [];

document.getElementById("playerImage").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    currentImage = e.target.result;

    const preview = document.getElementById("imagePreview");
    preview.src = currentImage;
    preview.style.display = "block";
  };

  reader.readAsDataURL(file);
});

function calculatePlayerRating(avg) {
  let playerRating = avg * 5;
  if (playerRating > 10) playerRating = 10;
  return playerRating.toFixed(1);
}

function reportsCollection() {
  return window.collection(window.db, "reports");
}

async function loadReportsFromFirebase() {
  const snapshot = await window.getDocs(reportsCollection());

  savedReportsCache = snapshot.docs.map((docSnap) => {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  });

  showSavedReports();
  showLeaderboard();
  showDashboard();
  showPlayerCard();
  updateCompareDropdowns();
}

function generateReport() {
  const name = document.getElementById("name").value;
  const age = Number(document.getElementById("age").value);
  const team = document.getElementById("team").value;
  const season = document.getElementById("season").value;
  const sport = document.getElementById("sport").value;
  const position = document.getElementById("position").value;
  const games = Number(document.getElementById("games").value);
  const goals = Number(document.getElementById("goals").value);
  const strengths = document.getElementById("strengths").value;
  const weaknesses = document.getElementById("weaknesses").value;
  const reportDiv = document.getElementById("report");

  if (!name || !age || !team || !season || !games || goals < 0) {
    reportDiv.innerHTML =
      "<p>Vinsamlegast fylltu inn nafn, aldur, lið, tímabil, leiki og mörk/stig.</p>";
    reportDiv.style.backgroundColor = "white";
    return;
  }

  const avg = goals / games;
  const playerRating = calculatePlayerRating(avg);

  let rating = "";
  let aiComment = "";

  if (avg >= 1.5) {
    rating = "Frábær frammistaða";
    reportDiv.style.backgroundColor = "#d4edda";
  } else if (avg >= 1) {
    rating = "Góð frammistaða";
    reportDiv.style.backgroundColor = "#fff3cd";
  } else {
    rating = "Þarf að bæta sig";
    reportDiv.style.backgroundColor = "#f8d7da";
  }

  if (sport === "Fótbolti") {
    aiComment = `${name} hefur sýnt góða frammistöðu í ${position.toLowerCase()} hlutverki.`;
  } else if (sport === "Handbolti") {
    aiComment = `${name} hefur verið mikilvægur þáttur í leik liðsins sem ${position.toLowerCase()}.`;
  } else if (sport === "Körfubolti") {
    aiComment = `${name} hefur lagt mikið af mörkum sem ${position.toLowerCase()}.`;
  }

  reportDiv.innerHTML = `
    <h2>${name}</h2>
    ${
      currentImage
        ? `<img src="${currentImage}" style="width:140px;height:140px;object-fit:cover;border-radius:50%;">`
        : ""
    }
    <p><strong>Aldur:</strong> ${age}</p>
    <p><strong>Lið:</strong> ${team}</p>
    <p><strong>Tímabil:</strong> ${season}</p>
    <p><strong>Íþrótt:</strong> ${sport}</p>
    <p><strong>Staða:</strong> ${position}</p>
    <p><strong>Leikir:</strong> ${games}</p>
    <p><strong>Mörk/Stig:</strong> ${goals}</p>
    <p><strong>Meðaltal:</strong> ${avg.toFixed(2)}</p>
    <p><strong>Rating:</strong> ${playerRating}/10</p>
    <p><strong>Mat:</strong> ${rating}</p>
    <p><strong>Athugasemd:</strong> ${aiComment}</p>
    <p><strong>Styrkleikar:</strong></p>
    <p>${strengths}</p>
    <p><strong>Atriði til að bæta:</strong></p>
    <p>${weaknesses}</p>
  `;

  generateAIReport(name, age, team, season, sport, position, games, goals, strengths, weaknesses);
}

async function generateAIReport(name, age, team, season, sport, position, games, goals, strengths, weaknesses) {
  const aiDiv = document.getElementById("aiReport");
  aiDiv.innerHTML = "AI er að skrifa skýrslu...";

  try {
    const response = await fetch("https://sports-ai-report.onrender.com/generate-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        age,
        team,
        season,
        sport,
        position,
        games,
        goals,
        strengths,
        weaknesses
      })
    });

    const data = await response.json();

    if (data.report) {
      aiDiv.innerHTML = `<p>${data.report}</p>`;
    } else {
      aiDiv.innerHTML = `<p>Villa: ${data.error || "Ekkert svar frá AI"}</p>`;
    }
  } catch (error) {
    aiDiv.innerHTML = "Villa við að ná í AI skýrslu.";
    console.error(error);
  }
}

async function saveReport() {
  const aiText = document.getElementById("aiReport").innerText;
  const name = document.getElementById("name").value;
  const age = Number(document.getElementById("age").value);
  const team = document.getElementById("team").value;
  const season = document.getElementById("season").value;
  const sport = document.getElementById("sport").value;
  const position = document.getElementById("position").value;
  const games = Number(document.getElementById("games").value);
  const goals = Number(document.getElementById("goals").value);
  const avg = goals / games;
  const playerRating = calculatePlayerRating(avg);

  if (
    !aiText ||
    aiText.includes("mun birtast") ||
    aiText.includes("AI er að skrifa")
  ) {
    alert("Búðu fyrst til AI skýrslu.");
    return;
  }

  const reportData = {
    name,
    age,
    team,
    season,
    sport,
    position,
    goals,
    games,
    avg,
    rating: playerRating,
    image: currentImage,
    report: aiText,
    date: new Date().toLocaleString(),
    createdAt: Date.now()
  };

  try {
    await window.addDoc(reportsCollection(), reportData);
    await loadReportsFromFirebase();
    alert("Skýrsla vistuð í Firebase!");
  } catch (error) {
    console.error(error);
    alert("Villa við að vista í Firebase.");
  }
}

function showSavedReports() {
  const savedDiv = document.getElementById("savedReports");
  const searchInput = document.getElementById("searchInput");
  const searchText = searchInput ? searchInput.value.toLowerCase() : "";

  const filteredReports = savedReportsCache.filter((item) => {
    return (
      (item.name || "").toLowerCase().includes(searchText) ||
      (item.team || "").toLowerCase().includes(searchText) ||
      (item.sport || "").toLowerCase().includes(searchText) ||
      (item.position || "").toLowerCase().includes(searchText)
    );
  });

  savedDiv.innerHTML = "";

  if (filteredReports.length === 0) {
    savedDiv.innerHTML = "<p>Engir leikmenn fundust.</p>";
    return;
  }

  filteredReports.forEach((item) => {
    savedDiv.innerHTML += `
      <div class="saved-report">
        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ""}

        <h3>${item.name}</h3>

        <p><strong>Aldur:</strong> ${item.age || "Óskráð"}</p>
        <p><strong>Lið:</strong> ${item.team || "Óskráð"}</p>
        <p><strong>Tímabil:</strong> ${item.season || "Óskráð"}</p>
        <p><strong>Íþrótt:</strong> ${item.sport}</p>
        <p><strong>Staða:</strong> ${item.position || "Óskráð"}</p>
        <p><strong>Rating:</strong> ${item.rating || "Óskráð"}/10</p>
        <p><strong>Dagsetning:</strong> ${item.date}</p>

        <p>${item.report}</p>

        <button onclick="deleteReport('${item.id}')">Eyða</button>
      </div>
    `;
  });
}

function showLeaderboard() {
  const leaderboardDiv = document.getElementById("leaderboard");
  const sortedReports = [...savedReportsCache].sort((a, b) => b.avg - a.avg);

  leaderboardDiv.innerHTML = "";

  sortedReports.forEach((item, index) => {
    let medal = "";

    if (index === 0) medal = "🥇";
    else if (index === 1) medal = "🥈";
    else if (index === 2) medal = "🥉";
    else medal = `${index + 1}.`;

    leaderboardDiv.innerHTML += `
      <div class="leaderboard-item">
        <strong>${medal} ${item.name}</strong>
        <p>${item.team || "Óskráð lið"} | ${item.position || "Óskráð staða"} | ${item.sport}</p>
        <p>Rating: ${item.rating || "Óskráð"}/10 | Meðaltal: ${Number(item.avg).toFixed(2)} | Mörk/Stig: ${item.goals} | Leikir: ${item.games}</p>
      </div>
    `;
  });
}

function showDashboard() {
  const dashboardDiv = document.getElementById("dashboard");

  if (savedReportsCache.length === 0) {
    dashboardDiv.innerHTML = "<p>Engin gögn komin enn.</p>";
    return;
  }

  const totalPlayers = savedReportsCache.length;

  const totalGoals = savedReportsCache.reduce(
    (sum, item) => sum + Number(item.goals),
    0
  );

  const totalGames = savedReportsCache.reduce(
    (sum, item) => sum + Number(item.games),
    0
  );

  const overallAvg = totalGames > 0 ? totalGoals / totalGames : 0;
  const bestPlayer = [...savedReportsCache].sort((a, b) => b.avg - a.avg)[0];

  dashboardDiv.innerHTML = `
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Leikmenn</h3>
        <p>${totalPlayers}</p>
      </div>

      <div class="dashboard-card">
        <h3>Heildar mörk/stig</h3>
        <p>${totalGoals}</p>
      </div>

      <div class="dashboard-card">
        <h3>Meðaltal</h3>
        <p>${overallAvg.toFixed(2)}</p>
      </div>

      <div class="dashboard-card">
        <h3>Besti leikmaður</h3>
        <p>${bestPlayer.name}</p>
      </div>
    </div>
  `;
}

function showPlayerCard() {
  const playerCardDiv = document.getElementById("playerCard");

  if (savedReportsCache.length === 0) {
    playerCardDiv.innerHTML = "<p>Enginn leikmaður vistaður enn.</p>";
    return;
  }

  const bestPlayer = [...savedReportsCache].sort((a, b) => b.avg - a.avg)[0];

  playerCardDiv.innerHTML = `
    <div class="player-card">
      ${
        bestPlayer.image
          ? `<img src="${bestPlayer.image}" alt="${bestPlayer.name}">`
          : ""
      }
      <h3>🏆 ${bestPlayer.name}</h3>
      <p><strong>Lið:</strong> ${bestPlayer.team || "Óskráð"}</p>
      <p><strong>Staða:</strong> ${bestPlayer.position || "Óskráð"}</p>
      <p><strong>Íþrótt:</strong> ${bestPlayer.sport}</p>
      <p><strong>Meðaltal:</strong> ${Number(bestPlayer.avg).toFixed(2)}</p>
      <p><strong>Rating:</strong> ${bestPlayer.rating || "Óskráð"}/10</p>
      <p><strong>Mörk/Stig:</strong> ${bestPlayer.goals}</p>
      <p><strong>Leikir:</strong> ${bestPlayer.games}</p>
    </div>
  `;
}

function updateCompareDropdowns() {
  const select1 = document.getElementById("comparePlayer1");
  const select2 = document.getElementById("comparePlayer2");

  if (!select1 || !select2) return;

  select1.innerHTML = "";
  select2.innerHTML = "";

  savedReportsCache.forEach((item) => {
    const option1 = document.createElement("option");
    option1.value = item.id;
    option1.textContent = item.name;

    const option2 = document.createElement("option");
    option2.value = item.id;
    option2.textContent = item.name;

    select1.appendChild(option1);
    select2.appendChild(option2);
  });
}

function comparePlayers() {
  const comparisonDiv = document.getElementById("comparisonResult");

  if (savedReportsCache.length < 2) {
    comparisonDiv.innerHTML =
      "<p>Vistaðu að minnsta kosti tvo leikmenn til að bera saman.</p>";
    return;
  }

  const player1Id = document.getElementById("comparePlayer1").value;
  const player2Id = document.getElementById("comparePlayer2").value;

  const player1 = savedReportsCache.find((item) => item.id === player1Id);
  const player2 = savedReportsCache.find((item) => item.id === player2Id);

  if (!player1 || !player2) {
    comparisonDiv.innerHTML = "<p>Villa við að finna leikmenn.</p>";
    return;
  }

  comparisonDiv.innerHTML = `
    <div class="compare-box">
      <div class="compare-grid">
        <div class="compare-card">
          ${player1.image ? `<img src="${player1.image}" alt="${player1.name}">` : ""}
          <h3>${player1.name}</h3>
          <p><strong>Lið:</strong> ${player1.team}</p>
          <p><strong>Staða:</strong> ${player1.position}</p>
          <p><strong>Rating:</strong> ${player1.rating}/10</p>
          <p><strong>Meðaltal:</strong> ${Number(player1.avg).toFixed(2)}</p>
          <p><strong>Mörk/Stig:</strong> ${player1.goals}</p>
          <p><strong>Leikir:</strong> ${player1.games}</p>
        </div>

        <div class="compare-card">
          ${player2.image ? `<img src="${player2.image}" alt="${player2.name}">` : ""}
          <h3>${player2.name}</h3>
          <p><strong>Lið:</strong> ${player2.team}</p>
          <p><strong>Staða:</strong> ${player2.position}</p>
          <p><strong>Rating:</strong> ${player2.rating}/10</p>
          <p><strong>Meðaltal:</strong> ${Number(player2.avg).toFixed(2)}</p>
          <p><strong>Mörk/Stig:</strong> ${player2.goals}</p>
          <p><strong>Leikir:</strong> ${player2.games}</p>
        </div>
      </div>
    </div>
  `;
}

async function deleteReport(id) {
  try {
    await window.deleteDoc(window.doc(window.db, "reports", id));
    await loadReportsFromFirebase();
  } catch (error) {
    console.error(error);
    alert("Villa við að eyða skýrslu úr Firebase.");
  }
}

function downloadPDF() {
  const report = document.getElementById("report").innerHTML;
  const aiReport = document.getElementById("aiReport").innerHTML;

  if (
    !aiReport ||
    aiReport.includes("mun birtast") ||
    aiReport.includes("AI er að skrifa")
  ) {
    alert("Búðu fyrst til skýrslu.");
    return;
  }

  const pdfWindow = window.open("", "_blank");

  pdfWindow.document.write(`
    <html>
      <head>
        <title>Sports AI Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            line-height: 1.6;
          }

          h1 {
            text-align: center;
          }

          .section {
            border: 1px solid #ddd;
            padding: 20px;
            margin-top: 20px;
            border-radius: 10px;
          }

          img {
            width: 140px;
            height: 140px;
            object-fit: cover;
            border-radius: 50%;
          }
        </style>
      </head>

      <body>
        <h1>Sports AI Report</h1>

        <div class="section">
          ${report}
        </div>

        <div class="section">
          <h2>AI Skýrsla</h2>
          ${aiReport}
        </div>
      </body>
    </html>
  `);

  pdfWindow.document.close();
  pdfWindow.print();
}

window.addEventListener("load", async () => {
  try {
    await loadReportsFromFirebase();
  } catch (error) {
    console.error(error);
    alert("Firebase gögn hlóðust ekki. Athugaðu Firestore reglur.");
  }
});