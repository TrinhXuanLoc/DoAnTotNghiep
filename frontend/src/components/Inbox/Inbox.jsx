import React, { useEffect, useState } from "react";
import { AiOutlineMessage, AiOutlineClose } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as ConventionService from "../../service/conventionService";
import * as UserService from "../../service/userService";
import "../../assets/css/fade.css";
import socketIO from "socket.io-client";
import * as MessageService from "../../service/messageService";
import * as timeago from "timeago.js";
import { AiOutlineSend } from "react-icons/ai";
import { BsImages } from "react-icons/bs";
const ENDPOINT = "http://localhost:8000/";
const socketId = socketIO(ENDPOINT, {
  transport: ["websocket"],
  withCredentials: true,
});
function Inbox() {
  const { account, isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [listUser, setListUser] = useState(null);

  useEffect(() => {
    socketId.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createAt: data.now,
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);
  const createMessageHandler = async () => {
    const message = {
      sender: account._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    const receiverId = currentChat.members.find(
      (member) => member._id === account._id
    );
    socketId.emit("sendMessage", {
      senderId: account._id,
      receiverId,
      text: newMessage,
    });
    try {
      if (newMessage !== "") {
        await MessageService.createMessage(message)
          .then((res) => {
            setMessages([...messages, res.message]);
            updateLastMessage();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } catch (err) {
      console.log("err", err);
    }
  };
  //get message
  const getMessage = async () => {
    if (currentChat) {
      const res = await MessageService.getAllMessage(currentChat?._id);
      if (res.success) {
        setMessages(res.message);
      }
    }
  };
  useEffect(() => {
    getMessage();
  }, [currentChat]);

  //update last message
  const updateLastMessage = async () => {
    socketId.emit("updateLastMessage", {
      lastMessage: newMessage,
      lastMessageId: account._id,
    });
    const data = {
      lastMessage: newMessage,
      lastMessageId: account._id,
    };
    await MessageService.UpdateMessage(currentChat._id, data);
  };
  const handleMessageSubmit = async () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      const message = {
        groupTitle: account._id + "64ed97e2a41b317df2d04bbf",
        userId: account._id,
        AdminId: "64ed97e2a41b317df2d04bbf",
      };

      const res = await ConventionService.createConversation(message);
      if (res.success) {
        setCurrentChat(res.conversation);
        setIsModalOpen(true);
      }
    }
  };
  useEffect(() => {
    const userId = currentChat?.members.find((user) => user !== account._id);
    const getUser = async () => {
      try {
        const res = await UserService.getUserById(userId);
        if (res.success) {
          setListUser(res.user);
        }
      } catch (e) {
        console.log(e);
      }
    };

    getUser();
  }, [currentChat, account]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="">
      <div className="fixed bottom-10 z-50 right-5 ">
        {isModalOpen ? (
          <div
            className="cursor-pointer border rounded-full p-2 bg-[#009b49]"
            onClick={handleCloseModal}
          >
            <AiOutlineClose className="text-[42px] text-white fadeIn" />
          </div>
        ) : (
          <div
            className="cursor-pointer border rounded-full p-2 bg-[#009b49]"
            onClick={handleMessageSubmit}
          >
            <AiOutlineMessage className="text-[42px] text-white fadeIn" />
          </div>
        )}
      </div>
      {isModalOpen && (
        <InboxForm
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          createMessageHandler={createMessageHandler}
          messages={messages}
          listUser={listUser}
          sellerId={account._id}
        />
      )}
    </div>
  );
}
const InboxForm = ({
  newMessage,
  setNewMessage,
  createMessageHandler,
  messages,
  sellerId,
  listUser,
}) => {
  const animation = {};
  return (
    <div
      className="fixed bottom-2 z-50 right-24 bg-white w-[280px] rounded fadeIn min-h-[48vh]"
      style={animation}
    >
      <div className="flex shadow  p-2">
        <img
          src={listUser?.avatar.url}
          alt=""
          className="w-[40px] h-[40px] object-cover rounded-full "
        />
        <div className="px-2">
          <h1 className="font-[600]">{listUser?.name}</h1>
        </div>
      </div>
      <div className="px-3 h-[34vh]  overflow-y-scroll ">
        {messages?.map((item, index) => {
          return (
            <div
              key={index}
              className={`w-full flex my-2 ${
                item.sender === sellerId ? "justify-end" : "justify-start"
              } `}
            >
              {item.sender !== sellerId && (
                <img
                  src={listUser?.avatar.url}
                  alt=""
                  className="w-[30px] h-[30px] rounded-full mr-2"
                />
              )}
              <div className="flex flex-col">
                <div
                  className={`w-max px-2 py-1 rounded-[8px] ${
                    item.sender !== sellerId
                      ? "bg-[#ccc] text-black"
                      : "bg-[#0866ff] text-white"
                  }`}
                >
                  <p>{item.text}</p>
                </div>
                <p className="text-[10px]">{timeago.format(item.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <div className="w-[15%] flex justify-center items-center cursor-pointer">
          <input
            type="file"
            name=""
            id="image"
            className="hidden"
            // onChange={handleImageUpload}
          />
          <label htmlFor="image">
            <BsImages className="text-[20px] text-[#5b5b5b]" />
          </label>
        </div>
        <input
          type="text"
          value={newMessage}
          className="w-[70%] px-2 h-auto my-1 p-1 border-[2px] rounded-[8px] outline-none"
          placeholder="Aa"
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          className="cursor-pointer w-[15%]"
          disabled={newMessage.trim() === ""}
          onClick={createMessageHandler}
        >
          <AiOutlineSend className="text-[20px] mx-2" />
        </button>
      </div>
    </div>
  );
};
export default Inbox;