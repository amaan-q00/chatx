import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";
import ChatPage from "./ChatPage";
import "./App.css";
import io from "socket.io-client";

// const socket = io("https://chatxnode.onrender.com");
const socket = io(
  // "http://localhost:3001/",
  "https://chatxnode.onrender.com",
  {
  maxHttpBufferSize: 1e8 // 100 MB
});


function App() {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const message = "Refreshing will clear all data?";
      event.returnValue = message;
      return message;
    };

    // Attach the event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<CreateRoomPage socket={socket}/>} />
        <Route path="/chat/:roomKey" element={<ChatPage socket={socket}/>} />
      </Routes>
    </Router>
  );
}

export default App;
