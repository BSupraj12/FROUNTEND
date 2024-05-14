for(i=0;i<7;i++){
document.getElementsByClassName("drum")[i].addEventListener("click",function () {
    Console.log(this);
});
}
document.addEventListener("keypress",function(k){
    switch (k.key) {
        case "w":
            audio=new Audio("sounds/crash.mp3")
            audio.play()
            break;
        case "a":
            audio=new Audio("sounds/kick-bass.mp3")
            audio.play()
            break;
        case "s":
            audio=new Audio("sounds/snare.mp3")
            audio.play()
            break;
        case "d":
            audio=new Audio("sounds/tom-1.mp3")
            audio.play()
            break;
        case "j":
            audio=new Audio("sounds/tom-2.mp3")
            audio.play()
            break;
        case "k":
            audio=new Audio("sounds/tom-3.mp3")
            audio.play()
            break;
        default:
            break;
    }
})
for (var i=0;i<7;i++){
document.querySelectorAll(".drum")[i].addEventListener("click",function(){
    var a=this.innerHTML;
    switch (a) {
        case "w":
        audio=new Audio("sounds/crash.mp3")
        audio.play()
            break;
    
        default:
            break;
    }
})
}