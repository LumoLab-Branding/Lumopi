import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Loading from './loading';
import TipsPanel from '../components/TipsPanel';
import styles from '../styles/Home.module.css';

const AIPrompt = ({ context, setContext, callee, setCallee, company, setCompany, createScript, loading, progress, togglePrompt }) => {
    return (
        <div className="ai-prompt">
            <div className="prompt-row">
                <input
                    type="text"
                    value={callee}
                    onChange={(e) => setCallee(e.target.value)}
                    placeholder="Name of the person you're calling"
                />
                <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Enter the company name"
                />
            </div>
            <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Provide the persons association to you, the reason and context for the call. What you want to achieve. For stronger results, consider placing in your email trail."
                rows="7"
            />  
            <div className="button-row">
                <button onClick={createScript} disabled={loading} className="generate-button">
                    {loading ? 'Generating...may take up to a minute.' : 'Generate the script from this prompt'}
                </button>
                <button className="minimize-button" onClick={togglePrompt}>
                    ▲
                </button>
            </div>
            {loading && <Loading />}
        </div>
    );
};

const ScriptStep = ({ script, currentStepIndex, setCurrentStepIndex }) => {
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isAnimatingIn, setIsAnimatingIn] = useState(false);

    if (!script || !script.content) {
        console.error("Invalid script format:", script);
        return <div>Error: Invalid script format</div>;
    }

    const stepKeys = Object.keys(script.content);
    const currentStep = script.content[stepKeys[currentStepIndex]];

    if (!currentStep) {
        console.error("Invalid step index:", currentStepIndex);
        return <div>Error: Invalid step index</div>;
    }

    console.log("Current Step:", currentStep);

    const handleOptionClick = (nextStep) => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            const nextIndex = stepKeys.indexOf(nextStep);
            if (nextIndex !== -1) {
                setCurrentStepIndex(nextIndex);
                setIsAnimatingOut(false);
                setIsAnimatingIn(true);
                setTimeout(() => {
                    setIsAnimatingIn(false);
                }, 500);
            }
        }, 500);
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setIsAnimatingOut(true);
            setTimeout(() => {
                setCurrentStepIndex(prevIndex => prevIndex - 1);
                setIsAnimatingOut(false);
                setIsAnimatingIn(true);
                setTimeout(() => {
                    setIsAnimatingIn(false);
                }, 500);
            }, 500);
        }
    };

    const handleRestart = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            setCurrentStepIndex(0);
            setIsAnimatingOut(false);
            setIsAnimatingIn(true);
            setTimeout(() => {
                setIsAnimatingIn(false);
            }, 500);
        }, 500);
    };

    return (
        <div className="script-panel">
            <div className="script-navigation">
                <button onClick={handleBack} disabled={currentStepIndex === 0}>Back</button>
                <button onClick={handleRestart}>Restart</button>
            </div>
            <div className={`script-content ${isAnimatingOut ? 'slide-out' : ''} ${isAnimatingIn ? 'slide-in' : ''}`}>
                <p>{currentStep.content}</p>
                {currentStep.options && (
                    <div className="script-options">
                        {currentStep.options.map((option, index) => (
                            <button key={index} onClick={() => handleOptionClick(option.nextStep)} className="call-response-button">
                                <div className="call-response-button-content">
                                    <span className="option-emoji">{option.emoji}</span>
                                    <span className="option-text">{option.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const Home = () => {
    const [scripts, setScripts] = useState([]);
    const [currentScript, setCurrentScript] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [context, setContext] = useState('');
    const [callee, setCallee] = useState('');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [showPrompt, setShowPrompt] = useState(true);
    const [isPromptMinimized, setIsPromptMinimized] = useState(false);
    const [saveButtonText, setSaveButtonText] = useState('Save Lumopi Script');
    const fileInputRef = useRef(null);
    const promptRef = useRef(null);
    const dropAreaRef = useRef(null);

    useEffect(() => {
        const dropArea = dropAreaRef.current;
        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.add('drag-over');
        };

        const handleDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('drag-over');
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) {
                loadScriptFromFile(file);
            }
        };

        dropArea.addEventListener('dragover', handleDragOver);
        dropArea.addEventListener('dragleave', handleDragLeave);
        dropArea.addEventListener('drop', handleDrop);

        return () => {
            dropArea.removeEventListener('dragover', handleDragOver);
            dropArea.removeEventListener('dragleave', handleDragLeave);
            dropArea.removeEventListener('drop', handleDrop);
        };
    }, []);

    const createScript = async () => {
        setLoading(true);
        setError('');
        setProgress(0);
        try {
            const response = await axios.post('/api/generate-script', {
                callee,
                company,
                context
            }, {
                onDownloadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            const newScript = response.data.script;
            console.log("Generated Script:", JSON.stringify(newScript, null, 2));
            console.log("Token Usage:", response.data.tokenUsage);
            setScripts(prevScripts => [newScript, ...prevScripts.slice(0, 9)]);
            setCurrentScript(newScript);
            setCurrentStepIndex(0);
            setShowPrompt(false);
            setIsPromptMinimized(true);
        } catch (error) {
            console.error('Error creating script:', error);
            setError('Error creating script. Please try again.');
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    const saveScriptToFile = () => {
        if (currentScript) {
            const scriptToSave = {
                id: currentScript.id,
                title: currentScript.title,
                content: currentScript.content
            };

            const descriptor = `${callee}-${company}-${currentScript.title.split(' ').slice(0, 6).join('-')}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
            const fileName = `${descriptor}.json`;

            const blob = new Blob([JSON.stringify(scriptToSave, null, 2)], { type: 'application/json' });

            if (window.showSaveFilePicker) {
                window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] },
                    }],
                }).then(async (fileHandle) => {
                    const writable = await fileHandle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    setSaveButtonText('Script Saved');
                    setTimeout(() => setSaveButtonText('Save Script'), 5000);
                }).catch((error) => {
                    console.error('Error saving file:', error);
                    setSaveButtonText('Save Failed');
                    setTimeout(() => setSaveButtonText('Save Script'), 5000);
                });
            } else {
                // Fallback for browsers that don't support showSaveFilePicker
                const href = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = href;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(href);
                setSaveButtonText('Script Saved');
                setTimeout(() => setSaveButtonText('Save Script'), 5000);
            }
        }
    };

    const loadScriptFromFile = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const loadedScript = JSON.parse(e.target.result);
                    if (loadedScript.id && loadedScript.title && loadedScript.content) {
                        console.log("Loaded Script:", JSON.stringify(loadedScript, null, 2));
                        setScripts(prevScripts => [loadedScript, ...prevScripts.slice(0, 9)]);
                        setCurrentScript(loadedScript);
                        setCurrentStepIndex(0);
                        setShowPrompt(false);
                        setIsPromptMinimized(true);
                    } else {
                        throw new Error('Invalid script format');
                    }
                } catch (error) {
                    console.error('Error loading script:', error);
                    setError('Error loading script: Invalid file format');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            loadScriptFromFile(file);
        }
    };

    const togglePrompt = () => {
        setIsPromptMinimized(!isPromptMinimized);
    };

    return (
        <div className={styles.container}>
            <h1>Lumopi</h1>
            <h3 style={{ textAlign: 'center', paddingBottom: '20px' }}>Your intelligent conversation writer and helper</h3>
            <div className={styles.appLayout}>
                <div className={styles.mainContent}>
                    <div className={styles.panel + ' ' + styles.promptingArea}>
                        <div className={`${styles.promptContainer} ${isPromptMinimized ? styles.minimized : ''}`}>
                            {isPromptMinimized ? (
                                <button className={styles.fullWidthButton} onClick={togglePrompt}>
                                    Refine or adjust your prompt
                                </button>
                            ) : (
                                <React.Fragment>
                                    <AIPrompt
                                        context={context}
                                        setContext={setContext}
                                        callee={callee}
                                        setCallee={setCallee}
                                        company={company}
                                        setCompany={setCompany}
                                        createScript={createScript}
                                        loading={loading}
                                        progress={progress}
                                        togglePrompt={togglePrompt}
                                    />
                                </React.Fragment>
                            )}
                        </div>
                    </div>
                    <div className={styles.panel + ' ' + styles.callScriptArea}>
                        <div className={styles.scriptActions}>
                            <button onClick={saveScriptToFile} disabled={!currentScript}>
                                {saveButtonText}
                            </button>
                            <div className={styles.loadScriptContainer}>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileInputChange}
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                />                                
                                <div className={styles.dropArea} ref={dropAreaRef}>
                                <button onClick={() => fileInputRef.current.click()}>Load Lumopi Script</button>
                                </div>
                            </div>
                        </div>
                        {currentScript && (
                            <ScriptStep
                                script={currentScript}
                                currentStepIndex={currentStepIndex}
                                setCurrentStepIndex={setCurrentStepIndex}
                            />
                        )}
                    </div>
                </div>
                <div className={styles.sidebar}>
                    <TipsPanel />
                </div>
            </div>
            <img src="https://uploads-ssl.webflow.com/6155a506e5fb5e2415830a2b/65c4d671fe2614a098974cd1_Lumo%20Lab%20Logo%20_%20no%20Tagelin_WORKING%20FILE%209.svg" alt="Lumo Lab Logo" className={styles.logo} />
        </div>
    );
};

export default Home;