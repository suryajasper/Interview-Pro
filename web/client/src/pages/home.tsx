import React from "react";
import Spline, { SplineEvent } from "@splinetool/react-spline";
import "../App.css";
import resume from "../assets";

interface HomeProps {}
interface HomeState {
  splineShow: boolean;
  startButtonShow: boolean;
  ab: number;
  fileName: string;
  uploadShow: boolean;
  jobDescription: string;
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
    };
  }
  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    this.setState({
      fileName: file ? file.name : "No file chosen",
    });
  };
  render() {
    return (
      <div className="container">
        <Spline
          scene="https://prod.spline.design/OjQhQUFdcO0kwRoW/scene.splinecode"
          className={
            this.state.splineShow ? "spline-cards" : "spline-cards-end"
          }
        />
        <div className="ab" style={{ zIndex: this.state.ab }}>
          <div
            className={this.state.startButtonShow ? "btn" : "btn btn-end"}
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
          <button
            className={
              this.state.fileName != "" && this.state.jobDescription != ""
                ? "ctn-btn"
                : "ctn-btn-hidden"
            }>
            Start Chatting
          </button>
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
