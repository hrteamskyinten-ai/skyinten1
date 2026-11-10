import React, { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/verifyMail.css"
import { AppContext } from "../context/Appcontext";

function VerifyMail() {

    axios.defaults.withCredentials = true;
    const navigate = useNavigate(); 
    const inputRefs = React.useRef([]);

    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    }

    const handelKeyDown = (e, index) =>{
        if(e.key === "Backspace" && e.target.value === "" && index > 0){
            inputRefs.current[index - 1].focus();
        }
    }

    const handlePaste = (e) =>{
        const paste = e.clipboardData.getData("text")
        const pasteArray = paste.split("");
        pasteArray.forEach((char, index)=>{
            if(inputRefs.current[index]){
                inputRefs.current[index].value = char;
            }
        })
    }

    const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContext);

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            const otpArray = inputRefs.current.map(e => e.value)
            const otp = otpArray.join("")
            const { data } = await axios.post(backendUrl + "/api/verifyMail", {otp});
            if (data.success) {
                toast.success(data.message);
                getUserData();
                navigate("/dashboard");
            }
            else {
                toast.error(data.message);
            }

        }
        catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(()=>{
        isLoggedin && userData && userData.isAccountVerified && navigate("/dashboard")
        console.log(isLoggedin)
    },[isLoggedin, userData])

    return (
        <div>
            <div className="verifyMailContainer"> 
                <form onSubmit={onSubmitHandler}>
                    <h1>Enter the 6 digit otp</h1>
                    <div onPaste={handlePaste} className="otpsubmit">
                        {Array(6).fill(0).map((_, index) => (
                            <input type="text" maxLength="1" key={index} required
                                ref={e => inputRefs.current[index] = e}
                                onInput={(e) => handleInput(e, index)}
                                onKeyDown={(e) => handelKeyDown(e, index)}
                                className="inputs"
                            />
                        ))}
                    </div>
                    <button className="submitBtn" type="submit">Verify email</button>
                </form>
            </div>
        </div>
    )
}

export default VerifyMail;