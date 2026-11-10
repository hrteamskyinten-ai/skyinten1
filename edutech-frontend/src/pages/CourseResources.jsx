import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/Appcontext';
import '../styles/courseResource.css';

export default function CourseResources() {
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [courseData, setCourseData] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('courseResourcesActiveTab') || 'overview';
  }); // 'overview', 'modules', 'live-classes'
  const [liveClasses, setLiveClasses] = useState([]);
  const [loadingLiveClasses, setLoadingLiveClasses] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const videoRefs = useRef({});
  const lastProgressUpdateRef = useRef({});
  const videoEventListenersRef = useRef({});
  const shownLockedMessageRef = useRef(null);
  const courseName = (location.state && location.state.courseName) || 'Course Resources';
  const courseIdFromState = location.state && location.state.courseId;
  const courseId = courseIdFromState || (courseData && courseData._id);
  
  // Debugging courseId resolution
  React.useMemo(() => {
    if (courseId) {
      console.log('ID Resolved - courseIdFromState:', courseIdFromState, 'courseData._id:', courseData?._id, 'final courseId:', courseId);
    }
  }, [courseId, courseIdFromState, courseData]);


  // Save active tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('courseResourcesActiveTab', activeTab);
  }, [activeTab]);

  // Scroll active tab to center on mobile with accurate centering
  useEffect(() => {
    if (window.innerWidth <= 480) {
      // Use setTimeout to ensure DOM is fully updated
      setTimeout(() => {
        const activeTabBtn = document.querySelector('.tab-btn.active');
        const tabsContainer = document.querySelector('.course-tabs');
        
        if (activeTabBtn && tabsContainer) {
          // Calculate the exact center position
          const tabOffsetLeft = activeTabBtn.offsetLeft;
          const tabWidth = activeTabBtn.offsetWidth;
          const containerWidth = tabsContainer.clientWidth;
          
          // Center the tab: tab position + half tab width - half container width
          const scrollLeft = tabOffsetLeft + tabWidth / 2 - containerWidth / 2;
          
          tabsContainer.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }, 0);
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchCourseResources = async () => {
      try {
        let url;

        // If courseId is provided, use it directly
        if (courseId) {
          console.log('Fetching course by ID:', courseId);
          url = `${backendUrl}/api/courses/${courseId}`;
        } else if (courseName) {
          // If only courseName is provided, fetch all courses and find the matching one
          console.log('Fetching courses to find:', courseName);
          const { data: allCoursesData } = await axios.get(`${backendUrl}/api/courses/all`);
          if (allCoursesData.success && allCoursesData.courses) {
            const course = allCoursesData.courses.find(c => c.name === courseName);
            if (course) {
              console.log('Found course by name, ID:', course._id);
              url = `${backendUrl}/api/courses/${course._id}`;
            } else {
              toast.error('Course not found');
              setLoading(false);
              return;
            }
          } else {
            toast.error('Failed to load courses');
            setLoading(false);
            return;
          }
        } else {
          console.warn('No courseId or courseName provided');
          setLoading(false);
          return;
        }

        console.log('Fetching from URL:', url);
        const { data } = await axios.get(url);
        console.log('Course data response:', data);
        if (data.success || (data.course && data.course.course)) {
          const courseData = data.course.course;
          console.log('Extracted course data:', courseData);
          console.log('Live meets:', courseData?.liveMeets);
          setCourseData(courseData);
          // Automatically populate live classes from course data
          if (courseData?.liveMeets && Array.isArray(courseData.liveMeets)) {
            const sortedMeets = courseData.liveMeets.sort((a, b) => new Date(a.meetTime) - new Date(b.meetTime));
            console.log('Setting live classes:', sortedMeets);
            setLiveClasses(sortedMeets);
          } else {
            console.log('No live meets found in course data');
            setLiveClasses([]);
          }
        } else {
          toast.error('Failed to load course resources');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error(error.message || 'Failed to load course resources');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseResources();
  }, [courseId, courseName, backendUrl]);

  // Initialize course progress when component mounts
  useEffect(() => {
    const initializeProgress = async () => {
      if (!courseId) return;

      try {
        // Try to get existing progress
        const progressResponse = await axios.get(`${backendUrl}/api/progress/${courseId}`);
        if (progressResponse.data.success) {
          setCourseProgress(progressResponse.data.courseProgress);
          // Set first unlocked module as selected
          const firstUnlockedModule = progressResponse.data.courseProgress.modules.find(m => !m.isLocked);
          if (firstUnlockedModule && !selectedModule) {
            setSelectedModule(firstUnlockedModule.moduleId);
          }
          return;
        }
      } catch (error) {
        // Progress doesn't exist, initialize it
        if (error.response?.status === 404) {
          try {
            const initResponse = await axios.post(`${backendUrl}/api/progress/initialize`, { courseId });
            if (initResponse.data.success) {
              setCourseProgress(initResponse.data.courseProgress);
              // Set first module as selected
              const firstModule = initResponse.data.courseProgress.modules[0];
              if (firstModule) {
                setSelectedModule(firstModule.moduleId);
              }
            }
          } catch (initError) {
            console.error('Error initializing progress:', initError);
          }
        } else {
          console.error('Error fetching progress:', error);
        }
      }
    };

    initializeProgress();
  }, [courseId, backendUrl, selectedModule]);

  // Handle module selection from location state (when coming from assignments)
  useEffect(() => {
    const moduleIdFromState = location.state && location.state.moduleId;
    const tabFromState = location.state && location.state.tab;

    if (moduleIdFromState && courseProgress) {
      // Set tab to modules
      if (tabFromState === 'modules') {
        setActiveTab('modules');
      }

      // Check if module is locked
      const module = courseProgress.modules.find(m => m.moduleId === moduleIdFromState);
      if (module) {
        if (module.isLocked) {
          // Only show toast if we haven't shown it for this module yet
          if (shownLockedMessageRef.current !== moduleIdFromState) {
            toast.warn('You should complete the previous modules first');
            shownLockedMessageRef.current = moduleIdFromState;
          }
          return;
        }
        // Module is unlocked, select it
        setSelectedModule(moduleIdFromState);
        shownLockedMessageRef.current = null; // Reset for next time
      }
    }
  }, [location.state, courseProgress]);

  // Scroll to selected module in the sidebar
  useEffect(() => {
    if (selectedModule && activeTab === 'modules') {
      const activeModuleElement = document.querySelector(
        `.module-nav-item.active`
      );
      if (activeModuleElement) {
        setTimeout(() => {
          activeModuleElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    }
  }, [selectedModule, activeTab]);

  // Fetch live classes from course data (refresh)
  const fetchLiveClasses = React.useCallback(async () => {
    setLoadingLiveClasses(true);
    try {
      let url;
      if (courseId) {
        url = `${backendUrl}/api/courses/${courseId}`;
      }
      
      if (url) {
        const { data } = await axios.get(url);
        if (data.success || data.course) {
          const course = data.course.course || data.course;
          if (course.liveMeets) {
            setLiveClasses(course.liveMeets.sort((a, b) => new Date(a.meetTime) - new Date(b.meetTime)));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching live classes:', error);
    } finally {
      setLoadingLiveClasses(false);
    }
  }, [courseId, backendUrl]);

  // Fetch live classes when tab changes (to refresh if needed)
  useEffect(() => {
    if (activeTab === 'live-classes' && courseId) {
      fetchLiveClasses();
    }
  }, [activeTab, courseId, fetchLiveClasses]);

  // Manage video event listeners with proper cleanup
  useEffect(() => {
    if (!playingVideo || !selectedModule) {
      console.log('🎬 No video playing, cleaning up listeners');
      return;
    }

    console.log(`🎥 Setting up video listener for topic: ${playingVideo}`);
    
    // Small delay to ensure video element is rendered
    const setupTimeout = setTimeout(() => {
      const videoElement = videoRefs.current[playingVideo];
      
      if (!videoElement) {
        console.warn(`⚠️ Video element not found for topic ${playingVideo}`);
        return;
      }

      // Create event handler
      const handleTimeUpdate = () => {
        console.log(`\u23f1️ Video timeupdate fired - playingVideo: ${playingVideo}, selectedModule: ${selectedModule}`);
        handleVideoTimeUpdate(playingVideo, selectedModule, videoElement);
      };

      // Add event listener
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      console.log(`✅ Timeupdate listener attached to video ${playingVideo}`);

      // Store listener reference for cleanup
      videoEventListenersRef.current[playingVideo] = handleTimeUpdate;

      // Cleanup function
      return () => {
        console.log(`🧹 Removing video listener for topic: ${playingVideo}`);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        delete videoEventListenersRef.current[playingVideo];
      };
    }, 50);

    return () => {
      clearTimeout(setupTimeout);
      // Cleanup all listeners when component unmounts or dependencies change
      Object.entries(videoEventListenersRef.current).forEach(([topicId, listener]) => {
        const videoElement = videoRefs.current[topicId];
        if (videoElement && listener) {
          videoElement.removeEventListener('timeupdate', listener);
          console.log(`🧹 Cleaned up listener for topic: ${topicId}`);
        }
      });
      videoEventListenersRef.current = {};
    };
  }, [playingVideo, selectedModule, courseId, backendUrl]);

  // Update video progress when time updates with throttling
  const handleVideoTimeUpdate = async (topicId, moduleId, videoElement) => {
    if (!videoElement) return;

    const currentTime = videoElement.currentTime;
    const duration = videoElement.duration;

    if (duration > 0) {
      const watchedPercentage = (currentTime / duration) * 100;
      const progressKey = `${topicId}-${moduleId}`;
      const now = Date.now();
      const lastUpdate = lastProgressUpdateRef.current[progressKey] || 0;

      // Throttle updates to every 5 seconds, or always at 90%+
      if (now - lastUpdate >= 5000 || watchedPercentage >= 90) {
        lastProgressUpdateRef.current[progressKey] = now;

        try {
          const payload = {
            courseId,
            moduleId,
            topicId,
            watchedPercentage: Math.round(watchedPercentage)
          };
          console.log(`📊 Updating video progress: ${Math.round(watchedPercentage)}% for topic ${topicId}`);
          console.log(`🔍 Payload being sent:`, payload);
          console.log(`🔍 courseId type: ${typeof courseId}, value: ${courseId}`);
          console.log(`🔍 moduleId type: ${typeof moduleId}, value: ${moduleId}`);
          const updateResponse = await axios.put(`${backendUrl}/api/progress/topic/update`, payload, { withCredentials: true });

          if (updateResponse.data.success) {
            console.log(`✅ Progress saved successfully: ${Math.round(watchedPercentage)}%`);
            setCourseProgress(updateResponse.data.courseProgress);
          }
        } catch (error) {
          console.error(`❌ Error updating video progress for topic ${topicId}:`, error);
        }
      }
    }
  };

  // Simple play/pause toggle
  const handlePlayVideo = (topicId) => {
    console.log(`🎥 Toggle video playback for topic: ${topicId}`);
    setPlayingVideo(playingVideo === topicId ? null : topicId);
  };

  const handleModuleSelect = (moduleId) => {
    // Check if module is locked
    if (courseProgress) {
      const module = courseProgress.modules.find(m => m.moduleId === moduleId);
      if (module && module.isLocked) {
        toast.warning('This module is locked. Complete the previous module first.');
        return;
      }
    }

    setSelectedModule(moduleId);
    // Close sidebar on mobile/tablet after selection
    setIsSidebarOpen(false);
  };

  const handleAssignmentComplete = (moduleId) => {
    try {
      console.log('handleAssignmentComplete clicked, navigating to assignment', { courseId, moduleId });
      // Navigate to the assignment page with MCQs and coding questions
      navigate(`/assignment/${courseId}/${moduleId}`);
      
      // Show info toast
      toast.info('Answer the questions and submit to complete the assignment');
    } catch (error) {
      console.error('Error navigating to assignment:', error);
      toast.error('Error opening assignment');
    }
  };

  if (loading) {
    return (
      <div className="course-layout">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-layout">
      {/* Course Header */}
      <div className="course-header">
        <div className="course-info">
          <h1 className="course-title">{courseName}</h1>
          <p className="course-description">
            {courseData?.description || 'Master the fundamentals and advance your skills with this comprehensive course.'}
          </p>
          <div className="course-stats">
            <span className="stat-item">{(courseData?.modules?.length || 0)} Modules</span>
            <span className="stat-item">
              {(courseData?.modules?.reduce((total, module) => total + (module.topics?.length || 0), 0) || 0)} Topics
            </span>
            <span className="stat-item">Certificate upon completion</span>
          </div>
        </div>
        <div className="course-progress">
          <div className="progress-circle">
            <span className="progress-text">{courseProgress?.overallProgress || 0}%</span>
          </div>
          <p className="progress-label">Course Progress</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="course-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📖</span> Course Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveTab('modules')}
        >
          <span className="tab-icon">📚</span> Modules
        </button>
        <button 
          className={`tab-btn ${activeTab === 'live-classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('live-classes')}
        >
          <span className="tab-icon">🎥</span> Live Classes
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="course-overview-container">
          <div className="overview-intro">
            <h2>Course Overview</h2>
            <p>Explore all modules, topics, and assignments in this course.</p>
          </div>
          <div className="modules-overview">
            {(courseData?.modules || [
              {
                _id: 'module-1',
                title: 'Introduction to Programming',
                description: 'Learn the basics of programming concepts',
                topics: [
                  { _id: 'topic-1', title: 'What is Programming?' },
                  { _id: 'topic-2', title: 'Setting up Development Environment' },
                  { _id: 'topic-3', title: 'Your First Program' }
                ],
                assignment: { description: 'Complete basic coding exercises' }
              },
              {
                _id: 'module-2',
                title: 'Variables and Data Types',
                description: 'Understanding variables, data types, and basic operations',
                topics: [
                  { _id: 'topic-4', title: 'Variables' },
                  { _id: 'topic-5', title: 'Data Types' },
                  { _id: 'topic-6', title: 'Basic Operations' }
                ],
                assignment: { description: 'Practice variable assignment exercises' }
              }
            ]).map((module, idx) => (
              <div key={module._id} className="overview-module-card">
                <div className="overview-module-header">
                  <div className="module-number-badge">{idx + 1}</div>
                  <div className="module-info">
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                  </div>
                </div>
                <div className="module-details">
                  <div className="topics-section">
                    <h4>📝 Topics ({module.topics?.length || 0})</h4>
                    <ul className="topics-list-overview">
                      {(module.topics || []).map((topic, topicIdx) => (
                        <li key={topic._id}>{topicIdx + 1}. {topic.title}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="assignment-section-overview">
                    <h4>✅ Assignment</h4>
                    {module.assignment?.description ? (
                      <p>{module.assignment.description}</p>
                    ) : (
                      <p style={{ color: '#999' }}>No assignment set</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="course-content">
          {/* Modules Overlay - Mobile */}
          {isSidebarOpen && (
            <div 
              className="modules-overlay"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar overlay"
            />
          )}

          {/* Modules Toggle Button - Mobile */}
          <div className="modules-toggle-wrapper">
            <button 
              className="modules-toggle-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle modules menu"
              title="Show/Hide Modules"
            >
              <span className="toggle-icon">📚</span>
            </button>
            <span className="modules-toggle-label">Modules</span>
          </div>

          {/* Modules Navigation Sidebar */}
          <div className={`modules-navigation ${isSidebarOpen ? 'open' : ''}`}>
            <div className="modules-nav-header">
              <h3 className="modules-nav-title">Course Modules</h3>
              <button 
                className="modules-close-btn"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close modules menu"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="modules-nav-list">
              {(courseData?.modules || [
                {
                  _id: 'module-1',
                  title: 'Introduction to Programming',
                  description: 'Learn the basics of programming concepts',
                  topics: [
                    { _id: 'topic-1', title: 'What is Programming?', type: 'video', url: '/videos/intro.mp4' },
                    { _id: 'topic-2', title: 'Setting up Development Environment', type: 'video', url: '/videos/setup.mp4' },
                    { _id: 'topic-3', title: 'Your First Program', type: 'video', url: '/videos/first-program.mp4' }
                  ]
                }
              ]).map((module, index) => {
                const moduleProgress = courseProgress?.modules?.find(m => m.moduleId === module._id.toString());
                const isLocked = moduleProgress?.isLocked;
                const isCompleted = moduleProgress?.isCompleted;

                return (
                  <div
                    key={module._id}
                    className={`module-nav-item ${selectedModule === module._id ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => handleModuleSelect(module._id)}
                    style={{ opacity: isLocked ? 0.6 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
                  >
                    <div className="module-nav-header">
                      <div className="module-nav-number">{index + 1}</div>
                      <div className="module-nav-info">
                        <h4 className="module-nav-title">{module.title}</h4>
                        <span className="module-nav-topics">{module.topics?.length || 0} topics</span>
                      </div>
                      <div className="module-nav-status">
                        {isLocked ? (
                          <span title="Module locked" style={{ fontSize: '18px' }}>🔒</span>
                        ) : isCompleted ? (
                          <span className="status-completed" title="Module completed">✓</span>
                        ) : (
                          <span className="status-pending" title="Module in progress"></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module Content */}
          <div className="module-content">
            {selectedModule ? (
              (() => {
                const module = (courseData?.modules || []).find(m => m._id === selectedModule);
                if (!module) return null;
                
                const mappedTopics = (module.topics || []).map(topic => ({
                  id: topic._id,
                  title: topic.title,
                  type: topic.videoFile ? 'file' : topic.videoUrl ? 'url' : 'video',
                  // if the topic has an uploaded video file we don't expose the raw path
                // instead use the authenticated streaming endpoint we added on the server
                url: topic.videoFile ? `${backendUrl}/api/courses/topics/${topic._id}/stream` : topic.videoUrl,
                  videoFile: topic.videoFile,
                  videoUrl: topic.videoUrl
                }));

                return (
                  <div className="module-detail">
                    <div className="module-header-detail">
                      <h2 className="module-title-detail">{module.title}</h2>
                      <p className="module-description-detail">{module.description}</p>
                    </div>

                    <div className="topics-list">
                      {mappedTopics.map((topic, index) => {
                        const topicProgress = courseProgress?.modules
                          ?.find(m => m.moduleId === selectedModule)
                          ?.topics?.find(t => t.topicId === topic.id);
                        const isTopicCompleted = topicProgress?.isCompleted;

                        return (
                          <div key={topic.id} className="topic-item">
                            <div className="topic-header">
                              <div className="topic-number">{index + 1}</div>
                              <div className="topic-info">
                                <h4 className="topic-title">{topic.title}</h4>
                              </div>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {isTopicCompleted && (
                                  <span className="status-completed" title="Topic completed" style={{ fontSize: '18px' }}>✓</span>
                                )}
                                <button
                                  className="topic-play-btn"
                                  onClick={() => handlePlayVideo(topic.id)}
                                >
                                  {playingVideo === topic.id ? '⏸ Pause' : '▶ Play'}
                                </button>
                              </div>
                            </div>
                            {playingVideo === topic.id && (topic.type === 'file' || topic.type === 'url') && (
                              <div className="topic-video">
                                {topic.type === 'file' ? (
                                  <video 
                                    ref={(el) => videoRefs.current[topic.id] = el}
                                    controls 
                                    className="video-player" 
                                    autoPlay
                                    onContextMenu={e => e.preventDefault()}
                                  >
                                    <source src={topic.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                ) : topic.url && (topic.url.includes('youtube.com') || topic.url.includes('youtu.be')) ? (
                                <iframe
                                  src={topic.url.replace('watch?v=', 'embed/')}
                                  className="video-player"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title={topic.title}
                                ></iframe>
                              ) : (
                                <div className="external-video-link">
                                  <p>External video: <a href={topic.url} target="_blank" rel="noopener noreferrer">{topic.url}</a></p>
                                  <p>Click the link above to watch the video in a new tab.</p>
                                </div>
                              )}
                            </div>
                          )}
                          {playingVideo === topic.id && topic.type === 'video' && (
                            <div className="topic-video">
                              <video
                                controls
                                className="video-player"
                                autoPlay
                                onContextMenu={e => e.preventDefault()}
                              >
                                <source src={`${backendUrl}${topic.url}`} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>

                    {/* Assignment Section - Only show if all topics are completed */}
                    {(() => {
                      const allTopicsCompleted = courseProgress?.modules
                        ?.find(m => m.moduleId === selectedModule)
                        ?.topics?.every(t => t.isCompleted);
                      
                      const moduleProgress = courseProgress?.modules?.find(m => m.moduleId === selectedModule);
                      const assignmentCompleted = moduleProgress?.assignmentCompleted;

                      if (!module.assignment || !module.assignment.description) {
                        return null;
                      }

                      return (
                        <div className="assignment-section">
                          <div className="assignment-header">
                            <h3 className="assignment-title">Module Assignment</h3>
                          </div>

                          <div className="assignment-content">
                            {!allTopicsCompleted ? (
                              <div style={{ 
                                padding: '20px', 
                                backgroundColor: 'rgba(255, 193, 7, 0.1)', 
                                borderLeft: '4px solid #ffc107',
                                borderRadius: '4px'
                              }}>
                                <p style={{ 
                                  margin: 0, 
                                  color: '#f57f17',
                                  fontWeight: '600'
                                }}>
                                  ⏳ Complete all topics first to unlock the assignment
                                </p>
                              </div>
                            ) : (
                              <>
                                <div className="assignment-details">
                                  <p className="assignment-description">
                                    {module.assignment.description}
                                  </p>
                                  {!assignmentCompleted ? (
                                    <button
                                      className="complete-assignment-btn"
                                      onClick={() => handleAssignmentComplete(selectedModule)}
                                    >
                                      Complete Assignment
                                    </button>
                                  ) : (
                                    <div style={{ 
                                      padding: '12px 20px', 
                                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                      color: '#388e3c',
                                      borderRadius: '4px',
                                      fontWeight: '600',
                                      display: 'inline-block'
                                    }}>
                                      ✓ Assignment Completed
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })()
            ) : (
              <div className="module-placeholder">
                <div className="placeholder-content">
                  <h3>Welcome to {courseName}</h3>
                  <p>Select a module from the left to start learning.</p>
                  <div className="placeholder-icon">📚</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'live-classes' && (
        <div className="live-classes-container">
          <div className="live-classes-header">
            <h2>Live Classes</h2>
            <p>Join live classes with tutors to learn interactively.</p>
          </div>
          
          {loadingLiveClasses ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading live classes...</p>
            </div>
          ) : liveClasses.length > 0 ? (
            <div className="live-classes-grid">
              {liveClasses.map((liveClass) => {
                const meetTime = new Date(liveClass.meetTime || liveClass.meetDate);
                
                // Use status directly from database
                const status = liveClass.status || 'scheduled';
                
                return (
                  <div key={liveClass.meetId || liveClass._id} className="live-class-card">
                    <div className="live-class-status">
                      <span className={`status-badge ${status}`}>
                        {status === 'live'
                          ? '🔴 LIVE'
                          : status === 'completed'
                          ? '✓ COMPLETED'
                          : '📅 SCHEDULED'}
                      </span>
                    </div>
                    <div className="live-class-content">
                      <h3>{liveClass.title}</h3>
                      <div className="class-details">
                        <div className="detail-item">
                          <span className="detail-label">🕐 Time:</span>
                          <span className="detail-value">{meetTime.toLocaleString()}</span>
                        </div>
                        {liveClass.duration && (
                          <div className="detail-item">
                            <span className="detail-label">⏱️ Duration:</span>
                            <span className="detail-value">{liveClass.duration} minutes</span>
                          </div>
                        )}
                        <div className="detail-item">
                          <span className="detail-label">👥 Students:</span>
                          <span className="detail-value">{liveClass.students?.length || 0} joined</span>
                        </div>
                      </div>
                      {status === 'scheduled' && (
                        <button
                          className="join-class-btn disabled-btn"
                          disabled
                        >
                          Not Yet Scheduled
                        </button>
                      )}
                      {status === 'live' && (
                        <button
                          className="join-class-btn live-btn"
                          onClick={() => window.open(liveClass.meetLink, '_blank')}
                        >
                          Start Class →
                        </button>
                      )}
                      {status === 'completed' && (
                        <button
                          className="join-class-btn completed-btn"
                          disabled
                        >
                          Class Completed
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎓</div>
              <h3>No Live Classes Yet</h3>
              <p>Check back soon for upcoming live classes with your tutors.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}