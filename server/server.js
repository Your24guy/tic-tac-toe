// import { createServer } from "http";
// import { Server } from "socket.io";

const { log } = require("console");
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: "http://localhost:5173/",
});

const allusers = {};
const allRooms=[];

io.on("connection", (socket) => {

  

  // console.log(socket);
  allusers[socket.id] = {
    socket: socket,
    online: true,
  };

  socket.on("request_to_play", (data) => {
    const currentUser = allusers[socket.id];
    currentUser.playerName = data.playerName;
    console.log(currentUser);

    let opponentPlayer;

    for (const key in allusers) {
      const user = allusers[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;

        break;
      }
    }

    if (opponentPlayer) {

      allRooms.push(
        {
          player1:opponentPlayer,
          player2:currentUser,
        }
      )


      opponentPlayer.socket.emit("opponentfound", {
        opponentName: currentUser.playerName,
        playingAs: "circle",
      });
      currentUser.socket.emit("opponentfound", {
        opponentName: opponentPlayer.playerName,
        playingAs: "cross",
      });

      currentUser.socket.on("playerMoveFromClient",(data)=>{
        opponentPlayer.socket.emit("playerMoveFromServer",{
         ...data
        })
      })
      opponentPlayer.socket.on("playerMoveFromClient",(data)=>{
        currentUser.socket.emit("playerMoveFromServer",{
        ...data
        })
      })
      // if (currentUser.playerName && opponentPlayer.playerName) {
      //   console.log("opponent found");
      //   currentUser.playing = true;
      // You can add code here to connect the two players and start the game
    } else {
      // console.log("no opponent found");
      // currentUser.playing = false;
      currentUser.socket.emit("opponentnotfound");
    }
  });

  socket.on("disconnect", function () {
    // allusers[socket.id] = {
    //   socket: { ...socket, online: false },
    //   online: true,
    const currentUser = allusers[socket.id];
    currentUser.online = false;
    currentUser.playing = false;

    for (let index = 0; index < allRooms.length; index++) {
      const {player1,player2} = allRooms[index];

      if(player1.socket.id === socket.id){
        player2.socket.emit("opponentLeftMatch")
        break;
      }

      if(player2.socket.id === socket.id)
        {
          player1.socket.emit("opponentLeftMatch")
          break;
        }
      
    }
  });
});

httpServer.listen(3000);
