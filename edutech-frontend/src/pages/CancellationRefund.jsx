import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/policies.css";

const CancellationRefund = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-container">
      <div className="policy-header">
        <h1>Cancellation and Refunds Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="policy-content">
        <section>
          <h2>1. Refund Eligibility</h2>
          <p>
            We offer refunds for course purchases under the following conditions:
          </p>
          <ul>
            <li>You request a refund within 7 days of purchase</li>
            <li>You have not completed more than 25% of the course content</li>
            <li>You provide a valid reason for the refund request</li>
          </ul>
        </section>

        <section>
          <h2>2. Non-Refundable Courses</h2>
          <p>
            Some courses or promotional offers may be explicitly marked as non-refundable at the time of purchase. In such cases, no refund will be issued regardless of the circumstances.
          </p>
        </section>

        <section>
          <h2>3. Refund Process</h2>
          <p>
            To request a refund:
          </p>
          <ol>
            <li>Log in to your Skyinten account</li>
            <li>Navigate to "My Purchases" or "Order History"</li>
            <li>Select the course you wish to refund</li>
            <li>Click "Request Refund" and provide a reason</li>
            <li>Submit your request</li>
          </ol>
          <p>
            Our team will review your request within 5-7 business days. You will receive an email notification of the decision.
          </p>
        </section>

        <section>
          <h2>4. Refund Timeline</h2>
          <p>
            If your refund is approved, the funds will be credited back to your original payment method within 7-14 business days. The exact timeline depends on your bank or payment service provider.
          </p>
        </section>

        <section>
          <h2>5. Partial Refunds</h2>
          <p>
            If you have accessed a significant portion of the course content, Skyinten reserves the right to issue a partial refund or deny the refund request entirely.
          </p>
        </section>

        <section>
          <h2>6. Course Cancellation</h2>
          <p>
            If we discontinue or cancel a course, enrolled students will receive a full refund or free access to a replacement course of equal or greater value.
          </p>
        </section>

        <section>
          <h2>7. Payment Issues</h2>
          <p>
            If you experience a failed payment but were still charged, please <Link to="/contact">contact us immediately</Link>. We will investigate and provide a refund within 48 hours if an error is confirmed.
          </p>
        </section>

        <section>
          <h2>8. Promotional or Discounted Courses</h2>
          <p>
            Courses purchased at a promotional rate or with discount codes are subject to the same refund policy. Refunds will be issued for the amount actually paid, not the original price.
          </p>
        </section>

        <section>
          <h2>9. No Refund for Account Suspension</h2>
          <p>
            If your account is suspended or terminated due to violation of our Terms and Conditions, no refund will be issued for remaining course access.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            For questions about this Cancellation and Refunds Policy or to initiate a refund request, please <Link to="/contact">contact us</Link>.
          </p>
        </section>

        <section className="contact-info">
          <p>
            <strong>Email:</strong> support@skyinten.com<br />
            <strong>Response Time:</strong> Within 24-48 hours
          </p>
        </section>
      </div>
    </div>
  );
};

export default CancellationRefund;
