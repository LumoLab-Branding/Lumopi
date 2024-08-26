import './styles.css'; // Ensure this is included
const ScriptStep = ({ script }) => {
    const [currentStep, setCurrentStep] = useState('initial');
    const [history, setHistory] = useState(['initial']);

    const handleOptionClick = (nextStep) => {
        setCurrentStep(nextStep);
        setHistory(prevHistory => [...prevHistory, nextStep]);
    };

    const handleBack = () => {
        if (history.length > 1) {
            const newHistory = history.slice(0, -1);
            setHistory(newHistory);
            setCurrentStep(newHistory[newHistory.length - 1]);
        }
    };

    const step = script.content[currentStep];

    return (
        <div className="script-panel">
            <button onClick={handleBack} disabled={history.length <= 1}>Back</button>
            <div className="script-content">
                <p>{step.content}</p>
                {step.options && (
                    <div className="script-options">
                        {step.options.map((option, index) => (
                            <button key={index} onClick={() => handleOptionClick(option.nextStep)}>
                                {option.text}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};