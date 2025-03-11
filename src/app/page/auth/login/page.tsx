"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import "./login.css";

export default function LoginPage() {
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

          {/* suppressHydrationWarning is used to prevent hydration errors */}
          <form suppressHydrationWarning>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" placeholder="Enter your email" required />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <div className="password-input">
                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                />
                <span className="password-icon"></span>
              </div>
            </div>

            <button type="submit" className="login-button">
              Continue
            </button>

            <button type="button" className="google-button">
              <Image
                src="/images/google.png"
                alt="Google"
                width={20}
                height={20}
              />
              Continue with Google
            </button>

            <div className="register-link">
              Dont have an account?{" "}
              <Link href="/page/auth/register">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
