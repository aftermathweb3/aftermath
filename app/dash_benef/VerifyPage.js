'use client';

export default function VerifyPage({ onVerificationSuccess }) {
  return (
    <div className="verify-container">
      <div className="verify-header">
        <h2>Identity Verification</h2>
        <p>Verify your identity to access inherited assets</p>
      </div>
      
      <div className="verify-content">
        <div className="empty-state">
          <div className="empty-icon">🔐</div>
          <h3>Verification Coming Soon</h3>
          <p>Identity verification functionality will be implemented here.</p>
          <p>This will include document upload and verification processes.</p>
        </div>
      </div>
    </div>
  );
}
