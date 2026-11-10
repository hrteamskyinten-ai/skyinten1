import React, { useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../../styles/examInterface.css";
import { AppContext } from "../../context/Appcontext";

export default function ExamInstructions() {
  const location = useLocation();
  // Priority: navigation state > localStorage (any time, not just during exam)
  const hackathonNameFromNav = location.state?.hackathonName;
  const hackathonIdFromStorage = localStorage.getItem('hackathonId');
  const currentHackathonNameFromStorage = localStorage.getItem('currentHackathon');

  // Use whichever is available
  const hackathonName = hackathonNameFromNav || currentHackathonNameFromStorage || null;

  const [visible, setVisible] = React.useState(false);
  const [smallScreenDetected, setSmallScreenDetected] = React.useState(false);
  const [smallScreenWarning, setSmallScreenWarning] = React.useState(false);
  const [schedule, setSchedule] = React.useState(null);
  const [mcqDuration, setMcqDuration] = React.useState(null);
  const [codingDuration, setCodingDuration] = React.useState(null);
  const [hackathon, setHackathon] = React.useState(null);
  const [mcqCount, setMcqCount] = React.useState(0);
  const [codingCount, setCodingCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  // Check if exam already completed - prevent restart (server-side check)
  React.useEffect(() => {
    if (!hackathonIdFromStorage) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/checkHackathonSubmitted/${hackathonIdFromStorage}`, { withCredentials: true });
        if (cancelled) return;
        if (data?.success && data?.submitted) {
          toast.warning('You have already completed this exam. It cannot be retaken.', {
            position: 'top-center',
            autoClose: 3000
          });
          // Navigate back to hackathon page and clear exam data
          const redirectName = hackathonName || currentHackathonNameFromStorage;
          const redirectUrl = redirectName ? `/hackathon/${encodeURIComponent(redirectName)}` : '/hackathons';
          setTimeout(() => {
            localStorage.removeItem('hackathonId');
            localStorage.removeItem('currentHackathon');
            localStorage.removeItem('hackathon_section');
            navigate(redirectUrl, { replace: true });
          }, 500);
        }
      } catch (err) {
        // fallback to localStorage if the server is unreachable
        const isCompleted = localStorage.getItem(`hackathon_${hackathonIdFromStorage}_completed`) === 'true';
        if (isCompleted) {
          toast.warning('You have already completed this exam. It cannot be retaken.', {
            position: 'top-center',
            autoClose: 3000
          });
          const redirectName = hackathonName || currentHackathonNameFromStorage;
          const redirectUrl = redirectName ? `/hackathon/${encodeURIComponent(redirectName)}` : '/hackathons';
          setTimeout(() => {
            localStorage.removeItem('hackathonId');
            localStorage.removeItem('currentHackathon');
            localStorage.removeItem('hackathon_section');
            navigate(redirectUrl, { replace: true });
          }, 500);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [hackathonIdFromStorage, navigate, backendUrl, hackathonName, currentHackathonNameFromStorage]);

  // Fetch hackathon data and questions
  React.useEffect(() => {
    (async () => {
      try {
        // Fetch all hackathons first
        const { data: hackData } = await axios.get(`${backendUrl}/api/hackathon/all`);
        if (!hackData.success || !hackData.hackathons) {
          setVisible(false);
          setLoading(false);
          return;
        }

        let hack = null;

        // Priority 1: If hackathonName from navigation state, use it (fresh page load from detail page)
        if (hackathonNameFromNav) {
          hack = hackData.hackathons.find(h => h.name === hackathonNameFromNav);
        }
        // Priority 2: If hackathonId in localStorage, use it (refresh scenario)
        else if (hackathonIdFromStorage) {
          hack = hackData.hackathons.find(h => h._id === hackathonIdFromStorage);
        }
        // Priority 3: If hackathon name in localStorage, use it (refresh without exam in progress)
        else if (currentHackathonNameFromStorage) {
          hack = hackData.hackathons.find(h => h.name === currentHackathonNameFromStorage);
        }
        // Priority 4: Fallback - no valid way to determine which hackathon
        else {
          setVisible(false);
          setLoading(false);
          return;
        }

        if (!hack) {
          setVisible(false);
          setLoading(false);
          return;
        }

        // Set the hackathon
        setHackathon(hack);

        // Persist to localStorage
        localStorage.setItem('currentHackathon', hack.name || '');
        localStorage.setItem('hackathonId', hack._id || '');

        // Fetch MCQs
        try {
          const { data: mcqData } = await axios.get(`${backendUrl}/api/hackathon/${hack._id}/questions`);
          setMcqCount(mcqData.questions?.length || 0);
        } catch (err) {
          console.error('Error fetching MCQs:', err);
          setMcqCount(0);
        }

        // Fetch coding questions
        try {
          const { data: codingData } = await axios.get(`${backendUrl}/api/hackathon/${hack._id}/coding-questions`);
          setCodingCount(codingData.codingQuestions?.length || 0);
        } catch (err) {
          console.error('Error fetching coding questions:', err);
          setCodingCount(0);
        }

        // Set schedule from hackathon
        if (hack.schedule) {
          setSchedule(hack.schedule);
        }

        // Fetch schedule for this hackathon and persist mcq/coding durations
        try {
          const { data: sched } = await axios.get(`${backendUrl}/api/hackathon/${hack._id}/schedule`);
          const s = sched && sched.schedule ? sched.schedule : sched;
          if (s) {
            const mcqMin = s.mcqDuration || s.mcq || s.mcqMinutes || null;
            const codingMin = s.codingDuration || s.coding || s.codingMinutes || null;
            if (mcqMin) {
              setMcqDuration(mcqMin);
              localStorage.setItem('hackathon_mcq_duration', String(mcqMin));
            }
            if (codingMin) {
              setCodingDuration(codingMin);
              localStorage.setItem('hackathon_coding_duration', String(codingMin));
            }
          }
        } catch (err) {
          console.warn('Failed to fetch hackathon schedule for durations', err);
        }

        // Check if exam is allowed NOW
        try {
          const { data: allowedData } = await axios.get(`${backendUrl}/api/hackathon/${hack._id}/allowed`);
          setVisible(allowedData.allowed === true);
        } catch (err) {
          console.error('Error checking if exam allowed:', err);
          setVisible(false);
        }
      } catch (err) {
        console.error('Error in ExamInstructions:', err);
        setVisible(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [backendUrl, hackathonNameFromNav, hackathonIdFromStorage, currentHackathonNameFromStorage]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // detect small screens/tabs (<= 1200px) but don't auto-show modal
  useEffect(() => {
    function check() {
      try {
        setSmallScreenDetected(window.innerWidth <= 1200);
      } catch (e) {
        setSmallScreenDetected(false);
      }
    }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // If an exam is already in progress, redirect to the appropriate page
  useEffect(() => {
    const section = localStorage.getItem('hackathon_section');
    if (section === 'mcq' || section === 'coding') {
      alert('Exam is already in progress. Redirecting to exam.');
      if (section === 'mcq') {
        navigate('/HackathonExam/ExamInterface');
      } else if (section === 'coding') {
        navigate('/HackathonExam/ExamInterfaceCode');
      }
    }
    // Do not add a popstate handler here; linear flow is enforced on the exam pages after start.
  }, []);

  async function startExam() {
    // If clicked on small screens, show the modal and do not start
    try {
      // if small screen detected, show the modal when Start is clicked
      if (smallScreenDetected) {
        setSmallScreenWarning(true);
        return;
      }
    } catch (e) { }
    try {
      // If hackathon object not loaded, try to get it from localStorage/storage
      let exam = hackathon;
      if (!exam || !exam._id) {
        const storedHackId = localStorage.getItem('hackathonId');
        const storedHackName = localStorage.getItem('currentHackathon');

        if (!storedHackId && !storedHackName) {
          alert('Hackathon information not found. Please go back and try again.');
          return;
        }

        // Fetch the hackathon data before starting
        try {
          const { data: hackData } = await axios.get(`${backendUrl}/api/hackathon/all`);
          if (hackData.success && hackData.hackathons) {
            exam = hackData.hackathons.find(h =>
              (storedHackId && h._id === storedHackId) ||
              (storedHackName && h.name === storedHackName)
            );
          }
        } catch (err) {
          console.error('Error fetching hackathon data:', err);
        }

        if (!exam) {
          alert('Hackathon information not found. Please go back and try again.');
          return;
        }
      }

      // Check if specific hackathon is allowed
      const res = await fetch(`${backendUrl}/api/hackathon/${exam._id}/allowed`);
      const data = await res.json();
      if (data && data.allowed) {
        // Mark section as MCQ to lock linear flow
        localStorage.setItem('hackathon_section', 'mcq');
        // Store hackathon name in localStorage for exam interface
        localStorage.setItem('currentHackathon', exam.name || '');
        localStorage.setItem('hackathonId', exam._id || '');
        window.location.href = "/HackathonExam/ExamInterface";
      } else {
        setVisible(false);
        alert('Exam cannot be started now. It is scheduled for a different time.');
      }
    } catch (err) {
      console.error('Error checking exam status:', err);
      alert('Unable to verify exam schedule. Please try again later.');
    }
  }

  if (loading) {
    return <div className="instructions-root"><div className="instructions-container"><p>Loading...</p></div></div>;
  }

  return (
    <div className="instructions-root">
      <div className="instructions-container">
        {/* Small screen warning modal */}
        {smallScreenWarning && (
          <div className="small_screen_popup" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 }}>
            <div style={{ backgroundColor: '#1e1e2e', padding: 24, borderRadius: 10, maxWidth: 520, color: '#fff', textAlign: 'center' }}>
              <h3 style={{ marginBottom: 12 }}>Do Not Support in Phones and Tablets</h3>
              <p style={{ color: '#ccc', marginBottom: 18 }}>This exam is not supported on small screens or tablet windows. Please open the exam on a desktop/laptop for best experience.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button onClick={() => navigate('/hackathons')} style={{ padding: '8px 14px', background: '#555', color: '#fff', border: 'none', borderRadius: 6 }}>Go Back</button>
              </div>
            </div>
          </div>
        )}

        <h1>Skyinten Hackathons - Instructions</h1>

        <p>
          Please read all instructions carefully before starting the assessment.
          Once you begin, the timer will start automatically.
        </p>

        <h2>Hackathon Structure</h2>
        <ul>
          <li>Section 1 : {mcqCount > 0 ? mcqCount : 17} MCQs</li>
          <li>Section 2 : {codingCount > 0 ? codingCount : 3} Coding questions</li>
          <li>{mcqDuration ? `${mcqDuration} minutes for section 1` : '15 minutes for section 1'}</li>
          <li>{codingDuration ? `${codingDuration} minutes for section 2` : '30 minutes for section 2'}</li>
        </ul>

        <h2>Timer Rules</h2>
        <ul>
          <li>Each section has a strict time limit.</li>
          <li>The timer does not stop if you reload or switch tabs.</li>
          <li>When the timer ends, your answers will be auto-submitted.</li>
        </ul>

        <h2>System Requirements</h2>
        <ul>
          <li>Use a laptop or desktop only. Mobile devices are not allowed.</li>
          <li>Ensure a stable internet connection throughout the exam.</li>
          <li>
            Keep your system fully charged or connected to a power source.
          </li>
          <li>Use the latest version of Chrome, Firefox, or Edge.</li>
        </ul>

        <h2>Browser & Tabs</h2>
        <ul>
          <li>
            Do not refresh, close, or reload the page once the exam starts.
          </li>
          <li>Do not open new tabs during the exam.</li>
          <li>
            Leaving the exam tab may trigger automatic submission or
            disqualification.
          </li>
          <li>
            Do not use external devices like calculators, phones, smartwatches,
            or notepads unless permitted.
          </li>
        </ul>

        <h2>Navigation</h2>
        <ul>
          <li>
            Use number buttons or previous-next buttons to move between MCQs.
          </li>
          <li>Move to Section 2 only after completing Section 1.</li>
          <li>Once you move to Section 2, you cannot return to Section 1.</li>
        </ul>

        {hackathon && (
          <h2>Exam Scheduled for: {hackathonName}</h2>
        )}

        {schedule && (
          <div style={{ marginBottom: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
            <strong>Schedule Info:</strong>
            <div>Start: {schedule.startDatetime ? new Date(schedule.startDatetime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : schedule.startTime || 'Not set'}</div>
            <div>End: {schedule.endDatetime ? new Date(schedule.endDatetime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : schedule.endTime || 'Not set'}</div>
          </div>
        )}

        {visible ? (
          <button className="start-btn" onClick={startExam}>
            Start Exam
          </button>
        ) : (
          <div style={{ marginTop: 20 }}>
            <div>Exam is not available at this time.</div>
            {schedule && (
              <div>
                Scheduled: {
                  schedule.startDatetime && schedule.endDatetime ?
                    `${new Date(schedule.startDatetime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} — ${new Date(schedule.endDatetime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST` :
                    schedule.startTime && schedule.endTime ? `${schedule.startTime} — ${schedule.endTime} IST` : 'TBA'
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}