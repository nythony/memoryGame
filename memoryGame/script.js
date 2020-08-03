import {chooseContent} from './modules/cards.js';

document.addEventListener("DOMContentLoaded", (event) => {

  let level = 1;
  let difficulty = 1;
  let canClick = true; //not allow clicks after 2 cards are face up
  let cardsUp = [];
  let counter = 0;
  let timer;
  let matches = 0;
  let content;
  let pause = false;
       
  document.querySelector("#play").addEventListener("click", event => {
      const gameEle = document.querySelector("#game");
      gameEle.innerHTML = "";  // clear it. 
      cardsUp = [];
      counter = 0;
      matches = 0;
      content = [];
      pause = false;
      document.querySelector("#play").innerHTML = "Start Over";
      document.querySelector(".gameElement").classList.toggle("hidden"); 
      document.querySelector(".score").classList.toggle("show"); 
      document.querySelector("#counter").innerHTML = counter;
      document.querySelector("#minutes").innerHTML = "00";
      document.querySelector("#seconds").innerHTML = "00";
      var sec = 0;

      
      /*
       * TIMER
       */

      //Clear timer if it alredy exists
      if(typeof timer !== "undefined"){
        clearInterval(timer);
      }

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

      gameEle.innerHTML = generateCards(level, difficulty);

      /*
       * STYLE 
       */

      // 3 Cards per row
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
      else {
        setStyle(7, 6);
      }

      document.querySelectorAll(".card").forEach( elem => {
        elem.addEventListener("click", checkCard, true);
        /*
        * Note to self:
        * Anonymous functions are mutually exclusive,
        * you cannot remove event by "recreating" the
        * parameters of addEventListener.
        */
      });

  });

  function generateCards(level, difficulty){
    console.log(difficulty);
    //Each level will have 6x cards
    let numCards = level * 6;
    switch(difficulty){
      case 1: content = chooseContent(numCards, "words");
              break;
      case 2: content = chooseContent(numCards, "colors");
              break; 
      case 3: content = chooseContent(numCards, "images");
              break;  
      default: content = chooseContent(numCards, "words");
    }
    
    console.log(content);

    let htmlStr = "";

    for (let i = 0; i < content.length; i++) {
      htmlStr += `<div id="card${i}" class="card">`
        if (difficulty === 1){
          htmlStr += `<span class="text">${content[i]}</span>`;
        }
      htmlStr += "</div>";
    } 
  
    return htmlStr;
    
  }

  function setStyle(w, numCards){
      //All card divs
      var cardElement = document.querySelectorAll('.card');
      
      cardElement.forEach( elem => {
        elem.style.width = w + "%";
        
        //Height based on width after % calculation
        let style = window.getComputedStyle(elem);
        let cardWidth = style.getPropertyValue('width');
        cardWidth = parseInt(cardWidth.substring(0, cardWidth.length - 2));
        
        let h = cardWidth * 1.3;
        elem.style.height = h + "px";
        
        let m = ((100 - (w * numCards)) / (numCards*2)) - 1;
        elem.style.margin = `0 ${m}% 0 ${m}%`;

        let fs = cardWidth/4;
        elem.style.fontSize = fs + "px";
      });
  }

  function checkCard(event){

    const id = event.target.id;
    let idValue = parseInt(id.substring(4));

    //don't toggle same card already up
    if (cardsUp.includes(id) || !canClick){
      return;
    }

    cardsUp.push(id);

    const cardElement = document.querySelector(`#${id}`);
    
    //turn card face up
    if (difficulty === 1){
      cardElement.classList.toggle("cardContent");
      document.querySelector(`#${id} > .text`).style.display = "inline-block";
    }
    else if (difficulty === 2){
      cardElement.style.background = content[idValue];
    }
    else{
      cardElement.style.background = `url("${content[idValue]}") center/cover no-repeat`;
    }

    let thisCardContent;

    if (difficulty === 1){
      thisCardContent = cardElement.innerHTML;
    }
    else if (difficulty === 2){
      thisCardContent = window.getComputedStyle(cardElement, null).getPropertyValue('background-color');
    }
    else{
      thisCardContent = window.getComputedStyle(cardElement, null).getPropertyValue('background-image');
    }

    if (cardsUp.length === 2){
      counter++;

      canClick = false;
      let match = false;

      //compare the card contents
      let firstCardElement = document.querySelector(`#${cardsUp[0]}`);
      let firstCardContent;

      if (difficulty === 1){
        firstCardContent = firstCardElement.innerHTML;
      }
      else if (difficulty === 2){
        firstCardContent = window.getComputedStyle(firstCardElement, null).getPropertyValue('background-color');
      }
      else{
        firstCardContent = window.getComputedStyle(firstCardElement, null).getPropertyValue('background-image');
      }

      //match
      if (thisCardContent === firstCardContent){
        match = true;
        matches += 2;
        //remove event listener for both cards, remain face up
        cardsUp.forEach(cardID => {
          document.querySelector(`#${cardID}`).removeEventListener("click", checkCard, true);
        })
        cardsUp = [];
        canClick = true;

        console.log(`matches: ${matches}, contentLength: ${content.length}`);

        if (matches == content.length){
          pause = true;
        }
      }

      //not a match
      if (!match){
        let delay = setTimeout(() => {
          //turn cards face down
          cardsUp.forEach(cardID => {

            if (difficulty === 1){
              document.querySelector(`#${cardID}`).classList.toggle("cardContent");
              document.querySelector(`#${cardID} > .text`).style.display = "none";
            }
            else{
              document.querySelector(`#${cardID}`).style.background = "#1dccc3";
            }
          })
          
          //empty cardsUp
          cardsUp = [];
          canClick = true;
        }, 1000);
      }
      document.querySelector("#counter").innerHTML = counter;
    }
  }

})