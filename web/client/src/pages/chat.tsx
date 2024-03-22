import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useParams } from "react-router-dom";
import Spline, { SplineEvent } from "@splinetool/react-spline";
import "../App.css";
import Avatar from "../components/avatar";
import { IChatMessage, Chatbox } from "../components/chatbox";

interface ChatProps {}

const Chat = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  console.log(sessionId);
  const [textInput, setTextInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<IChatMessage[]>([
    {
      position: "left",
      title: "Kiyo",
      text: "Hello I am Kiyo, your AI mock interview assistant. Nice to meet you!",
    },
  ]);

  const getGptResponse = async (userMessage: string) => {
    try {
      const postRes = await axios.post("http://localhost:6969/getResponse", { sessionId, userMessage, });
      const gptResponse = postRes.data.response as string;
      return gptResponse;
    }
    catch (error) {
      console.error('Error getting GPT response: ', error);
    }
  }

  useEffect(() => {
    if (chatMessages.length === 0) return;

    let lastMessage = chatMessages[chatMessages.length-1];

    if (lastMessage.title === "User") {
      console.log('requesting GPT response');

      getGptResponse(lastMessage.text)
        .then((gptResponse) => {          
          console.log('received GPT response:', gptResponse);

          setChatMessages((prevState) => [
            ...prevState,
            {
              position: "left",
              title: "Kiyo",
              text: gptResponse || 'ERROR: Failed to get GPT Response',
            },
          ]);
        })
        .catch(console.error);
    }
  }, [chatMessages]);
 
  const addSelfMsg = (text: string) => {
    setChatMessages((prevState) => [
      ...prevState,
      {
        position: "left",
        title: "Kiyo",
        text,
      },
    ]);
  };

  const addUserMsg = (text: string, person: string) => {
    setChatMessages((prevState) => [
      ...prevState,
      {
        position: "right",
        type: "text",
        title: "User",
        text,
        avatar: person,
      },
    ]);
  };

  const handleChat = () => {
    if (!textInput) return;
    
    setChatMessages((prevState) => [
      ...prevState,
      {
        position: "right",
        title: "User",
        text: textInput,
      },
    ]);

    setTextInput("");
  };

  if (!sessionId) {
    return <p>Session ID is undefined. Please provide a valid session ID.</p>;
  }

  return (
    <div className="container">
      <div className="row" style={{ position: "absolute", width: "100%" }}>
        <div className="half-container-chat col">
          <div className="unity-container">
            <div className="unity-inner">
              <div className="unity-component">
                <Avatar />
              </div>
            </div>
          </div>
          <Spline
            scene="https://draft.spline.design/aCWrFD3SWSwK0JbW/scene.splinecode"
            style={{
              marginTop: 20,
              maxHeight: 100,
            }}
            onMouseDown={(e: SplineEvent) => {
              console.log(e.target);
            }}
          />

          <div className="row" style={{ gap: 100 }}>
            <div className="col" style={{ maxWidth: "300px" }}>
              <h1>Objective</h1>
              <div className="summary">
                {`Systems Engineer role for Tesla Bot
                    Focus on manufacturing processes and equipment development
                    Collaborate in product lifecycle, from concept through production
                    Requires new product launch and project leadership experience
                    Role based in Palo Alto, CA; full-time position
                    Offers competitive salary, benefits from day 1, including medical, dental, vision, 401(k), and stock purchase plans
                    Salary range: $84,000 - $324,000 annually, plus benefits and stock awards`}
              </div>
            </div>
            <div className="col" style={{ maxWidth: "300px" }}>
              <h1>What We're Practicing</h1>
              <div className="summary">{`Clearly articulating your thoughts.
Asking clarifying questions.
Structuring your answers logically.
Showing enthusiasm and confidence.
Managing your time effectively for each question.
Demonstrating problem-solving skills.
Expressing your interest in the role and company.`}</div>
            </div>
          </div>
        </div>
        <div className="half-container-chat col">
          <h1>Conversation</h1>

          <div className="chat-inner">
            <div className="align-end">
              <Chatbox messages={chatMessages} />
              <div className="chat-input-row">
                <div>
                  <input
                    className="input-field"
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Text Something..."
                  />
                </div>
                <div>
                  <button className="btn" onClick={handleChat}>
                    <h1>Send</h1>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Spline
        scene="https://prod.spline.design/ShG0OYv1Wdx6-qhe/scene.splinecode"
        style={{
          width: "100%",
          margin: -10,
          opacity: "20%",
        }}
      />
    </div>
  );
};

export default Chat;
