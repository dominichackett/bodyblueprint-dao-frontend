import { ethers } from 'ethers';

// ABI for the HealthDAOGovernance contract
export const HealthDAOGovernanceABI = [
  // View functions
  "function daoToken() view returns (address)",
  "function owner() view returns (address)",
  "function minTokensForMembership() view returns (uint256)",
  "function proposals(uint256) view returns (address proposer, string contentCID, uint256 totalVotes, bool approved, bool executed, uint256 price)",
  "function votes(uint256, address) view returns (uint256)",
  "function retrievalPrices(string) view returns (uint256)",
  "function proposalCount() view returns (uint256)",
  "function isMember(address) view returns (bool)",
  
  // State-changing functions
  "function createProposal(string memory contentCID, uint256 price) external",
  "function vote(uint256 proposalId, uint256 tokenAmount) external",
  "function setRetrievalPrice(uint256 proposalId) external",
  "function withdrawETH() external",
  
  // Events
  "event MemberStatus(address member, bool isMember)",
  "event ProposalCreated(uint256 proposalId, address proposer, string contentCID)",
  "event Voted(uint256 proposalId, address voter, uint256 tokenAmount)",
  "event ProposalApproved(uint256 proposalId)",
  "event RetrievalPriceSet(string contentCID, uint256 price)"
];

// Interface for the Proposal struct
export interface Proposal {
  proposer: string;
  contentCID: string;
  totalVotes: ethers.BigNumber;
  approved: boolean;
  executed: boolean;
  price: ethers.BigNumber;
}

// Class to interact with the HealthDAOGovernance contract
export class HealthDAOGovernance {
  private contract: ethers.Contract;
  
  constructor(contractAddress: string, provider: ethers.providers.Provider | ethers.Signer) {
    this.contract = new ethers.Contract(contractAddress, HealthDAOGovernanceABI, provider);
  }
  
  // Connect with a signer to enable state-changing operations
  connect(signer: ethers.Signer): HealthDAOGovernance {
    this.contract = this.contract.connect(signer);
    return this;
  }
  
  // View functions
  async getDaoToken(): Promise<string> {
    return await this.contract.daoToken();
  }
  
  async getOwner(): Promise<string> {
    return await this.contract.owner();
  }
  
  async getMinTokensForMembership(): Promise<ethers.BigNumber> {
    return await this.contract.minTokensForMembership();
  }
  
  async getProposal(proposalId: number): Promise<Proposal> {
    const proposal = await this.contract.proposals(proposalId);
    return {
      proposer: proposal[0],
      contentCID: proposal[1],
      totalVotes: proposal[2],
      approved: proposal[3],
      executed: proposal[4],
      price: proposal[5]
    };
  }
  
  async getVotes(proposalId: number, voter: string): Promise<ethers.BigNumber> {
    return await this.contract.votes(proposalId, voter);
  }
  
  async getRetrievalPrice(contentCID: string): Promise<ethers.BigNumber> {
    return await this.contract.retrievalPrices(contentCID);
  }
  
  async getProposalCount(): Promise<number> {
    const count = await this.contract.proposalCount();
    return count.toNumber();
  }
  
  async isMember(address: string): Promise<boolean> {
    return await this.contract.isMember(address);
  }
  
  // State-changing functions
  async createProposal(contentCID: string, price: ethers.BigNumber): Promise<ethers.ContractTransaction> {
    return await this.contract.createProposal(contentCID, price);
  }
  
  async vote(proposalId: number, tokenAmount: ethers.BigNumber): Promise<ethers.ContractTransaction> {
    return await this.contract.vote(proposalId, tokenAmount);
  }
  
  async setRetrievalPrice(proposalId: number): Promise<ethers.ContractTransaction> {
    return await this.contract.setRetrievalPrice(proposalId);
  }
}

// ERC20 Token ABI for the DAO token
export const ERC20ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

// Class to interact with the DAO token
export class DAOToken {
  private contract: ethers.Contract;
  
  constructor(tokenAddress: string, provider: ethers.providers.Provider | ethers.Signer) {
    this.contract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
  }
  
  // Connect with a signer to enable state-changing operations
  connect(signer: ethers.Signer): DAOToken {
    this.contract = this.contract.connect(signer);
    return this;
  }
  
  async balanceOf(address: string): Promise<ethers.BigNumber> {
    return await this.contract.balanceOf(address);
  }
  
  async decimals(): Promise<number> {
    return await this.contract.decimals();
  }
  
  async symbol(): Promise<string> {
    return await this.contract.symbol();
  }
  
  async transfer(to: string, amount: ethers.BigNumber): Promise<ethers.ContractTransaction> {
    return await this.contract.transfer(to, amount);
  }
  
  async approve(spender: string, amount: ethers.BigNumber): Promise<ethers.ContractTransaction> {
    return await this.contract.approve(spender, amount);
  }
  
  async allowance(owner: string, spender: string): Promise<ethers.BigNumber> {
    return await this.contract.allowance(owner, spender);
  }
}
