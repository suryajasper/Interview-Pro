import React, { useRef } from "react";
import { MessageList, MessageType } from "react-chat-elements";
import "react-chat-elements/dist/main.css";
import "../App.css";
import { user, me } from "../assets";
export interface IChatMessage {
  position: "left" | "right";
  title: string;
  text: string;
  avatar?: string;
}
interface ChatboxProps {
  messages: IChatMessage[];
}

export const Chatbox: React.FC<ChatboxProps> = ({ messages }) => {
  const messageListReference = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={messageListReference}
      style={{
        marginTop: "20px",
        height: "auto",
        minHeight: "calc(80vh - 50px)",
        alignSelf: "flex-end",
      }}>
      {messages.map((message) => {
        return (
          <div
            style={{
              display: "flex",
              width: "auto",
              flexWrap: "wrap",
              justifyContent: message.position,
              padding: 20,
            }}>
            <div className="chat-bubble">
              {message.position === "left" ? (
                <>
                  <img src={me} />
                  <h2>{message.text}</h2>
                </>
              ) : (
                <>
                  <h2>{message.text}</h2>
                  <img src={user} />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
