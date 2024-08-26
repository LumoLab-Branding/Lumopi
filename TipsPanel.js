import React from 'react';
import './styles.css';

const TipsPanel = () => {
    const tips = [
        {
            summary: "Active Listening & Empathy",
            content: [
                "Understand, relate, see their view, ask for deeper understanding, what an ideal solution looks like."
            ]
        },
        {
            summary: "Find Common Ground & Reframe",
            content: [
                "Explore the shared goal, how to do it together. Reframe a challenge. Explore approaches others have found success with."
            ]
        },
        {
            summary: "Visualize Positive Outcomes",
            content: [
                "Imagine a desired outcome and what it would mean for their business. Visualise the benefits of the solution."
            ]
        },
        {
            summary: "Provide Social Proof",
            content: [
                "Share similar situations where others have progressed to a solution and positive result."
            ]
        },        
        {
            summary: "Address potential objections",
            content: [
                "Proactively address hesitations and enquire of any deeper issues, and discuss mitigation strategies.",
            ]
        },
        {
            summary: "Create Collaborative Space",
            content: [
                "Reflect on the discussion and propose potential paths forward. Consult their views. Move forward together."
            ]
        }
    ];

    // Split tips into two arrays for two columns
    const midpoint = Math.ceil(tips.length / 2);
    const leftColumnTips = tips.slice(0, midpoint);
    const rightColumnTips = tips.slice(midpoint);

    const renderTipColumn = (columnTips) => (
        <div className="tips-column">
            {columnTips.map((tip, index) => (
                <div key={index} className="tip-item">
                    <p className="tip-summary">{tip.summary}</p>
                    <div className="tip-content">
                        {tip.content.map((item, itemIndex) => (
                            <React.Fragment key={itemIndex}>
                                {itemIndex > 0 && <div className="content-divider"></div>}
                                <p>{item}</p>
                            </React.Fragment>
                        ))}
                    </div>
                    {index < columnTips.length - 1 && <div className="tip-divider"></div>}
                </div>
            ))}
        </div>
    );

    return (
        <div className="tips-panel">
            <h3>Call Tips</h3>
            <h4>This call prompter has persuasive communication logic to help you gain positive outcomes.</h4>
            <div className="tips-container">
                {renderTipColumn(leftColumnTips)}
                {renderTipColumn(rightColumnTips)}
            </div>
        </div>
    );
};

export default TipsPanel;