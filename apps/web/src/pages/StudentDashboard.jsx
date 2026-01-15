import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function StudentDashboard() {
  const API = "http://localhost:5000";

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState("");

  // Demo widgets (replace later with real APIs)
  const attendance = useMemo(
    () => ({
      present: 18,
      absent: 5,
      late: 1,
      percentage: 90,
      lastUpdated: "2026-01-15",
    }),
    []
  );

  const marks = useMemo(
    () => [
      { exam: "Unit Test 01", score: 78, max: 100, date: "2025-11-20", status: "Good" },
      { exam: "Unit Test 02", score: 84, max: 100, date: "2025-12-18", status: "Excellent" },
      { exam: "Model Paper 01", score: 72, max: 100, date: "2026-01-05", status: "Good" },
    ],
    []
  );

  const fees = useMemo(
    () => ({
      monthlyFee: 2500,
      due: 2500,
      dueDate: "2026-01-30",
      lastPayment: "2025-12-30",
      paymentStatus: "Due",
    }),
    []
  );

  // ✅ Load student profile from DB
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErr("No access token found. Please login again.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setErr("");
        setLoading(true);

        const res = await axios.get(`${API}/api/students/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const u = res.data?.user;
        setUser(u);
        setFullName(u?.fullName || "");
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Update only fullName (student can edit)
  async function handleSaveName() {
    setMsg("");
    setErr("");

    const token = localStorage.getItem("accessToken");
    if (!token) return setErr("No access token found. Please login again.");

    try {
      const res = await axios.put(
        `${API}/api/students/me`,
        { fullName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data?.user;
      setUser(updated);
      setMsg("✅ Profile updated");
      setEditOpen(false);
    } catch (e) {
      setErr(e.response?.data?.message || "Update failed");
    }
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-2xl bg-white border border-slate-200 px-6 py-5 shadow-sm">
          <p className="font-bold text-slate-900">Loading dashboard...</p>
          <p className="text-sm text-slate-500 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  if (err && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Unable to load</h2>
          <p className="mt-2 text-sm text-rose-600 font-semibold">{err}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="mt-5 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 active:scale-95 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl bg-slate-50">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Student Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Welcome back, <span className="font-semibold">{user.fullName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-bold">
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-bold hover:bg-slate-800 active:scale-95 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Status messages */}
      <div className="mx-auto max-w-8xl px-4 pt-4">
        {msg && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 font-semibold">
            {msg}
          </div>
        )}
        {err && (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 font-semibold">
            {err}
          </div>
        )}
      </div>

      {/* Main Layout: 2 : 6 : 2 */}
      <div className="mx-auto max-w-7.5xl px-4 py-">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          {/* LEFT (2/10) - Student Details */}
          <aside className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center gap-2">
                <Avatar initials={getInitials(user.fullName)} />
                <div>
                  <p className="text-sm text-slate-500">Student</p>
                  <p className="font-extrabold text-slate-900">{user.fullName}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <InfoRow label="Student ID" value={user.studentId || "-"} />
                <InfoRow label="Class ID" value={user.classId || "Not Assigned"} />
                <InfoRow label="Joined Date" value={formatDate(user.createdAt)} />
                <InfoRow label="Email" value={user.email} />
              </div>

              {/* ✅ Student can edit (NO delete) */}
              <button
                onClick={() => {
                  setFullName(user.fullName || "");
                  setEditOpen(true);
                }}
                className="mt-5 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 active:scale-95 transition"
              >
                Edit Profile
              </button>

              <p className="mt-3 text-xs text-slate-500">
                You can edit your <b>name</b> only. Student ID / role cannot be changed.
              </p>
            </Card>

            <Card>
              <h3 className="font-extrabold text-slate-900">Quick Links</h3>
              <div className="mt-4 space-y-2">
                <QuickButton label="View Timetable" />
                <QuickButton label="Download Report" />
                <QuickButton label="Contact Teacher" />
              </div>
            </Card>
          </aside>

          {/* CENTER (6/10) */}
          <main className="lg:col-span-6 space-y-6">
            <Card>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Attendance</h2>
                  <p className="text-sm text-slate-500">
                    Last updated: {attendance.lastUpdated}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">Attendance Rate</p>
                  <p className="text-2xl font-black text-indigo-700">
                    {attendance.percentage}%
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatBox title="Present" value={attendance.present} accent="indigo" />
                <StatBox title="Absent" value={attendance.absent} accent="rose" />
                <StatBox title="Late" value={attendance.late} accent="amber" />
              </div>

              <div className="mt-5">
                <ProgressBar value={attendance.percentage} />
                <p className="mt-2 text-xs text-slate-500">
                  Keep your attendance above 85% for better progress tracking.
                </p>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Marks & Performance</h2>
                  <p className="text-sm text-slate-500">Recent exams and results</p>
                </div>
                <button className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-bold hover:bg-indigo-700 active:scale-95 transition">
                  View All
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b">
                      <th className="py-3 pr-4 font-semibold">Exam</th>
                      <th className="py-3 pr-4 font-semibold">Score</th>
                      <th className="py-3 pr-4 font-semibold">Date</th>
                      <th className="py-3 pr-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {marks.map((m, idx) => (
                      <tr key={idx} className="border-b last:border-b-0">
                        <td className="py-3 pr-4 font-bold text-slate-900">{m.exam}</td>
                        <td className="py-3 pr-4">
                          <span className="font-extrabold text-slate-900">{m.score}</span>
                          <span className="text-slate-500"> / {m.max}</span>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{m.date}</td>
                        <td className="py-3 pr-4">
                          <StatusPill status={m.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-extrabold text-slate-900">Upcoming Class</h3>
                <p className="mt-1 text-sm text-slate-500">Your next session details</p>

                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">Topic</p>
                  <p className="text-base font-extrabold text-slate-900">
                    Algebra – Quadratic Equations
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <InfoRow label="Day" value="Saturday" />
                    <InfoRow label="Time" value="11:00AM - 3:00PM" />
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-extrabold text-slate-900">Announcements</h3>
                <p className="mt-1 text-sm text-slate-500">Latest updates</p>

                <div className="mt-4 space-y-3">
                  <Notice text="Model paper discussion on Sunday (1:30PM)." />
                  <Notice text="Bring your last unit test paper for correction." />
                  <Notice text="Fee due date is approaching – please check payments." />
                </div>
              </Card>
            </div>
          </main>

          {/* RIGHT (2/10) */}
          <aside className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-extrabold text-slate-900">Class Fee</h3>

              <div className="mt-4 rounded-2xl bg-slate-900 text-white p-4">
                <p className="text-xs text-white/70">Monthly Fee</p>
                <p className="text-2xl font-black">LKR {fees.monthlyFee}</p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-white/70">Status</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                    {fees.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <InfoRow label="Due Amount" value={`LKR ${fees.due}`} />
                <InfoRow label="Due Date" value={fees.dueDate} />
                <InfoRow label="Last Payment" value={fees.lastPayment} />
              </div>

              <button className="mt-5 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 active:scale-95 transition">
                Pay Now
              </button>

              <p className="mt-3 text-xs text-slate-500">
                Payments are shown for demo. Connect to fee API later.
              </p>
            </Card>

            <Card>
              <h3 className="font-extrabold text-slate-900">More</h3>
              <div className="mt-4 space-y-2">
                <MiniStat label="Avg. Marks" value="78%" />
                <MiniStat label="Completed Units" value="8 / 12" />
                <MiniStat label="Next Payment" value={fees.dueDate} />
              </div>
            </Card>
          </aside>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Edit Profile</h3>
                <p className="text-sm text-slate-500 mt-1">
                  You can update your name only.
                </p>
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-xl bg-slate-100 px-3 py-2 font-bold hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
                placeholder="Enter your name"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditOpen(false)}
                className="w-full rounded-xl bg-slate-100 py-3 font-bold text-slate-800 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveName}
                className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 active:scale-95 transition"
              >
                Save
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Student cannot delete the account. Only Admin controls deletion.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI Helpers ---------------- */

function Card({ children }) {
  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
      {children}
    </div>
  );
}

function Avatar({ initials }) {
  return (
    <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black">
      {initials}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className="text-sm font-extrabold text-slate-900 text-right break-all">
        {value}
      </span>
    </div>
  );
}

function QuickButton({ label }) {
  return (
    <button className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-900 hover:bg-slate-100 transition">
      {label}
    </button>
  );
}

function StatBox({ title, value, accent }) {
  const accentMap = {
    indigo: "bg-indigo-50 text-indigo-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-800",
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-xs font-bold text-slate-500">{title}</p>
      <p className={`mt-1 text-2xl font-black ${accentMap[accent] || ""}`}>
        {value}
      </p>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full bg-indigo-600 rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    Excellent: "bg-emerald-50 text-emerald-700",
    Good: "bg-indigo-50 text-indigo-700",
    Average: "bg-amber-50 text-amber-800",
    Weak: "bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
        map[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function Notice({ text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-700 font-semibold">{text}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className="text-sm font-extrabold text-slate-900">{value}</span>
    </div>
  );
}

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  const first = parts[0]?.[0] || "S";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  // simple readable format
  return d.toISOString().slice(0, 10);
}
