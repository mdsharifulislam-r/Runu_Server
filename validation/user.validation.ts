import { body } from "express-validator";

export const userValidation = [
    body('name').isString().withMessage("Name is Required"),
    body("email").isEmail().withMessage("Email is Required"),
    body("password").isString().withMessage("Password is required")
]