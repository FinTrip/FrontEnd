"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import "./register.css";
export default function RegisterPage() {
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
{/* suppressHydrationWarning is used to prevent hydration errors */}
<form suppressHydrationWarning>
<div className="form-group">
<label>Name:</label>
<input type="text" placeholder="Enter your name" required />
</div>
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
<div className="form-group">
<label>Confirm Password:</label>
<div className="password-input">
<input
type="password"
placeholder="Confirm your password"
required
/>
<span className="password-icon"></span>
</div>
</div>
<button type="submit" className="register-button">
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