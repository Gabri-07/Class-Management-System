import { useEffect, useMemo, useState } from "react";
import {
  fetchTimetable,
  createTimetableRow,
  updateTimetableRow,
  deleteTimetableRow,
} from "../services/timetableApi";

export default function AdminTimetableEditor() {
  const GRADES = useMemo(
    () => ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"],
    []
  );

  const DAYS = useMemo(
    () => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    []
  );

  const TYPES = useMemo(() => ["Theory & Paper", "Theory", "Paper"], []);

  const GRADE_ORDER = useMemo(() => {
    const m = {};
    GRADES.forEach((g, idx) => (m[g] = idx));
    return m;
  }, [GRADES]);

  const DAY_ORDER = useMemo(() => {
    const m = {};
    DAYS.forEach((d, idx) => (m[d] = idx));
    return m;
  }, [DAYS]);

  const [rows, setRows] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const [form, setForm] = useState({
    grade: "Grade 6",
    day: "Thursday",
    time: "",
    classType: "Theory & Paper",
  });

  function timeToMinutes(t = "") {
    const start = t.split("–")[0]?.split("-")[0]?.trim() || "";
    const m = start.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (!m) return 999999;
    let hh = parseInt(m[1], 10);
    let mm = parseInt(m[2] || "0", 10);
    const ap = m[3].toUpperCase();
    if (ap === "PM" && hh !== 12) hh += 12;
    if (ap === "AM" && hh === 12) hh = 0;
    return hh * 60 + mm;
  }

  function sortRows(data) {
    return [...data].sort((a, b) => {
      const gA = GRADE_ORDER[a.grade] ?? 999;
      const gB = GRADE_ORDER[b.grade] ?? 999;
      if (gA !== gB) return gA - gB;

      const dA = DAY_ORDER[a.day] ?? 999;
      const dB = DAY_ORDER[b.day] ?? 999;
      if (dA !== dB) return dA - dB;

      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });
  }

  async function load() {
    const data = await fetchTimetable();
    setRows(sortRows(data));
  }

  useEffect(() => {
    load();
  }, []);

  async function addRow(e) {
    e.preventDefault();
    await createTimetableRow(form);
    setForm({ grade: "Grade 6", day: "Thursday", time: "", classType: "Theory & Paper" });
    load();
  }

  async function update(id, patch) {
    try {
      setBusyId(id);
      const row = rows.find((r) => r._id === id);
      if (!row) return;
      await updateTimetableRow(id, { ...row, ...patch });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id) {
    await deleteTimetableRow(id);
    load();
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    window.location.href = "/";
  }

  const inputClass =
    "w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-600";
  const selectClass =
    "w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-600 bg-white";
  const btnPrimary =
    "bg-indigo-600 text-white rounded-xl font-black text-sm px-4 py-2 hover:bg-indigo-700 active:scale-95 transition";
  const btnDanger =
    "bg-red-600 text-white rounded-xl font-black text-sm px-4 py-2 hover:bg-red-700 active:scale-95 transition";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 relative -mt-7">
      <h1 className="text-2xl md:text-3xl font-black text-indigo-700 tracking-tight">
        Class Timetable
      </h1><br/>

      {/* Add Row */}
      <form
        onSubmit={addRow}
        className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5"
      >
        <select
          className={selectClass}
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={form.day}
          onChange={(e) => setForm({ ...form, day: e.target.value })}
        >
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <input
          className={inputClass}
          placeholder="Time (e.g., 4:00 PM – 6:00 PM)"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          required
        />

        <select
          className={selectClass}
          value={form.classType}
          onChange={(e) => setForm({ ...form, classType: e.target.value })}
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button className={btnPrimary}>Add</button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-black uppercase tracking-wide text-xs">
                Grade
              </th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-wide text-xs">
                Day
              </th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-wide text-xs">
                Time
              </th>
              <th className="px-4 py-3 text-left font-black uppercase tracking-wide text-xs">
                Type
              </th>
              <th className="px-4 py-3 text-center font-black uppercase tracking-wide text-xs">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="px-4 py-3">
                  <select
                    className={selectClass}
                    value={r.grade}
                    disabled={busyId === r._id}
                    onChange={(e) => update(r._id, { grade: e.target.value })}
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-3">
                  <select
                    className={selectClass}
                    value={r.day}
                    disabled={busyId === r._id}
                    onChange={(e) => update(r._id, { day: e.target.value })}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-3">
                  <input
                    value={r.time}
                    disabled={busyId === r._id}
                    onChange={(e) => {
                      setRows((prev) =>
                        sortRows(
                          prev.map((x) =>
                            x._id === r._id ? { ...x, time: e.target.value } : x
                          )
                        )
                      );
                    }}
                    onBlur={(e) => update(r._id, { time: e.target.value })}
                    className={inputClass}
                  />
                </td>

                <td className="px-4 py-3">
                  <select
                    className={selectClass}
                    value={r.classType || "Theory & Paper"}
                    disabled={busyId === r._id}
                    onChange={(e) => update(r._id, { classType: e.target.value })}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-3 text-center">
                  <button onClick={() => remove(r._id)} className={btnDanger}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No timetable data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
