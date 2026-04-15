// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/*
* Luxury Supply Chain Smart Contract
* Records the entire lifecycle of luxury goods from production to sale
* Group: Group 30
*/

contract luxury_supply_chain{    

// State variables
address public owner; 
uint256 public Productcounter; 
mapping (uint256=>Product) public products;  
mapping (uint256=>Trace_record[]) public producttrace; 
mapping (address=>bool) public authoritizedParticipant; 
mapping (address=> Participation_type) public participantTypes; 

// Participants enum
enum Participation_type{  
    None,               //0 - Unauthentic
    brand,              //1 - Brand like LV, Rolex
    Manufacturer,       //2 - Factory
    Logistics,          //3 - Logistics
    Retailer           //4 - Retailer
}

// Product status enum
enum product_status{
    Created,            //0
    InProduction,       //1
    Produced,           //2
    InTransit,          //3 - Transporting
    Shipped,            //4 - Shipped for delivery
    Instore,            //5
    sold,               //6
    Recalled            //7
}

// Product struct
struct Product {
    uint256 id;
    string name;
    string brand;
    string sku;
    string description;
    string imageUrl;
    uint256 createAt;
    uint256 updatedAt;
    address currentholder;
    product_status status;
    bool is_existed;
}

// Trace record struct
struct Trace_record{
    uint256 timestamp;
    address participant;
    Participation_type participation_Type;
    string action;
    string location;
    string metadata;
}

// Events
event ParticipantsAuthorized(address indexed participant, Participation_type participation_Type);
event ParticipantRevoked(address indexed participant);
event ProductCreated(uint256 indexed productId, string name, string brand);
event StatusUpdated(uint256 indexed productId, product_status new_status, address indexed updatedBy);
event TraceAdded(uint256 indexed productId, address indexed participant, string action);
event OwnershipTransferred(uint indexed productId,address from, address to);

// Modifiers
modifier onlyauthorized(){      
    require(authoritizedParticipant[msg.sender],"only authentic participant can use this function");
    _;
}
modifier productExists(uint256 _productid) {
    require(products[_productid].is_existed, "Product does not exist");
    _;
}

// Constructor - sets deployer as Brand automatically
constructor(){    
    owner = msg.sender; 
    authoritizedParticipant[msg.sender] = true;
    participantTypes[msg.sender] = Participation_type.brand;
    Productcounter=0;
}

// Authorize a new participant (only Brand can do this)
function authorizeparticipant (address _participant, Participation_type _type )public onlyauthorized {
    require(_participant != address(0), "Invalid address!!");  
    require(participantTypes[msg.sender] == Participation_type.brand,"Only brand can authorize participants");
    require( _type == Participation_type.Manufacturer || _type == Participation_type.Logistics || _type == Participation_type.Retailer, "Brand can only authorize manufacturer/logistics/retailer");
    authoritizedParticipant[_participant]=true;
    participantTypes[_participant]=_type;
    emit ParticipantsAuthorized(_participant, _type);
}

// Revoke a participant's authorization (only Brand can do this)
function revokeParticipant(address _participant) public onlyauthorized {
        require(authoritizedParticipant[_participant], "Participant not authorized");
        require(participantTypes[msg.sender] == Participation_type.brand,"Only brand can revoke participants");
        authoritizedParticipant[_participant]=false;    
        participantTypes[_participant]=Participation_type.None;
        emit ParticipantRevoked(_participant);
}

// Create a new product (only Brand can do this)
function createproduct(
    string memory _name,
    string memory _brand,
    string memory _sku,
    string memory _description,
    string memory _imageUrl
) public onlyauthorized returns (uint256){
        require(participantTypes[msg.sender] == Participation_type.brand,"Only brand can create products");

        Productcounter++;

        Product memory newProduct = Product({
            id: Productcounter,
            name: _name,
            brand: _brand,
            sku: _sku,
            description: _description,
            imageUrl: _imageUrl,
            createAt: block.timestamp,
            updatedAt: block.timestamp,
            currentholder: msg.sender,
            status: product_status.Created,
            is_existed: true
        });

        products[Productcounter] = newProduct;

        _addTracerecord(
            Productcounter,
            "Product Created",
            "Brand Headquarters",
            ""
        );

        emit ProductCreated(Productcounter, _name, _brand);
        return Productcounter;
}

// Update product status (only current holder can update)
function update_status(
        uint256 _productid,
        product_status new_status,
        string memory _location,
        string memory _metadata
    ) public onlyauthorized productExists(_productid) {
        Product storage product = products[_productid];
        
        require(
            product.currentholder == msg.sender,
            "Only product owner can update status"
        );
        
        if (product.status == product_status.sold) {
            require(
                new_status == product_status.Recalled && participantTypes[msg.sender] == Participation_type.brand,
                "Only brand can recall sold products"
            );
        }
        
        if (product.status == product_status.sold && new_status == product_status.Instore) {
            require(
                false,
                "Cannot change sold product back to instore"
            );
        }

        product.status = new_status;
        product.updatedAt = block.timestamp;

        string memory action = _getStatusaction(new_status); 
        _addTracerecord(_productid, action, _location, _metadata);

        emit StatusUpdated(_productid, new_status, msg.sender);
}

// Transfer product ownership
function transfer_product(
        uint256 _productid,
        address _to,
        string memory _location
    ) public onlyauthorized productExists(_productid) {
        require(_to != address(0), "Invalid address");
        require(authoritizedParticipant[_to], "Recipient is not authorized");

        Product storage product = products[_productid];
        address from = product.currentholder;

        product.currentholder = _to;
        product.updatedAt = block.timestamp;
        _addTracerecord(_productid, "Product Transferred", _location, "");

        emit OwnershipTransferred(_productid, from, _to);
}

// Recall a product (only Brand can do this)
function recall_product(
        uint256 _productid,
        string memory _reason   
    ) public onlyauthorized productExists(_productid) {
        require(
            participantTypes[msg.sender] == Participation_type.brand,
            "Only brand can recall products"
        );

        Product storage product = products[_productid];
        product.status = product_status.Recalled;
        product.updatedAt = block.timestamp;

        _addTracerecord(_productid, "Product Recalled", "", _reason);

        emit StatusUpdated(_productid, product_status.Recalled, msg.sender);
}

// Get product info by ID
function getProduct(uint256 _productid) public view productExists(_productid) returns (
        uint256 id,
        string memory name,
        string memory brand,
        string memory sku,
        string memory description,
        string memory imageUrl,
        uint256 createAt,
        uint256 updatedAt,
        address currentholder,
        product_status status
    ) {
        Product memory product = products[_productid];
        return (
            product.id,
            product.name,
            product.brand,
            product.sku,
            product.description,
            product.imageUrl,
            product.createAt,
            product.updatedAt,
            product.currentholder,
            product.status
        );
}

// Get trace record count for a product
function getTracecount(uint256 _productid) public view productExists(_productid) returns (uint256) {
        return producttrace[_productid].length;
}

// Get a specific trace record
function getTracerecord(uint256 _productid, uint256 _index)
        public view productExists(_productid)
        returns (
            uint256 timestamp,
            address participant,
            Participation_type participation_Type,
            string memory action,
            string memory location,
            string memory metadata
        )
    {
        require(_index < producttrace[_productid].length, "Index out of bounds");

        Trace_record memory record = producttrace[_productid][_index];
        return (
            record.timestamp,
            record.participant,
            record.participation_Type,
            record.action,
            record.location,
            record.metadata
        );
}

// Get all trace records for a product
function getAllTracerecords(uint256 _productid) public view productExists(_productid) returns (Trace_record[] memory)
    {
        return producttrace[_productid];
    }

// Batch get status of multiple products
function getBatchstatus(uint256[] memory _productids) public view returns (product_status[] memory statuses) 
    {
        uint256 length = _productids.length;  
        statuses = new product_status[](length); 
    
        for (uint256 i = 0; i < length; i++) { 
            require(products[_productids[i]].is_existed, "Product does not exist");
            statuses[i] = products[_productids[i]].status;
        }
    }

// Internal: Add trace record
function _addTracerecord(
    uint256 _productid,
    string memory _action,
    string memory _location,
    string memory _metadata
)internal {
    Trace_record memory newRecord=Trace_record({
        timestamp: block.timestamp,
        participant: msg.sender,
        participation_Type: participantTypes[msg.sender],
        action: _action,
        location: _location,
        metadata: _metadata
    });
    producttrace[_productid].push(newRecord);
    emit TraceAdded(_productid, msg.sender, _action);
}

// Internal: Get status action text
function _getStatusaction(product_status _status) internal pure returns (string memory){
     if (_status == product_status.InProduction) return "Production Started";
        if (_status == product_status.Produced) return "Production Completed";
        if (_status == product_status.InTransit) return "In Transit";
        if (_status == product_status.Shipped) return "Shipped for Delivery";
        if (_status == product_status.Instore) return "Arrived at Store";
        if (_status == product_status.sold) return "Product Sold";
        if (_status == product_status.Recalled) return "Product Recalled";
        return "Status Updated";
}
}
