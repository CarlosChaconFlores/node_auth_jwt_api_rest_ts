import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../services/password.service";
import prisma from "../models/user";
import { generateToken } from "../services/auth.service";

export const register = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        if (!email) {
            res.status(400).json({ message: "Email is required" });
        return;
        };
        if (!password) {
            res.status(400).json({ message: "Password is required" })
        return;
        };

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });

        const token = generateToken(user);
        res.status(201).json({
            token
        });

    } catch (error: any) {

        if (error.code === "P2002" && error?.meta?.target?.includes('email')) res.status(400).json({
            message: "Email is already in use"
        });

        console.log(error);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {

        if (!email) {
            res.status(400).json({ message: "Email is required" });
        return;
        };
        if (!password) {
            res.status(400).json({ message: "Password is required" })
        return;
        };

        const user = await prisma.user.findUnique({ where: { email }})
        if (!user) {
            res.status(404).json({
                message: "Invalid credentials"
            })
            return;
            }

            const passwordMatch = await comparePassword(password, user.password);

            if (!passwordMatch) {
                res.status(401).json({
                    message: "Invalid credentials"
                })
                return;
            }

            const token = generateToken(user);
            res.status(200).json({ token });

        } catch (error: any) {
            console.log(error);
            res.status(400).json({
                message: "Invalid credentials"
            })
        }
}