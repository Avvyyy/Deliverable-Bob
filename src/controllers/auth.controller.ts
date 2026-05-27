import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "@/utils/db";

const wantsHtml = (req: Request) => req.accepts(["html", "json"]) === "html";
const toAuthErrorParam = (message: string) => encodeURIComponent(message);

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        if (wantsHtml(req)) {
          return res.redirect(`/register?error=${toAuthErrorParam("Email and password are required")}`);
        }
        return res.status(400).json({ error: "Email and password are required" });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        if (wantsHtml(req)) {
          return res.redirect(`/register?error=${toAuthErrorParam("Email already registered")}`);
        }
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
    } catch (error: any) {
      if (wantsHtml(req)) {
        return res.redirect(`/register?error=${toAuthErrorParam("Unable to register right now. Please try again.")}`);
      }
      return res.status(500).json({ error: "Unable to register right now. Please try again." });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        if (wantsHtml(req)) {
          return res.redirect(`/login?error=${toAuthErrorParam("Email and password are required")}`);
        }
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        if (wantsHtml(req)) {
          return res.redirect(`/login?error=${toAuthErrorParam("Invalid credentials")}`);
        }
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        if (wantsHtml(req)) {
          return res.redirect(`/login?error=${toAuthErrorParam("Invalid credentials")}`);
        }
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      if (wantsHtml(req)) {
        return res.redirect("/dashboard");
      }
      return res.json({ message: "User logged in successfully" });
    } catch (error: any) {
      if (wantsHtml(req)) {
        return res.redirect(`/login?error=${toAuthErrorParam("Unable to sign in right now. Please try again.")}`);
      }
      return res.status(500).json({ error: "Unable to sign in right now. Please try again." });
    }
  }

  async logout(req: Request, res: Response) {
    req.session.destroy(() => {
      if (wantsHtml(req)) {
        return res.redirect("/login");
      }
      res.json({ message: "User logged out successfully" });
    });
  }
}

export const authController = new AuthController();
