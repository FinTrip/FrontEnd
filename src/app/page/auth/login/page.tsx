
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Gọi API đăng nhập của Java
      const authResponse = await fetch("http://localhost:8081/indentity/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const authData = await authResponse.json();
      console.log("Auth API Response:", authData);

      if (authResponse.ok && authData.code === 200) {
        const userData = {
          id: authData.result.id,
          fullName: authData.result.fullName,
          email: authData.result.email,
        };
        const token = authData.result.token;

        // Sử dụng hàm login từ useAuth hook
        login(token, userData);

        // Gửi token tới API Python để xác thực
        const recommendResponse = await fetch("http://127.0.0.1:8000/recommend/verify-token/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        });

        const recommendData = await recommendResponse.json();
        console.log("Recommend API Response:", recommendData, "Status:", recommendResponse.status);

        if (recommendResponse.ok) {
          // Xác thực thành công, chuyển hướng
          router.push("/homepage");
        } else {
          setError("Xác thực token thất bại với backend Python.");
          console.error("Recommend API Error:", recommendData.error);
        }
      } else {
        setError(authData.message || "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
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
          <div suppressHydrationWarning>
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
            <button type="button" onClick={handleSubmit} className="login-button" disabled={isLoading}>
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
              Don't have an account?{" "}
              <Link href="/page/auth/register">Register</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
