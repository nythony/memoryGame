import {chooseContent, chooseContentImage} from './modules/cards.js';

document.addEventListener("DOMContentLoaded", (event) => {

  let level = 1;        //User defined level
  let difficulty = 1;   //User defined difficulty
  let scoring = false;  //Toggle specific elements without affecting game
  let canClick = true;  //Disable clicks after 2 cards are face up
  let cardsUp = [];     //ID of card elements that are face up
  let content;          //Content of cards
  let counter = 0;      //Number of tries (number of times cardsUp==2)
  let timer;            //Time from start play to all cards face up
  let matches = 0;      //Number of matches
  let pause = false;    //Pause timer when all matches are found


  //BACK BUTTON: From starting new game, to scoreboard for current game
  document.querySelector("#back").addEventListener("click", event =>{

    toggleElements("Start Over");
    document.querySelector("#back").style = "display: none";

    scoring = true;

  })
  
  //PLAY BUTTON: New game, or option to start new game
  document.querySelector("#play").addEventListener("click", event => {
      const gameEle = document.querySelector("#game");

      //Show settings for new game, show "back" button
      if (scoring){

        toggleElements("Play");
        scoring = false;

        document.querySelector("#back").style = "display: inline-block";
      }

      //New Game
      else{

        scoring = true;
        document.querySelector("#back").style = "display: none";

        //Reset values
        gameEle.innerHTML = "";
        cardsUp = [];
        content = [];
        counter = 0;
        matches = 0;
        pause = false;
        document.querySelector("#counter").innerHTML = counter;
        document.querySelector("#minutes").innerHTML = "00";
        document.querySelector("#seconds").innerHTML = "00";

        //Toggle elements
        toggleElements("Start Over");

        
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
        * INTAKE
        */

        level = document.querySelector("#level").value;

        difficulty = parseInt(document.querySelector("#difficulty").value);

        generateCards(level, difficulty, gameEle); //runs asynchronously
      }

  });


  /* * * * * * * * * * * * * * * * * * * * * * * * * 
   * Toggles game settings and scoreboard          *
   * playWord = string that is displayed on button *
   * * * * * * * * * * * * * * * * * * * * * * * * */

  function toggleElements(playWord){
    document.querySelector("#play").innerHTML = playWord;
    document.querySelector(".gameElement").classList.toggle("hidden"); 
    document.querySelector(".score").classList.toggle("show");
  }


  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * Generates and styles all the cards in play based on level and difficulty  *
   * elem = HTML element ("".game" elementin this case)                        *
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
 
   async function generateCards(level, difficulty, elem){

    let numCards = level * 6;

    //Game mode
    switch(difficulty){
      case 1: content = chooseContent(numCards, "words");
              break;
      case 2: content = await chooseContentImage(numCards); //Returns async code that returns content
              break;          
      case 3: content = chooseContent(numCards, "colors");
              break; 
      default: content = chooseContent(numCards, "words");
    }
    
    let htmlStr = "";

    for (let i = 0; i < content.length; i++) {
      htmlStr += `<div id="card${i}" class="card">`
        if (difficulty === 1){
          htmlStr += `<span class="text">${content[i]}</span>`;
        }
      htmlStr += "</div>";
    } 
    
    //Sets the game element in the HTML document with the code for the cards
    elem.innerHTML = htmlStr;

    //STYLE: Since it is based on the card element, asynchronously defined, this is determined here
    if (level == 1){
        setStyle(18, 3);
    } 
    else if (level == 2){
        setStyle(12, 4);
    } 
    else if (level == 3){
      setStyle(11, 6);
    }
    else if (level == 4){
      setStyle(9, 6);
    }
    else { //level 5 and 6
      setStyle(7, 6);
    }

    //Add event listener to each card element
    document.querySelectorAll(".card").forEach( elem => {
      elem.addEventListener("click", checkCard, true);
      /*Note: Anonymous functions cannot be references*/
    });
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

    //Don't do anything if clicking on same card
    if (cardsUp.includes(id) || !canClick){
      return;
    }

    //Add card to list of cards face up for comparison
    cardsUp.push(id);

    const cardElement = document.querySelector(`#${id}`);
    
    //Toggle cards to "face up"
    if (difficulty === 1){
      cardElement.classList.toggle("cardContent");
      document.querySelector(`#${id} > .text`).style.display = "inline-block";
    }
    else if (difficulty === 2){
      cardElement.style.background = `url("${content[idValue]}") center/cover no-repeat`;
    }
    else{
      cardElement.style.background = content[idValue];
    }
    
    //Set attributes of current card
    let thisCardContent;

    if (difficulty === 1){
      thisCardContent = cardElement.innerHTML;
    }
    else if (difficulty === 2){
      thisCardContent = window.getComputedStyle(cardElement, null).getPropertyValue('background-image');
    }
    else{
      thisCardContent = window.getComputedStyle(cardElement, null).getPropertyValue('background-color');
    }

    //2 Cards face up: Determing match
    if (cardsUp.length === 2){

      counter++;
      canClick = false;
      let match = false;

      //Attributes of card already face up
      let firstCardElement = document.querySelector(`#${cardsUp[0]}`);
      let firstCardContent;

      if (difficulty === 1){
        firstCardContent = firstCardElement.innerHTML;
      }
      else if (difficulty === 2){
        firstCardContent = window.getComputedStyle(firstCardElement, null).getPropertyValue('background-image');
      }
      else{
        firstCardContent = window.getComputedStyle(firstCardElement, null).getPropertyValue('background-color');
      }

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

        //All matches found
        if (matches == content.length){
          pause = true;
          document.querySelector("#game").innerHTML = '<div id="win">YOU WIN!</div>';
        }
      }

      //Not a match
      if (!match){

        //Allow users 1 second to see contents of card
        let delay = setTimeout(() => {
          
          //Turn cards face down
          cardsUp.forEach(cardID => {

            if (difficulty === 1){
              document.querySelector(`#${cardID}`).classList.toggle("cardContent");
              document.querySelector(`#${cardID} > .text`).style.display = "none";
            }
            else{
              document.querySelector(`#${cardID}`).style.background = 'url("./images/cardBackground.jpg") center/cover no-repeat';
            }
          })
          
          //Reset values
          cardsUp = [];
          canClick = true;

        }, 1000);
      }
      
      //Update number of tries
      document.querySelector("#counter").innerHTML = counter;
    }
  }

})