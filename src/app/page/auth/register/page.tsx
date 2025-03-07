"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import "./register.css";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

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

          <form>
            <div className="form-group">
              <label>Nombre:*</label>
              <input type="text" placeholder="Enter your name" required />
            </div>

            <div className="form-group">
              <label>Email:*</label>
              <input type="email" placeholder="Enter your email" required />
            </div>

            <div className="form-group">
              <label>Contraseña:*</label>
              <div className="password-input">
                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                />
                <span className="password-icon">@</span>
              </div>
            </div>

            <div className="form-group">
              <label>Confirmar Contraseña:*</label>
              <div className="password-input">
                <input
                  type="password"
                  placeholder="Confirm your password"
                  required
                />
                <span className="password-icon">@</span>
              </div>
            </div>

            <button type="submit" className="register-button">
              Continúa
            </button>

            <button type="button" className="google-button">
              <Image
                src="/images/google.png"
                alt="Google"
                width={20}
                height={20}
              />
              Continúa con Google
            </button>

            <div className="login-link">
              ¿Ya tienes una cuenta? <Link href="/page/auth/login">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
