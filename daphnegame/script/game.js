const clowns = ["img/ronald.gif", "img/it-elevator.gif", "img/clown-game.gif", "img/vincent.gif", "img/bison.gif", "img/yoda-coffee.gif", "img/lapinou.gif", "img/mad-ventura.gif", "img/smokin.gif", "img/ruby.gif", "img/ruby-dance.gif", "img/facepalm.gif", "img/troll-dance.gif", "img/trollol.gif", "img/madpinkie.gif", "img/forfrodo.gif", "img/trololo.gif", "img/screaming-cowboy.gif", "img/mrbean.gif", "img/nyancat.gif", "img/oiia.gif"];
var nbClics = 0;
var points = 0;
var bonus = 0;
var pointsBySecond = 0;
var minClownPoints = 10;

function addPoints(pointsAdded){
	points += pointsAdded;
}
function addBonus(bonusAdded){
	bonus += bonusAdded;
}

function clicContent(){
	addBonus(1);
	pointsBySecond++;
}

function clicClown(){
	if(points >= minClownPoints){
		if(clowns.length - 1 > nbClics){
		nbClics++;
	}else{
		nbClics = 0;
	}
	
	// bonus++;
	addImg(nbClics);
	bonus += 1;
	points -= minClownPoints;
	pointsBySecond++;
	minClownPoints = Math.round(minClownPoints * 1.5 * 100) / 100;
	document.getElementById("btn-id").innerHTML = "Ajouter un troll/clown/gif : " + minClownPoints +" points"
	return nbClics;
	}
	
}

function changeImg(nbClics){
	document.getElementById("clown").src = clowns.at(nbClics);
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

document.getElementById("content").addEventListener("click", clicContent);
document.getElementById("btn-id").addEventListener("click", clicClown);

function addImg(nbClics){
	var attSrc = document.createAttribute("src");
	
	var addTag = document.createElement("img");
	
	var attClass = document.createAttribute("class");
	if(nbClics % 3 == 0){
		attClass.value = "right";
	}else if (nbClics % 2 == 0){
		attClass.value = "left";
	}else{
		attClass.value = "right";
	}
	
	attSrc.value = clowns.at(randomIntFromInterval(0, clowns.length - 1));
	addTag.setAttributeNode(attClass);
	addTag.setAttributeNode(attSrc);

	// 150 top 450
	addTag.style.top = randomIntFromInterval(150, 450) + "px";
	addTag.style.left = randomIntFromInterval(10, 1000) + "px";
	addTag.style.height = randomIntFromInterval(10, 500) + "px";
	addPoints(1);

	document.getElementById("content").appendChild(addTag);
	
}

setInterval(function() {
	points += pointsBySecond;
	document.getElementById("points").innerHTML= points;   
	if(points < minClownPoints){
		document.getElementById("btn-id").disabled = true;
	}else{
		document.getElementById("btn-id").disabled = false;
	}
}, 200)