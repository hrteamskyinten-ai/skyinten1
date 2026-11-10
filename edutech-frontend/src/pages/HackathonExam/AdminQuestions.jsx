import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/Appcontext';
import { toast } from 'react-toastify';

export default function AdminQuestions() {
  const { backendUrl } = useContext(AppContext);

  // Hackathon selection
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState("");

  // MCQ state (existing)
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ text: '', options: ['', '', '', ''], correctIndex: 0 });

  // Coding questions state
  const [tab, setTab] = useState('mcq');
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [codingLoading, setCodingLoading] = useState(false);
  const [codingEditing, setCodingEditing] = useState(null);
  const [codingForm, setCodingForm] = useState({ title: '', description: '', language: 'javascript', templateCode: '', testcases: [{ input: '', expectedOutput: '' }] });

  const fetchHackathons = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/hackathon/all/active`);
      if (data && data.success && data.hackathons) {
        const hacksList = Array.isArray(data.hackathons) ? data.hackathons : [];
        setHackathons(hacksList);
      } else {
        setHackathons([]);
      }
    } catch (err) {
      console.error('Error fetching hackathons:', err);
      setHackathons([]);
    }
  }, [backendUrl]);

  const fetchQuestions = useCallback(async () => {
    if (!selectedHackathonId) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/hackathon/${selectedHackathonId}/questions`);
      setQuestions(data.questions || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedHackathonId, backendUrl]);

  const fetchCodingQuestions = useCallback(async () => {
    if (!selectedHackathonId) return;
    setCodingLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/hackathon/${selectedHackathonId}/coding-questions`);
      setCodingQuestions(data.codingQuestions || []);
    } catch (err) {
      console.error('Error fetching coding questions:', err);
    } finally {
      setCodingLoading(false);
    }
  }, [selectedHackathonId, backendUrl]);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  useEffect(() => {
    if (selectedHackathonId) {
      fetchQuestions();
      fetchCodingQuestions();
    }
  }, [selectedHackathonId, fetchQuestions, fetchCodingQuestions]);

  function setOption(idx, val) {
    const opts = [...form.options];
    opts[idx] = val;
    setForm({ ...form, options: opts });
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!selectedHackathonId) {
      toast.error('Please select a hackathon');
      return;
    }
    try {
      if (editing) {
        const { data } = await axios.put(`${backendUrl}/api/hackathon/${selectedHackathonId}/questions/${editing}`, form, { withCredentials: true });
        if (data.success) {
          toast.success('Question updated');
          fetchQuestions();
          setEditing(null);
          setForm({ text: '', options: ['', '', '', ''], correctIndex: 0 });
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/hackathon/${selectedHackathonId}/questions`, form, { withCredentials: true });
        if (data.success) {
          toast.success('Question created');
          fetchQuestions();
          setForm({ text: '', options: ['', '', '', ''], correctIndex: 0 });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save question');
    }
  }

  function startEdit(q) {
    setEditing(q._id);
    setForm({ text: q.text, options: q.options || ['', '', '', ''], correctIndex: q.correctIndex || 0 });
  }

  async function removeQuestion(id) {
    if (!confirm('Delete question?')) return;
    if (!selectedHackathonId) {
      toast.error('Please select a hackathon');
      return;
    }
    try {
      const { data } = await axios.delete(`${backendUrl}/api/hackathon/${selectedHackathonId}/questions/${id}`, { withCredentials: true });
      if (data.success) {
        toast.success('Deleted');
        fetchQuestions();
      }
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  }

  // ---------- Coding functions ----------
  function setCodingField(field, value) {
    setCodingForm({ ...codingForm, [field]: value });
  }

  function setTestcase(idx, field, value) {
    const t = codingForm.testcases.map((tc, i) => i === idx ? { ...tc, [field]: value } : tc);
    setCodingForm({ ...codingForm, testcases: t });
  }

  function addTestcase() {
    setCodingForm({ ...codingForm, testcases: [...codingForm.testcases, { input: '', expectedOutput: '' }] });
  }

  function removeTestcase(idx) {
    const t = codingForm.testcases.filter((_, i) => i !== idx);
    setCodingForm({ ...codingForm, testcases: t.length ? t : [{ input: '', expectedOutput: '' }] });
  }

  async function submitCodingForm(e) {
    e.preventDefault();
    if (!selectedHackathonId) {
      toast.error('Please select a hackathon');
      return;
    }
    try {
      if (codingEditing) {
        const { data } = await axios.put(`${backendUrl}/api/hackathon/${selectedHackathonId}/coding-questions/${codingEditing}`, codingForm, { withCredentials: true });
        if (data.success) {
          toast.success('Coding question updated');
          fetchCodingQuestions();
          setCodingEditing(null);
          setCodingForm({ title: '', description: '', language: 'javascript', templateCode: '', testcases: [{ input: '', expectedOutput: '' }] });
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/hackathon/${selectedHackathonId}/coding-questions`, codingForm, { withCredentials: true });
        if (data.success) {
          toast.success('Coding question created');
          fetchCodingQuestions();
          setCodingForm({ title: '', description: '', language: 'javascript', templateCode: '', testcases: [{ input: '', expectedOutput: '' }] });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save coding question');
    }
  }

  function startEditCoding(q) {
    setCodingEditing(q._id);
    setCodingForm({ title: q.title || '', description: q.description || '', language: q.language || 'javascript', templateCode: q.templateCode || '', testcases: (q.testcases && q.testcases.length) ? q.testcases : [{ input: '', expectedOutput: '' }] });
  }

  async function removeCodingQuestion(id) {
    if (!confirm('Delete coding question?')) return;
    if (!selectedHackathonId) {
      toast.error('Please select a hackathon');
      return;
    }
    try {
      const { data } = await axios.delete(`${backendUrl}/api/hackathon/${selectedHackathonId}/coding-questions/${id}`, { withCredentials: true });
      if (data.success) {
        toast.success('Deleted');
        fetchCodingQuestions();
      }
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  }

  // ---------- Render ----------
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#fff' }}>Manage Hackathon Questions</h2>

      {/* Hackathon Selection */}
      <div style={{ marginBottom: 20, padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 500, color: '#fff' }}>Select Hackathon:</label>
        <select 
          value={selectedHackathonId} 
          onChange={(e) => setSelectedHackathonId(e.target.value)}
          style={{ 
            padding: 10, 
            fontSize: 14, 
            borderRadius: 4, 
            border: '1px solid #555',
            backgroundColor: '#222',
            color: '#fff',
            minWidth: 350,
            cursor: 'pointer'
          }}
        >
          <option value="">-- Select a Hackathon --</option>
          {hackathons.map((hack) => (
            <option key={hack._id} value={hack._id}>
              {hack.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedHackathonId ? (
        <div style={{ padding: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, color: '#aaa', textAlign: 'center' }}>
          <p>Please select a hackathon to manage its questions</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <button onClick={() => setTab('mcq')} disabled={tab === 'mcq'} style={{ marginRight: 8 }}>MCQs</button>
            <button onClick={() => setTab('coding')} disabled={tab === 'coding'}>Coding Questions</button>
          </div>

          {tab === 'mcq' && (
            <>
              <form onSubmit={submitForm} style={{ marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#fff' }}>Question text</label>
                  <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} style={{ width: '100%', minHeight: 80 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  {form.options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ color: '#fff' }}>Option {i + 1}</label>
                        <input value={opt} onChange={(e) => setOption(i, e.target.value)} style={{ width: '100%' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ fontSize: 12, color: '#fff' }}>Correct</label>
                        <input
                          type="radio"
                          name="correctOption"
                          checked={form.correctIndex === i}
                          onChange={() => setForm({ ...form, correctIndex: i })}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12 }}>
                  <button type="submit">{editing ? 'Update Question' : 'Create Question'}</button>
                  {editing && <button type="button" onClick={() => { setEditing(null); setForm({ text: '', options: ['', '', '', ''], correctIndex: 0 }); }}>Cancel</button>}
                </div>
              </form>

              <h3 style={{ color: '#fff' }}>Existing Questions</h3>
              {loading ? <div>Loading...</div> : (
                <div>
                  {questions.map((q) => (
                    <div key={q._id} style={{ background: '#fff', padding: 12, marginBottom: 8, borderRadius: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{q.text}</div>
                          <div style={{ marginTop: 6 }}>
                            {q.options && q.options.map((o, idx) => (
                              <div key={idx} style={{ color: idx === q.correctIndex ? 'green' : '#333' }}>{String.fromCharCode(65 + idx)}. {o}</div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <button onClick={() => startEdit(q)}>Edit</button>
                          <button onClick={() => removeQuestion(q._id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'coding' && (
            <>
              <form onSubmit={submitCodingForm} style={{ marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#fff' }}>Title</label>
                  <input value={codingForm.title} onChange={(e) => setCodingField('title', e.target.value)} style={{ width: '100%' }} />
                </div>

                <div style={{ marginTop: 8 }}>
                  <label style={{ color: '#fff' }}>Description</label>
                  <textarea value={codingForm.description} onChange={(e) => setCodingField('description', e.target.value)} style={{ width: '100%', minHeight: 80 }} />
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#fff' }}>Language</label>
                    <input value={codingForm.language} onChange={(e) => setCodingField('language', e.target.value)} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ color: '#fff' }}>Template Code</label>
                    <input value={codingForm.templateCode} onChange={(e) => setCodingField('templateCode', e.target.value)} />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={{ color: '#fff' }}>Testcases</label>
                  {codingForm.testcases.map((tc, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginTop: 6 }}>
                      <input placeholder="input" value={tc.input} onChange={(e) => setTestcase(idx, 'input', e.target.value)} />
                      <input placeholder="expectedOutput" value={tc.expectedOutput} onChange={(e) => setTestcase(idx, 'expectedOutput', e.target.value)} />
                      <div>
                        <button type="button" onClick={() => removeTestcase(idx)}>Remove</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}>
                    <button type="button" onClick={addTestcase}>Add Testcase</button>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <button type="submit">{codingEditing ? 'Update Coding Question' : 'Create Coding Question'}</button>
                  {codingEditing && <button type="button" onClick={() => { setCodingEditing(null); setCodingForm({ title: '', description: '', language: 'javascript', templateCode: '', testcases: [{ input: '', expectedOutput: '' }] }); }}>Cancel</button>}
                </div>
              </form>

              <h3 style={{ color: '#fff' }}>Existing Coding Questions</h3>
              {codingLoading ? <div>Loading...</div> : (
                <div>
                  {codingQuestions.map((q) => (
                    <div key={q._id} style={{ background: '#fff', padding: 12, marginBottom: 8, borderRadius: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>{q.title} <span style={{ fontSize: 12, color: '#666' }}>({q.language})</span></div>
                          <div style={{ marginTop: 6 }}>{q.description}</div>
                          <div style={{ marginTop: 6 }}>
                            <strong>Testcases:</strong>
                            <div>
                              {(q.testcases || []).map((t, i) => (
                                <div key={i} style={{ fontSize: 13 }}>[{i+1}] in: {t.input}{' => '}out: {t.expectedOutput}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <button onClick={() => startEditCoding(q)}>Edit</button>
                          <button onClick={() => removeCodingQuestion(q._id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
