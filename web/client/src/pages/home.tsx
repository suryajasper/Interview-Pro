import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spline, { SplineEvent } from "@splinetool/react-spline";
import axios from "axios";
import { resume } from "../assets";
import parseResume from "../utils/resumeParser";

const UploadResume: React.FC<{ onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void; fileName: string }> = ({ onFileChange, fileName }) => (
  <div className="upload-container col">
    <h1>Upload Your Resume</h1>
    <p>Our AI reads over your experiences to provide personalized feedback.</p>
    <img className="large-icon" src={resume} />

    <input type="file" id="resumeUpload" accept=".pdf" hidden onChange={onFileChange} />
    <label htmlFor="resumeUpload" className="upload-btn">
      Upload (PDF Only)
    </label>
    <span id="fileName" className="file-name">
      {fileName}
    </span>
  </div>
);

const JobDescription: React.FC<{ value: string; onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void }> = ({ value, onChange }) => (
  <div className="upload-container col">
    <h1>Job Description</h1>
    <p>
      Paste the job description of the role that you are applying for. You can also mention the areas you want
      to emphasize during the practice session.
    </p>
    <textarea
      className="large-input"
      placeholder="Enter Job Description... "
      value={value}
      onChange={onChange}
    ></textarea>
  </div>
);

const StartButton: React.FC<{ zIndex: number, startButtonShow: boolean, onClick: () => void }> = ({ zIndex, startButtonShow, onClick }) => (
  <div className="ab">
    <div 
      style={{ zIndex }}
      className={startButtonShow ? "start-btn" : "start-btn start-btn-end" }
      onClick={onClick}>
      <h1>GET STARTED</h1>
    </div>
  </div>
);

const StartChatButton: React.FC<{ onClick: () => void; isDisabled: boolean }> = ({ onClick, isDisabled }) => (
  <a href="javascript:void(0)">
    <button
      onClick={onClick}
      className={isDisabled ? "ctn-btn-hidden" : "ctn-btn"}
      disabled={isDisabled}
    >
      Start Chatting
    </button>
  </a>
);


const Home = () => {
  const navigate = useNavigate();
  const [splineShow, setSplineShow] = useState(true);
  const [startButtonShow, setStartButtonShow] = useState(true);
  const [ab, setAb] = useState(4);
  const [uploadShow, setUploadShow] = useState(false);
  const [fileName, setFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeContent, setResumeContent] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      parseResume(file)
        .then((content) => {
          setResumeContent(content);
        })
        .catch(console.error);
    }

    setFileName(file ? file.name : "No file chosen");
  };

  const handleStartButton = () => {
    setSplineShow(false);
    setStartButtonShow(false);
    setUploadShow(true);
    setTimeout(() => {
      setAb(-1);
    }, 3000);
  };

  const handleChatNavigation = async () => {
    try {
      const response = await axios.post("http://localhost:6969/createSession", {
        jobDescription,
        resumeContent,
      });
      const sessionId = response.data.sessionId;

      if (sessionId) {
        navigate(`/chat/${sessionId}`);
      } else {
        console.error("No sessionId returned from the server");
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  return (
    <div className="container">
      <Spline
        scene="https://draft.spline.design/R2C2nYGxTOk-hejn/scene.splinecode"
        className={splineShow ? "spline-cards" : "spline-cards-end"}
        onMouseDown={(e: SplineEvent) => console.log(e.target)}
      />

      <StartButton zIndex={ab} startButtonShow={startButtonShow} onClick={handleStartButton} />

      <div className={uploadShow ? "center-container row" : "hidden"}>
        <UploadResume onFileChange={handleFileChange} fileName={fileName} />

        <JobDescription 
          value={jobDescription} 
          onChange={ (e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value) }
        />

        <StartChatButton
          onClick={handleChatNavigation}
          isDisabled={!fileName || !resumeContent || !jobDescription}
        />
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

export default Home;
