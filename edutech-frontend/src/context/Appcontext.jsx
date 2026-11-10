import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";


export const AppContext = createContext();

export const AppContextProvider = (props) =>{

    useEffect(() => {
        // This runs only once when the component mounts.
        axios.defaults.withCredentials = true;
    }, []);

    const rawBackendUrl  = import.meta.env.VITE_BACKEND_URL
    const backendUrl = (rawBackendUrl || '').replace(/\/$/, '')
    const [isLoggedin, setIsLoggedin] =  useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userData, setUserData] = useState(false);
    const [adminData, setAdminData] = useState(false);
    const [activeCourses, setActiveCourses] = useState(false);
    const [activeHackathons, setActiveHackathons] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);


    const getUserData = async () =>{
        try {
            const {data} = await axios.get(backendUrl + "/api/data")
            if(data.success) {
                setUserData(data.userData);
                // Clear exam-related localStorage on login to prevent cross-user contamination
                localStorage.removeItem('hackathonId');
                localStorage.removeItem('currentHackathon');
                localStorage.removeItem('hackathon_section');
                localStorage.removeItem('hackathon_mcq_answers');
                localStorage.removeItem('hackathon_correct_answers');
                localStorage.removeItem('hackathon_mcq_timeLeft');
                localStorage.removeItem('hackathon_coding_timeLeft');
                localStorage.removeItem('hackathon_all_test_results');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }


    const getAuthState = async () =>{
        try {
            const {data} = await axios.get(backendUrl + "/api/is/auth")
            if(data.success){
                setIsLoggedin(true);
                await getUserData();
            }
        } catch (error) {
            console.error('Auth check failed:', error.message);
        } finally {
            setIsAuthLoading(false);
        }
    }

    const getAdminData = async () =>{
        try {
            const {data} = await axios.get(backendUrl + "/api/admin/allDetails")
            data.success ? setAdminData(data.adminData) : toast.error(data.message);
        } 
        catch (error) {
            toast.error(error.message);
        }
    }

    const getAdminAuthState = async () =>{
        try {
            const {data} = await axios.get(backendUrl + "/api/is/admin")
            if(data.success){
                setIsAdmin(true);
                await getAdminData();
            }
        } 
        catch (error) {
            console.error('Admin auth check failed:', error.message);
        }
    }

    

    const getActiveCourses = async () =>{
        try{
            const {data} = await axios.get(backendUrl + "/api/courses/all/active")
            if(data.success) {
                setActiveCourses(data.activeCourses);
            } else {
                toast.error(data.message);
            }
        }
        catch (error){
            toast.error(error.message);
        }
    }

    const getActiveHackathons = async () =>{
        try{
            const { data } = await axios.get(backendUrl + "/api/hackathon/all/active");
            if(data.success && data.hackathons) {
                setActiveHackathons({ hackathons: data.hackathons });
            } else {
                toast.error(data.message || 'Failed to fetch hackathons');
            }
        }
        catch (error){
            toast.error(error.message);
        }
    }

    useEffect(()=>{
        const initializeAuth = async () => {
            try {
                await Promise.all([getAuthState(), getAdminAuthState()]);
                getActiveCourses();
                getActiveHackathons();
            } catch (error) {
                console.error('Error initializing auth:', error);
            }
        };
        initializeAuth();
    },[])

     const value ={
        backendUrl,
        isLoggedin, setIsLoggedin,
        userData, setUserData,
        getUserData,
        isAdmin, setIsAdmin,
        getAdminAuthState,
        adminData, setAdminData,
        getAdminData,
        activeCourses, setActiveCourses,
        activeHackathons, setActiveHackathons,
        getActiveCourses,
        getActiveHackathons,
        isAuthLoading, setIsAuthLoading
    }

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContext;

// /src/context/AppContextObject.jsx

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// import { createContext } from 'react';

// // Define the initial shape for better type-checking/intellisense
// const initialContextValue = {
//     backendUrl: '',
//     isLoggedin: false,
//     setIsLoggedin: () => {},
//     isAdmin: '',
//     setIsAdmin: () => {},
//     userData: '', 
//     setUserData: () => {},
//     adminData: "",
//     setAdminData: () => {},
//     activeCourses:"", 
//     setActiveCourses: () => {},

//     // ... define all other values/functions here
// };

// export const AppContext = createContext(initialContextValue);