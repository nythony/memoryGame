Alina Chaiysaarikul

Running the program
- In MongoDB Compass, create a new database called "memoryGameDB" and a collection inside called "user". Ensure it is running locally on port 27017.
    (I believe the program should automatically create the DB environment (at least it does when I test it), but if not we want to set up the database first.)
- Direct the command line to the backup folder, and type "npm install"
- Run the "server.js" file (using "node server.js" or "nodemon server.js") 
and ensure the code is running on localhost port 3000 
    (since that is where the socket.io connection is directed to)
- Direct the code to the frontend folder and run the frontend on a different webserver
    (I use the Live Server extension on Visual Studio Code that runs on port 5500)
    (Depending on the port you are running, you may have to add the port to the CORS whitelist in "server.js)
    (If you see a ton of CORS error in the browser, also check that "server.js" is running properly on localhost port 3000)


Warnings and Errors

API Call to Unsplash:
- 50 Requests per hour (stacks)
- Pulls random images
- In game, 36 cards = 18 requests
- For EACH image, an error will appear in the browser: 
    GET https://api.unsplash.com/photos/random?client_id=somegibberish
    [HTTP/2 403 Forbidden 61ms]

    XML Parsing Error: syntax error
    Location: https://api.unsplash.com/photos/random?client_id=somegibberish
    Line Number 1, Column 1:
- If the API call breaks, backup images are supplied and the code should not break


Warnings:
- Cookie for io
    Some cookies are misusing the recommended “SameSite“ attribute 
- JQuery-latest.js 
    Cookie “__utma”/“__utmz”/“__cfduid” will be soon treated as cross-site cookie against 
    “http://code.jquery.com/jquery-latest.js” because the scheme does not match.

Limitation:
- I used Firefox to test my code, and Firefox private browsing share cookies. I cannot test using 3 or more users.
- I do not know why it doesn't work in any other browser. At first I got the error that socket.io.js.map could not be found, but since I have added it, it still does not work. There is no error message either.
- You can press the back button, but there is no option to leave a game unless you complete the game first.
- If you are playing in a multiplayer game, and the opponent leaves, nothing happens to the other player and they will wait forever.