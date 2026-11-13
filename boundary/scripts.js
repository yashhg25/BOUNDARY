
// BOUNDARY - JavaScript

function startMatch() {
    window.location.href = "new match.html";
}

function showTeams() {
    window.location.href = "teams.html";
}

function showPlayers() {
    window.location.href = "players.html";
}

function showSeries() {
    window.location.href = "series.html";
}

function showHistory() {
    window.location.href = "history.html";
}
function continueSetup() {
    const matchName = document.getElementById("matchName").value;
    const matchDate = document.getElementById("matchDate").value;
    const groundName = document.getElementById("groundName").value;
    const teamA = document.getElementById("teamA").value;
    const teamB = document.getElementById("teamB").value;
    const overs = document.getElementById("overs").value;
    const players = document.getElementById("players").value;

    if (!matchDate || !groundName || !teamA || !teamB || !overs || !players) {
        alert("Please fill in all required fields.");
        return;
    }

    if (teamA.trim().toLowerCase() === teamB.trim().toLowerCase()) {
        alert("Please enter different team names.");
        return;
    }

    const matchDetails = {
        matchName,
        matchDate,
        groundName,
        teamA,
        teamB,
        overs,
        players
    };

    localStorage.setItem("matchDetails", JSON.stringify(matchDetails));
    // Reset previous match data for the new match
localStorage.removeItem("liveScore");
localStorage.removeItem("openingPlayers");
localStorage.removeItem("tossDetails");

    window.location.href = "player-setup.html";
}

// PLAYER SETUP

const match = JSON.parse(localStorage.getItem("matchDetails"));

let teamAPlayers = JSON.parse(localStorage.getItem("teamAPlayers")) || [];
let teamBPlayers = JSON.parse(localStorage.getItem("teamBPlayers")) || [];

if (document.getElementById("teamAHeading") && match) {
    document.getElementById("teamAHeading").textContent = match.teamA;
    document.getElementById("teamBHeading").textContent = match.teamB;

    document.getElementById("matchTitle").textContent =
        match.matchName || "Player Setup";

    displayPlayers();
}

function addPlayer(team) {
    const input = document.getElementById(
        team === "A" ? "playerAName" : "playerBName"
    );

    const name = input.value.trim();

    if (!name) {
        alert("Please enter a player name.");
        return;
    }

    const players = team === "A" ? teamAPlayers : teamBPlayers;

    if (players.some(player => player.toLowerCase() === name.toLowerCase())) {
        alert("This player is already added to this team.");
        return;
    }

    players.push(name);

    localStorage.setItem("teamAPlayers", JSON.stringify(teamAPlayers));
    localStorage.setItem("teamBPlayers", JSON.stringify(teamBPlayers));

    input.value = "";
    displayPlayers();
}

function displayPlayers() {
    const listA = document.getElementById("teamAList");
    const listB = document.getElementById("teamBList");

    if (!listA || !listB) return;

    listA.innerHTML = "";
    listB.innerHTML = "";

    teamAPlayers.forEach((player, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${player}`;
        listA.appendChild(li);
    });

    teamBPlayers.forEach((player, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${player}`;
        listB.appendChild(li);
    });
}

function finishPlayerSetup() {
    if (!match) {
        alert("Please complete Match Setup first.");
        return;
    }

    if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
        alert("Please add at least one player to each team.");
        return;
    }

    window.location.href = "toss.html";
}

// TOSS PAGE

function loadTossPage() {
    const match = JSON.parse(localStorage.getItem("matchDetails"));

    if (!match || !document.getElementById("tossWinner")) {
        return;
    }

    const teamAPlayers =
        JSON.parse(localStorage.getItem("teamAPlayers")) || [];

    const teamBPlayers =
        JSON.parse(localStorage.getItem("teamBPlayers")) || [];

    document.getElementById("matchSummary").innerHTML = `
        <strong>Match:</strong> ${match.matchName || "Friendly Match"}<br>
        <strong>Date:</strong> ${match.matchDate}<br>
        <strong>Ground:</strong> ${match.groundName}<br>
        <strong>Teams:</strong> ${match.teamA} vs ${match.teamB}<br>
        <strong>Overs:</strong> ${match.overs}<br>
        <strong>Players:</strong> ${teamAPlayers.length} vs ${teamBPlayers.length}
    `;

    const tossWinner = document.getElementById("tossWinner");

    tossWinner.innerHTML = `
        <option value="">Select Team</option>
        <option value="A">${match.teamA}</option>
        <option value="B">${match.teamB}</option>
    `;
}

function startScoring() {
    const winner = document.getElementById("tossWinner").value;
    const decision = document.getElementById("tossDecision").value;

    if (!winner || !decision) {
        alert("Please select the toss winner and decision.");
        return;
    }

    const match = JSON.parse(localStorage.getItem("matchDetails"));

    const battingFirst = decision === "bat"
        ? winner
        : winner === "A" ? "B" : "A";

    const tossDetails = {
        tossWinner: winner,
        tossDecision: decision,
        battingFirst: battingFirst
    };

    localStorage.setItem("tossDetails", JSON.stringify(tossDetails));

    window.location.href = "live-scoring.html";
}

loadTossPage();

// LIVE SCORING

let liveMatch = JSON.parse(localStorage.getItem("matchDetails"));
let liveToss = JSON.parse(localStorage.getItem("tossDetails"));

let scoreState = JSON.parse(localStorage.getItem("liveScore")) || {
    runs: 0,
    wickets: 0,
    legalBalls: 0,
    history: []
};

function saveScore() {
    localStorage.setItem("liveScore", JSON.stringify(scoreState));
}

function loadLiveScoring() {
    if (!liveMatch || !liveToss ||
        !document.getElementById("totalScore")) {
        return;
    }

    const battingTeam = liveToss.battingFirst === "A"
        ? liveMatch.teamA
        : liveMatch.teamB;

    document.getElementById("battingTeamName").textContent =
        battingTeam;

    document.getElementById("matchInfo").textContent =
        `${liveMatch.overs} overs match`;

        loadOpeningPlayerOptions();

    updateScoreboard();
}

function savePreviousState() {
    return {
        runs: scoreState.runs,
        wickets: scoreState.wickets,
        legalBalls: scoreState.legalBalls,
        history: [...scoreState.history],
        openingPlayers: JSON.parse(
            localStorage.getItem("openingPlayers")
        )
    };
}

function recordDelivery(runs, legalBall, description, wicket = false, strikeRuns = 0) {

    const previousState = savePreviousState();

    scoreState.runs += runs;

    if (wicket) {
        scoreState.wickets++;
    }

    let players = JSON.parse(
        localStorage.getItem("openingPlayers")
    );

    if (players) {

        // Odd runs rotate strike
        if (Math.abs(strikeRuns) % 2 === 1) {
            const temp = players.striker;
            players.striker = players.nonStriker;
            players.nonStriker = temp;
        }

        if (legalBall) {
            scoreState.legalBalls++;

            // End of over
            if (scoreState.legalBalls % 6 === 0) {

                players.lastOverBowler = players.bowler;

                const temp = players.striker;
                players.striker = players.nonStriker;
                players.nonStriker = temp;

                localStorage.setItem(
                    "openingPlayers",
                    JSON.stringify(players)
                );

                saveScore();

                updateCurrentPlayersDisplay();

                if (scoreState.legalBalls < Number(liveMatch.overs) * 6) {
                    selectNextBowler();
                }
            }
        }

        localStorage.setItem(
            "openingPlayers",
            JSON.stringify(players)
        );
    }

    scoreState.history.push({
        description: description,
        previousState: previousState
    });

    saveScore();
    updateScoreboard();
    updateCurrentPlayersDisplay();
}

function addRuns(runs) {
    if (!canContinueInnings()) return;

    recordDelivery(
        runs,
        true,
        runs + (runs === 1 ? " Run" : " Runs"),
        false,
        runs
    );
}

function addExtra(type) {
    if (!canContinueInnings()) return;

    let additionalRuns = prompt(
        type === "wide"
            ? "Enter additional wide runs (excluding the automatic 1):"
            : type === "noBall"
            ? "Enter runs scored off the bat (excluding the automatic 1):"
            : "Enter the number of " + type + " runs:"
    );

    if (additionalRuns === null) return;

    additionalRuns = Number(additionalRuns);

    if (!Number.isInteger(additionalRuns) || additionalRuns < 0) {
        alert("Please enter a valid whole number.");
        return;
    }

    if (type === "wide") {
        recordDelivery(
            1 + additionalRuns,
            false,
            `Wide: ${1 + additionalRuns} run(s)`,
            false,
            additionalRuns
        );

    } else if (type === "noBall") {
        recordDelivery(
            1 + additionalRuns,
            false,
            `No Ball: ${1 + additionalRuns} run(s)`,
            false,
            additionalRuns
        );

    } else if (type === "bye" || type === "legBye") {
        recordDelivery(
            additionalRuns,
            true,
            `${type}: ${additionalRuns} run(s)`,
            false,
            additionalRuns
        );
    }
}

function addWicket() {

    if (!canContinueInnings()) return;

    const players = JSON.parse(
        localStorage.getItem("openingPlayers")
    );

    if (!players) {
        alert("Confirm opening players first.");
        return;
    }

    const outChoice = prompt(
        "Which batter is OUT?\n1. " +
        players.striker +
        "\n2. " +
        players.nonStriker
    );

    if (outChoice !== "1" && outChoice !== "2") {
        return;
    }

    const dismissed = outChoice === "1"
        ? players.striker
        : players.nonStriker;

    const battingPlayers = liveToss.battingFirst === "A"
        ? teamAPlayers
        : teamBPlayers;

    const maximumWickets = Math.max(
        0,
        Number(liveMatch.players) - 1
    );

    const isLastWicket =
        scoreState.wickets + 1 >= maximumWickets;

    let newBatter = "";

    if (!isLastWicket) {

        const availableBatters = battingPlayers.filter(
            player =>
                player !== players.striker &&
                player !== players.nonStriker &&
                !(players.dismissedPlayers || []).includes(player)
        );

        if (availableBatters.length === 0) {
            alert("No more available batters!");
            return;
        }

        const options = availableBatters
            .map((player, index) => `${index + 1}. ${player}`)
            .join("\n");

        const choice = prompt(
            dismissed + " is OUT!\nSelect the incoming batter:\n\n" +
            options
        );

        if (choice === null) return;

        const selectedIndex = Number(choice) - 1;

        if (!Number.isInteger(selectedIndex) ||
            selectedIndex < 0 ||
            selectedIndex >= availableBatters.length) {
            alert("Invalid batter selection.");
            return;
        }

        newBatter = availableBatters[selectedIndex];
    }

    recordDelivery(0, true, dismissed + " OUT!", true);

    const updatedPlayers = JSON.parse(
        localStorage.getItem("openingPlayers")
    );

    updatedPlayers.dismissedPlayers =
        updatedPlayers.dismissedPlayers || [];

    updatedPlayers.dismissedPlayers.push(dismissed);

    if (newBatter) {
        if (updatedPlayers.striker === dismissed) {
            updatedPlayers.striker = newBatter;
        } else {
            updatedPlayers.nonStriker = newBatter;
        }
    }

    localStorage.setItem(
        "openingPlayers",
        JSON.stringify(updatedPlayers)
    );

    updateCurrentPlayersDisplay();

    if (isLastWicket) {
        alert("All available wickets have fallen. Innings over!");
    } else {
        alert("New batter: " + newBatter);
    }
}

function canContinueInnings() {
    const maximumBalls = Number(liveMatch.overs) * 6;
    const maximumWickets = Math.max(
        0, Number(liveMatch.players) - 1
    );

    if (scoreState.legalBalls >= maximumBalls) {
        alert("The overs are complete!");
        return false;
    }

    if (scoreState.wickets >= maximumWickets) {
        alert("All available wickets have fallen!");
        return false;
    }
const currentPlayers = JSON.parse(
    localStorage.getItem("openingPlayers")
);

if (currentPlayers && !currentPlayers.bowler) {
    alert("Please select the next bowler before continuing.");
    return false;
}
    return true;
}

function undoBall() {
    if (scoreState.history.length === 0) {
        alert("There is no delivery to undo.");
        return;
    }

    const lastDelivery = scoreState.history.pop();
    const previous = lastDelivery.previousState;

    scoreState.runs = previous.runs;
    scoreState.wickets = previous.wickets;
    scoreState.legalBalls = previous.legalBalls;
    scoreState.history = previous.history;

    if (previous.openingPlayers) {
        localStorage.setItem(
            "openingPlayers",
            JSON.stringify(previous.openingPlayers)
        );
    }

    saveScore();
    updateScoreboard();
}

function updateScoreboard() {
    const completedOvers = Math.floor(scoreState.legalBalls / 6);
    const ballsInOver = scoreState.legalBalls % 6;

    const oversBowled = completedOvers + ballsInOver / 6;
    const runRate = oversBowled > 0
        ? (scoreState.runs / oversBowled).toFixed(2)
        : "0.00";

    document.getElementById("totalScore").textContent =
        `${scoreState.runs}/${scoreState.wickets}`;

    document.getElementById("oversDisplay").textContent =
        `Overs: ${completedOvers}.${ballsInOver}`;

    document.getElementById("runRate").textContent =
        `Run Rate: ${runRate}`;

    const historyList = document.getElementById("ballHistory");
    historyList.innerHTML = "";

    if (scoreState.history.length === 0) {
        historyList.innerHTML = "<li>No deliveries yet.</li>";
        return;
    }

    scoreState.history.slice(-12).reverse().forEach(item => {
        const li = document.createElement("li");
        li.textContent = item.description;
        historyList.appendChild(li);
    });
}

loadLiveScoring();

// SCORECARD PAGE


function loadScorecard() {
    const match = JSON.parse(localStorage.getItem("matchDetails"));
    const toss = JSON.parse(localStorage.getItem("tossDetails"));
    const score = JSON.parse(localStorage.getItem("liveScore"));
    const players = JSON.parse(localStorage.getItem("openingPlayers"));

    if (!match || !toss || !score ||
        !document.getElementById("scorecardTotal")) {
        return;
    }

    const battingTeam = toss.battingFirst === "A"
        ? match.teamA
        : match.teamB;

    const completedOvers = Math.floor(score.legalBalls / 6);
    const ballsInOver = score.legalBalls % 6;

    document.getElementById("scorecardTeam").textContent =
        battingTeam;

    document.getElementById("scorecardMatchInfo").textContent =
        `${match.teamA} vs ${match.teamB} | ${match.matchDate}`;

    document.getElementById("scorecardTotal").textContent =
        `${score.runs}/${score.wickets}`;

    document.getElementById("scorecardOvers").textContent =
        `Overs: ${completedOvers}.${ballsInOver}`;

    document.getElementById("battingSummary").textContent =
        "Individual batter statistics will be added in the next scoring upgrade.";

    if (players) {
        document.getElementById("bowlingSummary").textContent =
            `Previous Over Bowler: ${players.lastOverBowler || "Not available"} | Current Bowler: ${players.bowler || "Not selected"}`;
    } else {
        document.getElementById("bowlingSummary").textContent =
            "Bowler information not available.";
    }
}

// TEAMS MANAGEMENT

function saveTeam() {
    const input = document.getElementById("newTeamName");
    const teamName = input.value.trim();

    if (!teamName) {
        alert("Please enter a team name.");
        return;
    }

    let savedTeams = JSON.parse(localStorage.getItem("savedTeams")) || [];

    const alreadyExists = savedTeams.some(
        team => team.name.toLowerCase() === teamName.toLowerCase()
    );

    if (alreadyExists) {
        alert("This team already exists.");
        return;
    }

    savedTeams.push({
        name: teamName,
        players: []
    });

    localStorage.setItem("savedTeams", JSON.stringify(savedTeams));

    input.value = "";
    displaySavedTeams();

    alert("Team saved successfully!");
}

function displaySavedTeams() {
    const list = document.getElementById("savedTeamsList");

    if (!list) return;

    const savedTeams = JSON.parse(localStorage.getItem("savedTeams")) || [];

    list.innerHTML = "";

    if (savedTeams.length === 0) {
        list.innerHTML = "<li>No teams saved yet.</li>";
        return;
    }

    savedTeams.forEach(team => {
        const li = document.createElement("li");
        li.textContent = `${team.name} (${team.players.length} players)`;
        list.appendChild(li);
    });
}

displaySavedTeams();

// PLAYER PROFILES

function savePlayer() {
    const input = document.getElementById("newPlayerName");
    const playerName = input.value.trim();

    if (!playerName) {
        alert("Please enter a player name.");
        return;
    }

    let players = JSON.parse(
        localStorage.getItem("playerProfiles")
    ) || [];

    const exists = players.some(
        player => player.name.toLowerCase() === playerName.toLowerCase()
    );

    if (exists) {
        alert("This player is already registered.");
        return;
    }

    const newPlayer = {
        id: Date.now().toString(),
        name: playerName,
        matches: 0,
        runs: 0,
        wickets: 0
    };

    players.push(newPlayer);

    localStorage.setItem("playerProfiles", JSON.stringify(players));

    input.value = "";
    displayRegisteredPlayers();

    alert("Player registered successfully!");
}

function displayRegisteredPlayers() {
    const list = document.getElementById("registeredPlayersList");

    if (!list) return;

    const players = JSON.parse(
        localStorage.getItem("playerProfiles")
    ) || [];

    list.innerHTML = "";

    if (players.length === 0) {
        list.innerHTML = "<li>No players registered yet.</li>";
        return;
    }

    players.forEach(player => {
        const li = document.createElement("li");

        li.textContent =
            `${player.name} | Matches: ${player.matches} | Runs: ${player.runs} | Wickets: ${player.wickets}`;

        list.appendChild(li);
    });
}

displayRegisteredPlayers();

// SERIES MANAGEMENT

function saveSeries() {
    const name = document.getElementById("seriesName").value.trim();
    const teamA = document.getElementById("seriesTeamA").value.trim();
    const teamB = document.getElementById("seriesTeamB").value.trim();
    const plannedMatches = Number(
        document.getElementById("plannedMatches").value
    );

    if (!name || !teamA || !teamB || !plannedMatches) {
        alert("Please fill in all series details.");
        return;
    }

    if (teamA.toLowerCase() === teamB.toLowerCase()) {
        alert("Please enter two different teams.");
        return;
    }

    if (!Number.isInteger(plannedMatches) || plannedMatches < 1) {
        alert("Please enter a valid number of matches.");
        return;
    }

    let seriesList = JSON.parse(localStorage.getItem("savedSeries")) || [];

    const exists = seriesList.some(
        series => series.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
        alert("A series with this name already exists.");
        return;
    }

    seriesList.push({
        id: Date.now().toString(),
        name: name,
        teamA: teamA,
        teamB: teamB,
        plannedMatches: plannedMatches,
        matches: []
    });

    localStorage.setItem("savedSeries", JSON.stringify(seriesList));

    document.getElementById("seriesName").value = "";
    document.getElementById("seriesTeamA").value = "";
    document.getElementById("seriesTeamB").value = "";
    document.getElementById("plannedMatches").value = "";

    displaySavedSeries();

    alert("Series created successfully!");
}

function displaySavedSeries() {
    const list = document.getElementById("savedSeriesList");

    if (!list) return;

    const seriesList = JSON.parse(localStorage.getItem("savedSeries")) || [];

    list.innerHTML = "";

    if (seriesList.length === 0) {
        list.innerHTML = "<li>No series created yet.</li>";
        return;
    }

    seriesList.forEach(series => {
    const li = document.createElement("li");

    const link = document.createElement("a");
    link.href = `series-dashboard.html?id=${series.id}`;
    link.textContent = series.name;

    li.appendChild(link);

    const details = document.createElement("span");
    details.textContent =
        ` | ${series.teamA} vs ${series.teamB} | ${series.matches.length}/${series.plannedMatches} matches`;

    li.appendChild(details);
    list.appendChild(li);
});
}

displaySavedSeries();

// SERIES DASHBOARD

function loadSeriesDashboard() {
    const params = new URLSearchParams(window.location.search);
    const seriesId = params.get("id");

    const seriesList = JSON.parse(
        localStorage.getItem("savedSeries")
    ) || [];

    const series = seriesList.find(item => item.id === seriesId);

    if (!series || !document.getElementById("dashboardSeriesName")) {
        return;
    }

    document.getElementById("dashboardSeriesName").textContent =
        series.name;

    document.getElementById("dashboardTeams").textContent =
        `${series.teamA} vs ${series.teamB}`;

    document.getElementById("matchesProgress").textContent =
        `${series.matches.length}/${series.plannedMatches}`;

    let teamAWins = 0;
    let teamBWins = 0;
    let ties = 0;

    series.matches.forEach(match => {
        if (match.winner === "tie") {
            ties++;
        } else if (match.winner === series.teamA) {
            teamAWins++;
        } else if (match.winner === series.teamB) {
            teamBWins++;
        }
    });

    document.getElementById("seriesStandings").innerHTML = `
        <p><strong>${series.teamA}</strong></p>
        <p>Wins: ${teamAWins}</p>
        <p><strong>${series.teamB}</strong></p>
        <p>Wins: ${teamBWins}</p>
        <p>Tied Matches: ${ties}</p>
    `;

    const resultsList = document.getElementById("seriesMatchResults");
    resultsList.innerHTML = "";

    if (series.matches.length === 0) {
        resultsList.innerHTML = "<li>No match results yet.</li>";
        return;
    }

    series.matches.forEach((match, index) => {
        const li = document.createElement("li");
        li.textContent =
            `Match ${index + 1}: ${match.result || "Result pending"}`;
        resultsList.appendChild(li);
    });
}

loadSeriesDashboard();

// MATCH HISTORY

function displayMatchHistory() {
    const list = document.getElementById("matchHistoryList");

    if (!list) return;

    const search = document.getElementById("matchSearch")
        .value.trim().toLowerCase();

    const matches = JSON.parse(
        localStorage.getItem("matchHistory")
    ) || [];

    list.innerHTML = "";

    const filteredMatches = matches.filter(match => {
        const searchableText = [
            match.matchName,
            match.teamA,
            match.teamB,
            match.groundName,
            match.result
        ].join(" ").toLowerCase();

        return searchableText.includes(search);
    });

    if (filteredMatches.length === 0) {
        list.innerHTML = "<li>No matching matches found.</li>";
        return;
    }

    filteredMatches.forEach(match => {
        const li = document.createElement("li");

        li.textContent =
            `${match.matchName || "Cricket Match"} | ` +
            `${match.teamA} vs ${match.teamB} | ` +
            `${match.matchDate} | ${match.result || "Result pending"}`;

        list.appendChild(li);
    });
}

displayMatchHistory();
// OPENING PLAYER SELECTION

function loadOpeningPlayerOptions() {
    if (!document.getElementById("striker")) return;

    const battingPlayers = liveToss.battingFirst === "A"
        ? teamAPlayers
        : teamBPlayers;

    const bowlingPlayers = liveToss.battingFirst === "A"
        ? teamBPlayers
        : teamAPlayers;

    const strikerSelect = document.getElementById("striker");
    const nonStrikerSelect = document.getElementById("nonStriker");
    const bowlerSelect = document.getElementById("openingBowler");

    function fillDropdown(select, players) {
        select.innerHTML = '<option value="">Select Player</option>';

        players.forEach(player => {
            const option = document.createElement("option");
            option.value = player;
            option.textContent = player;
            select.appendChild(option);
        });
    }

    fillDropdown(strikerSelect, battingPlayers);
    fillDropdown(nonStrikerSelect, battingPlayers);
    fillDropdown(bowlerSelect, bowlingPlayers);
}


function confirmOpeningPlayers() {
    const striker = document.getElementById("striker").value;
    const nonStriker = document.getElementById("nonStriker").value;
    const bowler = document.getElementById("openingBowler").value;

    if (!striker || !nonStriker || !bowler) {
        alert("Please select all three players.");
        return;
    }

    if (striker === nonStriker) {
        alert("Select two different batters.");
        return;
    }

    const openingPlayers = {
        striker: striker,
        nonStriker: nonStriker,
        bowler: bowler,
        dismissedPlayers: [],
        lastOverBowler: ""
    };

    localStorage.setItem(
        "openingPlayers",
        JSON.stringify(openingPlayers)
    );

    updateCurrentPlayersDisplay();

    document.getElementById("striker")
        .closest(".setup-form").style.display = "none";

    document.getElementById("openingStatus").textContent =
        "Opening players confirmed!";

    alert("Opening players selected successfully!");
}

function updateCurrentPlayersDisplay() {
    const players = JSON.parse(
        localStorage.getItem("openingPlayers")
    );

    if (!players) return;

    document.getElementById("currentStriker").textContent =
        players.striker || "Not selected";

    document.getElementById("currentNonStriker").textContent =
        players.nonStriker || "Not selected";

    document.getElementById("currentBowler").textContent =
        players.bowler || "Not selected";
}

function selectNextBowler() {
    const players = JSON.parse(
        localStorage.getItem("openingPlayers")
    );

    const bowlingPlayers = liveToss.battingFirst === "A"
        ? teamBPlayers
        : teamAPlayers;

    const availableBowlers = bowlingPlayers.filter(
        player => player !== players.lastOverBowler
    );

    if (availableBowlers.length === 0) {
        players.bowler = "";

        localStorage.setItem(
            "openingPlayers",
            JSON.stringify(players)
        );

        updateCurrentPlayersDisplay();
        alert("No eligible next bowler. Add another bowling player.");
        return;
    }

    const options = availableBowlers
        .map((player, index) => `${index + 1}. ${player}`)
        .join("\n");

    const choice = prompt(
        "OVER COMPLETED!\nSelect the next bowler:\n\n" + options
    );

    const selectedIndex = Number(choice) - 1;

    if (
        choice === null ||
        !Number.isInteger(selectedIndex) ||
        selectedIndex < 0 ||
        selectedIndex >= availableBowlers.length
    ) {
        players.bowler = "";

        localStorage.setItem(
            "openingPlayers",
            JSON.stringify(players)
        );

        updateCurrentPlayersDisplay();
        alert("Select a bowler before continuing.");
        return;
    }

    players.bowler = availableBowlers[selectedIndex];

    localStorage.setItem(
        "openingPlayers",
        JSON.stringify(players)
    );

    updateCurrentPlayersDisplay();
    alert("Next bowler: " + players.bowler);
}
