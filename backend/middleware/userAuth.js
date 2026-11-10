import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {

    const { token } = req.cookies;

    if (!token) {
        return (res.json({ success: false, message: "Not Authorized Login Again" }));
    }

    try {

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if (tokenDecode.id) {
            // Set on both req and req.body for compatibility
            req.userId = tokenDecode.id;
            req.userRole = tokenDecode.role || "user";
            req.body = req.body || {};
            req.body.userId = tokenDecode.id;  // For backward compatibility
            req.body.userRole = tokenDecode.role || "user";
        }
        else {
            return (res.json({ success: false, message: "Not Authorized Login Again" }))
        }

        next();

    }
    catch (error) {
        return (res.json({ success: false, message: error.message }));

    }
}

export default userAuth;