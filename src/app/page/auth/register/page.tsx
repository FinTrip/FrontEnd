
"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./register.css";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8081/indentity/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok && data.code === 200) {
        // Hiển thị thông báo đăng ký thành công
        alert("Registration successful! Please login with your credentials.");
        // Chuyển hướng đến trang đăng nhập
        router.push("/page/auth/login");
      } else {
        setError(
          data.message || "Registration failed. Please try again."
        );
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
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

      <div className="register-right">
        <div className="register-form">
          <h1>Register</h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your name"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <div className="password-input">
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <span className="password-icon"></span>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password:</label>
              <div className="password-input">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <span className="password-icon"></span>
              </div>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Continue"}
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

            <div className="login-link">
              Already have an account?{" "}
              <Link href="/page/auth/login">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
