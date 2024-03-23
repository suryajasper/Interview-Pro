
import React, { useEffect, useState, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import { useParams } from "react-router-dom";
import Spline, { SplineEvent } from "@splinetool/react-spline";
import "../App.css";
import Avatar from "../components/avatar";
import { IChatMessage, Chatbox } from "../components/chatbox";
import { audioGen } from "../utils/audiogen";
import { IStarfish, StarfishDiagram } from "../components/starfish";
import { Session } from "../types/dbTypes";

interface AvatarRef {
  sendUnityMessage(
    gameObject: string,
    methodName: string,
    value: string | undefined
  ): void;
}

const MAX_SPEECH_TIME_IN_SECONDS = 45;

let listeningGlobal = false;
let fetchedConv = false;
let chatTerminationTimeout : ReturnType<typeof setTimeout>;

const Chat = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  
  const [isTalking, setIsTalking] = useState(true);
  const avatarRef = useRef<AvatarRef>(null);
  console.log(sessionId);
  
  const [textInput, setTextInput] = useState<string>("");
  const [interviewOver, setInterviewOver] = useState<boolean>(false);
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
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

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
  };

  const getSessionData = async () => {
    try {
      const res = await axios.get<Session | undefined>(`http://localhost:6969/session?sessionId=${sessionId}`);
      return res.data;
    }
    catch (error) {
      console.error('Error getting session data: ', error);
    }
  }

  const getAnalysis = async () => {
    try {
      const res = await axios.get<{analysis: string}>(`http://localhost:6969/getAnalysis?sessionId=${sessionId}`);
      return res.data;
    }
    catch (error) {
      console.error('Error getting analysis data: ', error);
    }
  }

  const endInterview = () => {
    setInterviewOver(_ => true);

    getAnalysis()
      .then(res => {
        if (!res)
          return;

        setChatMessages(prevState => [
          ...prevState,
          {
            position: "left",
            title: "Kiyo",
            text: res.analysis || 'ERROR: Failed to get analysis',
          },
        ])
      })
      .catch(console.error)
  }

  useEffect(() => {
    if (chatMessages.length > 0)
      console.log('UPDATE TO CONVERSATION', listening, chatMessages[chatMessages.length-1]);
    if (listening)
      return;

    if (chatMessages.length <= 1) {
      if (fetchedConv)
        return;

      getSessionData()
        .then(session => {
          fetchedConv = true;

          if (!session || session.conversation.length <= 1) {
            setTextInput(_ => "Hi my name is __name__. I'm ready to begin!");
            return;
          }
          
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
    if (lastMessage.inProgress)
      return;

    if (lastMessage.title === "User" && !lastMessage.requestedResponse) {
      console.log("requesting GPT response");
      lastMessage.requestedResponse = true;

      getGptResponse(lastMessage.text)
        .then((res) => {          
          if (!res)
            return;

          setTextInput(_ => "");

          let { gptResponse, starfish } = res;
          console.log('received GPT response:', gptResponse);
          console.log('received starfish values:', starfish);

          let ending = false;
          if (gptResponse.includes('<end_interview>')) {
            ending = true;
            gptResponse = gptResponse.replaceAll('<end_interview>', '');
          }

          setChatMessages((prevState) => [
            ...prevState,
            {
              position: "left",
              title: "Kiyo",
              text: gptResponse || "ERROR: Failed to get GPT Response",
            },
          ]);

          sendAudio(gptResponse);

          setStarfish(_ => starfish);

          if (ending)
            endInterview();
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
  
  const sendAudio = (text: string) => {
    setIsTalking(_ => true);
    audioGen(text)
      .then((audio) => {
        sendMessage("Lipsync", "ReceiveAudio", JSON.stringify(audio));
      })
      .catch((err) => {
        console.error("Error generating audio:", err);
      });
  };
  
  const sendMessage = (
    object: string,
    func: string,
    value: string | undefined = undefined
  ) => {
    avatarRef.current?.sendUnityMessage(object, func, value);
  };
  
  const fetchUnityData = (key: string, value: any) => {
    console.log(`unity response: ${key}=${value}`);
    eval(key)(value);
    if (key === "setIsTalking")
      setIsTalking(_ => value as boolean);
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

  useEffect(() => {
    console.log(`Transcript or listening update: transcript=${transcript}, listening=${listening}`)
    setChatMessages((oldConv) => {
      let conv = [...oldConv];

      if (conv[conv.length-1].inProgress) {
        if (listening)
          conv[conv.length-1].text = transcript;
        else
          conv[conv.length-1].inProgress = false;
      } 
      else if (listening) {
        conv.push({
          position: 'right',
          title: 'User',
          text: transcript,
          inProgress: true,
        })
      }

      return conv;
    });
  }, [transcript, listening]);

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
                <Avatar ref={avatarRef} callback={fetchUnityData} />
              </div>
            </div>
          </div>
          <Spline
            scene="https://draft.spline.design/aCWrFD3SWSwK0JbW/scene.splinecode"
            style={{
              marginTop: 20,
              maxHeight: 100,
              visibility: (browserSupportsSpeechRecognition && !interviewOver && !isTalking) ? 'visible' : 'hidden',
            }}
            onMouseDown={(e: SplineEvent) => {
              console.log('MOUSE_DOWN', listening, transcript);
              if (e.target.name == 'unmute') {
                if (listeningGlobal) {
                  console.log('stopped listening');
                  SpeechRecognition.stopListening();
                  listeningGlobal = false;
                }
                else {
                  console.log('started listening');
                  resetTranscript();
                  SpeechRecognition.startListening({ continuous: true });
                  listeningGlobal = true;
                }
              } else {
                console.log('stopped listening');
                SpeechRecognition.stopListening();
                listeningGlobal = false;
              }
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
                <div className="chat-input-container">
                  <input
                    disabled={listening || interviewOver || isTalking}
                    className="input-field"
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Text Something..."
                  />
                </div>
                <div className="chat-button-row">
                  <button disabled={listening || interviewOver || isTalking} className="btn" onClick={handleChat}>
                    <h1>Send</h1>
                  </button>
                  <button disabled={listening || interviewOver || isTalking} className="btn" onClick={endInterview}>
                    <h1>End</h1>
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
