import React, { useEffect, useState, useRef, useContext } from "react";
import { toast } from 'react-toastify';
import axios from "axios";
import { AppContext } from "../../context/Appcontext";
import "../../styles/examInterface.css";
import { useNavigate } from 'react-router-dom';
import { createAutoSubmitHandler, setupAutoSubmitListeners } from "../../utils/examAutoSubmit";


export default function ExamInterface() {
  const DEFAULT_MINUTES = 15;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [smallScreenWarning, setSmallScreenWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const savedTime = localStorage.getItem('hackathon_mcq_timeLeft');
      if (savedTime) return parseInt(savedTime, 10);
      const dur = localStorage.getItem('hackathon_mcq_duration');
      if (dur) {
        const d = parseInt(dur, 10);
        if (!isNaN(d) && d > 0) return d * 60;
      }
    } catch (e) {}
    return DEFAULT_MINUTES * 60;
  });
  const [hackathonId, setHackathonId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const timerRef = useRef(null);
  const { backendUrl, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const isInitializedRef = useRef(false);

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

  // Fetch section timings if not persisted yet
  useEffect(() => {
    if (!hackathonId) return;
    const need = !localStorage.getItem('hackathon_mcq_duration') || !localStorage.getItem('hackathon_coding_duration');
    if (!need) return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/hackathon/${hackathonId}/schedule`);
        if (cancelled) return;
        const s = data && data.schedule ? data.schedule : data;
        let mcq = null;
        if (s) {
          mcq = s.mcqDuration || s.mcq || s.mcqMinutes || null;
          const coding = s.codingDuration || s.coding || s.codingMinutes || null;
          if (mcq) localStorage.setItem('hackathon_mcq_duration', String(mcq));
          if (coding) localStorage.setItem('hackathon_coding_duration', String(coding));
        }

        // if no saved running time, initialize timer
        try {
          const saved = localStorage.getItem('hackathon_mcq_timeLeft');
          if (!saved && mcq) setTimeLeft(parseInt(mcq, 10) * 60);
        } catch (e) {}
      } catch (err) {
        console.warn('Could not fetch hackathon schedule', err);
      }
    })();
    return () => { cancelled = true; };
  }, [backendUrl, hackathonId]);

  // Restore timer from localStorage on page load
  useEffect(() => {
    if (!isInitializedRef.current) {
      const savedTime = localStorage.getItem('hackathon_mcq_timeLeft');
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
      setTimeLeft((t) => {
        const newTime = t <= 1 ? 0 : t - 1;
        localStorage.setItem('hackathon_mcq_timeLeft', newTime);
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // detect small screens/tabs (<=1200px)
  useEffect(() => {
    function check() {
      try { if (window.innerWidth <= 1200) navigate('/HackathonExam/ExamInstructions'); } catch (e) {}
    }
    // run once on mount
    check();
    // also redirect immediately if resized below threshold
      function onResize() { try { if (window.innerWidth <= 1200) navigate('/HackathonExam/ExamInstructions'); } catch (e) {} }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Tab switching detection & Auto-submit on page leave/tab switch
  useEffect(() => {
    if (!hackathonId || !questions.length || !answers.length) return;

    const hackathonName = localStorage.getItem('currentHackathon');

    // Create auto-submit handler
    const { handleAutoSubmit } = createAutoSubmitHandler({
      backendUrl,
      hackathonId,
      hackathonName,
      userData,
      navigate,
      isCodingPage: false,
      answers,
      questions,
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
  }, [hackathonId, questions.length, answers.length, answers, questions, backendUrl, userData, navigate]);

  // Warning on page unload (standard beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // debug: log suppression flags
      try { console.debug('beforeunload fired - __suppress_beforeunload=', window.__suppress_beforeunload, 'session=', sessionStorage.getItem('suppress_beforeunload')); } catch (err) {}
      // don't show native dialog if we're performing a known programmatic navigation
      if (window.__suppress_beforeunload === true) return;
      if (sessionStorage.getItem('suppress_beforeunload') === '1') return;
      e.preventDefault();
      e.returnValue = 'Your exam is being auto-submitted.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Disable right-click (context menu)
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

  // Disable copy-paste
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

  // Fetch MCQs for specific hackathon from backend
  useEffect(() => {
    if (!hackathonId) return;
    
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${backendUrl}/api/hackathon/${hackathonId}/questions`);
        if (!cancelled) {
          if (data && data.success && Array.isArray(data.questions)) {
            setQuestions(data.questions);
          } else {
            setQuestions([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch MCQs', err);
        if (!cancelled) setQuestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [backendUrl, hackathonId]);

  // initialize answers array when questions load
  useEffect(() => {
    setAnswers(Array(questions.length).fill(null));
    setCurrent(0);
  }, [questions.length]);

  // Prevent back navigation to exam pages after exit
  useEffect(() => {
    // Check if user has valid exam session and is on MCQ section
    const hackId = localStorage.getItem('hackathonId');
    const section = localStorage.getItem('hackathon_section');
    
    if (!hackId || section !== 'mcq') {
      // No valid exam session or not on MCQ section, redirect
      if (section === 'coding') {
        navigate('/HackathonExam/ExamInterfaceCode');
      } else {
        navigate('/');
      }
      return;
    }

    // Prevent browser back button - strict linear flow
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      alert('You cannot go back during the exam. You can only move forward.');
    };
    
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function selectOption(idx) {
    const copy = [...answers];
    copy[current] = idx;
    setAnswers(copy);
  }

  function goNext() {
    if (current < questions.length - 1) setCurrent(current + 1);
  }

  function goPrev() {
    if (current > 0) setCurrent(current - 1);
  }

  function goToNextSection() {
    // Show styled confirmation
    setConfirmAction('nextSection');
    setShowConfirm(true);
  }

  function handleConfirmNextSection() {
    setShowConfirm(false);
    // Suppress beforeunload warning IMMEDIATELY to prevent timing issues
    try { sessionStorage.setItem('suppress_beforeunload', '1'); } catch (e) {}
    try { window.__suppress_beforeunload = true; console.debug('suppress_beforeunload set (MCQ -> Coding)'); } catch (e) {}
    
    // Save answers and fetch correct answers from server
    try {
      localStorage.setItem('hackathon_mcq_answers', JSON.stringify(answers));
    } catch (e) {
      console.error('Could not persist MCQ answers', e);
    }

    // mark section completed then fetch correct answers from backend then navigate
    try {
      localStorage.setItem('hackathon_section', 'coding');
    } catch (e) {}
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/hackathon/${hackathonId}/correctAnswers`);
        if (data && data.success && Array.isArray(data.correctAnswers)) {
          localStorage.setItem('hackathon_correct_answers', JSON.stringify(data.correctAnswers));
        } else if (questions.length) {
          const correctAnswers = Array.from({ length: questions.length }).map(() => 0);
          localStorage.setItem('hackathon_correct_answers', JSON.stringify(correctAnswers));
        } else {
          localStorage.setItem('hackathon_correct_answers', JSON.stringify([]));
        }
      } catch (err) {
        console.error('Failed to fetch correct answers', err);
        const correctAnswers = Array.from({ length: questions.length }).map(() => 0);
        localStorage.setItem('hackathon_correct_answers', JSON.stringify(correctAnswers));
      } finally {
          try { window.onbeforeunload = null; } catch (e) {}
          try { if (hackathonId) localStorage.setItem('hackathonId', hackathonId); } catch (e) {}
          navigate('/HackathonExam/ExamInterfaceCode', { replace: true });
      }
    })();
  }

  // If MCQ timer reaches zero, notify and navigate to coding section once
  const mcqHandledRef = useRef(false);
  useEffect(() => {
    if (timeLeft === 0 && !mcqHandledRef.current) {
      mcqHandledRef.current = true;
      clearInterval(timerRef.current);
      toast.info('Time is up for MCQs section');
      handleConfirmNextSection();
    }
  }, [timeLeft]);

  if (loading) return <div className="exam-root" style={{ padding: 20 }}>Loading questions...</div>;
  if (!loading && questions.length === 0) return <div className="exam-root" style={{ padding: 20 }}>No MCQs available.</div>;

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
            <div style={{ fontSize: '24px', marginBottom: '15px' }}>⚠️</div>
            <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '18px' }}>
              {confirmAction === 'nextSection' ? 'Proceed to Coding Section?' : 'Confirm Action'}
            </h3>
            <p style={{ color: '#ccc', marginBottom: '25px', lineHeight: '1.5' }}>
              {confirmAction === 'nextSection' 
                ? 'Are you sure you want to proceed to the next section? You won\'t be able to return to the MCQ section after this.'
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
                onClick={handleConfirmNextSection}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ff9800',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Proceed
              </button>
            </div>
          </div>
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

      <header className="topbar">
        <div className="title">Skyinten Hackathons</div>

        <div className="center-header">
          <div className="section-row">
            <div className="section-label">SECTION 1:</div>

            <div className="boxes">
            {questions.map((q, idx) => (
              <button
                key={q._id || q.id || idx}
                onClick={() => setCurrent(idx)}
                className={`num-box ${idx === current ? "active" : ""} ${answers[idx] !== null ? "answered" : ""}`}
              >
                {idx + 1}
              </button>
            ))}
            </div>
          </div>
        </div>

        <div className="timer">Timer: {formatTime(timeLeft)}</div>
      </header>

      <main className="content">
        <section className="left">
          <h3>Question {current + 1}:</h3>
          <p className="question-text">{questions[current].text}</p>
        </section>

        <aside className="right">
          <h4>Options :</h4>

          <div className="options">
            {(questions[current].options || []).map((opt, idx) => (
              <label
                key={idx}
                className={`option ${
                  answers[current] === idx ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  checked={answers[current] === idx}
                  onChange={() => selectOption(idx)}
                />
                <span>{String.fromCharCode(65 + idx)}.</span>
                <span>{opt}</span>
              </label>
            ))}
          </div>

          <div className="controls">
            {current > 0 && (
              <button className="control-btn" onClick={goPrev}>
                Previous question
              </button>
            )}

            {current < questions.length - 1 && (
              <button
                className="control-btn"
                onClick={goNext}
                disabled={answers[current] === null}
              >
                Next question
              </button>
            )}

            {current === questions.length - 1 && (
              <button
                className="control-btn"
                onClick={goToNextSection}
                disabled={answers[current] === null}
              >
                Next Section
              </button>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}