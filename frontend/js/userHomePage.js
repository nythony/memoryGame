import {getCookie} from "./manageCookies.js"

let userID = getCookie("userID")

//Redirect back to login if user is not logged in
if (userID == ""){
    window.location = "./login.html"
}

//Connect to socket
const socket = new io(`ws://localhost:3000`);

socket.on('Successful Connection', data => {
    console.log(data.message);
});

let username = ""
let win = 0;
let lose = 0;
let tied = 0;

document.addEventListener("DOMContentLoaded", () => {

    //Pass UserID from cooie to DB to link account
    socket.emit("enteredUserHomePage", userID)

    //Receive username from server
    socket.on("userData", data => {
        username = data.username
        win = data.win
        lose = data.lose
        tied = data.tied
        document.querySelector("#welcomeUser").innerHTML = `Welcome ${username}`
        document.querySelector("#numWins").innerHTML = `Wins: ${win}, `
        document.querySelector("#numLosses").innerHTML = `Losses: ${lose}, `
        document.querySelector("#numTies").innerHTML = `Ties: ${tied}`
    })


    /** Game mode **/

    document.querySelector("#singleplayer").addEventListener("click", () =>{
        window.location = "./game.html"
    })

    document.querySelector("#multiplayer").addEventListener("click", () =>{
        window.location = "./waitingRoom.html"
    })
    
})