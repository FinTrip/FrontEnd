"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import "./404.css";

export default function Custom404() {
  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-content">
          <h1 className="error-title">404</h1>
          <div className="error-message">
            <h2>Oops! Trang không tồn tại</h2>
            <p>
              Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã bị di
              chuyển.
            </p>
          </div>
          <div className="error-image">
            <Image
              src="/images/404-illustration.png"
              alt="404 Illustration"
              width={400}
              height={300}
              priority
            />
          </div>
          <Link href="/" className="back-home-btn">
            Trở về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
