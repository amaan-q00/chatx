import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("https://chatxnode.onrender.com");

function ChatPage() {
  const { roomKey } = useParams();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  let [members, setMembers] = useState([]);
  let nav = useNavigate();
  const [messageInput, setMessageInput] = useState("");
  let leaveRoom = () => {
    socket.disconnect();
    nav("/", { replace: true });
  };
  const messageList = useRef(null);
  const scrollToBottom = () => {
    document
      .querySelector("#myscroller")
      .scrollIntoView({ behaviour: "smooth" });
    // console.log(messageList);
    // messageList.current.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    socket.connect();

    // Listen for incoming messages
    socket.on(roomKey, (message) => {
      if (message.members) {
        setMembers(message.members);
      }
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    });
    // Join the specified room when the component mounts
    socket.emit("join room", { roomKey, nickName: location.state.name });
    scrollToBottom();
  }, []);

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      socket.emit("chat message", {
        text: messageInput,
        room: roomKey,
        owner: location.state.name,
        type: "text",
        members: null,
      });
      setMessageInput("");
    }
  };
  let copyToClipBoard = async () => {
    await navigator.clipboard.writeText(roomKey);
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <h2
          className="chat-header"
          title="Click to Copy"
          onClick={copyToClipBoard}
        >
          Chat Room: {roomKey}{" "}
          <button className="copy-btn" onClick={copyToClipBoard}>
            Click to Copy
          </button>
        </h2>
        <button className="leave-room-btn" onClick={leaveRoom}>
          LEAVE ROOM
        </button>
        <h4 className="online-members">{`${members.length} Online`}</h4>
        <ul className="message-list">
          {messages.map((message, index) => {
            if (message.type == "info") {
              return (
                <li key={index} className={`info-message-item message-item`}>
                  <span className={`info-message-text`}>{message.text}</span>
                </li>
              );
            } else if (message.type == "text") {
              return (
                <li
                  key={index}
                  className={`${
                    message?.owner == location.state.name
                      ? "self-owner-message-item"
                      : "other-owner-message-item"
                  } message-item`}
                >
                  {message.owner !== location.state.name && (
                    <span
                      className={`message-owner`}
                    >{`${message.owner}`}</span>
                  )}
                  <span className={`text-message-text`}>{message.text}</span>
                </li>
              );
            } else {
            }
          })}
          <div id="myscroller" ref={messageList}>
            {" "}
          </div>
        </ul>
        <div className="message-input-container">
          <input
            className="message-input"
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button className="send-btn" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
export default ChatPage;
