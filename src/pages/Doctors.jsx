import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import StatusBadge from '../components/StatusBadge';

export default function Doctors({ pendingOnly = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState(searchParams.get('q') || '');
  const status = pendingOnly ? 'pending' : searchParams.get('status') || '';

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = pendingOnly
          ? await adminApi.pendingDoctors()
          : await adminApi.doctors({
              status: status || undefined,
              q: searchParams.get('q') || undefined,
            });
        if (!active) return;
        setDoctors(res.data || []);
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
  }, [pendingOnly, status, searchParams]);

  function applyFilters(e) {
    e.preventDefault();
    const next = {};
    if (q.trim()) next.q = q.trim();
    if (!pendingOnly && status) next.status = status;
    setSearchParams(next);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{pendingOnly ? 'Pending doctor requests' : 'All doctors'}</h2>
          <p>
            {pendingOnly
              ? 'Review applications before they become visible to patients.'
              : 'Browse and filter every registered doctor on the platform.'}
          </p>
        </div>
      </div>

      {!pendingOnly ? (
        <form className="toolbar" onSubmit={applyFilters}>
          <input
            className="input"
            placeholder="Search name, email, phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="select"
            value={status}
            onChange={(e) => {
              const next = {};
              if (q.trim()) next.q = q.trim();
              if (e.target.value) next.status = e.target.value;
              setSearchParams(next);
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>
      ) : null}

      <section className="panel">
        <div className="panel-body">
          {loading ? <div className="loading">Loading doctors…</div> : null}
          {error ? <div className="error">{error}</div> : null}
          {!loading && !error && !doctors.length ? (
            <div className="empty">No doctors found.</div>
          ) : null}

          {!loading && !error && doctors.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <strong>{doc.user?.fullName}</strong>
                        <div style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
                          {doc.user?.email}
                        </div>
                      </td>
                      <td>{doc.specialization?.name || '—'}</td>
                      <td>
                        {doc.yearsOfExperience != null
                          ? `${doc.yearsOfExperience} yrs`
                          : '—'}
                      </td>
                      <td>
                        {doc.consultationFee != null
                          ? `₹${doc.consultationFee}`
                          : '—'}
                      </td>
                      <td>
                        <StatusBadge value={doc.approvalStatus} />
                      </td>
                      <td>
                        <Link className="btn btn-soft" to={`/doctors/${doc.id}`}>
                          Open
                        </Link>
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
