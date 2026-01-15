class RockPaperScissors {
    constructor() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.choices = ["rock", "paper", "scissors"];
    }

    play(playerChoice) {
        if (playerChoice === "reset") {
            this.reset();
            return;
        }

        const computerChoice = this.choices[Math.floor(Math.random() * 3)];

        let result = "";

        if (playerChoice === computerChoice) {
            result = "It's a draw!";
            this.showDrawImage();
        } 
        else if (
            (playerChoice === "rock" && computerChoice === "scissors") ||
            (playerChoice === "paper" && computerChoice === "rock") ||
            (playerChoice === "scissors" && computerChoice === "paper")
        ) {
            this.playerScore++;
            result = "Player wins this round!";
            this.showRandomImage("win");

            if (this.playerScore >= 3) {
                result += `
                <div class="end_game_win">
                    <br><br> Congratulations! You are the best!!
                </div>
                
                `;
            }
        } 
        else {
            this.computerScore++;
            result = "Computer wins this round!";
            this.showRandomImage("lose");

            if (this.computerScore >= 3) {
                result += `
                <div class="end_game_lose">
                    <br><br> Loser ! Jump off the bridge.
                </div>
                
                `;
            }
        }

        this.showResult(playerChoice, computerChoice, result);
    }

    reset() {
        this.playerScore = 0;
        this.computerScore = 0;

        document.getElementById("result").innerHTML = `
            Game restarted<br><br>
            Player score : ${this.playerScore}<br>
            Computer score : ${this.computerScore}
        `;

        document.getElementById("img_game").innerHTML = "";
    }

    showResult(playerChoice, computerChoice, result) {
        document.getElementById("result").innerHTML = `
            You chose <b>${playerChoice}</b><br>
            Computer chose <b>${computerChoice}</b><br><br>
            Player score : ${this.playerScore}<br>
            Computer score : ${this.computerScore}<br><br>
            ${result}
        `;
    }

    showRandomImage(type) {
        const div = document.getElementById("img_game");
        div.innerHTML = "";

        const randomNumber = Math.floor(Math.random() * 5) + 1;

        const img = document.createElement("img");
        img.src = `./img/${type}/${type}${randomNumber}.jpg`;
        img.alt = type;

        div.appendChild(img);
    }

    showDrawImage() {
        const div = document.getElementById("img_game");
        div.innerHTML = "";

        const img = document.createElement("img");
        img.src = "./img/draw/draw.jpg";
        img.alt = "Draw";

        div.appendChild(img);
    }
}

const game = new RockPaperScissors();
