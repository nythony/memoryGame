//Connect to socket
const socket = new io(`ws://localhost:3000`);

socket.on('Successful Connection', data => {
    console.log(data.message);
});

document.addEventListener("DOMContentLoaded", (event) => {

    // Sign Up Completed: Send details to server
    document.querySelector("#createAccountSubmission").addEventListener("click", (event) => {

        data = {
            username: document.querySelector("#createUsername").value,
            password: document.querySelector("#createPassword").value,
        }

        socket.emit("createAccount", data);

    })

    // Sign Up Success: Redirect to login page
    socket.on("signUpSuccess", () => {
        window.location = "./login.html"
    })
    
    // Sign Up Failed: Show error message
    socket.on("signUpFailed", () => {
        document.querySelector("#errorMessage").innerHTML = "Username already in use"
    })

});