import React, { useContext, useState } from "react";
import "../styles/loginSignup.css";
import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";
import ForgetPassword from "./ForgetPassword";
import {useNavigate} from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import axios from 'axios';
import { toast } from "react-toastify";

export default function LoginSignup() {
  const [isActive, setIsActive] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {backendUrl, setIsLoggedin, getUserData} = useContext(AppContext)

  const onSubmitHandlerSignUp = async (e) =>{
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;

      const {data} = await axios.post(backendUrl + "/api/register", {name,email,password})
      if(data.success){
        setIsLoggedin(true)
        getUserData()
        toast.success("Registered Successfully", {autoClose: 1000})
        setIsActive(false)
      }
      else{
        toast.error(data.message);
      }
    } 
    catch (error) {
      toast.error(error);
    }
  }

  const onSubmitHandlerSignIn = async (e) =>{
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;

      const {data} = await axios.post(backendUrl + "/api/login", {email,password})
      if(data.success){
        setIsLoggedin(true)
        getUserData()
        toast.success("Logged In Successfully " + name, {autoClose: 1000})
        navigate('/')
      }
      else{
        toast.error(data.message);
      }
    } 
    catch (error) {
      toast.error(error);
    }
  }


  const navigate = useNavigate();

  return (
    <>
      <div className="auth-wrapper">
        <div className={`container ${isActive ? "active" : ""}`} id="container">

          {/* --- SignUp ---- */}
          <div className="form-container sign-up">
            <form onSubmit={onSubmitHandlerSignUp}>
              <h1>Create Account</h1>

              {/* <div className="social-icons">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                  <FaLinkedin />
                </a>
                <a href="https://github.com">
                  <FaGithub />
                </a>
                <a href="">
                  <FaEnvelope />
                </a>
              </div>

              <span>or use your email for registeration</span> */}

              <input type="text" name="name" onChange={e =>setName(e.target.value)} value={name} placeholder="Name"/>
              <input type="email" name="email" onChange={e => setEmail(e.target.value)} value={email} placeholder="Email" />
              <input type="password" name="password" onChange={e => setPassword(e.target.value)} value={password} placeholder="Password" />

              <button type="submit">Sign Up</button>

              <div
                className="mobile-switch-btn"
                onClick={() => setIsActive(false)}
              >
                Already have an account? <span>Sign In</span>
              </div>
            </form>
          </div>

          {/* --- Sign In ----- */}
          <div className="form-container sign-in">
            <form onSubmit={onSubmitHandlerSignIn}>
              <h1>Sign In</h1>

              {/* <div className="social-icons">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                  <FaLinkedin />
                </a>
                <a href="">
                  <FaEnvelope />
                </a>
                <a href="https://github.com">
                  <FaGithub />
                </a>
              </div>

              <span>or use your email password</span> */}

              <input type="email" name="email" placeholder="Email"  onChange={e =>setEmail(e.target.value)} value={email}/>
              <input type="password" name="password" placeholder="Password" onChange={e =>setPassword(e.target.value)} value={password}/>

              <p className="forgetPassword">Forget Your Password? <a href="/forgetPassword" className="clickHere">Click Here</a></p>

              <button type="submit">Sign In</button>

              <div
                className="mobile-switch-btn"
                onClick={() => setIsActive(true)}
              >
                New user? <span>Create Account</span>
              </div>
            </form>
          </div>

          {/* ---- Toggle Paanel ---- */}
          <div className="toggle-container">
            <div className="toggle">
              <div className="toggle-panel toggle-left">
                <h1>Welcome Back!</h1>
                <p>Enter your personal details to use all of site features</p>
                <button
                  className="hidden"
                  id="login"
                  onClick={() => setIsActive(false)}
                >
                  Sign In
                </button>
              </div>

              <div className="toggle-panel toggle-right">
                <h1>Hello, Friend!</h1>
                <p>
                  Register with your personal details to use all of site
                  features
                </p>

                <button
                  className="hidden"
                  id="register"
                  onClick={() => setIsActive(true)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}