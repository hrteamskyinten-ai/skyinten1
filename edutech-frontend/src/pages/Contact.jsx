import React, { useEffect, useContext, useState } from "react";
import "../styles/contact.css";
import { Link } from "react-router-dom";
import contactBannerImg from "../assets/contactBanner.webp";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";
import axios from "axios";

const Contact = () => {
  const { backendUrl } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToInfo = () => {
    const contactSection = document.querySelector(".contact-section");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast.error("All fields are required");
      return;
    }

    // Validate phone - must be at least 10 digits
    const phoneDigitsOnly = formData.phone.replace(/\D/g, '');
    if (phoneDigitsOnly.length < 10) {
      toast.error("Phone number must have at least 10 digits");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.message.length < 10) {
      toast.error("Message must be at least 10 characters long");
      return;
    }

    setLoading(true);
    try {
      // Send clean phone number (digits only) to backend
      const cleanedData = {
        ...formData,
        phone: phoneDigitsOnly
      };
      console.log("Submitting contact form:", cleanedData);
      const { data } = await axios.post(`${backendUrl}/api/contact/submit`, cleanedData);
      
      if (data.success) {
        toast.success(data.message);
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: ""
        });
      } else {
        toast.error(data.message || "Failed to submit form");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      console.log("Error response:", error.response?.data);
      
      let errorMsg = "Failed to submit form. Please try again.";
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMsg = error.response.data.errors.join(", ");
      } else if (error.response?.status === 400) {
        errorMsg = "Please check all fields: Name (2-50 chars), valid email, phone (10+ digits), message (10-5000 chars)";
      }
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="contact-banner">
        <img
          src={contactBannerImg}
          alt="Contact Banner"
          className="contact-banner-img"
        />
        <div className="contact-banner-overlay">
          <h4>Skyinten.</h4>
          <button className="scroll-down-btn" onClick={scrollToInfo}>
            ↓ Scroll Down
          </button>
        </div>
      </section>

      {/* --- ContactForm Section --- */}
      <section className="contact-section">
        <div className="contact-container">
          <h2>Get in Touch</h2>
          <p>Need assistance? Our team is just a message away.</p>

          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="What do you have in mind?"
              rows="3"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Contact;
