import React, { useContext, useState, useEffect } from "react";
import "../../styles/studentDashboard.css";
import { AppContext } from "../../context/Appcontext";
import { Link, useNavigate } from "react-router-dom";
import studentHero from "../../assets/student-hero.webp";
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

const PerformanceMetrics = ({ assignmentCount = 0 }) => {
  const { userData } = useContext(AppContext);
  
  // Redirect tutors to tutor dashboard
  const navigate = useNavigate();
  if (userData && userData.role === "tutor") {
    navigate("/tutor-dashboard");
    return null;
  }
  
  const enrollCount = (userData && userData.enrolledCourses && userData.enrolledCourses.length) || 0;
  return (
    <div className="performance-metrics">
      <div className="metric-left">
        <span className="metric-title">Overall performance</span>
        <span className="metric-subtitle">course completion rate</span>

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
            <strong>0</strong>
            <small>Skill Up</small>
          </div>
        </div>
      </div>

      <div className="metric-right">
        <StatCard
          label="Total enroll courses"
          value={enrollCount}
          color="#e0f7fa"
          Icon={FaBook}
        />
        <StatCard
          label="Live class attended"
          value="0"
          color="#fce4ec"
          Icon={FaVideo}
        />
        <StatCard
          label="Course completed"
          value="0"
          color="#f1f8e9"
          Icon={FaCheckCircle}
        />
        <StatCard
          label="Quiz practised"
          value="0"
          color="#f3e5f5"
          Icon={FaQuestionCircle}
        />
        <StatCard
          label="Hours spent"
          value="0 hrs"
          color="#fff8e1"
          Icon={FaClock}
        />
        <StatCard
          label="Assignments available"
          value={assignmentCount}
          color="#e8f5e9"
          Icon={FaTasks}
        />
      </div>
    </div>
  );
};

const PremiumBanner = () => {
  const { userData } = useContext(AppContext);

  return (
    <div className="premium-banner">
      <div className="banner-content">
        <h1>
          Welcome, {userData ? userData.name : "empty"} The Problem-Solver!
        </h1>
        <p>
          Learn from industry experts with exclusive content designed to boost
          your skills.
        </p>
        <Link to="/courses" className="buy-courses-btn">
          Explore Our Courses
        </Link>
      </div>

      <div className="banner-image">
        <img src={studentHero} alt="Student Hero" />
      </div>
    </div>
  );
};

const RecommendedCourses = () => (
  <div className="recommended-box">
    <h2>Recommended for You</h2>
    <div className="course-cards">
      <Link to="/course/Data Analyst" className="card tech-card">
        Data Analyst
      </Link>
      <Link to="/course/Full-Stack Web Development Bootcamp" className="card tech-card">
        Full-Stack Bootcamp
      </Link>
      <Link to="/course/Cyber Security" className="card tech-card">
        Cyber Security
      </Link>
      <Link to="/course/Cloud Computing" className="card tech-card">
        Cloud Computing
      </Link>
    </div>
  </div>
);

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('studentActiveTab') || 'home';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('studentActiveTab', activeTab);
  }, [activeTab]);

  // Fetch assignments when component mounts or assignments tab is active
  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (activeTab === "assignments") {
      fetchAssignments();
    }
  }, [activeTab]);

  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      axios.defaults.withCredentials = true;
      
      const { data } = await axios.get(backendUrl + "/api/student/assignments");
      
      if (data.success) {
        setAssignments(data.assignments || []);
      } else {
        toast.error(data.message || "Failed to fetch assignments");
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error(error.message || "Error fetching assignments");
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const [purchaseHistoryTab, setPurchaseHistoryTab] = useState("courses");

  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContext);
  const navigate = useNavigate();

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(backendUrl + "/api/sendOtp");
      if (data.success) {
        navigate("/verifyMail");
        toast.success(data.message);
      } else {
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(backendUrl + "/api/logout");
      data.success && setIsLoggedin(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
    setShowLogoutConfirm(false);
  };

  return (
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
            My Courses
          </li>

          <li
            className={activeTab === "assignments" ? "active" : ""}
            onClick={() => {
              setActiveTab("assignments");
              setMenuOpen(false);
            }}
          >
            My Assignments
          </li>

          <li
            className={activeTab === "hackathons" ? "active" : ""}
            onClick={() => {
              setActiveTab("hackathons");
              setMenuOpen(false);
            }}
          >
            My Hackathons
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

          {/* {userData.verifiedStatus ? (
            <li
              className={activeTab === "verified" ? "active" : ""}
              onClick={() => {
                setActiveTab("verified");
                setMenuOpen(false);
              }}
            >
              Account Verified
            </li>
          ) : (
            <li
              className={activeTab === "verifyMail" ? "active" : ""}
              // onClick={() => {
              //   setActiveTab("verifyMail");
              //   setMenuOpen(false);
              // }}
              onClick={
                () =>{toast.info("This can be done only by admin");}
              }
            >
              Not Verified
            </li>
          )} */}

          <li
            className={activeTab === "logout" ? "active" : ""}
            onClick={() => setShowLogoutConfirm(true)}
          >
            Logout
          </li>

          <Link to="/contact" className="help">
            Help ⓘ
          </Link>
        </ul>
      </aside>

      <main className="dashboard-main">
        {activeTab === "home" && (
          <div className="home-section">
            <PremiumBanner />
            <PerformanceMetrics assignmentCount={assignments.length} />
            <RecommendedCourses />
          </div>
        )}

        {activeTab === "courses" && (
          <div className="page-welcome-card">
            <h2>My Courses</h2>
            {(userData && userData.enrolledCourses && userData.enrolledCourses.length) ? (
              <table className="hack-results-table">
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.enrolledCourses
                    .filter(c => {
                      // Exclude courses that are in completedCourses
                      const enrolledId = (c._id || '').toString();
                      const completedIds = (userData.completedCourses || []).map(cc => {
                        const id = cc.courseId?._id || cc.courseId;
                        return (id || '').toString();
                      });
                      return !completedIds.includes(enrolledId);
                    })
                    .map(c => (
                    <tr key={c._id}>
                      <td>{c.name}</td>
                      <td>{c.price ? `${c.price} INR` : '—'}</td>
                      <td>
                        <Link to={`/course/${c.name}`} className="enroll-link">Open Course</Link>
                        {' | '}
                        <Link to="/course/resources" state={{courseId: c._id, courseName: c.name}} className="enroll-link">Resources</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>You have not enrolled in any courses yet.</p>
            )}

            {/* Completed Courses */}
            <h3 style={{ marginTop: 24 }}>Completed Courses</h3>
            {(userData && userData.completedCourses && userData.completedCourses.length) ? (
              <table className="hack-results-table">
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Price</th>
                    <th>Completed At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.completedCourses.map(c => {
                    const course = c.courseId || c;
                    return (
                      <tr key={course._id}>
                        <td>{course.name}</td>
                        <td>{course.price ? `${course.price} INR` : '—'}</td>
                        <td>{c.completedAt ? new Date(c.completedAt).toLocaleString() : '—'}</td>
                        <td>
                          <Link to={`/course/${encodeURIComponent(course.name)}`} className="enroll-link">Open Course</Link>
                          {' | '}
                          <Link to="/course/resources" state={{courseId: course._id, courseName: course.name}} className="enroll-link">Resources</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>You have not completed any courses yet.</p>
            )}
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="page-welcome-card">
            <h2>My Assignments</h2>
            {assignmentsLoading ? (
              <p style={{textAlign: 'center', padding: '20px'}}>Loading assignments...</p>
            ) : assignments && assignments.length > 0 ? (
              <table className="hack-results-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Module</th>
                    <th>Assignment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment, index) => (
                    <tr key={index}>
                      <td>{assignment.courseName}</td>
                      <td>{assignment.moduleName}</td>
                      <td>
                        <details>
                          <summary style={{cursor: 'pointer', color: '#4CAF50'}}>View Details</summary>
                          <p>{assignment.assignment.description}</p>
                        </details>
                      </td>
                      <td>
                        <Link 
                          to="/course/resources" 
                          state={{
                            courseId: assignment.courseId,
                            courseName: assignment.courseName,
                            moduleId: assignment._id,
                            tab: 'modules'
                          }}
                          className="enroll-link"
                        >
                          View Resources
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>You have not been assigned any assignments yet.</p>
            )}
          </div>
        )}

        {activeTab === "hackathons" && (
          <div className="page-welcome-card">
            <h2>My Hackathons</h2>
            
            {/* Enrolled Hackathons */}
            <h3>Enrolled Hackathons</h3>
            {(userData && userData.enrolledHackathons && userData.enrolledHackathons.length) ? (
              <table className="hack-results-table">
                <thead>
                  <tr>
                    <th>Hackathon Name</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.enrolledHackathons
                    .filter(h => {
                      // Exclude hackathons that are in completedHackathons
                      const enrolledId = (h._id || '').toString();
                      const completedIds = (userData.completedHackathons || []).map(ch => {
                        const id = ch.hackathonId?._id || ch.hackathonId;
                        return (id || '').toString();
                      });
                      return !completedIds.includes(enrolledId);
                    })
                    .map(h => (
                    <tr key={h._id}>
                      <td>{h.name}</td>
                      <td>{h.price ? `${h.price} INR` : '—'}</td>
                      <td>
                        <Link to={`/hackathon/${h.name}`} className="enroll-link">Start Hackathon</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>You have not enrolled in any hackathons yet.</p>
            )}

            {/* Completed Hackathons */}
            <h3>Completed Hackathons</h3>
            {(userData && userData.completedHackathons && userData.completedHackathons.length) ? (
              <table className="hack-results-table">
                <thead>
                  <tr>
                    <th>Hackathon Name</th>
                    <th>Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.completedHackathons.map(h => {
                    const hackathon = h.hackathonId || h;
                    return (
                      <tr key={hackathon._id}>
                        <td>{hackathon.name}</td>
                        <td>{h.score || '0'}</td>
                        <td>
                          <Link to={`/hackathon/${hackathon.name}`} className="enroll-link">View Hackathon</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>You have not completed any hackathons yet.</p>
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div className="page-welcome-card">
            <h2>Account Information</h2>
            <table className="hack-results-table" style={{marginBottom: '40px'}}>
              <tbody>
                <tr>
                  <td style={{fontWeight: 'bold', width: '30%'}}>Full Name</td>
                  <td>{userData.name}</td>
                </tr>
                <tr>
                  <td style={{fontWeight: 'bold', width: '30%'}}>Email</td>
                  <td>{userData.email}</td>
                </tr>
                <tr>
                  <td style={{fontWeight: 'bold', width: '30%'}}>Account Status</td>
                  <td>{userData.verifiedStatus ? <span style={{color: '#4CAF50', fontWeight: 'bold'}}>✓ Verified</span> : <span style={{color: '#ff9800', fontWeight: 'bold'}}>⚠ Not Verified</span>}</td>
                </tr>
              </tbody>
            </table>

            <h3>Purchasing History</h3>
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={() => setPurchaseHistoryTab('courses')}
                style={{
                  padding: '10px 20px',
                  marginRight: 10,
                  backgroundColor: purchaseHistoryTab === 'courses' ? '#4CAF50' : '#ddd',
                  color: purchaseHistoryTab === 'courses' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: purchaseHistoryTab === 'courses' ? 'bold' : 'normal'
                }}
              >
                Courses
              </button>
              <button
                onClick={() => setPurchaseHistoryTab('hackathons')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: purchaseHistoryTab === 'hackathons' ? '#4CAF50' : '#ddd',
                  color: purchaseHistoryTab === 'hackathons' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: purchaseHistoryTab === 'hackathons' ? 'bold' : 'normal'
                }}
              >
                Hackathons
              </button>
            </div>

            {purchaseHistoryTab === 'courses' && (
              <>
                {(userData && userData.enrolledCourses && userData.enrolledCourses.length) ? (
                  <table className="hack-results-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Type</th>
                        <th>Price (INR)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(userData.enrolledCourses || [])
                        .filter(c => {
                          // Exclude courses that are in completedCourses
                          const enrolledId = (c._id || '').toString();
                          const completedIds = (userData.completedCourses || []).map(cc => {
                            const id = cc.courseId?._id || cc.courseId;
                            return (id || '').toString();
                          });
                          return !completedIds.includes(enrolledId);
                        })
                        .map(c => (
                        <tr key={c._id}>
                          <td>{c.name}</td>
                          <td><span style={{backgroundColor: '#e3f2fd', padding: '5px 10px', borderRadius: '4px', color: '#000'}}>Course</span></td>
                          <td>{c.price || '—'}</td>
                          <td><Link to={`/course/${encodeURIComponent(c.name)}`} className="enroll-link">Open</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No courses purchased yet.</p>
                )}
              </>
            )}

            {purchaseHistoryTab === 'hackathons' && (
              <>
                {(userData && userData.enrolledHackathons && userData.enrolledHackathons.length) ? (
                  <table className="hack-results-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Type</th>
                        <th>Price (INR)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(userData.enrolledHackathons || [])
                        .filter(h => {
                          // Exclude hackathons that are in completedHackathons
                          const enrolledId = (h._id || '').toString();
                          const completedIds = (userData.completedHackathons || []).map(ch => {
                            const id = ch.hackathonId?._id || ch.hackathonId;
                            return (id || '').toString();
                          });
                          return !completedIds.includes(enrolledId);
                        })
                        .map(h => (
                        <tr key={h._id}>
                          <td>{h.name}</td>
                          <td><span style={{backgroundColor: '#f3e5f5', padding: '5px 10px', borderRadius: '4px', color: '#000'}}>Hackathon</span></td>
                          <td>{h.price || '—'}</td>
                          <td><Link to={`/hackathon/${encodeURIComponent(h.name)}`} className="enroll-link">Open</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No hackathons purchased yet.</p>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "verifyMail" && (
          <div>
            <h1>Click Send Otp To Verify Your Account</h1>
            <button className="submitBtn" onClick={sendVerificationOtp}>
              Send Otp
            </button>
          </div>
        )}

        {activeTab === "verified" && (
          <div>
            <h1>Your Account is Verified</h1>
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
                  onClick={logout}
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
  );
}
