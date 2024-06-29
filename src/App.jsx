import React, { useEffect, useState } from "react";
import "./App.css";
import Sqaure from "./sqaure/Sqaure";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

// created an array which will have the matrrix of states for the tic tac toe

const renderForm = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

// start

const App = () => {
  const [gameState, setGameState] = useState(renderForm); //  to show or change the state of the matrix renderForm
  const [currentPlayer, setCurentPlayer] = useState("circle"); // to change the state of the palyer that is  change the player circle and cross
  const [winner, setWinner] = useState(false); // checks the winning condtino and the state of the user wh0 won
  const [finishedArrayState, setFinishedArrayState] = useState([]); //
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null); // it helps us to check whether oppent is bound? or found? or not
  const [playingAs, setPlayingAs] = useState(null); //it is used for toggling the turns with colors and stuff

  //row dynamic
  const checkwinner = () => {
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }
    //col dynamic

    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }
    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0];
    }
    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      return gameState[0][2];
    }

    const isDrawMatch = gameState.flat().every((e) => {
      if (e === "circle" || e === "cross") return true;
    });

    if (isDrawMatch) return "draw";

    return null;
  };

  useEffect(() => {
    const usewin = checkwinner();
    if (usewin) {
      setWinner(usewin);
    }
  }, [gameState]);

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your Name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });
    return result;
  };

  socket?.on("opponentLeftMatch",()=>{
    alert("opponent left the match ");
    setWinner("opponent left the match ");
  })

  socket?.on("playerMoveFromServer", (data) => {
   const id= data.state.id;
    setGameState((prevState) => {
      let newState = [...prevState];
      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = data.state.sign;

      return newState;
    });
    setCurentPlayer(data.state.sign === "circle" ? "cross" : "circle");
  });

  socket?.on("connect", function () {
    setPlayOnline(true);
  });
  socket?.on("opponentnotfound", function () {
    setOpponentName(false);
  });
  socket?.on("opponentfound", function (data) {
    setPlayingAs(data.playingAs);
    setOpponentName(data.opponentName);
  });

  // useEffect(() =>{
  //   if(socket && socket.connected){
  //     setPlayOnline(true);
  //   }
  // }, [socket]);

  async function playOnlineclick() {
    const result = await takePlayerName();

    if (!result.isConfirmed) {
      return;
    }

    const username = result.value;
    setPlayerName(username);

    const newSocket = io("http://localhost:3000", {
      autoConnect: true,
    });
    newSocket?.emit("request_to_play", {
      playerName: username,
    });

    setSocket(newSocket);
  }

  if (!playOnline) {
    return (
      <div className="main-div">
        <button onClick={playOnlineclick} className="playOnline">
          Play Online.....!!
        </button>
      </div>
    );
  }

  if (playOnline && !opponentName) {
    return (
      <div className="waiting">
        <p>Waiting for the opponent......</p>
      </div>
    );
  }

  return (
    <div className="main-div">
      <div className="move-detection">
        <div
          className={`left ${
            currentPlayer === playingAs ? `current-move-` + currentPlayer : ``
          }`}
        >
          {playerName}
        </div>
        <div
          className={`right ${
            currentPlayer !== playingAs ? `current-move-` + currentPlayer : ``
          }`}
        >
          {opponentName}
        </div>
      </div>
      <div>
        <h1 className="game-heading water-background">Tic Tac Toe</h1>
        <div className="sqaure-wrapper">
          {gameState.map((arr, rowIndex) =>
            arr.map((e, colIndex) => {
              return (
                <Sqaure
                  gameState={gameState}
                  socket={socket}
                  playingAs={playingAs}
                  finishedArrayState={finishedArrayState}
                  winner={winner}
                  // setWinner={setWinner}
                  currentPlayer={currentPlayer}
                  setCurentPlayer={setCurentPlayer}
                  setGameState={setGameState}
                  id={rowIndex * 3 + colIndex}
                  key={rowIndex * 3 + colIndex}
                  currentElement={e}
                />
              );
            })
          )}
        </div>
        {winner  && winner !== "draw" && (
          <h3 className="winner "> {winner} won the game </h3>
        )}
        {winner && winner == "draw" && (
          <h3 className="winner "> It's Draw match </h3>
        )}
      </div>
      {!winner && opponentName && (
        <h3 className="winner "> You are playing against {opponentName} </h3>
      )}
    </div>
  );
};

export default App;
