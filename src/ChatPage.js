import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import { useReactToPrint } from 'react-to-print';

const socket = io("https://chatxnode.onrender.com");

function ChatPage() {
  const { roomKey } = useParams();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [visibleMessages, setVisibleMessages] = useState(50);
  let [members, setMembers] = useState([]);
  let nav = useNavigate();
  const [messageInput, setMessageInput] = useState("");
  let leaveRoom = () => {
    socket.disconnect();
    nav("/", { replace: true });
  };
  const messageList = useRef(null);
  const scrollToBottom = () => {
   
    messageList?.current?.lastElementChild?.scrollIntoView({ behaviour: "smooth" });
  };
  useEffect(() => {
    socket.connect();

    // Listen for incoming messages
    socket.on(roomKey, (message) => {
      if (message.members) {
        setMembers(message.members);
      }
      setVisibleMessages(50)
      setMessages((prevMessages) => [...prevMessages, message]);
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
    });
    // Join the specified room when the component mounts
    socket.emit("join room", { roomKey, nickName: location.state.name });
  }, []);

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      socket.emit("chat message", {
        text: messageInput,
        room: roomKey,
        owner: location.state.name,
        type: "text",
        members: null,
        timeStamp: getFormattedTimestamp()
      });
      setMessageInput("");
    }
  };
  let copyToClipBoard = async () => {
    await navigator.clipboard.writeText(roomKey);
  };
  const loadMore = () => {
    // Increase the number of visible messages by 50
    setVisibleMessages(prev => prev + 50);
  };
  const messagesToShow = messages.slice(-visibleMessages);
  const handlePrint = useReactToPrint({
    content: () => messageList.current,
  })

   
  
                      
  function getFormattedTimestamp() {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
  
    const timestamp = new Date().toLocaleString('en-US', options);
    return timestamp;
  }
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
        <button className="leave-room-btn" onClick={()=>{
          setVisibleMessages(messages?.length);
          setTimeout(() => {
            handlePrint()  
          }, 100);
          
          }}>
          Export Chats
        </button>
        <h4 className="online-members">{`${members.length} Online`}</h4>
        
        <ul className="message-list" ref={messageList}>
  {messages.length > messagesToShow.length && <button id="load-more" className="leave-room-btn" onClick={loadMore}>
          Load More
        </button>}
          {messagesToShow.map((message, index) => {
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
                  <span className={`timestamp`}>{message?.timeStamp}</span>
                </li>
              );
            } else {
            }
          })}
          
        </ul>
        <div className="message-input-container">
          <input
            className="message-input"
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
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
