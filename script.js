function generateReport() {
  const name = document.getElementById("name").value;
  const sport = document.getElementById("sport").value;
  const games = Number(document.getElementById("games").value);
  const goals = Number(document.getElementById("goals").value);
  const strengths = document.getElementById("strengths").value;
  const weaknesses = document.getElementById("weaknesses").value;
  const reportDiv = document.getElementById("report");

  if (!name || !games || goals < 0) {
    reportDiv.innerHTML = "<p>Vinsamlegast fylltu inn nafn, leiki og mörk/stig.</p>";
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
    aiComment = `${name} hefur sýnt góða frammistöðu í sóknarleik.`;
  } else if (sport === "Handbolti") {
    aiComment = `${name} hefur verið mikilvægur þáttur í leik liðsins.`;
  } else if (sport === "Körfubolti") {
    aiComment = `${name} hefur lagt mikið af mörkum í stigaskorun.`;
  }

  reportDiv.innerHTML = `
    <h2>${name}</h2>
    <p><strong>Íþrótt:</strong> ${sport}</p>
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

  generateAIReport(name, sport, games, goals, strengths, weaknesses);
}

async function generateAIReport(name, sport, games, goals, strengths, weaknesses) {
  const aiDiv = document.getElementById("aiReport");

  aiDiv.innerHTML = "AI er að skrifa skýrslu...";

  try {
    const response = await fetch("http://localhost:3000/generate-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        sport,
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
  const sport = document.getElementById("sport").value;
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
    sport,
    goals,
    games,
    avg,
    report: aiText,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("reports", JSON.stringify(savedReports));

  showSavedReports();
  showLeaderboard();
}

function showSavedReports() {
  const savedReports = JSON.parse(localStorage.getItem("reports")) || [];
  const savedDiv = document.getElementById("savedReports");

  savedDiv.innerHTML = "";

  savedReports.forEach((item, index) => {
    savedDiv.innerHTML += `
      <div class="saved-report">
        <h3>${item.name}</h3>
        <p><strong>Íþrótt:</strong> ${item.sport}</p>
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
        <p>Íþrótt: ${item.sport}</p>
        <p>Meðaltal: ${item.avg.toFixed(2)} | Mörk/Stig: ${item.goals} | Leikir: ${item.games}</p>
      </div>
    `;
  });
}

function deleteReport(index) {
  const savedReports = JSON.parse(localStorage.getItem("reports")) || [];

  savedReports.splice(index, 1);
  localStorage.setItem("reports", JSON.stringify(savedReports));

  showSavedReports();
  showLeaderboard();
}

showSavedReports();
showLeaderboard();