import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AuditDocument } from '../types/audit';
import { FileCheck, AlertTriangle, Shield, Activity } from 'lucide-react';

interface AuditReportProps {
  audit: AuditDocument;
}

export function AuditReport({ audit }: AuditReportProps) {
  const formatDate = (date: string) => date;

  const generateMarkdown = () => {
    return `
# Smart Contract Audit Report
## ${audit.executiveSummary.overview.name} (${audit.executiveSummary.overview.symbol})

### Executive Summary
- **Contract Name:** ${audit.executiveSummary.overview.name}
- **Token Symbol:** ${audit.executiveSummary.overview.symbol}
- **Total Supply:** ${audit.executiveSummary.overview.totalSupply}
- **Decimals:** ${audit.executiveSummary.overview.decimals}
- **Blockchain:** ${audit.executiveSummary.overview.blockchain}
- **Compiler Version:** ${audit.executiveSummary.overview.compilerVersion}
- **Audit Date:** ${audit.executiveSummary.overview.auditDate}

### Functionality Analysis
${audit.functionality.standardFeatures.map(feature => `- ${feature}`).join('\n')}

#### Reflection Mechanisms
${audit.functionality.reflectionMechanisms}

#### Fee Structure
${audit.functionality.feeStructure}

#### Taxes
${audit.functionality.taxes}

#### Liquidity Management
${audit.functionality.liquidityManagement}

#### Ownership Control
${audit.functionality.ownershipControl}

### Security Analysis
#### Ownership Control and Centralization
${audit.securityAnalysis.ownershipControl.risks.map(risk => `- Risk: ${risk}`).join('\n')}
${audit.securityAnalysis.ownershipControl.recommendations.map(rec => `- Recommendation: ${rec}`).join('\n')}

#### Fee Structure Analysis
${audit.securityAnalysis.feeStructure.issues.map(issue => `- Issue: ${issue}`).join('\n')}
Impact: ${audit.securityAnalysis.feeStructure.impact}
${audit.securityAnalysis.feeStructure.recommendations.map(rec => `- Recommendation: ${rec}`).join('\n')}

### Potential Issues and Vulnerabilities
- Centralization Risks: ${audit.potentialIssues.centralizationRisks}
- High Launch Tax: ${audit.potentialIssues.highLaunchTax}
- Sell Fee Proportion: ${audit.potentialIssues.sellFeeProportion}
- Swap and Liquify Failures: ${audit.potentialIssues.swapAndLiquifyFailures}
- Fee Flexibility: ${audit.potentialIssues.feeFlexibility}
- Burn Functionality: ${audit.potentialIssues.burnFunctionality}
- Limited Event Emissions: ${audit.potentialIssues.limitedEventEmissions}
- Launch Tax Duration: ${audit.potentialIssues.launchTaxDuration}

### Owner Wallet Analysis
- Projects: ${audit.ownerWallet.projects.length > 0 ? audit.ownerWallet.projects.join(', ') : 'None found'}
- Token Holdings: ${audit.ownerWallet.tokenHoldings.length > 0 ? audit.ownerWallet.tokenHoldings.join(', ') : 'None found'}
- Failed Projects: ${audit.ownerWallet.failedProjects.length > 0 ? audit.ownerWallet.failedProjects.join(', ') : 'None found'}
- Rugged Projects: ${audit.ownerWallet.ruggedProjects.length > 0 ? audit.ownerWallet.ruggedProjects.join(', ') : 'None found'}
- Liquidity Pulls: ${audit.ownerWallet.liquidityPulls.length > 0 ? audit.ownerWallet.liquidityPulls.join(', ') : 'None found'}
${audit.ownerWallet.redFlags.length > 0 ? '### Red Flags\n' + audit.ownerWallet.redFlags.map(flag => `- ${flag}`).join('\n') : ''}

### Recommendations
${audit.recommendations.map(rec => `- ${rec}`).join('\n')}

### Conclusion
${audit.conclusion}

---
**Disclaimer:** This audit is automated with the G7 Audit dApp, and is based on the provided contract address. It does not account for external factors or subsequent changes. It is recommended to engage with a professional smart contract auditor for an exhaustive review before making any investment decisions.
`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown>{generateMarkdown()}</ReactMarkdown>
      </div>
    </div>
  );
}