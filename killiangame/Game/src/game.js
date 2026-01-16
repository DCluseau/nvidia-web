var slider = document.getElementById("slider");
const sliderPos = slider.getBoundingClientRect();
var title = document.getElementById("title");
var scoreTitle = document.getElementById("score");

var player;
var playerSize = 20;
var xOffset = 0;
var yOffset = 0;
const step = 3;
const keys = {left: false, right: false};
var animationID;
var continueGame;

var score = 0;

var gameObjects = [];

function startGame() {
    let xPos = (canvas.width) / 2;
    let yPos = (canvas.height + 120) / 2;
    player = new circle(playerSize, "darkslateblue", xPos, yPos);

    gameScene.start();
}

var gameScene = {
    canvas : document.getElementById("canvas"),
    start : function() {
        continueGame = true;
        this.context = this.canvas.getContext("2d");
        updateScene();
        spawn();
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        cancelAnimationFrame(animationID);
        continueGame = false;
    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.isHit = false;

    this.update = function() {
        if (!this.hitBottom()) {
            if (collisionCheck(this, player)) {
                gameScene.stop();
                return;
            }

            this.velocity += 0.1;
            this.y += this.velocity;
            ctx = gameScene.canvas.getContext("2d");
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.strokeStyle = "gray";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            if (!this.isHit)
                this.hitBottom();
        }
    }
    this.hitBottom = function() {
        var bottom = gameScene.canvas.height - this.height;
        if (this.y > bottom && !this.isHit) {
            this.y = bottom;
            score += 1;
            this.isHit = true;
            return true;
        }
        return false;
    }
}

function circle(radius, color, x, y) {
    this.radius = radius;
    this.x = x;
    this.y = y;

    this.update = function() {
        ctx = gameScene.context;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "dodgerblue";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    this.collisionCheck = function(other) {
        let left = player.x;
        let right = player.x + (player.width);
        let top = player.y;
        let bottom = player.y + (player.height);
        
        let otherLeft = other.x;
        let otherRight = other.x + (other.width);
        let otherTop = other.y;
        let otherBottom = other.y + (other.height);
        
        return (left < otherRight &&
            right > otherLeft &&
            top < otherBottom &&
            bottom > otherTop);
    }
}

function collisionCheck(current, other) {
    let distX = Math.abs(current.x - other.x);
    let distY = Math.abs(current.y - other.y);
    let dist = Math.abs(distX + distY);
    return (dist <= playerSize);
}

function updateScene() {
    gameScene.clear();

    if (keys.left) {
        if (xOffset > -90) {
            xOffset -= step;
            player.x -= step;
        }
    } if (keys.right) {
        if (xOffset < 90) {
            xOffset += step;
            player.x += step;
        }
    }
    player.update();
    gameObjects.forEach((go, index) => {
        go.update();
        if (collisionCheck(player, go)) {
            gameScene.stop();
        }
    });

    title.innerHTML = "Score : " + score;
    scoreTitle.innerHTML = score;

    if (continueGame) 
        animationID = requestAnimationFrame(updateScene);
}

var spawnDelay = 0;
function spawn() {
    min = Math.ceil(-90);
    max = Math.floor(91);
    var rnd = Math.floor(Math.random() * (max - min)) + min;
    gameObjects.push(new component(20, 20, "white", 128 + rnd, 0));

    setTimeout(spawn, 2000 - spawnDelay);
    if (spawnDelay < 1700) spawnDelay += 100;
    if (score >= 100) spawnDelay = 1850;
    console.log(spawnDelay);
}

document.addEventListener("keydown", function(event) {
    switch(event.key) {
        case "ArrowLeft":
            keys.left = true;
            break;
        case "ArrowRight":
            keys.right = true;
            break;
    }
});

document.addEventListener("keyup", function(event) {
    switch(event.key) {
        case "ArrowLeft":
            keys.left = false;
            break;
        case "ArrowRight":
            keys.right = false;
            break;
    }
});