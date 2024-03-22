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
  inProgress?: boolean;
}
interface ChatboxProps {
  messages: IChatMessage[];
}

export const Chatbox: React.FC<ChatboxProps> = ({ messages }) => {
  const messageListReference = useRef<HTMLDivElement>(null);

  const breakText = (text: string) => {
    const boldRegex = /(?:<b>(.*?)<\/b>)|(?:\*\*(.*?)\*\*)/g;
  
    const parts = text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line.split(boldRegex).map((part, index) =>
          boldRegex.test(part) ? (
            <strong key={index}>{part.replace(/<\/?b>/g, '')}</strong>
          ) : (
            part
          )
        )}
        <br />
      </React.Fragment>
    ));
  
    return parts;
  };

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
            {message.position === "left" ? (
              <div className="chat-bubble-left">
                <img src={me} />
                <h2>{breakText(message.text)}</h2>
              </div>
            ) : (
              <div className="chat-bubble-right">
                <h2>{breakText(message.text)}</h2>
                <img src={user} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
