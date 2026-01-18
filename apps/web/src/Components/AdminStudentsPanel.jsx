import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { adminFetchStudents } from "../services/adminStudentsApi";

const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
const STUDENT_API = "http://localhost:5000/api/students";

export default function AdminStudentsPanel() {
  const navigate = useNavigate();

  const YEARS = useMemo(() => {
    const y = new Date().getFullYear();
    return ["", ...Array.from({ length: 6 }, (_, i) => String(y - i))];
  }, []);

  // Search filters
  const [grade, setGrade] = useState("Grade 7");
  const [year, setYear] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [students, setStudents] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addErr, setAddErr] = useState("");
  const [addMsg, setAddMsg] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    studentId: "",
    classId: "",
    phone: "",
    schoolName: "",
  });


  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function load() {
    try {
      setErr("");
      setLoading(true);
      const list = await adminFetchStudents({ grade, year, q });
      setStudents(list);
    } catch {
      setErr("Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openAddModal() {
    setAddErr("");
    setAddMsg("");
    setForm({
      fullName: "",
      email: "",
      password: "",
      studentId: "",
      classId: "",
      phone: "",
      schoolName: "",
    });
    setOpenAdd(true);
  }


  async function createStudent(e) {
    e.preventDefault();
    setAddErr("");
    setAddMsg("");

    // basic validation
    if (!form.fullName || !form.email || !form.password || !form.studentId || !form.classId) {
      setAddErr("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");

      await axios.post(STUDENT_API, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAddMsg("Student created successfully ✅");
      // refresh list
      await load();

      // close after short success (or keep open)
      setTimeout(() => setOpenAdd(false), 600);
    } catch (e2) {
      setAddErr(e2?.response?.data?.message || "Failed to create student");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black text-indigo-700">Students</h2>
          <p className="text-slate-600 font-semibold mt-1">
            Search and view student dashboards by grade.
          </p>
        </div>

        {/* ✅ Add Student Button */}
        <button
          onClick={openAddModal}
          className="rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-black hover:bg-slate-800 active:scale-95 transition"
        >
          + Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6 items-end">
        <div>
          <label className="text-sm font-black text-slate-800">Grade</label>
          <select className={sel()} value={grade} onChange={(e) => setGrade(e.target.value)}>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-black text-slate-800">Registered Year (optional)</label>
          <select className={sel()} value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">All years</option>
            {YEARS.filter(Boolean).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-black text-slate-800">Search</label>
          <input
            className={inp()}
            placeholder="Search by name / email / studentId"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <button onClick={load} className={btnPrimary()}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 text-white grid grid-cols-5 px-4 py-3 text-sm font-black">
          <div>STUDENT</div>
          <div>EMAIL</div>
          <div>STUDENT ID</div>
          <div>GRADE</div>
          <div>ACTION</div>
        </div>

        <div className="bg-white">
          {err && <div className="p-6 text-center text-rose-600 font-black">{err}</div>}

          {!err && students.length === 0 && (
            <div className="p-6 text-center text-slate-500 font-bold">No students found.</div>
          )}

          {!err &&
            students.map((s) => (
              <div key={s._id} className="grid grid-cols-5 px-4 py-3 border-t text-sm items-center">
                <div className="font-black text-slate-900">{s.fullName}</div>
                <div className="font-semibold text-slate-700">{s.email}</div>
                <div className="font-semibold text-slate-700">{s.studentId}</div>
                <div className="font-bold text-slate-700">{s.classId}</div>
                <div>
                  <button
                    className="bg-slate-900 text-white rounded-xl px-4 py-2 text-xs font-black hover:bg-slate-800"
                    onClick={() => navigate(`/admin/students/${s._id}`)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ✅ Add Student Modal */}
      {openAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">Add Student</h3>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  Fill details and create a new student account.
                </p>
              </div>

              <button
                onClick={() => setOpenAdd(false)}
                className="rounded-xl bg-slate-100 px-3 py-2 font-black hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={createStudent} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Full Name *">
                <input className={inp()} value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} />
              </Field>

              <Field label="Student ID *">
                <input className={inp()} value={form.studentId} onChange={(e) => setField("studentId", e.target.value)} />
              </Field>

              <Field label="Email *">
                <input className={inp()} value={form.email} onChange={(e) => setField("email", e.target.value)} />
              </Field>

              <Field label="Password *">
                <input type="password" className={inp()} value={form.password} onChange={(e) => setField("password", e.target.value)} />
              </Field>

              <Field label="Class *">
                <input className={inp()} value={form.classId} onChange={(e) => setField("classId", e.target.value)} />
              </Field>


              <Field label="Phone (optional)">
                <input className={inp()} value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
              </Field>

              <div className="md:col-span-2">
                <Field label="School Name (optional)">
                  <input className={inp()} value={form.schoolName} onChange={(e) => setField("schoolName", e.target.value)} />
                </Field>
              </div>

              <div className="md:col-span-2">
                <button
                  disabled={saving}
                  className="w-full rounded-xl bg-indigo-600 text-white py-3 font-black hover:bg-indigo-700 disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Create Student"}
                </button>
              </div>

              {addErr && <div className="md:col-span-2 text-rose-600 font-black text-sm">{addErr}</div>}
              {addMsg && <div className="md:col-span-2 text-emerald-700 font-black text-sm">{addMsg}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-black text-slate-800">{label}</div>
      {children}
    </label>
  );
}

function inp() {
  return "w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-600";
}
function sel() {
  return "w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-600 bg-white";
}
function btnPrimary() {
  return "w-full rounded-xl bg-indigo-600 text-white px-4 py-3 text-sm font-black hover:bg-indigo-700";
}
