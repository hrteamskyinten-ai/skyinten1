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
  const [topicFile, setTopicFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ description: '', url: '' });
  const [editingTopicId, setEditingTopicId] = useState(null);

  const [showMCQForm, setShowMCQForm] = useState(false);
  const [showCodingForm, setShowCodingForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');

  // Live classes (admin) states
  const [liveClasses, setLiveClasses] = useState([]);
  const [showLiveClassForm, setShowLiveClassForm] = useState(false);
  const [isEditingLiveClass, setIsEditingLiveClass] = useState(false);
  const [editingLiveClassId, setEditingLiveClassId] = useState(null);
  const [liveClassForm, setLiveClassForm] = useState({ title: '', meetLink: '', meetTime: '', status: 'scheduled' });
  const [tutors, setTutors] = useState([]);
  const [selectedTutorForMeet, setSelectedTutorForMeet] = useState('');

  const normalizeTutorId = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val._id || val.id || String(val) || fallback;
    return fallback;
  };

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
    fetchLiveClassesForCourse(courseId);
  };

  const fetchLiveClassesForCourse = async (courseId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/courses/${courseId}`, { withCredentials: true });
      if (data && (data.success || data.course)) {
        const course = data.course?.course || data.course;
        setLiveClasses(course.liveMeets || []);
      } else {
        setLiveClasses([]);
      }
    } catch (err) {
      console.error('Failed to fetch live classes for course:', err);
      setLiveClasses([]);
    }
  };

  // fetch tutors for admin to schedule on behalf of
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/tutors`, { withCredentials: true });
        if (data && data.success) setTutors(data.tutors || []);
      } catch (err) {
        console.error('Failed to load tutors for admin live classes', err);
      }
    })();
  }, [backendUrl]);

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
      let response;
      // If a file is selected, send multipart/form-data
      if (topicFile) {
        const formData = new FormData();
        formData.append('title', topicForm.title);
        // backend multer expects field name 'videoFile'
        formData.append('videoFile', topicFile);
        setUploading(true);
        if (isEditingTopic && editingTopicId) {
          response = await axios.put(
            `${backendUrl}/api/courses/${selectedCourse}/modules/${selectedModule}/topics/${editingTopicId}`,
            formData,
            { withCredentials: true }
          );
        } else {
          response = await axios.post(
            `${backendUrl}/api/courses/${selectedCourse}/modules/${selectedModule}/topics`,
            formData,
            { withCredentials: true }
          );
        }
        setUploading(false);
      } else {
        // Fallback to JSON payload when no file provided
        if (isEditingTopic && editingTopicId) {
          response = await axios.put(
            `${backendUrl}/api/courses/${selectedCourse}/modules/${selectedModule}/topics/${editingTopicId}`,
            topicForm,
            { withCredentials: true }
          );
        } else {
          response = await axios.post(
            `${backendUrl}/api/courses/${selectedCourse}/modules/${selectedModule}/topics`,
            topicForm,
            { withCredentials: true }
          );
        }
      }

      if (response.data.success) {
        toast.success(`Topic ${isEditingTopic ? 'updated' : 'created'} successfully`);
        setTopicForm({ title: '', videoUrl: '' });
        setTopicFile(null);
        setIsEditingTopic(false);
        setEditingTopicId(null);
        setShowTopicForm(false);
        fetchCourseModules(selectedCourse);
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditingTopic ? 'update' : 'create'} topic`);
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
    if (!assignmentForm.description || !assignmentForm.url) {
      toast.error('Please enter assignment description and URL');
      return;
    }

    try {
      // Backend uses PUT on '/assignment' to create/update
      const { data } = await axios.put(
        `${backendUrl}/api/courses/${selectedCourse}/modules/${selectedModule}/assignment`,
        assignmentForm,
        { withCredentials: true }
      );

      if (data && data.success) {
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
        `${backendUrl}/api/courses/${selectedCourse}/modules/${moduleId}/assignment`,
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
      <h2>Manage Courses</h2>
      <p className="section-subtitle">Create and manage course modules, topics, and assignments</p>

      {courses.length === 0 ? (
        <div className="no-courses-alert">
          <p>⚠️ No courses available.</p>
          <p>Contact admin to create or assign courses.</p>
        </div>
      ) : (
        <>
          {/* Course Selection */}
          <div className="course-selection" style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 'bold', marginRight: 10 }}>Select Course:</label>
            <select
              value={selectedCourse}
              onChange={(e) => handleCourseSelect(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">-- Choose a Course --</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCourse && (
            <>
              {/* Module Management */}
              <div className="module-section" style={{ marginBottom: 30 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <h3>Modules</h3>
                  <button
                    onClick={() => {
                      setModuleForm({ title: '', description: '' });
                      setIsEditingModule(false);
                      setShowModuleForm(true);
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Module
                  </button>
                </div>

                {loadingModules ? (
                  <p>Loading modules...</p>
                ) : courseModules.length === 0 ? (
                  <p>No modules created yet. Click "Add Module" to get started.</p>
                ) : (
                  <div className="modules-list">
                    {courseModules.map((module) => (
                      <div key={module._id} className="module-card" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: selectedModule === module._id ? '#f0f8ff' : '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <h4 style={{ margin: 0, color: '#4f46e5' }}>{module.title}</h4>
                          <div>
                            <button
                              onClick={() => setSelectedModule(selectedModule === module._id ? null : module._id)}
                              style={{
                                padding: '5px 10px',
                                marginRight: '5px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                              }}
                            >
                              {selectedModule === module._id ? 'Hide' : 'View'}
                            </button>
                            <button
                              onClick={() => {
                                setModuleForm({ title: module.title, description: module.description });
                                setSelectedModule(module._id);
                                setIsEditingModule(true);
                                setShowModuleForm(true);
                              }}
                              style={{
                                padding: '5px 10px',
                                marginRight: '5px',
                                backgroundColor: '#FF9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteModule(module._id)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p style={{ color: '#666', marginBottom: '10px' }}>{module.description}</p>

                        {selectedModule === module._id && (
                          <div className="module-details">
                            {/* Topics Section */}
                            <div style={{ marginBottom: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h5 style={{ color: 'black' }}>Topics</h5>
                                <button
                                  onClick={() => {
                                    setSelectedModule(module._id);
                                    setTopicForm({ title: '', videoUrl: '' });
                                    setIsEditingTopic(false);
                                    setEditingTopicId(null);
                                    setTopicFile(null);
                                    setShowTopicForm(true);
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#FF9800',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                  }}
                                >
                                + Add Topic
                              </button>
                            </div>

                            {module.topics && module.topics.length > 0 ? (
                              <ul style={{ listStyle: 'none', padding: 0 }}>
                                {module.topics.map((topic) => (
                                  <li key={topic._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', border: '1px solid #eee', borderRadius: '4px', marginBottom: '5px' }}>
                                    <div>
                                      <strong style={{ color: '#333' }}>{topic.title}</strong>
                                      <br />
                                      {topic.videoFile ? (
                                        <span style={{ color: '#666', fontSize: '12px' }}>
                                          📁 File: <a href={`${backendUrl}/api/courses/topics/${topic._id}/stream`} target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3' }}>
                                            Watch Video
                                          </a>
                                        </span>
                                      ) : topic.videoUrl ? (
                                        <span style={{ color: '#666', fontSize: '12px' }}>
                                          🔗 URL: <a href={topic.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3' }}>
                                            Watch Video
                                          </a>
                                        </span>
                                      ) : (
                                        <span style={{ color: '#999', fontSize: '12px' }}>No video</span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                      <button
                                        onClick={() => {
                                          setSelectedModule(module._id);
                                          setTopicForm({ title: topic.title, videoUrl: topic.videoUrl || '' });
                                          setIsEditingTopic(true);
                                          setEditingTopicId(topic._id);
                                          setTopicFile(null);
                                          setShowTopicForm(true);
                                        }}
                                        style={{
                                          padding: '3px 8px',
                                          backgroundColor: '#FF9800',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '3px',
                                          cursor: 'pointer',
                                          fontSize: '12px'
                                        }}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTopic(topic._id)}
                                        style={{
                                          padding: '3px 8px',
                                          backgroundColor: '#f44336',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '3px',
                                          cursor: 'pointer',
                                          fontSize: '12px'
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p style={{ color: '#999', fontStyle: 'italic' }}>No topics added yet.</p>
                            )}
                          </div>

                            {/* Assignment Section */}
                        <div style={{ marginTop: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h5 style={{ color: '#333' }}>Assignment</h5>
                            {module.assignment ? (
                              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => {
                                    setSelectedModule(module._id);
                                    const assignment = module.assignment;
                                    setAssignmentForm({ description: assignment.description, url: assignment.url });
                                    setIsEditingAssignment(true);
                                    setShowAssignmentForm(true);
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteAssignment(module._id)}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCourseId(selectedCourse);
                                    setSelectedModuleId(module._id);
                                    setShowMCQForm(true);
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#9C27B0',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                  title="Create MCQ assignment"
                                >
                                  📝 MCQ
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCourseId(selectedCourse);
                                    setSelectedModuleId(module._id);
                                    setShowCodingForm(true);
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#FF9800',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                  title="Create Coding assignment"
                                >
                                  💻 Coding
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => {
                                    setSelectedModule(module._id);
                                    setAssignmentForm({ description: '', url: '' });
                                    setIsEditingAssignment(false);
                                    setShowAssignmentForm(true);
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  + Assignment
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCourseId(selectedCourse);
                                    setSelectedModuleId(module._id);
                                    setShowMCQForm(true);
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#9C27B0',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                  title="Create MCQ assignment"
                                >
                                  📝 MCQ
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCourseId(selectedCourse);
                                    setSelectedModuleId(module._id);
                                    setShowCodingForm(true);
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#FF9800',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                  title="Create Coding assignment"
                                >
                                  💻 Coding
                                </button>
                              </div>
                            )}
                          </div>

                          {module.assignment && (
                            <div style={{ padding: '10px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                              <p style={{ color: '#333' }}>
                                <strong>Description:</strong> {module.assignment.description}
                              </p>
                              <p style={{ color: '#333' }}>
                                <strong>Assignment Link:</strong> <a href={module.assignment.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3' }}>Open Assignment</a>
                              </p>
                            </div>
                          )}
                          {!module.assignment && (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>No assignment set.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
                )}
            </div>

          {/* Live Classes Management (Admin) - mirrors TutorDashboard logic */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <h3>Live Classes Management</h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select value={selectedTutorForMeet} onChange={(e) => setSelectedTutorForMeet(e.target.value)} style={{ padding: '8px', borderRadius: 4 }}>
                  <option value="">-- Select Tutor --</option>
                  {tutors.map(t => (
                    <option key={t._id} value={t._id}>{t.name || t.email}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setShowLiveClassForm(!showLiveClassForm);
                    if (isEditingLiveClass) {
                      setIsEditingLiveClass(false);
                      setEditingLiveClassId(null);
                      setLiveClassForm({ title: '', meetLink: '', meetTime: '', status: 'scheduled' });
                    }
                  }}
                  style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                >
                  {showLiveClassForm ? 'Cancel' : '+ Schedule Live Class'}
                </button>
              </div>
            </div>

            {showLiveClassForm && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, padding: 20, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 20 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#333' }}>Class Title</label>
                  <input type="text" placeholder="e.g., Advanced JavaScript Concepts" value={liveClassForm.title} onChange={(e) => setLiveClassForm({ ...liveClassForm, title: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#333' }}>Meet Link</label>
                  <input type="url" placeholder="https://meet.google.com/xxx-xxxx-xxx" value={liveClassForm.meetLink} onChange={(e) => setLiveClassForm({ ...liveClassForm, meetLink: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#333' }}>Scheduled Date & Time</label>
                  <input type="datetime-local" value={liveClassForm.meetTime} onChange={(e) => setLiveClassForm({ ...liveClassForm, meetTime: e.target.value })} style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                </div>

                <button
                  onClick={async () => {
                    if (!selectedTutorForMeet) { toast.error('Please select a tutor'); return; }
                    if (!liveClassForm.title || !liveClassForm.meetLink || !liveClassForm.meetTime) { toast.error('Please fill in all fields'); return; }
                    try {
                      const endpoint = isEditingLiveClass ? `${backendUrl}/api/tutor/update-meet/${selectedTutorForMeet}/${editingLiveClassId}` : `${backendUrl}/api/tutor/upload-meet`;
                      const method = isEditingLiveClass ? 'PUT' : 'POST';
                      let res;
                      if (method === 'POST') {
                        res = await axios.post(endpoint, { tutorId: selectedTutorForMeet, courseId: selectedCourse, title: liveClassForm.title, meetLink: liveClassForm.meetLink, meetTime: liveClassForm.meetTime, status: liveClassForm.status || 'scheduled' }, { withCredentials: true });
                      } else {
                        res = await axios.put(endpoint, { title: liveClassForm.title, meetLink: liveClassForm.meetLink, meetTime: liveClassForm.meetTime }, { withCredentials: true });
                      }
                      if (res?.data?.success) {
                        toast.success(isEditingLiveClass ? 'Live class updated successfully' : 'Live class scheduled successfully');
                        setLiveClassForm({ title: '', meetLink: '', meetTime: '', status: 'scheduled' });
                        setShowLiveClassForm(false);
                        setIsEditingLiveClass(false);
                        setEditingLiveClassId(null);
                        await fetchLiveClassesForCourse(selectedCourse);
                      } else {
                        console.error('Schedule/update failed', res?.data);
                        toast.error(res?.data?.message || 'Failed to schedule live class');
                      }
                    } catch (error) {
                      console.error('Live class schedule error:', error);
                      toast.error(error.response?.data?.message || 'Failed to schedule live class');
                    }
                  }}
                  style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                >
                  {isEditingLiveClass ? 'Update' : 'Schedule'} Live Class
                </button>

                <button onClick={() => { setShowLiveClassForm(false); setIsEditingLiveClass(false); setEditingLiveClassId(null); setLiveClassForm({ title: '', meetLink: '', meetTime: '', status: 'scheduled' }); }} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
              </div>
            )}

            {liveClasses && liveClasses.length > 0 ? (
              <div style={{ marginTop: 20 }}>
                <h4 style={{ marginBottom: 15, color: '#333' }}>Scheduled Classes</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 15 }}>
                  {liveClasses.map((liveClass) => (
                    <div key={liveClass._id || liveClass.meetId} style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8, backgroundColor: '#fff' }}>
                      <h5 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {liveClass.title}
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, backgroundColor: liveClass.status === 'live' ? '#ff5252' : liveClass.status === 'completed' ? '#4caf50' : '#ff9800', color: 'white' }}>
                          {liveClass.status === 'live' ? '🔴 Live' : liveClass.status === 'completed' ? '✓ Completed' : '📅 Scheduled'}
                        </span>
                      </h5>
                      <p style={{ margin: '5px 0', fontSize: 14, color: '#666' }}><strong>Time:</strong> {liveClass.meetTime ? new Date(liveClass.meetTime).toLocaleString() : ''}</p>
                      <p style={{ margin: '5px 0', fontSize: 14, color: '#666' }}><strong>Link:</strong> <a href={liveClass.meetLink} target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3' }}>Join Meet</a></p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: '#333', minWidth: 50 }}>Status:</label>
                          <select value={liveClass.status || 'scheduled'} onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              const tutorId = normalizeTutorId(liveClass.tutorId, selectedTutorForMeet);
                              const resp = await axios.put(`${backendUrl}/api/tutor/update-meet-status/${tutorId}/${liveClass.meetId || liveClass._id}`, { status: newStatus }, { withCredentials: true });
                              if (resp?.data?.success) {
                                toast.success(`Status updated to ${newStatus}`);
                                await fetchLiveClassesForCourse(selectedCourse);
                              } else {
                                console.error('Status update failed', resp?.data);
                                toast.error(resp?.data?.message || 'Failed to update status');
                              }
                            } catch (error) {
                              console.error('Error updating status:', error);
                              toast.error(error.response?.data?.message || 'Failed to update status');
                            }
                          }} style={{ padding: '6px 10px', borderRadius: 4 }}>
                            <option value="scheduled">Scheduled</option>
                            <option value="live">Live</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <button onClick={() => {
                            let formattedTime = '';
                            if (liveClass.meetTime) {
                              const date = new Date(liveClass.meetTime);
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              const hours = String(date.getHours()).padStart(2, '0');
                              const minutes = String(date.getMinutes()).padStart(2, '0');
                              formattedTime = `${year}-${month}-${day}T${hours}:${minutes}`;
                            }
                            setIsEditingLiveClass(true);
                            setEditingLiveClassId(liveClass.meetId || liveClass._id);
                            setSelectedTutorForMeet(normalizeTutorId(liveClass.tutorId, selectedTutorForMeet));
                            setLiveClassForm({ title: String(liveClass.title || ''), meetLink: String(liveClass.meetLink || ''), meetTime: formattedTime, status: liveClass.status || 'scheduled' });
                            setShowLiveClassForm(true);
                          }} style={{ padding: '6px 12px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>

                          <button onClick={async () => {
                            if (!window.confirm('Are you sure you want to delete this live class?')) return;
                            try {
                              const tutorId = normalizeTutorId(liveClass.tutorId, selectedTutorForMeet);
                              const meetIdToDelete = liveClass.meetId || liveClass._id;
                              const delRes = await axios.delete(`${backendUrl}/api/tutor/meet/${tutorId}/${meetIdToDelete}`, { withCredentials: true });
                              if (delRes?.data?.success) {
                                toast.success('Live class deleted successfully');
                                await fetchLiveClassesForCourse(selectedCourse);
                              } else {
                                console.error('Delete failed', delRes?.data);
                                toast.error(delRes?.data?.message || 'Failed to delete live class');
                              }
                            } catch (error) {
                              console.error('Delete error:', error);
                              toast.error(error.response?.data?.message || 'Failed to delete live class');
                            }
                          }} style={{ padding: '6px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: '#999', fontStyle: 'italic', marginTop: 15 }}>No live classes scheduled yet.</p>
            )}
          </div>
        </>
      )}
    </>
  )
}

{/* Module Form Modal */ }
{
  showModuleForm && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
        <h3>{isEditingModule ? 'Edit' : 'Create New'} Module</h3>
        <div className="form-group">
          <label>Module Title</label>
          <input type="text" style={{ color: 'black' }} value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} placeholder="Enter module title" />
        </div>
        <div className="form-group">
          <label>Module Description</label>
          <textarea style={{ color: 'black' }} value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} placeholder="Enter module description" rows="3" />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={() => { setShowModuleForm(false); setModuleForm({ title: '', description: '' }); setIsEditingModule(false); }} style={{ padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleModuleSubmit} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{isEditingModule ? 'Update' : 'Create'} Module</button>
        </div>
      </div>
    </div>
  )
}

{/* Topic Form Modal */ }
{
  showTopicForm && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
        <h3>{isEditingTopic ? 'Edit' : 'Add Topic to'} Module</h3>
        <div className="form-group">
          <label>Topic Title</label>
          <input style={{ color: 'black'}} type="text" value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} placeholder="Enter topic title" />
        </div>
        <div className="form-group">
          <label>Upload Video (optional)</label>
          <input style={{ color: 'black' }} type="file" accept="video/*" onChange={(e) => setTopicFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
          {topicFile && <div style={{ color: 'black', fontSize: '12px', marginTop: '6px' }}>Selected: {topicFile.name}</div>}
          {!topicFile && isEditingTopic && topicForm.videoUrl && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
              Current: <a href={topicForm.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3' }}>Existing Video</a>
            </div>
          )}
        </div>
        {/* <div className="form-group">
              <label>Video URL (alternative)</label>
              <input type="text" value={topicForm.videoUrl} onChange={(e) => setTopicForm({ ...topicForm, videoUrl: e.target.value })} placeholder="Enter video URL (optional)" />
            </div> */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={() => { setShowTopicForm(false); setTopicForm({ title: '', videoUrl: '' }); setIsEditingTopic(false); setEditingTopicId(null); setTopicFile(null); }} style={{ padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleTopicSubmit} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{isEditingTopic ? 'Update' : 'Add'} Topic</button>
        </div>
      </div>
    </div>
  )
}

{/* Assignment Form Modal */ }
{
  showAssignmentForm && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#2d2626', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
        <h3>{isEditingAssignment ? 'Edit' : 'Create New'} Assignment</h3>
        <div className="form-group">
          <label>Assignment Description</label>
          <textarea value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })} placeholder="Enter assignment description" rows="3" />
        </div>
        <div className="form-group">
          <label>Assignment URL</label>
          <input type="text" value={assignmentForm.url} onChange={(e) => setAssignmentForm({ ...assignmentForm, url: e.target.value })} placeholder="Enter assignment URL" />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={() => { setShowAssignmentForm(false); setAssignmentForm({ description: '', url: '' }); setIsEditingAssignment(false); }} style={{ padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleAssignmentSubmit} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{isEditingAssignment ? 'Update' : 'Create'} Assignment</button>
        </div>
      </div>
    </div>
  )
}

{/* MCQ Form Modal */ }
{
  showMCQForm && selectedModuleId && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001, overflowY: 'auto', padding: '12px' }}>
      <div style={{ backgroundColor: 'transparent', padding: '12px', borderRadius: '8px', width: '90%', maxWidth: '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0 }}>Create MCQ Question</h3>
          {/* rely on inner form 'X' close; provide small aria-hidden spacer */}
          <div style={{ width: 32 }} />
        </div>
        <div style={{ overflowY: 'auto', paddingRight: '8px' }}>
          <ModuleAssignmentMCQForm
            courseId={selectedCourseId}
            moduleId={selectedModuleId}
            topicId={selectedModuleId}
            onSuccess={() => { setShowMCQForm(false); setSelectedCourseId(''); setSelectedModuleId(''); fetchCourseModules(selectedCourse); }}
            onCancel={() => { setShowMCQForm(false); setSelectedCourseId(''); setSelectedModuleId(''); fetchCourseModules(selectedCourse); }}
          />
        </div>
      </div>
    </div>
  )
}

{/* Coding Form Modal */ }
{
  showCodingForm && selectedModuleId && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001, overflowY: 'auto', padding: '12px' }}>
      <div style={{ backgroundColor: 'transparent', padding: '12px', borderRadius: '8px', width: '90%', maxWidth: '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0 }}>Create Coding Question</h3>
          <div style={{ width: 32 }} />
        </div>
        <div style={{ overflowY: 'auto', paddingRight: '8px' }}>
          <ModuleAssignmentCodingForm
            courseId={selectedCourseId}
            moduleId={selectedModuleId}
            topicId={selectedModuleId}
            onSuccess={() => { setShowCodingForm(false); setSelectedCourseId(''); setSelectedModuleId(''); fetchCourseModules(selectedCourse); }}
            onCancel={() => { setShowCodingForm(false); setSelectedCourseId(''); setSelectedModuleId(''); fetchCourseModules(selectedCourse); }}
          />
        </div>
      </div>
    </div>
  )
}
    </div >
  );
}
