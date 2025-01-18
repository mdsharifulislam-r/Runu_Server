import express from "express"
import { userValidation } from "../validation/user.validation"
import { loginUser, registerUser } from "../controllers/auth.controller"
import { register } from "module"
import { loginValidation } from "../validation/login.validation"
import { changePassword, getSingleUser, logOutUser, updateUser } from "../controllers/user.controller"
import { authToken } from "../middlewares/logger.middleware."

const userRouter = express.Router()

userRouter.route('/register').post(userValidation,registerUser)
userRouter.post("/login",loginValidation,loginUser)
userRouter.get('/user/:id',getSingleUser)
userRouter.put('/update',authToken,updateUser)
userRouter.delete("/logout",logOutUser)
userRouter.put("/change-password",authToken,changePassword)
export default userRouter