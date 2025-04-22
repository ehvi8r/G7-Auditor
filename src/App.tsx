import React, { useState } from 'react';
import { Search, Shield, FileCheck } from 'lucide-react';
import { BlockchainService } from './services/blockchain';
import { AuditGenerator } from './services/auditGenerator';
import { AuditReport } from './components/AuditReport';
import type { ContractInfo, AuditDocument } from './types/audit';

function App() {
  const [contractAddress, setContractAddress] = useState('');
  const [blockchain, setBlockchain] = useState('bsc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditDocument | null>(null);

  const blockchains = [
    { id: 'base', name: 'Base Chain' },
    { id: 'bsc', name: 'Binance Smart Chain' },
    { id: 'roburna', name: 'Roburna Chain' },
    { id: 'solana', name: 'Solana' }
  ];

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const contractInfo = await BlockchainService.getContractInfo(contractAddress, blockchain);
      const auditDoc = await AuditGenerator.generateAudit(contractInfo);
      setAuditResult(auditDoc);
    } catch (error) {
      console.error('Audit failed:', error);
      setError(error.message || 'Failed to generate audit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <Shield className="w-12 h-12 text-blue-400 mr-3" />
          <h1 className="text-4xl font-bold">G7Audit</h1>
        </div>

        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6 shadow-xl">
          <form onSubmit={handleAudit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Contract Address
              </label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Enter contract address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Blockchain
              </label>
              <select
                value={blockchain}
                onChange={(e) => setBlockchain(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                {blockchains.map(chain => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Auditing...</span>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Start Audit
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-100">
                {error}
              </div>
            )}
          </form>
        </div>

        {auditResult && (
          <div className="mt-8 max-w-4xl mx-auto">
            <AuditReport audit={auditResult} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;