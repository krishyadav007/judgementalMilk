"use client";
import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import ReactMarkdown from 'react-markdown';
import "./globals.css";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [priority, setPriority] = useState({});
  const [message, setMessage] = useState("");
  const [editingChat, setEditingChat] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Idle");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [editedEndDate, setEditedEndDate] = useState("");
  const [editedStatus, setEditedStatus] = useState("");
  const [sortOption, setSortOption] = useState("Priority");
  const [mode, setMode] = useState("task");


  useEffect(() => {
    fetch("/api/chats")
      .then((res) => res.json())
      .then((data) => {
        setChats(data);
        const priorities = {};
        data.forEach((chat) => {
          priorities[chat.id] = chat.priority;
        });
        setPriority(priorities);
      });
  }, []);

  const addChat = () => {
    fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((newChat) => {
        setChats([...chats, newChat]);
        setPriority({ ...priority, [newChat.id]: newChat.priority });
        setActiveChat(newChat.id);
      });
  };

  const sendMessage = () => {
    if (activeChat && message.trim() !== "") {
      console.log(message, endDate, status);
      fetch(`/api/chats/${activeChat}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message, endDate, status }),
      })
        .then((res) => res.json())
        .then((updatedChat) => {
          setChats(
            chats.map((chat) =>
              chat.id === activeChat ? updatedChat : chat
            )
          );
        });
      setMessage("");
      setEndDate("");
      setStatus("Normal");
      setMode("text");
    }
  };

  const deleteMessage = (chatId, messageId) => {
    fetch(`/api/chats/messages/${chatId}/${messageId}`, {
      method: "DELETE",
    }).then((res) => res.json())
      .then((updatedChat) => {
        setChats(
          chats.map((chat) =>
            chat.id === chatId ? updatedChat : chat
          )
        );
      });
  };

  const updatePriority = (chatId, newPriority) => {
    fetch(`/api/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: newPriority }),
    }).then(() => {
      setPriority({ ...priority, [chatId]: newPriority });
    });
  };

  const startEditingChat = (chatId, currentName) => {
    setEditingChat(chatId);
    setEditedName(currentName);
  };

  const saveChatName = (chatId) => {
    fetch(`/api/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editedName }),
    }).then(() => {
      setChats(
        chats.map((chat) =>
          chat.id === chatId ? { ...chat, name: editedName } : chat
        )
      );
      setEditingChat(null);
      setEditedName("");
    });
  };

  const startEditingMessage = (message) => {
    setEditingMessage(message.id);
    setEditedText(message.text || "")
    setEditedEndDate(message.endDate || "");
    setEditedStatus(message.status || "");
  };

  const saveMessageEdit = (chatId, messageId) => {
    fetch(`/api/chats/messages/${chatId}/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editedText, endDate: editedEndDate, status: editedStatus }),
    }).then((res) => res.json())
      .then((updatedChat) => {
        setChats(
          chats.map((chat) =>
            chat.id === chatId ? updatedChat : chat
          )
        );
      });
    setEditingMessage(null);
    setEditedEndDate("");
    setEditedStatus("");
  };

  const sortMessages = (messages) => {
    if (sortOption === "Priority") {
      return messages.sort((a, b) => {
        const priorityOrder = { High: 3, Normal: 2, Low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } else if (sortOption === "End Date") {
      return messages.sort((a, b) => {
        return new Date(a.endDate || "9999-12-31") - new Date(b.endDate || "9999-12-31");
      });
    }
    return messages;
  };

  const linkMessageToChatroom = (chatId, messageId) => {
    // UPDATE HERE
    fetch(`/api/chats/messages/${chatId}/${messageId}/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((updatedChat) => {
        // console.log(updatedChat);
        setChats([...updatedChat]);
      });
  };

  const deleteChatroom = (chatId) => {
    fetch(`/api/chats/${chatId}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then(() => {
        setChats(chats.filter((chat) => chat.id !== chatId));
        setActiveChat(null); // Reset active chat if it was deleted
      });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r">
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold">CSIF</h1>
          <button
            onClick={addChat}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create thread
          </button>
        </div>
        <div className="overflow-y-auto h-full">
          {console.log("Running chat", chats)}
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={clsx(
                "p-4 cursor-pointer flex justify-between items-center",
                activeChat === chat.id ? "bg-blue-100" : "hover:bg-gray-100"
              )}
            >
              <div>
                {editingChat === chat.id ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={() => saveChatName(chat.id)}
                    className="border-b-3 border-zinc-900/50 rounded px-2 py-1"
                  />
                ) : (
                  <h2
                    className="font-medium"
                    onDoubleClick={() => startEditingChat(chat.id, chat.name || `Chat ${chat.id}`)}
                  >
                    {chat.name || `Chat ${chat.id}`}
                  </h2>
                )}
                <span className="text-sm text-gray-500">Priority: {priority[chat.id]}</span>
                <span className="ml-2 text-sm  text-gray-500">
                  ({chat.messages?.filter((msg) => msg.status === "Completed").length || 0} / {(chat.messages.length) - (chat.messages?.filter((msg) => msg.status === "Normal")).length || 0})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-3/4 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {chats.find((chat) => chat.id === activeChat)?.name || `Thread: ${activeChat}`}
              </h2>
              <span className="text-sm text-gray-500">Priority: {priority[activeChat]}</span>
            </div>
            <div className="p-4 border-b items-stretch flex">
              <label htmlFor="sort" className="mr-2 font-medium text-gray-700">Sort By:</label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border-b-3 border-zinc-900/50 rounded px-2 py-1"
              >
                <option value="Priority">Priority</option>
                <option value="End Date">End Date</option>
              </select>
              <label htmlFor="setPriority" className="mr-2 font-medium text-gray-700">Set:</label>
              <select
                id="setPriority"
                value={priority[activeChat]}
                onChange={(e) => updatePriority(activeChat, e.target.value)}
                className="border-b-3 border-zinc-900/50 rounded px-2 py-1 inline-block"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
              <button
                onClick={() => deleteChatroom(activeChat)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 inline-block"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {sortMessages(
                chats.find((chat) => chat.id === activeChat).messages
              ).map((message, index) => (
                <div
                  key={index}
                  className={clsx(
                    "mb-2 p-2 rounded-md max-w-xs flex",
                    !message.endDate ? "bg-blue-200 text-blue-800" : 
                    new Date(message.endDate) < new Date() ? "bg-red-200 text-red-800" :
                    new Date(message.endDate) <= new Date(new Date().setDate(new Date().getDate() + 2)) ? "bg-yellow-200 text-yellow-800" :  "bg-gray-200 text-gray-800"
                  )}
                >
                  {editingMessage === message.id ? (
                    <div>
                      <input
                        type="text"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="border-b-3 border-zinc-900/50 rounded px-2 py-1 mb-2"
                      />
                      {message.status !== "Normal" && (
                      <>
                        <input
                        type="date"
                        value={editedEndDate}
                        onChange={(e) => setEditedEndDate(e.target.value)}
                        className="border-b-3 border-zinc-900/50 rounded px-2 py-1 mr-2"
                      />
                      <select
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value)}
                        className="border-b-3 border-zinc-900/50 rounded px-2 py-2 mb-1"
                      >
                        <option value="Idle">Idle</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                      </select>
                      </>
                    )}
                      <button
                        onClick={() => saveMessageEdit(activeChat, message.id)}
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                    <div className="w-1/10 flex flex-col justify-center items-center pr-1 border-r-2">
                      <button className="mb-1" onClick={() => message.linkedChatroomId? setActiveChat(message.linkedChatroomId) : linkMessageToChatroom(activeChat, message.id) }>
                      { message.linkedChatroomId? <i className="bi bi-journal-text"></i> : <i className="bi bi-journal-plus"></i> }
                      </button>
                      <button className="mb-1" onClick={() => startEditingMessage(message)}><i className="bi bi-pencil-square"></i></button>
                      <button className="mb-1" onClick={() => deleteMessage(activeChat, message.id)}><i className="bi bi-trash-fill"></i></button>
                    </div>

                    <div className="w-9/10 pl-3">
                    <ReactMarkdown className="prose">{message.text}</ReactMarkdown>
                    {message.status !== "Normal" && (
                      <>
                        <p className="text-sm text-gray-500">End Date: {message.endDate || "N/A"}</p>
                        <p className="text-sm text-gray-500">Status: {message.status}</p>
                      </>
                    )}
                    </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex items-center gap-2">
            <button
              onClick={() => {setStatus(mode === "text" ? "Idle" : "Normal");setMode(mode === "text" ? "task" : "text");console.log(mode,status);}}
              className="h-10 w-10 bg-gray-300 rounded-full hover:bg-gray-400 text-sm"
            >
            {mode === "text" ? <i className="bi bi-list-task"></i> : <i className="bi bi-chat-left-fill"></i>}
            </button>

            {/* Message Input */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={mode === "text" ? "Type a message" : "Enter task details"}
              className="border-b-3 border-zinc-900/50 rounded px-2 h-20 flex-1"
            />

            {/* Send Button */}
            <button
              onClick={sendMessage}
              className="px-4 h-10 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {mode === "text" ? "Send Msg" : "Add Task"}
            </button>
          </div>
          </>
        ) : (
          <div className="flex flex-1 justify-center items-center">
            <h2 className="text-gray-500 text-lg">Select or create a chat to start messaging.</h2>
          </div>
        )}
      </div>
    </div>
  );
}
