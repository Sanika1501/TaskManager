import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authService, getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { token, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && token) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(form.email.trim())) e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setServerError("");
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    try {
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerError(getErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, type, placeholder, autoComplete) => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={errors[name] ? "input-error" : ""}
      />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create account</h1>
        <p className="subtitle">Sign up to start organizing your tasks</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        {field("name", "Name", "text", "Your full name", "name")}
        {field("email", "Email", "email", "you@example.com", "email")}
        {field("password", "Password", "password", "At least 6 characters", "new-password")}
        {field("confirmPassword", "Confirm Password", "password", "Repeat your password", "new-password")}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
