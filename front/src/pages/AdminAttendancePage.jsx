import { useEffect, useState } from "react";
import api from "../services/api.js";
import { formatTimestamp, timestampToInput, todayIso } from "../utils/format.js";

function localInputToIso(value) {
  return value ? new Date(value).toISOString() : null;
}

export default function AdminAttendancePage() {
  const [date, setDate] = useState(todayIso());
  const [records, setRecords] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  async function loadRecords() {
    const { data } = await api.get("/admin/attendance", { params: { date } });
    setRecords(data.records);
  }

  useEffect(() => {
    let active = true;

    async function fetchRecords() {
      try {
        const { data } = await api.get("/admin/attendance", { params: { date } });

        if (active) {
          setRecords(data.records);
        }
      } catch (err) {
        if (active) {
          setMessage(err.response?.data?.message || err.message);
        }
      }
    }

    fetchRecords();

    return () => {
      active = false;
    };
  }, [date]);

  async function saveEdit(event) {
    event.preventDefault();
    setMessage("");

    try {
      await api.patch(`/admin/attendance/${editing.id}`, {
        punchIn: localInputToIso(editing.punchInInput),
        punchOut: localInputToIso(editing.punchOutInput),
      });
      setEditing(null);
      await loadRecords();
      setMessage("Attendance updated and daily summary recomputed.");
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Admin Attendance</h2>
          <p className="mt-1 text-slate-600">View employee punches and correct records when needed.</p>
        </div>
        <label className="text-sm font-medium text-slate-700">
          Date
          <input
            className="mt-1 block rounded-md border border-slate-300 px-3 py-2"
            onChange={(event) => setDate(event.target.value)}
            type="date"
            value={date}
          />
        </label>
      </div>

      {message && <p className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Punch In</th>
              <th className="px-4 py-3">Punch Out</th>
              <th className="px-4 py-3">Edited</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{record.employeeName || record.email}</td>
                <td className="px-4 py-3 text-slate-600">{record.date}</td>
                <td className="px-4 py-3 text-slate-600">{formatTimestamp(record.punchIn)}</td>
                <td className="px-4 py-3 text-slate-600">{formatTimestamp(record.punchOut)}</td>
                <td className="px-4 py-3 text-slate-600">{record.editedByAdmin ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <button
                    className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
                    onClick={() =>
                      setEditing({
                        ...record,
                        punchInInput: timestampToInput(record.punchIn),
                        punchOutInput: timestampToInput(record.punchOut),
                      })
                    }
                    type="button"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>No records for this date.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" onSubmit={saveEdit}>
          <h3 className="text-lg font-semibold text-slate-950">Edit {editing.employeeName || editing.email}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Punch In
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                onChange={(event) => setEditing({ ...editing, punchInInput: event.target.value })}
                required
                type="datetime-local"
                value={editing.punchInInput}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Punch Out
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                onChange={(event) => setEditing({ ...editing, punchOutInput: event.target.value })}
                required
                type="datetime-local"
                value={editing.punchOutInput}
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white" type="submit">
              Save
            </button>
            <button
              className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700"
              onClick={() => setEditing(null)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
