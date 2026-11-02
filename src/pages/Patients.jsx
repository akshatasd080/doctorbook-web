import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function load(search = q) {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.patients({ q: search || undefined });
      setPatients(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load('');
  }, []);

  async function toggleActive(patient) {
    setBusyId(patient.id);
    try {
      if (patient.isActive) {
        await adminApi.deactivateUser(patient.id);
      } else {
        await adminApi.activateUser(patient.id);
      }
      await load(q);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Patients</h2>
          <p>View registered patients and manage account access.</p>
        </div>
      </div>

      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          load(q);
        }}
      >
        <input
          className="input"
          placeholder="Search patients"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      <section className="panel">
        <div className="panel-body">
          {loading ? <div className="loading">Loading patients…</div> : null}
          {error ? <div className="error">{error}</div> : null}
          {!loading && !patients.length ? (
            <div className="empty">No patients found.</div>
          ) : null}

          {patients.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Gender</th>
                    <th>Blood group</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.fullName}</strong>
                      </td>
                      <td>
                        <div>{p.email}</div>
                        <div style={{ color: 'var(--ink-soft)' }}>{p.phone}</div>
                      </td>
                      <td>{p.patientProfile?.gender || '—'}</td>
                      <td>{p.patientProfile?.bloodGroup || '—'}</td>
                      <td>{p.isActive ? 'Active' : 'Inactive'}</td>
                      <td>
                        <button
                          className={`btn ${p.isActive ? 'btn-danger' : 'btn-ok'}`}
                          type="button"
                          disabled={busyId === p.id}
                          onClick={() => toggleActive(p)}
                        >
                          {p.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
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
