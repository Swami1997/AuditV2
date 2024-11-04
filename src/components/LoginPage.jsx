import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { ChecklistTable } from "../../config.js";
import styles from "./LoginPage.module.css";
import { gsap } from "gsap";

const supabase = createClient(
  ChecklistTable.SUPABASE_URL,
  ChecklistTable.SUPERBASE_CHECKLIST
);

const LoginPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const containerRef = useRef(null);
  const messageRef = useRef(null);
  const backgroundShapesRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const tl = gsap.timeline();

    // Initial animations
    tl.from(containerRef.current, {
      duration: 1,
      scale: 0.8,
      opacity: 0,
      rotationX: isMobile ? 0 : 15,
      rotationY: isMobile ? 0 : -15,
      ease: "power3.out",
    })
      .from(
        `.${styles.inputGroup}`,
        {
          duration: 0.6,
          opacity: 0,
          y: 20,
          stagger: 0.2,
          ease: "power2.out",
        },
        "-=0.3"
      )
      .from(
        backgroundShapesRef.current.children,
        {
          duration: 1,
          opacity: 0,
          scale: 0,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      );

    // Mouse move effect only for desktop
    if (!isMobile) {
      const handleMouseMove = e => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 20;
        const yPos = (clientY / window.innerHeight - 0.5) * 20;

        gsap.to(containerRef.current, {
          duration: 0.8,
          rotationY: xPos,
          rotationX: -yPos,
          ease: "power2.out",
        });
      };

      document.addEventListener("mousemove", handleMouseMove);
      return () => document.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isMobile]);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("users_details")
        .select("mail_Id, password");

      if (error) throw error;

      const isValidUser = data.some(
        user =>
          user.mail_Id.toLowerCase() === email.toLowerCase() &&
          user.password === password
      );

      if (isValidUser) {
        setIsSuccess(true);
        setUser(email);
        setMessage("Login successful!");
        navigate("/checklist");
      } else {
        setIsSuccess(false);
        setMessage("Invalid email or password.");
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage("An error occurred. Please try again.");
      console.error("Error fetching documents: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.backgroundShapes} ref={backgroundShapesRef}>
        <div className={`${styles.backgroundShape}`}></div>
        <div className={`${styles.backgroundShape}`}></div>
        <div className={`${styles.backgroundShape}`}></div>
      </div>

      <div className={styles.container} ref={containerRef}>
        <header className={styles.loginHeader}>
          <h2>SmartReports</h2>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={`${styles.inputGroup}`}>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input}
              placeholder=" "
              required
            />
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
          </div>

          <div className={`${styles.inputGroup}`}>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              placeholder=" "
              required
            />
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            Login
          </button>
        </form>

        <div
          ref={messageRef}
          className={`${styles.message} ${
            isSuccess ? styles.success : styles.error
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
