import React from "react";
import "../styles/footer.css";
import { Link } from "react-router-dom";
import { FaLinkedin, FaEnvelope, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h2>SkyInten</h2>
          <p>
            Accelerate your tech career with high-quality, hands-on learning
            experiences.
          </p>
          <div className="social-icons">
            <a href="https://www.linkedin.com/company/skyinten-technology/" target="_blank" rel="noreferrer">
              <FaLinkedin />
            </a>
            <a href="mailto:skyinten58@gmail.com">
              <FaEnvelope />
            </a>
            {/* <a href="https://www.instagram.com/skyinten?igsh=cXQ4c3E5aW91dDgx">
              <FaInstagram />
            </a> */}
          </div>
        </div>

        <div className="footer-links">
          <div>
            <h4>About</h4>
            <a href="#">Our Story</a>
            <a href="#">Mentor Program</a>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div>
            <h4>Platform</h4>
            <Link to="/courses">Courses</Link>
            <Link to="/hackathons">Hackathons</Link>
            {/* <Link to="/community">Community</Link> */}
          </div>
          <div>
            <h4>Resources</h4>
            <a href="#">Blog</a>
            <Link to="/FAQs">FAQs</Link>
            {/* <Link to="tutor-dashboard">Support</Link> */}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Skyinten Technologies Pvt. Ltd.</p>
        <div className="policies">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-and-conditions">Terms & Conditions</Link>
          <Link to="/shipping-policy">Shipping Policy</Link>
          <Link to="/cancellation-refund">Cancellation & Refunds</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
