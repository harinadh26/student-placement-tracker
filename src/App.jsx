import { useEffect, useMemo, useState } from "react";
import Auth from "./AuthPage";
import Profile from "./profile";
import "./App.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
 
const [isSaving, setIsSaving] = useState(false);

const STATUS_OPTIONS = [
  "Applied",
  "Online Assessment",
  "Interview",
  "Selected",
  "Rejected",
];

const JOB_TYPE_OPTIONS = [
  "Full Time",
  "Internship",
  "Contract",
];

const CHART_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#8b5cf6",
];

const EMPTY_APPLICATION = {
  company: "",
  role: "",
  date: "",
  interviewDate: "",
  status: "Applied",
  jobType: "Full Time",
  location: "",
  notes: "",
};

function App() {
  /* =========================
     USER / AUTH
  ========================= */

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [showProfile, setShowProfile] = useState(false);

  const token = localStorage.getItem("token");

  /* =========================
     THEME
  ========================= */

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  /* =========================
     APPLICATION STATE
  ========================= */

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] =
    useState(EMPTY_APPLICATION);

  /* =========================
     FILTER STATE
  ========================= */

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [jobTypeFilter, setJobTypeFilter] =
    useState("All");

  const [interviewFilter, setInterviewFilter] =
    useState("All");

  const [dateFrom, setDateFrom] = useState("");

  const [dateTo, setDateTo] = useState("");

  const [sortBy, setSortBy] =
    useState("newest");

  /* =========================
     CALENDAR
  ========================= */

  const [calendarDate, setCalendarDate] =
    useState(new Date());

  const [selectedCalendarDate, setSelectedCalendarDate] =
    useState(null);

  /* =========================
     FETCH APPLICATIONS
  ========================= */

  const fetchApplications = async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_URL}/api/applications`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not load applications"
        );
      }

      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error.message ||
          "Unable to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  /* =========================
     MESSAGE AUTO CLEAR
  ========================= */

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) return;

    const timer = setTimeout(() => {
      setErrorMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [errorMessage]);

  /* =========================
     DATE HELPERS
  ========================= */

  const parseLocalDate = (dateString) => {
    if (!dateString) return null;

    const [year, month, day] =
      dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    const date = parseLocalDate(dateString);

    if (!date || Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getTodayKey = () => {
    return getDateKey(new Date());
  };

  const getDaysDifference = (dateString) => {
    const target = parseLocalDate(dateString);

    if (!target) return null;

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    return Math.round(
      (target - today) /
        (1000 * 60 * 60 * 24)
    );
  };

  /* =========================
     INTERVIEW COUNTDOWN
  ========================= */

  const getInterviewMessage = (dateString) => {
    const difference =
      getDaysDifference(dateString);

    if (difference === null) {
      return "";
    }

    if (difference < 0) {
      return "Completed";
    }

    if (difference === 0) {
      return "Today";
    }

    if (difference === 1) {
      return "Tomorrow";
    }

    return `In ${difference} days`;
  };

  /* =========================
     APPLICATION STATS
  ========================= */

  const totalApplications =
    applications.length;

  const appliedCount = applications.filter(
    (app) => app.status === "Applied"
  ).length;

  const assessmentCount =
    applications.filter(
      (app) =>
        app.status === "Online Assessment"
    ).length;

  const interviewCount =
    applications.filter(
      (app) => app.status === "Interview"
    ).length;

  const selectedCount =
    applications.filter(
      (app) => app.status === "Selected"
    ).length;

  const rejectedCount =
    applications.filter(
      (app) => app.status === "Rejected"
    ).length;

  const successRate =
    totalApplications > 0
      ? (
          (selectedCount /
            totalApplications) *
          100
        ).toFixed(1)
      : "0.0";

  /* =========================
     UPCOMING INTERVIEWS
  ========================= */

  const upcomingInterviews = useMemo(() => {
    const today = getTodayKey();

    return applications
      .filter(
        (app) =>
          app.interviewDate &&
          app.interviewDate >= today &&
          app.status !== "Rejected"
      )
      .sort(
        (a, b) =>
          a.interviewDate.localeCompare(
            b.interviewDate
          )
      );
  }, [applications]);

  /* =========================
     REMINDERS
  ========================= */

  const interviewReminders = useMemo(() => {
    return upcomingInterviews.filter((app) => {
      const days = getDaysDifference(
        app.interviewDate
      );

      return days !== null && days >= 0 && days <= 7;
    });
  }, [upcomingInterviews]);

  /* =========================
     STATUS CHART
  ========================= */

  const statusChartData = useMemo(() => {
    return STATUS_OPTIONS.map((status) => ({
      name: status,
      value: applications.filter(
        (app) => app.status === status
      ).length,
    })).filter((item) => item.value > 0);
  }, [applications]);

  /* =========================
     JOB TYPE CHART
  ========================= */

  const jobTypeChartData = useMemo(() => {
    return JOB_TYPE_OPTIONS.map((type) => ({
      name: type,
      value: applications.filter(
        (app) => app.jobType === type
      ).length,
    })).filter((item) => item.value > 0);
  }, [applications]);

  /* =========================
     COMPANY CHART
  ========================= */

  const companyChartData = useMemo(() => {
    const counts = {};

    applications.forEach((app) => {
      const company =
        app.company?.trim() || "Unknown";

      counts[company] =
        (counts[company] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [applications]);

  /* =========================
     MONTHLY TREND
  ========================= */

  const monthlyTrendData = useMemo(() => {
    const now = new Date();

    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        name: date.toLocaleDateString(
          "en-IN",
          {
            month: "short",
          }
        ),
        applications: 0,
        selected: 0,
      });
    }

    applications.forEach((app) => {
      if (!app.date) return;

      const date = parseLocalDate(app.date);

      const month = months.find(
        (item) =>
          item.year === date.getFullYear() &&
          item.month === date.getMonth()
      );

      if (month) {
        month.applications += 1;

        if (app.status === "Selected") {
          month.selected += 1;
        }
      }
    });

    return months;
  }, [applications]);

  /* =========================
     FILTERED APPLICATIONS
  ========================= */

  const filteredApplications = useMemo(() => {
    let result = [...applications];

    const search =
      searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((app) => {
        return (
          app.company
            ?.toLowerCase()
            .includes(search) ||
          app.role
            ?.toLowerCase()
            .includes(search) ||
          app.location
            ?.toLowerCase()
            .includes(search)
        );
      });
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (app) =>
          app.status === statusFilter
      );
    }

    if (jobTypeFilter !== "All") {
      result = result.filter(
        (app) =>
          app.jobType === jobTypeFilter
      );
    }

    if (interviewFilter === "With Interview") {
      result = result.filter(
        (app) => app.interviewDate
      );
    }

    if (
      interviewFilter ===
      "Without Interview"
    ) {
      result = result.filter(
        (app) => !app.interviewDate
      );
    }

    if (dateFrom) {
      result = result.filter(
        (app) =>
          app.date &&
          app.date >= dateFrom
      );
    }

    if (dateTo) {
      result = result.filter(
        (app) =>
          app.date &&
          app.date <= dateTo
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (a.date || "").localeCompare(
            b.date || ""
          );

        case "companyAZ":
          return (a.company || "").localeCompare(
            b.company || ""
          );

        case "companyZA":
          return (b.company || "").localeCompare(
            a.company || ""
          );

        case "interview":
          return (
            (a.interviewDate || "9999-99-99")
              .localeCompare(
                b.interviewDate ||
                  "9999-99-99"
              )
          );

        case "newest":
        default:
          return (b.date || "").localeCompare(
            a.date || ""
          );
      }
    });

    return result;
  }, [
    applications,
    searchTerm,
    statusFilter,
    jobTypeFilter,
    interviewFilter,
    dateFrom,
    dateTo,
    sortBy,
  ]);

  /* =========================
     RECENT APPLICATIONS
  ========================= */

  const recentApplications =
    [...applications]
      .sort((a, b) =>
        (b.date || "").localeCompare(
          a.date || ""
        )
      )
      .slice(0, 5);

  /* =========================
     FORM HANDLERS
  ========================= */

  const handleInputChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(EMPTY_APPLICATION);
    setShowModal(true);
  };

  const openEditModal = (application) => {
    setEditingId(application.id);

    setFormData({
      company: application.company || "",
      role: application.role || "",
      date: application.date || "",
      interviewDate:
        application.interviewDate || "",
      status:
        application.status || "Applied",
      jobType:
        application.jobType || "Full Time",
      location:
        application.location || "",
      notes: application.notes || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(EMPTY_APPLICATION);
  };

  /* =========================
     SAVE APPLICATION
  ========================= */

  const handleSubmit = async (event) => {
  event.preventDefault();

  if (isSaving) return;

  setIsSaving(true);

  const currentToken =
    localStorage.getItem("token");

  if (!currentToken) {
    setIsSaving(false);
    setErrorMessage("Please login again.");
    return;
  }

  if (!formData.company.trim()) {
    setIsSaving(false);
    setErrorMessage("Company name is required.");
    return;
  }

  if (!formData.role.trim()) {
    setIsSaving(false);
    setErrorMessage("Job role is required.");
    return;
  }

  try {
    setErrorMessage("");

    const url = editingId
      ? `${API_URL}/api/applications/${editingId}`
      : `${API_URL}/api/applications`;

    const method = editingId
      ? "PUT"
      : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Could not save application"
      );
    }

    await fetchApplications();

    closeModal();

    setSuccessMessage(
      editingId
        ? "Application updated successfully."
        : "Application added successfully."
    );
  } catch (error) {
    console.error(error);

    setErrorMessage(
      error.message || "Could not save application."
    );
  } finally {
    setIsSaving(false);
  }
};
     
  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    const currentToken =
      localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/api/applications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not delete application"
        );
      }

      setApplications((previous) =>
        previous.filter(
          (app) => app.id !== id
        )
      );

      setSuccessMessage(
        "Application deleted successfully."
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error.message ||
          "Could not delete application."
      );
    }
  };

  /* =========================
     CLEAR FILTERS
  ========================= */

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setJobTypeFilter("All");
    setInterviewFilter("All");
    setDateFrom("");
    setDateTo("");
    setSortBy("newest");
  };

  const filtersActive =
    searchTerm ||
    statusFilter !== "All" ||
    jobTypeFilter !== "All" ||
    interviewFilter !== "All" ||
    dateFrom ||
    dateTo;

  /* =========================
     CSV EXPORT
  ========================= */

  const escapeCSV = (value) => {
    const stringValue =
      value === null ||
      value === undefined
        ? ""
        : String(value);

    return `"${stringValue.replace(
      /"/g,
      '""'
    )}"`;
  };

  const exportCSV = () => {
    if (!filteredApplications.length) {
      setErrorMessage(
        "There are no applications to export."
      );
      return;
    }

    const headers = [
      "Company",
      "Role",
      "Application Date",
      "Interview Date",
      "Status",
      "Job Type",
      "Location",
      "Notes",
    ];

    const rows =
      filteredApplications.map((app) => [
        app.company,
        app.role,
        app.date,
        app.interviewDate,
        app.status,
        app.jobType,
        app.location,
        app.notes,
      ]);

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) =>
        row.map(escapeCSV).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `placement-applications-${getTodayKey()}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setSuccessMessage(
      "CSV exported successfully."
    );
  };

  /* =========================
     PDF EXPORT
  ========================= */

  const exportPDF = () => {
    if (!filteredApplications.length) {
      setErrorMessage(
        "There are no applications to export."
      );
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "Student Placement Tracker",
      14,
      18
    );

    doc.setFontSize(10);

    doc.text(
      `Generated: ${new Date().toLocaleDateString(
        "en-IN"
      )}`,
      14,
      26
    );

    doc.text(
      `Student: ${user?.name || "User"}`,
      14,
      32
    );

    doc.text(
      `Total Applications: ${filteredApplications.length}`,
      14,
      38
    );

    const tableRows =
      filteredApplications.map((app) => [
        app.company || "",
        app.role || "",
        formatDate(app.date),
        formatDate(app.interviewDate),
        app.status || "",
        app.jobType || "",
      ]);

    autoTable(doc, {
      startY: 45,
      head: [
        [
          "Company",
          "Role",
          "Applied",
          "Interview",
          "Status",
          "Type",
        ],
      ],
      body: tableRows,
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fontSize: 8,
      },
      margin: {
        left: 10,
        right: 10,
      },
    });

    doc.save(
      `placement-report-${getTodayKey()}.pdf`
    );

    setSuccessMessage(
      "PDF exported successfully."
    );
  };

  /* =========================
     CALENDAR HELPERS
  ========================= */

  const calendarYear =
    calendarDate.getFullYear();

  const calendarMonth =
    calendarDate.getMonth();

  const firstDay = new Date(
    calendarYear,
    calendarMonth,
    1
  );

  const lastDay = new Date(
    calendarYear,
    calendarMonth + 1,
    0
  );

  const calendarStartDay =
    firstDay.getDay();

  const daysInMonth =
    lastDay.getDate();

  const calendarCells = [];

  for (
    let i = 0;
    i < calendarStartDay;
    i++
  ) {
    calendarCells.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarCells.push(day);
  }

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const changeCalendarMonth = (amount) => {
    setCalendarDate(
      new Date(
        calendarYear,
        calendarMonth + amount,
        1
      )
    );

    setSelectedCalendarDate(null);
  };

  const getInterviewsForDay = (day) => {
    if (!day) return [];

    const date = new Date(
      calendarYear,
      calendarMonth,
      day
    );

    const key = getDateKey(date);

    return applications.filter(
      (app) =>
        app.interviewDate === key
    );
  };

  const selectedDayInterviews =
    selectedCalendarDate
      ? getInterviewsForDay(
          selectedCalendarDate
        )
      : [];

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setApplications([]);
    setShowProfile(false);
  };

  /* =========================
     AUTH / PROFILE
  ========================= */

  if (!user) {
    return (
      <Auth
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
        }}
      />
    );
  }

  if (showProfile) {
    return (
      <div
        className={
          darkMode
            ? "app dark-mode"
            : "app"
        }
      >
        <Profile
          user={user}
          applications={applications}
          onBack={() =>
            setShowProfile(false)
          }
        />
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div
      className={
        darkMode
          ? "app dark-mode"
          : "app"
      }
    >
      {/* =========================
          HEADER
      ========================= */}

      <header className="header">
        <div className="header-left">
          <h1>🎓 Student Placement Tracker</h1>
          <p>
            Track applications, interviews
            and placement progress.
          </p>
        </div>

        <div className="header-actions">
          <span className="welcome-text">
            Hi, {user.name}
          </span>

          <button
            className="profile-btn"
            onClick={() =>
              setShowProfile(true)
            }
          >
            👤 Profile
          </button>

          <button
            className="theme-btn"
            onClick={() =>
              setDarkMode((value) => !value)
            }
            title="Toggle theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

          <button
            className="add-btn"
            onClick={openAddModal}
          >
            + Add Application
          </button>
        </div>
      </header>

      {/* =========================
          NOTIFICATIONS
      ========================= */}

      {successMessage && (
        <div className="toast success-toast">
          ✅ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="toast error-toast">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* =========================
          LOADING
      ========================= */}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your applications...</p>
        </div>
      ) : (
        <>
          {/* =========================
              STAT CARDS
          ========================= */}

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                📋
              </div>
              <div>
                <span>Total Applications</span>
                <strong>
                  {totalApplications}
                </strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                📤
              </div>
              <div>
                <span>Applied</span>
                <strong>
                  {appliedCount}
                </strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                📝
              </div>
              <div>
                <span>Assessments</span>
                <strong>
                  {assessmentCount}
                </strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon cyan">
                🎤
              </div>
              <div>
                <span>Interviews</span>
                <strong>
                  {interviewCount}
                </strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                🎉
              </div>
              <div>
                <span>Selected</span>
                <strong>
                  {selectedCount}
                </strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon red">
                ❌
              </div>
              <div>
                <span>Rejected</span>
                <strong>
                  {rejectedCount}
                </strong>
              </div>
            </div>
          </section>

          {/* =========================
              SUCCESS RATE
          ========================= */}

          <section className="success-rate-card">
            <div className="success-rate-header">
              <div>
                <h3>Placement Success Rate</h3>
                <p>
                  Selected applications compared
                  with total applications
                </p>
              </div>

              <strong>
                {successRate}%
              </strong>
            </div>

            <div className="success-progress">
              <div
                className="success-progress-fill"
                style={{
                  width: `${Math.min(
                    Number(successRate),
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </section>

          {/* =========================
              INTERVIEW REMINDERS
          ========================= */}

          <section className="section-card reminder-section">
            <div className="section-title-row">
              <div>
                <h2>
                  🔔 Interview Reminders
                </h2>
                <p>
                  Your upcoming interviews
                  for the next 7 days.
                </p>
              </div>

              <span className="section-count">
                {interviewReminders.length}
              </span>
            </div>

            {interviewReminders.length ===
            0 ? (
              <div className="empty-small">
                <span>🎯</span>
                <p>
                  No interviews scheduled
                  within the next 7 days.
                </p>
              </div>
            ) : (
              <div className="reminder-list">
                {interviewReminders.map(
                  (app) => {
                    const days =
                      getDaysDifference(
                        app.interviewDate
                      );

                    return (
                      <div
                        className={
                          days === 0
                            ? "reminder-card today"
                            : "reminder-card"
                        }
                        key={app.id}
                      >
                        <div className="reminder-icon">
                          {days === 0
                            ? "🚨"
                            : "📅"}
                        </div>

                        <div className="reminder-info">
                          <strong>
                            {app.company}
                          </strong>

                          <span>
                            {app.role}
                          </span>

                          <small>
                            {formatDate(
                              app.interviewDate
                            )}
                          </small>
                        </div>

                        <div className="reminder-countdown">
                          {getInterviewMessage(
                            app.interviewDate
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>

          {/* =========================
              CHARTS
          ========================= */}

          <section className="dashboard-charts">
            {/* STATUS */}

            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h2>Application Status</h2>
                  <p>
                    Current application
                    distribution
                  </p>
                </div>
              </div>

              {statusChartData.length ===
              0 ? (
                <div className="chart-empty">
                  No application data yet.
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {statusChartData.map(
                          (_, index) => (
                            <Cell
                              key={index}
                              fill={
                                CHART_COLORS[
                                  index %
                                    CHART_COLORS.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip />

                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* JOB TYPE */}

            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h2>Job Type</h2>
                  <p>
                    Applications by job
                    category
                  </p>
                </div>
              </div>

              {jobTypeChartData.length ===
              0 ? (
                <div className="chart-empty">
                  No job type data yet.
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >
                    <BarChart
                      data={jobTypeChartData}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.2}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        allowDecimals={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        fill="#2563eb"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* TREND */}

            <div className="chart-card chart-wide">
              <div className="chart-card-header">
                <div>
                  <h2>
                    📈 Application Trend
                  </h2>
                  <p>
                    Applications submitted
                    during the last 6 months
                  </p>
                </div>
              </div>

              <div className="chart-container">
                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <LineChart
                    data={monthlyTrendData}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.2}
                    />

                    <XAxis dataKey="name" />

                    <YAxis
                      allowDecimals={false}
                    />

                    <Tooltip />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="applications"
                      name="Applications"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="selected"
                      name="Selected"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* COMPANY */}

            <div className="chart-card chart-wide">
              <div className="chart-card-header">
                <div>
                  <h2>
                    🏢 Top Companies
                  </h2>
                  <p>
                    Companies with the most
                    applications
                  </p>
                </div>
              </div>

              {companyChartData.length ===
              0 ? (
                <div className="chart-empty">
                  No company data yet.
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer
                    width="100%"
                    height={320}
                  >
                    <BarChart
                      data={companyChartData}
                      layout="vertical"
                      margin={{
                        left: 30,
                        right: 20,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.2}
                      />

                      <XAxis
                        type="number"
                        allowDecimals={false}
                      />

                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        fill="#7c3aed"
                        radius={[
                          0,
                          6,
                          6,
                          0,
                        ]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          {/* =========================
              INTERVIEW CALENDAR
          ========================= */}

          <section className="section-card calendar-section">
            <div className="section-title-row">
              <div>
                <h2>
                  📅 Interview Calendar
                </h2>
                <p>
                  View all your scheduled
                  interviews by date.
                </p>
              </div>
            </div>

            <div className="calendar-wrapper">
              <div className="calendar-header">
                <button
                  onClick={() =>
                    changeCalendarMonth(-1)
                  }
                  className="calendar-nav"
                >
                  ←
                </button>

                <h3>
                  {calendarDate.toLocaleDateString(
                    "en-IN",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </h3>

                <button
                  onClick={() =>
                    changeCalendarMonth(1)
                  }
                  className="calendar-nav"
                >
                  →
                </button>
              </div>

              <div className="calendar-weekdays">
                {[
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ].map((day) => (
                  <div
                    key={day}
                    className="calendar-weekday"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarCells.map(
                  (day, index) => {
                    if (!day) {
                      return (
                        <div
                          key={index}
                          className="calendar-day empty-day"
                        ></div>
                      );
                    }

                    const interviews =
                      getInterviewsForDay(
                        day
                      );

                    const dateKey =
                      getDateKey(
                        new Date(
                          calendarYear,
                          calendarMonth,
                          day
                        )
                      );

                    const isToday =
                      dateKey ===
                      getTodayKey();

                    const isSelected =
                      selectedCalendarDate ===
                      day;

                    return (
                      <button
                        key={index}
                        className={`calendar-day ${
                          isToday
                            ? "today-day"
                            : ""
                        } ${
                          isSelected
                            ? "selected-day"
                            : ""
                        } ${
                          interviews.length
                            ? "has-interview"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedCalendarDate(
                            day
                          )
                        }
                      >
                        <span className="calendar-number">
                          {day}
                        </span>

                        {interviews.length >
                          0 && (
                          <span className="calendar-interview-count">
                            🎤{" "}
                            {interviews.length}
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {selectedCalendarDate && (
              <div className="selected-date-panel">
                <h3>
                  Interviews on{" "}
                  {new Date(
                    calendarYear,
                    calendarMonth,
                    selectedCalendarDate
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </h3>

                {selectedDayInterviews.length ===
                0 ? (
                  <p>
                    No interviews scheduled
                    for this date.
                  </p>
                ) : (
                  <div className="selected-interviews">
                    {selectedDayInterviews.map(
                      (app) => (
                        <div
                          className="selected-interview-card"
                          key={app.id}
                        >
                          <strong>
                            {app.company}
                          </strong>

                          <span>
                            {app.role}
                          </span>

                          <small>
                            {app.location ||
                              "Location not specified"}
                          </small>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* =========================
              RECENT APPLICATIONS
          ========================= */}

          <section className="section-card recent-section">
            <div className="section-title-row">
              <div>
                <h2>
                  🕐 Recent Applications
                </h2>
                <p>
                  Your latest application
                  activity.
                </p>
              </div>
            </div>

            {recentApplications.length ===
            0 ? (
              <div className="empty-state">
                <div>📋</div>
                <h3>
                  No applications yet
                </h3>
                <p>
                  Add your first application
                  to start tracking your
                  placement journey.
                </p>

                <button
                  className="add-btn"
                  onClick={openAddModal}
                >
                  + Add Application
                </button>
              </div>
            ) : (
              <div className="recent-table-wrapper">
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Applied</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentApplications.map(
                      (app) => (
                        <tr key={app.id}>
                          <td>
                            <strong>
                              {app.company}
                            </strong>
                          </td>

                          <td>
                            {app.role}
                          </td>

                          <td>
                            {formatDate(
                              app.date
                            )}
                          </td>

                          <td>
                            <span
                              className={`status-badge status-${app.status
                                ?.toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )}`}
                            >
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* =========================
              APPLICATIONS
          ========================= */}

          <section className="section-card applications-section">
            <div className="applications-heading">
              <div>
                <h2>
                  📋 All Applications
                </h2>
                <p>
                  Manage and filter your
                  applications.
                </p>
              </div>

              <div className="export-buttons">
                <button
                  className="export-btn"
                  onClick={exportCSV}
                >
                  📤 CSV
                </button>

                <button
                  className="export-btn pdf"
                  onClick={exportPDF}
                >
                  📄 PDF
                </button>
              </div>
            </div>

            {/* FILTERS */}

            <div className="advanced-filters">
              <div className="filter-field search-field">
                <label>
                  Search
                </label>

                <input
                  type="text"
                  placeholder="Company, role or location..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="filter-field">
                <label>
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All Statuses
                  </option>

                  {STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="filter-field">
                <label>
                  Job Type
                </label>

                <select
                  value={jobTypeFilter}
                  onChange={(event) =>
                    setJobTypeFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All Types
                  </option>

                  {JOB_TYPE_OPTIONS.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="filter-field">
                <label>
                  Interview
                </label>

                <select
                  value={interviewFilter}
                  onChange={(event) =>
                    setInterviewFilter(
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All
                  </option>

                  <option value="With Interview">
                    With Interview
                  </option>

                  <option value="Without Interview">
                    Without Interview
                  </option>
                </select>
              </div>

              <div className="filter-field">
                <label>
                  From
                </label>

                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) =>
                    setDateFrom(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="filter-field">
                <label>
                  To
                </label>

                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) =>
                    setDateTo(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="filter-field">
                <label>
                  Sort
                </label>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value
                    )
                  }
                >
                  <option value="newest">
                    Newest First
                  </option>

                  <option value="oldest">
                    Oldest First
                  </option>

                  <option value="companyAZ">
                    Company A-Z
                  </option>

                  <option value="companyZA">
                    Company Z-A
                  </option>

                  <option value="interview">
                    Interview Date
                  </option>
                </select>
              </div>

              {filtersActive && (
                <button
                  className="clear-filters-btn"
                  onClick={clearFilters}
                >
                  ✕ Clear Filters
                </button>
              )}
            </div>

            {/* RESULT COUNT */}

            <div className="results-summary">
              <span>
                Showing{" "}
                <strong>
                  {filteredApplications.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {applications.length}
                </strong>{" "}
                applications
              </span>
            </div>

            {/* APPLICATION LIST */}

            {filteredApplications.length ===
            0 ? (
              <div className="empty-state">
                <div>🔍</div>

                <h3>
                  No applications found
                </h3>

                <p>
                  Try changing your filters
                  or add a new application.
                </p>

                {filtersActive && (
                  <button
                    className="secondary-btn"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="application-list">
                {filteredApplications.map(
                  (app) => {
                    const interviewDays =
                      app.interviewDate
                        ? getDaysDifference(
                            app.interviewDate
                          )
                        : null;

                    return (
                      <div
                        className="application-card"
                        key={app.id}
                      >
                        <div className="application-main">
                          <div className="company-avatar">
                            {app.company
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="application-info">
                            <div className="application-title-row">
                              <h3>
                                {app.company}
                              </h3>

                              <span
                                className={`status-badge status-${app.status
                                  ?.toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    "-"
                                  )}`}
                              >
                                {app.status}
                              </span>
                            </div>

                            <p className="role-text">
                              {app.role}
                            </p>

                            <div className="application-meta">
                              <span>
                                📅{" "}
                                {formatDate(
                                  app.date
                                )}
                              </span>

                              <span>
                                💼{" "}
                                {app.jobType}
                              </span>

                              {app.location && (
                                <span>
                                  📍{" "}
                                  {app.location}
                                </span>
                              )}
                            </div>

                            {app.interviewDate && (
                              <div
                                className={
                                  interviewDays !==
                                    null &&
                                  interviewDays >=
                                    0 &&
                                  interviewDays <=
                                    7
                                    ? "interview-highlight"
                                    : "interview-info"
                                }
                              >
                                🎤 Interview:{" "}
                                <strong>
                                  {formatDate(
                                    app.interviewDate
                                  )}
                                </strong>

                                <span>
                                  {getInterviewMessage(
                                    app.interviewDate
                                  )}
                                </span>
                              </div>
                            )}

                            {app.notes && (
                              <p className="application-notes">
                                📝 {app.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="application-actions">
                          <button
                            className="edit-btn"
                            onClick={() =>
                              openEditModal(app)
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(
                                app.id
                              )
                            }
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </>
      )}

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>
                  {editingId
                    ? "✏️ Edit Application"
                    : "➕ Add Application"}
                </h2>

                <p>
                  {editingId
                    ? "Update your application details."
                    : "Add a new placement application."}
                </p>
              </div>

              <button
                className="close-btn"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form
              className="application-form"
              onSubmit={handleSubmit}
            >
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Company Name *
                  </label>

                  <input
                    name="company"
                    value={
                      formData.company
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="e.g. Siemens"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Job Role *
                  </label>

                  <input
                    name="role"
                    value={formData.role}
                    onChange={
                      handleInputChange
                    }
                    placeholder="e.g. Software Engineer"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Application Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={
                      handleInputChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Interview Date
                  </label>

                  <input
                    type="date"
                    name="interviewDate"
                    value={
                      formData.interviewDate
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleInputChange
                    }
                  >
                    {STATUS_OPTIONS.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Job Type
                  </label>

                  <select
                    name="jobType"
                    value={
                      formData.jobType
                    }
                    onChange={
                      handleInputChange
                    }
                  >
                    {JOB_TYPE_OPTIONS.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Location
                  </label>

                  <input
                    name="location"
                    value={
                      formData.location
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="e.g. Hyderabad / Remote"
                    maxLength={100}
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={
                      formData.notes
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Add interview notes, preparation points, links..."
                    rows="4"
                  ></textarea>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
  type="submit"
  className="save-btn"
  disabled={isSaving}
>
  {isSaving
    ? "Saving..."
    : editingId
      ? "Update Application"
      : "Save Application"}
</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <footer className="app-footer">
  <div className="footer-content">
    <span>© 2026 Student Placement Tracker</span>

    <span className="footer-divider">•</span>

    <span>Built by Hari</span>

    <a
      href="https://github.com/harinadh26"
      target="_blank"
      rel="noopener noreferrer"
      className="footer-link"
    >
      GitHub
    </a>

    <a
  href="https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=feedbackbyyou01@gmail.com&su=Student%20Placement%20Tracker%20Feedback"
  target="_blank"
  rel="noopener noreferrer"
  className="footer-link"
>
  Feedback
</a>
  </div>
</footer>
    </div>
  );
}

export default App;