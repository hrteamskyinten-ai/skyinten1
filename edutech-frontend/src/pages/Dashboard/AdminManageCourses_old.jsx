import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/Appcontext';
import { toast } from 'react-toastify';
import ModuleAssignmentMCQForm from '../../components/ModuleAssignmentMCQForm';
import ModuleAssignmentCodingForm from '../../components/ModuleAssignmentCodingForm';

export default function AdminManageCourses() {
  const { backendUrl } = useContext(AppContext);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseModules, setCourseModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);

  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [topicForm, setTopicForm] = useState({ title: '', videoUrl: '' });
  const [assignmentForm, setAssignmentForm] = useState({ description: '', url: '' });
  const [editingTopicId, setEditingTopicId] = useState(null);

  const [showMCQForm, setShowMCQForm] = useState(false);
  const [showCodingForm, setShowCodingForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/courses/all`);
        if (data && data.success) setCourses(data.courses || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      }
    })();
  }, [backendUrl]);

  const fetchCourseModules = async (courseId) => {
    try {
      setLoadingModules(true);
      const { data } = await axios.get(`${backendUrl}/api/courses/${courseId}/modules`, { withCredentials: true });
      if (data.success) setCourseModules(data.modules || []);
    } catch (err) {
      console.error('Failed to fetch modules:', err);
      toast.error('Failed to load course modules');
    } finally {
      setLoadingModules(false);
    }
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    setSelectedModule(null);
    fetchCourseModules(courseId);
  };

  const handleModuleSubmit = async () => {
    if (!moduleForm.title || !moduleForm.description) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      let response;
      if (isEditingModule && selectedModule) {
        response = await axios.put(`${backendUrl}/api/courses/${selectedCourse}/modules/${selectedModule}`, moduleForm, { withCredentials: true });
      } else {
        response = await axios.post(`${backendUrl}/api/courses/${selectedCourse}/modules`, moduleForm, { withCredentials: true });
      }

      if (response.data.success) {
        toast.success(`Module ${isEditingModule ? 'updated' : 'created'} successfully`);
        setModuleForm({ title: '', description: '' });
        setIsEditingModule(false);
        setShowModuleForm(false);
        fetchCourseModules(selectedCourse);
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditingModule ? 'update' : 'create'} module`);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Delete module?')) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/courses/${selectedCourse}/modules/${moduleId}`, { withCredentials: true });
      if (data.success) {
        toast.success('Module deleted');
        fetchCourseModules(selectedCourse);
        setSelectedModule(null);
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleTopicSubmit = async () => {
    if (!topicForm.title) {
      toast.error('Please enter topic title');
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/courses/${selectedCourse}/modules/${selectedModule}/topics`,
        topicForm,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Topic created successfully');
        setTopicForm({ title: '', videoUrl: '' });
        setShowTopicForm(false);
        fetchCourseModules(selectedCourse);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create topic');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!confirm('Delete topic?')) return;
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/courses/${selectedCourse}/modules/${selectedModule}/topics/${topicId}`,
        { withCredentials: true }
      );
      if (data.success) {
        toast.success('Topic deleted');
        fetchCourseModules(selectedCourse);
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleAssignmentSubmit = async () => {
    if (!assignmentForm.description) {
      toast.error('Please enter assignment description');
      return;
    }

    try {
      let response;
      if (isEditingAssignment && selectedModule) {
        response = await axios.put(
          `${backendUrl}/api/courses/${selectedCourse}/modules/${selectedModule}/assignments`,
          assignmentForm,
          { withCredentials: true }
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/courses/${selectedCourse}/modules/${selectedModule}/assignments`,
          assignmentForm,
          { withCredentials: true }
        );
      }

      if (response.data.success) {
        toast.success(`Assignment ${isEditingAssignment ? 'updated' : 'created'} successfully`);
        setAssignmentForm({ description: '', url: '' });
        setIsEditingAssignment(false);
        setShowAssignmentForm(false);
        fetchCourseModules(selectedCourse);
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditingAssignment ? 'update' : 'create'} assignment`);
    }
  };

  const handleDeleteAssignment = async (moduleId) => {
    if (!confirm('Delete assignment?')) return;
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/courses/${selectedCourse}/modules/${moduleId}/assignments`,
        { withCredentials: true }
      );
      if (data.success) {
        toast.success('Assignment deleted');
        fetchCourseModules(selectedCourse);
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="page-welcome-card">
      <h2>Manage Courses (Admin)</h2>
      <p className="section-subtitle">Create and manage modules and topics for any course</p>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 'bold', marginRight: 10 }}>Select Course:</label>
        <select value={selectedCourse} onChange={(e) => handleCourseSelect(e.target.value)} style={{ padding: 8, borderRadius: 4 }}>
          <option value="">-- Choose a Course --</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {!selectedCourse ? (
        <div className="no-courses-alert">
          <p>Please select a course to manage its modules and topics.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <h3>Modules</h3>
            <button onClick={() => { setModuleForm({ title: '', description: '' }); setIsEditingModule(false); setShowModuleForm(true); }} style={{ padding: '8px 16px' }}>+ Add Module</button>
          </div>

          {showModuleForm && (
            <div style={{ marginBottom: 20 }}>
              <input placeholder="Module title" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} />
              <textarea placeholder="Module description" value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} />
              <div style={{ marginTop: 8 }}>
                <button onClick={handleModuleSubmit}>{isEditingModule ? 'Update Module' : 'Create Module'}</button>
                <button onClick={() => { setShowModuleForm(false); setIsEditingModule(false); setModuleForm({ title: '', description: '' }); }}>Cancel</button>
              </div>
            </div>
          )}

          {loadingModules ? <p>Loading modules...</p> : (
            <div className="modules-list">
              {courseModules.length === 0 ? <p>No modules created yet.</p> : courseModules.map((m) => (
                <div key={m._id} className="module-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>{m.title}</h4>
                    <div>
                      <button onClick={() => { setSelectedModule(selectedModule === m._id ? null : m._id); }}>{selectedModule === m._id ? 'Hide' : 'View'}</button>
                      <button onClick={() => { setModuleForm({ title: m.title, description: m.description }); setSelectedModule(m._id); setIsEditingModule(true); setShowModuleForm(true); }}>Edit</button>
                      <button onClick={() => handleDeleteModule(m._id)}>Delete</button>
                    </div>
                  </div>
                  <p>{m.description}</p>

                  {selectedModule === m._id && (
                    <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid #ddd' }}>
                      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                        {/* Topic Creation Section */}
                        <div style={{ flex: 1 }}>
                          <h5>Topics</h5>
                          {showTopicForm && (
                            <div style={{ marginBottom: 15, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                              <input
                                placeholder="Topic title"
                                value={topicForm.title}
                                onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                                style={{ display: 'block', width: '100%', padding: 8, marginBottom: 10, borderRadius: 4, border: '1px solid #ddd' }}
                              />
                              <input
                                placeholder="Video URL (optional)"
                                value={topicForm.videoUrl}
                                onChange={(e) => setTopicForm({ ...topicForm, videoUrl: e.target.value })}
                                style={{ display: 'block', width: '100%', padding: 8, marginBottom: 10, borderRadius: 4, border: '1px solid #ddd' }}
                              />
                              <button onClick={handleTopicSubmit} style={{ marginRight: 8 }}>Create Topic</button>
                              <button onClick={() => { setShowTopicForm(false); setTopicForm({ title: '', videoUrl: '' }); }}>Cancel</button>
                            </div>
                          )}
                          <button onClick={() => setShowTopicForm(true)} style={{ marginBottom: 10 }}>+ Add Topic</button>

                          {m.topics && m.topics.length > 0 && (
                            <div>
                              {m.topics.map((topic) => (
                                <div key={topic._id} style={{ marginTop: 10, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 4, border: '1px solid #eee' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div>
                                      <h6 style={{ margin: 0 }}>{topic.title}</h6>
                                      {topic.videoUrl && <a href={topic.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9em', color: '#0066cc' }}>Watch Video</a>}
                                    </div>
                                    <button onClick={() => handleDeleteTopic(topic._id)}>Delete</button>
                                  </div>

                                  {topic.assignment && (
                                    <div style={{ marginTop: 8, padding: 8, backgroundColor: '#e8f4f8', borderRadius: 4, border: '1px solid #b3d9e6' }}>
                                      <p style={{ margin: 0, marginBottom: 8 }}><strong>Assignment:</strong> {topic.assignment.description}</p>
                                      {topic.assignment.url && <a href={topic.assignment.url} target="_blank" rel="noopener noreferrer" style={{ marginRight: 10, color: '#0066cc' }}>View</a>}
                                      <button onClick={() => handleDeleteAssignment(topic._id)} style={{ padding: '4px 8px', fontSize: '0.9em', marginRight: 8 }}>Delete Assignment</button>
                                      <button onClick={() => { setMcqTopicId(topic._id); setShowMCQForm(true); }} style={{ padding: '4px 8px', fontSize: '0.9em', marginRight: 8, backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer' }}>+ MCQ</button>
                                      <button onClick={() => { setCodingTopicId(topic._id); setShowCodingForm(true); }} style={{ padding: '4px 8px', fontSize: '0.9em', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer' }}>+ Coding</button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Assignment Creation Section */}
                        <div style={{ flex: 1 }}>
                          <h5>Create Assignment for Topic</h5>
                          {m.topics && m.topics.length > 0 ? (
                            <>
                              <select 
                                value={selectedForAssignment || ''} 
                                onChange={(e) => setSelectedForAssignment(e.target.value)}
                                style={{ display: 'block', width: '100%', padding: 8, marginBottom: 10, borderRadius: 4, border: '1px solid #ddd' }}
                              >
                                <option value="">-- Select Topic --</option>
                                {m.topics.map((t) => (
                                  <option key={t._id} value={t._id}>{t.title}</option>
                                ))}
                              </select>

                              {selectedForAssignment && (
                                <>
                                  {showAssignmentForm && assignmentTopicId === selectedForAssignment && (
                                    <div style={{ marginBottom: 15, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                                      <input
                                        placeholder="Assignment description"
                                        value={assignmentForm.description}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                                        style={{ display: 'block', width: '100%', padding: 8, marginBottom: 8, borderRadius: 4, border: '1px solid #ddd' }}
                                      />
                                      <input
                                        placeholder="Assignment URL (optional)"
                                        value={assignmentForm.url}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, url: e.target.value })}
                                        style={{ display: 'block', width: '100%', padding: 8, marginBottom: 8, borderRadius: 4, border: '1px solid #ddd' }}
                                      />
                                      <button onClick={() => handleAssignmentSubmit(selectedForAssignment)} style={{ marginRight: 8 }}>Save Assignment</button>
                                      <button onClick={() => { setShowAssignmentForm(false); setAssignmentTopicId(null); setAssignmentForm({ description: '', url: '' }); }}>Cancel</button>
                                    </div>
                                  )}

                                  {!showAssignmentForm && (
                                    <button onClick={() => { setAssignmentTopicId(selectedForAssignment); setShowAssignmentForm(true); setAssignmentForm({ description: '', url: '' }); }} style={{ marginBottom: 10 }}>+ Add Assignment</button>
                                  )}
                                </>
                              )}
                            </>
                          ) : (
                            <p style={{ color: '#999', fontSize: '0.9em' }}>Create a topic first to add assignments</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showMCQForm && mcqTopicId && (
        <div style={{ marginTop: 20, padding: 20, backgroundColor: '#f5f5f5', borderRadius: 8, border: '2px solid #2196F3' }}>
          <h4>Create MCQ Question</h4>
          <ModuleAssignmentMCQForm
            courseId={selectedCourse}
            moduleId={selectedModule}
            topicId={mcqTopicId}
            onClose={() => { 
              setShowMCQForm(false); 
              setMcqTopicId(null); 
              fetchCourseModules(selectedCourse);
            }}
          />
          <button onClick={() => { setShowMCQForm(false); setMcqTopicId(null); }} style={{ marginTop: 15, padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Close MCQ Form</button>
        </div>
      )}

      {showCodingForm && codingTopicId && (
        <div style={{ marginTop: 20, padding: 20, backgroundColor: '#f5f5f5', borderRadius: 8, border: '2px solid #9C27B0' }}>
          <h4>Create Coding Question</h4>
          <ModuleAssignmentCodingForm
            courseId={selectedCourse}
            moduleId={selectedModule}
            topicId={codingTopicId}
            onClose={() => { 
              setShowCodingForm(false); 
              setCodingTopicId(null); 
              fetchCourseModules(selectedCourse);
            }}
          />
          <button onClick={() => { setShowCodingForm(false); setCodingTopicId(null); }} style={{ marginTop: 15, padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Close Coding Form</button>
        </div>
      )}
    </div>
  );
}
