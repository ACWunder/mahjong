document.addEventListener("DOMContentLoaded", () => {
    const playerHeaders = document.getElementById("playerHeaders");
    const resultsBody = document.getElementById("summaryBody");
    const playerInputs = document.querySelectorAll("#playerInputs input[type=text]");
    const playerCheckboxes = document.querySelectorAll("#playerInputs input[type=checkbox]");
    const playerCountSelect = document.getElementById("playerCount");
    const leftSection = document.getElementById("leftSection");

    const playerScores = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
    };

    let activePlayers = [];
    let roundCount = 0;
    let windRotation = ["Ost", "Süd", "West", "Nord"];
    let ostwindStaysCount = 0; // Zähler für Ostwind-Runden

    // Funktion zur Aktualisierung der aktiven Spieler basierend auf der Anzahl
    const updateActivePlayers = () => {
        const playerCount = parseInt(playerCountSelect.value, 10);
        activePlayers = [];

        playerInputs.forEach((input, index) => {
            const checkbox = playerCheckboxes[index];
            if (index < playerCount) {
                checkbox.checked = true;
                checkbox.disabled = false;
                input.disabled = false;
                activePlayers.push({ name: input.value || `Spieler ${index + 1}`, index, wind: windRotation[index] });
            } else {
                checkbox.checked = false;
                checkbox.disabled = true;
                input.disabled = true;
            }
        });

        updatePlayerHeaders();
        updateRightTable();
    };

    // Spielerüberschrift aktualisieren
    const updatePlayerHeaders = () => {
        playerHeaders.innerHTML = "<th>Runde</th>";

        activePlayers.forEach(player => {
            const th = document.createElement("th");
            th.textContent = player.name;
            playerHeaders.appendChild(th);
        });
    };

    // Aktualisiere die rechte Tabelle
    const updateRightTable = () => {
        const rightTableBody = document.querySelector("#rightSection table tbody");
        const rightTableHead = document.querySelector("#rightSection table thead");

        rightTableHead.innerHTML = 
            `<tr>
                <th>Spieler</th>
                <th>Punkte</th>
                <th>Wind</th>
            </tr>`;

        rightTableBody.innerHTML = "";

        activePlayers.forEach(player => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = player.name;
            row.appendChild(nameCell);

            const scoreCell = document.createElement("td");
            const scoreInput = document.createElement("input");
            scoreInput.type = "number";
            scoreInput.id = `score${player.index + 1}`;
            scoreInput.value = 0;
            scoreCell.appendChild(scoreInput);
            row.appendChild(scoreCell);

            const windCell = document.createElement("td");
            windCell.textContent = player.wind;
            row.appendChild(windCell);

            rightTableBody.appendChild(row);
        });

        updateMahjongDropdown();
    };

    const updateMahjongDropdown = () => {
        const mahjongDropdown = document.getElementById("mahjongPlayer");
        mahjongDropdown.innerHTML = "";

        activePlayers.forEach(player => {
            const option = document.createElement("option");
            option.value = player.name;
            option.textContent = player.name;
            mahjongDropdown.appendChild(option);
        });
    };

    const calculateScores = () => {
        const mahjongCaller = document.getElementById("mahjongPlayer").value; // Mahjong-Rufer

        // Punkte und Winde der aktiven Spieler sammeln
        const scores = activePlayers.map(player => ({
            score: parseInt(document.getElementById(`score${player.index + 1}`).value) || 0,
            wind: player.wind,
            mahjong: player.name === mahjongCaller,
            index: player.index // Originalindex des Spielers
        }));

        console.log("Initial Scores:", scores);

        // Regel 1: Mahjong-Rufer Abrechnung
        const mahjongPlayer = scores.find(player => player.mahjong);
        if (mahjongPlayer) {
            const mahjongPoints = mahjongPlayer.score;

            scores.forEach(player => {
                if (player.index !== mahjongPlayer.index) {
                    if (mahjongPlayer.wind === "Ost") {
                        playerScores[player.index + 1] -= 2 * mahjongPoints;
                        playerScores[mahjongPlayer.index + 1] += 2 * mahjongPoints;
                    } else {
                        if (player.wind === "Ost") {
                            playerScores[player.index + 1] -= 2 * mahjongPoints;
                            playerScores[mahjongPlayer.index + 1] += 2 * mahjongPoints;
                        } else {
                            playerScores[player.index + 1] -= mahjongPoints;
                            playerScores[mahjongPlayer.index + 1] += mahjongPoints;
                        }
                    }
                }
            });

            // Prüfen, ob der Ostwind Mah-Jongg gerufen hat
            if (mahjongPlayer.wind === "Ost") {
                ostwindStaysCount++;
                if (ostwindStaysCount >= 3) {
                    console.log("Ostwind hat 3 Runden behalten. Rotation wird erzwungen.");
                    rotateWinds();
                    ostwindStaysCount = 0;
                } else {
                    console.log("Ostwind bleibt für die nächste Runde.");
                    updateScoreTable(); // Tabelle aktualisieren
                    resetScores(); // Eingabefelder zurücksetzen
                    return;
                }
            } else {
                ostwindStaysCount = 0;
            }
        } else {
            console.error("Kein Mahjong-Rufer gefunden.");
        }

        console.log("Scores After Mahjong Calculation:", playerScores);

        // Regel 2: Verrechnung der übrigen Spieler
        const nonMahjongPlayers = scores.filter(player => !player.mahjong);

        if (nonMahjongPlayers.length > 1) {
            const sortedScores = nonMahjongPlayers.sort((a, b) => b.score - a.score);

            sortedScores.forEach((current, index) => {
                for (let i = index + 1; i < sortedScores.length; i++) {
                    const other = sortedScores[i];
                    const diff = current.score - other.score;

                    if (current.wind === "Ost") {
                        playerScores[current.index + 1] += 2 * diff;
                        playerScores[other.index + 1] -= 2 * diff;
                    } else if (other.wind === "Ost") {
                        playerScores[current.index + 1] -= 2 * diff;
                        playerScores[other.index + 1] += 2 * diff;
                    } else {
                        playerScores[current.index + 1] += diff;
                        playerScores[other.index + 1] -= diff;
                    }
                }
            });
        }

        console.log("Final Scores:", playerScores);

        // Tabelle aktualisieren
        updateScoreTable();
        resetScores(); // Eingabefelder zurücksetzen
        rotateWinds(); // Winde nach der Berechnung rotieren
    };

    const resetScores = () => {
        activePlayers.forEach(player => {
            const scoreInput = document.getElementById(`score${player.index + 1}`);
            if (scoreInput) {
                scoreInput.value = ""; // Leer lassen für bessere Übersicht
            }
        });
    };

    const rotateWinds = () => {
        // Rotiert die Winde der aktiven Spieler im Uhrzeigersinn
        const lastWind = activePlayers[activePlayers.length - 1].wind;
        for (let i = activePlayers.length - 1; i > 0; i--) {
            activePlayers[i].wind = activePlayers[i - 1].wind;
        }
        activePlayers[0].wind = lastWind;

        updateRightTable();
    };

    const updateScoreTable = () => {
        const row = document.createElement("tr");
        roundCount++;

        const roundCell = document.createElement("td");
        roundCell.textContent = `Runde ${roundCount}`;
        row.appendChild(roundCell);

        activePlayers.forEach(player => {
            const pointsCell = document.createElement("td");
            pointsCell.textContent = playerScores[player.index + 1];
            row.appendChild(pointsCell);
        });

        resultsBody.appendChild(row);
    };

    // Hinzufügen eines Aktualisieren-Buttons
    const updateButton = document.createElement("button");
    updateButton.textContent = "Aktualisieren";
    updateButton.id = "updateButton";
    updateButton.style.marginTop = "10px";
    leftSection.appendChild(updateButton);

    updateButton.addEventListener("click", () => {
        updateActivePlayers();
    });

    playerCountSelect.addEventListener("change", updateActivePlayers);

    document.getElementById("calculateButton").addEventListener("click", () => {
        console.log("Punkte werden berechnet...");
        calculateScores();
    });

    updateActivePlayers();
});
