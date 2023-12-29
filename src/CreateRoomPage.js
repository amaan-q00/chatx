import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

// const socket = io("https://chatxnode.onrender.com");
const socket = io("http://localhost:3001/");

function CreateRoomPage() {
  const [roomKey, setRoomKey] = useState("");
  const nav = useNavigate();
  useEffect(() => {
    socket.on("room created", ({ key, nickName }) => {
      nav(`/chat/${key}`, { state: { name: nickName }, replace: true });
    });
  }, []);

  const createRoom = () => {
    let prompt = window.prompt("NickName: ");
    socket.emit("create room", prompt);
  };

  const joinRoom = () => {
    let prompt = window.prompt("NickName: ");
    nav(`/chat/${roomKey}`, { state: { name: prompt }, replace: true });
  };

  return (
    <div className="create-room-wrapper">
      <div className="create-room-container">
        <button className="create-room-btn" onClick={createRoom}>
          Create Room
        </button>
        <div className="separator">--OR--</div>
        <input
          className="room-key-input"
          type="text"
          placeholder="Enter Room Key"
          value={roomKey}
          onChange={(e) => setRoomKey(e.target.value)}
        />
        <div className="butto-wrapper">
          <button className="join-room-btn" onClick={joinRoom}>
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomPage;
