import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          adminApi.stats(),
          adminApi.pendingDoctors(),
        ]);
        if (!active) return;
        setStats(statsRes.data);
        setPending(pendingRes.data || []);
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
  }, []);

  if (loading) return <div className="loading">Loading dashboard…</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Platform overview</h2>
          <p>Monitor registrations, approvals, and booking activity.</p>
        </div>
        <Link className="btn btn-soft" to="/doctors/pending">
          Review pending
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Total doctors" value={stats?.doctors?.total} />
        <StatCard label="Pending approvals" value={stats?.doctors?.pending} />
        <StatCard label="Patients" value={stats?.patients?.total} />
        <StatCard label="Appointments" value={stats?.appointments?.total} />
      </div>

      <div className="stats-grid">
        <StatCard label="Approved doctors" value={stats?.doctors?.approved} />
        <StatCard label="Rejected doctors" value={stats?.doctors?.rejected} />
        <StatCard label="Active users" value={stats?.users?.active} />
        <StatCard label="Inactive users" value={stats?.users?.inactive} />
      </div>

      <section className="panel">
        <div className="panel-body">
          <div className="page-header" style={{ marginBottom: 8 }}>
            <div>
              <h3>Latest pending doctor requests</h3>
              <p>Approve verified doctors to make them visible to patients.</p>
            </div>
          </div>

          {!pending.length ? (
            <div className="empty">No pending doctor requests.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pending.slice(0, 5).map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <strong>{doc.user?.fullName}</strong>
                        <div style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
                          {doc.user?.email}
                        </div>
                      </td>
                      <td>{doc.specialization?.name || '—'}</td>
                      <td>
                        {doc.submittedAt
                          ? new Date(doc.submittedAt).toLocaleString()
                          : 'Not submitted'}
                      </td>
                      <td>
                        <Link className="btn btn-soft" to={`/doctors/${doc.id}`}>
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
