import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import SocketIOFileUpload from "socketio-file-upload"
function ChatPage({socket}) {

  const { roomKey } = useParams();
  const location = useLocation();
  let uploadRef=useRef()
  let [uploadProgress,setUploadProgress]=useState(false)
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
    messageList?.current?.lastElementChild?.scrollIntoView({
      behaviour: "smooth",
    });
  };
  // useEffect(() => {
  //   var uploader = new SocketIOFileUpload(socket);
  //   if(uploadRef){
  //     uploader.listenOnInput(uploadRef?.current);
  //   }
  //   uploader.addEventListener("progress", function(event){
  //     var percent = event.bytesLoaded / event.file.size * 100;
  //     console.log("File is", percent.toFixed(2), "percent loaded");
  // });

  // // Do something when a file is uploaded:
  // uploader.addEventListener("complete", function(event){
  //   setUploadProgress(null)
  //     // console.log(event.success);
  //     // console.log(event.file);
  // });
  //   // return () => {
      
  //   // }
  // }, [uploadRef])
  
  useEffect(() => {
    socket.connect();
    
    // Listen for incoming messages
    socket.on(roomKey, (message) => {
      if (message.members) {
        setMembers(message.members);
      }
      setVisibleMessages(50);
      setMessages((prevMessages) => [...prevMessages, message]);
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    // socket.on("upload.progress",({percentage})=>{
    //   setUploadProgress(percentage)
    // })
    // Join the specified room when the component mounts
    socket.emit("join room", { roomKey, nickName: location.state.name });
    
  }, []);
  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      let chatMsgObj = {
        text: messageInput,
        room: roomKey,
        owner: location.state.name,
        type: "text",
        members: null,
        timeStamp: getFormattedTimestamp(),
      };
      setMessageInput("");
      socket.emit("chat message", chatMsgObj);
    }
  };
  const handleImageUpload = (e) => {
    let file=e.target.files[0]
    
    if (file) {
      if(uploadRef?.current){

        uploadRef.current.style="display:block;"
        scrollToBottom()
      }
      
      let chatMsgObj = {
        text: file,
        room: roomKey,
        owner: location.state.name,
        type: "image",
        members: null,
        timeStamp: getFormattedTimestamp(),
      };

      const reader = new FileReader();
      // reader.onprogress = (e) => {
      //   setUploadProgress(true)
      // };
      reader.onloadend = () => {
        // setUploadProgress(false)
        chatMsgObj.text = reader.result;
      };

      reader.readAsDataURL(file);
      socket.emit("chat message", chatMsgObj);
    }
  };

  let copyToClipBoard = async () => {
    await navigator.clipboard.writeText(roomKey);
  };
  const loadMore = () => {
    // Increase the number of visible messages by 50
    setVisibleMessages((prev) => prev + 50);
  };
  const messagesToShow = messages.slice(-visibleMessages);
  const handlePrint = useReactToPrint({
    content: () => messageList.current,
  });
  const renderBufferAsImage = (buffer) => {
    // if(!uploadProgress){

    //   setUploadProgress(true)
    // }
    let base64String=btoa(new Uint8Array(buffer).reduce(function (data, byte) {
      return data + String.fromCharCode(byte);
  }, ''));
    // const uint8Array = new Uint8Array(buffer);
    // const base64String = btoa(String.fromCharCode.apply(null, uint8Array));
    if(uploadRef?.current){

      uploadRef.current.style="display:none;"
    }
    return `data:image/png;base64,${base64String}`;
  };
  
  function getFormattedTimestamp() {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const timestamp = new Date().toLocaleString("en-US", options);
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
        <button
          className="leave-room-btn"
          onClick={() => {
            setVisibleMessages(messages?.length);
            setTimeout(() => {
              handlePrint();
            }, 100);
          }}
        >
          Export Chats
        </button>
        <h4 className="online-members">{`${members.length} Online`}</h4>

        <ul className="message-list" ref={messageList}>
          {messages.length > messagesToShow.length && (
            <button
              id="load-more"
              className="leave-room-btn"
              onClick={loadMore}
            >
              Load More
            </button>
          )}
         
         
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
            } else if (message.type === "image") {
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
                  <img
                    src={renderBufferAsImage(message.text)}
                    className="text-message-image"
                    alt="Image"
                  />
                  <span className={`timestamp`}>{message?.timeStamp}</span>
                </li>
              );
            } else {
            }
          })}
            {<li className={`info-message-item message-item`} ref={uploadRef} style={{display:"none"}}>
                  <span className={`info-message-text`}>Uploading...</span>
                </li>}
        </ul>
       
        <div className="message-input-container">
          <label className="img-btn">
            <input
            // ref={uploadRef}
            // id="siofu_input"
              className="img-btn-picker"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            🖼️
          </label>
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
            send
          </button>
        </div>
      </div>
    </div>
  );
}
export default ChatPage;
