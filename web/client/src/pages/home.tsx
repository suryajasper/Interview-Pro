import React from "react";
import Spline, { SplineEvent } from "@splinetool/react-spline";
import "../App.css";
import { resume } from "../assets";
import parseResume from "../utils/resumeParser";

interface HomeProps {}
interface HomeState {
  splineShow: boolean;
  startButtonShow: boolean;
  ab: number;
  fileName: string;
  uploadShow: boolean;
  jobDescription: string;
  resumeContent: string;
}

class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      splineShow: true,
      startButtonShow: true,
      ab: 4,
      uploadShow: false,
      fileName: "",
      jobDescription: "",
      resumeContent: "",
    };
  }
  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      parseResume(file)
        .then((content: string) => {
          this.setState({ resumeContent: content });
        })
        .catch(console.error);
    }

    this.setState({
      fileName: file ? file.name : "No file chosen",
    });
  };
  render() {
    return (
      <div className="container">
        <Spline
          scene="https://draft.spline.design/R2C2nYGxTOk-hejn/scene.splinecode"
          className={
            this.state.splineShow ? "spline-cards" : "spline-cards-end"
          }
          onMouseDown={(e: SplineEvent) => console.log(e.target)}
        />
        <div className="ab">
          <div
            style={{ zIndex: this.state.ab }}
            className={
              this.state.startButtonShow
                ? "start-btn"
                : "start-btn start-btn-end"
            }
            onClick={() => {
              this.setState({
                splineShow: false,
                startButtonShow: false,
                uploadShow: true,
              });
              setTimeout(() => {
                this.setState({ ab: -1 });
              }, 3000);
            }}>
            <h1>GET STARTED</h1>
          </div>
        </div>
        <div
          className={this.state.uploadShow ? "center-container row" : "hidden"}>
          <div className="upload-container col">
            <h1>Upload Your Resume</h1>
            <p>
              Our AI reads over your experinces to provide personalized
              feedback.
            </p>
            <img className="large-icon" src={resume} />

            <input
              type="file"
              id="resumeUpload"
              accept=".pdf"
              hidden
              onChange={this.handleFileChange}
            />
            <label htmlFor="resumeUpload" className="upload-btn">
              Upload (PDF Only)
            </label>
            <span id="fileName" className="file-name">
              {this.state.fileName}
            </span>
          </div>
          <div className="upload-container col">
            <h1>Job Description</h1>
            <p>
              Paste the job description of the role that you are applying for.
              You can also mention the areas you want to emphasize during the
              practice session.
            </p>
            <textarea
              className="large-input"
              placeholder="Enter Job Description... "
              value={this.state.jobDescription}
              onChange={(e) => {
                this.setState({ jobDescription: e.target.value });
              }}></textarea>
          </div>
          <a href="/chat">
            <button
              className={
                this.state.fileName &&
                this.state.resumeContent &&
                this.state.jobDescription
                  ? "ctn-btn"
                  : "ctn-btn-hidden"
              }>
              Start Chatting
            </button>
          </a>
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
  }
}

export default Home;
