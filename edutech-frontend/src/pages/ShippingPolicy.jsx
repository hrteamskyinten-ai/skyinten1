import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/policies.css";

const ShippingPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-container">
      <div className="policy-header">
        <h1>Shipping Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="policy-content">
        <section>
          <h2>1. Digital Service Delivery</h2>
          <p>
            Skyinten provides digital educational courses and services. There is no physical shipping involved in this transaction. Upon successful payment and course enrollment, you will receive immediate access to your course materials through your user dashboard.
          </p>
        </section>

        <section>
          <h2>2. Account Access</h2>
          <p>
            Your course materials will be accessible immediately after payment confirmation. Access details will be sent to your registered email address within 24 hours. You can log in to your account to access:
          </p>
          <ul>
            <li>Video lectures and course content</li>
            <li>Learning resources and downloadable materials</li>
            <li>Quizzes and assignments</li>
            <li>Progress tracking and certificates</li>
          </ul>
        </section>

        <section>
          <h2>3. Delivery Method</h2>
          <p>
            All course materials are delivered digitally via our online platform. You can access the courses from any device with an internet connection (desktop, laptop, tablet, or smartphone).
          </p>
        </section>

        <section>
          <h2>4. Course Access Duration</h2>
          <p>
            Your access to course materials is provided for the duration specified at the time of purchase. This varies by course and will be clearly stated before checkout. After the access period expires, you will no longer be able to view the course materials.
          </p>
        </section>

        <section>
          <h2>5. Technical Support</h2>
          <p>
            If you experience any issues accessing your courses or downloading materials, please <Link to="/contact">contact our support team</Link>. We will assist you within 24 business hours.
          </p>
        </section>

        <section>
          <h2>6. Internet Connection Required</h2>
          <p>
            An active internet connection is required to access course materials. Skyinten is not responsible for technical issues related to your internet service provider or device.
          </p>
        </section>

        <section>
          <h2>7. Offline Access</h2>
          <p>
            Some courses may offer downloadable materials for offline access. The availability of this feature depends on the specific course and will be clearly indicated in the course description.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            For questions about this Shipping Policy or your course access, please <Link to="/contact">contact us</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
