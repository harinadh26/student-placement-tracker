import { useState } from "react";
import "./Auth.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const endpoint = isLogin
  ? `${API_URL}/api/auth/login`
  : `${API_URL}/api/auth/register`;
      const body = isLogin
        ? {
            email: form.email,
            password: form.password,
          }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong"
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      onLogin(data.user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-header">

          <div className="auth-logo">
            🎓
          </div>

          <h1>
            Student Placement Tracker
          </h1>

          <p>
            {isLogin
              ? "Welcome back! Login to continue."
              : "Create your account to start tracking."}
          </p>

        </div>

        <div className="auth-tabs">

          <button
            className={isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(true);
              setMessage("");
            }}
          >
            Login
          </button>

          <button
            className={!isLogin ? "active" : ""}
            onClick={() => {
              setIsLogin(false);
              setMessage("");
            }}
          >
            Register
          </button>

        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {!isLogin && (
            <>
              <label>Full Name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </>
          )}

          <label>Email</label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            minLength="6"
            required
          />

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>

        </form>

        <div className="auth-switch">

          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
          >
            {isLogin
              ? "Create one"
              : "Login"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default Auth;