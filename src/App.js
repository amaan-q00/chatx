import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";
import ChatPage from "./ChatPage";
import "./App.css";

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
        <Route path="/" exact element={<CreateRoomPage />} />
        <Route path="/chat/:roomKey" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
