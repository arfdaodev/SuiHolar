import { useState } from 'react';
import { TrendingUp, Send, ArrowDownToLine, ArrowUpFromLine, Coins, Users, BarChart3 } from 'lucide-react';

interface TokenBalance {
  symbol: string;
  balance: number;
  usdValue: number;
  type: 'paper' | 'covax';
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'mint';
  amount: number;
  token: string;
  address: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

const mockBalances: TokenBalance[] = [
  { symbol: 'PAPER', balance: 1000000, usdValue: 15000, type: 'paper' },
  { symbol: 'COVAX', balance: 500000, usdValue: 7500, type: 'covax' },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'mint',
    amount: 1000000,
    token: 'PAPER',
    address: '0x1234...5678',
    timestamp: '2025-10-20T10:30:00Z',
    status: 'completed',
  },
  {
    id: '2',
    type: 'mint',
    amount: 500000,
    token: 'COVAX',
    address: '0x1234...5678',
    timestamp: '2025-10-20T10:31:00Z',
    status: 'completed',
  },
  {
    id: '3',
    type: 'send',
    amount: 10000,
    token: 'PAPER',
    address: '0x8765...4321',
    timestamp: '2025-10-21T14:15:00Z',
    status: 'completed',
  },
];

export function TokenManagement() {
  const [balances] = useState<TokenBalance[]>(mockBalances);
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [activeTab, setActiveTab] = useState<'overview' | 'transfer' | 'history'>('overview');
  const [transferForm, setTransferForm] = useState({
    token: 'PAPER',
    amount: '',
    recipient: '',
  });

  const totalValue = balances.reduce((sum, token) => sum + token.usdValue, 0);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Transfer:', transferForm);
    // TODO: Sui blockchain entegrasyonu
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpFromLine className="h-4 w-4 text-red-500" />;
      case 'receive':
        return <ArrowDownToLine className="h-4 w-4 text-green-500" />;
      case 'mint':
        return <Coins className="h-4 w-4 text-blue-500" />;
      default:
        return <Coins className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Token Yönetimi</h1>
        <p className="text-gray-600">
          PAPER ve COVAX tokenlarınızı yönetin, transfer edin ve işlem geçmişinizi görüntüleyin
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Toplam Değer</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">+12.5% bu ay</p>
        </div>

        {balances.map((token) => (
          <div key={token.symbol} className="card">
            <div className="flex items-center justify-between mb-4">
              <span className={`token-badge ${token.type === 'paper' ? 'token-badge-paper' : 'token-badge-covax'}`}>
                {token.symbol}
              </span>
              <Coins className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {token.balance.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ≈ ${token.usdValue.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Genel Bakış', icon: BarChart3 },
            { key: 'transfer', label: 'Transfer', icon: Send },
            { key: 'history', label: 'İşlem Geçmişi', icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Token Details */}
          <div className="space-y-6">
            {balances.map((token) => (
              <div key={token.symbol} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{token.symbol} Token</h3>
                  <span className={`token-badge ${token.type === 'paper' ? 'token-badge-paper' : 'token-badge-covax'}`}>
                    {token.symbol}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Bakiye</p>
                    <p className="text-xl font-bold text-gray-900">
                      {token.balance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">USD Değeri</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${token.usdValue.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="btn-primary flex-1 flex items-center justify-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Gönder</span>
                  </button>
                  <button className="btn-secondary flex-1 flex items-center justify-center space-x-2">
                    <ArrowDownToLine className="h-4 w-4" />
                    <span>Al</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Charts and Analytics */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Dağılımı</h3>
            <div className="space-y-4">
              {balances.map((token) => (
                <div key={token.symbol} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`token-badge ${token.type === 'paper' ? 'token-badge-paper' : 'token-badge-covax'}`}>
                      {token.symbol}
                    </span>
                    <span className="text-gray-900">{token.symbol}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {((token.usdValue / totalValue) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      ${token.usdValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transfer' && (
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Token Transfer</h3>
            
            <form onSubmit={handleTransfer} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Seçin
                </label>
                <select
                  value={transferForm.token}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, token: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PAPER">PAPER Token</option>
                  <option value="COVAX">COVAX Token</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miktar
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className={`token-badge ${transferForm.token === 'PAPER' ? 'token-badge-paper' : 'token-badge-covax'}`}>
                      {transferForm.token}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Kullanılabilir: {balances.find(b => b.symbol === transferForm.token)?.balance.toLocaleString() || 0} {transferForm.token}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alıcı Adresi
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={transferForm.recipient}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <div className="border-t pt-6">
                <button
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                  disabled={!transferForm.amount || !transferForm.recipient}
                >
                  <Send className="h-4 w-4" />
                  <span>Transfer Gönder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">İşlem Geçmişi</h3>
          
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(tx.type)}
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {tx.type === 'send' ? 'Gönderilen' : tx.type === 'receive' ? 'Alınan' : 'Basılan'} {tx.token}
                    </p>
                    <p className="text-sm text-gray-600">
                      {tx.type === 'send' ? 'Alıcı: ' : 'Gönderen: '}{tx.address}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'}`}>
                    {tx.type === 'send' ? '-' : '+'}{tx.amount.toLocaleString()} {tx.token}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tx.status === 'completed' ? 'Tamamlandı' : 
                     tx.status === 'pending' ? 'Beklemede' : 'Başarısız'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}