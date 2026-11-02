import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import StatusBadge from '../components/StatusBadge';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await adminApi.appointments({
          status: status || undefined,
        });
        if (!active) return;
        setAppointments(res.data || []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [status]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Appointments</h2>
          <p>Track booking activity across doctors and patients.</p>
        </div>
      </div>

      <div className="toolbar">
        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="booked">Booked</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No show</option>
        </select>
      </div>

      <section className="panel">
        <div className="panel-body">
          {loading ? <div className="loading">Loading appointments…</div> : null}
          {error ? <div className="error">{error}</div> : null}
          {!loading && !appointments.length ? (
            <div className="empty">No appointments found.</div>
          ) : null}

          {appointments.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Slot</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id}>
                      <td>#{a.id}</td>
                      <td>
                        <strong>{a.patient?.fullName}</strong>
                        <div style={{ color: 'var(--ink-soft)' }}>{a.patient?.phone}</div>
                      </td>
                      <td>
                        <strong>{a.doctorProfile?.user?.fullName}</strong>
                        <div style={{ color: 'var(--ink-soft)' }}>
                          {a.doctorProfile?.specialization?.name || '—'}
                        </div>
                      </td>
                      <td>
                        {a.slot?.startTime
                          ? new Date(a.slot.startTime).toLocaleString()
                          : '—'}
                      </td>
                      <td>
                        <StatusBadge value={a.status} />
                      </td>
                      <td>{a.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
