import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import collegeLogo from "../assets/logo.svg"; // Import the local logo

const Login = () => {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (handleSubmit logic remains exactly the same, no changes needed here but tool requires context)
    setMessage("");
    setIsSuccess(false);

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ admissionNumber }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem("admissionNumber", admissionNumber);
        sessionStorage.setItem("studentName", data.studentName || "Student Profile");

        setIsSuccess(true);
        setMessage("Login Successful!");
        setTimeout(() => {
          navigate("/dashboard", { state: { admissionNumber, studentName: data.studentName } });
        }, 1000);
      } else {
        setIsSuccess(false);
        setMessage(data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsSuccess(false);
      setMessage("Error connecting to server");
    }
  };

  return (
    <>
      <section className="login-page-wrapper">
        <div
          className="login-logo"
          style={{
            position: 'absolute',
            top: '2%',
            left: '2%', // Positioned at top left
            width: '200px', // Smaller width for corner logo
            zIndex: 10,
            textAlign: 'left'
          }}>
          <img
            src={collegeLogo}
            alt="College Logo"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              mixBlendMode: 'screen' // Black background becomes transparent
            }}
          />
        </div>

        <h1
          className="login-title"
          style={{
            position: 'absolute',
            top: '15%', // Original position, logo is now in corner so no conflict
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: "'Righteous', cursive",
            fontSize: '3.5rem',
            color: 'white',
            textShadow: '0px 2px 4px rgba(0,0,0,0.2)',
            textAlign: 'center',
            width: '100%',
            zIndex: 10,
            margin: 0,
            letterSpacing: '2px'
          }}>
          MCEM Arts Fest 2026
        </h1>
        <div className="auth">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              name="admissionNumber"
              id="admissionNumber"
              placeholder="Admission Number"
              maxLength="4"
              pattern="[0-9]{4}"
              required={true}
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
          {message && (
            <p style={{
              marginTop: "1rem",
              color: isSuccess ? "green" : "red",
              fontWeight: "bold"
            }}>
              {message}
            </p>
          )}

        </div>
      </section>
    </>
  );
};

export default Login;
