import {eraseAllCookies, setCookie} from "./manageCookies.js"

eraseAllCookies()

//Connect to socket
const socket = new io(`ws://localhost:3000`);

socket.on('Successful Connection', data => {
    console.log(data.message);
});

document.addEventListener("DOMContentLoaded", (event) => {

    // Log In Completed: Send details to server
    document.querySelector("#loginSubmission").addEventListener("click", (event) => {

        let data = {
            username: document.querySelector("#username").value,
            password: document.querySelector("#password").value,
        }

        socket.emit("login", data);

    })

    // Login Success: Redirect to user home page
    socket.on("loginSuccess", (userID) => {
        setCookie("userID", userID)
        window.location.href = "./userHomePage.html"
    })
    
    // Login Failed: Show error message
    socket.on("loginFailed", () => {
        document.querySelector("#errorMessage").innerHTML = "Invalid credentials"
    })

});