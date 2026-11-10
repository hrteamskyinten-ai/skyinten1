
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "./Appcontext.jsx";

export const AppContextProvider = (props) =>{

    useEffect(() => {
        axios.defaults.withCredentials = true;
    }, []);

    const rawBackendUrl  = import.meta.env.VITE_BACKEND_URL
    const backendUrl = (rawBackendUrl || '').replace(/\/$/, '')
    const [isLoggedin, setIsLoggedin] =  useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userData, setUserData] = useState(false);
    const [adminData, setAdminData] = useState(false);
    const [activeCourses, setActiveCourses] = useState(false);


    const getUserData = useCallback(async () =>{
        try {
            const {data} = await axios.get(backendUrl + "/api/data")
            data.success ? setUserData(data.userData) : toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    },[backendUrl])


    const getAuthState = useCallback(async () =>{
        try {
            const {data} = await axios.get(backendUrl + "/api/is/auth")
            if(data.success){
                setIsLoggedin(true);
                getUserData();
            }
        } catch (error) {
            toast.error(error.message)
        }
    },[backendUrl, getUserData])

    const getAdminData = useCallback(async () =>{
        try {
            const {data} = await axios.get(backendUrl + "/api/admin/allDetails")
            data.success ? setAdminData(data.adminData) : toast.error(data.message);
        } 
        catch (error) {
            toast.error(error.message);
        }
    },[backendUrl])

    const getAdminAuthState = useCallback(async () =>{
        try {
            const {data} = await axios.get(backendUrl + "/api/is/admin")
            if(data.success){
                setIsAdmin(true);
                getAdminData();
            }
        } 
        catch (error) {
            toast.error(error.message)
        }
    },[backendUrl, getAdminData])

    

    const getActiveCourses =useCallback(async () =>{
        try{
            const {data} = await axios.get(backendUrl + "/api/courses/all/active")
            data.success ? setActiveCourses(data.activeCourses) : toast.error(data.message);
        }
        catch (error){
            toast.error(error.message);
        }
    },[backendUrl])

    useEffect(()=>{
        getAuthState();
        getAdminAuthState();
        getActiveCourses();
    },[getAuthState, getAdminAuthState, getActiveCourses])

     const value = useMemo( () =>({
        backendUrl,
        isLoggedin, setIsLoggedin,
        userData, setUserData,
        getUserData,
        isAdmin, setIsAdmin,
        getAdminAuthState,
        adminData, setAdminData,
        getAdminData,
        activeCourses, setActiveCourses,
        getActiveCourses
    }),[
        backendUrl, isLoggedin, userData, isAdmin, adminData, activeCourses,
        getUserData, getAdminAuthState, getAdminData, getActiveCourses,
        setIsLoggedin, setUserData, setIsAdmin, setAdminData, setActiveCourses
    ])

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}