import { body } from "express-validator";

export const loginValidation = [
    body('email').isEmail().withMessage("Email Is Required"),
    //dfd
    body('password').isString().withMessage("Password is Required")
]