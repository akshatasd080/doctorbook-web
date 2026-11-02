import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { fileUrl } from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.doctor(id);
      setDoctor(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function approve() {
    setBusy(true);
    setActionError('');
    try {
      const res = await adminApi.approveDoctor(id);
      setDoctor(res.data);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    if (!reason.trim()) {
      setActionError('Rejection reason is required');
      return;
    }
    setBusy(true);
    setActionError('');
    try {
      const res = await adminApi.rejectDoctor(id, reason.trim());
      setDoctor(res.data);
      setShowReject(false);
      setReason('');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="loading">Loading doctor…</div>;
  if (error) return <div className="error">{error}</div>;
  if (!doctor) return <div className="empty">Doctor not found.</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{doctor.user?.fullName}</h2>
          <p>
            {doctor.user?.email} · {doctor.user?.phone}
          </p>
        </div>
        <div className="actions">
          <button className="btn btn-soft" type="button" onClick={() => navigate(-1)}>
            Back
          </button>
          {doctor.approvalStatus !== 'approved' ? (
            <button
              className="btn btn-ok"
              type="button"
              disabled={busy}
              onClick={approve}
            >
              Approve
            </button>
          ) : null}
          {doctor.approvalStatus !== 'rejected' ? (
            <button
              className="btn btn-danger"
              type="button"
              disabled={busy}
              onClick={() => setShowReject(true)}
            >
              Reject
            </button>
          ) : null}
        </div>
      </div>

      {actionError ? <div className="error">{actionError}</div> : null}

      <div className="detail-grid">
        <section className="panel">
          <div className="panel-body">
            <h3 style={{ marginBottom: 14 }}>Professional details</h3>
            <div className="meta-list">
              <div className="meta-item">
                <span>Status</span>
                <strong>
                  <StatusBadge value={doctor.approvalStatus} />
                </strong>
              </div>
              <div className="meta-item">
                <span>Specialization</span>
                <strong>{doctor.specialization?.name || '—'}</strong>
              </div>
              <div className="meta-item">
                <span>Registration number</span>
                <strong>{doctor.medicalRegistrationNumber || '—'}</strong>
              </div>
              <div className="meta-item">
                <span>Qualifications</span>
                <strong>{doctor.qualifications || '—'}</strong>
              </div>
              <div className="meta-item">
                <span>Experience</span>
                <strong>
                  {doctor.yearsOfExperience != null
                    ? `${doctor.yearsOfExperience} years`
                    : '—'}
                </strong>
              </div>
              <div className="meta-item">
                <span>Consultation fee</span>
                <strong>
                  {doctor.consultationFee != null
                    ? `₹${doctor.consultationFee}`
                    : '—'}
                </strong>
              </div>
              <div className="meta-item">
                <span>Hospital / clinic</span>
                <strong>{doctor.hospitalClinicName || '—'}</strong>
              </div>
              <div className="meta-item">
                <span>Address</span>
                <strong>{doctor.hospitalClinicAddress || '—'}</strong>
              </div>
              <div className="meta-item">
                <span>Bio</span>
                <strong>{doctor.bio || '—'}</strong>
              </div>
              {doctor.rejectionReason ? (
                <div className="meta-item">
                  <span>Rejection reason</span>
                  <strong>{doctor.rejectionReason}</strong>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-body">
            <h3 style={{ marginBottom: 14 }}>Verification documents</h3>
            {!doctor.documents?.length ? (
              <div className="empty">No documents uploaded.</div>
            ) : (
              <div className="doc-list">
                {doctor.documents.map((doc) => (
                  <div className="doc-card" key={doc.id}>
                    <div>
                      <strong>{doc.documentType}</strong>
                      <div style={{ color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
                        {doc.originalName || doc.filePath}
                      </div>
                    </div>
                    <a
                      className="btn btn-soft"
                      href={fileUrl(doc.filePath)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <Link className="btn btn-soft" to="/doctors/pending">
                Back to pending queue
              </Link>
            </div>
          </div>
        </section>
      </div>

      {showReject ? (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Reject application</h3>
            <p>Provide a clear reason. The doctor will remain hidden from patients.</p>
            <textarea
              className="textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Incomplete documents / invalid registration..."
            />
            <div className="modal-actions">
              <button
                className="btn btn-soft"
                type="button"
                onClick={() => setShowReject(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                type="button"
                disabled={busy}
                onClick={reject}
              >
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
