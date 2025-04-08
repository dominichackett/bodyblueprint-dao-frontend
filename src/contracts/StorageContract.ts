import { ethers } from 'ethers';

// ABI for the HealthDAOStorage1 contract
export const HealthDAOStorageABI = [
  // View functions
  "function governance() view returns (address)",
  "function storageContract() view returns (address)",
  "function daoToken() view returns (address)",
  "function subscriptionFee() view returns (uint256)",
  "function subscriptionDuration() view returns (uint256)",
  "function subscriptions(address) view returns (uint256)",
  "function storedContent(string) view returns (bool)",
  "function memberUpdates(address, uint256) view returns (string)",
  "function contentTips(string) view returns (uint256)",
  "function contentRecommendations(string) view returns (uint256)",
  "function contentOwners(string) view returns (address)",
  "function allContentCIDs(uint256) view returns (string)",
  "function memberBuckets(address) view returns (bytes32)",
  "function isSubscribed(address) view returns (bool)",
  "function getMemberUpdates(address) view returns (string[])",
  "function getTopRecommendedContent(uint256) view returns (string[], uint256[])",
  "function getTopTippedContent(uint256) view returns (string[], uint256[])",
  "function getContentCount() view returns (uint256)",
  
  // State-changing functions
  "function subscribe() external",
  "function renewSubscription() external",
  "function proposeContent(string memory contentCID, uint256 price) external",
  "function storeContent(uint256 proposalId, string memory contentCID, uint256 encodedSize, bytes[] memory chunkCIDs, uint256[] memory chunkSizes) external",
  "function postUpdate(string memory contentCID) external",
  "function retrieveData(string memory contentCID) external",
  "function tipContent(string memory contentCID, uint256 amount) external",
  "function recommendContent(string memory contentCID) external",
  "function withdrawTips(string memory contentCID) external",
  
  // Events
  "event ContentProposed(string contentCID, address indexed proposer)",
  "event ContentStored(string contentCID, bytes32 indexed fileId)",
  "event MemberUpdatePosted(address indexed member, string contentCID, bytes32 indexed fileId)",
  "event DataRetrieved(string contentCID, address indexed retriever)",
  "event ContentTipped(string contentCID, address indexed tipper, uint256 amount)",
  "event ContentRecommended(string contentCID, address indexed recommender)",
  "event Subscribed(address indexed subscriber, uint256 expiration)",
  "event SubscriptionRenewed(address indexed subscriber, uint256 expiration)"
];

// Types for function returns
export interface ContentInfo {
  contentCID: string;
  value: ethers.BigNumber;
}

export interface MemberUpdate {
  contentCID: string;
  timestamp: ethers.BigNumber;
}

// Class to interact with the HealthDAOStorage1 contract
export class HealthDAOStorage {
  private contract: ethers.Contract;
  
  /**
   * Creates a new HealthDAOStorage instance
   * @param contractAddress The address of the HealthDAOStorage1 contract
   * @param provider An ethers provider or signer
   */
  constructor(contractAddress: string, provider: ethers.providers.Provider | ethers.Signer) {
    this.contract = new ethers.Contract(contractAddress, HealthDAOStorageABI, provider);
  }
  
  /**
   * Connect with a signer to enable state-changing operations
   * @param signer The ethers signer
   * @returns A new HealthDAOStorage instance connected with the signer
   */
  connect(signer: ethers.Signer): HealthDAOStorage {
    this.contract = this.contract.connect(signer);
    return this;
  }
  
  // VIEW FUNCTIONS
  
  /**
   * Gets the address of the governance contract
   * @returns The governance contract address
   */
  async getGovernanceAddress(): Promise<string> {
    return await this.contract.governance();
  }
  
  /**
   * Gets the address of the storage contract
   * @returns The storage contract address
   */
  async getStorageContractAddress(): Promise<string> {
    return await this.contract.storageContract();
  }
  
  /**
   * Gets the address of the DAO token
   * @returns The DAO token address
   */
  async getDaoTokenAddress(): Promise<string> {
    return await this.contract.daoToken();
  }
  
  /**
   * Gets the subscription fee in HDT
   * @returns The subscription fee
   */
  async getSubscriptionFee(): Promise<ethers.BigNumber> {
    return await this.contract.subscriptionFee();
  }
  
  /**
   * Gets the subscription duration in seconds
   * @returns The subscription duration
   */
  async getSubscriptionDuration(): Promise<ethers.BigNumber> {
    return await this.contract.subscriptionDuration();
  }
  
  /**
   * Gets a user's subscription expiration timestamp
   * @param userAddress The user's address
   * @returns The subscription expiration timestamp
   */
  async getSubscriptionExpiration(userAddress: string): Promise<ethers.BigNumber> {
    return await this.contract.subscriptions(userAddress);
  }
  
  /**
   * Checks if content is stored
   * @param contentCID The IPFS CID of the content
   * @returns True if the content is stored
   */
  async isContentStored(contentCID: string): Promise<boolean> {
    return await this.contract.storedContent(contentCID);
  }
  
  /**
   * Gets the amount of tips for a piece of content
   * @param contentCID The IPFS CID of the content
   * @returns The amount of tips in HDT
   */
  async getContentTips(contentCID: string): Promise<ethers.BigNumber> {
    return await this.contract.contentTips(contentCID);
  }
  
  /**
   * Gets the number of recommendations for a piece of content
   * @param contentCID The IPFS CID of the content
   * @returns The number of recommendations
   */
  async getContentRecommendations(contentCID: string): Promise<ethers.BigNumber> {
    return await this.contract.contentRecommendations(contentCID);
  }
  
  /**
   * Gets the owner of a piece of content
   * @param contentCID The IPFS CID of the content
   * @returns The address of the content owner
   */
  async getContentOwner(contentCID: string): Promise<string> {
    return await this.contract.contentOwners(contentCID);
  }
  
  /**
   * Gets a content CID by index
   * @param index The index
   * @returns The content CID
   */
  async getContentCIDByIndex(index: number): Promise<string> {
    return await this.contract.allContentCIDs(index);
  }
  
  /**
   * Gets a member's bucket ID
   * @param memberAddress The member's address
   * @returns The bucket ID
   */
  async getMemberBucket(memberAddress: string): Promise<string> {
    return await this.contract.memberBuckets(memberAddress);
  }
  
  /**
   * Checks if a user's subscription is active
   * @param userAddress The user's address
   * @returns True if the subscription is active
   */
  async isUserSubscribed(userAddress: string): Promise<boolean> {
    return await this.contract.isSubscribed(userAddress);
  }
  
  /**
   * Gets all updates posted by a member
   * @param memberAddress The member's address
   * @returns Array of content CIDs
   */
  async getAllMemberUpdates(memberAddress: string): Promise<string[]> {
    return await this.contract.getMemberUpdates(memberAddress);
  }
  
  /**
   * Gets the top recommended content
   * @param count Number of items to retrieve
   * @returns Arrays of content CIDs and their recommendation counts
   */
  async getTopRecommended(count: number): Promise<{cids: string[], counts: ethers.BigNumber[]}> {
    const result = await this.contract.getTopRecommendedContent(count);
    return {
      cids: result[0],
      counts: result[1]
    };
  }
  
  /**
   * Gets the top tipped content
   * @param count Number of items to retrieve
   * @returns Arrays of content CIDs and their tip amounts
   */
  async getTopTipped(count: number): Promise<{cids: string[], amounts: ethers.BigNumber[]}> {
    const result = await this.contract.getTopTippedContent(count);
    return {
      cids: result[0],
      amounts: result[1]
    };
  }
  
  /**
   * Gets the total count of content items
   * @returns The content count
   */
  async getContentCount(): Promise<number> {
    const count = await this.contract.getContentCount();
    return count.toNumber();
  }
  
  // STATE-CHANGING FUNCTIONS
  
  /**
   * Subscribes to the HealthDAO
   * @returns The transaction
   */
  async subscribe(): Promise<ethers.ContractTransaction> {
    return await this.contract.subscribe();
  }
  
  /**
   * Renews an existing subscription
   * @returns The transaction
   */
  async renewSubscription(): Promise<ethers.ContractTransaction> {
    return await this.contract.renewSubscription();
  }
  
  /**
   * Proposes new content for the DAO
   * @param contentCID The IPFS CID of the content
   * @param price The proposed retrieval price in HDT
   * @returns The transaction
   */
  async proposeContent(contentCID: string, price: ethers.BigNumber): Promise<ethers.ContractTransaction> {
    return await this.contract.proposeContent(contentCID, price);
  }
  
  /**
   * Stores approved content in the DAO
   * @param proposalId The proposal ID
   * @param contentCID The IPFS CID of the content
   * @param encodedSize The total size of the content in bytes
   * @param chunkCIDs Array of chunk CIDs
   * @param chunkSizes Array of chunk sizes
   * @returns The transaction
   */
  async storeContent(
    proposalId: number, 
    contentCID: string, 
    encodedSize: ethers.BigNumber,
    chunkCIDs: string[], 
    chunkSizes: ethers.BigNumber[]
  ): Promise<ethers.ContractTransaction> {
    return await this.contract.storeContent(
      proposalId,
      contentCID,
      encodedSize,
      chunkCIDs,
      chunkSizes
    );
  }
  
  /**
   * Posts a member update
   * @param contentCID The IPFS CID of the update
   * @returns The transaction
   */
  async postUpdate(contentCID: string): Promise<ethers.ContractTransaction> {
    return await this.contract.postUpdate(contentCID);
  }
  
  /**
   * Retrieves data from the DAO
   * @param contentCID The IPFS CID of the content
   * @returns The transaction
   */
  async retrieveData(contentCID: string): Promise<ethers.ContractTransaction> {
    return await this.contract.retrieveData(contentCID);
  }
  
  /**
   * Tips a content creator
   * @param contentCID The IPFS CID of the content
   * @param amount The tip amount in HDT
   * @returns The transaction
   */
  async tipContent(contentCID: string, amount: ethers.BigNumber): Promise<ethers.ContractTransaction> {
    return await this.contract.tipContent(contentCID, amount);
  }
  
  /**
   * Recommends a piece of content
   * @param contentCID The IPFS CID of the content
   * @returns The transaction
   */
  async recommendContent(contentCID: string): Promise<ethers.ContractTransaction> {
    return await this.contract.recommendContent(contentCID);
  }
  
  /**
   * Withdraws tips for a piece of content
   * @param contentCID The IPFS CID of the content
   * @returns The transaction
   */
  async withdrawTips(contentCID: string): Promise<ethers.ContractTransaction> {
    return await this.contract.withdrawTips(contentCID);
  }
  
  // EVENT LISTENERS
  
  /**
   * Sets up an event listener for the ContentProposed event
   * @param callback The callback function
   * @returns An event filter
   */
  onContentProposed(callback: (contentCID: string, proposer: string, event: ethers.Event) => void): ethers.providers.EventFilter {
    const filter = this.contract.filters.ContentProposed();
    this.contract.on(filter, (contentCID, proposer, event) => {
      callback(contentCID, proposer, event);
    });
    return filter;
  }
  
  /**
   * Sets up an event listener for the ContentStored event
   * @param callback The callback function
   * @returns An event filter
   */
  onContentStored(callback: (contentCID: string, fileId: string, event: ethers.Event) => void): ethers.providers.EventFilter {
    const filter = this.contract.filters.ContentStored();
    this.contract.on(filter, (contentCID, fileId, event) => {
      callback(contentCID, fileId, event);
    });
    return filter;
  }
  
  /**
   * Sets up an event listener for the MemberUpdatePosted event
   * @param callback The callback function
   * @returns An event filter
   */
  onMemberUpdatePosted(callback: (member: string, contentCID: string, fileId: string, event: ethers.Event) => void): ethers.providers.EventFilter {
    const filter = this.contract.filters.MemberUpdatePosted();
    this.contract.on(filter, (member, contentCID, fileId, event) => {
      callback(member, contentCID, fileId, event);
    });
    return filter;
  }
  
  /**
   * Sets up an event listener for the ContentTipped event
   * @param callback The callback function
   * @returns An event filter
   */
  onContentTipped(callback: (contentCID: string, tipper: string, amount: ethers.BigNumber, event: ethers.Event) => void): ethers.providers.EventFilter {
    const filter = this.contract.filters.ContentTipped();
    this.contract.on(filter, (contentCID, tipper, amount, event) => {
      callback(contentCID, tipper, amount, event);
    });
    return filter;
  }
  
  /**
   * Removes an event listener
   * @param filter The event filter to remove
   */
  removeListener(filter: ethers.providers.EventFilter): void {
    this.contract.removeAllListeners(filter);
  }
}

// Interface ABI for the IStorage contract used by HealthDAOStorage1
export const IStorageABI = [
  "function createBucket(string memory name) external returns (bytes32)",
  "function createFile(bytes32 bucketId, string memory name) external returns (bytes32)",
  "function addFileChunk(bytes memory chunk, bytes32 bucketId, string memory fileName, uint256 chunkSize, bytes32[] memory subchunks, uint256[] memory subchunkSizes, uint256 index) external",
  "function commitFile(bytes32 bucketId, string memory fileName, uint256 fileSize, bytes memory metadata) external"
];

// Class to interact with the IStorage contract
export class Storage {
  private contract: ethers.Contract;
  
  constructor(contractAddress: string, provider: ethers.providers.Provider | ethers.Signer) {
    this.contract = new ethers.Contract(contractAddress, IStorageABI, provider);
  }
  
  connect(signer: ethers.Signer): Storage {
    this.contract = this.contract.connect(signer);
    return this;
  }
  
  async createBucket(name: string): Promise<string> {
    return await this.contract.createBucket(name);
  }
  
  async createFile(bucketId: string, name: string): Promise<string> {
    return await this.contract.createFile(bucketId, name);
  }
  
  async addFileChunk(
    chunk: Uint8Array | string,
    bucketId: string,
    fileName: string,
    chunkSize: ethers.BigNumber,
    subchunks: string[],
    subchunkSizes: ethers.BigNumber[],
    index: number
  ): Promise<ethers.ContractTransaction> {
    return await this.contract.addFileChunk(
      chunk,
      bucketId,
      fileName,
      chunkSize,
      subchunks,
      subchunkSizes,
      index
    );
  }
  
  async commitFile(
    bucketId: string,
    fileName: string,
    fileSize: ethers.BigNumber,
    metadata: Uint8Array | string
  ): Promise<ethers.ContractTransaction> {
    return await this.contract.commitFile(
      bucketId,
      fileName,
      fileSize,
      metadata
    );
  }
}

// Usage example:
/*
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const storageAddress = "0x..."; // Storage contract address
const healthDAOStorageAddress = "0x..."; // HealthDAOStorage1 contract address

const storage = new Storage(storageAddress, signer);
const healthDAOStorage = new HealthDAOStorage(healthDAOStorageAddress, signer);

// Example: Subscribe to the DAO
async function subscribe() {
  try {
    const tx = await healthDAOStorage.subscribe();
    await tx.wait();
    console.log("Subscribed successfully!");
  } catch (error) {
    console.error("Error subscribing:", error);
  }
}

// Example: Post an update
async function postUpdate(contentCID: string) {
  try {
    const tx = await healthDAOStorage.postUpdate(contentCID);
    await tx.wait();
    console.log("Update posted successfully!");
  } catch (error) {
    console.error("Error posting update:", error);
  }
}

// Example: Listen for content tips
healthDAOStorage.onContentTipped((contentCID, tipper, amount, event) => {
  console.log(`Content ${contentCID} tipped ${amount.toString()} HDT by ${tipper}`);
});
*/