document.addEventListener("DOMContentLoaded", () => {
    const playerHeaders = document.getElementById("playerHeaders");
    const resultsBody = document.getElementById("resultsBody");

    // Array zur Speicherung der kumulierten Punkte
    const cumulativeScores = [0, 0, 0, 0];

    const updatePlayerHeaders = () => {
        const playerNames = [
            document.getElementById("playerName1").value,
            document.getElementById("playerName2").value,
            document.getElementById("playerName3").value,
            document.getElementById("playerName4").value,
        ];

        playerHeaders.innerHTML = "<th>Runde</th>";
        playerNames.forEach(name => {
            const th = document.createElement("th");
            th.textContent = name;
            playerHeaders.appendChild(th);
        });
    };

    document.getElementById("calculateButton").addEventListener("click", () => {
        updatePlayerHeaders();

        const roundWind = document.getElementById("roundWind").value;

        const scores = [
            {
                score: parseInt(document.getElementById("score1").value) || 0,
                wind: document.getElementById("wind1").value,
            },
            {
                score: parseInt(document.getElementById("score2").value) || 0,
                wind: document.getElementById("wind2").value,
            },
            {
                score: parseInt(document.getElementById("score3").value) || 0,
                wind: document.getElementById("wind3").value,
            },
            {
                score: parseInt(document.getElementById("score4").value) || 0,
                wind: document.getElementById("wind4").value,
            },
        ];

        // Mahjong Punktverrechnung
        const calculatedScores = scores.map((player, index) => {
            let multiplier = 1;

            // Punkte für den Spieler, wenn der Spielerwind dem Rundenwind entspricht
            if (player.wind === roundWind) {
                multiplier = 2;  // Verdoppelte Punkte für den Rundenwind
            }

            const calculatedScore = player.score * multiplier;
            cumulativeScores[index] += calculatedScore; // Kumuliert die Punkte
            return cumulativeScores[index];
        });

        // Berechnung der Verliererpunkte und Gewinnerpunkte
        const totalPoints = cumulativeScores.reduce((acc, score) => acc + score, 0);
        const winnerIndex = 0;  // Beispiel: Der Gewinner ist der erste Spieler (Ost-Wind)
        const winnerPoints = cumulativeScores[winnerIndex];

        // Punktverrechnung der Verlierer
        const loserScores = cumulativeScores.map((score, index) => {
            if (index !== winnerIndex) {
                const pointsLost = Math.abs(winnerPoints - score);
                cumulativeScores[index] -= pointsLost; // Verlierer verlieren Punkte
                return pointsLost;
            }
            return 0;
        });

        // Neue Runde zur Gesamttabelle hinzufügen
        const roundRow = document.createElement("tr");
        const roundNumber = resultsBody.children.length + 1;
        roundRow.innerHTML = `<td>Runde ${roundNumber}</td>`;
        calculatedScores.forEach(score => {
            const td = document.createElement("td");
            td.textContent = score;
            roundRow.appendChild(td);
        });

        resultsBody.appendChild(roundRow);

        // Reset der Punkteeingabe (außer Winde)
        resetScores();
    });

    function resetScores() {
        // Zurücksetzen der Punktfelder auf 0, Winde bleiben unverändert
        document.getElementById("score1").value = 0;
        document.getElementById("score2").value = 0;
        document.getElementById("score3").value = 0;
        document.getElementById("score4").value = 0;
    }
});
