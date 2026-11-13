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

    localStorage.removeItem("liveScore");
    localStorage.removeItem("openingPlayers");
    localStorage.removeItem("tossDetails");
    localStorage.removeItem("firstInningsScore");
    localStorage.removeItem("currentInnings");
    localStorage.removeItem("matchFinished");
    localStorage.removeItem("superOverState");

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
    const teamAList = document.getElementById("teamAList");
    const teamBList = document.getElementById("teamBList");

    teamAList.innerHTML = "";
    teamBList.innerHTML = "";

    teamAPlayers.forEach((player, index) => {
        teamAList.innerHTML += `
            <li>
                ${index + 1}. ${escapeHTML(player)}
                <button onclick="editPlayer('A', ${index})">Edit</button>
                <button onclick="deletePlayer('A', ${index})">Delete</button>
            </li>
        `;
    });

    teamBPlayers.forEach((player, index) => {
        teamBList.innerHTML += `
            <li>
                ${index + 1}. ${escapeHTML(player)}
                <button onclick="editPlayer('B', ${index})">Edit</button>
                <button onclick="deletePlayer('B', ${index})">Delete</button>
            </li>
        `;
    });
}function editPlayer(team, index) {
    const players = team === "A" ? teamAPlayers : teamBPlayers;

    const oldName = players[index];
    const newName = prompt("Enter updated player name:", oldName);

    if (newName === null) return;

    const updatedName = newName.trim();

    if (updatedName === "") {
        alert("Player name cannot be empty.");
        return;
    }

    if (players.some((p, i) =>
        i !== index && p.toLowerCase() === updatedName.toLowerCase()
    )) {
        alert("This player name already exists in this team.");
        return;
    }

    players[index] = updatedName;

    localStorage.setItem("teamAPlayers", JSON.stringify(teamAPlayers));
    localStorage.setItem("teamBPlayers", JSON.stringify(teamBPlayers));

    displayPlayers();
}

function deletePlayer(team, index) {
    const players = team === "A" ? teamAPlayers : teamBPlayers;

    if (!confirm("Are you sure you want to delete this player?")) {
        return;
    }

    players.splice(index, 1);

    localStorage.setItem("teamAPlayers", JSON.stringify(teamAPlayers));
    localStorage.setItem("teamBPlayers", JSON.stringify(teamBPlayers));

    displayPlayers();
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

    const battingFirst = decision === "bat"
        ? winner
        : winner === "A" ? "B" : "A";

    const tossDetails = {
        tossWinner: winner,
        tossDecision: decision,
        battingFirst: battingFirst
    };
    localStorage.setItem("matchFinished", "false");
    localStorage.setItem("tossDetails", JSON.stringify(tossDetails));
    localStorage.removeItem("firstInningsScore");

localStorage.setItem("currentInnings", JSON.stringify({
    number: 1,
    battingTeam: battingFirst
}));
    window.location.href = "live-scoring.html";
}

loadTossPage();

// LIVE SCORING

let liveMatch = JSON.parse(localStorage.getItem("matchDetails"));
let liveToss = JSON.parse(localStorage.getItem("tossDetails"));

let currentInnings = JSON.parse(
    localStorage.getItem("currentInnings")
) || {
    number: 1,
    battingTeam: liveToss ? liveToss.battingFirst : "A"
};

let firstInningsScore = JSON.parse(
    localStorage.getItem("firstInningsScore")
);
let matchFinished =
    localStorage.getItem("matchFinished") === "true";

let scoreState = JSON.parse(localStorage.getItem("liveScore")) || {
    runs: 0,
    wickets: 0,
    legalBalls: 0,
    history: [],
    battingStats: {},
    bowlingStats: {}
};

scoreState.battingStats = scoreState.battingStats || {};
scoreState.bowlingStats = scoreState.bowlingStats || {};
scoreState.history = scoreState.history || [];

function createBattingRecord() {
    return {
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        out: false,
        dismissal: "Not out"
    };
}

function createBowlingRecord() {
    return {
        legalBalls: 0,
        runs: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0
    };
}

function saveScore() {
    localStorage.setItem("liveScore", JSON.stringify(scoreState));
}
function startSecondInnings() {

    if (currentInnings.number === 2) {
        alert("Second innings has already started.");
        return;
    }

    // Save first innings details
    firstInningsScore = {
        battingTeam: currentInnings.battingTeam,
        runs: scoreState.runs,
        wickets: scoreState.wickets,
        legalBalls: scoreState.legalBalls,
        battingStats: JSON.parse(JSON.stringify(scoreState.battingStats)),
        bowlingStats: JSON.parse(JSON.stringify(scoreState.bowlingStats)),
        history: JSON.parse(JSON.stringify(scoreState.history))
    };

    localStorage.setItem(
        "firstInningsScore",
        JSON.stringify(firstInningsScore)
    );

    // Change batting team
    currentInnings = {
        number: 2,
        battingTeam: currentInnings.battingTeam === "A" ? "B" : "A"
    };

    localStorage.setItem(
        "currentInnings",
        JSON.stringify(currentInnings)
    );

    // Reset second innings score
    scoreState = {
        runs: 0,
        wickets: 0,
        legalBalls: 0,
        history: [],
        battingStats: {},
        bowlingStats: {}
    };
        matchFinished = false;
        localStorage.setItem("matchFinished", "false");
    saveScore();

    // Clear previous innings players
    localStorage.removeItem("openingPlayers");

    // Update batting team name
    const battingTeamName = currentInnings.battingTeam === "A"
        ? liveMatch.teamA
        : liveMatch.teamB;

    document.getElementById("battingTeamName").textContent =
        battingTeamName;

    // Load second innings players
    loadOpeningPlayerOptions();

const setupForm = document.getElementById("striker")
    .closest(".setup-form");

if (setupForm) {
    setupForm.style.display = "block";
}

document.getElementById("openingStatus").textContent =
    "Select your second innings players.";

updateScoreboard();
updateCurrentPlayersDisplay();

    alert(
        "Second innings started! Target: " +
        (firstInningsScore.runs + 1)
    );
}
function loadLiveScoring() {
    if (!liveMatch || !liveToss ||
        !document.getElementById("totalScore")) {
        return;
    }
const battingTeam = currentInnings.battingTeam === "A"
    ? liveMatch.teamA
    : liveMatch.teamB;

    document.getElementById("battingTeamName").textContent =
        battingTeam;

    document.getElementById("matchInfo").textContent =
        `${liveMatch.overs} overs match`;

    loadOpeningPlayerOptions();
    updateScoreboard();
}
function recordDelivery(runs, legalBall, description, wicket = false, strikeRuns = 0, details = {}) {
    const previousState = savePreviousState();
    let players = JSON.parse(localStorage.getItem("openingPlayers"));

    ensurePlayerRecords();

    const strikerAtDelivery = players ? players.striker : "";
    const bowlerAtDelivery = players ? players.bowler : "";

    const batterRuns = details.batterRuns !== undefined
        ? details.batterRuns : (legalBall ? runs : 0);

    const batterFacedBall = details.batterFacedBall !== undefined
        ? details.batterFacedBall : legalBall;

    const bowlerRuns = details.bowlerRuns !== undefined
        ? details.bowlerRuns : runs;

    const extraType = details.extraType || "";

    scoreState.runs += runs;

    if (wicket) scoreState.wickets++;

    if (strikerAtDelivery) {
        const batter = scoreState.battingStats[strikerAtDelivery] ||
            (scoreState.battingStats[strikerAtDelivery] = createBattingRecord());

        batter.runs += batterRuns;

        if (batterFacedBall) batter.balls++;
        if (batterRuns === 4) batter.fours++;
        if (batterRuns === 6) batter.sixes++;
    }

    if (bowlerAtDelivery) {
        const bowler = scoreState.bowlingStats[bowlerAtDelivery] ||
            (scoreState.bowlingStats[bowlerAtDelivery] = createBowlingRecord());

        bowler.runs += bowlerRuns;

        if (legalBall) bowler.legalBalls++;
        if (extraType === "wide") bowler.wides++;
        if (extraType === "noBall") bowler.noBalls++;
        if (wicket) bowler.wickets++;
    }

    if (wicket && details.dismissedBatter) {
        const dismissedRecord = scoreState.battingStats[details.dismissedBatter];

        if (dismissedRecord) {
            dismissedRecord.out = true;
            dismissedRecord.dismissal = details.dismissalText || "Out";
        }
    }

    if (players) {
        if (Math.abs(strikeRuns) % 2 === 1) {
            const temp = players.striker;
            players.striker = players.nonStriker;
            players.nonStriker = temp;
        }

        if (legalBall) {
            scoreState.legalBalls++;

            if (scoreState.legalBalls % 6 === 0) {
                players.lastOverBowler = players.bowler;

                const temp = players.striker;
                players.striker = players.nonStriker;
                players.nonStriker = temp;

                localStorage.setItem("openingPlayers", JSON.stringify(players));
if (
    legalBall &&
    scoreState.legalBalls % 6 === 0 &&
    scoreState.legalBalls < getMaximumBalls()
) {
    selectNextBowler();
    players = JSON.parse(localStorage.getItem("openingPlayers"));
}
                saveScore();
                updateCurrentPlayersDisplay();

                
            }
        }

        localStorage.setItem("openingPlayers", JSON.stringify(players));
    }

    scoreState.history.push({
        description,
        previousState
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

    checkInningsEnd();
}


// SUPER OVER DATA

let superOverState = JSON.parse(
    localStorage.getItem("superOverState")
) || {
    active: false,
    round: 0,
    innings: 0,
    firstBattingTeam: "",
    firstScore: 0,
    scores: [],
    winner: ""
};

function saveSuperOverState() {
    localStorage.setItem(
        "superOverState",
        JSON.stringify(superOverState)
    );
}

function getMaximumBalls() {
    return superOverState.active
        ? 6
        : Number(liveMatch.overs) * 6;
}

function getMaximumWickets() {
    return superOverState.active
        ? 2
        : Math.max(0, Number(liveMatch.players) - 1);
}

// CHECK INNINGS END

// CHECK INNINGS END

function checkInningsEnd() {

    const inningsOver =
        scoreState.legalBalls >= getMaximumBalls() ||
        scoreState.wickets >= getMaximumWickets();

    // SUPER OVER
    if (superOverState.active) {

        // Super Over first innings completed
        if (superOverState.innings === 1 && inningsOver) {

            superOverState.firstScore = scoreState.runs;
            superOverState.innings = 2;
            saveSuperOverState();

            prepareSuperOverInnings(
                superOverState.firstBattingTeam === "A" ? "B" : "A",
                2
            );

            return;
        }

        // Super Over second innings
        if (superOverState.innings === 2) {

            if (scoreState.runs > superOverState.firstScore) {
                finishSuperOver(currentInnings.battingTeam);
                return;
            }

            if (inningsOver) {

                if (scoreState.runs === superOverState.firstScore) {
                    superOverState.round++;
                    superOverState.innings = 1;
                    saveSuperOverState();

                    alert("SUPER OVER TIED! Starting another Super Over.");

                    prepareSuperOverInnings(
                        superOverState.firstBattingTeam,
                        1
                    );

                } else {
                    const winner =
                        currentInnings.battingTeam === "A" ? "B" : "A";

                    finishSuperOver(winner);
                }
            }
        }

        return;
    }

    // REGULAR MATCH - FIRST INNINGS
    if (currentInnings.number === 1 && inningsOver) {
        startSecondInnings();
        return;
    }

    // REGULAR MATCH - SECOND INNINGS
    if (currentInnings.number === 2) {

        const target = firstInningsScore.runs + 1;

        if (scoreState.runs >= target) {

            matchFinished = true;
            localStorage.setItem("matchFinished", "true");

            const winner = currentInnings.battingTeam === "A"
                ? liveMatch.teamA
                : liveMatch.teamB;

            alert("🏆 " + winner + " WON THE MATCH!");
            return;
        }

        if (inningsOver) {

            if (scoreState.runs === firstInningsScore.runs) {
                startSuperOverRound();
            } else {

                matchFinished = true;
                localStorage.setItem("matchFinished", "true");

                const winner = currentInnings.battingTeam === "A"
                    ? liveMatch.teamA
                    : liveMatch.teamB;

                alert("🏆 " + winner + " WON THE MATCH!");
            }
        }
    }
}


// START SUPER OVER
function startSuperOverRound() {

    superOverState.active = true;
    superOverState.round = 1;
    superOverState.innings = 1;

    // Team batting second in the regular match bats first
    superOverState.firstBattingTeam = currentInnings.battingTeam;
    superOverState.firstScore = 0;

    saveSuperOverState();

    alert("MATCH TIED! SUPER OVER STARTS!");

    prepareSuperOverInnings(superOverState.firstBattingTeam, 1);
}


// PREPARE SUPER OVER INNINGS
function prepareSuperOverInnings(battingTeam, inningsNumber) {

    currentInnings = {
        number: 3,
        battingTeam: battingTeam,
        phase: "superOver",
        superOverRound: superOverState.round,
        superOverInnings: inningsNumber
    };

    localStorage.setItem(
        "currentInnings",
        JSON.stringify(currentInnings)
    );

    scoreState = {
        runs: 0,
        wickets: 0,
        legalBalls: 0,
        history: [],
        battingStats: {},
        bowlingStats: {}
    };

    saveScore();

    matchFinished = false;
    localStorage.setItem("matchFinished", "false");

    localStorage.removeItem("openingPlayers");

    const battingTeamName = battingTeam === "A"
        ? liveMatch.teamA
        : liveMatch.teamB;

    const teamHeading = document.getElementById("battingTeamName");

    if (teamHeading) {
        teamHeading.textContent = battingTeamName;
    }

    const matchInfo = document.getElementById("matchInfo");

    if (matchInfo) {
        matchInfo.textContent =
            "Super Over " + superOverState.round + " - 6 balls, 2 wickets";
    }

    loadOpeningPlayerOptions();

    const setupForm = document.getElementById("striker");

    if (setupForm) {
        setupForm.closest(".setup-form").style.display = "block";
    }

    const openingStatus = document.getElementById("openingStatus");

    if (openingStatus) {
        openingStatus.textContent =
            "Select opening players for Super Over " +
            superOverState.round;
    }

    updateScoreboard();
    updateCurrentPlayersDisplay();

    alert(
        "Super Over " + superOverState.round +
        " - Innings " + inningsNumber +
        ". Select your players."
    );
}


// FINISH SUPER OVER
function finishSuperOver(winnerTeam) {

    const winner = winnerTeam === "A"
        ? liveMatch.teamA
        : liveMatch.teamB;

    superOverState.active = false;
    superOverState.winner = winnerTeam;

    saveSuperOverState();

    matchFinished = true;
    localStorage.setItem("matchFinished", "true");

    alert("🏆 " + winner + " WON THE MATCH!");
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
            additionalRuns,
            {
                batterRuns: 0,
                batterFacedBall: false,
                bowlerRuns: 1 + additionalRuns,
                extraType: "wide"
            }
        );checkInningsEnd();

    } else if (type === "noBall") {
        recordDelivery(
            1 + additionalRuns,
            false,
            `No Ball: ${1 + additionalRuns} run(s)`,
            false,
            additionalRuns,
            {
                batterRuns: additionalRuns,
                batterFacedBall: true,
                bowlerRuns: 1 + additionalRuns,
                extraType: "noBall"
            }
        );checkInningsEnd();

    } else if (type === "bye" || type === "legBye") {
        recordDelivery(
            additionalRuns,
            true,
            `${type}: ${additionalRuns} run(s)`,
            false,
            additionalRuns,
            {
                batterRuns: 0,
                batterFacedBall: true,
                bowlerRuns: 0,
                extraType: type
            }
        );checkInningsEnd();
    }
}

function addWicket() {
    if (!canContinueInnings()) return;

    const players = JSON.parse(localStorage.getItem("openingPlayers"));

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

    if (outChoice !== "1" && outChoice !== "2") return;

    const dismissed = outChoice === "1"
        ? players.striker
        : players.nonStriker;

const battingPlayers = currentInnings.battingTeam === "A"
    ? teamAPlayers
    : teamBPlayers;

  const maximumWickets = getMaximumWickets();

    const isLastWicket = scoreState.wickets + 1 >= maximumWickets;

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
            dismissed + " is OUT!\nSelect the incoming batter:\n\n" + options
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

    recordDelivery(0, true, dismissed + " OUT!", true, 0, {
        batterRuns: 0,
        batterFacedBall: true,
        bowlerRuns: 0,
        dismissedBatter: dismissed,
        dismissalText: "Out"
    });

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
}

checkInningsEnd();

if (!isLastWicket) {
    alert("New batter: " + newBatter);
}
}

function canContinueInnings() {

    if (matchFinished) {
        alert("The match is over. Scoring is locked.");
        return false;
    }

    const maximumBalls = getMaximumBalls();
    const maximumWickets = getMaximumWickets();

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

    if (!currentPlayers) {
        alert("Please confirm opening players first.");
        return false;
    }

    if (!currentPlayers.bowler) {
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

    scoreState.battingStats = previous.battingStats || {};
    scoreState.bowlingStats = previous.bowlingStats || {};

    if (previous.openingPlayers) {
        localStorage.setItem(
            "openingPlayers",
            JSON.stringify(previous.openingPlayers)
        );
    }

    saveScore();
    updateScoreboard();
    updateCurrentPlayersDisplay();
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
const targetInfo = document.getElementById("targetInfo");

if (targetInfo) {
    if (currentInnings.number === 2 && firstInningsScore) {
        const target = firstInningsScore.runs + 1;
        const runsNeeded = Math.max(0, target - scoreState.runs);
        const maximumBalls = Number(liveMatch.overs) * 6;
        const ballsRemaining = Math.max(
            0,
            maximumBalls - scoreState.legalBalls
        );

        targetInfo.style.display = "block";

        document.getElementById("targetDisplay").textContent =
            `Target: ${target}`;

        document.getElementById("runsNeeded").textContent =
            `Runs Needed: ${runsNeeded}`;

        document.getElementById("ballsRemaining").textContent =
            `Balls Remaining: ${ballsRemaining}`;
    } else {
        targetInfo.style.display = "none";
    }
}
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

function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    }[character]));
}

function formatOvers(balls) {
    return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function loadScorecard() {
    const match = JSON.parse(localStorage.getItem("matchDetails"));
    const current = JSON.parse(localStorage.getItem("currentInnings"));
    const first = JSON.parse(localStorage.getItem("firstInningsScore"));
    const live = JSON.parse(localStorage.getItem("liveScore"));
    const finished = localStorage.getItem("matchFinished") === "true";

    if (!match || !current || !live) return;

    const firstTeamCode = first
        ? first.battingTeam
        : current.battingTeam;

    const secondTeamCode = firstTeamCode === "A" ? "B" : "A";

    const firstTeam = firstTeamCode === "A"
        ? match.teamA : match.teamB;

    const secondTeam = secondTeamCode === "A"
        ? match.teamA : match.teamB;

    const firstScore = first || (
        current.number === 1 ? live : null
    );

    const secondScore = current.number === 2 ? live : null;

    document.getElementById("scorecardMatchInfo").textContent =
        `${match.teamA} vs ${match.teamB} | ${match.matchDate}`;

    function showOvers(balls) {
        return `${Math.floor(balls / 6)}.${balls % 6}`;
    }

    function renderInnings(prefix, teamName, score) {
        document.getElementById(prefix + "Total").textContent =
            score ? `${score.runs}/${score.wickets}` : "Not started";

        document.getElementById(prefix + "Overs").textContent =
            score ? `Overs: ${showOvers(score.legalBalls)}` : "";
const battingElement =
    document.getElementById(
        prefix === "firstInnings"
            ? "firstBattingSummary"
            : "secondBattingSummary"
    );

const bowlingElement =
    document.getElementById(
        prefix === "firstInnings"
            ? "firstBowlingSummary"
            : "secondBowlingSummary"
    );

        if (!score) {
            battingElement.innerHTML = "";
            bowlingElement.innerHTML = "";
            return;
        }

        const battingStats = score.battingStats || {};
        const bowlingStats = score.bowlingStats || {};

        let battingRows = "";

        for (const player in battingStats) {
            const p = battingStats[player];

            battingRows += `
                <tr>
                    <td>${escapeHTML(player)}</td>
                    <td>${p.runs}</td>
                    <td>${p.balls}</td>
                    <td>${p.fours}</td>
                    <td>${p.sixes}</td>
                    <td>${p.out ? escapeHTML(p.dismissal || "Out") : "Not out"}</td>
                </tr>
            `;
        }

        battingElement.innerHTML = `
            <h3>${escapeHTML(teamName)} - Batting</h3>
            <table>
                <tr>
                    <th>Batter</th>
                    <th>R</th>
                    <th>B</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>Status</th>
                </tr>
                ${battingRows || "<tr><td colspan='6'>No batting data</td></tr>"}
            </table>
        `;

        let bowlingRows = "";

        for (const player in bowlingStats) {
            const p = bowlingStats[player];

            bowlingRows += `
                <tr>
                    <td>${escapeHTML(player)}</td>
                    <td>${showOvers(p.legalBalls)}</td>
                    <td>${p.runs}</td>
                    <td>${p.wickets}</td>
                    <td>${p.wides}</td>
                    <td>${p.noBalls}</td>
                </tr>
            `;
        }

        bowlingElement.innerHTML = `
            <h3>${escapeHTML(teamName)} - Bowling</h3>
            <table>
                <tr>
                    <th>Bowler</th>
                    <th>O</th>
                    <th>R</th>
                    <th>W</th>
                    <th>Wd</th>
                    <th>NB</th>
                </tr>
                ${bowlingRows || "<tr><td colspan='6'>No bowling data</td></tr>"}
            </table>
        `;
    }

    renderInnings("firstInnings", firstTeam, firstScore);
    renderInnings("secondInnings", secondTeam, secondScore);

    const targetElement = document.getElementById("scorecardTarget");

    if (first) {
        targetElement.textContent = `Target: ${first.runs + 1}`;
    } else {
        targetElement.textContent = "";
    }

    const resultElement = document.getElementById("matchResult");

    if (finished && first && secondScore) {
        if (secondScore.runs > first.runs) {
            resultElement.textContent =
                `${secondTeam} won by ${Math.max(0, Number(match.players) - 1 - secondScore.wickets)} wickets!`;
        } else if (secondScore.runs === first.runs) {
            resultElement.textContent = "Match Tied!";
        } else {
            resultElement.textContent =
                `${firstTeam} won by ${first.runs - secondScore.runs} runs!`;
        }
    } else if (secondScore) {
        resultElement.textContent = "Second innings in progress";
    } else if (first) {
        resultElement.textContent = "First innings completed";
    } else {
        resultElement.textContent = "First innings in progress";
    }
}

// HELPER FUNCTIONS

function ensurePlayerRecords() {
   const battingPlayers = currentInnings.battingTeam === "A"
    ? teamAPlayers
    : teamBPlayers;

const bowlingPlayers = currentInnings.battingTeam === "A"
    ? teamBPlayers
    : teamAPlayers;

    battingPlayers.forEach(player => {
        if (!scoreState.battingStats[player]) {
            scoreState.battingStats[player] = createBattingRecord();
        }
    });

    bowlingPlayers.forEach(player => {
        if (!scoreState.bowlingStats[player]) {
            scoreState.bowlingStats[player] = createBowlingRecord();
        }
    });
}

function savePreviousState() {
    return {
        runs: scoreState.runs,
        wickets: scoreState.wickets,
        legalBalls: scoreState.legalBalls,
        battingStats: JSON.parse(JSON.stringify(scoreState.battingStats)),
        bowlingStats: JSON.parse(JSON.stringify(scoreState.bowlingStats)),
        openingPlayers: JSON.parse(
            localStorage.getItem("openingPlayers")
        )
    };
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

    const searchInput = document.getElementById("matchSearch");
    const search = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

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
const battingTeam = currentInnings.battingTeam;

const battingPlayers = battingTeam === "A"
    ? teamAPlayers
    : teamBPlayers;

const bowlingPlayers = battingTeam === "A"
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

    ensurePlayerRecords();
    saveScore();

    updateCurrentPlayersDisplay();

    const setupForm = document.getElementById("striker")
        .closest(".setup-form");

    if (setupForm) setupForm.style.display = "none";

    document.getElementById("openingStatus").textContent =
        "Opening players confirmed!";

    alert("Opening players selected successfully!");
}

function updateCurrentPlayersDisplay() {
    const players = JSON.parse(
        localStorage.getItem("openingPlayers")
    );

    if (!players) return;

    const striker = document.getElementById("currentStriker");
    const nonStriker = document.getElementById("currentNonStriker");
    const bowler = document.getElementById("currentBowler");

    if (striker) striker.textContent = players.striker || "Not selected";
    if (nonStriker) nonStriker.textContent = players.nonStriker || "Not selected";
    if (bowler) bowler.textContent = players.bowler || "Not selected";
}

function selectNextBowler() {
    const players = JSON.parse(
        localStorage.getItem("openingPlayers")
    );

    if (!players) return;

   const bowlingPlayers = currentInnings.battingTeam === "A"
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

// LOAD SCORECARD WHEN SCORECARD PAGE OPENS
window.addEventListener("load", function () {

    if (document.getElementById("scorecardMatchInfo")) {

        loadScorecard();

        setInterval(function () {
            loadScorecard();
        }, 1000);

    }

});