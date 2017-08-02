/*
 ____  __ _  _  _   __   __ _  _  _  ____  __   
(  __)(  ( \( \/ ) / _\ (  ( \/ )( \(  __)(  )  
 ) _) /    // \/ \/    \/    /) \/ ( ) _) / (_/\
(____)\_)__)\_)(_/\_/\_/\_)__)\____/(____)\____/

 _  _   __   ____ 
/ )( \ / _\ / ___)
\ /\ //    \\___ \
(_/\_)\_/\_/(____/
  
  ___  __  ____  __  __ _   ___
 / __)/  \(    \(  )(  ( \ / __)
( (__(  O )) D ( )( /    /( (_ \
 \___)\__/(____/(__)\_)__) \___/

 _  _  ____  ____  ____ 
/ )( \(  __)(  _ \(  __)
) __ ( ) _)  )   / ) _) 
\_)(_/(____)(__\_)(____)

*/

"use strict";

var bitmap;

var manifesto;
var loadQueue;
var stage;
var canvas;

var backgroung;
var player;
var cpu;

var text;

var cpuSpeed = 5;
var xSpeed = 1;
var ySpeed = 1;
var obj = [];
var movingToX=1;
var velX;
var velY;
var playerSpeed = 10;
var keyDown = false;

var keyUp = false;

var startRound = true;

var playerScore = 0;
var cpuScore = 0;

var coords = [
[0,0],
[100,140],
[360,140],
[232,168]
];

var tiker;

$( document ).ready(function(){
    Main();

    document.body.addEventListener('keydown', function(e) {

        if(e.keyCode == 87 ){
            obj[1].speed = -1;
        }
        if(e.keyCode == 83){
            obj[1].speed = 1;
        }
    });
    document.body.addEventListener('keyup', function(e) {

        if(e.keyCode == 87 || e.keyCode == 83){
            obj[1].speed = 0;
        }
    });
});

function Main(){

    // where the ball goes at the start
    (Math.random() > 0.5) ? movingToX = -1 : movingToX = 1 ;
    (Math.random() > 0.5) ? movingToY = -1 : movingToY = 1 ;



    canvas = document.querySelector("#game");
    stage = new createjs.Stage("game");
    stage.mouseEventsEnabled = true;
    bitmap = new createjs.Bitmap("descarga.jpg");
    bitmap.x = 200;


    text = new createjs.Text("Player score : "+playerScore+"      CPU score: "+cpuScore , "bold 16px Arial", "#ff0000");
    text.x = 110;
    text.y = 50;

    // files to load
    manifesto = [
    {id:"bg",src:"ping_pong/background.png"},//background
    {id:"player",src:"ping_pong/paleta.png"},//player
    {id:"cpu",src:"ping_pong/paleta.png"},//cpu
    {id:"pelota",src:"ping_pong/pelota.png"},//bola
    ];

    loadQueue = new createjs.LoadQueue(false,"");
    loadQueue.on("complete",complete);
    loadQueue.on("fileload",perFile);
    loadQueue.loadManifest(manifesto);


}

function complete(e){
    stage.addChild(text);

    stage.update();

    createjs.Ticker.setInterval(30);
    createjs.Ticker.setFPS(30);
    createjs.Ticker.addEventListener("tick", tick);

    obj[1].speed = 0;
    setTimeout(function(){stage.addChild(text);},400)
    
}
// loading per file
function perFile(e){
    var index;
    var image = e.result;
    var w = image.width;
    var h = image.height;
    var bmp = new createjs.Bitmap(image);
    obj.push(bmp);
    index = obj.length - 1;
    obj[index].x = coords[index][0];
    obj[index].y = coords[index][1];
    stage.addChild(bmp);
}

// game loop
function tick(event) {

/* 
obj[0] = bg 
obj[1] = player 
obj[2] = cpu  
obj[3] = ball
*/

window.hit1 = obj[1].globalToLocal(obj[3].x, obj[3].y + 8);
window.hit2 = obj[2].globalToLocal(obj[3].x + 8, obj[3].y + 8);


//collision detection


// if diference is positive or negative go up or down
// the sum of xSpeed and Y speed is 2. That way the less ySpeed the more xSpeed
// + 30 is because is poingting to the center not to the top of the palette

if(obj[1].hitTest(hit1.x, hit1.y)){
    movingToX = 1;
    ySpeed = (Math.abs(obj[1].y+30-obj[3].y+8))/30;
    xSpeed =  2 - ySpeed;
    ((obj[1].y+30-obj[3].y+8) > 0)? movingToY = -1 : movingToY = 1;
}
if(obj[2].hitTest(window.hit2.x, window.hit2.y)){
    movingToX = -1;
    ySpeed = (Math.abs(obj[2].y+30-obj[3].y+8))/30;
    xSpeed =  2 - ySpeed;
    ((obj[1].y+30-obj[3].y+8) > 0)? movingToY = -1 : movingToY = 1;
}


// cpu non inteligent inteligence
if(obj[3].y > obj[2].y+30 ){
    obj[2].y+= event.delta/1000*100;
}
if(obj[3].y < obj[2].y+30 ){
    obj[2].y-= event.delta/1000*100;
} 



// Scoring
if(obj[3].x > 460){
    startRound = true;
    playerScore++;
}
if(obj[3].x <= 0){
    startRound = true;
    cpuScore++;
}

//ball bounce
if(obj[3].y > 290){
    movingToY = -1;
}
if(obj[3].y < 15){
    movingToY = 1;
}


// player and cpu boundaries
if(obj[1].y < 15 ){
    obj[1].y = 15;
}
if(obj[1].y > 240 ){
    obj[1].y = 240;
}
if(obj[2].y < 15 ){
    obj[2].y = 15;
}
if(obj[2].y > 240 ){
    obj[2].y = 240;
}

// player speed movement
obj[1].y +=  3 * obj[1].speed;

// ball movement 
obj[3].x += xSpeed*(movingToX) * event.delta/1000*100;
obj[3].y += ySpeed*(movingToY) * event.delta/1000*100;

//Scoring

text.text = "Player score : "+playerScore+"      CPU score: "+cpuScore ;

if(startRound)
    {
        // center of the ball
        obj[3].x = 232;
        obj[3].y = 140;
        roundStart();
    }

    // if there is a winner
    end();

    // updating every frame
    stage.update(event);
}

function roundStart(){
    //giving time to prepare

    setTimeout(function(){startRound = false;} , 2000);

    // speed that cpu and human can easely react to
    xSpeed = 0.8;
    ySpeed = 1.2;
}


function end(){
    if(playerScore > 2 || cpuScore > 2) {
        stage.removeChild(obj[3]); xSpeed = 0 , ySpeed = 0;
        text.font = "bold 26px Arial";
        text.x = 30;
    }
}