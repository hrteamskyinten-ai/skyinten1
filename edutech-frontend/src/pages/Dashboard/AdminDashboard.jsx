import React, { useContext, useState, useEffect } from "react";
import "../../styles/adminDashboard.css";
import { AppContext } from "../../context/Appcontext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import AdminQuestions from "../HackathonExam/AdminQuestions";
import AdminManageCourses from "./AdminManageCourses";

// helper to enrich assignments with tutor/course objects when API returns ids
const enrichAssignments = (rawAssignments, tutorsList = [], coursesList = []) => {
  if (!Array.isArray(rawAssignments)) return [];
  return rawAssignments.map(a => {
    const tutorId = a.tutor?._id || a.tutor || a.tutorId || null;
    const courseId = a.course?._id || a.course || a.courseId || null;
    const tutorObj = (Array.isArray(tutorsList) ? tutorsList.find(t => t._id === tutorId) : null) || (a.tutor && typeof a.tutor === 'object' ? a.tutor : null);
    const courseObj = (Array.isArray(coursesList) ? coursesList.find(c => c._id === courseId) : null) || (a.course && typeof a.course === 'object' ? a.course : null);
    return {
      ...a,
      tutor: tutorObj,
      course: courseObj
    };
  });
};

const sidebarItems = [
  "Home",
  "Students",
  "Courses",
  "Manage Courses",
  "Tutors",
  "Hackathons",
  "Hackathon Settings",
  "Course Settings",
  "Staff",
  "Fees History",
  // "Settings", // commented out per request
  "Hackathon Results",
  "Manage Questions",
  "Contacts",
];

const ordersData = [
  { title: "Full-Stack Web Development Bootcamp", quantity: 3, price: 550 },
  { title: "Data Analyst", quantity: 2, price: 560 },
  { title: "StartUp Entrepreneurship", quantity: 2, price: 700 },
  { title: "Java Programming", quantity: 1, price: 766 },
  { title: "Cyber Security", quantity: 2, price: 994 },
];

const courseProgress = [
  { name: "Data Analyst", percentage: 80 },
  { name: "Full Stack", percentage: 72 },
  { name: "Marketing", percentage: 65 },
];

const HomeContent = () => {

  const { adminData } = useContext(AppContext)

  return (
    <>
      <div className="cards-row">
        <MetricCard
          icon="fas fa-users"
          title="TOTAL STUDENTS"
          value={adminData.number_of_users}
          change="80% increase in 20 days"
        />
        <MetricCard
          icon="fas fa-user-plus"
          title="NEW STUDENTS"
          value={adminData.number_of_new_users}
          change="50% increase in 20 days"
        />
        <MetricCard
          icon="fas fa-book-open"
          title="TOTAL COURSES"
          value={adminData.number_of_courses}
          change="76% increase in 20 days"
        />
      </div>

      <div className="data-row">
        <RecentOrders />
        <Performance />
      </div>

      <BuyingCourses />
    </>
  );
};

// Enhanced HomeContent with live data fetching for recent orders and top courses
const HomeContentLive = () => {
  const { adminData, backendUrl } = useContext(AppContext);
  const [topCourses, setTopCourses] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/courses/top`);
        if (data && data.success) setTopCourses(data.topCourses || []);
      } catch (err) {
        console.error('Failed to fetch top courses', err.message || err);
      }

      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/users`);
        if (data && data.success) {
          const users = data.users || [];
          const cutoff = new Date();
          // include enrollments from the last 2 days
          cutoff.setDate(cutoff.getDate() - 2);

          // collect enrollments where user.updatedAt (or createdAt) is within last 24 hours
          const enrollments = [];
          users.forEach((u) => {
            const time = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
            if (time >= cutoff && Array.isArray(u.enrolledCourses)) {
              u.enrolledCourses.forEach((c) => {
                enrollments.push({ title: c.name || 'Unknown', price: Number(c.price) || 0 });
              });
            }
          });

          // aggregate by course title
          const map = {};
          enrollments.forEach((e) => {
            if (!map[e.title]) map[e.title] = { title: e.title, quantity: 0, price: Number(e.price) || 0 };
            map[e.title].quantity += 1;
          });

          const orders = Object.values(map);
          setRecentOrders(orders.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to fetch admin users', err.message || err);
      }
    })();
  }, [backendUrl]);

  return (
    <>
      <div className="cards-row">
        <MetricCard
          icon="fas fa-users"
          title="TOTAL STUDENTS"
          value={adminData?.number_of_users || 0}
          change="80% increase in 20 days"
        />
        <MetricCard
          icon="fas fa-user-plus"
          title="NEW STUDENTS"
          value={adminData?.number_of_new_users || 0}
          change="50% increase in 20 days"
        />
        <MetricCard
          icon="fas fa-book-open"
          title="TOTAL COURSES"
          value={adminData?.number_of_courses || 0}
          change="76% increase in 20 days"
        />
      </div>

      <div className="data-row">
        <RecentOrders orders={recentOrders} />
      </div>

      <BuyingCourses topCourses={topCourses} />
    </>
  );
};

const MetricCard = ({ icon, title, value, change }) => (
  <div className="card metric-card">
    <div className="card-info">
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
      <div className="card-percentage">{change}</div>
    </div>
  </div>
);

const RecentOrders = ({ orders = [] }) => {
  const display = orders && orders.length ? orders : ordersData;
  const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  return (
    <div className="recent-orders-table">
      <div className="table-header">Recent Orders</div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Enrolled</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {display.map((o, i) => {
            const qty = Number(o.quantity) || 1;
            const unit = Number(o.price) || 0;
            const total = unit * qty;
            return (
              <tr key={i}>
                <td>{o.title}</td>
                <td>{qty}</td>
                <td>{inr.format(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Performance = () => (
  <div className="overall-performance-card">
    <div className="card-title">Overall Performance</div>
    <div className="chart-wrapper">
      <div className="chart-circle">
        <div className="chart-inner-text">
          <span className="rate">80%</span>
          <span className="label">Pro Learner</span>
        </div>
      </div>
      <div className="chart-description">Course completion rate</div>
    </div>
  </div>
);

const BuyingCourses = ({ topCourses = [] }) => {
  const list = topCourses && topCourses.length ? topCourses : courseProgress.map(c => ({ name: c.name, percentage: c.percentage }));
  return (
    <div className="most-buying-courses-card">
      <div className="card-title">Most Buying Courses</div>
      <div className="course-progress-list">
        {list.map((c, idx) => (
          <div key={c._id || c.name || idx} className="progress-item">
            <div className="course-name">{c.name}</div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${c.enrolledCount ? Math.min(100, (c.enrolledCount * 10)) : (c.percentage || 50)}%` }}
              ></div>
            </div>
            <div className="course-percentage">{c.enrolledCount ? `${c.enrolledCount}` : `${c.percentage || 50}%`}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HackathonResults = () => {
  const { backendUrl } = useContext(AppContext);
  const [results, setResults] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all hackathons for the dropdown
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/hackathon/all`);
        if (data.success) setHackathons(data.hackathons || []);
      } catch (err) {
        console.error('Failed to fetch hackathons', err);
      }
    })();
  }, [backendUrl]);

  // Fetch results based on selected hackathon
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const url = selectedHackathon
          ? `${backendUrl}/api/hackathon/results?page=1&limit=50&hackathonId=${selectedHackathon}`
          : `${backendUrl}/api/hackathon/results?page=1&limit=50`;
        const { data } = await axios.get(url);
        if (data.success) setResults(data.results || []);
      } catch (err) {
        console.error('Failed to fetch hackathon results', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedHackathon, backendUrl]);

  return (
    <div className="page-welcome-card">
      <h2>Hackathon Results</h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filter by Hackathon:</label>
        <select
          value={selectedHackathon}
          onChange={(e) => setSelectedHackathon(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">All Hackathons</option>
          {hackathons.map((h) => (
            <option key={h._id} value={h._id}>{h.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading results...</p>
      ) : (
        <table className="hack-results-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Hackathon</th>
              <th>Score</th>
              <th>MCQ (correct/total)</th>
              <th>Coding (done/passed/total)</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r._id}>
                <td>{r.studentName || r.userId || 'Unknown'}</td>
                <td>{r.hackathonName || 'N/A'}</td>
                <td>{r.finalScore}/100</td>
                <td>{r.mcq?.correct}/{r.mcq?.total}</td>
                <td>{r.coding?.codingDoneCount}/{r.coding?.passedTestcases}/{r.coding?.totalTestcases}</td>
                <td>{new Date(r.timestamp || r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const StaffContent = () => {
  const { adminData, backendUrl } = useContext(AppContext);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/tutors`);
      if (data && data.success) setTutors(data.tutors || []);
    } catch (err) {
      console.error('Failed to fetch tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTutors(); }, [backendUrl]);

  const createTutorHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/tutor/create`, { name, email, password });
      if (data && data.success) {
        toast.success('Tutor created');
        setName(''); setEmail(''); setPassword('');
        fetchTutors();
      } else {
        toast.error(data.message || 'Failed to create tutor');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Request failed');
    }
  };

  

  const toggleVerify = async (tutorId, current) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/tutor/verify`, { targetTutorId: tutorId, verified: !current });
      if (data && data.success) {
        toast.success('Tutor verification updated');
        fetchTutors();
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Request failed');
    }
  };

  const adminCount = (adminData?.user_roles || []).filter(u => typeof u.role === 'string' && /admin/i.test(u.role)).length || 0;

  return (
    <div className="page-welcome-card">
      <h2>Staff Management</h2>
      <p>View and manage tutors. Create tutor accounts here and provide credentials to tutors.</p>

      <div style={{ marginBottom: 20 }}>
        <form onSubmit={createTutorHandler} className="staff-create-form">
          <input className="staff-create-input" placeholder="Name (optional)" value={name} onChange={e => setName(e.target.value)} />
          <input className="staff-create-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="staff-create-input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required type="password" />
          <button className="staff-create-button" type="submit">Create Tutor</button>
        </form>
      </div>

      <div className="card-info-box">
        <p>Tutors: {loading ? 'Loading...' : tutors.length} | Administration: {adminCount}</p>
      </div>

    </div>
  );
};

const CoursesContent = () => {

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [imagePrev, setImagePrev] = useState("");

  // New content fields
  const [subject, setSubject] = useState("");
  const [rating, setRating] = useState("4.6");
  const [reviews, setReviews] = useState("100");
  const [approach, setApproach] = useState("");
  const [approachSubtitle, setApproachSubtitle] = useState("");
  const [whatYouWillLearn, setWhatYouWillLearn] = useState("");
  const [skillsYouWillGain, setSkillsYouWillGain] = useState("");
  const [descriptionPoints, setDescriptionPoints] = useState("");

  const [editId, setEditId] = useState(null);

  const { adminData, backendUrl, getAdminData } = useContext(AppContext)



  const createCourseSubmitHandler = async (e) => {
    e.preventDefault();

    const myform = new FormData();

    myform.append("name", name);
    myform.append("description", description);
    myform.append("category", category);
    myform.append("createdBy", createdBy);
    myform.append("price", price);
    myform.append("duration", duration);
    myform.append("file", image);
    myform.append("subject", subject);
    myform.append("rating", rating);
    myform.append("reviews", reviews);
    myform.append("approach", approach);
    myform.append("approachSubtitle", approachSubtitle);
    myform.append("whatYouWillLearn", whatYouWillLearn);
    myform.append("skillsYouWillGain", skillsYouWillGain);
    myform.append("descriptionPoints", descriptionPoints);


    try {
      if (editId) myform.append('id', editId);
      const url = editId ? (backendUrl + "/api/admin/course/update") : (backendUrl + "/api/admin/course/create");
      const { data } = await axios.post(url, myform)
      if (data.success) {
        toast.success(editId ? "Course Updated Successfully" : "Course Created Successfully");
        setName(''); setDescription(''); setCategory(''); setCreatedBy(''); setPrice(''); setDuration(''); setImage(''); setImagePrev(''); setEditId(null);
        setSubject(''); setRating('4.6'); setReviews('100'); setApproach(''); setApproachSubtitle(''); setWhatYouWillLearn(''); setSkillsYouWillGain(''); setDescriptionPoints('');
        getAdminData();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      toast.error(error.message)
    }

  }

  const imageChangeHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setImagePrev(reader.result);
      setImage(file);
    }
  }

  return (
    <div>

      <div className="page-welcome-card">
        <h2>Courses</h2>
        <table className="hack-results-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Category</th>
              <th>Active</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(adminData.all_courses || []).map((course) => (
              <tr key={course._id}>
                <td>{course.name}</td>
                <td>{course.price}</td>
                <td>{course.duration || '—'}</td>
                <td>{course.category || '—'}</td>
                <td>{course.active ? '✅' : '❌'}</td>
                <td>{course.createdBy || '—'}</td>
                <td>
                  <button className="control-btn" onClick={() => {
                    setName(course.name);
                    setDescription(course.description || '');
                    setCategory(course.category || "");
                    setCreatedBy(course.createdBy || "");
                    setPrice(course.price);
                    setDuration(course.duration);
                    setImagePrev(course.image ? `${import.meta.env.VITE_BACKEND_URL}/${course.image}` : '');
                    setSubject(course.subject || '');
                    setRating(course.rating || '4.6');
                    setReviews(course.reviews || '100');
                    setApproach(course.approach || '');
                    setApproachSubtitle(course.approachSubtitle || '');
                    setWhatYouWillLearn((course.whatYouWillLearn || []).join('\n'));
                    setSkillsYouWillGain((course.skillsYouWillGain || []).join('\n'));
                    setDescriptionPoints((course.descriptionPoints || []).join('\n'));
                    setEditId(course._id);
                    window.scrollTo({ top: 900, behavior: 'smooth' });
                  }}>Edit</button>
                  <button className="control-btn" onClick={async () => {
                    if (!confirm('Delete this course?')) return;
                    try {
                      const { data } = await axios.post(backendUrl + '/api/admin/course/delete', { id: course._id });
                      if (data.success) {
                        toast.success('Course deleted');
                        getAdminData();
                      } else {
                        toast.error(data.message || 'Delete failed');
                      }
                    } catch (err) {
                      toast.error(err.message || 'Delete request failed');
                    }
                  }}>Delete</button>
                  <button className="control-btn" onClick={async () => {
                    try {
                      const endpoint = course.active ? '/api/admin/course/deactive' : '/api/admin/course/active';
                      const { data } = await axios.post(backendUrl + endpoint, { name: course.name });
                      if (data && data.success) {
                        toast.success(data.message || 'Updated');
                        getAdminData();
                      } else {
                        toast.error(data.message || 'Could not update');
                      }
                    } catch (err) {
                      toast.error(err.message || 'Request failed');
                    }
                  }}>{course.active ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="createCouseContainer">
        <h2> Create / Edit Course </h2>
        <form onSubmit={createCourseSubmitHandler} className="createCouseForm">
          <input type="text" name="course_name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Course name" required />
          <input type="text" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Course Subject/Topic" />
          <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Course Description" required style={{ minHeight: '100px' }} />
          <input type="text" name="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
          <input type="text" name="createdBy" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} placeholder="Your Name" />
          <input type="number" name="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" required />
          <input type="text" name="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Course Duration in Months" />

          <div style={{ marginTop: '20px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
            <h4>Course Content Details</h4>
            <input type="number" step="0.1" min="0" max="5" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="Rating (0-5)" />
            <input type="number" value={reviews} onChange={(e) => setReviews(e.target.value)} placeholder="Number of Reviews" />

            <input type="text" value={approach} onChange={(e) => setApproach(e.target.value)} placeholder="Course Approach/Method" />
            <textarea value={approachSubtitle} onChange={(e) => setApproachSubtitle(e.target.value)} placeholder="Approach Subtitle/Description" style={{ minHeight: '80px' }} />

            <textarea
              value={whatYouWillLearn}
              onChange={(e) => setWhatYouWillLearn(e.target.value)}
              placeholder="What You'll Learn (one per line)"
              style={{ minHeight: '120px' }}
            />

            <textarea
              value={skillsYouWillGain}
              onChange={(e) => setSkillsYouWillGain(e.target.value)}
              placeholder="Skills You'll Gain (one per line)"
              style={{ minHeight: '120px' }}
            />

            <textarea
              value={descriptionPoints}
              onChange={(e) => setDescriptionPoints(e.target.value)}
              placeholder="Description Points/Curriculum (one per line)"
              style={{ minHeight: '120px' }}
            />
          </div>

          <input type="file" name="course_image" onChange={imageChangeHandler} />
          {imagePrev && <img src={imagePrev} alt="Course preview" width={300} style={{ marginTop: '10px' }} />}
          <button type="submit"> {editId ? 'Update Course' : 'Create Course'}</button>
        </form>
      </div>

    </div>
  )
}

const HackathonsContent = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [imagePrev, setImagePrev] = useState("");
  const [editId, setEditId] = useState(null);
  const [subtitle, setSubtitle] = useState("");
  const [about, setAbout] = useState("");
  const [whoCanParticipate, setWhoCanParticipate] = useState("");
  const [rewards, setRewards] = useState("");

  const { adminData, backendUrl, getAdminData } = useContext(AppContext)

  const createHackathonSubmitHandler = async (e) => {
    e.preventDefault();
    const myform = new FormData();
    myform.append('name', name);
    myform.append('description', description);
    myform.append('category', category);
    myform.append('createdBy', createdBy);
    myform.append('price', price);
    myform.append('subtitle', subtitle);
    myform.append('about', about);
    myform.append('whoCanParticipate', whoCanParticipate);
    myform.append('rewards', rewards);
    if (image) myform.append('file', image);

    try {
      if (editId) myform.append('id', editId);
      const url = editId ? (backendUrl + '/api/admin/hackathon/update') : (backendUrl + '/api/admin/hackathon/create');
      const { data } = await axios.post(url, myform);
      if (data && data.success) {
        toast.success(editId ? 'Hackathon updated' : 'Hackathon created');
        setName(''); setDescription(''); setCategory(''); setCreatedBy(''); setPrice(''); setImage(''); setImagePrev(''); setEditId(null);
        setSubtitle(''); setAbout(''); setWhoCanParticipate(''); setRewards('');
        getAdminData();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (err) {
      toast.error(err.message || 'Request failed');
    }
  }

  const imageChangeHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImagePrev(reader.result);
      setImage(file);
    }
  }

  return (
    <div>
      <div className="page-welcome-card">
        <h2>Hackathons</h2>
        <table className="hack-results-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(adminData.all_hackathons || []).map((hack) => (
              <tr key={hack._id}>
                <td>{hack.name}</td>
                <td>{hack.price}</td>
                <td>{hack.category || '—'}</td>
                <td>{hack.active ? '✅' : '❌'}</td>
                <td>
                  <button className="control-btn" onClick={() => {
                    setName(hack.name);
                    setDescription(hack.description || '');
                    setCategory(hack.category || '');
                    setCreatedBy(hack.createdBy || '');
                    setPrice(hack.price);
                    setImagePrev(hack.image ? `${import.meta.env.VITE_BACKEND_URL}/${hack.image}` : '');
                    setSubtitle(hack.subtitle || '');
                    setAbout(hack.about || '');
                    setWhoCanParticipate((hack.whoCanParticipate || []).join('\n'));
                    setRewards((hack.rewards || []).join('\n'));
                    setEditId(hack._id);
                    window.scrollTo({ top: 900, behavior: 'smooth' });
                  }}>Edit</button>
                  <button className="control-btn" onClick={async () => {
                    if (!confirm('Delete this hackathon?')) return;
                    try {
                      const { data } = await axios.post(backendUrl + '/api/admin/hackathon/delete', { id: hack._id });
                      if (data.success) {
                        toast.success('Hackathon deleted');
                        getAdminData();
                      } else {
                        toast.error(data.message || 'Delete failed');
                      }
                    } catch (err) {
                      toast.error(err.message || 'Delete request failed');
                    }
                  }}>Delete</button>
                  <button className="control-btn" onClick={async () => {
                    try {
                      const endpoint = hack.active ? '/api/admin/hackathon/deactive' : '/api/admin/hackathon/active';
                      const { data } = await axios.post(backendUrl + endpoint, { name: hack.name });
                      if (data && data.success) {
                        toast.success(data.message || 'Updated');
                        getAdminData();
                      } else {
                        toast.error(data.message || 'Could not update');
                      }
                    } catch (err) {
                      toast.error(err.message || 'Request failed');
                    }
                  }}>{hack.active ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="createCouseContainer">
        <h2> Create / Edit Hackathon </h2>
        <form onSubmit={createHackathonSubmitHandler} className="createCouseForm">
          <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Hackathon name" required />
          <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required style={{ minHeight: '100px' }} />
          <input type="text" name="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
          <input type="text" name="createdBy" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} placeholder="Your Name" />
          <input type="number" name="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" required />

          <div style={{ marginTop: '20px', borderTop: '2px solid #ddd', paddingTop: '20px' }}>
            <h4>Hackathon Details</h4>
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtitle/Tagline" />
            <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="About the Hackathon" style={{ minHeight: '100px' }} />

            <textarea
              value={whoCanParticipate}
              onChange={(e) => setWhoCanParticipate(e.target.value)}
              placeholder="Who Can Participate (one per line)"
              style={{ minHeight: '100px' }}
            />

            <textarea
              value={rewards}
              onChange={(e) => setRewards(e.target.value)}
              placeholder="Rewards/Prizes (one per line)"
              style={{ minHeight: '100px' }}
            />
          </div>

          <input type="file" name="hackathon_image" onChange={imageChangeHandler} />
          {imagePrev && <img src={imagePrev} alt="Hackathon preview" width={300} style={{ marginTop: '10px' }} />}
          <button type="submit"> {editId ? 'Update Hackathon' : 'Create Hackathon'}</button>
        </form>
      </div>
    </div>
  )
}

const StudentsContent = () => {
  const { backendUrl } = useContext(AppContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/admin/users`);
        if (!cancelled && data && data.success) {
          setStudents(data.users || []);
        }
      } catch (err) {
        console.error('Failed to fetch students', err);
        toast.error('Could not fetch students');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true };
  }, [backendUrl]);

  async function toggleVerify(userId, current) {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/user/verify`, { targetUserId: userId, verified: !current });
      if (data && data.success) {
        toast.success(data.message || 'Verification updated');
        setStudents((s) => s.map(u => u._id === userId ? { ...u, isAccountVerified: !current } : u));
      } else {
        toast.error(data.message || 'Could not update verification');
      }
    } catch (err) {
      console.error('verify err', err);
      toast.error('Failed to update verification');
    }
  }

  if (loading) return <div className="page-welcome-card">Loading students...</div>;

  return (
    <div className="page-welcome-card">
      <h2>Students</h2>
      <table className="hack-results-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Verified</th>
            <th>Enrolled Courses</th>
            <th>Enrolled Hackathons</th>
            <th>Completed Hackathons</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isAccountVerified ? '✅' : '❌'}</td>
              <td>{(u.enrolledCourses || []).length ? (u.enrolledCourses.map(c => c.name).join(', ')) : '—'}</td>
              <td>{(u.enrolledHackathons || []).length ? (u.enrolledHackathons.map(h => h.name).join(', ')) : '—'}</td>
              <td>{(u.completedHackathons || []).length}</td>
              <td>{new Date(u.createdAt).toLocaleString()}</td>
              <td>
                <button className="control-btn" onClick={() => toggleVerify(u._id, !!u.isAccountVerified)}>
                  {u.isAccountVerified ? 'Unverify' : 'Verify'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const HackathonScheduleContent = () => {
  const { backendUrl, activeHackathons } = useContext(AppContext);
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [useDatetime, setUseDatetime] = useState(true);
  const [studentEmails, setStudentEmails] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [mcqDuration, setMcqDuration] = useState(15);
  const [codingDuration, setCodingDuration] = useState(30);
  const [savingTimings, setSavingTimings] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState(['Java', 'Python', 'C++', 'C', 'SQL', 'JavaScript']);
  const [savingLanguages, setSavingLanguages] = useState(false);
  const availableLanguages = ['Java', 'Python', 'C++', 'C', 'SQL', 'JavaScript'];

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(backendUrl + '/api/hackathon/all/active');
        if (data && data.success && data.hackathons) {
          const hacksList = Array.isArray(data.hackathons) ? data.hackathons : [];
          setHackathons(hacksList);
          if (hacksList.length > 0) {
            setSelectedHackathonId(hacksList[0]._id);
          }
        } else {
          setHackathons([]);
        }
      } catch (err) {
        console.error('Failed to fetch hackathons', err);
        setHackathons([]);
      }
    })();
  }, [backendUrl]);

  useEffect(() => {
    if (!selectedHackathonId) return;

    (async () => {
      try {
        const { data } = await axios.get(backendUrl + `/api/hackathon/${selectedHackathonId}/schedule`);
        if (data && data.success && data.schedule) {
          const s = data.schedule;
          if (s.startDatetime && s.endDatetime) {
            const toLocalInput = (iso) => {
              const d = new Date(iso);
              const pad = (n) => String(n).padStart(2, '0');
              const yyyy = d.getFullYear();
              const mm = pad(d.getMonth() + 1);
              const dd = pad(d.getDate());
              const hh = pad(d.getHours());
              const min = pad(d.getMinutes());
              return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
            };
            setUseDatetime(true);
            setScheduleStart(toLocalInput(s.startDatetime));
            setScheduleEnd(toLocalInput(s.endDatetime));
          } else if (s.startTime && s.endTime) {
            setUseDatetime(false);
            setScheduleStart(s.startTime || '');
            setScheduleEnd(s.endTime || '');
          }
          // Load section timings
          setMcqDuration(s.mcqDuration || 15);
          setCodingDuration(s.codingDuration || 30);
        }
        // Load languages for the hackathon
        loadLanguagesForHackathon();
      } catch (err) {
        // ignore
      }
    })();
  }, [selectedHackathonId, backendUrl]);

  const saveSchedule = async () => {
    if (!selectedHackathonId) {
      toast.error('Please select a hackathon');
      return;
    }
    try {
      let payload;
      if (useDatetime) {
        payload = { startDatetime: new Date(scheduleStart).toISOString(), endDatetime: new Date(scheduleEnd).toISOString() };
      } else {
        payload = { startTime: scheduleStart, endTime: scheduleEnd };
      }
      const { data } = await axios.post(backendUrl + `/api/admin/hackathon/${selectedHackathonId}/schedule`, payload);
      if (data && data.success) {
        toast.success('Schedule saved');
      } else {
        toast.error(data.message || 'Could not save schedule');
      }
    } catch (err) {
      toast.error(err.message || 'Save failed');
    }
  }

  const saveSectionTimings = async () => {
    if (!selectedHackathonId) {
      toast.error('Please select a hackathon');
      return;
    }
    if (!mcqDuration || mcqDuration < 1) {
      toast.error('MCQ duration must be at least 1 minute');
      return;
    }
    if (!codingDuration || codingDuration < 1) {
      toast.error('Coding duration must be at least 1 minute');
      return;
    }
    setSavingTimings(true);
    try {
      const { data } = await axios.post(
        backendUrl + `/api/admin/hackathon/${selectedHackathonId}/section-timings`,
        { mcqDuration: parseInt(mcqDuration), codingDuration: parseInt(codingDuration) }
      );
      if (data && data.success) {
        toast.success('Section timings saved successfully');
      } else {
        toast.error(data.message || 'Could not save section timings');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save section timings');
    } finally {
      setSavingTimings(false);
    }
  }

  const saveLanguages = async () => {
    if (!selectedHackathonId) {
      toast.error('Please select a hackathon');
      return;
    }
    if (!selectedLanguages || selectedLanguages.length === 0) {
      toast.error('Please select at least one language');
      return;
    }
    setSavingLanguages(true);
    try {
      const { data } = await axios.post(
        backendUrl + `/api/admin/hackathon/${selectedHackathonId}/languages`,
        { languages: selectedLanguages }
      );
      if (data && data.success) {
        toast.success('Languages saved successfully');
      } else {
        toast.error(data.message || 'Could not save languages');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save languages');
    } finally {
      setSavingLanguages(false);
    }
  }

  const toggleLanguage = (language) => {
    setSelectedLanguages(prev => {
      if (prev.includes(language)) {
        return prev.filter(l => l !== language);
      } else {
        return [...prev, language];
      }
    });
  }

  const loadLanguagesForHackathon = async () => {
    if (!selectedHackathonId) return;
    try {
      const { data } = await axios.get(
        backendUrl + `/api/admin/hackathon/${selectedHackathonId}/languages`
      );
      if (data && data.success && data.languages) {
        setSelectedLanguages(data.languages);
      }
    } catch (err) {
      // If error, keep default languages
      console.log('Could not load languages, using defaults');
    }
  }

  const assignHackathons = async () => {
    if (!selectedHackathonId) {
      toast.error('Please select a hackathon');
      return;
    }

    if (!studentEmails.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    setAssignLoading(true);
    try {
      // Parse emails from textarea (comma or newline separated)
      const emails = studentEmails
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (emails.length === 0) {
        toast.error('Please enter valid email addresses');
        setAssignLoading(false);
        return;
      }

      const { data } = await axios.post(
        backendUrl + '/api/hackathon/assign/students',
        { emails, hackathonId: selectedHackathonId }
      );

      if (data && data.success) {
        // Show results
        const successful = data.results.filter(r => r.success).length;
        const failed = data.results.filter(r => !r.success).length;

        toast.success(`Assigned to ${successful} students${failed > 0 ? `, ${failed} failed` : ''}`);

        // Show failed emails details
        const failedResults = data.results.filter(r => !r.success);
        if (failedResults.length > 0) {
          failedResults.forEach(result => {
            console.log(`${result.email}: ${result.message}`);
          });
        }

        setStudentEmails('');
      } else {
        toast.error(data.message || 'Assignment failed');
      }
    } catch (err) {
      toast.error(err.message || 'Request failed');
    } finally {
      setAssignLoading(false);
    }
  }

  return (
    <div className="page-welcome-card">
      <h2>Hackathon Settings</h2>

      {/* Hackathon Selection */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 500 }}>Select Hackathon:</label>
        <select
          value={selectedHackathonId}
          onChange={(e) => setSelectedHackathonId(e.target.value)}
          style={{ padding: 8, fontSize: 14, borderRadius: 4, border: '1px solid #ccc', minWidth: 300 }}
        >
          <option value="">-- Select a Hackathon --</option>
          {hackathons.map((hack) => (
            <option key={hack._id} value={hack._id}>
              {hack.name}
            </option>
          ))}
        </select>
      </div>

      {selectedHackathonId && (
        <>
          {/* Schedule Settings Section */}
          <div style={{ marginBottom: 30, paddingBottom: 20, borderBottom: '1px solid #eee' }}>
            <h3 style={{ marginBottom: 15 }}>Hackathon Schedule</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Mode:
                <select value={useDatetime ? 'datetime' : 'daily'} onChange={(e) => setUseDatetime(e.target.value === 'datetime')}>
                  <option value="datetime">Specific Date & Time</option>
                  <option value="daily">Daily Time Window (IST)</option>
                </select>
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ minWidth: 50 }}>Start:</label>
                {useDatetime ? (
                  <input type="datetime-local" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} />
                ) : (
                  <input type="time" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} />
                )}
                <label style={{ minWidth: 40 }}>End:</label>
                {useDatetime ? (
                  <input type="datetime-local" value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)} />
                ) : (
                  <input type="time" value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)} />
                )}
                <button onClick={saveSchedule} style={{ height: 36 }}>Save Schedule</button>
              </div>
            </div>
          </div>

          {/* Section Timings Settings */}
          <div style={{ marginBottom: 30, paddingBottom: 20, borderBottom: '1px solid #eee' }}>
            <h3 style={{ marginBottom: 15 }}>Section Timings (in Minutes)</h3>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontWeight: 500 }}>MCQ Duration:</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={mcqDuration}
                  onChange={(e) => setMcqDuration(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc', width: 120 }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontWeight: 500 }}>Coding Duration:</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={codingDuration}
                  onChange={(e) => setCodingDuration(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc', width: 120 }}
                />
              </div>
              <button
                onClick={saveSectionTimings}
                disabled={savingTimings}
                style={{
                  padding: '8px 20px',
                  backgroundColor: savingTimings ? '#999' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: savingTimings ? 'not-allowed' : 'pointer',
                  fontWeight: 500
                }}
              >
                {savingTimings ? 'Saving...' : 'Save Timings'}
              </button>
            </div>
          </div>

          {/* Languages Settings */}
          <div style={{ marginBottom: 30, paddingBottom: 20, borderBottom: '1px solid #eee' }}>
            <h3 style={{ marginBottom: 15 }}>Supported Languages for Coding</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, marginBottom: 15 }}>
              {availableLanguages.map((lang) => (
                <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    id={`lang-${lang}`}
                    checked={selectedLanguages.includes(lang)}
                    onChange={() => toggleLanguage(lang)}
                    style={{ cursor: 'pointer', width: 18, height: 18 }}
                  />
                  <label htmlFor={`lang-${lang}`} style={{ fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>
                    {lang}
                  </label>
                </div>
              ))}
            </div>
            <button
              onClick={saveLanguages}
              disabled={savingLanguages}
              style={{
                padding: '8px 20px',
                backgroundColor: savingLanguages ? '#999' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: savingLanguages ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              {savingLanguages ? 'Saving...' : 'Save Languages'}
            </button>
          </div>

          {/* Student Assignment Section */}
          <div>
            <h3 style={{ marginBottom: 15 }}>Assign Hackathon to Students</h3>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Student Email Addresses:</label>
              <textarea
                value={studentEmails}
                onChange={(e) => setStudentEmails(e.target.value)}
                placeholder="Enter email addresses (comma or newline separated)&#10;e.g.:&#10;student1@gmail.com, student2@gmail.com&#10;or&#10;student1@gmail.com&#10;student2@gmail.com"
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: 10,
                  fontSize: 14,
                  fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                  borderRadius: 4,
                  border: '1px solid #ccc'
                }}
              />
            </div>
            <button
              onClick={assignHackathons}
              disabled={assignLoading}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                backgroundColor: assignLoading ? '#999' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: assignLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {assignLoading ? 'Assigning...' : 'Assign Hackathon'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const CourseSettingsContent = () => {
  const { backendUrl } = useContext(AppContext);
  const [activeCourses, setActiveCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [studentEmails, setStudentEmails] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveCourses();
  }, [backendUrl]);

  const fetchActiveCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/courses/all/active`);
      if (data.success && data.activeCourses && data.activeCourses.courses) {
        setActiveCourses(data.activeCourses.courses);
        if (data.activeCourses.courses.length > 0) {
          setSelectedCourseId(data.activeCourses.courses[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const assignCourses = async () => {
    if (!selectedCourseId) {
      toast.error('Please select a course');
      return;
    }

    if (!studentEmails.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    setAssignLoading(true);
    try {
      // Parse emails from textarea (comma or newline separated)
      const emails = studentEmails
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (emails.length === 0) {
        toast.error('Please enter valid email addresses');
        setAssignLoading(false);
        return;
      }

      const { data } = await axios.post(
        backendUrl + '/api/courses/assign/students',
        { emails, courseId: selectedCourseId }
      );

      if (data && data.success) {
        // Show results
        const successful = data.results.filter(r => r.success).length;
        const failed = data.results.filter(r => !r.success).length;

        toast.success(`Assigned to ${successful} students${failed > 0 ? `, ${failed} failed` : ''}`);

        // Show failed emails details
        const failedResults = data.results.filter(r => !r.success);
        if (failedResults.length > 0) {
          failedResults.forEach(result => {
            console.log(`${result.email}: ${result.message}`);
          });
        }

        setStudentEmails('');
      } else {
        toast.error(data.message || 'Assignment failed');
      }
    } catch (err) {
      toast.error(err.message || 'Request failed');
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return <div className="page-welcome-card">Loading courses...</div>;
  }

  return (
    <div className="page-welcome-card">
      <h2 style={{ color: 'white'  }}>Course Settings</h2>

      {/* Student Assignment Section */}
      <div>
        <h3 style={{ marginBottom: 15, color: 'white'  }}>Assign Course to Students</h3>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'white' }}>Select Course:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              fontSize: 14,
              borderRadius: 4,
              border: '1px solid #ccc',
              marginBottom: 15
            }}
          >
            {activeCourses.map(course => (
              <option key={course._id} value={course._id}>
                {course.name} - ₹{course.price}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: 'white' }}>Student Email Addresses:</label>
          <textarea
            value={studentEmails}
            onChange={(e) => setStudentEmails(e.target.value)}
            placeholder="Enter email addresses (comma or newline separated)&#10;e.g.:&#10;student1@gmail.com, student2@gmail.com&#10;or&#10;student1@gmail.com&#10;student2@gmail.com"
            style={{
              width: '100%',
              minHeight: 120,
              padding: 10,
              fontSize: 14,
              fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
              borderRadius: 4,
              border: '1px solid #ccc'
            }}
          />
        </div>
        <button
          onClick={assignCourses}
          disabled={assignLoading}
          style={{
            padding: '10px 20px',
            fontSize: 14,
            backgroundColor: assignLoading ? '#999' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: assignLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {assignLoading ? 'Assigning...' : 'Assign Course'}
        </button>
      </div>
    </div>
  );
}

const PlaceholderContent = ({ pageName }) => (
  <div className="page-welcome-card">
    <h2>{pageName}</h2>
    <p>This section is under development.</p>
  </div>
);

const FeesContent = () => {
  const { backendUrl } = useContext(AppContext);
  const [coursePurchasing, setCoursePurchasing] = useState([]);
  const [hackathonPurchasing, setHackathonPurchasing] = useState([]);
  const [coursesStats, setCoursesStats] = useState([]);
  const [hackathonsStats, setHackathonsStats] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(false);
  const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  useEffect(() => {
    fetchPaymentHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  useEffect(() => {
    // Auto-refresh data when switching tabs
    if (activeTab === 'courses' || activeTab === 'hackathons') {
      fetchPaymentHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, backendUrl]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      // Fetch all users and courses for detailed stats
      const usersRes = await axios.get(backendUrl + '/api/admin/users').catch(() => null);
      const allUsers = usersRes?.data?.users || [];

      const adminRes = await axios.get(backendUrl + '/api/admin/allDetails').catch(() => null);
      const allCourses = adminRes?.data?.adminData?.all_courses || [];

      // Build detailed course stats with enrolled and completed counts
      const courseStats = allCourses.map(course => {
        const courseIdStr = course._id?.toString() || course._id;

        // Use enrollmentCount from course document instead of calculating
        const enrolled = course.enrollmentCount || 0;

        const completed = allUsers.filter(user => {
          const completedCourses = user.completedCourses || [];
          return completedCourses.some(c => {
            const completedIdStr = c.courseId?.toString?.() || c.courseId?.toString() || c.courseId;
            return completedIdStr === courseIdStr;
          });
        }).length;

        return {
          name: course.name,
          price: Number(course.price) || 0,
          enrolled: enrolled,
          completed: completed
        };
      });

      setCoursesStats(courseStats);

      // Fetch course purchasing history
      const coursesRes = await axios.get(`${backendUrl}/api/payment-history/courses`).catch(() => null);
      if (coursesRes?.data?.success && coursesRes?.data?.coursePurchasing) {
        setCoursePurchasing(coursesRes.data.coursePurchasing);
      }
    } catch (err) {
      console.error('Failed to fetch course data:', err);
    }

    try {
      // Fetch all users and hackathons for detailed stats
      const usersRes = await axios.get(backendUrl + '/api/admin/users').catch(() => null);
      const allUsers = usersRes?.data?.users || [];

      const hackathonsRes = await axios.get(backendUrl + '/api/hackathon/all').catch(() => null);
      const allHackathons = hackathonsRes?.data?.hackathons || [];

      // Build detailed hackathon stats with enrolled and completed counts
      const hackathonStats = allHackathons.map(hackathon => {
        const hackathonIdStr = hackathon._id?.toString() || hackathon._id;

        // Use enrollmentCount from hackathon document instead of calculating
        const enrolled = hackathon.enrollmentCount || 0;

        const completed = allUsers.filter(user => {
          const completedHackathons = user.completedHackathons || [];
          return completedHackathons.some(h => {
            const completedIdStr = h.hackathonId?.toString?.() || h.hackathonId?.toString() || h.hackathonId;
            return completedIdStr === hackathonIdStr;
          });
        }).length;

        return {
          name: hackathon.name,
          price: Number(hackathon.price) || 0,
          enrolled: enrolled,
          completed: completed
        };
      });

      setHackathonsStats(hackathonStats);

      // Fetch hackathon purchasing history
      const hackathonHistoryRes = await axios.get(`${backendUrl}/api/payment-history/hackathons`).catch(() => null);
      if (hackathonHistoryRes?.data?.success && hackathonHistoryRes?.data?.hackathonPurchasing) {
        setHackathonPurchasing(hackathonHistoryRes.data.hackathonPurchasing);
      }
    } catch (err) {
      console.error('Failed to fetch hackathon data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="page-welcome-card">
      <h2>Fees History</h2>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setActiveTab('courses')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'courses' ? '#4CAF50' : '#ddd',
            color: activeTab === 'courses' ? 'white' : 'black',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: activeTab === 'courses' ? 'bold' : 'normal',
            fontSize: '14px'
          }}
        >
          Courses
        </button>
        <button
          onClick={() => setActiveTab('hackathons')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'hackathons' ? '#4CAF50' : '#ddd',
            color: activeTab === 'hackathons' ? 'white' : 'black',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: activeTab === 'hackathons' ? 'bold' : 'normal',
            fontSize: '14px'
          }}
        >
          Hackathons
        </button>
        <button
          onClick={fetchPaymentHistory}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#999' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            marginLeft: 'auto'
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {activeTab === 'courses' && (
        <div>
          <h3>Courses - Fees Summary</h3>
          <div style={{ overflowX: 'auto', marginBottom: 30 }}>
            <table className="hack-results-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Enrolled</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {coursesStats.length > 0 ? (
                  coursesStats.map((c, i) => (
                    <tr key={i}>
                      <td>{c.name}</td>
                      <td>{inr.format(c.price)}</td>
                      <td>{c.enrolled}</td>
                      <td>{c.completed}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                      {loading ? 'Loading...' : 'No courses available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h3>Course Purchasing History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="hack-results-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student Email</th>
                  <th>Course Name</th>
                  <th>Price</th>
                  <th>Enrolled Date</th>
                </tr>
              </thead>
              <tbody>
                {coursePurchasing.length > 0 ? (
                  coursePurchasing.map((item, i) => (
                    <tr key={i}>
                      <td>{item.studentName}</td>
                      <td>{item.studentEmail}</td>
                      <td>{item.itemName}</td>
                      <td>{inr.format(item.price)}</td>
                      <td>{formatDate(item.purchasedAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      {loading ? 'Loading...' : 'No course purchases yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'hackathons' && (
        <div>
          <h3>Hackathons - Fees Summary</h3>
          <div style={{ overflowX: 'auto', marginBottom: 30 }}>
            <table className="hack-results-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Enrolled</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {hackathonsStats.length > 0 ? (
                  hackathonsStats.map((h, i) => (
                    <tr key={i}>
                      <td>{h.name}</td>
                      <td>{inr.format(h.price)}</td>
                      <td>{h.enrolled}</td>
                      <td>{h.completed}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                      {loading ? 'Loading...' : 'No hackathons available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h3>Hackathon Purchasing History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="hack-results-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student Email</th>
                  <th>Hackathon Name</th>
                  <th>Price</th>
                  <th>Enrolled Date</th>
                </tr>
              </thead>
              <tbody>
                {hackathonPurchasing.length > 0 ? (
                  hackathonPurchasing.map((item, i) => (
                    <tr key={i}>
                      <td>{item.studentName}</td>
                      <td>{item.studentEmail}</td>
                      <td>{item.itemName}</td>
                      <td>{inr.format(item.price)}</td>
                      <td>{formatDate(item.purchasedAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      {loading ? 'Loading...' : 'No hackathon purchases yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};



// Main Component

const ContactsContent = () => {
  const { backendUrl } = useContext(AppContext);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, [backendUrl]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/contact/all`, {
        withCredentials: true
      });

      if (data.success) {
        console.log("Contacts fetched:", data.contacts); // Debug log
        setContacts(data.contacts || []);
      } else {
        toast.error(data.message || "Failed to fetch contacts");
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      toast.error(error.message || "Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const { data } = await axios.put(`${backendUrl}/api/contact/${id}/read`, {}, {
        withCredentials: true
      });

      if (data.success) {
        setContacts(contacts.map(c => c._id === id ? { ...c, status: "read" } : c));
        toast.success("Marked as read");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update");
    }
  };

  const handleMarkAsReplied = async (id) => {
    try {
      const { data } = await axios.put(`${backendUrl}/api/contact/${id}/replied`, {}, {
        withCredentials: true
      });

      if (data.success) {
        setContacts(contacts.map(c => c._id === id ? { ...c, status: "replied" } : c));
        toast.success("Marked as replied");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    try {
      const { data } = await axios.delete(`${backendUrl}/api/contact/${id}`, {
        withCredentials: true
      });

      if (data.success) {
        setContacts(contacts.filter(c => c._id !== id));
        toast.success("Contact deleted");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const filteredContacts = selectedStatus === "all"
    ? contacts
    : contacts.filter(c => c.status === selectedStatus);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "new": return "#ff6b6b";
      case "read": return "#ffd93d";
      case "replied": return "#51cf66";
      default: return "#999";
    }
  };

  const getStatusBadgeLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) return <div className="page-welcome-card">Loading contacts...</div>;

  return (
    <div className="page-welcome-card">
      <h2>Contact Submissions</h2>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: 10, fontWeight: 500 }}>Filter by Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 4,
              border: '1px solid #ccc',
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            <option value="all">All ({contacts.length})</option>
            <option value="new">New ({contacts.filter(c => c.status === "new").length})</option>
            <option value="read">Read ({contacts.filter(c => c.status === "read").length})</option>
            <option value="replied">Replied ({contacts.filter(c => c.status === "replied").length})</option>
          </select>
        </div>
        <button
          onClick={fetchContacts}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
            marginLeft: 'auto'
          }}
        >
          Refresh
        </button>
      </div>

      {filteredContacts.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
          No contacts found
        </div>
      ) : (
        <>
          <div style={{ padding: 12, marginBottom: 15, backgroundColor: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 4, color: '#1565c0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>💡</span> <strong>Tip:</strong> Click on any row to expand and view the full message
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="hack-results-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <React.Fragment key={contact._id}>
                    <tr
                      style={{ cursor: 'pointer', backgroundColor: contact.status === 'new' ? '#fff9e6' : '#fff' }}
                      onClick={() => setExpandedId(expandedId === contact._id ? null : contact._id)}
                    >
                      <td style={{ color: '#000' }}>
                        {contact.name}
                      </td>
                      <td style={{ color: '#000' }}>
                        {contact.email}
                      </td>
                      <td style={{ color: '#000' }}>
                        {contact.phone}
                      </td>
                      <td style={{ color: '#000' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            backgroundColor: getStatusBadgeColor(contact.status),
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {getStatusBadgeLabel(contact.status)}
                        </span>
                      </td>
                      <td style={{ color: '#000' }}>{new Date(contact.createdAt).toLocaleString()}</td>
                      <td style={{ whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                        {contact.status === 'new' && (
                          <button
                            className="control-btn"
                            onClick={() => handleMarkAsRead(contact._id)}
                            title="Mark as Read"
                            style={{ color: '#000' }}
                          >
                            Read
                          </button>
                        )}
                        {contact.status !== 'replied' && (
                          <button
                            className="control-btn"
                            onClick={() => handleMarkAsReplied(contact._id)}
                            title="Mark as Replied"
                            style={{ marginLeft: '4px', color: '#000' }}
                          >
                            Reply
                          </button>
                        )}
                        <button
                          className="control-btn"
                          onClick={() => handleDelete(contact._id)}
                          title="Delete"
                          style={{ marginLeft: '4px', backgroundColor: '#dc3545', color: '#fff' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {expandedId === contact._id && (
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <td colSpan="6" style={{ padding: '20px', borderLeft: '4px solid #007bff' }}>
                          <div>
                            <h4 style={{ margin: '0 0 15px 0', color: '#000', fontSize: '16px', fontWeight: 'bold' }}>📧 Message Details:</h4>

                            <div style={{ marginBottom: 15 }}>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: 5 }}>Name:</label>
                              <p style={{ margin: 0, padding: 10, backgroundColor: '#fff', borderLeft: '3px solid #007bff', color: '#000' }}>
                                {contact?.name || 'N/A'}
                              </p>
                            </div>

                            <div style={{ marginBottom: 15 }}>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: 5 }}>Email:</label>
                              <p style={{ margin: 0, padding: 10, backgroundColor: '#fff', borderLeft: '3px solid #007bff', color: '#000' }}>
                                {contact?.email || 'N/A'}
                              </p>
                            </div>

                            <div style={{ marginBottom: 15 }}>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: 5 }}>Phone:</label>
                              <p style={{ margin: 0, padding: 10, backgroundColor: '#fff', borderLeft: '3px solid #007bff', color: '#000' }}>
                                {contact?.phone || 'N/A'}
                              </p>
                            </div>

                            <h5 style={{ margin: '20px 0 10px 0', color: '#000', fontSize: '14px', fontWeight: 'bold' }}>💬 Message:</h5>
                            <p style={{
                              margin: 0,
                              padding: 15,
                              backgroundColor: '#fff',
                              borderLeft: '4px solid #ffc107',
                              borderRadius: '4px',
                              lineHeight: '1.8',
                              color: '#000',
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word',
                              fontSize: '14px',
                              minHeight: '80px'
                            }}>
                              {contact?.message ? contact.message : 'No message available'}
                            </p>

                            <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                              <div>
                                <div style={{ fontSize: '11px', color: '#999', marginBottom: 3 }}>Submitted: {new Date(contact?.createdAt).toLocaleString()}</div>
                                <div style={{ fontSize: '11px', color: '#999' }}>Last Updated: {new Date(contact?.updatedAt).toLocaleString()}</div>
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                {contact?.status === 'new' && (
                                  <button
                                    onClick={() => handleMarkAsRead(contact._id)}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: '#ffc107',
                                      color: '#000',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    ✓ Mark as Read
                                  </button>
                                )}
                                {contact?.status !== 'replied' && (
                                  <button
                                    onClick={() => handleMarkAsReplied(contact._id)}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: '#51cf66',
                                      color: '#000',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    ✓ Mark as Replied
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// Main Component

const DashboardContent = () => {
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem('adminActivePage') || 'Home';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { backendUrl, setUserData, setIsLoggedin } = useContext(AppContext)
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('adminActivePage', activePage);
  }, [activePage]);

  // Tutors Content Component
  const TutorsContent = () => {
    const { backendUrl } = useContext(AppContext);
    const [tutors, setTutors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [activeTab, setActiveTab] = useState("tutors"); // "tutors" or "assign"

    useEffect(() => {
      let cancelled = false;

      const fetchAllData = async () => {
        try {
          // Fetch tutors from dedicated tutors endpoint
          const tutorsRes = await axios.get(`${backendUrl}/api/admin/tutors`, {
            withCredentials: true
          });
          if (!cancelled && tutorsRes.data && tutorsRes.data.success) {
            setTutors(tutorsRes.data.tutors || []);
          }

          // Fetch courses
          const coursesRes = await axios.get(`${backendUrl}/api/courses/all`);
          if (!cancelled && coursesRes.data && coursesRes.data.success) {
            setCourses(coursesRes.data.courses || []);
          }

              // Fetch assignments
              const assignmentsRes = await axios.get(`${backendUrl}/api/tutor-assignment/assignments`, {
                withCredentials: true
              });
              if (!cancelled && assignmentsRes.data && assignmentsRes.data.success) {
                const raw = assignmentsRes.data.assignments || [];
                const enriched = enrichAssignments(raw, tutorsRes.data?.tutors || tutors, coursesRes.data?.courses || courses);
                setAssignments(enriched);
              }
        } catch (error) {
          console.error('Error fetching data:', error);
          if (!cancelled) {
            toast.error("Failed to fetch data");
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      fetchAllData();
      return () => { cancelled = true };
    }, [backendUrl]);

    const handleAssignCourse = async (e) => {
      e.preventDefault();

      if (!selectedTutor || !selectedCourse) {
        toast.error("Please select both tutor and course");
        return;
      }

      setAssigning(true);
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/tutor-assignment/assign-course`,
          { tutorId: selectedTutor, courseId: selectedCourse },
          { withCredentials: true }
        );

        if (data.success) {
          toast.success("Course assigned to tutor successfully");
          setSelectedTutor("");
          setSelectedCourse("");

          // Refresh assignments
          const assignmentsRes = await axios.get(`${backendUrl}/api/tutor-assignment/assignments`, {
            withCredentials: true
          });
          if (assignmentsRes.data && assignmentsRes.data.success) {
            setAssignments(assignmentsRes.data.assignments || []);
          }
        } else {
          toast.error(data.message || "Failed to assign course");
        }
      } catch (error) {
        toast.error(error.message || "Failed to assign course");
      } finally {
        setAssigning(false);
      }
    };

    const handleRemoveAssignment = async (assignmentId) => {
      try {
        const { data } = await axios.put(
          `${backendUrl}/api/tutor-assignment/assignment/${assignmentId}/remove`,
          {},
          { withCredentials: true }
        );

        if (data.success) {
          toast.success("Course removed from tutor");

          // Refresh assignments
          const assignmentsRes = await axios.get(`${backendUrl}/api/tutor-assignment/assignments`, {
            withCredentials: true
          });
          if (assignmentsRes.data && assignmentsRes.data.success) {
            setAssignments(assignmentsRes.data.assignments || []);
          }
        } else {
          toast.error(data.message || "Failed to remove assignment");
        }
      } catch (error) {
        toast.error(error.message || "Failed to remove assignment");
      }
    };

    const handleVerifyTutor = async (tutorId, currentVerification) => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/admin/tutor/verify`,
          { targetTutorId: tutorId, verified: !currentVerification },
          { withCredentials: true }
        );

        if (data.success) {
          toast.success(data.message || "Tutor verification updated");
          // Update tutors list
          setTutors((prevTutors) =>
            prevTutors.map((tutor) =>
              tutor._id === tutorId
                ? { ...tutor, isAccountVerified: !currentVerification }
                : tutor
            )
          );
        } else {
          toast.error(data.message || "Failed to update verification");
        }
      } catch (error) {
        toast.error(error.message || "Failed to update verification");
      }
    };

    if (loading) return <div className="page-welcome-card">Loading tutors and courses...</div>;

    return (
      <div className="tutors-content">
        <h2>Manage Tutors</h2>

        {/* Tab Navigation */}
        <div className="tutor-tabs">
          <button
            className={`tab-btn ${activeTab === "tutors" ? "active" : ""}`}
            onClick={() => setActiveTab("tutors")}
          >
            All Tutors ({tutors.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "assign" ? "active" : ""}`}
            onClick={() => setActiveTab("assign")}
          >
            Assign Courses
          </button>
        </div>

        {/* Tutors List Tab */}
        {activeTab === "tutors" && (
          <div className="page-welcome-card">
            <h3>All Tutors</h3>
            <table className="hack-results-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Verified</th>
                  <th>Assigned Courses</th>
                  <th>Meets</th>
                  <th>Videos</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tutors.length > 0 ? (
                  tutors.map((tutor) => (
                    <tr key={tutor._id}>
                      <td>{tutor.name}</td>
                      <td>{tutor.email}</td>
                      <td>{tutor.isAccountVerified ? '✅' : '❌'}</td>
                      <td>
                        {(tutor.assignedCourses || []).length > 0
                          ? (tutor.assignedCourses.map(c => c.name || c._id).join(', '))
                          : '—'
                        }
                      </td>
                      <td>
                        <span className="badge">{(tutor.tutorMeets || []).length}</span>
                      </td>
                      <td>
                        <span className="badge">{(tutor.tutorVideos || []).length}</span>
                      </td>
                      <td>{new Date(tutor.createdAt).toLocaleString()}</td>
                      <td>
                        <button
                          className="control-btn"
                          onClick={() => handleVerifyTutor(tutor._id, tutor.isAccountVerified)}
                        >
                          {tutor.isAccountVerified ? 'Unverify' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center' }}>No tutors found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Assign Course Tab */}
        {activeTab === "assign" && (
          <>
            <div className="assign-course-section">
              <h3>Assign Course to Tutor</h3>
              <form onSubmit={handleAssignCourse} className="assign-course-form">
                <div className="form-group">
                  <label>Select Tutor ({tutors.length} available):</label>
                  <select
                    value={selectedTutor}
                    onChange={(e) => setSelectedTutor(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a Tutor --</option>
                    {tutors.length > 0 ? (
                      tutors.map((tutor) => (
                        <option key={tutor._id} value={tutor._id}>
                          {tutor.name} ({tutor.email})
                        </option>
                      ))
                    ) : (
                      <option disabled>No tutors available</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Course ({courses.length} available):</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    required
                  >
                    <option value="">-- Choose a Course --</option>
                    {courses.length > 0 ? (
                      courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No courses available</option>
                    )}
                  </select>
                </div>

                <button type="submit" disabled={assigning}>
                  {assigning ? "Assigning..." : "Assign Course"}
                </button>
              </form>
            </div>

            {/* Assignments List */}
            <div className="assignments-list">
              <h3>Current Tutor Assignments ({assignments.length})</h3>
              {assignments.length === 0 ? (
                <p>No assignments found</p>
              ) : (
                <table className="hack-results-table">
                  <thead>
                    <tr>
                      <th>Tutor Name</th>
                      <th>Tutor Email</th>
                      <th>Course Name</th>
                      <th>Assigned Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => (
                      <tr key={assignment._id}>
                        <td>{assignment.tutor?.name || '—'}</td>
                        <td>{assignment.tutor?.email || (assignment.tutorEmail || '—')}</td>
                        <td>{assignment.course?.name || assignment.courseName || '—'}</td>
                        <td>{assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString() : '—'}</td>
                        <td>
                          <button
                            className="control-btn remove-btn"
                            onClick={() => handleRemoveAssignment(assignment._id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const AdminLogout = async () => {
    try {

      axios.defaults.withCredentials = true;

      const { data } = await axios.post(backendUrl + "/api/logout")
      data.success && setIsLoggedin(false);
      data.success && setUserData(false);
      navigate("/")

    }
    catch (error) {
      toast.error(error.message);
    }
    setShowLogoutConfirm(false);

  }

  // lock body scroll when sidebar open (mobile)
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);


  const pages = {
    Home: HomeContentLive,
    Staff: StaffContent,
    Students: StudentsContent,
    Courses: CoursesContent,
    Tutors: TutorsContent,
    Hackathons: HackathonsContent,
    "Hackathon Settings": HackathonScheduleContent,
    "Course Settings": CourseSettingsContent,
    "Fees History": FeesContent,
    "Hackathon Results": HackathonResults,
    "Manage Questions": AdminQuestions,
    "Manage Courses": AdminManageCourses,
    Contacts: ContactsContent,
  };

  const Page = pages[activePage] || HomeContentLive;

  return (
    <div className="dashboard-container">
      <div
        className={`hamburger ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav
        className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
        role="navigation"
      >
        <ul>
          {sidebarItems.map((item) => (
            <li key={item}>
              <button
                className={`sidebar-item ${activePage === item ? "active" : ""
                  }`}
                onClick={() => {
                  setActivePage(item);
                  setSidebarOpen(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
        <button className="logoutButton" onClick={() => setShowLogoutConfirm(true)}>Logout</button>
      </nav>

      {/* overlay for mobile sidebar */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <main className="main-content">
        <Page pageName={activePage} />
      </main>

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
                onClick={AdminLogout}
                style={{
                  padding: '10px 24px',
                  backgroundColor: "#512da8",
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
    </div>
  );
};

export default DashboardContent;
