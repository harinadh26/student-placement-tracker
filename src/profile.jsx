import { useState } from "react";
import "./profile.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Profile({ user, applications, onBack }) {
  const [showPasswordForm, setShowPasswordForm] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  /* =========================
     PLACEMENT STATS
  ========================= */

  const totalApplications =
    applications.length;

  const interviews = applications.filter(
    (app) => app.status === "Interview"
  ).length;

  const selected = applications.filter(
    (app) => app.status === "Selected"
  ).length;

  const rejected = applications.filter(
    (app) => app.status === "Rejected"
  ).length;

  const assessments = applications.filter(
    (app) =>
      app.status === "Online Assessment"
  ).length;

  const successRate =
    totalApplications > 0
      ? (
          (selected /
            totalApplications) *
          100
        ).toFixed(1)
      : "0.0";

  const interviewRate =
    totalApplications > 0
      ? (
          (interviews /
            totalApplications) *
          100
        ).toFixed(1)
      : "0.0";

  /* =========================
     CHANGE PASSWORD
  ========================= */

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword || !newPassword) {
      setError(
        "Please enter your current and new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirmation password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Your session has expired. Please login again."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch(
        `${API_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not change password."
        );
      }

      setMessage(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowPasswordForm(false);
        setMessage("");
      }, 2000);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Could not change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="profile-page">
      {/* =========================
          HEADER
      ========================= */}

      <div className="profile-top">
        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <h1>My Profile</h1>

        <p>
          Manage your account and view your
          placement activity.
        </p>
      </div>

      {/* =========================
          PROFILE GRID
      ========================= */}

      <div className="profile-grid">
        {/* =========================
            USER CARD
        ========================= */}

        <div className="profile-card user-profile-card">
          <div className="profile-avatar">
            {user.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <h2>{user.name}</h2>

          <p className="profile-email">
            {user.email}
          </p>

          <div className="profile-divider"></div>

          <div className="profile-info">
            <div>
              <span>👤 Name</span>
              <strong>{user.name}</strong>
            </div>

            <div>
              <span>📧 Email</span>
              <strong>{user.email}</strong>
            </div>

            <div>
              <span>🔐 Account</span>
              <strong className="active-account">
                Active
              </strong>
            </div>
          </div>

          {/* CHANGE PASSWORD BUTTON */}

          <button
            className="change-password-btn"
            onClick={() =>
              setShowPasswordForm(
                (value) => !value
              )
            }
          >
            🔑{" "}
            {showPasswordForm
              ? "Close Password Form"
              : "Change Password"}
          </button>
        </div>

        {/* =========================
            PLACEMENT OVERVIEW
        ========================= */}

        <div className="profile-card">
          <div className="profile-card-heading">
            <div>
              <h2>Placement Overview</h2>

              <p>
                Your application activity
                summary.
              </p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-icon">
                📋
              </span>

              <div>
                <strong>
                  {totalApplications}
                </strong>

                <span>
                  Total Applications
                </span>
              </div>
            </div>

            <div className="profile-stat">
              <span className="profile-stat-icon">
                📝
              </span>

              <div>
                <strong>
                  {assessments}
                </strong>

                <span>
                  Assessments
                </span>
              </div>
            </div>

            <div className="profile-stat">
              <span className="profile-stat-icon">
                🎤
              </span>

              <div>
                <strong>
                  {interviews}
                </strong>

                <span>Interviews</span>
              </div>
            </div>

            <div className="profile-stat">
              <span className="profile-stat-icon">
                🎉
              </span>

              <div>
                <strong>
                  {selected}
                </strong>

                <span>Selected</span>
              </div>
            </div>

            <div className="profile-stat">
              <span className="profile-stat-icon">
                ❌
              </span>

              <div>
                <strong>
                  {rejected}
                </strong>

                <span>Rejected</span>
              </div>
            </div>

            <div className="profile-stat">
              <span className="profile-stat-icon">
                📊
              </span>

              <div>
                <strong>
                  {successRate}%
                </strong>

                <span>Success Rate</span>
              </div>
            </div>
          </div>

          {/* =========================
              PROGRESS
          ========================= */}

          <div className="profile-progress-section">
            <div className="progress-heading">
              <span>
                Interview Conversion
              </span>

              <strong>
                {interviewRate}%
              </strong>
            </div>

            <div className="profile-progress">
              <div
                className="profile-progress-fill"
                style={{
                  width: `${Math.min(
                    Number(interviewRate),
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          CHANGE PASSWORD
      ========================= */}

      {showPasswordForm && (
        <div className="profile-card password-card">
          <div className="password-heading">
            <div>
              <h2>🔐 Change Password</h2>

              <p>
                Use a strong password that you
                don't reuse on other websites.
              </p>
            </div>
          </div>

          {message && (
            <div className="profile-message success">
              ✅ {message}
            </div>
          )}

          {error && (
            <div className="profile-message error">
              ⚠️ {error}
            </div>
          )}

          <form
            className="password-form"
            onSubmit={handleChangePassword}
          >
            <div className="password-field">
              <label>
                Current Password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div className="password-field">
              <label>
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
              />
            </div>

            <div className="password-field">
              <label>
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </div>

            <div className="password-actions">
              <button
                type="button"
                className="password-cancel-btn"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError("");
                  setMessage("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="password-save-btn"
                disabled={changingPassword}
              >
                {changingPassword
                  ? "Changing..."
                  : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================
          PLACEMENT TIPS
      ========================= */}

      <div className="profile-card profile-tips">
        <h2>💡 Placement Progress</h2>

        <div className="tips-grid">
          <div>
            <span>📋</span>

            <div>
              <strong>
                Applications
              </strong>

              <p>
                Keep applying consistently
                and track every opportunity.
              </p>
            </div>
          </div>

          <div>
            <span>🎤</span>

            <div>
              <strong>
                Interviews
              </strong>

              <p>
                Prepare technical and HR
                questions before each interview.
              </p>
            </div>
          </div>

          <div>
            <span>🎯</span>

            <div>
              <strong>
                Target
              </strong>

              <p>
                Use your dashboard statistics
                to monitor your progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;