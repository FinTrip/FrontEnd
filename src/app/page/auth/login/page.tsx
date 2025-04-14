// G:\Cap2FinTrip\FrontEnd\src\app\page\auth\login\page.tsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "./login.css";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8081/indentity/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok && data.code === 200) {
        // Lưu token và thông tin user
        const userData = {
          fullName: data.result.user?.fullName || email.split('@')[0],
          email: data.result.user?.email || email,
        };
        
        // Sử dụng hàm login từ useAuth hook
        login(data.result.token, userData);
        
        // Kích hoạt sự kiện authStateChanged để cập nhật UI ngay lập tức
        window.dispatchEvent(new Event('authStateChanged'));
        
        router.push("/homepage");
      } else {
        setError(
          data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <Image
          src="/images/golden-bridge.jpg"
          alt="Golden Bridge"
          fill
          className="background-image"
          priority
        />
        <div className="logo-container">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={70}
            height={70}
            priority
          />
        </div>
      </div>
      <div className="login-right">
        <div className="login-form">
          <h1>Login</h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} suppressHydrationWarning>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <div className="password-input">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <span className="password-icon"></span>
              </div>
            </div>
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Continue"}
            </button>
            <button
              type="button"
              className="google-button"
              disabled={isLoading}
            >
              <Image
                src="/images/google.png"
                alt="Google"
                width={20}
                height={20}
              />
              Continue with Google
            </button>
            <div className="register-link">
              Don&apos;t have an account?{" "}
              <Link href="/page/auth/register">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
