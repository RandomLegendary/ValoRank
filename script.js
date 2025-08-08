// DOM Elements
const gamesContainer = document.getElementById("games-container");
const defaultStats = document.getElementById("default-stats");
const loadingIndicator = document.getElementById("loading");
const lastFiveGames = document.getElementById("last-five-games");

// Toggle sections
lastFiveGames.addEventListener("click", () => {
  const isExpanded = gamesContainer.style.display === "flex";
  gamesContainer.style.display = isExpanded ? "none" : "flex";
  const icon = lastFiveGames.querySelector(".toggle-icon");
  icon.textContent = isExpanded ? "+" : "-";
});

async function getAccountData() {
  const response = await fetch(
    `https://valorank-64i1.onrender.com/${username.value}/${tag.value}`
  );
  return await response.json();
}

async function getMatchList() {
  const response = await fetch(
    `https://valorank-64i1.onrender.com/${region.value}/${username.value}/${tag.value}`
  );
  return await response.json();
}

async function getMMR() {
  const response = await fetch(
    `https://valorank-64i1.onrender.com/${region.value}/${platform.value}/${username.value}/${tag.value}`
  );
  return await response.json();
}

async function useData() {
  // Show loading indicator
  loadingIndicator.style.display = "flex";
  defaultStats.style.display = "none";
  gamesContainer.style.display = "none";
  gamesContainer.innerHTML = "";

  try {
    const [accountData, matchList, MMR] = await Promise.all([
      getAccountData(),
      getMatchList(),
      getMMR()
    ]);

    console.log("Account Data:", accountData);
    console.log("Match List:", matchList);
    console.log("MMR Data:", MMR);

    updateValues(accountData, matchList, MMR);
    
    // Show stats and games sections
    defaultStats.style.display = "block";
    lastFiveGames.style.display = "block";
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Failed to fetch data. Please check your inputs and try again.");
  } finally {
    loadingIndicator.style.display = "none";
  }
}

function updateValues(accountData, matchList, MMR) {
  // Update basic stats
  defaultStats.innerHTML = `
    <h2>PLAYER STATISTICS</h2>
    <p><strong>Name:</strong> ${accountData.data.name}</p>
    <p><strong>Tag:</strong> ${accountData.data.tag}</p>
    <p><strong>Account Level:</strong> ${accountData.data.account_level}</p>
    <p><strong>Current Rank:</strong> ${MMR.data.current.tier.name || "Unranked"}</p>
    <p><strong>Rank Rating:</strong> ${MMR.data.current.rr || "0"} RR</p>
  `;

  // Add games
  matchList.data.slice(0, 5).forEach((game, index) => {
    const gameDiv = document.createElement("div");
    gameDiv.className = "game-card";
    gameDiv.innerHTML = `
      <div class="game-header">
        <h4>Game ${index + 1} - ${game.metadata.mode}</h4>
        <div class="game-meta">
          <span>${game.metadata.game_start_patched}</span>
          <span>${game.metadata.map}</span>
        </div>
      </div>
      <div class="game-content">
        <div class="game-map">
          <div>
            <p><strong>Server:</strong> ${game.metadata.cluster}</p>
            <p><strong>Mode:</strong> ${game.metadata.mode}</p>
            <p><strong>Rounds Played:</strong> ${game.metadata.rounds_played}</p>
          </div>
        </div>
        
        <div class="game-teams">
          <div class="team team-blue">
            <div class="team-header">
              <h4>Team Blue</h4>
              <span>Score: ${game.teams.blue.rounds_won}</span>
            </div>
            ${game.players.blue.map(player => createPlayerCard(player)).join('')}
          </div>
          
          <div class="team team-red">
            <div class="team-header">
              <h4>Team Red</h4>
              <span>Score: ${game.teams.red.rounds_won}</span>
            </div>
            ${game.players.red.map(player => createPlayerCard(player)).join('')}
          </div>
        </div>
        
        <div class="rounds-section">
          <h4>Round Details</h4>
          ${game.rounds.map((round, roundIndex) => createRoundAccordion(round, roundIndex)).join('')}
        </div>
      </div>
    `;
    
    gamesContainer.appendChild(gameDiv);
    
    // Add click event to game header
    const gameHeader = gameDiv.querySelector(".game-header");
    const gameContent = gameDiv.querySelector(".game-content");
    gameHeader.addEventListener("click", () => {
      gameContent.classList.toggle("expanded");
    });
  });
  
  // Add click events to all round headers
  document.querySelectorAll(".round-header").forEach(header => {
    header.addEventListener("click", function() {
      this.nextElementSibling.classList.toggle("expanded");
    });
  });
}

function createPlayerCard(player) {
  return `
    <div class="player-card">
      <img src="${player.assets.agent.killfeed}" alt="${player.character}" class="agent-image">
      <div class="player-info">
        <div class="player-name">${player.name}#${player.tag}</div>
        <div class="player-stats">
          <span>K/D/A: ${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}</span>
        </div>
      </div>
    </div>
  `;
}

function createRoundAccordion(round, index) {
  return `
    <div class="round-accordion">
      <div class="round-header">
        <span><strong>Round ${index + 1}</strong> - ${round.winning_team} won (${round.end_type})</span>
        <span>▼</span>
      </div>
      <div class="round-content">
        <div class="player-stats-grid">
          ${round.player_stats.map(playerStats => createPlayerStatsCard(playerStats)).join('')}
        </div>
      </div>
    </div>
  `;
}

function createPlayerStatsCard(playerStats) {
  const killEvents = playerStats.kill_events ? 
    playerStats.kill_events.map((kill, i) => `
      <div class="kill-event">
        <p><strong>Kill ${i + 1}:</strong> ${kill.killer_display_name} → ${kill.victim_display_name}</p>
        <p>Weapon: ${kill.damage_weapon_name}</p>
      </div>
    `).join('') : '<p>No kills this round</p>';
    
  return `
    <div class="stat-card">
      <p><strong>Player:</strong> ${playerStats.player_display_name}</p>
      <p><strong>Score:</strong> ${playerStats.score}</p>
      <p><strong>Damage:</strong> ${playerStats.damage}</p>
      <p><strong>Shots:</strong> 
        HS: ${playerStats.headshots} | 
        Body: ${playerStats.bodyshots} | 
        Leg: ${playerStats.legshots}
      </p>
      <div>
        <p><strong>Economy:</strong></p>
        <p>Loadout: $${playerStats.economy.loadout_value}</p>
        <p>Spent: $${playerStats.economy.spent}</p>
        <p>Weapon: ${playerStats.economy.weapon.name}</p>
        <img src="${playerStats.economy.weapon.assets.display_icon}" class="weapon-image">
      </div>
      <div class="kill-events">
        <p><strong>Kills:</strong></p>
        ${killEvents}
      </div>
    </div>
  `;
}