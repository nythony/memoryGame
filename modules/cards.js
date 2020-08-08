//Loading hardcoded words, colors and backup images into the brower for later reference
loadDoc("/modules/cardContent.json");

//Attributes
let words = [];
let colors = [];
let images = [];
let backup = [];



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Generates an array of "num" number of randomly selected words or colors (type)  *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

export function chooseContent(num, type){
  words = localStorage.getItem("words").split(",");
  colors = localStorage.getItem("colors").split(",");
  
  let cardContent = [];

  //Randomly selects indices from the specified array, ensuring no duplicates
  let array = eval(type);
  while(cardContent.length < num){
      var index = Math.floor(Math.random() * 18);
      if(cardContent.includes(array[index]) === false){
        //Add twice for a pair
        cardContent.push(array[index]);
        cardContent.push(array[index]);
      }
  }

  cardContent = shuffle(cardContent);
  return cardContent;

}


/* * * * * * * * * * * * * * * * * * * * * * * * * 
 * Generates an array of "num" number of images. *
 * * * * * * * * * * * * * * * * * * * * * * * * */
/*
 This method "await Promise" that will execute in the main code.
 The rest of the main code will then run on the same thread as the
 one created in this method, and the "return cardContent" will be 
 accessible.
*/

export async function chooseContentImage(num){

  images = []; //reset
  let cardContent = [];

  //Select Ranom Images from Unsplash
  let promises = [];
  for (let i = 0; i < num/2; i++){
    promises.push(
      Promise.resolve(
        loadDoc(
          `https://api.unsplash.com/photos/random?client_id=lCaKm1yfPwZ25hvSogTlbO8bOGwtbd2foKuyhRY62sQ&sig=${Math.random()}`
        )
      )
    )
  }
  //This whole code block is returned
  return await Promise.allSettled(promises).then((response) =>{

    cardContent = [...images];

    //API request exceeded or unsuccessful
    /*
     API only allows 50 requests/hour. Quota resets at the top of each hour.
     Each image is a single requesst.
     (Level 1 = 6 cards = 3 image requests; Level 6 = 36 cards = 18 image requests)
     Must apply for production level to increase quota.
     */
    if (cardContent.length < num){
      console.log("ERROR: Using backup images"); //runs much slower
      backup = localStorage.getItem("backup").split(",");
      //Populates however much is needed
      while(cardContent.length < num){
        var index = Math.floor(Math.random() * 18);
        if(cardContent.includes(backup[index]) === false){
          //Add twice for a pair
          cardContent.push(backup[index]);
          cardContent.push(backup[index]);
        }
      }
    }

    cardContent = shuffle(cardContent);
    return cardContent;
  })
}



/* * * * * * * * * 
 * Parsing JSON  *
 * * * * * * * * */

function loadDoc(filename) {
  //Words and colors: Stores in user's brower
  if (filename.includes("card")){
    $.getJSON( filename, function( data ) {
      $.each( data, function( key, value ) {
        localStorage.setItem(key, value);
      });
    });
  }
  //Images: Returns the promise
  else{
    return $.getJSON( filename, function( data ) {
      $.each( data, function( key, value ) {
        if (key === "urls"){
          images.push(value.small);
          images.push(value.small);
        }
      });
    })
  }
}



/* * * * * * * * * * * * * * * *
 * Shuffles contents of array  *
 * * * * * * * * * * * * * * * */

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}




// .error(function(err) {
//         console.log("ERROR: ", err);
//         let cardContent = [...images];
//         let num = 6;

//         console.log("CARD CONTENT: ", cardContent);

//         //API request exceeded or unsuccessful
//         /*
//         API only allows 50 requests/hour. Quota resets at the top of each hour.
//         Each image is a single request.
//         (Level 1 = 6 cards = 3 image requests; Level 6 = 36 cards = 18 image requests)
//         Must apply for production level to increase quota.
//         */
//         if (cardContent.length < num){
//           console.log("ERROR: Using backup iamges"); //runs much slower
//           backup = localStorage.getItem("backup").split(",");
//           //Populates however much is needed
//           while(cardContent.length < num){
//             var index = Math.floor(Math.random() * 18);
//             if(cardContent.includes(backup[index]) === false){
//               //Add twice for a pair
//               cardContent.push(backup[index]);
//               cardContent.push(backup[index]);
//             }
//           }
//         }

//         cardContent = shuffle(cardContent);

//         console.log("done ", cardContent);
//         return cardContent;
//       });