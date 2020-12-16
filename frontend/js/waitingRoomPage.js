import {setCookie, getCookie} from "./manageCookies.js"

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

document.addEventListener("DOMContentLoaded", () => {

    //Pass UserID from cooie to DB to link account
    socket.emit("enteredWaitingRoom", userID)

    //Receive username from server
    socket.on("userData", data => {
        username = data.username
        console.log(`Your username is ${username}`)
    })

    //Match 2 users to play against each other
    socket.on("matchFound", (data) => {

        setCookie("gameRoomID", data.id)
        setCookie("player", data.player)
        
        socket.emit("leaveWaitingRoom");

        window.location = "./multiplayerGame.html"
    })
    
})