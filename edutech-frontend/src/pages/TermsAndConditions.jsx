import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/policies.css";

const TermsAndConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-container">
      <div className="policy-header">
        <h1>Terms and Conditions</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="policy-content">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Skyinten, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Skyinten for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on Skyinten</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          </ul>
        </section>

        <section>
          <h2>3. Course Enrollment and Access</h2>
          <p>
            Upon successful payment, you will receive access to the course materials for the duration specified. Your course access is personal and non-transferable. You may not share your login credentials with others.
          </p>
        </section>

        <section>
          <h2>4. Payment Terms</h2>
          <p>
            All payments are processed securely through Razorpay. By making a purchase, you authorize us to charge your payment method. Prices are subject to change without notice.
          </p>
        </section>

        <section>
          <h2>5. Intellectual Property Rights</h2>
          <p>
            All course content, materials, and resources provided on Skyinten are the intellectual property of Skyinten or its content providers. Reproduction or redistribution of this content without permission is prohibited.
          </p>
        </section>

        <section>
          <h2>6. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate and complete information during registration</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Not engage in any unlawful or prohibited activity</li>
            <li>Not upload malware, viruses, or harmful code</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall Skyinten or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Skyinten.
          </p>
        </section>

        <section>
          <h2>8. Termination</h2>
          <p>
            Skyinten may terminate your account and access to its services if you violate these terms or engage in unlawful conduct. Upon termination, your right to use the services will immediately cease.
          </p>
        </section>

        <section>
          <h2>9. Changes to Terms</h2>
          <p>
            Skyinten reserves the right to modify these terms at any time. Continued use of the platform following the posting of revised terms means that you accept and agree to the changes.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            For any questions about these Terms and Conditions, please <Link to="/contact">contact us</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
