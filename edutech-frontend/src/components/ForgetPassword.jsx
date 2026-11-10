import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/forgetPassword.css";
import { AppContext } from "../context/Appcontext";

function ForgetPassword() {

    const {backendUrl} = useContext(AppContext) 
    axios.defaults.withCredentials = true;

    const navigate = useNavigate();

    const [email, setEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [isEmailSent, setIsEmailSent] = useState("")
    const [otp, setOtp] = useState(0)
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false)

    // const onSubmitHandler

    const inputRefs = React.useRef([]);

    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    }

    const handelKeyDown = (e, index) => {
        if (e.key === "Backspace" && e.target.value === "" && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    }

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData("text")
        const pasteArray = paste.split("");
        pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
            }
        })
    }

    const onSubmitEmail = async (e) =>{
        e.preventDefault();
        try {
            const {data} = await axios.post(backendUrl + "/api/passResetOtp", {email})
            data.success ? toast.success(data.message) : toast.error(data.message)
            data.success && setIsEmailSent(true)
        } 
        catch (error) {
            toast.error(error.message);
        }

    }

    const onSubmitOtp = async (e) => {
        e.preventDefault();
        const otpArray = inputRefs.current.map(e => e.value)
        setOtp(otpArray.join(""))
        setIsOtpSubmitted(true)
    }

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        try {
            const {data} = await axios.post(backendUrl + "/api/passwordReset", {email,otp,newPassword})
            data.success ? toast.success(data.message) : toast.error(data.message) 
            data.success && navigate("/login")
        } 
        catch (error) {
            toast.error(error.message);
        }
    }

    return (

        <div className="resetPasswordContainer">
            {!isEmailSent &&
                <form onSubmit={onSubmitEmail}>
                    <h1>Reset Password</h1>
                    <p>Enter Your Registered Email Address</p>
                    <div>
                        <input className="inputBox" type="email" placeholder="Email id" value={email} name="email" onChange={e => setEmail(e.target.value)} />
                    </div>
                    <button className="submitBtn" type="submit">Submit</button>
                </form>
            }

            {!isOtpSubmitted && isEmailSent &&

                <form onSubmit={onSubmitOtp}>
                    <h1>Enter the 6 digit otp</h1>
                    <div onPaste={handlePaste} className="otpSubmit">
                        {Array(6).fill(0).map((_, index) => (
                            <input type="text" maxLength="1" key={index} required
                                ref={e => inputRefs.current[index] = e}
                                onInput={(e) => handleInput(e, index)}
                                onKeyDown={(e) => handelKeyDown(e, index)}
                                className="inputs"
                            />
                        ))}
                    </div>
                    <button className="submitBtn" type="submit">Submit Otp</button>
                </form>
            }

            {isOtpSubmitted && isEmailSent &&
                <form onSubmit={onSubmitNewPassword}>
                    <h1>New Password</h1>
                    <p>Enter the new password below</p>
                    <div>
                        <input className="inputBox" type="password" placeholder="Password" value={newPassword} name="email" onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <button className="submitBtn" type="submit">Submit</button>
                </form>
            }
        </div>
    )
}

export default ForgetPassword;