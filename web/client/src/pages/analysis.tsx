import React from "react";
import Spline, { SplineEvent } from "@splinetool/react-spline";
import "../App.css";


class Analysis extends React.Component {
    render() {
        return (
            <div className="container">
                <div className="header">
                    <h1>Stats Review</h1>
                </div>

                <div className="graph">
                    <p>starfish</p>
                </div>

                <div >
                    <div className="gptFeedback">
                        <p>feedback</p>
                    </div>

                    <div className="transcript">
                        <p>transcript</p>
                    </div>
                </div>

            </div>
        );
    }


}

export default Analysis;