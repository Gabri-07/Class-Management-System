import axios from "axios";

const API = "http://localhost:5000/api/admin/students";

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
}

function throwNice(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  console.error("❌ API ERROR:", status, data || err.message);
  throw err;
}

export async function adminFetchStudents({ grade = "", q = "", year = "" }) {
  try {
    const res = await axios.get(`${API}`, {
      headers: authHeaders(),
      params: { grade, q, year },
    });
    return res.data?.students || [];
  } catch (e) {
    throwNice(e);
  }
}

export async function adminFetchStudentDashboard(studentUserId, { year, month }) {
  try {
    const res = await axios.get(`${API}/${studentUserId}/dashboard`, {
      headers: authHeaders(),
      params: { year, month },
    });
    return res.data;
  } catch (e) {
    throwNice(e);
  }
}

export async function adminUpdateStudentProfile(studentUserId, payload) {
  try {
    const res = await axios.put(`${API}/${studentUserId}/profile`, payload, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (e) {
    throwNice(e);
  }
}

// Attendance
export async function adminUpsertAttendance(studentUserId, payload) {
  try {
    const res = await axios.post(`${API}/${studentUserId}/attendance`, payload, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (e) {
    throwNice(e);
  }
}

export async function adminDeleteAttendance(studentUserId, date) {
  try {
    const res = await axios.delete(`${API}/${studentUserId}/attendance`, {
      headers: authHeaders(),
      params: { date },
    });
    return res.data;
  } catch (e) {
    throwNice(e);
  }
}

// Fees
export async function adminUpsertFee(studentUserId, payload) {
  try {
    const res = await axios.post(`${API}/${studentUserId}/fees`, payload, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (e) {
    throwNice(e);
  }
}

export async function adminDeleteFee(studentUserId, month) {
  try {
    const res = await axios.delete(`${API}/${studentUserId}/fees`, {
      headers: authHeaders(),
      params: { month },
    });
    return res.data;
  } catch (e) {
    throwNice(e);
  }
}

// Marks
export async function adminUpsertMark(studentUserId, payload) {
  try {
    const res = await axios.post(`${API}/${studentUserId}/marks`, payload, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (e) {
    throwNice(e);
  }
}

export async function adminDeleteMark(markId) {
  try {
    const res = await axios.delete(`${API}/marks/${markId}`, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (e) {
    throwNice(e);
  }
}

// Notices
export async function adminCreateNotice(payload) {
  try {
    const res = await axios.post(`${API}/notices`, payload, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (e) {
    throwNice(e);
  }
}

export async function adminDeleteNotice(noticeId) {
  try {
    const res = await axios.delete(`${API}/notices/${noticeId}`, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (e) {
    throwNice(e);
  }
}
