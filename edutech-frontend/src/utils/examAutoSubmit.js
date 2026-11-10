import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * Auto-submit exam when student leaves, refreshes page, or switches tabs
 * Applicable for both MCQ and Coding sections
 * Navigates back to hackathon page after submission
 */

export const createAutoSubmitHandler = (config) => {
  const {
    backendUrl,
    hackathonId,
    hackathonName,
    userData,
    navigate,
    isCodingPage = false,
    currentCodes = [],
    currentLanguages = [],
    codingQuestions = [],
    languageMap = {},
    answers = [], // MCQ answers array
    questions = [], // MCQ questions array
  } = config;

  let isSubmitting = false;

  /**
   * Clean up exam data from localStorage
   */
  const cleanupExamData = () => {
    try {
      localStorage.removeItem('hackathonId');
      localStorage.removeItem('hackathon_section');
      localStorage.removeItem('hackathon_mcq_answers');
      localStorage.removeItem('hackathon_correct_answers');
      localStorage.removeItem('hackathon_mcq_timeLeft');
      localStorage.removeItem('hackathon_coding_timeLeft');
      localStorage.removeItem('hackathon_mcq_duration');
      localStorage.removeItem('hackathon_coding_duration');
      localStorage.removeItem('hackathon_submitted');
      localStorage.removeItem('currentHackathon');
    } catch (e) {
      console.error('Error cleaning up exam data:', e);
    }
  };

  /**
   * Submit MCQ exam with current answers
   * Fetches correct answers from server if not already in localStorage
   */
  const submitMCQExam = async () => {
    try {
      if (isSubmitting) return;
      isSubmitting = true;

      // Get correct answers from localStorage, or fetch from server if not available
      let correctAnswers = [];
      try {
        const saved = localStorage.getItem('hackathon_correct_answers');
        if (saved) {
          correctAnswers = JSON.parse(saved);
        } else {
          // If not in localStorage (e.g., refresh on MCQ page), fetch from server
          console.log('Fetching correct answers from server...');
          const { data } = await axios.get(
            `${backendUrl}/api/hackathon/${hackathonId}/correctAnswers`
          );
          if (data && data.success && Array.isArray(data.correctAnswers)) {
            correctAnswers = data.correctAnswers;
            localStorage.setItem('hackathon_correct_answers', JSON.stringify(correctAnswers));
          }
        }
      } catch (e) {
        console.error('Could not get correct answers', e);
        correctAnswers = [];
      }

      // Calculate MCQ score
      const mcqTotal = questions.length;
      let mcqCorrect = 0;
      for (let i = 0; i < answers.length; i++) {
        if (answers[i] !== null && answers[i] !== undefined && answers[i] === correctAnswers[i]) {
          mcqCorrect++;
        }
      }

      // For auto-submit on MCQ page, coding section is empty
      const payload = {
        studentName: userData?.name || null,
        hackathonId: hackathonId || null,
        mcq: { correct: mcqCorrect, total: mcqTotal },
        coding: { codingDoneCount: 0, passedTestcases: 0, totalTestcases: 0 },
        finalScore: Math.round(mcqCorrect / mcqTotal * 50), // 50% weight for MCQ
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(`${backendUrl}/api/submitResult`, payload, {
        withCredentials: true
      });

      // Mark hackathon as completed in localStorage to prevent re-entry
      if (response.data?.success) {
        try {
          localStorage.setItem(`hackathon_${hackathonId}_completed`, 'true');
          localStorage.setItem('hackathon_exam_completed', 'true');
        } catch (e) {}
        console.log('Auto-submit successful (MCQ)');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auto-submit failed (MCQ):', error);
      return false;
    } finally {
      isSubmitting = false;
    }
  };

  /**
   * Submit Coding exam with current code progress
   */
  const submitCodingExam = async () => {
    try {
      if (isSubmitting) return;
      isSubmitting = true;

      const mcqAnswers = JSON.parse(localStorage.getItem('hackathon_mcq_answers') || '[]');
      const correctAnswers = JSON.parse(localStorage.getItem('hackathon_correct_answers') || '[]');

      // Calculate MCQ correct answers
      const mcqTotal = correctAnswers.length || 0;
      let mcqCorrect = 0;
      for (let i = 0; i < mcqTotal; i++) {
        if (
          mcqAnswers[i] !== null &&
          mcqAnswers[i] !== undefined &&
          mcqAnswers[i] === correctAnswers[i]
        ) {
          mcqCorrect++;
        }
      }

      // Calculate coding score (test cases passed)
      let totalTestcases = 0;
      let passedTestcases = 0;
      let codingDoneCount = 0;

      for (let qi = 0; qi < codingQuestions.length; qi++) {
        const q = codingQuestions[qi];
        const source = currentCodes[qi] || '';
        if (!source.trim()) continue;
        codingDoneCount++;

        const langKey = currentLanguages[qi] || 'python';
        const lang_id = languageMap[langKey];

        for (const tc of (q.testcases || [])) {
          totalTestcases++;

          try {
            const { data } = await axios.post(`${backendUrl}/api/compile`, {
              lang_id,
              code: source,
              input: tc.input,
            });

            const out = data.stdout ? atob(data.stdout).trim() : (data.stdout_raw || '');
            const expected = String(tc.expected || tc.expectedOutput || '').trim();

            if (out === expected) passedTestcases++;
          } catch (err) {
            console.error('Testcase error during auto-submit:', err);
          }
        }
      }

      // Weighted scoring: MCQs 50%, Coding 50%
      const mcqFraction = mcqTotal > 0 ? mcqCorrect / mcqTotal : 0;
      const codingFraction = totalTestcases > 0 ? passedTestcases / totalTestcases : 0;
      const finalScore = Math.round(mcqFraction * 50 + codingFraction * 50);

      const payload = {
        studentName: userData?.name || null,
        hackathonId: hackathonId || null,
        mcq: { correct: mcqCorrect, total: mcqTotal },
        coding: { codingDoneCount, passedTestcases, totalTestcases },
        finalScore,
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(`${backendUrl}/api/submitResult`, payload, {
        withCredentials: true
      });

      // Mark hackathon as completed in localStorage to prevent re-entry
      if (response.data?.success) {
        try {
          localStorage.setItem(`hackathon_${hackathonId}_completed`, 'true');
          localStorage.setItem('hackathon_exam_completed', 'true');
        } catch (e) {}
        console.log('Auto-submit successful (Coding)');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auto-submit failed (Coding):', error);
      return false;
    } finally {
      isSubmitting = false;
    }
  };

  /**
   * Main auto-submit handler - determines which type of exam to submit
   * Then navigates back to hackathon page and cleans up
   * For beforeunload events (refresh/unload), uses window.location.href
   */
  const handleAutoSubmit = async (isBeforeUnload = false) => {
    let submitted = false;
    if (isCodingPage) {
      submitted = await submitCodingExam();
    } else {
      submitted = await submitMCQExam();
    }

    // Always navigate back to hackathon page after attempting to submit
    // Even if submission fails, close the exam
    if (submitted) {
      try {
        // Suppress beforeunload warning for final navigation
        window.__suppress_beforeunload = true;
        sessionStorage.setItem('suppress_beforeunload', '1');
      } catch (e) {}

      cleanupExamData();

      // Build redirect URL using hackathonName
      const redirectUrl = hackathonName ? `/hackathon/${encodeURIComponent(hackathonName)}` : '/';

      // Use appropriate navigation based on context
      if (isBeforeUnload) {
        // During beforeunload, use window.location.href for reliable redirect
        // Small timeout to ensure submission completes first
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 300);
      } else {
        // For normal navigation (tab switch), use React Router navigate
        setTimeout(() => {
          try {
            navigate(redirectUrl, { replace: true });
          } catch (err) {
            console.error('Navigation failed:', err);
            // Fallback redirect
            window.location.href = redirectUrl;
          }
        }, 300);
      }
    }
  };

  return { handleAutoSubmit, submitMCQExam, submitCodingExam, cleanupExamData };
};

/**
 * Setup event listeners for auto-submit on page unload/tab switch
 */
export const setupAutoSubmitListeners = (handleAutoSubmit) => {
  let hasAutoSubmitted = false;

  // Handle page unload/refresh - this is a beforeunload scenario
  const handleBeforeUnloadForAutoSubmit = (e) => {
    if (!hasAutoSubmitted && !window.__suppress_beforeunload) {
      hasAutoSubmitted = true;
      // Auto-submit is a beforeunload event, pass true to use window.location.href
      handleAutoSubmit(true).catch(err => console.error('Auto-submit on unload failed:', err));
    }
  };

  // Handle tab switching - this is NOT a beforeunload scenario
  const handleVisibilityChangeForAutoSubmit = () => {
    if (document.hidden && !hasAutoSubmitted) {
      hasAutoSubmitted = true;
      toast.error('⚠️ Tab switching detected! Your exam has been auto-submitted with current progress.', {
        position: 'top-center',
        autoClose: 5000,
        style: { backgroundColor: '#ff4444', color: '#fff' }
      });
      // Auto-submit on tab switch (not beforeunload), pass false to use navigate
      handleAutoSubmit(false).catch(err => console.error('Auto-submit on tab switch failed:', err));
    }
  };

  // Add event listeners
  window.addEventListener('beforeunload', handleBeforeUnloadForAutoSubmit);
  document.addEventListener('visibilitychange', handleVisibilityChangeForAutoSubmit);

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnloadForAutoSubmit);
    document.removeEventListener('visibilitychange', handleVisibilityChangeForAutoSubmit);
  };
};
