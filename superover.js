
// BOUNDARY - SUPER OVER

let superOverState = {
    round: 1,
    innings: 1,

    teamA: "",
    teamB: "",

    battingTeam: "",
    bowlingTeam: "",

    score: 0,
    wickets: 0,
    balls: 0,

    target: 0,
    firstInningsScore: null,

    striker: "",
    nonStriker: "",
    bowler: "",

    dismissedPlayers: [],

    playersConfirmed: false,
    awaitingReplacement: false,
    finished: false,

    battingStats: {},
    bowlingStats: {},
    extras: 0,

    completedInnings: [],
    inningsSaved: false,
    winner: ""
};


// SAVE STATE

function saveSuperOverState() {
    localStorage.setItem(
        "superOverState",
        JSON.stringify(superOverState)
    );
}


// TEAM NAME

function getTeamName(team) {
    return team === "A"
        ? superOverState.teamA
        : superOverState.teamB;
}


// PLAYER NAME SUPPORT

function getPlayerName(player) {
    if (typeof player === "string") return player;
    return player && player.name ? player.name : "";
}


// INITIALIZE

function initializeSuperOver() {

    const match = JSON.parse(localStorage.getItem("matchDetails"));
    const toss = JSON.parse(localStorage.getItem("tossDetails"));

    if (!match || !toss) {
        alert("Match details not found!");

        document.getElementById("matchMessage").textContent =
            "Match details not found. Please return to the home page.";

        return;
    }

    superOverState.teamA = match.teamA;
    superOverState.teamB = match.teamB;

    // Team batting second in regular match bats first
    superOverState.battingTeam =
        toss.battingFirst === "A" ? "B" : "A";

    superOverState.bowlingTeam = toss.battingFirst;

    saveSuperOverState();
    updateSuperOverDisplay();
    loadSuperOverPlayerOptions();
    renderScorecard();
}


// PLAYER LISTS

function getBattingPlayers() {

    const teamAPlayers =
        JSON.parse(localStorage.getItem("teamAPlayers")) || [];

    const teamBPlayers =
        JSON.parse(localStorage.getItem("teamBPlayers")) || [];

    return (superOverState.battingTeam === "A"
        ? teamAPlayers
        : teamBPlayers).map(getPlayerName).filter(Boolean);
}


function getBowlingPlayers() {

    const teamAPlayers =
        JSON.parse(localStorage.getItem("teamAPlayers")) || [];

    const teamBPlayers =
        JSON.parse(localStorage.getItem("teamBPlayers")) || [];

    return (superOverState.bowlingTeam === "A"
        ? teamAPlayers
        : teamBPlayers).map(getPlayerName).filter(Boolean);
}


// FILL DROPDOWNS

function fillDropdown(id, players, excludedPlayers = []) {

    const dropdown = document.getElementById(id);
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select Player</option>';

    players.forEach(player => {

        if (excludedPlayers.includes(player)) return;

        const option = document.createElement("option");
        option.value = player;
        option.textContent = player;

        dropdown.appendChild(option);
    });
}


function loadSuperOverPlayerOptions() {

    const unavailable = superOverState.dismissedPlayers || [];

    fillDropdown("superStriker", getBattingPlayers(), unavailable);
    fillDropdown("superNonStriker", getBattingPlayers(), unavailable);
    fillDropdown("superBowler", getBowlingPlayers());
}


// INITIALIZE PLAYER STATISTICS

function createBatterStats(player) {

    if (!superOverState.battingStats[player]) {
        superOverState.battingStats[player] = {
            runs: 0,
            balls: 0,
            out: false
        };
    }
}


function createBowlerStats(player) {

    if (!superOverState.bowlingStats[player]) {
        superOverState.bowlingStats[player] = {
            runs: 0,
            wickets: 0
        };
    }
}


// CONFIRM PLAYERS

function confirmSuperOverPlayers() {

    if (superOverState.finished) return;

    const striker = document.getElementById("superStriker").value;
    const nonStriker = document.getElementById("superNonStriker").value;
    const bowler = document.getElementById("superBowler").value;

    if (!striker || !nonStriker || !bowler) {
        alert("Please select all three players!");
        return;
    }

    if (striker === nonStriker) {
        alert("Striker and Non-Striker must be different!");
        return;
    }

    superOverState.striker = striker;
    superOverState.nonStriker = nonStriker;
    superOverState.bowler = bowler;

    superOverState.playersConfirmed = true;

    createBatterStats(striker);
    createBatterStats(nonStriker);
    createBowlerStats(bowler);

    saveSuperOverState();

    document.getElementById("playerSelection").style.display = "none";
    document.getElementById("superScoring").style.display = "block";

    document.getElementById("matchMessage").textContent =
        "Players confirmed! Match is ready.";

    updateSuperOverDisplay();
    renderScorecard();
}


// CHECK SCORING

function canContinueSuperOver() {

    if (superOverState.finished) return false;

    if (!superOverState.playersConfirmed) {
        alert("Please confirm players first!");
        return false;
    }

    if (superOverState.awaitingReplacement) {
        alert("Please select a replacement batter first!");
        return false;
    }

    if (superOverState.balls >= 6 || superOverState.wickets >= 2) {
        return false;
    }

    return true;
}


// CHANGE STRIKE

function changeSuperOverStrike() {

    const temp = superOverState.striker;
    superOverState.striker = superOverState.nonStriker;
    superOverState.nonStriker = temp;
}


// UPDATE SCORE DISPLAY

function updateSuperOverDisplay() {

    document.getElementById("superOverTitle").textContent =
        "Super Over " + superOverState.round;

    document.getElementById("battingTeam").textContent =
        getTeamName(superOverState.battingTeam);

    document.getElementById("score").textContent =
        superOverState.score + "/" + superOverState.wickets;

    document.getElementById("overs").textContent =
        Math.floor(superOverState.balls / 6) + "." +
        (superOverState.balls % 6) + " Overs";

    if (superOverState.innings === 2) {

        document.getElementById("target").textContent =
            "Target: " + superOverState.target;

        document.getElementById("runsNeeded").textContent =
            "Runs Needed: " +
            Math.max(0, superOverState.target - superOverState.score);

        document.getElementById("ballsRemaining").textContent =
            "Balls Remaining: " +
            Math.max(0, 6 - superOverState.balls);

    } else {

        document.getElementById("target").textContent = "";
        document.getElementById("runsNeeded").textContent = "";
        document.getElementById("ballsRemaining").textContent = "";
    }

    updateCurrentPlayers();
}


// CURRENT BATTER AND BOWLER DISPLAY

function updateCurrentPlayers() {

    const strikerStats =
        superOverState.battingStats[superOverState.striker] ||
        { runs: 0, balls: 0 };

    const nonStrikerStats =
        superOverState.battingStats[superOverState.nonStriker] ||
        { runs: 0, balls: 0 };

    const bowlerStats =
        superOverState.bowlingStats[superOverState.bowler] ||
        { runs: 0, wickets: 0 };

    document.getElementById("strikerName").textContent =
        superOverState.striker || "-";

    document.getElementById("strikerFigures").textContent =
        strikerStats.runs + " (" + strikerStats.balls + ")";

    document.getElementById("nonStrikerName").textContent =
        superOverState.nonStriker || "-";

    document.getElementById("nonStrikerFigures").textContent =
        nonStrikerStats.runs + " (" + nonStrikerStats.balls + ")";

    document.getElementById("bowlerName").textContent =
        superOverState.bowler || "-";

    document.getElementById("bowlerFigures").textContent =
        Math.floor(superOverState.balls / 6) + "." +
        (superOverState.balls % 6) +
        " overs | " + bowlerStats.runs +
        " runs | " + bowlerStats.wickets + " wickets";
}


// RENDER SCORECARD

function renderScorecard() {

    const battingBody =
        document.getElementById("battingScorecardBody");

    const bowlingBody =
        document.getElementById("bowlingScorecardBody");

    if (!battingBody || !bowlingBody) return;

    const battingEntries =
        Object.entries(superOverState.battingStats || {});

    if (battingEntries.length === 0) {

        battingBody.innerHTML =
            '<tr><td colspan="3">No batting data yet</td></tr>';

    } else {

        battingBody.innerHTML = battingEntries.map(([name, stats]) => {

            let status = stats.out ? " (out)" : "";

            if (
                name === superOverState.striker ||
                name === superOverState.nonStriker
            ) {
                status = " *";
            }

            return `
                <tr>
                    <td>${escapeHTML(name)}${status}</td>
                    <td>${stats.runs}</td>
                    <td>${stats.balls}</td>
                </tr>
            `;
        }).join("");
    }

    const bowlingEntries =
        Object.entries(superOverState.bowlingStats || {});

    if (bowlingEntries.length === 0) {

        bowlingBody.innerHTML =
            '<tr><td colspan="4">No bowling data yet</td></tr>';

    } else {

        bowlingBody.innerHTML = bowlingEntries.map(([name, stats]) => {

            return `
                <tr>
                    <td>${escapeHTML(name)}</td>
                    <td>${Math.floor(superOverState.balls / 6)}.${superOverState.balls % 6}</td>
                    <td>${stats.runs}</td>
                    <td>${stats.wickets}</td>
                </tr>
            `;
        }).join("");
    }
}


// SAFE HTML TEXT

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}


// RECORD NORMAL RUNS

function recordSuperOverRun(runs) {

    if (!canContinueSuperOver()) return;

    createBatterStats(superOverState.striker);
    createBowlerStats(superOverState.bowler);

    superOverState.score += runs;

    superOverState.battingStats[superOverState.striker].runs += runs;
    superOverState.battingStats[superOverState.striker].balls++;

    superOverState.bowlingStats[superOverState.bowler].runs += runs;

    if (runs % 2 !== 0) {
        changeSuperOverStrike();
    }

    superOverState.balls++;

    if (superOverState.balls % 6 === 0) {
        changeSuperOverStrike();
    }

    afterSuperOverDelivery();
}


// RECORD EXTRAS - WIDE

function recordSuperOverExtra(type) {

    if (!canContinueSuperOver()) return;

    createBowlerStats(superOverState.bowler);

    if (type === "wide") {

        superOverState.score++;
        superOverState.extras++;

        superOverState.bowlingStats[superOverState.bowler].runs++;

        afterSuperOverDelivery();
    }
}


// SHOW NO BALL OPTIONS

function showNoBallOptions() {

    if (!canContinueSuperOver()) return;

    const scoring = document.getElementById("superScoring");

    const runButtons = scoring.querySelector(".run-buttons");
    const extraButtons = scoring.querySelector(".extra-buttons");

    if (runButtons) runButtons.style.display = "none";
    if (extraButtons) extraButtons.style.display = "none";

    let panel = document.getElementById("noBallPanel");

    if (!panel) {

        panel = document.createElement("div");
        panel.id = "noBallPanel";

        panel.innerHTML = `
            <h3>No Ball - Select Batter Runs</h3>
            <p>Mandatory extra: 1 run</p>

            <div class="run-buttons">
                <button onclick="recordNoBallRuns(0)">0</button>
                <button onclick="recordNoBallRuns(1)">1</button>
                <button onclick="recordNoBallRuns(2)">2</button>
                <button onclick="recordNoBallRuns(3)">3</button>
                <button onclick="recordNoBallRuns(4)">4</button>
                <button onclick="recordNoBallRuns(6)">6</button>
            </div>

            <button onclick="cancelNoBall()">Cancel</button>
        `;

        scoring.appendChild(panel);
    }

    panel.style.display = "block";
}


// RECORD NO BALL RUNS

function recordNoBallRuns(runs) {

    if (!canContinueSuperOver()) return;

    const batter = superOverState.striker;
    const bowler = superOverState.bowler;

    createBatterStats(batter);
    createBowlerStats(bowler);

    // Mandatory one-run no-ball extra
    superOverState.score += 1;
    superOverState.extras += 1;

    // Additional runs scored by batter
    superOverState.score += runs;
    superOverState.battingStats[batter].runs += runs;

    // Batter faces the delivery, but it is not a legal ball
    superOverState.battingStats[batter].balls++;

    // Bowler is charged with penalty + batter runs
    superOverState.bowlingStats[bowler].runs += 1 + runs;

    // Change strike only for odd batter runs
    if (runs % 2 !== 0) {
        changeSuperOverStrike();
    }

    const panel = document.getElementById("noBallPanel");
    if (panel) panel.style.display = "none";

    const runButtons =
        document.querySelector("#superScoring > .run-buttons");

    const extraButtons =
        document.querySelector("#superScoring > .extra-buttons");

    if (runButtons) runButtons.style.display = "grid";
    if (extraButtons) extraButtons.style.display = "flex";

    afterSuperOverDelivery();
}


// CANCEL NO BALL

function cancelNoBall() {

    const panel = document.getElementById("noBallPanel");

    if (panel) panel.style.display = "none";

    const runButtons =
        document.querySelector("#superScoring > .run-buttons");

    const extraButtons =
        document.querySelector("#superScoring > .extra-buttons");

    if (runButtons) runButtons.style.display = "grid";
    if (extraButtons) extraButtons.style.display = "flex";
}


// RECORD WICKET

function recordSuperOverWicket() {

    if (!canContinueSuperOver()) return;

    createBatterStats(superOverState.striker);
    createBowlerStats(superOverState.bowler);

    superOverState.wickets++;
    superOverState.balls++;

    superOverState.battingStats[superOverState.striker].balls++;
    superOverState.battingStats[superOverState.striker].out = true;

    superOverState.bowlingStats[superOverState.bowler].wickets++;

    superOverState.dismissedPlayers.push(superOverState.striker);
    superOverState.striker = "";

    superOverState.awaitingReplacement = true;

    afterSuperOverDelivery();
}


// AFTER DELIVERY

function afterSuperOverDelivery() {

    updateSuperOverDisplay();
    renderScorecard();
    saveSuperOverState();

    checkSuperOverEnd();

    if (
        !superOverState.finished &&
        superOverState.awaitingReplacement &&
        superOverState.wickets < 2
    ) {
        showReplacementBatter();
    }
}


// SHOW REPLACEMENT BATTER

function showReplacementBatter() {

    const scoring = document.getElementById("superScoring");
    scoring.style.display = "block";

    const runButtons = scoring.querySelector(".run-buttons");
    const extraButtons = scoring.querySelector(".extra-buttons");

    if (runButtons) runButtons.style.display = "none";
    if (extraButtons) extraButtons.style.display = "none";

    const noBallPanel = document.getElementById("noBallPanel");
    if (noBallPanel) noBallPanel.style.display = "none";

    let panel = document.getElementById("replacementPanel");

    if (!panel) {

        panel = document.createElement("div");
        panel.id = "replacementPanel";

        panel.innerHTML = `
            <h3>Wicket! Select Replacement Batter</h3>

            <select id="replacementBatter">
                <option value="">Select New Batter</option>
            </select>

            <br><br>

            <button onclick="confirmReplacementBatter()">
                Confirm Replacement
            </button>
        `;

        scoring.appendChild(panel);
    }

    const dropdown = document.getElementById("replacementBatter");

    dropdown.innerHTML =
        '<option value="">Select New Batter</option>';

    const unavailable = [
        ...superOverState.dismissedPlayers,
        superOverState.nonStriker
    ];

    getBattingPlayers().forEach(player => {

        if (unavailable.includes(player)) return;

        const option = document.createElement("option");
        option.value = player;
        option.textContent = player;

        dropdown.appendChild(option);
    });

    document.getElementById("matchMessage").textContent =
        "Select a replacement batter to continue.";

    saveSuperOverState();
}


// CONFIRM REPLACEMENT

function confirmReplacementBatter() {

    const newBatter =
        document.getElementById("replacementBatter").value;

    if (!newBatter) {
        alert("Please select a replacement batter!");
        return;
    }

    if (
        superOverState.dismissedPlayers.includes(newBatter) ||
        newBatter === superOverState.nonStriker
    ) {
        alert("This player cannot bat!");
        return;
    }

    superOverState.striker = newBatter;
    superOverState.awaitingReplacement = false;

    createBatterStats(newBatter);

    const scoring = document.getElementById("superScoring");

    const runButtons = scoring.querySelector(".run-buttons");
    const extraButtons = scoring.querySelector(".extra-buttons");

    if (runButtons) runButtons.style.display = "grid";
    if (extraButtons) extraButtons.style.display = "flex";

    const panel = document.getElementById("replacementPanel");
    if (panel) panel.remove();

    document.getElementById("matchMessage").textContent =
        "Replacement confirmed! Continue scoring.";

    updateSuperOverDisplay();
    renderScorecard();
    saveSuperOverState();
}


// SAVE COMPLETED INNINGS

function saveCompletedInnings() {

    if (superOverState.inningsSaved) return;

    superOverState.completedInnings.push({
        round: superOverState.round,
        innings: superOverState.innings,
        team: getTeamName(superOverState.battingTeam),
        score: superOverState.score,
        wickets: superOverState.wickets,
        balls: superOverState.balls,
        extras: superOverState.extras,
        battingStats: JSON.parse(JSON.stringify(superOverState.battingStats)),
        bowlingStats: JSON.parse(JSON.stringify(superOverState.bowlingStats))
    });

    superOverState.inningsSaved = true;

    saveSuperOverState();
}


// CHECK INNINGS END

function checkSuperOverEnd() {

    if (superOverState.innings === 2) {

        if (superOverState.score >= superOverState.target) {

            saveCompletedInnings();
            finishSuperOver(superOverState.battingTeam);
            return;
        }
    }

    const inningsOver =
        superOverState.balls >= 6 ||
        superOverState.wickets >= 2;

    if (!inningsOver) return;

    saveCompletedInnings();

    if (superOverState.innings === 1) {

        startSecondSuperOverInnings();

    } else {

        if (superOverState.score > superOverState.firstInningsScore) {

            finishSuperOver(superOverState.battingTeam);

        } else if (superOverState.score < superOverState.firstInningsScore) {

            finishSuperOver(superOverState.bowlingTeam);

        } else {

            startNextSuperOver();
        }
    }
}


// START SECOND INNINGS

function startSecondSuperOverInnings() {

    superOverState.firstInningsScore = superOverState.score;
    superOverState.target = superOverState.firstInningsScore + 1;

    superOverState.innings = 2;

    const previousBattingTeam = superOverState.battingTeam;

    superOverState.battingTeam = superOverState.bowlingTeam;
    superOverState.bowlingTeam = previousBattingTeam;

    resetSuperOverInnings();

    document.getElementById("matchMessage").textContent =
        "First innings completed! Select second innings players.";

    updateSuperOverDisplay();
    loadSuperOverPlayerOptions();
    renderScorecard();
    saveSuperOverState();
}


// RESET INNINGS

function resetSuperOverInnings() {

    superOverState.score = 0;
    superOverState.wickets = 0;
    superOverState.balls = 0;

    superOverState.striker = "";
    superOverState.nonStriker = "";
    superOverState.bowler = "";

    superOverState.dismissedPlayers = [];

    superOverState.playersConfirmed = false;
    superOverState.awaitingReplacement = false;

    superOverState.battingStats = {};
    superOverState.bowlingStats = {};
    superOverState.extras = 0;
    superOverState.inningsSaved = false;

    document.getElementById("playerSelection").style.display = "block";
    document.getElementById("superScoring").style.display = "none";

    document.getElementById("superStriker").value = "";
    document.getElementById("superNonStriker").value = "";
    document.getElementById("superBowler").value = "";

    const panel = document.getElementById("replacementPanel");
    if (panel) panel.remove();

    const noBallPanel = document.getElementById("noBallPanel");
    if (noBallPanel) noBallPanel.remove();

    const runButtons = document.querySelector(".run-buttons");
    const extraButtons = document.querySelector(".extra-buttons");

    if (runButtons) runButtons.style.display = "grid";
    if (extraButtons) extraButtons.style.display = "flex";
}


// START ANOTHER SUPER OVER

function startNextSuperOver() {

    // Previous second-innings team bats first again
    const nextBattingTeam = superOverState.battingTeam;

    superOverState.round++;
    superOverState.innings = 1;

    superOverState.battingTeam = nextBattingTeam;

    superOverState.bowlingTeam =
        nextBattingTeam === "A" ? "B" : "A";

    superOverState.firstInningsScore = null;
    superOverState.target = 0;

    resetSuperOverInnings();

    document.getElementById("matchMessage").textContent =
        "Super Over tied! Super Over " +
        superOverState.round + " begins.";

    updateSuperOverDisplay();
    loadSuperOverPlayerOptions();
    renderScorecard();
    saveSuperOverState();
}


// FINISH SUPER OVER

function finishSuperOver(winningTeam) {

    superOverState.finished = true;
    superOverState.awaitingReplacement = false;
    superOverState.winner = winningTeam;

    saveSuperOverState();

    document.getElementById("playerSelection").style.display = "none";
    document.getElementById("superScoring").style.display = "none";

    document.getElementById("matchMessage").textContent =
        getTeamName(winningTeam) + " WON THE MATCH!";

    document.getElementById("matchMessage").style.color = "#4caf50";

    showFinalSummary();
}


// FINAL SUMMARY

function showFinalSummary() {

    const summary = document.getElementById("finalSummary");
    const inningsContainer = document.getElementById("completedInnings");

    summary.style.display = "block";

    document.getElementById("finalWinner").textContent =
        "🏆 " + getTeamName(superOverState.winner) + " WON!";

    document.getElementById("finalRound").textContent =
        "Match decided in Super Over " + superOverState.round;

    inningsContainer.innerHTML = "";

    superOverState.completedInnings.forEach(innings => {

        const card = document.createElement("div");
        card.className = "summary-innings";

        const overs =
            Math.floor(innings.balls / 6) + "." +
            (innings.balls % 6);

        card.innerHTML = `
            <h4>Super Over ${innings.round} - Innings ${innings.innings}</h4>
            <p><strong>${escapeHTML(innings.team)}</strong></p>
            <p>Score: <strong>${innings.score}/${innings.wickets}</strong></p>
            <p>Overs: ${overs} | Extras: ${innings.extras}</p>
        `;

        inningsContainer.appendChild(card);
    });

    document.getElementById("homeButton").style.display = "block";
}


// BACK TO HOME

function goToHome() {
    window.location.href = "homepage.html";
}


// PAGE LOAD

window.addEventListener("load", function () {

    const saved = localStorage.getItem("superOverState");

    if (!saved) {
        initializeSuperOver();
        return;
    }

    superOverState = JSON.parse(saved);

    // Defaults for older saved states
    if (!superOverState.dismissedPlayers) {
        superOverState.dismissedPlayers = [];
    }

    if (!superOverState.battingStats) {
        superOverState.battingStats = {};
    }

    if (!superOverState.bowlingStats) {
        superOverState.bowlingStats = {};
    }

    if (!superOverState.completedInnings) {
        superOverState.completedInnings = [];
    }

    if (superOverState.extras === undefined) {
        superOverState.extras = 0;
    }

    if (superOverState.inningsSaved === undefined) {
        superOverState.inningsSaved = false;
    }

    updateSuperOverDisplay();
    renderScorecard();

    if (superOverState.finished) {

        document.getElementById("playerSelection").style.display = "none";
        document.getElementById("superScoring").style.display = "none";

        document.getElementById("matchMessage").textContent =
            "Super Over completed.";

        showFinalSummary();

    } else if (superOverState.awaitingReplacement) {

        document.getElementById("playerSelection").style.display = "none";
        showReplacementBatter();

    } else if (superOverState.playersConfirmed) {

        document.getElementById("playerSelection").style.display = "none";
        document.getElementById("superScoring").style.display = "block";

    } else {

        document.getElementById("playerSelection").style.display = "block";
        document.getElementById("superScoring").style.display = "none";

        loadSuperOverPlayerOptions();
    }

});
