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

    const apiSpring = "http://localhost:8081/indentity/api/auth/login"; // API hiện tại (Giả sử là Spring)
    const apiPython = "http://YOUR_PYTHON_API_LOGIN_URL"; // !!! THAY THẾ BẰNG URL API PYTHON CỦA BẠN !!!

    const loginPayload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    };

    try {
      // Gọi cả hai API cùng lúc
      const [responseSpring, responsePython] = await Promise.all([
        fetch(apiSpring, loginPayload),
        fetch(apiPython, loginPayload) // Sử dụng cùng payload
      ]);

      // Parse JSON cho cả hai, xử lý lỗi nếu parse thất bại
      let dataSpring, dataPython;
      try {
        dataSpring = await responseSpring.json();
      } catch (jsonError) {
        console.error("Error parsing Spring JSON:", jsonError);
        dataSpring = { code: -1, message: "Invalid response from Spring API" }; // Gán lỗi giả
      }
      try {
        dataPython = await responsePython.json();
      } catch (jsonError) {
        console.error("Error parsing Python JSON:", jsonError);
        dataPython = { code: -1, message: "Invalid response from Python API" }; // Gán lỗi giả
      }


      console.log("Spring API Response:", dataSpring);
      console.log("Python API Response:", dataPython);

      // *** Logic quan trọng: Bắt buộc cả hai API phải thành công ***
      const isSpringOk = responseSpring.ok && dataSpring.code === 200;
      const isPythonOk = responsePython.ok && dataPython.code === 200;

      if (isSpringOk && isPythonOk) {
        // Cả hai đều thành công
        console.log("Login successful on both Spring and Python APIs.");

        // Quyết định sử dụng token/dữ liệu từ API nào (ví dụ: dùng của Spring)
        const userData = {
          fullName: dataSpring.result.user?.fullName || email.split('@')[0],
          email: dataSpring.result.user?.email || email,
        };

        // Gọi hàm login của useAuth với dữ liệu từ Spring
        login(dataSpring.result.token, userData);
        router.push("/homepage");

      } else {
        // Ít nhất một API thất bại
        let errorMessages = [];
        if (!isSpringOk) {
          errorMessages.push(`Spring Auth Failed: ${dataSpring.message || responseSpring.statusText || 'Unknown Error'}`);
        }
        if (!isPythonOk) {
          errorMessages.push(`Python Auth Failed: ${dataPython.message || responsePython.statusText || 'Unknown Error'}`);
        }
        setError(errorMessages.join(" | "));
        console.error("Login failed:", errorMessages.join(" | "));
      }

    } catch (err) {
      setError("Network error connecting to login servers. Please try again later.");
      console.error("Login fetch/network error:", err);
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
