'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function ConnectWallet({ className = '' }) {
  return (
    <div className={`connect-wallet ${className}`}>
      <ConnectButton />
    </div>
  );
}
