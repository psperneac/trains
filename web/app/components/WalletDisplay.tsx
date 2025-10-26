import type { WalletDto } from '../types/player';

interface WalletDisplayProps {
  wallet?: WalletDto;
  showHidden?: boolean;
  className?: string;
}

export default function WalletDisplay({ 
  wallet, 
  showHidden = false, 
  className = "" 
}: WalletDisplayProps) {
  if (!wallet) {
    return (
      <span className={`text-gray-400 text-xs ${className}`}>
        {showHidden ? 'Hidden' : 'Not visible'}
      </span>
    );
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      <span className="text-purple-600 font-medium">
        {wallet.gems}💎
      </span>
        <span className="text-amber-600 font-medium">
          {wallet.gold}💰
        </span>
      <span className="text-blue-600 font-medium">
        {wallet.parts}⚙️
      </span>
    </div>
  );
}
