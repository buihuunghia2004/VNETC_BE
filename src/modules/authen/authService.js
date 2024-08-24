import {StatusCodes} from "http-status-codes";

import {env} from "~/config/environment"
import {jwtHelper} from "~/helper/jwtHelper"
import {Account} from "~/models/accountModel"
import ApiErr from "~/utils/ApiError"
import bcrypt from 'bcryptjs'

const jwt = require('jsonwebtoken');

const login = async (email, password) => {
    try {
        const account = await Account.findOne({ email });
        if (!account) {
            throw new ApiErr(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
        }

        const passwordMatch = await bcrypt.compare(password, account.password);
        if (!passwordMatch) {
            throw new ApiErr(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
        }

        // Tạo JWT token
        const token = await jwtHelper.generateToken(account, env.ACCESS_TOKEN_SECRET, env.ACCESS_TOKEN_LIFE);
        const decoded = jwt.decode(token); // Giải mã token để lấy thông tin payload

        return { token: token, decoded: decoded };
    } catch (error) {
        console.error("Login error:", error);
        throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, 'Login failed');
    }
};


const logout = async () => {
    try {
        return "Logout Success"
    } catch (error) {
        throw new ApiErr(StatusCodes.INTERNAL_SERVER_ERROR, 'Logout failed');
    }
};


export const authService = {
    login,
    logout
}