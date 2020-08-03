
loadDoc("/modules/cardContent.json");
//loadDoc("https://api.unsplash.com/photos/random?client_id=lCaKm1yfPwZ25hvSogTlbO8bOGwtbd2foKuyhRY62sQ");

//const images = localStorage.getItem("download_url").split(",");
let words = [];
let colors = [];
let images = [];
let backup = [];


//Generates an array of "num" number of randomly selected words from the "words" array.
export function chooseContent(num, type){
  words = localStorage.getItem("words").split(",");
  colors = localStorage.getItem("colors").split(",");
  backup = localStorage.getItem("backup").split(",");
  images = [];

  
  let cardContent = [];

  //Select Images
  if (type === "images"){
    let counter = 0;

   
    for (let i = 0; i < num/2; i++){
      loadDoc(`https://api.unsplash.com/photos/random?client_id=lCaKm1yfPwZ25hvSogTlbO8bOGwtbd2foKuyhRY62sQ&sig=${Math.random()}`));
    }

    console.log("result: Images");
    console.log(images);

    console.log("result: Images LENGTH");
    console.log(images.length);

    cardContent = [...images];
    console.log("result: cardContent");
    console.log(cardContent);

    //API request exceeded or unsuccessful
    if ( cardContent.length < num){
      console.log(`cardContent ${cardContent.length} and num is ${num}`);
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


  }

  //Select Colors or Word
  else{
    let array = eval(type);
    while(cardContent.length < num){
        var index = Math.floor(Math.random() * 18);
        if(cardContent.includes(array[index]) === false){
          //Add twice for a pair
          cardContent.push(array[index]);
          cardContent.push(array[index]);
        }
    }
  }

  cardContent = shuffle(cardContent);

  return cardContent;
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
    $.getJSON( filename, function( data ) {
      $.each( data, function( key, value ) {
        if (key === "urls"){
          console.log(value.small);
          images.push(value.small);
          images.push(value.small);
        }
      });
    }).then(function(data){
      return images;
      })
  }
}