import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useParams } from "react-router-dom";
import Spline, { SplineEvent } from "@splinetool/react-spline";
import "../App.css";
import Avatar from "../components/avatar";
import { IChatMessage, Chatbox } from "../components/chatbox";
import { IStarfish, StarfishDiagram } from "../components/starfish";
import { Session } from "../types/dbTypes";

interface ChatProps {}

let fetchedConv = false;

const Chat = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  console.log(sessionId);
  const [textInput, setTextInput] = useState<string>("");
  const [starfishValues, setStarfish] = useState<IStarfish>({
    overall: [0, 0, 0, 0, 0],
    last: [0, 0, 0, 0, 0],
  });
  const starfishAttributes = [ "Clarity", "Relevance", "Depth of understanding", "Critical Thinking", "Communication", ];
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
      return { 
        gptResponse: postRes.data.gptResponse as string, 
        starfish: postRes.data.starfish as IStarfish,
      };
    }
    catch (error) {
      console.error('Error getting GPT response: ', error);
    }
  }

  const getSessionData = async () => {
    try {
      const res = await axios.get<Session | undefined>(`http://localhost:6969/session?sessionId=${sessionId}`);
      return res.data;
    }
    catch (error) {
      console.error('Error getting session data: ', error);
    }
  }

  useEffect(() => {
    if (chatMessages.length <= 1) {
      if (fetchedConv)
        return;

      getSessionData()
        .then(session => {
          fetchedConv = true;

          if (!session || session.conversation.length <= 1)
            return;
          
          const history = session.conversation.slice(1).map(msg => ({ 
            position: msg.role == 'system' ? 'left' : 'right',
            title: msg.role == 'system' ? 'Kiyo' : 'User',
            text: msg.content,
          }) as IChatMessage);

          const starfish : IStarfish = {
            overall: session.starfishResults.sum.map(sum => sum / session.starfishResults.count),
            last: [0, 0, 0, 0, 0],
          }

          setChatMessages(_ => history);
          setStarfish(_ => starfish)
        })

      return;
    }

    let lastMessage = chatMessages[chatMessages.length-1];

    if (lastMessage.title === "User") {
      console.log('requesting GPT response');

      getGptResponse(lastMessage.text)
        .then((res) => {          
          if (!res)
            return;

          const { gptResponse, starfish } = res;
          console.log('received GPT response:', gptResponse);
          console.log('received starfish values:', starfish);

          setChatMessages((prevState) => [
            ...prevState,
            {
              position: "left",
              title: "Kiyo",
              text: gptResponse || 'ERROR: Failed to get GPT Response',
            },
          ]);

          setStarfish(_ => starfish);
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

          <StarfishDiagram attributes={starfishAttributes} values={starfishValues}/>
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
