export interface ContractInfo {
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  blockchain: string;
  taxes: {
    buy: number;
    sell: number;
    transfer: number;
  };
  ownerWallet: string;
  otherWallets?: string[];
  compilerVersion: string;
  auditDate: string;
}

export interface AuditDocument {
  executiveSummary: {
    overview: ContractInfo;
  };
  functionality: {
    standardFeatures: string[];
    reflectionMechanisms: string;
    feeStructure: string;
    taxes: string;
    liquidityManagement: string;
    ownershipControl: string;
    burnFunctionality: string;
    adminFunctions: string[];
    maxTransactionAmounts: string;
  };
  securityAnalysis: {
    ownershipControl: {
      risks: string[];
      recommendations: string[];
    };
    feeStructure: {
      issues: string[];
      impact: string;
      recommendations: string[];
    };
    reflectionMechanisms: {
      impact: string;
      recommendations: string[];
    };
    swapAndLiquidity: {
      issues: string[];
      impact: string;
      recommendations: string[];
    };
    reentrancyProtection: {
      observations: string[];
      assessment: string;
      recommendations: string[];
    };
  };
  potentialIssues: {
    centralizationRisks: string;
    highLaunchTax: string;
    sellFeeProportion: string;
    swapAndLiquifyFailures: string;
    feeFlexibility: string;
    burnFunctionality: string;
    limitedEventEmissions: string;
    launchTaxDuration: string;
  };
  ownerWallet: {
    projects: string[];
    tokenHoldings: string[];
    failedProjects: string[];
    ruggedProjects: string[];
    liquidityPulls: string[];
    redFlags: string[];
  };
  recommendations: string[];
  conclusion: string;
}