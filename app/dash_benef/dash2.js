'use client';

import { useState, useEffect } from 'react';
import { useAccount, useDisconnect, useConnections } from 'wagmi';
import ConnectWallet from '../components/ConnectWallet';
import Overview from './Overview';
import VerifyPage from './VerifyPage';

export default function Dash2() {
  const [activeTab, setActiveTab] = useState('verify'); // Start with verify page
  const [isVerified, setIsVerified] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connections } = useConnections();

  const sidebarItems = [
    { id: 'verify', label: 'Verify Identity', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.59L18,9L10,17Z"/>
      </svg>
    )},
    { 
      id: 'overview', 
      label: 'Balance', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      ),
      disabled: !isVerified // Disable if not verified
    },
  ];

  const handleVerificationSuccess = (data) => {
    setIsVerified(true);
    setVerificationData(data);
    // Auto-redirect to balance page after successful verification
    setActiveTab('overview');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        if (!isVerified) {
          return (
            <div className="verification-required">
              <h2>🔒 Verification Required</h2>
              <p>Please verify your identity first to view your inheritances.</p>
              <button 
                onClick={() => setActiveTab('verify')}
                className="verify-button"
              >
                Verify Identity
              </button>
            </div>
          );
        }
        return <Overview 
          verificationData={verificationData}
          onNavigateToVerify={() => setActiveTab('verify')} 
        />;
      
      case 'verify':
        return <VerifyPage onVerificationSuccess={handleVerificationSuccess} />;
      
      default:
        return <VerifyPage onVerificationSuccess={handleVerificationSuccess} />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <a href="/" className="sidebar-title">
            <h2> Aftermath </h2>
            <p>Your Digital Legacy</p>
          </a>
        </div>
        
        <div className="dashboard-sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`dashboard-nav-item ${activeTab === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              onClick={() => {
                if (!item.disabled) {
                  console.log('Clicked:', item.label);
                  setActiveTab(item.id);
                }
              }}
              disabled={item.disabled}
              title={item.disabled ? 'Complete identity verification first' : ''}
            >
              <span className="dashboard-nav-icon">{item.icon}</span>
              <span className="dashboard-nav-label">
                {item.label}
                {item.disabled && <span style={{marginLeft: '8px'}}>🔒</span>}
              </span>
            </button>
          ))}
        </div>

        {/* Back to Portal Button */}
        <div className="sidebar-footer" style={{
          padding: '20px',
          borderTop: '1px solid #e0e0e0',
          marginTop: 'auto'
        }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #007bff',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: '#007bff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#007bff';
            }}
          >
            <span>←</span>
            Back to Portal
          </button>
        </div>
      </div>
      
      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="topbar-left">
            <h1 style={{
              margin: '25px',
              fontSize: '34px',
              fontWeight: '600',
              color: '#333'
            }}>
            </h1>
          </div>
          <div className="topbar-right">
            <div className="wallet-info">
              {isConnected ? (
                <div className="wallet-connected">
                  <div className="wallet-address">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
                  </div>
                  <button 
                    className="disconnect-btn" 
                    onClick={() => disconnect()}
                    style={{ marginLeft: '10px', padding: '6px' }}
                    title="Disconnect wallet"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 17v-3H9v-4h7V7l5 5-5 5zM14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <ConnectWallet className="connect-wallet-btn" />
              )}
            </div>
          </div>
        </div>
        
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>

      <style jsx>{`
        .dashboard-nav-item.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #f5f5f5;
        }
        
        .dashboard-nav-item.disabled:hover {
          background-color: #f5f5f5;
        }
        
        .verification-required {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          text-align: center;
          padding: 40px;
        }
        
        .verification-required h2 {
          color: #666;
          margin-bottom: 16px;
          font-size: 24px;
        }
        
        .verification-required p {
          color: #888;
          margin-bottom: 24px;
          font-size: 16px;
        }
        
        .verify-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .verify-button:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}