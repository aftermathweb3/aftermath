'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

interface ConnectWalletProps {
  className?: string;
}

export default function ConnectWallet({ className = '' }: ConnectWalletProps) {
  return (
    <div className={`connect-wallet ${className}`}>
      <ConnectButton />
    </div>
  );
}
