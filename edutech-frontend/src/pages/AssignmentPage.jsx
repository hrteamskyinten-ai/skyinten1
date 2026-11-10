import React, { useEffect, useContext, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import axios from "axios";
import "../styles/assignmentPageStyles.css";
import { toast } from "react-toastify";
import Editor from "@monaco-editor/react";

export default function AssignmentPage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { userData, backendUrl } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("mcq"); // 'mcq' or 'coding'
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState(null);
  
  // Coding section state
  const [current, setCurrent] = useState(0);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [codes, setCodes] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [result, setResult] = useState("");
  const [leftWidth, setLeftWidth] = useState(48);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const editorDomRef = useRef(null);
  const editorListenersRef = useRef([]);

  const languageMap = {
    python: "71",
    java: "62",
    c: "50",
    cpp: "54",
    javascript: "63",
    sql: "82",
  };

  // Monaco language mapping
  const monacoLangMap = {
    python: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    javascript: 'javascript',
    sql: 'sql',
  };

  const normalizeLang = (raw) => {
    if (!raw) return 'python';
    let s = String(raw).toLowerCase().trim();
    if (s === 'c++') return 'cpp';
    if (s === 'c#') return 'c';
    if (s === 'js') return 'javascript';
    if (s === 'py') return 'python';
    return s;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId, moduleId]);

  // Monaco theme setup
  function handleEditorWillMount(monaco) {
    try {
      monaco.editor.defineTheme('skyinten-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: '', foreground: 'd4d4d4', background: '0b1220' },
        ],
        colors: {
          'editor.background': '#071428',
          'editorLineNumber.foreground': '#5b6b78',
          'editorCursor.foreground': '#ffcc00',
          'editor.foreground': '#d4d4d4'
        }
      });

      const makeProvider = (lang, suggestions) => {
        try {
          monaco.languages.registerCompletionItemProvider(lang, {
            provideCompletionItems: () => ({ suggestions })
          });
        } catch (e) {}
      };

      makeProvider('python', [
        { label: 'ifmain', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if __name__ == "__main__":\n\t${1:main()}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Entry point' }
      ]);
      makeProvider('javascript', [
        { label: 'cl', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'console.log(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'console.log' }
      ]);
    } catch (err) {
      console.warn('Monaco beforeMount failed', err);
    }
  }

  function handleEditorDidMount(editor, monaco) {
    try {
      const dom = editor.getDomNode();
      if (!dom) return;
      editorDomRef.current = dom;
      // Copy/paste is now enabled - no restrictions
    } catch (err) {
      console.warn('Failed to attach editor DOM listeners', err);
    }
  }

  // Cleanup editor listeners on unmount
  useEffect(() => {
    return () => {
      try {
        editorListenersRef.current = [];
        editorDomRef.current = null;
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        console.log('AssignmentPage: fetching MCQs and coding questions', { courseId, moduleId, backendUrl });

        // Fetch MCQs
        const mcqRes = await axios.get(
          `${backendUrl}/api/module-assignment/mcq/${courseId}/${moduleId}`
        );
        console.log('AssignmentPage mcqRes:', mcqRes?.data);
        if (mcqRes.data && mcqRes.data.success) {
          setMcqs(mcqRes.data.mcqs || []);
        } else {
          console.warn('AssignmentPage: mcqRes did not return success', mcqRes?.data);
        }

        // Fetch Coding Questions
        const codingRes = await axios.get(
          `${backendUrl}/api/module-assignment/coding/${courseId}/${moduleId}`
        );
        console.log('AssignmentPage codingRes:', codingRes?.data);
        if (codingRes.data && codingRes.data.success) {
          const questions = codingRes.data.questions || [];
          setCodingQuestions(questions);
          setSelectedLanguages(questions.map((q) => q.language || 'python'));
          setCodes(questions.map(() => ''));
        } else {
          console.warn('AssignmentPage: codingRes did not return success', codingRes?.data);
        }

        // Try to fetch course and module names
        const courseRes = await axios.get(`${backendUrl}/api/courses/${courseId}`);
        if (courseRes.data.success && courseRes.data.course) {
          setCourseName(courseRes.data.course.name);
          const module = courseRes.data.course.modules?.find(m => m._id === moduleId);
          if (module) setModuleName(module.title);
        }

        setError(null);
      } catch (err) {
        console.error("Failed to fetch assignments:", err);
        setError("Failed to load assignment details");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && moduleId) {
      fetchAssignments();
    }
  }, [courseId, moduleId, backendUrl]);

  // Splitter / resizing handlers
  function startDrag(e) {
    isDraggingRef.current = true;
    setIsDragging(true);
    e.preventDefault();
  }

  useEffect(() => {
    function onMouseMove(e) {
      if (!isDraggingRef.current) return;
      const cont = containerRef.current;
      if (!cont) return;
      const rect = cont.getBoundingClientRect();
      const x = e.clientX - rect.left;
      let pct = (x / rect.width) * 100;
      if (pct < 20) pct = 20;
      if (pct > 80) pct = 80;
      setLeftWidth(pct);
    }

    function onMouseUp() {
      if (isDraggingRef.current) isDraggingRef.current = false;
      setIsDragging(false);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Run code with test input
  const runCode = async (e) => {
    e?.preventDefault();
    setResult("");

    const source = codes[current];
    const langKey = selectedLanguages[current] || "python";
    const lang_id = languageMap[langKey];
    const q = codingQuestions[current] || {};
    const input = (q.testcases && q.testcases[0] && q.testcases[0].input) || "";

    if (!source.trim()) {
      toast.error("Please write some code first");
      return;
    }

    try {
      axios.defaults.withCredentials = true;
      toast.info("Compiling and Running...", { autoClose: 1500 });

      const { data } = await axios.post(`${backendUrl}/api/compile`, {
        lang_id,
        code: source,
        input,
      });

      setResult(data);
      toast.success("Execution Complete");
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Error connecting to compiler";
      toast.error(errorMsg);
    }
  };

  // Run all testcases for current question
  const runTestsForCurrent = async () => {
    toast.info('Running test cases...');
    const q = codingQuestions[current];
    const source = codes[current] || "";
    if (!source.trim()) {
      toast.error("Please write code for this question first");
      return;
    }

    const langKey = selectedLanguages[current] || 'python';
    const lang_id = languageMap[langKey];

    const results = [];
    let passed = 0;

    for (const tc of q.testcases) {
      try {
        const { data } = await axios.post(`${backendUrl}/api/compile`, {
          lang_id,
          code: source,
          input: tc.input,
        });

        const out = data.stdout ? atob(data.stdout).trim() : (data.stdout_raw || "");
        const expected = String(tc.expected || tc.expectedOutput || '').trim();
        const ok = out === expected;
        if (ok) passed++;
        results.push({ input: tc.input, expected, output: out, passed: ok });
      } catch (err) {
        results.push({ input: tc.input, expected: tc.expected, output: null, passed: false, error: err.message });
      }
    }

    setTestResults(results);
    toast.info(`${passed}/${q.testcases.length} testcases passed`);
  };

  const handleMCQChange = (mcqId, selectedIndex) => {
    setAnswers(prev => ({
      ...prev,
      [mcqId]: selectedIndex
    }));
  };

  const handleCodingChange = (questionId, code) => {
    setCodes(prevCodes => {
      const newCodes = [...prevCodes];
      // Need to find the index
      const index = codingQuestions.findIndex(q => q._id === questionId);
      if (index !== -1) {
        newCodes[index] = code;
      }
      return newCodes;
    });
  };

  const handleSubmitAssignment = async () => {
    // Validate that at least something is answered
    const hasMCQAnswers = mcqs.length > 0 && Object.keys(answers).some(key => 
      mcqs.some(m => m._id === key && answers[key] !== undefined)
    );
    
    const hasCodingAnswers = codingQuestions.length > 0 && codes.some(code => code && code.trim());

    if (!hasMCQAnswers && !hasCodingAnswers) {
      toast.error("Please answer MCQs or write code for at least one question");
      return;
    }

    setSubmitting(true);
    try {
      // Prepare MCQ answers
      const mcqAnswers = {};
      mcqs.forEach(mcq => {
        mcqAnswers[mcq._id] = answers[mcq._id];
      });

      // Prepare coding submissions - use codes array indexed by question position
      const codingSubmissions = [];
      codingQuestions.forEach((q, idx) => {
        codingSubmissions.push({
          questionId: q._id,
          code: codes[idx] || "",
          language: selectedLanguages[idx] || q.language || "python"
        });
      });

      const payload = {
        courseId,
        moduleId,
        mcqs,
        mcqAnswers,
        codingQuestions,
        codingSubmissions
      };

      console.log('Submitting assignment with payload:', { courseId, moduleId, mcqCount: mcqs.length, codingCount: codingQuestions.length });

      const { data } = await axios.post(
        `${backendUrl}/api/module-assignment/submit`,
        payload,
        { withCredentials: true }
      );

      if (data.success) {
        // Show result modal
        setResultData(data);
        setShowResultModal(true);
        console.log('Assignment submitted successfully:', data);
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.response?.data?.message || "Error submitting assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    if (resultData?.isPassed) {
      // Navigate back to course resources page
      navigate("/course/resources", { state: { courseId, courseName } });
    }
  };

  if (loading) {
    return (
      <>
        <div className="assignment-page-layout" style={{ padding: "40px", textAlign: "center" }}>
          <h2>Loading assignment...</h2>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="assignment-page-layout" style={{ padding: "40px", textAlign: "center" }}>
          <h2>{error}</h2>
          <button onClick={() => navigate(-1)} style={{ marginTop: "20px", padding: "10px 20px" }}>
            Go Back
          </button>
        </div>
      </>
    );
  }

  if (mcqs.length === 0 && codingQuestions.length === 0) {
    return (
      <>
        <div className="assignment-page-layout" style={{ padding: "40px", textAlign: "center" }}>
          <h2>No assignments available yet</h2>
          <p>Your tutor will add MCQs and coding questions soon.</p>
          <button onClick={() => navigate(-1)} style={{ marginTop: "20px", padding: "10px 20px" }}>
            Go Back
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="assignment-page-layout">
        <section className="assignment-hero">
          <h1 className="assignment-title">Module Assignment</h1>
          <p className="assignment-subtitle">
            {courseName && moduleName ? `${courseName} - ${moduleName}` : "Test your knowledge"}
          </p>
        </section>

        <section className="assignment-content">
          <div className="assignment-tabs">
            {mcqs.length > 0 && (
              <button
                className={`tab-btn ${activeTab === "mcq" ? "active" : ""}`}
                onClick={() => setActiveTab("mcq")}
              >
                📋 MCQs ({mcqs.length})
              </button>
            )}
            {codingQuestions.length > 0 && (
              <button
                className={`tab-btn ${activeTab === "coding" ? "active" : ""}`}
                onClick={() => setActiveTab("coding")}
              >
                💻 Coding ({codingQuestions.length})
              </button>
            )}
          </div>

          {/* MCQ Section */}
          {activeTab === "mcq" && mcqs.length > 0 && (
            <div className="mcq-section">
              <h2>Multiple Choice Questions</h2>
              <div className="mcq-container">
                {mcqs.map((mcq, index) => (
                  <div key={mcq._id} className="mcq-question-block">
                    <div className="question-header">
                      <h3>Question {index + 1}</h3>
                      <span className={`difficulty-badge ${mcq.difficulty}`}>
                        {mcq.difficulty}
                      </span>
                    </div>
                    <p className="question-text">{mcq.text}</p>
                    <div className="options-container">
                      {mcq.options.map((option, optIndex) => (
                        <label key={optIndex} className="option-label">
                          <input
                            type="radio"
                            name={`mcq-${mcq._id}`}
                            value={optIndex}
                            checked={answers[mcq._id] === optIndex}
                            onChange={() => handleMCQChange(mcq._id, optIndex)}
                          />
                          <span className="option-text">{option}</span>
                        </label>
                      ))}
                    </div>
                    {mcq.explanation && answers[mcq._id] !== undefined && (
                      <div className="explanation-box">
                        <strong>Explanation:</strong> {mcq.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coding Section - New Split Panel Layout */}
          {activeTab === "coding" && codingQuestions.length > 0 && (
            <>
              {/* Header with problem navigation */}
              <div className="coding-header">
                <div className="coding-nav">
                  <span>Problem:</span>
                  <div className="boxes">
                    {codingQuestions.map((qst, idx) => (
                      <button
                        key={qst._id || idx}
                        onClick={() => {
                          setCurrent(idx);
                          setTestResults([]);
                          setResult("");
                        }}
                        className={`num-box ${idx === current ? "active" : ""}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Split Panel Layout */}
              <div ref={containerRef} className="coding-content" style={{ display: 'flex', width: '100%', height: 'calc(100vh - 300px)' }}>
                {/* LEFT SIDE - Problem Description */}
                <section className="coding-left" style={{ overflowY: "auto", width: `${leftWidth}%`, flex: '0 0 auto' }}>
                  {codingQuestions[current] && (
                    <>
                      <h2>{codingQuestions[current].title}</h2>
                      <p className="problem-statement">{codingQuestions[current].description}</p>

                      {codingQuestions[current].examples && codingQuestions[current].examples.length > 0 && (
                        <>
                          <h3>Examples:</h3>
                          {codingQuestions[current].examples.map((ex, i) => (
                            <div key={i} style={{ marginBottom: "14px" }}>
                              <div style={{ fontWeight: 700, marginBottom: 6 }}>Example {i + 1}:</div>
                              <div style={{ marginBottom: 6 }}><strong>Input:</strong></div>
                              <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 6, whiteSpace: 'pre-wrap' }}>{ex.input}</pre>
                              <div style={{ marginTop: 8, marginBottom: 6 }}><strong>Output:</strong></div>
                              <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 6, whiteSpace: 'pre-wrap' }}>{ex.output}</pre>
                            </div>
                          ))}
                        </>
                      )}

                      {codingQuestions[current].testcases && codingQuestions[current].testcases.length > 0 && (
                        <>
                          <h3>Sample Test Cases:</h3>
                          {codingQuestions[current].testcases.slice(0, 2).map((tc, i) => (
                            <div key={i} style={{ marginBottom: "14px" }}>
                              <div style={{ fontWeight: 700, marginBottom: 6 }}>Test Case {i + 1}:</div>
                              <div style={{ marginBottom: 6 }}><strong>Input:</strong></div>
                              <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 6, whiteSpace: 'pre-wrap' }}>{tc.input}</pre>
                              <div style={{ marginTop: 8, marginBottom: 6 }}><strong>Expected Output:</strong></div>
                              <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 6, whiteSpace: 'pre-wrap' }}>{tc.expected}</pre>
                            </div>
                          ))}
                        </>
                      )}

                      {codingQuestions[current].constraints && (
                        <>
                          <h3>Constraints:</h3>
                          <p>{codingQuestions[current].constraints}</p>
                        </>
                      )}
                    </>
                  )}
                </section>

                {/* SPLITTER */}
                <div className="splitter" onMouseDown={startDrag}>
                  <div className={`splitter-handle ${isDragging ? 'dragging' : ''}`}>◀</div>
                </div>

                {/* RIGHT SIDE - Code Editor */}
                <aside className="coding-right" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  {codingQuestions[current] && (
                    <>
                      <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <label style={{ fontWeight: 600, color: '#e6eef6' }}>Language:</label>
                        <select
                          value={selectedLanguages[current] || 'python'}
                          onChange={(e) => {
                            const copy = [...selectedLanguages];
                            copy[current] = e.target.value;
                            setSelectedLanguages(copy);
                          }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: '#0f1720',
                            color: '#e6eef6',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          {["python", "java", "javascript", "cpp", "c"].map((lang) => (
                            <option key={lang} value={lang}>
                              {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </option>
                          ))}
                        </select>
                        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#5b6b78' }}>
                          {codingQuestions[current].difficulty}
                        </span>
                      </div>

                      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                        <Editor
                          value={codes[current] || ""}
                          onChange={(val) => {
                            const copy = [...codes];
                            copy[current] = val;
                            setCodes(copy);
                          }}
                          beforeMount={handleEditorWillMount}
                          onMount={handleEditorDidMount}
                          language={monacoLangMap[selectedLanguages[current] || 'python']}
                          theme="skyinten-dark"
                          options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            automaticLayout: true,
                            lineNumbers: 'on',
                            lineHeight: 22,
                            padding: { top: 8, bottom: 8 }
                          }}
                        />
                      </div>

                      {/* Controls */}
                      <div className="coding-controls" style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                        <button
                          className="control-btn run-btn"
                          onClick={runCode}
                          style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#fff', background: '#0f9d58' }}
                        >
                          Run Code
                        </button>
                        <button
                          className="control-btn test-btn"
                          onClick={runTestsForCurrent}
                          style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#fff', background: '#1976d2' }}
                        >
                          Run Tests
                        </button>
                      </div>

                      {/* Results */}
                      {result && (
                        <div className="coding-result" style={{ marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.03)', maxHeight: '200px', overflowY: 'auto' }}>
                          <h4>Result: {result.status?.id === 3 ? '✅' : '❌'}</h4>
                          <p><strong>Status:</strong> {result.status?.description || "Unknown"}</p>
                          {result.compile_output && (
                            <pre style={{ color: '#ffb4b4', fontSize: '12px', whiteSpace: 'pre-wrap', margin: 0 }}>Error: {atob(result.compile_output)}</pre>
                          )}
                          {result.stderr && (
                            <pre style={{ color: '#ffb4b4', fontSize: '12px', whiteSpace: 'pre-wrap', margin: 0 }}>Stderr: {atob(result.stderr)}</pre>
                          )}
                        </div>
                      )}

                      {testResults.length > 0 && (
                        <div className="test-results" style={{ marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.03)', maxHeight: '200px', overflowY: 'auto' }}>
                          <h4>Test Results: {testResults.filter(t => t.passed).length}/{testResults.length} passed</h4>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {testResults.map((t, i) => (
                              <li key={i} style={{ padding: '8px', background: t.passed ? 'rgba(15,80,60,0.06)' : 'rgba(120,30,30,0.04)', marginBottom: '4px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                <span>{t.passed ? '✅' : '❌'} Test {i + 1}</span>
                                {t.error && <span style={{ color: '#ffb4b4' }}>Error</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </aside>
              </div>
            </>
          )}

          {/* Single Submit Button */}
          <div className="submit-section" style={{ marginTop: "30px", textAlign: "center", padding: "20px" }}>
            <button
              className="submit-btn"
              onClick={handleSubmitAssignment}
              disabled={submitting}
              style={{
                padding: "12px 30px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: submitting ? "#888" : "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "background-color 0.3s"
              }}
            >
              {submitting ? "Submitting..." : "Submit Assignment"}
            </button>
          </div>
        </section>

        {/* Result Modal */}
        {showResultModal && resultData && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: "#1e1e2e",
              border: `3px solid ${resultData.isPassed ? "#4CAF50" : "#f44336"}`,
              borderRadius: "12px",
              padding: "40px",
              maxWidth: "500px",
              textAlign: "center",
              boxShadow: "0 10px 50px rgba(0, 0, 0, 0.9)",
              color: "#fff"
            }}>
              <div style={{ fontSize: "60px", marginBottom: "20px" }}>
                {resultData.isPassed ? "🎉" : "❌"}
              </div>
              <h2 style={{ fontSize: "28px", marginBottom: "10px", color: resultData.isPassed ? "#4CAF50" : "#f44336" }}>
                {resultData.isPassed ? "Assignment Passed!" : "Assignment Failed"}
              </h2>
              <p style={{ fontSize: "18px", marginBottom: "20px", color: "#ccc" }}>
                Your Score: <span style={{ fontSize: "24px", fontWeight: "bold", color: resultData.isPassed ? "#4CAF50" : "#f44336" }}>
                  {resultData.finalScore}%
                </span>
              </p>
              <p style={{ fontSize: "14px", color: "#aaa", marginBottom: "5px" }}>
                Pass Mark: {resultData.passThreshold}%
              </p>
              {resultData.mcqTotal > 0 && (
                <p style={{ fontSize: "14px", color: "#aaa", marginBottom: "5px" }}>
                  MCQs: {resultData.mcqScore}/{resultData.mcqTotal}
                </p>
              )}
              {resultData.codingTotal > 0 && (
                <p style={{ fontSize: "14px", color: "#aaa", marginBottom: "25px" }}>
                  Coding: {resultData.codingScore}/{resultData.codingTotal}
                </p>
              )}
              <button
                onClick={handleResultModalClose}
                style={{
                  padding: "12px 30px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  backgroundColor: resultData.isPassed ? "#4CAF50" : "#666",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "background-color 0.3s"
                }}
              >
                {resultData.isPassed ? "Continue" : "Try Again"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}