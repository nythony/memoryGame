loadDoc("/modules/cardContent.json");

let words = [];
let colors = [];
let images = [];
let backup = [];


//Generates an array of "num" number of randomly selected words from the "words" array.
export function chooseContent(num, type){
  words = localStorage.getItem("words").split(",");
  colors = localStorage.getItem("colors").split(",");
  
  let cardContent = [];
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


export async function chooseContentImage(num){
  backup = localStorage.getItem("backup").split(",");
  images = [];
  let cardContent = [];

  //Select Images
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
  return await Promise.all(promises).then((response) =>{ //Promises runs on a separate thread
    console.log('response', response);
    cardContent = [...images];

    //API request exceeded or unsuccessful
    if (cardContent.length < num){
      console.log("ERROR: Using backup iamges");
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
    console.log("Shuffled", cardContent);
    return cardContent;
  })
}

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

//parsing JSON
function loadDoc(filename) {
  if (filename.includes("card")){
    $.getJSON( filename, function( data ) {
      $.each( data, function( key, value ) {
        localStorage.setItem(key, value);
      });
    });
  }
  //images
  else{
    return $.getJSON( filename, function( data ) {
      $.each( data, function( key, value ) {
        if (key === "urls"){
          images.push(value.small);
          images.push(value.small);
        }
      });
    });
  }
}