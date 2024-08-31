import {env} from "~/config/environment"
import {jwtHelper} from "~/helper/jwtHelper"

const isAuth = async (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({message: "No token provided."});
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({message: "Invalid token format."});
    }

    try {
        const decodedToken = await jwtHelper.verifyToken(token, env.ACCESS_TOKEN_SECRET);
        req.account = decodedToken.data;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({message: "Token expired."});
        }
        return res.status(401).json({message: "Invalid token."});
    }
};

export default isAuth
