import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { authService, getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, token, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const justRegistered = location.state?.registered;

  if (!loading && token) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await authService.login({
        email: form.email.trim(),
        password: form.password,
      });
      const jwt = data.token || data.data?.token;
      const user = data.user || data.data?.user || { email: form.email.trim() };
      if (!jwt) throw new Error("No token received from server");
      login(jwt, user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err.response) {
        setError(getErrorMessage(err, "Invalid email or password"));
      } else if (err.message?.startsWith("No token")) {
        setError(err.message);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to manage your tasks</p>

        {justRegistered && (
          <div className="alert alert-success">Registration successful! Please log in.</div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Your password"
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
