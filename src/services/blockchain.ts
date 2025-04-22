import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import { format } from 'date-fns';

export class BlockchainService {
  private static readonly EVM_CHAINS = {
    'base': 'https://mainnet.base.org',
    'bsc': 'https://bsc-dataseed.binance.org',
    'roburna': 'https://dataseed.roburna.com/',
  };

  private static readonly SOLANA_ENDPOINTS = [
    'https://solana.drpc.org',
    'https://rpc.ankr.com/solana',
    'https://api.tatum.io/v3/blockchain/node/solana-mainnet',
    'https://solana-mainnet.rpc.extrnode.com',
  ];

  static async getContractInfo(address: string, chain: string): Promise<any> {
    if (chain === 'solana') {
      return this.getSolanaContractInfo(address);
    } else {
      return this.getEVMContractInfo(address, chain);
    }
  }

  private static async getEVMContractInfo(address: string, chain: string): Promise<any> {
    const provider = new ethers.JsonRpcProvider(this.EVM_CHAINS[chain]);
    
    // Extended ABI to include more common token functions
    const abi = [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function totalSupply() view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function owner() view returns (address)',
      'function getOwner() view returns (address)',
      'function balanceOf(address) view returns (uint256)',
      'function _buyTaxRate() view returns (uint256)',
      'function _sellTaxRate() view returns (uint256)',
      'function _transferTaxRate() view returns (uint256)',
    ];

    try {
      const contract = new ethers.Contract(address, abi, provider);
      const bytecode = await provider.getCode(address);
      
      let owner;
      try {
        owner = await contract.owner();
      } catch {
        try {
          owner = await contract.getOwner();
        } catch {
          owner = 'Not found';
        }
      }

      let buyTax = 0, sellTax = 0, transferTax = 0;
      try {
        buyTax = await contract._buyTaxRate();
        sellTax = await contract._sellTaxRate();
        transferTax = await contract._transferTaxRate();
      } catch (e) {
        // Tax functions not found, continue without them
      }

      const [name, symbol, totalSupply, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply(),
        contract.decimals(),
      ]);

      return {
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        decimals,
        ownerWallet: owner,
        blockchain: chain,
        contractCode: bytecode,
        taxes: {
          buy: Number(buyTax) / 100,
          sell: Number(sellTax) / 100,
          transfer: Number(transferTax) / 100,
        },
        compilerVersion: this.extractCompilerVersion(bytecode),
        auditDate: format(new Date(), 'MMMM dd, yyyy'),
      };
    } catch (error) {
      console.error('Error fetching contract info:', error);
      throw new Error(`Failed to fetch contract information: ${error.message}`);
    }
  }

  private static async getSolanaContractInfo(address: string): Promise<any> {
    let lastError = null;
    
    // Try each endpoint until one works
    for (const endpoint of this.SOLANA_ENDPOINTS) {
      try {
        const connection = new Connection(endpoint, 'confirmed');
        const pubkey = new PublicKey(address);

        const [accountInfo, programData] = await Promise.all([
          connection.getAccountInfo(pubkey),
          connection.getParsedAccountInfo(pubkey),
        ]);

        if (!accountInfo) {
          throw new Error('Account not found');
        }

        // Try to get token information if it's an SPL token
        let tokenInfo = {
          name: 'Unknown Token',
          symbol: 'UNKNOWN',
          decimals: 9,
          totalSupply: '0',
        };

        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            pubkey,
            { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
          );
          
          if (tokenAccounts.value.length > 0) {
            const firstAccount = tokenAccounts.value[0].account.data.parsed.info;
            tokenInfo = {
              name: firstAccount.mint || 'Unknown Token',
              symbol: firstAccount.tokenSymbol || 'UNKNOWN',
              decimals: firstAccount.tokenDecimal || 9,
              totalSupply: firstAccount.tokenAmount?.uiAmount?.toString() || '0',
            };
          }
        } catch (e) {
          console.warn('Failed to fetch token info:', e);
        }

        return {
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          totalSupply: tokenInfo.totalSupply,
          decimals: tokenInfo.decimals,
          ownerWallet: pubkey.toString(),
          blockchain: 'solana',
          contractCode: accountInfo.data.toString(),
          taxes: { buy: 0, sell: 0, transfer: 0 },
          compilerVersion: 'Solana',
          auditDate: format(new Date(), 'MMMM dd, yyyy'),
        };
      } catch (error) {
        console.warn(`Failed to fetch from ${endpoint}:`, error);
        lastError = error;
        continue;
      }
    }

    throw new Error(`Failed to fetch Solana contract information: ${lastError?.message || 'All endpoints failed'}`);
  }

  private static extractCompilerVersion(bytecode: string): string {
    // This is a simplified version. In reality, you'd need to parse the bytecode metadata
    return '^0.8.19'; // Default for now
  }

  static async analyzeWallet(address: string, chain: string): Promise<any> {
    if (chain === 'solana') {
      return this.analyzeSolanaWallet(address);
    }
    return this.analyzeEVMWallet(address, chain);
  }

  private static async analyzeEVMWallet(address: string, chain: string): Promise<any> {
    const provider = new ethers.JsonRpcProvider(this.EVM_CHAINS[chain]);
    
    try {
      const balance = await provider.getBalance(address);
      const code = await provider.getCode(address);
      const txCount = await provider.getTransactionCount(address);

      return {
        balance: ethers.formatEther(balance),
        isContract: code !== '0x',
        transactionCount: txCount,
        projects: [],
        tokenHoldings: [],
        failedProjects: [],
        ruggedProjects: [],
        liquidityPulls: [],
        redFlags: [],
      };
    } catch (error) {
      console.error('Error analyzing EVM wallet:', error);
      throw error;
    }
  }

  private static async analyzeSolanaWallet(address: string): Promise<any> {
    let lastError = null;

    for (const endpoint of this.SOLANA_ENDPOINTS) {
      try {
        const connection = new Connection(endpoint, 'confirmed');
        const pubkey = new PublicKey(address);

        const [balance, transactions] = await Promise.all([
          connection.getBalance(pubkey),
          connection.getConfirmedSignaturesForAddress2(pubkey, { limit: 10 }),
        ]);

        return {
          balance: balance / 1e9,
          transactionCount: transactions.length,
          projects: [],
          tokenHoldings: [],
          failedProjects: [],
          ruggedProjects: [],
          liquidityPulls: [],
          redFlags: [],
        };
      } catch (error) {
        console.warn(`Failed to analyze wallet using ${endpoint}:`, error);
        lastError = error;
        continue;
      }
    }

    throw new Error(`Failed to analyze Solana wallet: ${lastError?.message || 'All endpoints failed'}`);
  }
}