'use client';

interface VerificationData {
  [key: string]: any;
}

interface OverviewProps {
  verificationData: VerificationData | null;
  onNavigateToVerify: () => void;
}

export default function Overview({ verificationData, onNavigateToVerify }: OverviewProps) {
  return (
    <div className="overview-container">
      <div className="overview-header">
        <h2>Your Inheritances</h2>
        <p>View and claim your inherited crypto assets</p>
      </div>
      
      <div className="overview-content">
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Inheritances Found</h3>
          <p>You don't have any inheritances to claim at this time.</p>
          <p>Inheritances will appear here once they are available.</p>
        </div>
      </div>
    </div>
  );
}
