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

        // Berechnung der Punkte mit Multiplikator
        const calculatedScores = scores.map((player, index) => {
            let multiplier = player.wind === roundWind ? 2 : 1;
            const calculatedScore = player.score * multiplier;
            cumulativeScores[index] += calculatedScore; // Kumulativ hinzufügen
            return cumulativeScores[index];
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
    });
});
