import bcrypt from "bcrypt";
import prisma from "../utils/db.js";
const wantsHtml = (req) => req.accepts(["html", "json"]) === "html";
export class AuthController {
    async register(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: "Email already registered" });
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    email,
                    passwordHash
                }
            });
            req.session.userId = user.id;
            if (wantsHtml(req)) {
                return res.redirect("/dashboard");
            }
            return res.json({ message: "User registered successfully" });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required" });
            }
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            req.session.userId = user.id;
            if (wantsHtml(req)) {
                return res.redirect("/dashboard");
            }
            return res.json({ message: "User logged in successfully" });
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async logout(req, res) {
        req.session.destroy(() => {
            if (wantsHtml(req)) {
                return res.redirect("/login");
            }
            res.json({ message: "User logged out successfully" });
        });
    }
}
export const authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map