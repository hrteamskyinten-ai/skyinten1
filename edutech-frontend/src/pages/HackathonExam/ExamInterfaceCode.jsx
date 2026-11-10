import React, { useState, useEffect, useRef, useContext } from "react";
import "../../styles/examInterface.css";
import axios from "axios";
import { AppContext } from "../../context/Appcontext";
import { toast } from "react-toastify";
import Editor from "@monaco-editor/react";
import { useNavigate } from 'react-router-dom';
import { createAutoSubmitHandler, setupAutoSubmitListeners } from "../../utils/examAutoSubmit";


export default function ExamInterfaceCode() {
  const DEFAULT_MINUTES = 30;

  const [codingQuestions, setCodingQuestions] = useState([]);
  const [smallScreenWarning, setSmallScreenWarning] = useState(false);
  const [current, setCurrent] = useState(0);
  const [leftWidth, setLeftWidth] = useState(48); // percent
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hackathonId, setHackathonId] = useState(null);
  const editorDomRef = useRef(null);
  const editorListenersRef = useRef([]);

  const { backendUrl, userData } = useContext(AppContext);
  const navigate = useNavigate();

  // Check if exam already completed - prevent re-entry (server-side check)
  useEffect(() => {
    if (!hackathonId) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/checkHackathonSubmitted/${hackathonId}`, { withCredentials: true });
        if (cancelled) return;
        if (data?.success && data?.submitted) {
          toast.warning('You have already completed this exam. Cannot re-enter.', {
            position: 'top-center',
            autoClose: 3000
          });
          const hackathonName = localStorage.getItem('currentHackathon');
          const redirectUrl = hackathonName ? `/hackathon/${encodeURIComponent(hackathonName)}` : '/hackathons';
          setTimeout(() => navigate(redirectUrl, { replace: true }), 500);
        }
      } catch (err) {
        // fallback to localStorage if server check fails
        const isCompleted = localStorage.getItem(`hackathon_${hackathonId}_completed`) === 'true';
        if (isCompleted) {
          toast.warning('You have already completed this exam. Cannot re-enter.', {
            position: 'top-center',
            autoClose: 3000
          });
          const hackathonName = localStorage.getItem('currentHackathon');
          const redirectUrl = hackathonName ? `/hackathon/${encodeURIComponent(hackathonName)}` : '/hackathons';
          setTimeout(() => navigate(redirectUrl, { replace: true }), 500);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [hackathonId, navigate, backendUrl]);

  // Get hackathon ID from localStorage
  useEffect(() => {
    const id = localStorage.getItem('hackathonId');
    setHackathonId(id);
  }, []);

  // Map friendly names to judge0 language ids
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

  const [availableLanguages, setAvailableLanguages] = useState(["python", "java", "c", "cpp", "javascript", "sql"]);

  const normalizeLang = (raw) => {
    if (!raw) return 'python';
    let s = String(raw).toLowerCase().trim();
    if (s === 'c++') return 'cpp';
    if (s === 'c#') return 'c';
    if (s === 'js') return 'javascript';
    if (s === 'py') return 'python';
    if (s === 'cpp') return 'cpp';
    return s;
  };

  // beforeMount to define theme and register simple snippets/completions
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

      // simple snippets / completion for common languages
      const makeProvider = (lang, suggestions) => {
        try {
          monaco.languages.registerCompletionItemProvider(lang, {
            provideCompletionItems: () => ({ suggestions })
          });
        } catch (e) {
          // ignore if language not available
        }
      };

      makeProvider('python', [
        { label: 'ifmain', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if __name__ == "__main__":\n\t${1:main()}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Entry point' },
        { label: 'def', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'def ${1:name}(${2:args}):\n\t${0:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Define function' }
      ]);

      makeProvider('javascript', [
        { label: 'cl', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'console.log(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'console.log' }
      ]);

      makeProvider('java', [
        { label: 'main', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public static void main(String[] args) {\n\t${0}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Main method' }
      ]);

      makeProvider('cpp', [
        { label: 'main', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'int main() {\n\t${0}\n\treturn 0;\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: 'Main function' }
      ]);
    } catch (err) {
      console.warn('Monaco beforeMount failed', err);
    }
  }

  // Attach DOM-level listeners to Monaco editor to disable copy/paste and right-click only inside editor
  function handleEditorDidMount(editor, monaco) {
    try {
      const dom = editor.getDomNode();
      if (!dom) return;
      editorDomRef.current = dom;

      const onContext = (e) => {
        e.preventDefault();
        toast.warning('Right-click is disabled in the code editor', { position: 'top-center', autoClose: 2000 });
        return false;
      };

      const onCopyPaste = (e) => {
        e.preventDefault();
        toast.warning('Copy / Paste is disabled in the code editor', { position: 'top-center', autoClose: 2000 });
        return false;
      };

      dom.addEventListener('contextmenu', onContext);
      dom.addEventListener('copy', onCopyPaste);
      dom.addEventListener('paste', onCopyPaste);

      editorListenersRef.current.push(['contextmenu', onContext]);
      editorListenersRef.current.push(['copy', onCopyPaste]);
      editorListenersRef.current.push(['paste', onCopyPaste]);

      // prevent keyboard paste (Ctrl/Cmd+V, Shift+Insert) when editor has focus
      const onKeyDown = (e) => {
        try {
          const isPasteKey = (e.key && e.key.toLowerCase() === 'v' && (e.ctrlKey || e.metaKey)) || (e.key && e.key === 'Insert' && e.shiftKey);
          if (!isPasteKey) return;
          if (editor && typeof editor.hasTextFocus === 'function' && editor.hasTextFocus()) {
            e.preventDefault();
            toast.warning('Paste is disabled in the code editor', { position: 'top-center', autoClose: 2000 });
            return false;
          }
        } catch (err) {}
      };

      window.addEventListener('keydown', onKeyDown);
      editorListenersRef.current.push(['__window_keydown__', onKeyDown]);
    } catch (err) {
      console.warn('Failed to attach editor DOM listeners', err);
    }
  }

  // cleanup editor listeners on unmount
  useEffect(() => {
    return () => {
      try {
        const dom = editorDomRef.current;
        if (dom && Array.isArray(editorListenersRef.current)) {
          editorListenersRef.current.forEach(([ev, fn]) => {
            try {
              if (ev === '__window_keydown__') {
                window.removeEventListener('keydown', fn);
              } else if (dom) {
                dom.removeEventListener(ev, fn);
              }
            } catch (e) {}
          });
        }
        editorListenersRef.current = [];
        editorDomRef.current = null;
      } catch (e) {}
    };
  }, []);

  // per-question selected languages (default to question language or python)
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  // store code per question so switching doesn't lose work
  const [codes, setCodes] = useState([]);

  // optional single-run input textarea for quick testing
  const [runInput, setRunInput] = useState("");

  const [result, setResult] = useState("");
  const [testResults, setTestResults] = useState([]); // per-test status for current question
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const saved = localStorage.getItem('hackathon_coding_timeLeft');
      if (saved) return parseInt(saved, 10);
      const dur = localStorage.getItem('hackathon_coding_duration');
      if (dur) {
        const d = parseInt(dur, 10);
        if (!isNaN(d) && d > 0) return d * 60;
      }
    } catch (e) {}
    return DEFAULT_MINUTES * 60;
  });
  const timerRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Restore timer from localStorage on page load
  useEffect(() => {
    if (!isInitializedRef.current) {
      const savedTime = localStorage.getItem('hackathon_coding_timeLeft');
      if (savedTime) {
        const time = parseInt(savedTime);
        if (time > 0) {
          setTimeLeft(time);
        }
      }
      isInitializedRef.current = true;
    }
  }, []);

  // TIMER - save to localStorage every second and persist on page refresh
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev <= 1 ? 0 : prev - 1;
        localStorage.setItem('hackathon_coding_timeLeft', newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Tab switching detection & Auto-submit on page leave/tab switch
  useEffect(() => {
    if (!hackathonId || !codingQuestions.length || !codes.length) return;

    const hackathonName = localStorage.getItem('currentHackathon');

    // Create auto-submit handler for coding exam
    const { handleAutoSubmit } = createAutoSubmitHandler({
      backendUrl,
      hackathonId,
      hackathonName,
      userData,
      navigate,
      isCodingPage: true,
      currentCodes: codes,
      currentLanguages: selectedLanguages,
      codingQuestions,
      languageMap,
    });

    // Setup auto-submit event listeners
    const cleanup = setupAutoSubmitListeners(handleAutoSubmit);

    // Show warning on tab switch (in addition to auto-submit)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error('⚠️ WARNING: Your exam is being auto-submitted due to tab switching!', {
          position: 'top-center',
          autoClose: 5000,
          style: { backgroundColor: '#ff4444', color: '#fff' }
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanup();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hackathonId, codingQuestions.length, codes.length, codes, selectedLanguages, codingQuestions, backendUrl, userData, languageMap, navigate]);

  // Warning on page unload (standard beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // debug: log suppression flags
      try { console.debug('beforeunload fired - __suppress_beforeunload=', window.__suppress_beforeunload, 'session=', sessionStorage.getItem('suppress_beforeunload')); } catch (err) {}
      if (window.__suppress_beforeunload === true) return;
      if (sessionStorage.getItem('suppress_beforeunload') === '1') return;
      e.preventDefault();
      e.returnValue = 'Your exam is being auto-submitted.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Disable right-click (context menu) - main level
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.warning('Right-click is disabled during the exam', {
        position: 'top-center',
        autoClose: 3000
      });
      return false;
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Disable copy-paste - main level
  useEffect(() => {
    const handleCopyPaste = (e) => {
      e.preventDefault();
      toast.warning('Copy-paste is disabled during the exam', {
        position: 'top-center',
        autoClose: 3000
      });
      return false;
    };
    
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, []);

  // clear any transient suppression flag when entering this page
  useEffect(() => {
    try { sessionStorage.removeItem('suppress_beforeunload'); } catch (e) {}
    try { window.__suppress_beforeunload = false; } catch (e) {}
  }, []);

  // Prevent back navigation to MCQ section once in coding - STRICT LINEAR FLOW
  useEffect(() => {
    try {
      const section = localStorage.getItem('hackathon_section');
      const hackId = localStorage.getItem('hackathonId');
      
      if (!hackId) {
          // No valid exam session, redirect to instructions (avoid sending user to home unexpectedly)
          navigate('/HackathonExam/ExamInstructions', { replace: true });
          return;
        }
      
      if (section !== 'coding') {
        // Not in coding section yet, redirect based on current section
        if (section === 'mcq') {
          alert('Please complete MCQ section first');
          navigate('/HackathonExam/ExamInterface');
        } else {
          navigate('/HackathonExam/ExamInstructions');
        }
        return;
      }
    } catch (e) {}

    // block browser back - STRICT NO GOING BACK
    const onPop = () => {
      window.history.pushState(null, null, window.location.href);
      toast.warning('You cannot go back to MCQ section. You can only proceed to submit the exam.');
    };
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  // handle exam end when coding timer reaches zero (only once)
  const codingHandledRef = useRef(false);
  useEffect(() => {
    if (timeLeft === 0 && !codingHandledRef.current) {
      codingHandledRef.current = true;
      clearInterval(timerRef.current);
      toast.info('Exam time is up');
      (async () => {
        try {
          await submitCode();
        } catch (e) {
          console.error('submit on timeout failed', e);
        } finally {
          // Clear exam data and redirect
          try {
            localStorage.removeItem('hackathonId');
            localStorage.removeItem('currentHackathon');
            localStorage.removeItem('hackathon_section');
            localStorage.removeItem('hackathon_mcq_answers');
            localStorage.removeItem('hackathon_correct_answers');
          } catch (e) {}
              navigate('/');
        }
      })();
    }
  }, [timeLeft]);

  // Fetch coding questions for specific hackathon created by admin
  useEffect(() => {
    if (!hackathonId) return;
    
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/hackathon/${hackathonId}/coding-questions`);
        if (data && data.success && Array.isArray(data.codingQuestions) && !cancelled) {
          // Normalize shape: statement, samples (empty), testcases with expected
          const qs = data.codingQuestions.map((q) => ({
            _id: q._id,
            title: q.title || q.title,
            statement: q.description || q.title || '',
            samples: q.samples || [],
            testcases: (q.testcases || []).map((t) => ({ input: t.input, expected: t.expectedOutput || t.expected || '' })),
            language: q.language || 'python',
          }));

          setCodingQuestions(qs);
          setSelectedLanguages(qs.map((q) => q.language || 'python'));
          setCodes(qs.map(() => ''));
        }
      } catch (err) {
        console.error('Failed to fetch coding questions', err);
      }
    })();
    return () => { cancelled = true; };
  }, [backendUrl, hackathonId]);

  // Fetch section timings and available languages for this hackathon
  useEffect(() => {
    if (!hackathonId) return;
    let cancelled = false;

    (async () => {
      try {
        // section timings
        try {
          const { data } = await axios.get(`${backendUrl}/api/hackathon/${hackathonId}/schedule`);
          if (cancelled) return;
          const s = data && data.schedule ? data.schedule : data;
          let mcq = null, coding = null;
          if (s) {
            mcq = s.mcqDuration || s.mcq || s.mcqMinutes || null;
            coding = s.codingDuration || s.coding || s.codingMinutes || null;
          }
          if (mcq) localStorage.setItem('hackathon_mcq_duration', String(mcq));
          if (coding) localStorage.setItem('hackathon_coding_duration', String(coding));
          // if no saved running time, init timer
          try {
            const saved = localStorage.getItem('hackathon_coding_timeLeft');
            if (!saved && coding) setTimeLeft(parseInt(coding, 10) * 60);
          } catch (e) {}
        } catch (err) {
          console.warn('Failed to fetch hackathon schedule', err);
        }

        // languages
        try {
          const { data: langs } = await axios.get(`${backendUrl}/api/hackathon/${hackathonId}/languages`);
          if (cancelled) return;
          let arr = null;
          if (langs) {
            if (langs.success && Array.isArray(langs.languages)) arr = langs.languages;
            else if (Array.isArray(langs)) arr = langs;
            else if (Array.isArray(langs.languages)) arr = langs.languages;
          }
          if (Array.isArray(arr) && arr.length) {
            const normalized = Array.from(new Set(arr.map(normalizeLang)));
            setAvailableLanguages(normalized.filter(Boolean));
            try { localStorage.setItem('hackathon_languages', JSON.stringify(normalized)); } catch (e) {}
          }
        } catch (err) {
          console.warn('Failed to fetch languages', err);
        }
      } catch (err) {
        console.warn('Error fetching hackathon metadata', err);
      }
    })();

    return () => { cancelled = true; };
  }, [backendUrl, hackathonId]);

  // detect small screens/tabs and redirect to instructions if under threshold
  useEffect(() => {
    function check() {
      try { if (window.innerWidth <= 1200) navigate('/HackathonExam/ExamInstructions'); } catch (e) {}
    }
    check();
    function onResize() { try { if (window.innerWidth <= 1200) navigate('/HackathonExam/ExamInstructions'); } catch (e) {} }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Clear results when switching questions
  useEffect(() => {
    setResult("");
    setTestResults([]);
  }, [current]);

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function goNext() {
    if (current < codingQuestions.length - 1) setCurrent(current + 1);
  }

  function goPrev() {
    if (current > 0) setCurrent(current - 1);
  }

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

  const runCode = async (e) => {
    e.preventDefault();
    setResult("");

    const source = codes[current];
    const langKey = selectedLanguages[current] || "python";
    const lang_id = languageMap[langKey];
    const qlocal = codingQuestions[current] || {};
    // prefer explicit runInput, then first testcase input, then first sample input
    const input = (runInput && runInput.trim())
      || (qlocal.testcases && qlocal.testcases[0] && qlocal.testcases[0].input)
      || (qlocal.samples && qlocal.samples[0] && qlocal.samples[0].input)
      || "";

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

  // Run all testcases for current question and show pass/fail immediately
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

  async function submitCode() {
    try {
      toast.info("Evaluating all coding testcases... This may take a moment.");

      const mcqAnswers = JSON.parse(localStorage.getItem('hackathon_mcq_answers') || '[]');
      const correctAnswers = JSON.parse(localStorage.getItem('hackathon_correct_answers') || '[]');

      const mcqTotal = correctAnswers.length || 0;
      let mcqCorrect = 0;
      for (let i = 0; i < mcqTotal; i++) {
        if (mcqAnswers[i] !== null && mcqAnswers[i] !== undefined && mcqAnswers[i] === correctAnswers[i]) mcqCorrect++;
      }

      let totalTestcases = 0;
      let passedTestcases = 0;
      let codingDoneCount = 0;

      for (let qi = 0; qi < codingQuestions.length; qi++) {
        const q = codingQuestions[qi];
        const source = codes[qi] || "";
        if (!source.trim()) continue;
        codingDoneCount++;

        const langKey = selectedLanguages[qi] || 'python';
        const lang_id = languageMap[langKey];

        for (const tc of q.testcases) {
          totalTestcases++;

          try {
            const { data } = await axios.post(`${backendUrl}/api/compile`, {
              lang_id,
              code: source,
              input: tc.input,
            });

            const out = data.stdout ? atob(data.stdout).trim() : (data.stdout_raw || "");
            const expected = String(tc.expected || tc.expectedOutput || '').trim();

            if (out === expected) passedTestcases++;
          } catch (err) {
            console.error('testcase error', err);
          }
        }
      }

      // Weighted scoring: MCQs 50%, Coding 50%
      const mcqFraction = mcqTotal > 0 ? mcqCorrect / mcqTotal : 0;
      const codingFraction = totalTestcases > 0 ? passedTestcases / totalTestcases : 0;
      const finalScore = Math.round((mcqFraction * 50) + (codingFraction * 50));

      const payload = {
        studentName: userData?.name || null,
        hackathonId: hackathonId || null,
        mcq: { correct: mcqCorrect, total: mcqTotal },
        coding: { codingDoneCount, passedTestcases, totalTestcases },
        finalScore,
        timestamp: new Date().toISOString(),
      };

      // POST with retry/backoff
      const postWithRetry = async (url, body, attempts = 3, delayMs = 1000) => {
        for (let i = 0; i < attempts; i++) {
          try {
            const { data } = await axios.post(url, body, { withCredentials: true });
            return data;
          } catch (err) {
            console.warn('submit attempt failed', i + 1, err.message);
            if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i)));
            else throw err;
          }
        }
      };

      try {
        const data = await postWithRetry(`${backendUrl}/api/submitResult`, payload, 3, 1000);
        if (data.success) {
          toast.success('Score submitted successfully');
          // Hackathon is already marked as completed in submitResult
          // Do not exit the exam or navigate away here; user will use Exit button.
          try { localStorage.setItem('hackathon_submitted', '1'); } catch (e) {}
        } else {
          toast.error(data.message || 'Could not submit results');
        }
      } catch (err) {
        console.error('submit error', err);
      }
    } catch (error) {
      console.error(error);
      toast.error('Evaluation failed');
    }
  }

  // Handle exam exit with confirmation
  function handleExitExam() {
    setConfirmAction('exit');
    setShowConfirm(true);
  }

  function handleConfirmExit() {
    setShowConfirm(false);
    // Suppress beforeunload warning immediately before cleanup
    try { sessionStorage.setItem('suppress_beforeunload', '1'); } catch (e) {}
    try { window.__suppress_beforeunload = true; } catch (e) {}
    
    // Submit score before exiting (same logic as submitCode)
    (async () => {
      try {
        toast.info("Submitting your exam...");

        const mcqAnswers = JSON.parse(localStorage.getItem('hackathon_mcq_answers') || '[]');
        const correctAnswers = JSON.parse(localStorage.getItem('hackathon_correct_answers') || '[]');

        const mcqTotal = correctAnswers.length || 0;
        let mcqCorrect = 0;
        for (let i = 0; i < mcqTotal; i++) {
          if (mcqAnswers[i] !== null && mcqAnswers[i] !== undefined && mcqAnswers[i] === correctAnswers[i]) mcqCorrect++;
        }

        let totalTestcases = 0;
        let passedTestcases = 0;
        let codingDoneCount = 0;

        for (let qi = 0; qi < codingQuestions.length; qi++) {
          const q = codingQuestions[qi];
          const source = codes[qi] || "";
          if (!source.trim()) continue;
          codingDoneCount++;

          const langKey = selectedLanguages[qi] || 'python';
          const lang_id = languageMap[langKey];

          for (const tc of q.testcases) {
            totalTestcases++;

            try {
              const { data } = await axios.post(`${backendUrl}/api/compile`, {
                lang_id,
                code: source,
                input: tc.input,
              });

              const out = data.stdout ? atob(data.stdout).trim() : (data.stdout_raw || "");
              const expected = String(tc.expected || tc.expectedOutput || '').trim();

              if (out === expected) passedTestcases++;
            } catch (err) {
              console.error('testcase error', err);
            }
          }
        }

        // Weighted scoring: MCQs 50%, Coding 50%
        const mcqFraction = mcqTotal > 0 ? mcqCorrect / mcqTotal : 0;
        const codingFraction = totalTestcases > 0 ? passedTestcases / totalTestcases : 0;
        const finalScore = Math.round((mcqFraction * 50) + (codingFraction * 50));

        const payload = {
          studentName: userData?.name || null,
          hackathonId: hackathonId || null,
          mcq: { correct: mcqCorrect, total: mcqTotal },
          coding: { codingDoneCount, passedTestcases, totalTestcases },
          finalScore,
          timestamp: new Date().toISOString(),
        };

        // POST with retry/backoff
        const postWithRetry = async (url, body, attempts = 3, delayMs = 1000) => {
          for (let i = 0; i < attempts; i++) {
            try {
              const { data } = await axios.post(url, body, { withCredentials: true });
              return data;
            } catch (err) {
              console.warn('submit attempt failed', i + 1, err.message);
              if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i)));
              else throw err;
            }
          }
        };

        try {
          const data = await postWithRetry(`${backendUrl}/api/submitResult`, payload, 3, 1000);
          if (data.success) {
            toast.success('Exam submitted successfully via exit button');
            try { localStorage.setItem('hackathon_submitted', '1'); } catch (e) {}
          } else {
            toast.error(data.message || 'Could not submit results');
          }
        } catch (err) {
          console.error('submit error', err);
          toast.error('Failed to submit exam, but clearing session...');
        }
      } catch (error) {
        console.error(error);
        toast.error('Submission failed, but clearing session...');
      } finally {
        // Clear localStorage and navigate
        try {
          localStorage.removeItem('hackathonId');
          localStorage.removeItem('currentHackathon');
          localStorage.removeItem('hackathon_section');
          localStorage.removeItem('hackathon_mcq_answers');
          localStorage.removeItem('hackathon_correct_answers');
          localStorage.removeItem('hackathon_mcq_timeLeft');
          localStorage.removeItem('hackathon_coding_timeLeft');
        } catch (e) {
          console.error('Error clearing localStorage', e);
        }
        try { window.onbeforeunload = null; } catch (e) {}
        // Navigate to success page
        navigate('/HackathonExam/HackathonSuccess', { replace: true });
      }
    })();
  }

  if (!Array.isArray(codingQuestions) || codingQuestions.length === 0) {
    return <div className="exam-root" style={{ padding: 20 }}>Loading coding questions...</div>;
  }

  const q = codingQuestions[current];
  const isLastQuestion = current === codingQuestions.length - 1;

  // show only first two testcases/samples as visible examples
  const visibleSamples = (q.testcases && q.testcases.length > 0)
    ? q.testcases.slice(0, 2).map((t) => ({ input: t.input, output: t.expected || t.expectedOutput || '' }))
    : (q.samples || []).slice(0, 2).map((s) => ({ input: s.input, output: s.output || '' }));


  return (
    <div className="exam-root">
      {/* Styled Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#1e1e2e',
            border: '2px solid #ff9800',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '15px' }}>
              {confirmAction === 'exit' ? '❌' : '⚠️'}
            </div>
            <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '18px' }}>
              {confirmAction === 'exit' ? 'Exit Exam?' : 'Confirm Action'}
            </h3>
            <p style={{ color: '#ccc', marginBottom: '25px', lineHeight: '1.5' }}>
              {confirmAction === 'exit' 
                ? 'Are you sure you want to leave the exam? Before leaving, your exam you should submit the exam if not the examination score won\'t be saved.'
                : ''}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#555',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ff4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="topbar">
        <div className="title">Skyinten Hackathons</div>

        <div className="center-header">
          <div className="section-row">
            <div className="section-label">SECTION 2:</div>
            <div className="boxes">
              {codingQuestions.map((qst, idx) => (
                <button
                  key={qst._id || idx}
                  onClick={() => setCurrent(idx)}
                  className={`num-box ${idx === current ? "active" : ""}`}>
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="drag-tip">Tip: Drag this ◀ to resize and enlarge your code editor</div>
        </div>

        <div className="timer">Time: {formatTime(timeLeft)}</div>
      </header>

      <main ref={containerRef} className="content" style={{ display: 'flex', width: '100%' }}>
        {/* LEFT SIDE */}
        <section className="left" style={{ overflowY: "auto", width: `${leftWidth}%`, flex: '0 0 auto' }}>
          <h2>{q.title}</h2>

          <p className="question-text">{q.statement}</p>

          <h3>Sample Testcases:</h3>

          {visibleSamples.map((s, i) => (
            <div key={i} style={{ marginBottom: "14px" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Test Case - {i + 1}:</div>
              <div style={{ marginBottom: 6 }}><strong>Input:</strong></div>
              <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 6, whiteSpace: 'pre-wrap' }}>{s.input}</pre>
              <div style={{ marginTop: 8, marginBottom: 6 }}><strong>Output:</strong></div>
              <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 6, whiteSpace: 'pre-wrap' }}>{s.output}</pre>
            </div>
          ))}
        </section>
        <div className="splitter" onMouseDown={startDrag}>
          <div className={`splitter-handle ${isDragging ? 'dragging' : ''}`} aria-hidden>◀</div>
        </div>

        {/* RIGHT SIDE (fixed right edge) */}
        <aside className="right" style={{ flex: 1, minWidth: 0 }}>
          <h3>Write your code:</h3>
          <div style={{ marginBottom: 8 }}>
            <label style={{ marginRight: 8 }}>Language:</label>
            <select
              value={selectedLanguages[current]}
              onChange={(e) => {
                const copy = [...selectedLanguages];
                copy[current] = e.target.value;
                setSelectedLanguages(copy);
              }}
            >
              {availableLanguages.map((l) => (
                <option key={l} value={l}>
                  {l === 'cpp' ? 'C++' : l === 'javascript' ? 'JavaScript' : l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={runCode} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="editor-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
              <Editor
                value={codes[current]}
                onChange={(val) => {
                  const copy = [...codes];
                  copy[current] = val;
                  setCodes(copy);
                }}
                beforeMount={handleEditorWillMount}
                onMount={handleEditorDidMount}
                language={monacoLangMap[selectedLanguages[current] || 'python']}
                theme="skyinten-dark"
                options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, lineNumbers: 'on', lineHeight: 22, padding: { top: 8, bottom: 8 } }}
                height="360px"
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <label>Run Input (optional):</label>
              <textarea
                value={runInput}
                onChange={(e) => setRunInput(e.target.value)}
                placeholder="Provide input for quick run, e.g. 3 5"
                style={{ width: '100%', height: 26, fontFamily: 'monospace' }}
              />
            </div>

            <div className="controls" style={{ marginTop: "9px", marginBottom: "27px" }}>
              <button type="submit" className="control-btn run-btn">
                Run Code
              </button>
              <button type="button" className="control-btn run-btn" onClick={runTestsForCurrent}>
                Save Code
              </button>
              {isLastQuestion && (
                <>
                  <button type="button" className="control-btn submit-btn" onClick={submitCode}>
                    Submit Exam
                  </button>
                  <button type="button" className="control-btn exit-btn" onClick={handleExitExam}>
                    Exit Exam
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Results are rendered below the main content inside exam-root */}

        </aside>
      </main>

      {result && (
        <div className="result-panel" style={{ margin: '18px 36px' }}>
          <h4>Result:{result.status?.id === 3 ? '✅' : '❌'}</h4>

          <p>
            <strong>Status:</strong>{' '}
            {result.status?.description || result.status || "Not Accepted"}{' '}
            {/* {result.status?.description === 'Accepted' || result.status?.id === 3 ? '✅' : '❌'} */}
          </p>

          {/* {result.stdout && (
            <pre className="result-pre">Output: {atob(result.stdout)}</pre>
          )} */}

          {result.compile_output && (
            <pre className="result-pre error">Errors: {atob(result.compile_output)}</pre>
          )}
          {result.stderr && (
            <pre className="result-pre error">Stderr: {atob(result.stderr)}</pre>
          )}
        </div>
      )}

      {testResults.length > 0 && (
        <div className="test-results-panel" style={{ margin: '0 36px 36px' }}>
          <h4>Test Results ({testResults.filter(t => t.passed).length}/{testResults.length})</h4>
          <ul className="test-results-list">
            {testResults.map((t, i) => (
              <li key={i} className={`test-case ${t.passed ? 'pass' : 'fail'}`}>
                <div>
                  <strong>Test Case {i}:</strong> <strong>Expected:</strong> {t.expected} — <strong>Output:</strong> {t.output ?? '—'}
                  {t.error && <div className="error-text">{t.error}</div>}
                </div>
                <div style={{ alignSelf: 'center' }}>
                  <span className="test-status-emoji">{t.passed ? '✅' : '❌'}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {smallScreenWarning && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.6)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:99999}}>
          <div style={{backgroundColor:'#1e1e2e',padding:24,borderRadius:10,maxWidth:520,color:'#fff',textAlign:'center'}}>
            <h3 style={{marginBottom:12}}>Do Not Support in Phones and Tablets</h3>
            <p style={{color:'#ccc',marginBottom:18}}>This exam is not supported on small screens or tablet windows. Please open the exam on a desktop/laptop for best experience.</p>
            <div style={{display:'flex',justifyContent:'center',gap:12}}>
              <button onClick={() => navigate('/')} style={{padding:'8px 14px',background:'#555',color:'#fff',border:'none',borderRadius:6}}>Go Back</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}