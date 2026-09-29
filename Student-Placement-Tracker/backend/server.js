const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is missing in .env");
  process.exit(1);
}

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "placement_user",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "student_placement_tracker",
  dateStrings: true,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    process.exit(1);
  }

  console.log("MySQL connected successfully");
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "1mb" }));

/* =========================
   AUTHENTICATION MIDDLEWARE
========================= */

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication token is required",
    });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      message: "Invalid authorization format",
    });
  }

  const token = parts[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  });
};

/* =========================
   VALIDATION HELPERS
========================= */

const allowedStatuses = [
  "Applied",
  "Online Assessment",
  "Interview",
  "Selected",
  "Rejected",
];

const allowedJobTypes = [
  "Full Time",
  "Internship",
  "Contract",
];

const isValidDate = (value) => {
  if (!value) return true;

  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

const validateApplication = ({
  company,
  role,
  date,
  interviewDate,
  status,
  jobType,
}) => {
  if (!company || !company.trim()) {
    return "Company name is required";
  }

  if (!role || !role.trim()) {
    return "Job role is required";
  }

  if (company.trim().length > 100) {
    return "Company name must be 100 characters or less";
  }

  if (role.trim().length > 150) {
    return "Job role must be 150 characters or less";
  }

  if (date && !isValidDate(date)) {
    return "Invalid application date";
  }

  if (interviewDate && !isValidDate(interviewDate)) {
    return "Invalid interview date";
  }

  if (status && !allowedStatuses.includes(status)) {
    return "Invalid application status";
  }

  if (jobType && !allowedJobTypes.includes(jobType)) {
    return "Invalid job type";
  }

  return null;
};

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "Student Placement Tracker API is running",
  });
});

/* =========================
   REGISTER
========================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters",
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        message: "Name must be 100 characters or less",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    db.query(
      "SELECT id FROM users WHERE email = ?",
      [cleanEmail],
      async (err, results) => {
        if (err) {
          console.error("Register check error:", err.message);

          return res.status(500).json({
            message: "Server error",
          });
        }

        if (results.length > 0) {
          return res.status(409).json({
            message: "An account with this email already exists",
          });
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);

          db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [cleanName, cleanEmail, hashedPassword],
            (insertErr, result) => {
              if (insertErr) {
                console.error("Register insert error:", insertErr.message);

                return res.status(500).json({
                  message: "Could not create account",
                });
              }

              const user = {
                id: result.insertId,
                name: cleanName,
                email: cleanEmail,
              };

              const token = jwt.sign(
                {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                },
                JWT_SECRET,
                {
                  expiresIn: "7d",
                }
              );

              return res.status(201).json({
                message: "Registration successful",
                token,
                user,
              });
            }
          );
        } catch (hashError) {
          console.error("Password hashing error:", hashError.message);

          return res.status(500).json({
            message: "Could not create account",
          });
        }
      }
    );
  } catch (error) {
    console.error("Register error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================
   LOGIN
========================= */

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  db.query(
    "SELECT id, name, email, password FROM users WHERE email = ?",
    [cleanEmail],
    async (err, results) => {
      if (err) {
        console.error("Login database error:", err.message);

        return res.status(500).json({
          message: "Server error",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const userRecord = results[0];

      try {
        const passwordMatch = await bcrypt.compare(
          password,
          userRecord.password
        );

        if (!passwordMatch) {
          return res.status(401).json({
            message: "Invalid email or password",
          });
        }

        const user = {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
        };

        const token = jwt.sign(
          {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );

        return res.json({
          message: "Login successful",
          token,
          user,
        });
      } catch (compareError) {
        console.error("Password comparison error:", compareError.message);

        return res.status(500).json({
          message: "Server error",
        });
      }
    }
  );
});

/* =========================
   GET APPLICATIONS
========================= */

app.get(
  "/api/applications",
  authenticateToken,
  (req, res) => {
    const sql = `
      SELECT
        id,
        company,
        role,
        date,
        interviewDate,
        status,
        jobType,
        location,
        notes,
        created_at
      FROM applications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [req.user.id], (err, results) => {
      if (err) {
        console.error("Get applications error:", err.message);

        return res.status(500).json({
          message: "Could not fetch applications",
        });
      }

      res.json(results);
    });
  }
);

/* =========================
   ADD APPLICATION
========================= */

app.post(
  "/api/applications",
  authenticateToken,
  (req, res) => {
    const {
      company,
      role,
      date,
      interviewDate,
      status,
      jobType,
      location,
      notes,
    } = req.body;

    const validationError = validateApplication({
      company,
      role,
      date,
      interviewDate,
      status,
      jobType,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const sql = `
      INSERT INTO applications
      (
        company,
        role,
        date,
        interviewDate,
        status,
        jobType,
        location,
        notes,
        user_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      company.trim(),
      role.trim(),
      date || null,
      interviewDate || null,
      status || "Applied",
      jobType || "Full Time",
      location ? location.trim() : "",
      notes ? notes.trim() : "",
      req.user.id,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Add application error:", err.message);

        return res.status(500).json({
          message: "Could not add application",
        });
      }

      res.status(201).json({
        message: "Application added successfully",
        id: result.insertId,
      });
    });
  }
);

/* =========================
   UPDATE APPLICATION
   IMPORTANT: USER-SPECIFIC
========================= */

app.put(
  "/api/applications/:id",
  authenticateToken,
  (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid application ID",
      });
    }

    const {
      company,
      role,
      date,
      interviewDate,
      status,
      jobType,
      location,
      notes,
    } = req.body;

    const validationError = validateApplication({
      company,
      role,
      date,
      interviewDate,
      status,
      jobType,
    });

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const sql = `
      UPDATE applications
      SET
        company = ?,
        role = ?,
        date = ?,
        interviewDate = ?,
        status = ?,
        jobType = ?,
        location = ?,
        notes = ?
      WHERE id = ?
      AND user_id = ?
    `;

    const values = [
      company.trim(),
      role.trim(),
      date || null,
      interviewDate || null,
      status || "Applied",
      jobType || "Full Time",
      location ? location.trim() : "",
      notes ? notes.trim() : "",
      id,
      req.user.id,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Update application error:", err.message);

        return res.status(500).json({
          message: "Could not update application",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Application not found",
        });
      }

      res.json({
        message: "Application updated successfully",
      });
    });
  }
);

/* =========================
   DELETE APPLICATION
========================= */

app.delete(
  "/api/applications/:id",
  authenticateToken,
  (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid application ID",
      });
    }

    const sql = `
      DELETE FROM applications
      WHERE id = ?
      AND user_id = ?
    `;

    db.query(
      sql,
      [id, req.user.id],
      (err, result) => {
        if (err) {
          console.error("Delete application error:", err.message);

          return res.status(500).json({
            message: "Could not delete application",
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            message: "Application not found",
          });
        }

        res.json({
          message: "Application deleted successfully",
        });
      }
    );
  }
);

/* =========================
   CHANGE PASSWORD
========================= */

app.put(
  "/api/auth/change-password",
  authenticateToken,
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must contain at least 6 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    db.query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id],
      async (err, results) => {
        if (err) {
          console.error("Change password lookup error:", err.message);

          return res.status(500).json({
            message: "Server error",
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            message: "User account not found",
          });
        }

        try {
          const passwordMatch = await bcrypt.compare(
            currentPassword,
            results[0].password
          );

          if (!passwordMatch) {
            return res.status(401).json({
              message: "Current password is incorrect",
            });
          }

          const hashedPassword = await bcrypt.hash(
            newPassword,
            10
          );

          db.query(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, req.user.id],
            (updateErr) => {
              if (updateErr) {
                console.error(
                  "Password update error:",
                  updateErr.message
                );

                return res.status(500).json({
                  message: "Could not change password",
                });
              }

              res.json({
                message: "Password changed successfully",
              });
            }
          );
        } catch (passwordError) {
          console.error(
            "Password processing error:",
            passwordError.message
          );

          return res.status(500).json({
            message: "Could not change password",
          });
        }
      }
    );
  }
);

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(500).json({
    message: "Internal server error",
  });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});