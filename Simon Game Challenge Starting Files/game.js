var userClickedPattern=[]
var gamePattern = [];
var buttonColours = ["red", "blue", "green", "yellow"];
var Level=0
var started = false;

function nextSequence() {
    var randomNumber = Math.floor(Math.random() * 4);
    var randomChosenColour = buttonColours[randomNumber];
    gamePattern.push(randomChosenColour);
    $("#" + randomChosenColour).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
    var audio = new Audio("sounds/" + randomChosenColour + ".mp3");
    audio.play();
    userClickedPattern=[];
    $("h1").text("Level"+" "+Level);
    Level=Level+1;
}

$(".btn").on("click",function(){
  var userChosenColour=$(this).attr("id");
  userClickedPattern.push(userChosenColour);
  playSound(userChosenColour);
  animatePress(userChosenColour);
  checkAnswer((userClickedPattern.length)-1)
});

function playSound(name) {
  var audio = new Audio("sounds/" + name + ".mp3");
    audio.play();
}
function animatePress(currentColour){
  $("#"+currentColour).addClass("pressed");
  setTimeout(function()  {
    $("#"+currentColour).removeClass("pressed");
  }, 100);
}

function checkAnswer(currentLevel){
  if (userClickedPattern[currentLevel]===gamePattern[currentLevel]) {
    console.log("yahh");
    if (userClickedPattern===gamePattern) {
      setTimeout(function()  {
        nextSequence();
      }, 1000);
    }
  }
  else{
    console.log("noo");
  }
  
}

$(document).keypress(function() {
  
  if (!started) {
    nextSequence();
    $("h1").text("Level"+" "+Level);
    started=true
  }
});


