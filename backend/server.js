/////////////////////////////
// Setup
/////////////////////////////
/** Requires **/
const http = require('http');
const express = require("express");
const path = require('path')
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const morgan = require('morgan');

/** Constants **/
const app = express();
const saltRounds = 10;
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const whitelist = ['http://localhost', 
                   'http://localhost:3000', 
                   'http://localhost:5500',
                   'http://localhost:80'];
const corsOptions = {
  credentials: true, 
  origin: (origin, callback) => {
    if(whitelist.includes(origin))
      return callback(null, true)

      callback(new Error('Not allowed by CORS'));
  }
}

/** Use **/
app.use(cors(corsOptions));
app.use(morgan("dev")); //Logger
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/** Database Connection **/
const MongoClient = require('mongodb').MongoClient;
const client = MongoClient('mongodb://localhost:27017', {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
client.connect( err => {
    if (err) {
      throw err;
    }
    console.log(`${new Date().toLocaleString()}: Connected successfully to database server`);
});
const mongoConnection = client.db('memoryGameDB');


/////////////////////////////
// Socket IO
/////////////////////////////
io.on('connection', (socket) => {

    /** New Connection **/
    io.to(socket.id).emit("Successful Connection", 
        {
         message:`Welcome! You are: ${socket.id}`
        });


    /** New Account: Check if username exists, if not add to DB **/
    socket.on("createAccount", (data) => {
        username = data.username
        password = data.password

        // Check if username already exists
        mongoConnection.collection('users').countDocuments({
            'username': username, 
        })
        .then(count => {

            //Username already exists, send back error
            if (count > 0){
                io.to(socket.id).emit("signUpFailed")
            }

            //Username does not exist, add to DB
            else{

                //Hashing
                bcrypt.genSalt(saltRounds, function(err, salt) {
                    bcrypt.hash(password, salt, function(err, hash) {
                        //Adding to DB
                        mongoConnection.collection('users').insertOne({
                            'username': username, 
                            'password': hash,
                            'userID': Math.floor(Math.random()*1000000000),
                            'win': 0,
                            'lose': 0,
                            'tied': 0
                        })
                        //Confirm and send back completion
                        .then(
                            res => console.log(`Inserted ${res.result.n} documents`),
                            err => console.error(`Something went wrong: ${err}`),
                            console.log(`${new Date().toLocaleString()} Insertion complete.`)

                        );
                    });
                });

                io.to(socket.id).emit("signUpSuccess")
            }
        })
    })


    /** Login: Check credentials, if correct, send to userHomePage **/
    socket.on("login", (data) => {
        username = data.username
        password = data.password

        // Check if username  exists
        mongoConnection.collection('users').countDocuments({
            'username': username, 
        })
        .then(count => {

            //Username already exists
            if (count > 0){

                // Check if credentials are correct
                mongoConnection.collection('users').find({ 'username': username}, {password: 1, userID: 1, _id: 0}).forEach(dbRes => {
                    
                    bcrypt.compare(password, dbRes.password)
                    .then(function(result) {

                        if (result){
                            //Login Success, send userID
                            io.to(socket.id).emit("loginSuccess", dbRes.userID)
                        }
                        else{
                            io.to(socket.id).emit("loginFailed")
                        }
                    })
                    .catch( err => {
                        console.log("Compare failed: " + err);
                        res.send("Compare failed: " + err);
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.send(err)
                })
 
            }

            //Username does not exist, send error message
            else{
                io.to(socket.id).emit("loginFailed")
            }
        })
    })


    /** User Home Page: Get user-centric data **/
    socket.on("enteredUserHomePage", (data) => {
        userID = parseInt(data)

        //Find user info
        mongoConnection.collection('users').find({ 'userID': userID}, {username: 1, lose: 1, tied: 1, win: 1, _id: 0}).forEach(dbRes => {
            userData = {
                username: dbRes.username,
                lose: dbRes.lose,
                tied: dbRes.tied,
                win: dbRes.win
            }

            io.to(socket.id).emit("userData", userData)
        })
    })

    /** Waiting room: Find a person to play with **/
    socket.on("enteredWaitingRoom", (data) => {
        userID = parseInt(data)

        //Find user info
        mongoConnection.collection('users').find({ 'userID': userID}, {username: 1, _id: 0}).forEach(dbRes => {
            userData = {
                username: dbRes.username
            }

            io.to(socket.id).emit("userData", userData)
        })

        socket.join("waitingRoom");

        //Get list of clients in room
        let clients = io.nsps["/"].adapter.rooms["waitingRoom"];

        //Match 2 players
        if (clients.length >= 2){
            for (let socketid in clients.sockets){
                if (socketid != socket.id){
                    console.log(`Matching ${socketid} and ${socket.id}`)
                    io.to(socketid).emit("matchFound", {id: socket.id, player: 1})
                    io.to(socket.id).emit("matchFound", {id: socket.id, player: 2})
                    break
                }
            }
        }

    })

    /*
    * GAME
    */

    /** Game room: 2 player in same room **/
    socket.on('enteredGameRoom', data => {

        let userData = {}

        //Find user info
        mongoConnection.collection('users').find({ 'userID': data.id}, {username: 1, _id: 0}).forEach(dbRes => {
            userData = {
                username: dbRes.username
            }

            io.to(socket.id).emit("userData", userData)
        })

        socket.join(data.room)

    })

    /** Player no longer in waiting room **/
    socket.on('leaveWaitingRoom', () => {
        socket.leave("waitingRoom")
    })

    /** Game room: 2 player in same room **/
    socket.on("sendGameHTML", (data) =>{
        socket.to(data.room).emit("getGameHTML", data)
    })


    /** In play: events for in game play **/

    socket.on("flipCardUp", data => {
        socket.to(data.room).emit("oppFlipCardUp", data.id)
    })

    socket.on("matchesUpdate", room => {
        socket.to(room).emit("oppMatchesUpdate")
    })

    socket.on("gameOver", data => {
        socket.to(data.room).emit("oppGameOver", data.opp)
    })

    socket.on("updateGameOver", data => {
        let userID = parseInt(data.userID)
        let win = data.win.toLowerCase()

        //Update score
        mongoConnection.collection("users").updateOne({"userID": userID},{ $inc: { [win]: 1 }})
        .then(
            res => console.log(`Updated ${res.result.n} documents`),
            err => console.error(`Something went wrong: ${err}`),
        );
    })

    socket.on("flipCardDown",  data =>{
        socket.to(data.room).emit("oppFlipCardDown", data.cardsUp)
    })

    socket.on("endTurn", room =>{
        socket.to(room).emit("oppEndTurn")
    })



});


/////////////////////////////
// HTTP Requests
/////////////////////////////
//Health Check
app.get("/ping", (req, res) => {
  res.send('Pong!');
});


/////////////////////////////
// Server Listening
/////////////////////////////
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});