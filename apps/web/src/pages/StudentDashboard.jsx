// client/src/pages/StudentDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import logo from "../assets/Landing_Logo_icon.png";
import AttendanceCalendar from "../Components/AttendanceCalendar";
import AlgeonLoader from "../Components/AlgeonLoader";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function StudentDashboard() {
  const API = "http://localhost:5000";

  const [user, setUser] = useState(null);

  // loaders
  const [pageLoading, setPageLoading] = useState(true);
  const [monthLoading, setMonthLoading] = useState(false);

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolName, setSchoolName] = useState("");

  // Calendar state
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth()); // 0-11

  // Data needed by calendar
  const [timetableDays, setTimetableDays] = useState({});
  const [attendanceMap, setAttendanceMap] = useState({});

  // Fees (Jan–Dec)
  const [feeYearRecords, setFeeYearRecords] = useState([]);

  // Notices
  const [notices, setNotices] = useState([]);

  function monthKey(y, m) {
    return `${y}-${String(m + 1).padStart(2, "0")}`; // "YYYY-MM"
  }

  function monthLabel(monthStr) {
    if (!monthStr || !monthStr.includes("-")) return monthStr;
    const [, mm] = monthStr.split("-");
    const idx = Number(mm) - 1;
    return MONTH_NAMES[idx] || monthStr;
  }

  async function fetchAttendanceForMonth(y, m) {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const mKey = monthKey(y, m);
    const res = await axios.get(`${API}/api/attendance/me?month=${mKey}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const records = res.data?.records || [];
    const map = {};
    records.forEach((r) => (map[r.date] = r.status));
    setAttendanceMap(map);
  }

  async function fetchTimetableDays() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const res = await axios.get(`${API}/api/timetable/my-class`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const tt = res.data?.timetable || res.data || [];
    const daysObj = {};
    (tt || []).forEach((row) => {
      if (row.day) daysObj[row.day] = true;
    });
    setTimetableDays(daysObj);
  }

  async function fetchFeesForYear(y) {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const res = await axios.get(`${API}/api/fees/me?year=${y}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFeeYearRecords(res.data?.records || []);
  }

  async function fetchMyNotices() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const res = await axios.get(`${API}/api/notices/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setNotices(res.data?.notices || []);
  }

  // First load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErr("No access token found. Please login again.");
      setPageLoading(false);
      return;
    }

    (async () => {
      try {
        setErr("");
        setPageLoading(true);

        const res = await axios.get(`${API}/api/students/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const u = res.data?.user;
        setUser(u);
        setFullName(u?.fullName || "");
        setPhone(u?.phone || "");
        setSchoolName(u?.schoolName || "");

        await fetchTimetableDays();

        await Promise.all([
          fetchAttendanceForMonth(calYear, calMonth),
          fetchFeesForYear(calYear),
          fetchMyNotices(),
        ]);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load dashboard");
      } finally {
        setPageLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When month changes: only attendance needs refetch
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setMonthLoading(true);
        await fetchAttendanceForMonth(calYear, calMonth);
      } catch (e) {
        setErr(e.response?.data?.message || "Failed to load month data");
      } finally {
        setMonthLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calYear, calMonth, user]);

  // When year changes: refetch fees for year
  useEffect(() => {
    if (!user) return;
    fetchFeesForYear(calYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calYear, user]);

  async function handleSaveProfile() {
    setMsg("");
    setErr("");

    const token = localStorage.getItem("accessToken");
    if (!token) return setErr("No access token found. Please login again.");

    if (phone && !/^07\d{8}$/.test(phone)) {
      return setErr("Enter a valid phone number (ex: 07XXXXXXXX).");
    }

    try {
      const res = await axios.put(
        `${API}/api/students/me`,
        { fullName, phone, schoolName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data?.user;
      setUser(updated);

      setFullName(updated?.fullName || "");
      setPhone(updated?.phone || "");
      setSchoolName(updated?.schoolName || "");

      setMsg("Profile updated successfully");
      setEditOpen(false);
    } catch (e) {
      setErr(e.response?.data?.message || "Update failed");
    }
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    sessionStorage.clear();
    window.location.replace("/");
  }

  function prevMonth() {
    setCalMonth((m) => {
      if (m === 0) {
        setCalYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function nextMonth() {
    setCalMonth((m) => {
      if (m === 11) {
        setCalYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  if (pageLoading) return <AlgeonLoader />;

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
    <div className="max-w-8xl bg-slate-50 min-h-screen">
      {/* NAVBAR */}
      <nav className="sticky top-2 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-8xl px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-16 w-auto select-none pointer-events-none" />
            <div className="text-left">
              <p className="font-black text-slate-900 leading-tight text-xl">
                |&nbsp;&nbsp;Student Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-extrabold text-slate-900">{user.fullName}</p>
              <span className="hidden md:inline-flex rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-bold">
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-bold hover:bg-slate-800 active:scale-95 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Status */}
      <div className="mx-auto max-w-7xl px-4 pt-4">
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

      {/* Layout */}
      <div className="mx-auto max-w-8xl px-4 py-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* LEFT */}
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
                <InfoRow label="School" value={user.schoolName || "Not Set"} />
                <InfoRow label="Phone" value={user.phone || "Not Set"} />
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Joined Date" value={formatDate(user.createdAt)} />
              </div>

              <button
                onClick={() => {
                  setFullName(user.fullName || "");
                  setPhone(user.phone || "");
                  setSchoolName(user.schoolName || "");
                  setEditOpen(true);
                }}
                className="relative top-3 mb-2 w-1/2 left-12 rounded-lg bg-indigo-500 text-sm py-1 text-white hover:bg-indigo-600 active:scale-95 transition"
              >
                Edit
              </button>
            </Card>
          </aside>

          {/* CENTER */}
          <main className="lg:col-span-7 space-y-6">

            {/* NOTICES CARD (FULL WIDTH) */}
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">Notices</h2>
                <span className="text-xs font-bold text-slate-500">
                  {user.classId || "Grade"}
                </span>
              </div>

              {notices.length === 0 ? (
                <div className="mt-3 border border-slate-200 bg-slate-50 p-2 rounded-lg">
                  <p className="text-sm font-bold text-slate-600">No notices right now.</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Admin will post important updates for your grade here.
                  </p>
                </div>
              ) : (
                <div className="mt-2 space-y-3">
                  {notices.slice(0, 6).map((n) => (
                    <div
                      key={n._id}
                      className="bg-white p-2 border border-slate-200 border-t-4 border-b-4 border-t-indigo-500 border-b-indigo-500 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black text-slate-900">{n.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(n.createdAt).toISOString().slice(0, 10)} • {n.grade}
                          </p>
                        </div>
                        <span className="inline-flex rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-extrabold">
                          NOTICE
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* CALENDAR + SPECIAL LINKS (3:2) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* LEFT 3/5 - CALENDAR */}
              <div className="lg:col-span-3">
                {monthLoading && (
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                    Loading month data...
                  </div>
                )}

                <AttendanceCalendar
                  year={calYear}
                  month={calMonth}
                  timetableDays={timetableDays}
                  attendanceMap={attendanceMap}
                  onPrev={prevMonth}
                  onNext={nextMonth}
                />
              </div>

              {/* RIGHT 2/5 - SPECIAL LINKS */}
              <div className="lg:col-span-2">
                <Card>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-lg text-slate-900">Special Links</h3>
                    <span className="text-xs font-bold text-slate-500">Quick Access</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <SpecialLink
                      title="LMS / Online Classes"
                      desc="Join online sessions and materials"
                      href="#"
                    />
                    <SpecialLink
                      title="Past Papers"
                      desc="Access grade-wise past papers"
                      href="#"
                    />
                    <SpecialLink
                      title="WhatsApp Group"
                      desc="Announcements and important updates"
                      href="#"
                    />
                    <SpecialLink
                      title="Institute Location"
                      desc="Find institute location quickly"
                      href="#"
                    />
                  </div>
                </Card>
              </div>

            </div>
          </main>

          {/* RIGHT */}
          <aside className="lg:col-span-3 space-y-6">
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900">Class Fees</h3>
                <span className="text-xs font-bold text-slate-500">{calYear}</span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b">
                      <th className="py-2 pr-1 font-semibold">Month</th>
                      <th className="py-2 pr-1 font-semibold">Status</th>
                      <th className="py-2 pr-1 font-semibold">Paid Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {feeYearRecords.map((r) => (
                      <tr key={r.month} className="border-b last:border-b-0">
                        <td className="py-2 pr-2 font-bold text-slate-900">
                          {monthLabel(r.month)}
                        </td>

                        <td className="py-2 pr-1">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-extrabold ${
                              r.status === "PAID"
                                ? "bg-emerald-50 text-emerald-700"
                                : r.status === "PENDING"
                                ? "bg-amber-50 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>

                        <td className="py-2 pr-1 font-semibold text-slate-700">
                          {r.paidDate ? r.paidDate : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  You can update your Name, Phone, and School.
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
                placeholder="Enter your name"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
                placeholder="07XXXXXXXX"
              />
              <p className="mt-1 text-xs text-slate-500">Example: 07XXXXXXXX</p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">School Name</label>
              <input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600"
                placeholder="Enter your school name"
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
                onClick={handleSaveProfile}
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

/* UI Helpers */
function Card({ children }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
      {children}
    </div>
  );
}

function SpecialLink({ title, desc, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 hover:bg-slate-100 transition"
    >
      <p className="text-sm font-extrabold text-slate-900">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </a>
  );
}

function Avatar({ initials }) {
  return (
    <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black">
      {initials}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-bold text-slate-500">{label}</span>
      <span className="text-sm font-extrabold text-slate-900 text-right break-all">
        {value}
      </span>
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
  return d.toISOString().slice(0, 10);
}
