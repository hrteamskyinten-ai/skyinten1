import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/policies.css";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-container">
      <div className="policy-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="policy-content">
        <section>
          <h2>1. Introduction</h2>
          <p>
            Skyinten ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways:</p>
          <ul>
            <li><strong>Personal Data:</strong> Name, email address, phone number, address, payment information when you register or make purchases</li>
            <li><strong>Educational Data:</strong> Course enrollment history, quiz scores, assignment submissions, and learning progress</li>
            <li><strong>Technical Data:</strong> IP address, browser type, pages visited, time spent on pages, and referral sources</li>
            <li><strong>Cookies:</strong> We use cookies to enhance your browsing experience</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect for:</p>
          <ul>
            <li>Processing course enrollments and payments</li>
            <li>Providing and improving our educational services</li>
            <li>Sending course updates, announcements, and educational content</li>
            <li>Responding to your inquiries and providing customer support</li>
            <li>Personalizing your learning experience</li>
            <li>Complying with legal obligations</li>
            <li>Analyzing usage patterns to improve our platform</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2>5. Third-Party Services</h2>
          <p>
            We may share your information with third-party service providers including payment processors (Razorpay), email service providers, and analytics services. These parties are contractually obligated to use your data only as necessary to provide services to us.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p>
            Email: privacy@skyinten.com<br />
            <Link to="/contact">Contact Us Page</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
