import React, { useContext, useState } from "react";
import { AppContext } from "../context/Appcontext";
import { Link } from "react-router-dom";
import "../styles/navbar.css";
import logoImg from "../assets/Logo.webp";
import { FiMenu, FiX } from "react-icons/fi";

function Navbar() {
  const { userData } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" onClick={() => window.scrollTo(0, 0)}>
            <img src={logoImg} alt="Our Logo" />
            <span className="logo-text">Skyinten</span>
          </Link>
        </div>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/about">About</a>
          </li>
          <li>
            <a href="/courses">Courses</a>
          </li>
          <li>
            <a href="/hackathons">Hackathons</a>
          </li>
          <li>
            <a href="/contact">Contact</a>
          </li>
        </ul>

        {userData ?
          (userData.role === "admin" ?


            <div className="nav-actions">
              {userData && (
                <div className="user_profile">
                  <Link to="/admin-dashboard" className="user_profile_btn">
                    <b>{userData.name[0].toUpperCase()}</b>
                  </Link>
                </div>

              )}

              <div className="menu-icon" onClick={toggleMenu}>
                {menuOpen ? <FiX /> : <FiMenu />}
              </div>
            </div>

            :


            <div className="nav-actions">
              {userData && (
                <div className="user_profile">
                  <Link to="/dashboard" className="user_profile_btn">
                    <b>{userData.name[0].toUpperCase()}</b>
                  </Link>
                </div>
              )}

              <div className="menu-icon" onClick={toggleMenu}>
                {menuOpen ? <FiX /> : <FiMenu />}
              </div>
            </div>



          )
          :

          (
            <div className="nav-right">
              {!userData && (
                <Link to="/login" className="login-btn">
                  Login/Signup
                </Link>
              )}

              <div className="nav-actions">
                {userData && (
                  <div className="user_profile">
                    <Link to="/dashboard" className="user_profile_btn">
                      <b>{userData.name[0].toUpperCase()}</b>
                    </Link>
                  </div>
                )}

                <div className="menu-icon" onClick={toggleMenu}>
                  {menuOpen ? <FiX /> : <FiMenu />}
                </div>
              </div>
            </div>
          )
        }

      </div>
    </nav>
  );
}

export default Navbar;
