import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Full ABI - Supply chain contract ABI read from artifacts
const SUPPLY_CHAIN_ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"productId","type":"uint256"},{"indexed":false,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"participant","type":"address"}],"name":"ParticipantRevoked","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"participant","type":"address"},{"indexed":false,"internalType":"uint8","name":"participation_Type","type":"uint8"}],"name":"ParticipantsAuthorized","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"productId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"brand","type":"string"}],"name":"ProductCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"productId","type":"uint256"},{"indexed":false,"internalType":"uint8","name":"new_status","type":"uint8"},{"indexed":true,"internalType":"address","name":"updatedBy","type":"address"}],"name":"StatusUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"productId","type":"uint256"},{"indexed":true,"internalType":"address","name":"participant","type":"address"},{"indexed":false,"internalType":"string","name":"action","type":"string"}],"name":"TraceAdded","type":"event"},
  {"inputs":[],"name":"Productcounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"authoritizedParticipant","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_participant","type":"address"},{"internalType":"uint8","name":"_type","type":"uint8"}],"name":"authorizeparticipant","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256[]","name":"_productids","type":"uint256[]"}],"name":"batchGetStatus","outputs":[{"internalType":"uint8[]","name":"statuses","type":"uint8[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_brand","type":"string"},{"internalType":"string","name":"_sku","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"string","name":"_imageUrl","type":"string"}],"name":"createproduct","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_productid","type":"uint256"}],"name":"getAllTraceRecords","outputs":[{"components":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"participant","type":"address"},{"internalType":"uint8","name":"participation_Type","type":"uint8"},{"internalType":"string","name":"action","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"string","name":"metadata","type":"string"}],"internalType":"struct luxury_supply_chain.Trace_record[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_productid","type":"uint256"}],"name":"getProduct","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"brand","type":"string"},{"internalType":"string","name":"sku","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"imageUrl","type":"string"},{"internalType":"uint256","name":"createAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"address","name":"currentholder","type":"address"},{"internalType":"uint8","name":"status","type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_productid","type":"uint256"}],"name":"getTraceCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_productid","type":"uint256"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getTraceRecord","outputs":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"participant","type":"address"},{"internalType":"uint8","name":"participation_Type","type":"uint8"},{"internalType":"string","name":"action","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"string","name":"metadata","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"participantTypes","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"products","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"brand","type":"string"},{"internalType":"string","name":"sku","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"imageUrl","type":"string"},{"internalType":"uint256","name":"createAt","type":"uint256"},{"internalType":"uint256","name":"updatedAt","type":"uint256"},{"internalType":"address","name":"currentholder","type":"address"},{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"bool","name":"is_existed","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"producttrace","outputs":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"participant","type":"address"},{"internalType":"uint8","name":"participation_Type","type":"uint8"},{"internalType":"string","name":"action","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"string","name":"metadata","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_productid","type":"uint256"},{"internalType":"string","name":"_reason","type":"string"}],"name":"recall_product","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_participant","type":"address"}],"name":"revokeParticipant","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_productid","type":"uint256"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"string","name":"_location","type":"string"}],"name":"transfer_product","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_productid","type":"uint256"},{"internalType":"uint8","name":"new_status","type":"uint8"},{"internalType":"string","name":"_location","type":"string"},{"internalType":"string","name":"_metadata","type":"string"}],"name":"update_status","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

// Full ABI - NFT Contract
const NFT_ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"productId","type":"uint256"},{"indexed":false,"internalType":"address","name":"to","type":"address"}],"name":"NFTMinted","type":"event"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"owner","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"operator","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_productId","type":"uint256"}],"name":"getNFTByProduct","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"getProductByNFT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"supplyChainContract","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_contract","type":"address"}],"name":"setSupplyChainContract","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_productId","type":"uint256"},{"internalType":"string","name":"_tokenURI","type":"string"}],"name":"mint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_productId","type":"uint256"},{"internalType":"string","name":"_tokenURI","type":"string"}],"name":"mintByOwner","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

const PARTICIPATION_TYPES = {
  0: 'None',
  1: 'Brand',
  2: 'Manufacturer',
  3: 'Logistics',
  4: 'Retailer'
};

const PRODUCT_STATUS = {
  0: 'Created',
  1: 'InProduction',
  2: 'Produced',
  3: 'InTransit',
  4: 'Shipped',
  5: 'Instore',
  6: 'Sold',
  7: 'Recalled'
};

function App() {
  // State management
  const [currentAccount, setCurrentAccount] = useState('');
  const [identity, setIdentity] = useState(0);
  const [supplyChainAddress, setSupplyChainAddress] = useState('');
  const [nftAddress, setNftAddress] = useState('');
  const [supplyChainContract, setSupplyChainContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('products');
  
  // Product related states
  const [products, setProducts] = useState([]);
  const [productCount, setProductCount] = useState(0);
  
  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    sku: '',
    description: '',
    imageUrl: ''
  });
  
  const [addressInput, setAddressInput] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [traceRecords, setTraceRecords] = useState([]);
  
  const [updateStatusForm, setUpdateStatusForm] = useState({
    productId: '',
    status: '1',
    location: '',
    metadata: ''
  });
  
  const [transferForm, setTransferForm] = useState({
    productId: '',
    toAddress: '',
    location: ''
  });
  
  const [recallForm, setRecallForm] = useState({
    productId: '',
    reason: ''
  });
  
  const [authorizeForm, setAuthorizeForm] = useState({
    address: '',
    type: '2'
  });
  
  const [mintNFTForm, setMintNFTForm] = useState({
    productId: '',
    tokenURI: ''
  });

  // Connect Wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setMessage({ type: 'error', text: 'Please install MetaMask wallet!' });
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setCurrentAccount(accounts[0]);
      setMessage({ type: 'success', text: 'Wallet connected successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect wallet: ' + error.message });
    }
  };

  // Load Contracts
  const loadContracts = async (supplyChainAddr, nftAddr) => {
    try {
      // Address basic validation
      if (!ethers.isAddress(supplyChainAddr)) {
        setMessage({ type: 'error', text: 'Invalid supply chain contract address format! Please check input.' });
        return;
      }
      if (!ethers.isAddress(nftAddr)) {
        setMessage({ type: 'error', text: 'Invalid NFT contract address format! Please check input.' });
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check if there is contract code at the address using getCode (more reliable than calling methods)
      const supplyChainCode = await provider.getCode(supplyChainAddr);
      const nftCode = await provider.getCode(nftAddr);

      if (supplyChainCode === '0x') {
        setMessage({ type: 'error', text: 'No contract code found at the supply chain contract address! Please confirm:\n1. If the address is correct\n2. If MetaMask is connected to local network (Localhost 8545)\n3. If the contract has been successfully deployed' });
        return;
      }

      if (nftCode === '0x') {
        setMessage({ type: 'error', text: 'No contract code found at the NFT contract address! Please confirm:\n1. If the address is correct\n2. If MetaMask is connected to local network (Localhost 8545)\n3. If the contract has been successfully deployed' });
        return;
      }

      // After validation, create writable instances using signer
      const signer = await provider.getSigner();
      const supplyChain = new ethers.Contract(supplyChainAddr, SUPPLY_CHAIN_ABI, signer);
      const nft = new ethers.Contract(nftAddr, NFT_ABI, signer);
      
      setSupplyChainContract(supplyChain);
      setNftContract(nft);

      // Get identity
      const account = currentAccount || (await signer.getAddress());
      let identityType;
      try {
        identityType = await supplyChain.participantTypes(account);
      } catch (e) {
        identityType = 0;
      }
      setIdentity(Number(identityType));
      
      // Get product count
      let count = 0;
      try {
        count = await supplyChain.Productcounter();
      } catch (e) {
        console.warn('Failed to get product count:', e);
      }
      setProductCount(Number(count));
      
      setMessage({ type: 'success', text: `Contracts loaded successfully! Current account identity: ${PARTICIPATION_TYPES[Number(identityType)] || 'Unauthorized'}` });
    } catch (error) {
      console.error('Detailed contract loading error:', error);
      setMessage({ type: 'error', text: 'Failed to load contracts: ' + error.message + '\n\nPlease ensure:\n1. MetaMask is installed and connected to Localhost 8545\n2. Hardhat node is running\n3. Contract addresses are correct and deployed' });
    }
  };

  // Query identity by address
  const checkIdentity = async () => {
    if (!supplyChainContract || !addressInput) {
      setMessage({ type: 'error', text: 'Please load contracts first' });
      return;
    }
    
    try {
      console.log("Querying address:", addressInput);
      console.log("Contract:", supplyChainContract);
      
      // Attempt direct call
      const type = await supplyChainContract.participantTypes(addressInput);
      console.log("participantTypes result:", type);
      
      const isAuthorized = await supplyChainContract.authoritizedParticipant(addressInput);
      console.log("authorized result:", isAuthorized);
      
      const typeName = PARTICIPATION_TYPES[Number(type)];
      
      if (isAuthorized) {
        setMessage({ type: 'success', text: `Address ${addressInput.slice(0, 10)}... Identity: ${typeName}` });
      } else {
        setMessage({ type: 'warning', text: `Address ${addressInput.slice(0, 10)}... Unauthorized (Type: ${typeName})` });
      }
    } catch (error) {
      console.error("Query error:", error);
      setMessage({ type: 'error', text: 'Query failed: ' + error.message });
    }
  };

  // Deploy contracts
  const deployContracts = async () => {
    setIsDeploying(true);
    setMessage({ type: 'info', text: 'Deploying contracts, please wait...' });
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Deploy NFT contract
      const NFTFactory = new ethers.ContractFactory(NFT_ABI, getBytecode('NFT'), signer);
      const nft = await NFTFactory.deploy();
      await nft.waitForDeployment();
      const nftAddr = await nft.getAddress();
      setNftAddress(nftAddr);
      
      // Deploy supply chain contract
      const SupplyChainFactory = new ethers.ContractFactory(SUPPLY_CHAIN_ABI, getBytecode('SupplyChain'), signer);
      const supplyChain = await SupplyChainFactory.deploy();
      await supplyChain.waitForDeployment();
      const supplyChainAddr = await supplyChain.getAddress();
      setSupplyChainAddress(supplyChainAddr);
      
      // Link the two contracts
      await nft.setSupplyChainContract(supplyChainAddr);
      
      // Load Contracts
      await loadContracts(supplyChainAddr, nftAddr);
      
      setMessage({ type: 'success', text: 'Contracts deployed successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Deployment failed: ' + error.message });
    } finally {
      setIsDeploying(false);
    }
  };

  // Get compiled bytecode (simplified version, needs to be read from artifacts)
  const getBytecode = (type) => {
    // Real bytecode needs to be fetched from Hardhat artifacts here
    // As this is a demo, actual usage needs to read compiled files
    return '0x';
  };

  // Load product list (enhanced: single product fault tolerance to prevent one load failure from stopping overall refresh)
  const loadProducts = async () => {
    if (!supplyChainContract) return;
    
    try {
      const count = await supplyChainContract.Productcounter();
      setProductCount(Number(count));
      
      const productsList = [];
      for (let i = 1; i <= Number(count); i++) {
        try {
          const product = await supplyChainContract.getProduct(i);
          productsList.push({
            id: Number(product.id),
            name: product.name,
            brand: product.brand,
            sku: product.sku,
            description: product.description,
            imageUrl: product.imageUrl,
            currentholder: product.currentholder,
            status: Number(product.status)
          });
        } catch (productErr) {
          console.warn(`[loadProducts] Product #${i} failed to load, skipped:`, productErr);
          // Use placeholder data to ensure this position is not lost
          productsList.push({
            id: i,
            name: '[Load Failed]',
            brand: '',
            sku: '',
            description: '',
            imageUrl: '',
            currentholder: '0x0000...error',
            status: -1
          });
        }
      }
      setProducts(productsList);
      console.log(`[loadProducts] Successfully loaded ${productsList.filter(p => p.status >= 0).length}/${Number(count)} products`);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  // Load trace records
  const loadTraceRecords = async (productId) => {
    if (!supplyChainContract) return;
    
    try {
      const count = await supplyChainContract.getTraceCount(productId);
      const records = [];
      
      for (let i = 0; i < Number(count); i++) {
        const record = await supplyChainContract.getTraceRecord(productId, i);
        records.push({
          timestamp: new Date(Number(record.timestamp) * 1000).toLocaleString(),
          participant: record.participant,
          type: PARTICIPATION_TYPES[Number(record.participation_Type)],
          action: record.action,
          location: record.location,
          metadata: record.metadata
        });
      }
      setTraceRecords(records);
    } catch (error) {
      console.error('Failed to load trace records:', error);
    }
  };

  // Create product + auto mint NFT
  const handleCreateProduct = async () => {
    if (!supplyChainContract) return;
    
    try {
      setMessage({ type: 'info', text: 'Creating product...' });
      const tx = await supplyChainContract.createproduct(
        newProduct.name,
        newProduct.brand,
        newProduct.sku,
        newProduct.description,
        newProduct.imageUrl
      );
      const receipt = await tx.wait();
      
      // Get productId from event
      let productId = null;
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = supplyChainContract.interface.parseLog(log);
            if (parsed && parsed.name === 'ProductCreated') {
              productId = Number(parsed.args.productId);
              break;
            }
          } catch (_) {}
        }
      }
      
      if (!productId) {
        // Fallback: Use current product total + 1 as ID
        const count = await supplyChainContract.Productcounter();
        productId = Number(count);
      }

      setNewProduct({ name: '', brand: '', sku: '', description: '', imageUrl: '' });
      
      // Auto mint NFT certificate
      if (nftContract && identity === 1) {
        setMessage({ type: 'info', text: `Product #${productId} created successfully, automatically minting NFT certificate...` });
        try {
          const tokenURI = `https://supply-chain-nft/${newProduct.brand}/${newProduct.sku}/${productId}`;
          const mintTx = await nftContract.mintByOwner(currentAccount, productId, tokenURI);
          await mintTx.wait();
          setMessage({ type: 'success', text: `Product #${productId} created successfully, NFT certificate automatically minted!` });
        } catch (mintError) {
          console.warn('Auto NFT minting failed:', mintError);
          setMessage({ type: 'warning', text: `Product #${productId} 创建成功，但Auto NFT minting failed: ${mintError.message}` });
        }
      } else {
        setMessage({ type: 'success', text: `Product #${productId} created successfully!` });
      }
      
      await loadProducts();
    } catch (error) {
      console.error('Creation failed:', error);
      setMessage({ type: 'error', text: 'Creation failed: ' + error.message });
    }
  };

  // Update product status (enhanced: includes holder pre-validation + receipt status validation)
  const handleUpdateStatus = async () => {
    if (!supplyChainContract) return;
    
    const productId = parseInt(updateStatusForm.productId);
    if (!productId) {
      setMessage({ type: 'error', text: 'Please enter a valid product ID' });
      return;
    }

    try {
      setMessage({ type: 'info', text: 'Updating status...' });
      
      const targetStatus = parseInt(updateStatusForm.status);
      console.log(`[handleUpdateStatus] Sending parameters: productId=${productId}, new_status=${targetStatus}(${PRODUCT_STATUS[targetStatus]}), location="${updateStatusForm.location}", metadata="${updateStatusForm.metadata}"`);
      
      const tx = await supplyChainContract.update_status(
        productId,
        targetStatus,
        updateStatusForm.location,
        updateStatusForm.metadata
      );
      const receipt = await tx.wait();

      // === Verify if transaction truly succeeded ===
      if (receipt && receipt.status === 0) {
        setMessage({ type: 'error', text: 'Status update failed: Transaction reverted by blockchain! Possible reason: You are not the current holder of this product.' });
        await loadProducts(); // 刷新以显示实际Status
        return;
      }

      // === Post-update secondary validation: Re-read to confirm status actually changed ===
      let verifiedStatus = -1;
      try {
        const updated = await supplyChainContract.getProduct(productId);
        verifiedStatus = Number(updated.status);
        console.log(`[Status Update] Product #${productId}: ${PRODUCT_STATUS[currentStatus] || currentStatus} → ${PRODUCT_STATUS[verifiedStatus] || verifiedStatus}`);
      } catch (_) {}

      if (verifiedStatus === parseInt(updateStatusForm.status)) {
        setMessage({ type: 'success', text: `Status updated successfully!${PRODUCT_STATUS[currentStatus]} → ${PRODUCT_STATUS[verifiedStatus]}` });
      } else if (verifiedStatus >= 0) {
        setMessage({ type: 'warning', text: `Transaction submitted but status did not change as expected (${PRODUCT_STATUS[currentStatus]} → ${PRODUCT_STATUS[verifiedStatus]}). Please refresh to view the latest status.` });
      } else {
        setMessage({ type: 'success', text: 'Status updated successfully!（无法二次验证）' });
      }

      await loadProducts();
    } catch (error) {
      console.error('Detailed status update error:', error);
      // Extract more useful error messages
      let errorMsg = error.message || String(error);
      if (errorMsg.includes('Only product owner')) {
        errorMsg = 'Update failed: Only the current holder of the product can update status!\nPlease confirm ownership has been transferred to you (Logistics requires manufacturer to transfer ownership first).';
      } else if (errorMsg.includes('revert')) {
        errorMsg = 'Update failed: Contract execution reverted.\nMost common reason: You are not the current holder of this product.';
      }
      setMessage({ type: 'error', text: 'Update failed: ' + errorMsg });
      // Refresh once even after failure to ensure on-chain real status is displayed
      await loadProducts();
    }
  };

  // Transfer product (with status validation)
  const handleTransfer = async () => {
    if (!supplyChainContract) return;
    
    try {
      const productId = parseInt(transferForm.productId);
      if (!productId || !transferForm.toAddress || !ethers.isAddress(transferForm.toAddress)) {
        setMessage({ type: 'error', text: 'Please fill in complete product ID and a valid receiver address' });
        return;
      }

      // Frontend pre-validation: Get current product status
      let productStatus = -1;
      try {
        const product = await supplyChainContract.getProduct(productId);
        productStatus = Number(product.status);
      } catch (_) {}

      // Frontend prompt based on contract logic
      if (productStatus === 3) { // InTransit
        setMessage({ type: 'error', text: 'This product is InTransit, ownership transfer is not allowed! Logistics must update the status to Shipped first.' });
        return;
      }
      if (productStatus === 2) { // Produced - 只能传给物流
        setMessage({ type: 'info', text: 'Note: Produced products can only be transferred to Logistics participants. Contract will verify receiver identity...' });
      }
      if (productStatus === 4) { // Shipped - 只有物流可转移
        const myType = await supplyChainContract.participantTypes(currentAccount);
        if (Number(myType) !== 3) {
          setMessage({ type: 'error', text: 'Only Logistics participants can transfer ownership of Shipped products!' });
          return;
        }
      }

      setMessage({ type: 'info', text: 'Transferring product...' });
      const tx = await supplyChainContract.transfer_product(
        productId,
        transferForm.toAddress,
        transferForm.location
      );
      await tx.wait();
      
      setMessage({ type: 'success', text: 'Product transferred successfully!' });
      setTransferForm({ productId: '', toAddress: '', location: '' });
      await loadProducts();
    } catch (error) {
      console.error('Transfer failed:', error);
      setMessage({ type: 'error', text: 'Transfer failed: ' + error.message });
    }
  };

  // Recall product
  const handleRecall = async () => {
    if (!supplyChainContract) return;
    
    try {
      setMessage({ type: 'info', text: 'Recalling product...' });
      const tx = await supplyChainContract.recall_product(
        parseInt(recallForm.productId),
        recallForm.reason
      );
      await tx.wait();
      
      setMessage({ type: 'success', text: 'Product recalled successfully!' });
      await loadProducts();
    } catch (error) {
      setMessage({ type: 'error', text: 'Recall failed: ' + error.message });
    }
  };

  // Authorize participant
  const handleAuthorize = async () => {
    if (!supplyChainContract) return;
    
    try {
      setMessage({ type: 'info', text: 'Authorizing participant...' });
      const tx = await supplyChainContract.authorizeparticipant(
        authorizeForm.address,
        parseInt(authorizeForm.type)
      );
      await tx.wait();
      
      setMessage({ type: 'success', text: 'Authorization successful!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Authorization failed: ' + error.message });
    }
  };

  // Mint NFT
  const handleMintNFT = async () => {
    if (!nftContract) return;
    
    try {
      setMessage({ type: 'info', text: 'Minting NFT...' });
      const tx = await nftContract.mintByOwner(
        currentAccount,
        parseInt(mintNFTForm.productId),
        mintNFTForm.tokenURI
      );
      await tx.wait();
      
      setMessage({ type: 'success', text: 'NFT minted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Minting failed: ' + error.message });
    }
  };

  // Load manually inputted contract addresses
  const handleLoadContracts = () => {
    if (supplyChainAddress && nftAddress) {
      loadContracts(supplyChainAddress, nftAddress);
    }
  };

  // Auto-load contract addresses from deployment-info.json
  const handleAutoLoadFromDeploy = async () => {
    try {
      setMessage({ type: 'info', text: 'Reading deployment info...' });
      const response = await fetch('/deployment-info.json');
      if (!response.ok) throw new Error('Deployment info file not found, please run deploy.bat to deploy contracts first');
      const data = await response.json();
      
      const scAddr = data.contracts.luxury_supply_chain;
      const nftAddr = data.contracts.ProductNFT;
      
      if (!scAddr || !nftAddr) {
        throw new Error('Deployment info file format is incorrect, missing contract addresses');
      }
      
      setSupplyChainAddress(scAddr);
      setNftAddress(nftAddr);
      await loadContracts(scAddr, nftAddr);
    } catch (error) {
      console.error('Auto-load failed:', error);
      setMessage({ type: 'error', text: 'Auto-loading address failed: ' + error.message });
    }
  };

  // Load product list
  useEffect(() => {
    if (supplyChainContract && currentAccount) {
      loadProducts();
    }
  }, [supplyChainContract, currentAccount]);

  // === Critical fix: Reset status form to appropriate default value for the role when switching identity ===
  // Prevent sending wrong status due to old status values remaining after switching from other roles
  useEffect(() => {
    const defaultStatusByRole = {
      1: '0',   // Brand: Created
      2: '2',   // Manufacturer: Produced (制造完成后更新)
      3: '3',   // Logistics: InTransit
      4: '5',   // Retailer: Instore
    };
    const defaultStatus = defaultStatusByRole[identity] || '1';
    
    setUpdateStatusForm(prev => ({
      ...prev,
      status: defaultStatus
    }));
    console.log(`[Role Switch] Identity=${PARTICIPATION_TYPES[identity] || identity}, status form reset to default: ${PRODUCT_STATUS[defaultStatus] || defaultStatus}`);
  }, [identity]);

  // Render identity badge
  const renderIdentityBadge = () => {
    if (identity === 0) return null;
    const typeName = PARTICIPATION_TYPES[identity];
    const className = typeName.toLowerCase();
    return (
      <span className={`identity-badge ${className}`}>
        Identity: {typeName}
      </span>
    );
  };

  // Render messages
  const renderMessage = () => {
    if (!message.text) return null;
    return (
      <div className={message.type === 'error' ? 'error-message' : message.type === 'success' ? 'success-message' : 'status status-info'}>
        {message.text}
      </div>
    );
  };

  // Render Brand functions
  const renderBrandFunctions = () => (
    <div className="card">
      <h2>Brand Functions</h2>
      
      <div className="form-group">
        <label>Create New Product</label>
        <input 
          placeholder="Product Name" 
          value={newProduct.name}
          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
        />
        <input 
          placeholder="Brand" 
          style={{marginTop: '8px'}}
          value={newProduct.brand}
          onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
        />
        <input 
          placeholder="SKU Code" 
          style={{marginTop: '8px'}}
          value={newProduct.sku}
          onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
        />
        <textarea 
          placeholder="Product Description" 
          style={{marginTop: '8px'}}
          value={newProduct.description}
          onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
        />
        <input 
          placeholder="Image URL" 
          style={{marginTop: '8px'}}
          value={newProduct.imageUrl}
          onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
        />
        <button className="btn btn-primary" style={{marginTop: '12px'}} onClick={handleCreateProduct}>
          Create Product
        </button>
      </div>

      <div className="form-group" style={{marginTop: '24px'}}>
        <label>Authorize Participant</label>
        <input 
          placeholder="Participant Address"
          value={authorizeForm.address}
          onChange={(e) => setAuthorizeForm({...authorizeForm, address: e.target.value})}
        />
        <select 
          style={{marginTop: '8px'}}
          value={authorizeForm.type}
          onChange={(e) => setAuthorizeForm({...authorizeForm, type: e.target.value})}
        >
          <option value="2">Manufacturer</option>
          <option value="3">Logistics</option>
          <option value="4">Retailer</option>
        </select>
        <button className="btn btn-success" style={{marginTop: '12px'}} onClick={handleAuthorize}>
          Authorize
        </button>
      </div>

      <div className="form-group" style={{marginTop: '24px'}}>
        <label>Recall Product</label>
        <input 
          placeholder="Product ID"
          type="number"
          value={recallForm.productId}
          onChange={(e) => setRecallForm({...recallForm, productId: e.target.value})}
        />
        <input 
          placeholder="Recall Reason"
          style={{marginTop: '8px'}}
          value={recallForm.reason}
          onChange={(e) => setRecallForm({...recallForm, reason: e.target.value})}
        />
        <button className="btn btn-danger" style={{marginTop: '12px'}} onClick={handleRecall}>
          Recall Product
        </button>
      </div>

      <div className="form-group" style={{marginTop: '24px'}}>
        <label>Transfer Product Ownership</label>
        <p style={{color: '#888', fontSize: '0.85rem', marginBottom: '8px'}}>
          转移规则：Created→任意Authorize方 | Produced→仅物流 | InTransit→不可转 | Shipped→仅物流可转
        </p>
        <input 
          placeholder="Product ID"
          type="number"
          value={transferForm.productId}
          onChange={(e) => setTransferForm({...transferForm, productId: e.target.value})}
        />
        <input 
          placeholder="Receiver Address"
          style={{marginTop: '8px'}}
          value={transferForm.toAddress}
          onChange={(e) => setTransferForm({...transferForm, toAddress: e.target.value})}
        />
        <input 
          placeholder="Transfer Location"
          style={{marginTop: '8px'}}
          value={transferForm.location}
          onChange={(e) => setTransferForm({...transferForm, location: e.target.value})}
        />
        <button className="btn btn-secondary" style={{marginTop: '12px'}} onClick={handleTransfer}>
          Transfer Ownership
        </button>
      </div>
    </div>
  );

  // Render Manufacturer functions
  const renderManufacturerFunctions = () => (
    <div className="card">
      <h2>Manufacturer Functions</h2>
      
      <div className="form-group">
        <label>Update Product Status - Production Phase</label>
        <input 
          placeholder="Product ID"
          type="number"
          value={updateStatusForm.productId}
          onChange={(e) => setUpdateStatusForm({...updateStatusForm, productId: e.target.value})}
        />
        <select 
          style={{marginTop: '8px'}}
          value={updateStatusForm.status}
          onChange={(e) => setUpdateStatusForm({...updateStatusForm, status: e.target.value})}
        >
          <option value="1">InProduction</option>
          <option value="2">Produced</option>
        </select>
        <input 
          placeholder="Location"
          style={{marginTop: '8px'}}
          value={updateStatusForm.location}
          onChange={(e) => setUpdateStatusForm({...updateStatusForm, location: e.target.value})}
        />
        <input 
          placeholder="Metadata/Notes"
          style={{marginTop: '8px'}}
          value={updateStatusForm.metadata}
          onChange={(e) => setUpdateStatusForm({...updateStatusForm, metadata: e.target.value})}
        />
        <button className="btn btn-primary" style={{marginTop: '12px'}} onClick={handleUpdateStatus}>
          Update Status
        </button>
      </div>

      <div className="form-group" style={{marginTop: '24px'}}>
        <label>Transfer Product Ownership</label>
        <p style={{color: '#888', fontSize: '0.85rem', marginBottom: '8px'}}>
          Products in production (InProduction) can only be transferred between Brand and Manufacturer
        </p>
        <input 
          placeholder="Product ID"
          type="number"
          value={transferForm.productId}
          onChange={(e) => setTransferForm({...transferForm, productId: e.target.value})}
        />
        <input 
          placeholder="Receiver Address"
          style={{marginTop: '8px'}}
          value={transferForm.toAddress}
          onChange={(e) => setTransferForm({...transferForm, toAddress: e.target.value})}
        />
        <input 
          placeholder="Transfer Location"
          style={{marginTop: '8px'}}
          value={transferForm.location}
          onChange={(e) => setTransferForm({...transferForm, location: e.target.value})}
        />
        <button className="btn btn-secondary" style={{marginTop: '12px'}} onClick={handleTransfer}>
          Transfer Ownership
        </button>
      </div>
    </div>
  );

  // Render Logistics functions
  const renderLogisticsFunctions = () => (
    <div className="card">
      <h2>Logistics Functions</h2>
      
      <div className="form-group">
        <label>Update Product Status - Transit Phase</label>
        <p style={{color: '#e74c3c', fontSize: '0.85rem', marginBottom: '8px', background: 'rgba(231,76,60,0.1)', padding: '8px 12px', borderRadius: '6px'}}>
          ⚠️ 重要前提：您必须是产品的Current Holder才能Update Status！<br/>
          If the product is still with the manufacturer, please ask <strong style={{color:'#e74c3c'}}>制造商通过"Transfer Ownership"将产品转移给您</strong> first, then update transit status.
        </p>
        <input 
          placeholder="Product ID"
          type="number"
          value={updateStatusForm.productId}
          onChange={(e) => setUpdateStatusForm({...updateStatusForm, productId: e.target.value})}
        />
        <select 
          style={{marginTop: '8px'}}
          value={updateStatusForm.status}
          onChange={(e) => setUpdateStatusForm({...updateStatusForm, status: e.target.value})}
        >
          <option value="3">InTransit</option>
          <option value="4">Shipped</option>
        </select>
        {updateStatusForm.status && (
          <p style={{color: '#27ae60', fontSize: '0.85rem', marginTop: '4px', fontWeight: 'bold'}}>
            ✓ Will send status: <span style={{
              background: '#eafaf1', padding: '2px 10px', borderRadius: '4px',
              color: '#229954'
            }}>{PRODUCT_STATUS[updateStatusForm.status] || `Unknown(${updateStatusForm.status})`}</span> 
            (Value = {updateStatusForm.status})
          </p>
        )}
        <input 
          placeholder="Location"
          style={{marginTop: '8px'}}
          value={updateStatusForm.location}
          onChange={(e) => setUpdateStatusForm({...updateStatusForm, location: e.target.value})}
        />
        <input 
          placeholder="Transit Info"
          style={{marginTop: '8px'}}
          value={updateStatusForm.metadata}
          onChange={(e) => setUpdateStatusForm({...updateStatusForm, metadata: e.target.value})}
        />
        <button className="btn btn-primary" style={{marginTop: '12px'}} onClick={handleUpdateStatus}>
          Update Transit Status
        </button>
      </div>

      <div className="form-group" style={{marginTop: '24px'}}>
        <label>Transfer Product Ownership</label>
        <p style={{color: '#888', fontSize: '0.85rem', marginBottom: '8px'}}>
          注意：必须先将Status更新为"已送达(Shipped)"后才能Transfer Ownership给零售商
        </p>
        <input 
          placeholder="Product ID"
          type="number"
          value={transferForm.productId}
          onChange={(e) => setTransferForm({...transferForm, productId: e.target.value})}
        />
        <input 
          placeholder="Receiver Address（如零售商）"
          style={{marginTop: '8px'}}
          value={transferForm.toAddress}
          onChange={(e) => setTransferForm({...transferForm, toAddress: e.target.value})}
        />
        <input 
          placeholder="Transfer Location"
          style={{marginTop: '8px'}}
          value={transferForm.location}
          onChange={(e) => setTransferForm({...transferForm, location: e.target.value})}
        />
        <button className="btn btn-secondary" style={{marginTop: '12px'}} onClick={handleTransfer}>
          Transfer Ownership
        </button>
      </div>
    </div>
  );

  // Render Retailer functions
  const renderRetailerFunctions = () => (
    <div className="card">
      <h2>Retailer Functions</h2>
      
      <div className="form-group">
        <label>Update Product Status - Listing/Sales</label>
        <p style={{color: '#e74c3c', fontSize: '0.85rem', marginBottom: '8px', background: 'rgba(231,76,60,0.1)', padding: '8px 12px', borderRadius: '6px'}}>
          ⚠️ 前提：您必须是产品的Current Holder！<br/>
          如果物流尚未将产品转移给您，请联系物流先完成"Transfer Ownership"Action。
        </p>
        <input 
          placeholder="Product ID"
          type="number"
          value={updateStatusForm.productId}
          onChange={(e) => setUpdateStatusForm({...updateStatusForm, productId: e.target.value})}
        />
        <select 
          style={{marginTop: '8px'}}
          value={updateStatusForm.status}
          onChange={(e) => setUpdateStatusForm({...updateStatusForm, status: e.target.value})}
        >
          <option value="5">Instore</option>
          <option value="6">Sold</option>
        </select>
        {updateStatusForm.status && (
          <p style={{color: '#27ae60', fontSize: '0.85rem', marginTop: '4px', fontWeight: 'bold'}}>
            ✓ Will send status: <span style={{
              background: '#eafaf1', padding: '2px 10px', borderRadius: '4px',
              color: '#229954'
            }}>{PRODUCT_STATUS[updateStatusForm.status] || `Unknown(${updateStatusForm.status})`}</span> 
            (Value = {updateStatusForm.status})
          </p>
        )}
        <input 
          placeholder="Store Location"
          style={{marginTop: '8px'}}
          value={updateStatusForm.location}
          onChange={(e) => setUpdateStatusForm({...updateStatusForm, location: e.target.value})}
        />
        <input 
          placeholder="Metadata/Notes"
          style={{marginTop: '8px'}}
          value={updateStatusForm.metadata}
          onChange={(e) => setUpdateStatusForm({...updateStatusForm, metadata: e.target.value})}
        />
        <button className="btn btn-primary" style={{marginTop: '12px'}} onClick={handleUpdateStatus}>
          Update Status
        </button>
      </div>

      <div className="form-group" style={{marginTop: '24px'}}>
        <label>Transfer Product Ownership</label>
        <p style={{color: '#888', fontSize: '0.85rem', marginBottom: '8px'}}>
          零售商可将在店(Instore)产品转移给消费者（需为已Authorize Participant）
        </p>
        <input 
          placeholder="Product ID"
          type="number"
          value={transferForm.productId}
          onChange={(e) => setTransferForm({...transferForm, productId: e.target.value})}
        />
        <input 
          placeholder="Receiver Address"
          style={{marginTop: '8px'}}
          value={transferForm.toAddress}
          onChange={(e) => setTransferForm({...transferForm, toAddress: e.target.value})}
        />
        <input 
          placeholder="Transfer Location"
          style={{marginTop: '8px'}}
          value={transferForm.location}
          onChange={(e) => setTransferForm({...transferForm, location: e.target.value})}
        />
        <button className="btn btn-secondary" style={{marginTop: '12px'}} onClick={handleTransfer}>
          Transfer Ownership
        </button>
      </div>
    </div>
  );

  // Render all functions
  const renderFunctions = () => {
    if (identity === 1) return renderBrandFunctions();
    if (identity === 2) return renderManufacturerFunctions();
    if (identity === 3) return renderLogisticsFunctions();
    if (identity === 4) return renderRetailerFunctions();
    
    return (
      <div className="card">
        <h2>Functional Permissions</h2>
        <p style={{color: '#888'}}>您尚未被Authorize参与供应链系统。请联系Brand方获取Authorize。</p>
        <p style={{color: '#666', marginTop: '10px', fontSize: '0.9rem'}}>
          Note: The address that deployed the contract has Brand permissions by default
        </p>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Luxury Supply Chain Management System</h1>
        <p>Blockchain-based luxury traceability and full lifecycle management</p>
      </div>

      {/* Message Prompts */}
      {renderMessage()}

      {/* Connect Wallet */}
      {!currentAccount && (
        <div className="card">
          <h2>Get Started</h2>
          <p style={{marginBottom: '16px', color: '#888'}}>
            Please connect your wallet first to get started with the supply chain management system
          </p>
          <button className="btn btn-primary" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      )}

      {/* 已Connect Wallet */}
      {currentAccount && (
        <>
          <div className="card">
            <h2>Current Account</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Address</label>
                <span>{currentAccount}</span>
              </div>
              {identity !== 0 && (
                <div className="info-item">
                  <label>Identity</label>
                  <span>{renderIdentityBadge()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contract Deployment/Loading */}
          <div className="card">
            <h2>Contract Management</h2>
            {!supplyChainContract ? (
              <>
                <div className="form-group">
                  <label>One-Click Deploy Contracts</label>
                  <p style={{color: '#888', marginBottom: '12px', fontSize: '0.9rem'}}>
                    Deploy fresh supply chain contracts to the blockchain network
                  </p>
                  <button 
                    className="btn btn-primary" 
                    onClick={deployContracts}
                    disabled={isDeploying}
                  >
                    {isDeploying ? 'Deploying...' : 'Deploy Contracts'}
                  </button>
                </div>
                
                <div style={{marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px'}}>
                  <div className="form-group">
                    <label>Auto-Load from Deployment Info</label>
                    <p style={{color: '#888', marginBottom: '12px', fontSize: '0.9rem'}}>
                      Automatically read deployed contract addresses from deploy.bat (Recommended)
                    </p>
                    <button className="btn btn-success" onClick={handleAutoLoadFromDeploy}>
                      1-Click Load Deployed Addresses
                    </button>
                  </div>
                </div>

                <div style={{marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px'}}>
                  <div className="form-group">
                    <label>Or manually enter existing contract addresses</label>
                    <input 
                      placeholder="Supply Chain  Contract Address"
                      value={supplyChainAddress}
                      onChange={(e) => setSupplyChainAddress(e.target.value)}
                    />
                    <input 
                      placeholder="NFT  Contract Address"
                      style={{marginTop: '8px'}}
                      value={nftAddress}
                      onChange={(e) => setNftAddress(e.target.value)}
                    />
                    <button 
                      className="btn btn-secondary" 
                      style={{marginTop: '12px'}}
                      onClick={handleLoadContracts}
                    >
                      Load Contracts
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label>Supply Chain Contract</label>
                  <span style={{fontSize: '0.8rem'}}>{supplyChainContract.target}</span>
                </div>
                <div className="info-item">
                  <label>NFT Contract</label>
                  <span style={{fontSize: '0.8rem'}}>{nftContract.target}</span>
                </div>
              </div>
            )}
          </div>

          {/* Identity Query */}
          <div className="card">
            <h2>Identity Query</h2>
            <div className="form-group">
              <input 
                placeholder="Enter Ethereum address to query"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
              <button 
                className="btn btn-secondary" 
                style={{marginTop: '12px'}}
                onClick={checkIdentity}
              >
                Query Identity
              </button>
            </div>
          </div>

          {/* Function Areas */}
          {supplyChainContract && (
            <>
              {renderFunctions()}

              {/* Product List */}
              <div className="card">
                <h2>Product List</h2>
                <div style={{marginBottom: '16px'}}>
                  <button className="btn btn-secondary" onClick={loadProducts}>
                    Refresh Product List
                  </button>
                </div>
                
                {products.length === 0 ? (
                  <p className="no-data">No Products Available</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Brand</th>
                          <th>Status</th>
                          <th>Current Holder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => (
                          <tr 
                            key={product.id}
                            onClick={() => {
                              setSelectedProduct(product);
                              loadTraceRecords(product.id);
                            }}
                            style={{cursor: 'pointer'}}
                          >
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.brand}</td>
                            <td>
                              <span className={`status status-${product.status === 5 ? 'success' : product.status === 6 ? 'error' : 'info'}`}>
                                {PRODUCT_STATUS[product.status]}
                              </span>
                            </td>
                            <td style={{fontSize: '0.8rem'}}>{product.currentholder.slice(0, 10)}...</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Trace Records */}
              {selectedProduct && traceRecords.length > 0 && (
                <div className="card">
                  <h2>Trace Records - {selectedProduct.name}</h2>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Participant</th>
                          <th>Type</th>
                          <th>Action</th>
                          <th>Location</th>
                          <th>Metadata/Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {traceRecords.map((record, index) => (
                          <tr key={index}>
                            <td style={{fontSize: '0.8rem'}}>{record.timestamp}</td>
                            <td style={{fontSize: '0.8rem'}}>{record.participant.slice(0, 10)}...</td>
                            <td>{record.type}</td>
                            <td>{record.action}</td>
                            <td>{record.location}</td>
                            <td>{record.metadata}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
