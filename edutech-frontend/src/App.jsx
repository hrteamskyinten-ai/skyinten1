import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FAQs from "./components/FAQs";
// import Community from "./components/Community";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";

// Exam pages
import ExamInstructions from "./pages/HackathonExam/ExamInstructions";
import ExamInterface from "./pages/HackathonExam/ExamInterface";
import ExamInterfaceCode from "./pages/HackathonExam/ExamInterfaceCode";
import HackathonSuccess from "./pages/HackathonExam/HackathonSuccess";


// Existing Pages
const HomePage = lazy(() => import("./pages/HomePage"));
const Courses = lazy(() => import("./pages/Courses"));
const Hackathons = lazy(() => import("./pages/Hackathons"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const LoginSignup = lazy(() => import("./components/LoginSignup"));
const StudentDashboard = lazy(() => import("./pages/Dashboard/StudentDashboard"));
const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const Payment = lazy(() => import("./components/Payment"));
const ForgetPassword = lazy(() => import("./components/ForgetPassword"));
const VerifyMail = lazy(() => import("./components/VerifyMail"));
const TutorDashboard = lazy(() => import("./pages/Dashboard/TutorDashboard"));

// Course Cards
const AIRobotics = lazy(() => import("./courseCards/AI Robotics"));
const Backend = lazy(() => import("./courseCards/Backend Development Bootcamp"));
const CloudComputing = lazy(() => import("./courseCards/Cloud Computing"));
const CyberSecurity = lazy(() => import("./courseCards/Cyber Security"));
const DataAnalyst = lazy(() => import("./courseCards/Data Analyst"));
const Devops = lazy(() => import("./courseCards/DevOps"));
const Frontend = lazy(() => import("./courseCards/Frontend Development Bootcamp"));
const FullStack = lazy(() => import("./courseCards/Full-Stack Web Development Bootcamp"));
const Java = lazy(() => import("./courseCards/Java Programming"));
const Marketing = lazy(() => import("./courseCards/Digital Marketing"));
const Python = lazy(() => import("./courseCards/Python Programming"));
const StartUp = lazy(() => import("./courseCards/Startup & Entrepreneurship"));
const CourseResources = lazy(() => import("./pages/CourseResources"));
const CoursePage = lazy(() => import("./pages/CoursePage"));
const AssignmentPage = lazy(() => import("./pages/AssignmentPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const CancellationRefund = lazy(() => import("./pages/CancellationRefund"));

// Hackathon Cards
const AIInnovation = lazy(() => import("./hackathonCards/AIInnovation"));
const CodeClash = lazy(() => import("./hackathonCards/CodeClash"));
const DataScience = lazy(() => import("./hackathonCards/DataScience"));
const FrontendSprint = lazy(() => import("./hackathonCards/FrontendSprint"));
const MobileApp = lazy(() => import("./hackathonCards/MobileApp"));
const UIUX = lazy(() => import("./hackathonCards/UIUX"));
const WebDev = lazy(() => import("./hackathonCards/WebDev"));
const HackathonPage = lazy(() => import("./pages/HackathonPage"));

function App() {
  const location = useLocation();
  const hideLayout =
    location.pathname === "/login" ||
    location.pathname.startsWith("/payment") ||
    location.pathname.startsWith("/HackathonExam/ExamInstructions") ||
    location.pathname.startsWith("/HackathonExam/ExamInterface") ||
    location.pathname.startsWith("/HackathonExam/ExamInterfaceCode") ||
    location.pathname.startsWith("/HackathonExam/HackathonSuccess") ||
    location.pathname.startsWith("/tutor-dashboard");


  

  return (
    <div className="app-container">
      <ToastContainer />
      {!hideLayout && <Navbar />}

      <Suspense fallback={<div className="page-loader">Loading...</div>}>
        <main>
          <Routes>
            {/* --- Main Pages --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/tutor-dashboard" element={<ProtectedRoute requiredRole="tutor"><TutorDashboard /></ProtectedRoute>} />

            {/* --- Course Pages --- */}
            <Route path="/course/:slug" element={<CoursePage />} />
            <Route path="/course/AI Robotics" element={<AIRobotics />} />
            <Route path="/course/Backend Development Bootcamp" element={<Backend />} />
            <Route path="/course/Cloud Computing" element={<CloudComputing />} />
            <Route path="/course/Cyber Security" element={<CyberSecurity />} />
            <Route path="/course/Data Analyst" element={<DataAnalyst />} />
            <Route path="/course/DevOps" element={<Devops />} />
            <Route path="/course/Frontend Development Bootcamp" element={<Frontend />} />
            <Route path="/course/Full-Stack Web Development Bootcamp" element={<FullStack />} />
            <Route path="/course/Java Programming" element={<Java />} />
            <Route path="/course/Digital Marketing" element={<Marketing />} />
            <Route path="/course/Python Programming" element={<Python />} />
            <Route path="/course/Startup & Entrepreneurship" element={<StartUp />} />

            <Route path="/course/resources" element={<CourseResources />} />
            <Route path="/assignment/:courseId/:moduleId" element={<AssignmentPage />} />

            <Route path="/payment" element={<Payment />} />
            <Route path="/forgetPassword" element={<ForgetPassword />} />
            <Route path="/verifyMail" element={<VerifyMail />} />

            {/* --- Policy Pages --- */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/cancellation-refund" element={<CancellationRefund />} />

            {/* --- Hackathon Pages --- */}
            <Route path="/hackathon/:slug" element={<HackathonPage />} />
            <Route path="hackathon/AI Innovation Challenge" element={<AIInnovation />} />
            <Route path="hackathon/Full-Stack Code Clash" element={<CodeClash />} />
            <Route path="hackathon/Data Science Sprint" element={<DataScience />} />
            <Route
              path="hackathon/Frontend Development Sprint"
              element={<FrontendSprint />}
            />
            <Route path="hackathon/Mobile App Marathon" element={<MobileApp />} />
            <Route path="hackathon/UI/UX Design Challenge" element={<UIUX />} />
            <Route path="hackathon/Web Development Challenge" element={<WebDev />} />

            <Route
              path="/HackathonExam/ExamInstructions"
              element={<ExamInstructions />}
            />
            <Route
              path="/HackathonExam/ExamInterface"
              element={<ExamInterface />}
            />
            <Route
              path="/HackathonExam/ExamInterfaceCode"
              element={<ExamInterfaceCode />}
            />
            <Route
              path="/HackathonExam/HackathonSuccess"
              element={<HackathonSuccess />}
            />

            <Route path="/FAQs" element={<FAQs />} />
            {/* <Route path="/community" element={<Community />} /> */}

          </Routes>
        </main>
      </Suspense>

      {!hideLayout && !location.pathname.startsWith("/dashboard") && !location.pathname.startsWith("/admin-dashboard") && !location.pathname.startsWith("/tutor-dashboard") && <Footer />}
    </div>
  );
}

export default App;
