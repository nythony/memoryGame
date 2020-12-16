import {chooseContentImage} from '../modules/cards.js';
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

let idRoomName = getCookie("gameRoomID")
let player = getCookie("player")

console.log("Player " + player)

document.addEventListener("DOMContentLoaded", async () => {

  //Pass UserID from cooie to DB to link account
  socket.emit("enteredGameRoom", {id: userID, room: idRoomName})

  //Receive username from server
  socket.on("userData", data => {
      username = data.username
      console.log(`You are ${username}`)
  })


  /*
  * Initialize Values 
  */

  let level = 6;        //Level 6 for multiplayer
  let canClick = true;  //Disable clicks after 2 cards are face up
  let cardsUp = [];     //ID of card elements that are face up
  let content = [];     //Content of cards
  let counter = 0;      //Number of tries (number of times cardsUp==2)
  let timer;            //Time from start play to all cards face up
  let matches = 0;      //Number of matches
  let oppMatches = 0;   //Number of opponent matches
  let pause = false;    //Pause timer when all matches are found
  let myTurn = false;
  
  const gameEle = document.querySelector("#game");
  gameEle.innerHTML = "";

  document.querySelector("#mycounter").innerHTML = counter;
  document.querySelector("#oppcounter").innerHTML = counter;
  document.querySelector("#minutes").innerHTML = "00";
  document.querySelector("#seconds").innerHTML = "00";

  
  /*
  * TIMER
  */

  let sec = 0;

  //Clear timer if it alredy exists
  if(typeof timer !== "undefined"){
    clearInterval(timer);
  }

  //Run timer
  function pad ( val ) { 
    return val > 9 ? val : "0" + val; 
  }      
  timer = setInterval( function(){
    if (!pause){
      document.getElementById("seconds").innerHTML=pad(++sec%60);
      document.getElementById("minutes").innerHTML=pad(parseInt(sec/60,10));
    }
  }, 1000);


  /*
  * GAME
  */

  /** Player 1 **/
  //Player 1 generates the card and passes the details to Player 2
  if (player == 1){

    //Player 1 goes first
    myTurn = true;

    let numCards = level * 6;

    //Game mode (images)
    content = await chooseContentImage(numCards); //Returns async code that returns content

    let htmlStr = "";

    //Generate divs for cards
    for (let i = 0; i < content.length; i++) {
      htmlStr += `<div id="card${i}" class="card">`
      htmlStr += "</div>";
    } 

    //Sets the game element in the HTML document with the code for the cards
    gameEle.innerHTML = htmlStr;

    //Send generates cards to other player via socket
    socket.emit("sendGameHTML", {content: content, html: htmlStr, room: idRoomName})

    //Style cards
    setStyle(7, 6);

    //Add event listener to each card element
    document.querySelectorAll(".card").forEach( elem => {
      elem.addEventListener("click", checkCard, true);
    });

  /** Player 2 **/
  //Player 2 receives card content
  }else{
    socket.on("getGameHTML", data => {

      gameEle.innerHTML = data.html
      content = data.content

      //STYLE: Set style for 36 cards
      setStyle(7, 6);

      //Add event listener to each card element
      document.querySelectorAll(".card").forEach( elem => {
        elem.addEventListener("click", checkCard, true);
        /*Note: Anonymous functions cannot be references*/
      })
    })
  }

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
   * Sets the width, margin, height, and text size (if applicable) of cards  *
   * w = width of card; numCards = number of total cards in play             *
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  function setStyle(w, numCards){

      var cardElement = document.querySelectorAll('.card');
      
      cardElement.forEach( elem => {
       
        //Width
        elem.style.width = w + "%";
        
        //Height based on width after % calculation
        let style = window.getComputedStyle(elem);
        let cardWidth = style.getPropertyValue('width');
        cardWidth = parseInt(cardWidth.substring(0, cardWidth.length - 2));
        let h = cardWidth * 1.3;
        elem.style.height = h + "px";
        
        //Margin
        let m = ((100 - (w * numCards)) / (numCards*2)) - 1;
        elem.style.margin = `0 ${m}% 0 ${m}%`;
        
        //Text size
        let fs = cardWidth/4;
        elem.style.fontSize = fs + "px";
      });
  }


  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * *  
   * Flips over card and checks whether cards are a match  *
   * event = event of the card click                       *
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  function checkCard(event){

    //id of card element clicks (notation = "card" + i)
    const id = event.target.id;
    let idValue = parseInt(id.substring(4)); //the i in id notation
    
    //Don't do anything if clicking on same card, if 2 cards are up, or it is not my turn
    if (cardsUp.includes(id) || !canClick || !myTurn){
      return;
    }

    //Add card to list of cards face up for comparison
    cardsUp.push(id);

    const cardElement = document.querySelector(`#${id}`);
    
    //Toggle cards to "face up"
    socket.emit("flipCardUp", {id: idValue, room: idRoomName})
    cardElement.style.background = `url("${content[idValue]}") center/cover no-repeat`;

    //Set attributes of current card
    let thisCardContent = window.getComputedStyle(cardElement, null).getPropertyValue('background-image');


    //2 Cards face up: Determing match
    if (cardsUp.length === 2){

      counter++;
      canClick = false;
      let match = false;

      //Attributes of card already face up
      let firstCardElement = document.querySelector(`#${cardsUp[0]}`);
      let firstCardContent = window.getComputedStyle(firstCardElement, null).getPropertyValue('background-image');

      //Found a match
      if (thisCardContent === firstCardContent){
        match = true;
        matches += 2;

        //remove event listener for both cards (remain face up)
        cardsUp.forEach(cardID => {
          document.querySelector(`#${cardID}`).removeEventListener("click", checkCard, true);
        })

        //reset values
        cardsUp = [];
        canClick = true;

        console.log(`matches: ${matches}, contentLength: ${content.length}`);

        //Update number of tries
        socket.emit("matchesUpdate", idRoomName)
        document.querySelector("#mycounter").innerHTML = matches;
        document.querySelector("#oppcounter").innerHTML = oppMatches;

        //All matches found
        if ((matches+oppMatches) == content.length){

          //Pause timer
          pause = true;

          //Determine win/lose/tie
          if (matches > oppMatches){
            socket.emit("updateGameOver", {userID: userID, win: "WIN"})
            document.querySelector("#game").innerHTML = 
              '<div id="win">YOU WIN!</div>  <a href="./userHomePage.html" class="topRightCorner">Return to User Home Page</a>';
            socket.emit("gameOver", {room: idRoomName, opp: "LOSE"})

          } else if (matches < oppMatches){
            socket.emit("updateGameOver", {userID: userID, win: "LOSE"})
            document.querySelector("#game").innerHTML = 
              '<div id="win">YOU LOSE!</div>  <a href="./userHomePage.html" class="topRightCorner">Return to User Home Page</a>';
            socket.emit("gameOver", {room: idRoomName, opp: "WIN"})
          } else {
            socket.emit("updateGameOver", {userID: userID, win: "TIED"})
            document.querySelector("#game").innerHTML = 
              '<div id="win">YOU TIED!</div>  <a href="./userHomePage.html" class="topRightCorner">Return to User Home Page</a>';
            socket.emit("gameOver", {room: idRoomName, opp: "TIED"})
          }

        }
      }

      //Not a match
      if (!match){

        myTurn = false;

        //Allow users 1 second to see contents of card
        let delay = setTimeout(() => {
          
          socket.emit("flipCardDown",  {cardsUp: cardsUp, room: idRoomName})
          
          //Turn cards face down
          cardsUp.forEach(cardID => {
            document.querySelector(`#${cardID}`).style.background = 'url("../images/cardBackground.jpg") center/cover no-repeat';
          })
          
          //Reset values
          cardsUp = [];
          canClick = true;

          socket.emit("endTurn", idRoomName)

        }, 1000);

      }
    
    }
  }

  /** Socket settings for player not in turn **/
  //Flip cards up when opp flip cards
  socket.on("oppFlipCardUp", cardID => {
    document.querySelector(`#card${cardID}`).style.background = 
        `url("${content[cardID]}") center/cover no-repeat`;
  })

  //Update opp score when opp finds match
  socket.on("oppMatchesUpdate", () => {
    oppMatches += 2
    document.querySelector("#oppcounter").innerHTML = oppMatches;
  })

  //Opp ended the game
  socket.on("oppGameOver", win => {
    socket.emit("updateGameOver", {userID: userID, win: win})
    document.querySelector("#game").innerHTML = 
      `<div id="win">YOU ${win}!</div> <a href="./userHomePage.html" class="topRightCorner">Return to User Home Page</a>`;
  })

  //Flip card down after opp turn
  socket.on("oppFlipCardDown", cardsNeedFlip =>{
    cardsNeedFlip.forEach(cardID => {
      document.querySelector(`#${cardID}`).style.background = 'url("../images/cardBackground.jpg") center/cover no-repeat';
    })
  })

  //Opp turn ends, player turn
  socket.on("oppEndTurn", () =>{
    myTurn = true;
  })



})