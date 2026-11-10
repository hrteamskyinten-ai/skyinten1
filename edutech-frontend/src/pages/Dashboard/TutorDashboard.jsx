import React, { useContext, useState, useRef, useEffect } from "react";
import "../../styles/studentDashboard.css";
import "../../styles/tutorDashboard.css";
import { AppContext } from "../../context/Appcontext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  FaBook,
  FaVideo,
  FaCheckCircle,
  FaQuestionCircle,
  FaClock,
  FaTasks,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import ModuleAssignmentMCQForm from "../../components/ModuleAssignmentMCQForm";
import ModuleAssignmentCodingForm from "../../components/ModuleAssignmentCodingForm";

const StatCard = ({ Icon, label, value, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ backgroundColor: color }}>
      <Icon style={{ fontSize: "20px" }} />
    </div>
    <div className="stat-info">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  </div>
);

function TutorDashboard() {
  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('tutorActiveTab') || 'home';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [videoMode, setVideoMode] = useState("file");
  const [file, setFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [meetTitle, setMeetTitle] = useState("");
  const [meetTime, setMeetTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutorResources, setTutorResources] = useState([]);
  const [resourcesTab, setResourcesTab] = useState("videos");
  const [editingResource, setEditingResource] = useState(null);
  const fileInputRef = useRef(null);

  // Course Management States
  const [selectedCourseForModules, setSelectedCourseForModules] = useState("");
  const [courseModules, setCourseModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "" });
  const [topicForm, setTopicForm] = useState({ title: "", videoUrl: "" });
  const [assignmentForm, setAssignmentForm] = useState({ description: "", url: "" });
  const [loadingModules, setLoadingModules] = useState(false);

  // Topic upload states
  const [topicMode, setTopicMode] = useState("url");
  const [topicFile, setTopicFile] = useState(null);
  const [topicVideoURL, setTopicVideoURL] = useState(null);
  const topicFileInputRef = useRef(null);

  // Module Assignment MCQ and Coding states
  const [showMCQForm, setShowMCQForm] = useState(false);
  const [showCodingForm, setShowCodingForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");

  // Live Classes Management States
  const [liveClasses, setLiveClasses] = useState([]);
  const [showLiveClassForm, setShowLiveClassForm] = useState(false);
  const [liveClassForm, setLiveClassForm] = useState({ title: "", meetLink: "", meetTime: "", status: "scheduled" });
  const [isEditingLiveClass, setIsEditingLiveClass] = useState(false);
  const [editingLiveClassId, setEditingLiveClassId] = useState(null);

  // Save activeTab to localStorage on change
  useEffect(() => {
    localStorage.setItem('tutorActiveTab', activeTab);
  }, [activeTab]);

  // Fetch assigned courses from userData in AppContext
  useEffect(() => {
    if (userData?.assignedCourses && Array.isArray(userData.assignedCourses)) {
      console.log('Setting assigned courses from userData:', userData.assignedCourses);
      setAssignedCourses(userData.assignedCourses);
    } else {
      console.log('No assigned courses in userData');
      setAssignedCourses([]);
    }
  }, [userData?.assignedCourses]);

  // Fetch tutor resources
  useEffect(() => {
    const fetchTutorResources = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/tutor/resources/${userData?._id}`,
          { withCredentials: true }
        );
        if (data.success) {
          console.log('Fetched resources:', data.resources);
          setTutorResources(data.resources || []);
        }
      } catch (error) {
        console.error('Failed to fetch tutor resources:', error);
        toast.error('Failed to fetch resources');
      }
    };
    if (userData?._id) {
      fetchTutorResources();
    }
  }, [userData?._id, backendUrl]);

  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/logout");
      if (data.success) {
        setUserData(false);
        setIsLoggedin(false);
        toast.success("Logged out successfully");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Course Management Functions
  const fetchCourseModules = async (courseId) => {
    try {
      setLoadingModules(true);
      const { data } = await axios.get(
        `${backendUrl}/api/courses/${courseId}/modules`,
        { withCredentials: true }
      );
      if (data.success) {
        setCourseModules(data.modules || []);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      toast.error('Failed to load course modules');
    } finally {
      setLoadingModules(false);
    }
  };

  const fetchLiveClassesForCourse = async (courseId) => {
    try {
      console.log('Fetching live classes for course:', courseId);
      const { data } = await axios.get(`${backendUrl}/api/courses/${courseId}`, {
        withCredentials: true
      });

      if (data.success || data.course) {
        const course = data.course.course || data.course;
        console.log('Fetched course data:', course);
        if (course.liveMeets) {
          console.log('Live classes with status:', course.liveMeets.map(m => ({ title: m.title, status: m.status })));
          setLiveClasses(course.liveMeets);
        } else {
          console.log('No liveMeets found in course');
          setLiveClasses([]);
        }
      }
    } catch (error) {
      console.error('Error fetching live classes:', error);
      setLiveClasses([]);
    }
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourseForModules(courseId);
    setSelectedModule(null);
    fetchCourseModules(courseId);
    fetchLiveClassesForCourse(courseId);
  };

  const handleModuleSubmit = async () => {
    if (!moduleForm.title || !moduleForm.description) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      let response;
      if (isEditingModule) {
        // Update module
        response = await axios.put(
          `${backendUrl}/api/courses/${selectedCourseForModules}/modules/${selectedModule}`,
          moduleForm,
          { withCredentials: true }
        );
      } else {
        // Create module
        response = await axios.post(
          `${backendUrl}/api/courses/${selectedCourseForModules}/modules`,
          moduleForm,
          { withCredentials: true }
        );
      }

      if (response.data.success) {
        toast.success(`Module ${isEditingModule ? 'updated' : 'created'} successfully`);
        setModuleForm({ title: '', description: '' });
        setIsEditingModule(false);
        setShowModuleForm(false);
        fetchCourseModules(selectedCourseForModules);
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditingModule ? 'update' : 'create'} module`);
    }
  };

  const handleTopicSubmit = async () => {
    if (!topicForm.title) {
      toast.error('Please enter topic title');
      return;
    }

    if (topicMode === "file" && !topicFile && !isEditingTopic) {
      toast.error('Please select a video file');
      return;
    }

    if (topicMode === "url" && !topicForm.videoUrl) {
      toast.error('Please enter video URL');
      return;
    }

    try {
      let config = { withCredentials: true };
      let uploadData;
      let response;

      if (topicMode === "file") {
        uploadData = new FormData();
        uploadData.append('title', topicForm.title);
        if (topicFile) {
          uploadData.append('videoFile', topicFile);
        }
        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        uploadData = {
          title: topicForm.title,
          videoUrl: topicForm.videoUrl
        };
      }

      if (isEditingTopic) {
        // Update topic
        response = await axios.put(
          `${backendUrl}/api/courses/${selectedCourseForModules}/modules/${selectedModule}/topics/${editingTopicId}`,
          uploadData,
          config
        );
      } else {
        // Add topic
        response = await axios.post(
          `${backendUrl}/api/courses/${selectedCourseForModules}/modules/${selectedModule}/topics`,
          uploadData,
          config
        );
      }

      if (response.data.success) {
        toast.success(`Topic ${isEditingTopic ? 'updated' : 'added'} successfully`);
        setTopicForm({ title: '', videoUrl: '' });
        setTopicFile(null);
        setTopicVideoURL(null);
        setTopicMode("url");
        setIsEditingTopic(false);
        setEditingTopicId(null);
        setShowTopicForm(false);
        fetchCourseModules(selectedCourseForModules);
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditingTopic ? 'update' : 'add'} topic`);
    }
  };

  const handleUpdateAssignment = async () => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/courses/${selectedCourseForModules}/modules/${selectedModule}/assignment`,
        assignmentForm,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success('Assignment updated successfully');
        setAssignmentForm({ description: '', url: '' });
        setIsEditingAssignment(false);
        setShowAssignmentForm(false);
        fetchCourseModules(selectedCourseForModules);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update assignment');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/courses/${selectedCourseForModules}/modules/${moduleId}`,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success('Module deleted successfully');
        fetchCourseModules(selectedCourseForModules);
        if (selectedModule === moduleId) {
          setSelectedModule(null);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete module');
    }
  };

  const handleDeleteTopic = async (moduleId, topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/courses/${selectedCourseForModules}/modules/${moduleId}/topics/${topicId}`,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success('Topic deleted successfully');
        fetchCourseModules(selectedCourseForModules);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete topic');
    }
  };

  const handleDeleteAssignment = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/courses/${selectedCourseForModules}/modules/${moduleId}/assignment`,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success('Assignment deleted successfully');
        fetchCourseModules(selectedCourseForModules);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete assignment');
    }
  };

  // Topic file handling functions
  const handleTopicFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setTopicFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setTopicVideoURL(url);
    }
  };

  const handleTopicDelete = () => {
    setTopicFile(null);
    setTopicVideoURL(null);
    if (topicFileInputRef.current) topicFileInputRef.current.value = "";
  };

  const handleTopicReplace = () => {
    if (topicFileInputRef.current) topicFileInputRef.current.click();
  };

  // Video file handling functions for resource upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setVideoURL(url);
    }
  };

  const handleDelete = () => {
    setFile(null);
    setVideoURL(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReplace = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Video Upload Handler
  const handleUploadVideo = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (!videoTitle) {
      toast.error('Please enter video title');
      return;
    }

    if (videoMode === "file" && !file) {
      toast.error('Please select or provide a video');
      return;
    }

    if (videoMode === "link" && !videoLink) {
      toast.error('Please provide a video link');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('tutorId', userData?._id);
      formData.append('courseId', selectedCourse);
      formData.append('title', videoTitle);

      if (videoMode === "file" && file) {
        formData.append('videoFile', file);
      } else if (videoMode === "link") {
        formData.append('videoLink', videoLink);
      }

      const { data } = await axios.post(
        `${backendUrl}/api/tutor/upload-video`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      if (data.success) {
        toast.success('Video uploaded successfully!');
        setVideoTitle('');
        setVideoLink('');
        setFile(null);
        setVideoURL(null);
        setSelectedCourse('');
        setVideoMode('file');
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        // Refresh tutor resources
        if (userData?._id) {
          const { data: resourcesData } = await axios.get(
            `${backendUrl}/api/tutor/resources/${userData?._id}`,
            { withCredentials: true }
          );
          if (resourcesData.success) {
            setTutorResources(resourcesData.resources || []);
          }
        }
      } else {
        toast.error(data.message || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  // Meet Upload Handler
  const handleUploadMeet = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    if (!meetTitle) {
      toast.error('Please enter meet title');
      return;
    }

    if (!meetLink) {
      toast.error('Please provide a meet link');
      return;
    }

    if (!meetTime) {
      toast.error('Please select a meet time');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/tutor/upload-meet`,
        {
          tutorId: userData?._id,
          courseId: selectedCourse,
          title: meetTitle,
          meetLink: meetLink,
          meetTime: meetTime
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success('Meet scheduled successfully!');
        setMeetTitle('');
        setMeetLink('');
        setMeetTime('');
        setSelectedCourse('');

        // Refresh tutor resources
        if (userData?._id) {
          const { data: resourcesData } = await axios.get(
            `${backendUrl}/api/tutor/resources/${userData?._id}`,
            { withCredentials: true }
          );
          if (resourcesData.success) {
            setTutorResources(resourcesData.resources || []);
          }
        }
      } else {
        toast.error(data.message || 'Failed to schedule meet');
      }
    } catch (error) {
      console.error('Error scheduling meet:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule meet');
    } finally {
      setLoading(false);
    }
  };

  // Delete Resource Handler
  const handleDeleteResource = async (resourceId, resourceType) => {
    if (!window.confirm(`Delete this ${resourceType}?`)) {
      return;
    }

    try {
      const endpoint = resourceType === 'video' 
        ? `${backendUrl}/api/tutor/video/${userData?._id}/${resourceId}`
        : `${backendUrl}/api/tutor/meet/${userData?._id}/${resourceId}`;

      const { data } = await axios.delete(endpoint, {
        withCredentials: true
      });

      if (data.success) {
        toast.success(`${resourceType === 'video' ? 'Video' : 'Meet'} deleted successfully`);
        
        // Refresh tutor resources
        if (userData?._id) {
          const { data: resourcesData } = await axios.get(
            `${backendUrl}/api/tutor/resources/${userData?._id}`,
            { withCredentials: true }
          );
          if (resourcesData.success) {
            setTutorResources(resourcesData.resources || []);
          }
        }
      } else {
        toast.error(data.message || `Failed to delete ${resourceType}`);
      }
    } catch (error) {
      console.error(`Error deleting ${resourceType}:`, error);
      toast.error(error.response?.data?.message || `Failed to delete ${resourceType}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="mobile-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✖" : "☰"}
        </div>

        <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
          <ul>
            <li
              className={activeTab === "home" ? "active" : ""}
              onClick={() => {
                setActiveTab("home");
                setMenuOpen(false);
              }}
            >
              Home
            </li>

            <li
              className={activeTab === "courses" ? "active" : ""}
              onClick={() => {
                setActiveTab("courses");
                setMenuOpen(false);
              }}
            >
              Your Assigned Courses
            </li>

            <li
              className={activeTab === "details" ? "active" : ""}
              onClick={() => {
                setActiveTab("details");
                setMenuOpen(false);
              }}
            >
              My Details
            </li>

            <li
              className={activeTab === "managecourses" ? "active" : ""}
              onClick={() => {
                setActiveTab("managecourses");
                setMenuOpen(false);
              }}
            >
              Manage Courses
            </li>

            <li
              className={activeTab === "myresources" ? "active" : ""}
              onClick={() => {
                setActiveTab("myresources");
                setMenuOpen(false);
              }}
            >
              My Resources
            </li>

            <li
              className={activeTab === "logout" ? "active" : ""}
              onClick={() => setShowLogoutConfirm(true)}
            >
              Logout
            </li>
          </ul>
        </aside>

        <main className="dashboard-main">
          {activeTab === "home" && (
            <div className="home-section">
              <div className="premium-banner">
                <div className="banner-content">
                  <h1>Welcome, {userData ? userData.name : "Tutor"}!</h1>
                  <p>
                    Manage your content and track student engagement with your courses.
                  </p>
                </div>
              </div>

              <div className="performance-metrics">
                <div className="metric-left">
                  <span className="metric-title">Overview</span>
                  <span className="metric-subtitle">tutor statistics</span>

                  <div className="progress-circle">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="circle"
                        strokeDasharray="0, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    <div className="progress-text">
                      <strong>{assignedCourses.length}</strong>
                      <small>Courses</small>
                    </div>
                  </div>
                </div>

                <div className="metric-right">
                  <StatCard
                    label="Total Students"
                    value="0"
                    color="#e0f7fa"
                    Icon={FaBook}
                  />
                  <StatCard
                    label="Total Videos"
                    value={userData?.tutorVideos?.length || "0"}
                    color="#fce4ec"
                    Icon={FaVideo}
                  />
                  <StatCard
                    label="Assigned Courses"
                    value={assignedCourses.length}
                    color="#f1f8e9"
                    Icon={FaCheckCircle}
                  />
                  <StatCard
                    label="Meet Sessions"
                    value={userData?.tutorMeets?.length || "0"}
                    color="#f3e5f5"
                    Icon={FaQuestionCircle}
                  />
                  <StatCard
                    label="Active Status"
                    value={userData?.verifiedStatus ? "Active" : "Pending"}
                    color="#fff8e1"
                    Icon={FaClock}
                  />
                  <StatCard
                    label="Student Reviews"
                    value="0/5"
                    color="#e8f5e9"
                    Icon={FaTasks}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="courses-section">
              <h2>Your Assigned Courses</h2>
              {assignedCourses.length === 0 ? (
                <div className="no-data-message">
                  <p>📚 You have no assigned courses yet.</p>
                  <p>Contact admin to assign courses to you.</p>
                </div>
              ) : (
                <div className="courses-table-container">
                  <table className="hack-results-table">
                    <thead>
                      <tr>
                        <th>Course Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedCourses.map((course) => (
                        <tr key={course._id}>
                          <td className="course-name-cell">{course.name}</td>
                          <td>{course.category || "—"}</td>
                          <td>${course.price || "—"}</td>
                          <td>{course.duration ? `${course.duration} hrs` : "—"}</td>
                          <td>
                            <span className={`status-badge ${course.active ? "active" : "inactive"}`}>
                              {course.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "details" && (
            <div className="details-section">
              <h2>My Profile Details</h2>
              <div className="details-card">
                <table className="details-info-table">
                  <tbody>
                    <tr>
                      <td className="detail-label">Name</td>
                      <td className="detail-value">{userData?.name || "—"}</td>
                    </tr>
                    <tr>
                      <td className="detail-label">Email</td>
                      <td className="detail-value">{userData?.email || "—"}</td>
                    </tr>
                    <tr>
                      <td className="detail-label">Account Status</td>
                      <td className="detail-value">
                        {userData?.verifiedStatus ? (
                          <span className="status-active">✅ Verified</span>
                        ) : (
                          <span className="status-pending">⏳ Pending Verification</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="detail-label">Assigned Courses</td>
                      <td className="detail-value">{assignedCourses.length}</td>
                    </tr>
                    <tr>
                      <td className="detail-label">Total Videos</td>
                      <td className="detail-value">{userData?.tutorVideos?.length || 0}</td>
                    </tr>
                    <tr>
                      <td className="detail-label">Scheduled Meets</td>
                      <td className="detail-value">{userData?.tutorMeets?.length || 0}</td>
                    </tr>
                    <tr>
                      <td className="detail-label">Member Since</td>
                      <td className="detail-value">
                        {userData?.createdAt
                          ? new Date(userData.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                    {userData?.phone && (
                      <tr>
                        <td className="detail-label">Phone</td>
                        <td className="detail-value">{userData.phone}</td>
                      </tr>
                    )}
                    {userData?.bio && (
                      <tr>
                        <td className="detail-label">Bio</td>
                        <td className="detail-value">{userData.bio}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

{activeTab === "videos" && (
  <div className="videos-section">
    <h2>Upload Course Resources</h2>
    <p className="section-subtitle">Add videos and meet links to your assigned courses</p>

    {assignedCourses.length === 0 ? (
      <div className="no-courses-alert">
        <p>⚠️ You have no assigned courses yet.</p>
        <p>Contact admin to assign courses to you.</p>
      </div>
    ) : (
      <div>
        {/* Add your video upload form here */}
      </div>
    )}
  </div>
)}

          {activeTab === "managecourses" && (
            <div className="page-welcome-card">
              <h2>Manage Courses</h2>
              <p className="section-subtitle">Create and manage course modules, topics, and assignments</p>

              {assignedCourses.length === 0 ? (
                <div className="no-courses-alert">
                  <p>⚠️ You have no assigned courses yet.</p>
                  <p>Contact admin to assign courses to you.</p>
                </div>
              ) : (
                <>
                  {/* Course Selection */}
                  <div className="course-selection" style={{ marginBottom: 20 }}>
                    <label style={{ fontWeight: 'bold', marginRight: 10 }}>Select Course:</label>
                    <select
                      value={selectedCourseForModules}
                      onChange={(e) => handleCourseSelect(e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="">-- Choose a Course --</option>
                      {assignedCourses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCourseForModules && (
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
                                        <h5 style={{ color: "black" }} >Topics</h5>
                                        <button
                                          onClick={() => {
                                            setSelectedModule(module._id);
                                            setTopicForm({ title: '', videoUrl: '' });
                                            setTopicMode('url');
                                            setTopicFile(null);
                                            setTopicVideoURL(null);
                                            setIsEditingTopic(false);
                                            setEditingTopicId(null);
                                            setShowTopicForm(true);
                                          }}
                                          style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#FF9800',
                                            color: 'black',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer'
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
                                                    setTopicMode(topic.videoFile ? 'file' : 'url');
                                                    if (topic.videoFile) {
                                                      // For file mode, we can't pre-populate the file input, but we can show the existing file
                                                      setTopicFile(null); // Reset file state
                                                      setTopicVideoURL(null);
                                                    } else {
                                                      setTopicFile(null);
                                                      setTopicVideoURL(null);
                                                    }
                                                    setIsEditingTopic(true);
                                                    setEditingTopicId(topic._id);
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
                                                  onClick={() => handleDeleteTopic(module._id, topic._id)}
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
                                                console.log("MCQ Button 1 Clicked - courseId:", selectedCourseForModules, "moduleId:", module._id);
                                                setSelectedCourseId(selectedCourseForModules);
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
                                                console.log("Coding Button 1 Clicked - courseId:", selectedCourseForModules, "moduleId:", module._id);
                                                setSelectedCourseId(selectedCourseForModules);
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
                                                console.log("MCQ Button 2 Clicked - courseId:", selectedCourseForModules, "moduleId:", module._id);
                                                setSelectedCourseId(selectedCourseForModules);
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
                                                console.log("Coding Button 2 Clicked - courseId:", selectedCourseForModules, "moduleId:", module._id);
                                                setSelectedCourseId(selectedCourseForModules);
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
                                          <p style={{ color: "#333" }}>
                                            <strong>Description:</strong> {module.assignment.description}
                                          </p>
                                          <p style={{ color: "#333" }}>
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
                    </>
                  )}
                </>
              )}

              <>
              {/* Module Form Modal */}
              {showModuleForm && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    width: '500px',
                    maxWidth: '90%'
                  }}>
                    <h3>{isEditingModule ? 'Edit' : 'Create New'} Module</h3>
                    <div className="form-group">
                      <label>Module Title</label>
                      <input
                        type="text"
                        value={moduleForm.title}
                        onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                        placeholder="Enter module title"
                      />
                    </div>
                    <div className="form-group">
                      <label>Module Description</label>
                      <textarea
                        value={moduleForm.description}
                        onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                        placeholder="Enter module description"
                        rows="3"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                      <button
                        onClick={() => {
                          setShowModuleForm(false);
                          setModuleForm({ title: '', description: '' });
                          setIsEditingModule(false);
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#999',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleModuleSubmit}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {isEditingModule ? 'Update' : 'Create'} Module
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Topic Form Modal */}
              {showTopicForm && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    width: '500px',
                    maxWidth: '90%'
                  }}>
                    <h3>{isEditingTopic ? 'Edit' : 'Add Topic to'} Module</h3>
                    <div className="form-group">
                      <label>Topic Title</label>
                      <input
                        style={{color: "black"}}
                        type="text"
                        value={topicForm.title}
                        onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                        placeholder="Enter topic title"
                      />
                    </div>
                    <div className="form-group">
                      <label>Video Source</label>
                      <div className="mode-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <button
                          type="button"
                          className={topicMode === "file" ? "active" : ""}
                          onClick={() => {
                            setTopicMode("file");
                            setTopicForm({ ...topicForm, videoUrl: '' });
                          }}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: topicMode === "file" ? '#4CAF50' : '#ddd',
                            color:  'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Upload File
                        </button>
                        
                      </div>
                    </div>

                    {topicMode === "file" && (
                      <div className="file-upload-section">
                        <input
                          ref={topicFileInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleTopicFileChange}
                          hidden
                        />
                        <div className="file-upload-box" onClick={() => topicFileInputRef.current?.click()} style={{
                          border: '2px dashed #ccc',
                          borderRadius: '4px',
                          padding: '20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          marginBottom: '10px'
                        }}>
                          <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>📁</p>
                          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Click to upload or drag and drop</p>
                          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>MP4, WebM, or other video formats</p>
                        </div>

                        {topicFile && (
                          <div className="file-preview" style={{
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: '#f9f9f9'
                          }}>
                            <div className="file-info" style={{ marginBottom: '10px' }}>
                              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: "black" }}>Selected: {topicFile.name}</p>
                              {topicVideoURL && <video controls src={topicVideoURL} style={{ maxWidth: '100%', height: '200px' }}></video>}
                            </div>
                            <div className="file-actions" style={{ display: 'flex', gap: '10px' }}>
                              <button
                                type="button"
                                onClick={handleTopicDelete}
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
                              <button
                                type="button"
                                onClick={handleTopicReplace}
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#2196F3',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '3px',
                                  cursor: 'pointer'
                                }}
                              >
                                Replace
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {topicMode === "url" && (
                      <div className="form-group">
                        <label>Video URL</label>
                        <input
                          type="url"
                          value={topicForm.videoUrl}
                          onChange={(e) => setTopicForm({ ...topicForm, videoUrl: e.target.value })}
                          placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                        />
                        {topicForm.videoUrl && (
                          <p style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                            Link: <a href={topicForm.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3' }}>Open</a>
                          </p>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                      <button
                        onClick={() => {
                          setShowTopicForm(false);
                          setTopicForm({ title: '', videoUrl: '' });
                          setTopicFile(null);
                          setTopicVideoURL(null);
                          setTopicMode("url");
                          setIsEditingTopic(false);
                          setEditingTopicId(null);
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#999',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleTopicSubmit}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {isEditingTopic ? 'Update' : 'Add'} Topic
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignment Form Modal */}
              {showAssignmentForm && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    width: '500px',
                    maxWidth: '90%'
                  }}>
                    <h3>{isEditingAssignment ? 'Edit' : 'Add'} Assignment</h3>
                    <div className="form-group">
                      <label>Assignment Description</label>
                      <textarea
                        value={assignmentForm.description}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                        placeholder="Enter assignment description"
                        rows="3"
                        style={{color:"black"}}
                      />
                    </div>
                    <div className="form-group">
                      <label>Assignment URL</label>
                      <input
                        style={{color: "black"}}
                        type="url"
                        value={assignmentForm.url}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, url: e.target.value })}
                        placeholder="Enter assignment URL"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                      <button
                        onClick={() => {
                          setShowAssignmentForm(false);
                          setAssignmentForm({ description: '', url: '' });
                          setIsEditingAssignment(false);
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#999',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateAssignment}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {isEditingAssignment ? 'Update' : 'Add'} Assignment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MCQ Form Modal */}
              {showMCQForm && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  zIndex: 2000,
                  overflowY: 'auto',
                  paddingTop: '40px',
                  paddingBottom: '40px'
                }}>
                  {console.log("MCQ Modal Rendering - selectedCourseId:", selectedCourseId, "selectedModuleId:", selectedModuleId)}
                  <ModuleAssignmentMCQForm
                    courseId={selectedCourseId}
                    moduleId={selectedModuleId}
                    onSuccess={() => setShowMCQForm(false)}
                    onCancel={() => setShowMCQForm(false)}
                  />
                </div>
              )}

              {/* Coding Form Modal */}
              {showCodingForm && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  zIndex: 2000,
                  overflowY: 'auto',
                  paddingTop: '40px',
                  paddingBottom: '40px'
                }}>
                  {console.log("Coding Modal Rendering - selectedCourseId:", selectedCourseId, "selectedModuleId:", selectedModuleId)}
                  <ModuleAssignmentCodingForm
                    courseId={selectedCourseId}
                    moduleId={selectedModuleId}
                    onSuccess={() => setShowCodingForm(false)}
                    onCancel={() => setShowCodingForm(false)}
                  />
                </div>
              )}

              {/* Live Classes Management Section */}
              {selectedCourseForModules && (
                <div className="live-classes-section" style={{ marginTop: 30, marginBottom: 30 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                    <h3>Live Classes Management</h3>
                    <button
                      onClick={() => {
                        setShowLiveClassForm(!showLiveClassForm);
                        if (isEditingLiveClass) {
                          setIsEditingLiveClass(false);
                          setEditingLiveClassId(null);
                          setLiveClassForm({ title: "", meetLink: "", meetTime: "" });
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {showLiveClassForm ? 'Cancel' : '+ Schedule Live Class'}
                    </button>
                  </div>

                  {showLiveClassForm && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '15px',
                        padding: '20px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        marginBottom: '20px'
                      }}
                    >
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                          Class Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Advanced JavaScript Concepts"
                          value={liveClassForm.title}
                          onChange={(e) =>
                            setLiveClassForm({ ...liveClassForm, title: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                          Meet Link
                        </label>
                        <input
                          type="url"
                          placeholder="https://meet.google.com/xxx-xxxx-xxx"
                          value={liveClassForm.meetLink}
                          onChange={(e) =>
                            setLiveClassForm({ ...liveClassForm, meetLink: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                          Scheduled Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={liveClassForm.meetTime}
                          onChange={(e) =>
                            setLiveClassForm({ ...liveClassForm, meetTime: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <button
                        onClick={async () => {
                          if (!liveClassForm.title || !liveClassForm.meetLink || !liveClassForm.meetTime) {
                            toast.error('Please fill in all fields');
                            return;
                          }

                          setLoading(true);
                          try {
                            const token = localStorage.getItem('token');
                            const endpoint = isEditingLiveClass
                              ? `${backendUrl}/api/tutor/update-meet/${userData?._id}/${editingLiveClassId}`
                              : `${backendUrl}/api/tutor/upload-meet`;

                            const method = isEditingLiveClass ? 'PUT' : 'POST';
                            
                            const config = {
                              headers: { Authorization: `Bearer ${token}` }
                            };

                            if (method === 'POST') {
                              await axios.post(
                                endpoint,
                                {
                                  tutorId: userData?._id,
                                  courseId: selectedCourseForModules,
                                  title: liveClassForm.title,
                                  meetLink: liveClassForm.meetLink,
                                  meetTime: liveClassForm.meetTime,
                                  status: liveClassForm.status || 'scheduled'
                                },
                                config
                              );
                            } else {
                              await axios.put(
                                endpoint,
                                {
                                  title: liveClassForm.title,
                                  meetLink: liveClassForm.meetLink,
                                  meetTime: liveClassForm.meetTime
                                },
                                config
                              );
                            }

                            toast.success(
                              isEditingLiveClass
                                ? 'Live class updated successfully'
                                : 'Live class scheduled successfully'
                            );

                            setLiveClassForm({ title: "", meetLink: "", meetTime: "", status: "scheduled" });
                            setShowLiveClassForm(false);
                            setIsEditingLiveClass(false);
                            setEditingLiveClassId(null);
                            
                            // Refresh live classes
                            await fetchLiveClassesForCourse(selectedCourseForModules);
                          } catch (error) {
                            console.error(error);
                            toast.error(
                              error.response?.data?.message || 'Failed to schedule live class'
                            );
                          } finally {
                            setLoading(false);
                          }
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
                        {isEditingLiveClass ? 'Update' : 'Schedule'} Live Class
                      </button>

                      <button
                        onClick={() => {
                          setShowLiveClassForm(false);
                          setIsEditingLiveClass(false);
                          setEditingLiveClassId(null);
                          setLiveClassForm({ title: "", meetLink: "", meetTime: "" });
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {liveClasses && liveClasses.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ marginBottom: '15px', color: '#333' }}>Scheduled Classes</h4>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: '15px'
                        }}
                      >
                        {liveClasses.map((liveClass) => (
                          <div
                            key={liveClass._id}
                            style={{
                              border: '1px solid #ddd',
                              padding: '15px',
                              borderRadius: '8px',
                              backgroundColor: '#fff'
                            }}
                          >
                            <h5 style={{ margin: '0 0 10px 0', color: '#333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              {liveClass.title}
                              <span
                                style={{
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  backgroundColor:
                                    liveClass.status === 'live'
                                      ? '#ff5252'
                                      : liveClass.status === 'completed'
                                      ? '#4caf50'
                                      : '#ff9800',
                                  color: 'white',
                                  marginLeft: '10px',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {liveClass.status === 'live'
                                  ? '🔴 Live'
                                  : liveClass.status === 'completed'
                                  ? '✓ Completed'
                                  : '📅 Scheduled'}
                              </span>
                            </h5>
                            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                              <strong>Time:</strong> {new Date(liveClass.meetTime).toLocaleString()}
                            </p>
                            <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                              <strong>Link:</strong>{' '}
                              <a
                                href={liveClass.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#2196F3' }}
                              >
                                Join Meet
                              </a>
                            </p>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                marginTop: '10px'
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '8px',
                                  alignItems: 'center'
                                }}
                              >
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#333', minWidth: '50px' }}>
                                  Status:
                                </label>
                                <select
                                  value={liveClass.status || 'scheduled'}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    try {
                                      const token = localStorage.getItem('token');
                                      console.log('Updating status:', {
                                        tutorId: userData?._id,
                                        meetId: liveClass.meetId || liveClass._id,
                                        newStatus
                                      });
                                      const response = await axios.put(
                                        `${backendUrl}/api/tutor/update-meet-status/${userData?._id}/${liveClass.meetId || liveClass._id}`,
                                        { status: newStatus },
                                        {
                                          headers: { Authorization: `Bearer ${token}` }
                                        }
                                      );
                                      console.log('Status update response:', response.data);
                                      toast.success(`Status updated to ${newStatus}`);
                                      await fetchLiveClassesForCourse(selectedCourseForModules);
                                    } catch (error) {
                                      console.error('Error updating status:', error);
                                      toast.error(
                                        error.response?.data?.message || 'Failed to update status'
                                      );
                                    }
                                  }}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    fontSize: '12px',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    flex: 1
                                  }}
                                >
                                  <option value="scheduled">Scheduled</option>
                                  <option value="live">Live</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  gap: '10px',
                                  flexWrap: 'wrap'
                                }}
                              >
                                <button
                                  onClick={() => {
                                    // Format the date for datetime-local input (YYYY-MM-DDTHH:mm)
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
                                    
                                    const statusValue = typeof liveClass.status === 'string' 
                                      ? liveClass.status 
                                      : 'scheduled';
                                    
                                    setIsEditingLiveClass(true);
                                    setEditingLiveClassId(liveClass.meetId || liveClass._id);
                                    setLiveClassForm({
                                      title: String(liveClass.title || ''),
                                      meetLink: String(liveClass.meetLink || ''),
                                      meetTime: formattedTime,
                                      status: statusValue
                                    });
                                    setShowLiveClassForm(true);
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#FF9800',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  Edit
                                </button>
                              <button
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      'Are you sure you want to delete this live class?'
                                    )
                                  ) {
                                    try {
                                      const token = localStorage.getItem('token');
                                      const meetIdToDelete = liveClass.meetId || liveClass._id;
                                      console.log('Deleting meet:', meetIdToDelete);
                                      await axios.delete(
                                        `${backendUrl}/api/tutor/meet/${userData?._id}/${meetIdToDelete}`,
                                        {
                                          headers: { Authorization: `Bearer ${token}` }
                                        }
                                      );
                                      toast.success('Live class deleted successfully');
                                      await fetchLiveClassesForCourse(selectedCourseForModules);
                                    } catch (error) {
                                      console.error('Delete error:', error.message, error.response?.data);
                                      toast.error(
                                        error.response?.data?.message ||
                                          'Failed to delete live class'
                                      );
                                    }
                                  }
                                }}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Delete
                              </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!liveClasses || liveClasses.length === 0) && (
                    <p style={{ color: '#999', fontStyle: 'italic', marginTop: '15px' }}>
                      No live classes scheduled yet.
                    </p>
                  )}
                </div>
              )}
              </>
            </div>
          )}

          {activeTab === "myresources" && (
            <div className="page-welcome-card">
              <h2>My Resources</h2>

              <div style={{ marginBottom: 20 }}>
                <button
                  onClick={() => setResourcesTab('videos')}
                  style={{
                    padding: '10px 20px',
                    marginRight: 10,
                    backgroundColor: resourcesTab === 'videos' ? '#4CAF50' : '#ddd',
                    color: resourcesTab === 'videos' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: resourcesTab === 'videos' ? 'bold' : 'normal'
                  }}
                >
                  Videos
                </button>
                <button
                  onClick={() => setResourcesTab('meets')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: resourcesTab === 'meets' ? '#4CAF50' : '#ddd',
                    color: resourcesTab === 'meets' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: resourcesTab === 'meets' ? 'bold' : 'normal'
                  }}
                >
                  Live Classes
                </button>
              </div>

              {resourcesTab === 'videos' && (
                <div>
                  {tutorResources.filter(r => r.resourceType === 'video').length > 0 ? (
                    <table className="hack-results-table">
                      <thead>
                        <tr>
                          <th>Video Title</th>
                          <th>Course</th>
                          <th>Type</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tutorResources.filter(r => r.resourceType === 'video').map(resource => (
                          <tr key={resource._id}>
                            <td>{resource.title}</td>
                            <td>{resource.courseId?.name || 'Unknown Course'}</td>
                            <td>{resource.videoFile ? 'File Upload' : 'Link'}</td>
                            <td>
                              <button
                                onClick={() => setEditingResource(resource)}
                                style={{
                                  padding: '5px 10px',
                                  marginRight: 5,
                                  backgroundColor: '#2196F3',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 3,
                                  cursor: 'pointer'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteResource(resource._id, 'video')}
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 3,
                                  cursor: 'pointer'
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No videos uploaded yet.</p>
                  )}
                </div>
              )}

              {resourcesTab === 'meets' && (
                <div>
                  {tutorResources.filter(r => r.resourceType === 'meet').length > 0 ? (
                    <table className="hack-results-table">
                      <thead>
                        <tr>
                          <th>Meet Title</th>
                          <th>Course</th>
                          <th>Meet Link</th>
                          <th>Time</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tutorResources.filter(r => r.resourceType === 'meet').map(resource => (
                          <tr key={resource._id}>
                            <td>{resource.title}</td>
                            <td>{resource.courseId?.name || 'Unknown Course'}</td>
                            <td>
                              <a href={resource.meetLink} target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3', textDecoration: 'underline' }}>
                                Open Link
                              </a>
                            </td>
                            <td>{new Date(resource.meetTime).toLocaleString()}</td>
                            <td>
                              <button
                                onClick={() => setEditingResource(resource)}
                                style={{
                                  padding: '5px 10px',
                                  marginRight: 5,
                                  backgroundColor: '#2196F3',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 3,
                                  cursor: 'pointer'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteResource(resource._id, 'meet')}
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 3,
                                  cursor: 'pointer'
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No live classes scheduled yet.</p>
                  )}
                </div>
              )}

              {editingResource && (
                <div style={{
                  marginTop: 30,
                  padding: 20,
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  backgroundColor: '#f9f9f9',
                  color: '#000'
                }}>
                  <h3 style={{ color: '#000' }}>Edit {editingResource.resourceType === 'video' ? 'Video' : 'Meet'}</h3>
                  {editingResource.resourceType === 'video' ? (
                    <div>
                      <div className="form-group">
                        <label style={{ color: '#000' }}>Video Title</label>
                        <input
                          type="text"
                          defaultValue={editingResource.title}
                          onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                        />
                      </div>
                      <button
                        onClick={() => handleUpdateResource(editingResource._id, 'video', { title: editingResource.title })}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          marginRight: 10
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingResource(null)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#999',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="form-group">
                        <label>Meet Title</label>
                        <input
                          type="text"
                          defaultValue={editingResource.title}
                          onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Meet Link</label>
                        <input
                          type="url"
                          defaultValue={editingResource.meetLink}
                          onChange={(e) => setEditingResource({ ...editingResource, meetLink: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Meet Time</label>
                        <input
                          type="datetime-local"
                          defaultValue={new Date(editingResource.meetTime).toISOString().slice(0, 16)}
                          onChange={(e) => setEditingResource({ ...editingResource, meetTime: e.target.value })}
                        />
                      </div>
                      <button
                        onClick={() => handleUpdateResource(editingResource._id, 'meet', {
                          title: editingResource.title,
                          meetLink: editingResource.meetLink,
                          meetTime: editingResource.meetTime
                        })}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          marginRight: 10
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingResource(null)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#999',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Minimal Logout Confirmation Modal */}
          {showLogoutConfirm && (
            <div className="logout_popUp_container"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10000
              }}>
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '30px',
                maxWidth: '350px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}>
                <h2 style={{ color: '#333', marginBottom: '10px', fontSize: '18px', fontWeight: '500' }}>
                  Are you sure you want to logout?
                </h2>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '25px' }}>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#f0f0f0',
                      color: '#333',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#512da8',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#512da8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#512da8'}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default TutorDashboard;
