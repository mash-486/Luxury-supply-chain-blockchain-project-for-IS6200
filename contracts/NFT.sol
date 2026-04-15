// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// NFT contract for issuing unique certificates per productId

interface IERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address approved, uint256 tokenId);
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
}


contract ProductNFT {

    string public name = "LuxuryProductNFT";
    string public symbol = "LPNFT";

    address public owner;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;   
    mapping(uint256 => address) private _tokenApprovals;
    mapping(uint256 => uint256) public productToNFT; 
    mapping(uint256 => uint256) public NFTToProduct; 
    mapping(uint256 => string) private _tokenURIs; 
    uint256 private _tokenIdCounter;   
    address public supplyChainContract; 

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address approved, uint256 tokenId);
    event NFTMinted(uint256 indexed tokenId, uint256 indexed productId, address to);
    event ContractAddressUpdated(address newContract);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlySupplyChain() {
        require(msg.sender == supplyChainContract, "Only supply chain contract can call this");
        _;
    }

    modifier exists(uint256 tokenId) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        _tokenIdCounter = 0;
    }
// this func is used for updating the address of supplychain smart contract 
    function setSupplychain_contract(address _contract) public onlyOwner {
        supplyChainContract = _contract;
        emit ContractAddressUpdated(_contract);
    }
//build NFT
    function mint(
        address _to,
        uint256 _productId,
        string memory _tokenURI//the note about a NFT
    ) public onlySupplyChain returns (uint256) {
        return _mintInternal(_to, _productId, _tokenURI);
    }

    function mintByOwner(
        address _to,
        uint256 _productId,
        string memory _tokenURI
    ) public onlyOwner returns (uint256) {
        return _mintInternal(_to, _productId, _tokenURI);
    }
//internal function, core logic of build a nft
    function _mintInternal(
        address _to,
        uint256 _productId,
        string memory _tokenURI
    ) internal returns (uint256) {
        require(_to != address(0), "Invalid address");
        require(productToNFT[_productId] == 0, "Product already has NFT");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _owners[newTokenId] = _to;
        _balances[_to] += 1;
        _tokenURIs[newTokenId] = _tokenURI;

        productToNFT[_productId] = newTokenId; //product id--->nft id
        NFTToProduct[newTokenId] = _productId;// vise versa

        emit Transfer(address(0), _to, newTokenId);
        emit NFTMinted(newTokenId, _productId, _to);

        return newTokenId;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public exists(_tokenId) {
        address tokenOwner = _owners[_tokenId];
        require(tokenOwner == _from, "From address is not the owner");
        require(
            msg.sender == _from || msg.sender == _tokenApprovals[_tokenId],"Not authorized to transfer"
        );
        require(_to != address(0), "Invalid to address");

        if (msg.sender != _from && _tokenApprovals[_tokenId] != msg.sender) {
            revert("Not authorized to transfer");
        }

        _tokenApprovals[_tokenId] = address(0);
        emit Approval(_from, address(0), _tokenId);

        _balances[_from] -= 1;   
        _balances[_to] += 1;    

        _owners[_tokenId] = _to;

        emit Transfer(_from, _to, _tokenId);
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public exists(_tokenId) {
        transferFrom(_from, _to, _tokenId);
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory data
    ) public exists(_tokenId) {
        transferFrom(_from, _to, _tokenId);
    }
// to approve a address to do something on its nft
    function approve(address _to, uint256 _tokenId) public exists(_tokenId) {
        address tokenOwner = _owners[_tokenId];
        require(msg.sender == tokenOwner, "Not token owner");

        _tokenApprovals[_tokenId] = _to;
        emit Approval(tokenOwner, _to, _tokenId);
    }

    function ownerOf(uint256 _tokenId) public view returns (address) {
        address tokenOwner = _owners[_tokenId];
        require(tokenOwner != address(0), "Token does not exist");
        return tokenOwner;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        require(_owner != address(0), "Invalid address");
        return _balances[_owner];
    }

    function getApproved(uint256 _tokenId) public view exists(_tokenId) returns (address) {
        return _tokenApprovals[_tokenId];
    }

    function tokenURI(uint256 _tokenId) public view exists(_tokenId) returns (string memory) {
        return _tokenURIs[_tokenId];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function getNFTByProduct(uint256 _productId) public view returns (uint256) {
        require(productToNFT[_productId] != 0, "Product has no NFT");
        return productToNFT[_productId];
    }

    function getProductByNFT(uint256 _tokenId) public view exists(_tokenId) returns (uint256) {
        return NFTToProduct[_tokenId];
    }
}
