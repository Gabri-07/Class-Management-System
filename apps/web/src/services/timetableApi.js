import axios from "axios";

const API = "http://localhost:5000/api/timetable";

export async function fetchTimetable() {
  const res = await axios.get(API);
  return res.data;
}

export async function createTimetableRow(data) {
  const token = localStorage.getItem("accessToken");
  const res = await axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateTimetableRow(id, data) {
  const token = localStorage.getItem("accessToken");
  const res = await axios.put(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function deleteTimetableRow(id) {
  const token = localStorage.getItem("accessToken");
  const res = await axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
