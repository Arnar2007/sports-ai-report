let currentImage = "";

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
    reportDiv.innerHTML = "<p>Vinsamlegast fylltu inn nafn, aldur, lið, tímabil, leiki og mörk/stig.</p>";
    reportDiv.style.backgroundColor = "white";
    return;
  }

  const avg = goals / games;

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
    ${currentImage ? `<img src="${currentImage}" style="width:140px;height:140px;object-fit:cover;border-radius:50%;">` : ""}
    <p><strong>Aldur:</strong> ${age}</p>
    <p><strong>Lið:</strong> ${team}</p>
    <p><strong>Tímabil:</strong> ${season}</p>
    <p><strong>Íþrótt:</strong> ${sport}</p>
    <p><strong>Staða:</strong> ${position}</p>
    <p><strong>Leikir:</strong> ${games}</p>
    <p><strong>Mörk/Stig:</strong> ${goals}</p>
    <p><strong>Meðaltal:</strong> ${avg.toFixed(2)}</p>
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

function saveReport() {
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

  if (!aiText || aiText.includes("mun birtast") || aiText.includes("AI er að skrifa")) {
    alert("Búðu fyrst til AI skýrslu.");
    return;
  }

  const savedReports = JSON.parse(localStorage.getItem("reports")) || [];

  savedReports.push({
    name,
    age,
    team,
    season,
    sport,
    position,
    goals,
    games,
    avg,
    image: currentImage,
    report: aiText,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("reports", JSON.stringify(savedReports));

  showSavedReports();
  showLeaderboard();
  showDashboard();
  showPlayerCard();
}

function showSavedReports() {
  const savedReports = JSON.parse(localStorage.getItem("reports")) || [];
  const savedDiv = document.getElementById("savedReports");

  savedDiv.innerHTML = "";

  savedReports.forEach((item, index) => {
    savedDiv.innerHTML += `
      <div class="saved-report">
        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ""}
        <h3>${item.name}</h3>
        <p><strong>Aldur:</strong> ${item.age || "Óskráð"}</p>
        <p><strong>Lið:</strong> ${item.team || "Óskráð"}</p>
        <p><strong>Tímabil:</strong> ${item.season || "Óskráð"}</p>
        <p><strong>Íþrótt:</strong> ${item.sport}</p>
        <p><strong>Staða:</strong> ${item.position || "Óskráð"}</p>
        <p><strong>Dagsetning:</strong> ${item.date}</p>
        <p>${item.report}</p>
        <button onclick="deleteReport(${index})">Eyða</button>
      </div>
    `;
  });
}

function showLeaderboard() {
  const savedReports = JSON.parse(localStorage.getItem("reports")) || [];
  const leaderboardDiv = document.getElementById("leaderboard");

  const sortedReports = [...savedReports].sort((a, b) => b.avg - a.avg);

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
        <p>Meðaltal: ${item.avg.toFixed(2)} | Mörk/Stig: ${item.goals} | Leikir: ${item.games}</p>
      </div>
    `;
  });
}

function showDashboard() {
  const savedReports = JSON.parse(localStorage.getItem("reports")) || [];
  const dashboardDiv = document.getElementById("dashboard");

  if (savedReports.length === 0) {
    dashboardDiv.innerHTML = "<p>Engin gögn komin enn.</p>";
    return;
  }

  const totalPlayers = savedReports.length;

  const totalGoals = savedReports.reduce((sum, item) => sum + Number(item.goals), 0);
  const totalGames = savedReports.reduce((sum, item) => sum + Number(item.games), 0);
  const overallAvg = totalGames > 0 ? totalGoals / totalGames : 0;
  const bestPlayer = [...savedReports].sort((a, b) => b.avg - a.avg)[0];

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
  const savedReports = JSON.parse(localStorage.getItem("reports")) || [];
  const playerCardDiv = document.getElementById("playerCard");

  if (savedReports.length === 0) {
    playerCardDiv.innerHTML = "<p>Enginn leikmaður vistaður enn.</p>";
    return;
  }

  const bestPlayer = [...savedReports].sort((a, b) => b.avg - a.avg)[0];

  playerCardDiv.innerHTML = `
    <div class="player-card">
      ${bestPlayer.image ? `<img src="${bestPlayer.image}" alt="${bestPlayer.name}">` : ""}
      <h3>🏆 ${bestPlayer.name}</h3>
      <p><strong>Lið:</strong> ${bestPlayer.team || "Óskráð"}</p>
      <p><strong>Staða:</strong> ${bestPlayer.position || "Óskráð"}</p>
      <p><strong>Íþrótt:</strong> ${bestPlayer.sport}</p>
      <p><strong>Meðaltal:</strong> ${bestPlayer.avg.toFixed(2)}</p>
      <p><strong>Mörk/Stig:</strong> ${bestPlayer.goals}</p>
      <p><strong>Leikir:</strong> ${bestPlayer.games}</p>
    </div>
  `;
}

function deleteReport(index) {
  const savedReports = JSON.parse(localStorage.getItem("reports")) || [];

  savedReports.splice(index, 1);
  localStorage.setItem("reports", JSON.stringify(savedReports));

  showSavedReports();
  showLeaderboard();
  showDashboard();
  showPlayerCard();
}

function downloadPDF() {
  const report = document.getElementById("report").innerHTML;
  const aiReport = document.getElementById("aiReport").innerHTML;

  if (!aiReport || aiReport.includes("mun birtast") || aiReport.includes("AI er að skrifa")) {
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
        <div class="section">${report}</div>
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

showSavedReports();
showLeaderboard();
showDashboard();
showPlayerCard();