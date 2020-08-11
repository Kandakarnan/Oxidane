//SPDX-License-Identifier: MIT
pragma solidity^0.6.0;
import "./Waterexchange.sol";
import "./OxidaneToken.sol";
contract Watersale 
{
  
  //For Instance Of Waterexchange Contract
  Waterexchange public exchange;
  
  //For Token Contract Instance
  OxidaneToken public token;

  //Global Unique Number for Each Water Purchase
  uint public globalpurchasenumber;

  //Supply Chain State
  enum state {Paid,Delivered,Received,Rejected}

  //Unique Number for purchase in each water Exchange stored with water exchange address
  mapping (address=>uint) public purchaseNumber;
  
  //Unique Number for water delivery in each water Exchange stored with water exchange address
  mapping (address=>uint) public deliveryNumber;

  struct details
  {
    uint  quantity;//Stores water quantity
    uint _purchasenumber;//Stores Exchange Purchase Number
    uint globalno;// Stores Global unique Purchase number
    uint tokenamount;// Stores Tokenamount
    uint time;// Stores Timestamp
    uint watertype;//Stores Watertype
    bool pending;//Stores Pending status
    address customeraddr;// Stores Customer address 
    address customer;// For Temporary variable
    string location;//Stores Location
    state status;//Stores Purchase Status

  }
  //Stores  purchase details for water exchange with exchange address and exchange's purchasenumber
  mapping(address=>mapping(uint =>details)) public exchangePurchasedetails;

  //Stores count of total no of waterpurchases with user address
  mapping(address=>uint) public userpurchaseno;

  //Stores  user global purchasenumber with user address & user purchase no
  mapping(address=>mapping(uint =>uint)) public userglobalnoretriever;

  //Stores  purchase details for user with user address and global purchaseno
  mapping(address=>mapping(uint =>details)) public userpurchasedetails;
  
  //Stores whether a pending state is present between an exchange and user 
  //which is used to prevent further purchase-only one purchase cycle is allowed at a time,
  //purchase cycle will end only after received state or reject state
  mapping(address=>mapping(address =>bool)) public pending;
  
  //stores timestamp with user address & watertype-used for daily purchase limit
  mapping(address=>mapping(uint=>uint))timestamp;
  
  //stores daily balance of token with user address & watertype
  mapping(address=>mapping(uint=>uint))wateramount;
 
  //Event For Water Purchase
   event WaterPurchase(address indexed exchangeaddr,uint  indexed _purchaseNumber,uint indexed globalpurchasenumber,uint _quantity,uint256 _time,string _deliverylocation,uint tokenamount,uint customerno,uint watertype,string phoneno);
  
  //Event For WATER Delivery From Exchange 
   event WaterDelivery(address indexed exchangeaddr ,uint indexed  globalpurchasenumber,uint256 _time,uint tokenamount,uint watertype,uint quantity);
  
  //Event  For  Delivery confirmation 
   event DeliveryConfirmation(address indexed exchangeaddr ,uint indexed globalpurchasenumber,uint256 _time,uint customerno,uint watertype,uint quantity);
   
    //Event  For  Delivery confirmation
   event DeliveryRejection(address indexed exchangeaddr ,uint indexed globalpurchasenumber,uint256 _time,address customer);

  constructor(Waterexchange _exchange,OxidaneToken _token) public
  {
    
    //EXCHANGE INSTANCE
     exchange = _exchange;
     
     //TOKEN INSTANCE
     token = _token;
  }
   
     //FUNCTION FOR WATER PURCHASE AFTER TOKEN TRANSFER
  function waterPurchase(uint _quantity,address _localexchange,uint _tokenamount,string memory _deliverylocation,uint _watertype,uint _customertype,uint customerno,string memory phoneno)public 
  {

       //creating a temporary instance of struct details for temporary storage variable
        details memory tempvar;

       
    //If watertype is Drinking
    if(_watertype==0)
      {
        
          //if customer is of category individual
          if(_customertype==0)
        {
          // daily drinking water buy limit is set to 5000l
          tempvar.quantity=5;
        }
        //if customer is of category industry
        else
        {
          // daily drinking water buy limit is set to 10,000l
          tempvar.quantity=10;
        }
        
        //checks quantity is less than or equal to dailylimit
        require(_quantity<=tempvar.quantity,"You are not allowed to buy this quantity");
        
        //checks whether user is buying for first time in a day or not
        if(timestamp[msg.sender][0]+24 hours>now)
        {
          // if it is not first time then checks the sum of todays purchase quantity & purchase quantity is less than quantitty
          require(wateramount[msg.sender][0] +_quantity<= tempvar.quantity,"exceeded limit");
        }
        //if its for the first time in a day
        else
        {
          // timestamp of previous purchase is set to zero for drinking water
          timestamp[msg.sender][0]=0;
          
          //total purchase quantity of previous purchase is set to zero for drinking water
          wateramount[msg.sender][0]=0;
        }
            // performing water buying
           exchange.buyDrinkingWater(_quantity,_localexchange);
           
           //Timestamp is set for daily limit for drinkingwater
            timestamp[msg.sender][0]=now;
            
            // quantity is set for daily limit for drinkinwater
           wateramount[msg.sender][0]+=_quantity;
        }
    //If watertype is of type Non- Drinking
    if (_watertype==1)
      {
     //if customer is of category individual
          if(_customertype==0)
        {
          
          // Daily non-drinking water buy limit is set to 10000l 
          tempvar.quantity = 10;

        }
        //if customer is of category industry
        else
        {
          // daily non-drinking water buy limit is set to 30,000l
          tempvar.quantity = 30;
        }
        
        //checks quantity is less than or equal to dailylimit
        require(_quantity<=tempvar.quantity,"You are not allowed to buy this quantity");

        //checks whether user is buying for first time in a day or not
        if(timestamp[msg.sender][1]+24 hours>now)
        {
           // if it is not first time then checks the sum of todays purchase quantity & purchase quantity is less than quantitty
          require(wateramount[msg.sender][1] +_quantity<= tempvar.quantity,"exceeded limit");
        }
         //if its for the first time in a day
        else
        {
          // timestamp of previous purchase is set to zero for non-drinking
          timestamp[msg.sender][0]=0;
         
          //total purchase quantity of previous purchase is set to zero for non-drinking
          wateramount[msg.sender][0]=0;
        
        }
         
         // performing water buying
        exchange.buyNonDrinkingWater(_quantity,_localexchange);
        
        //Timestamp is set for daily limit
        timestamp[msg.sender][1]=now;
        
        // quantity is set for daily limit
        wateramount[msg.sender][1]+=_quantity;     
   }     
        
        //purchase no of local exchange is incremented 
        purchaseNumber[_localexchange]+=1;
        
        //global purchase number is incremented
        globalpurchasenumber++;
      
      //########## USER LEDGER UPDATION PART-START ########## 
        
        //user purchase no is incremented
        userpurchaseno[msg.sender]+=1;
        
        //stores globalpurchase number with user address & purchaseno
        userglobalnoretriever[msg.sender][userpurchaseno[msg.sender]]=globalpurchasenumber;
        
        //updating user globalpurchaseno state to Paid state
        userpurchasedetails[msg.sender][ globalpurchasenumber].status=state.Paid;
        
        //stores exchange purchaseno  with user address & global
        userpurchasedetails[msg.sender][ globalpurchasenumber]._purchasenumber= purchaseNumber[_localexchange];
        
        //stores tokenamount for each purchase
        userpurchasedetails[msg.sender][ globalpurchasenumber].tokenamount=_tokenamount;
        
        //Stores Watertype with user global number
         userpurchasedetails[msg.sender][ globalpurchasenumber].watertype=_watertype;
         
        //Stores quantity with user global number
         userpurchasedetails[msg.sender][ globalpurchasenumber].quantity=_quantity;
         //########## USER LEDGER UPDATION PART-END ##########



        //########## WATER EXCHANGE LEDGER UPDATION PART-START ##########
        
        //updating Water Exchange purchaseno state to Paid state
        exchangePurchasedetails[_localexchange][purchaseNumber[_localexchange]].status=state.Paid;
        //stores customer address with water exchange address & exchange purchase no
        exchangePurchasedetails[_localexchange][purchaseNumber[_localexchange]].customeraddr=msg.sender;
        // stores exchange purchase number with exchange address and exchange purchase number
        exchangePurchasedetails[_localexchange][purchaseNumber[_localexchange]]._purchasenumber=purchaseNumber[_localexchange];
        //stores global purchase number with exchange addres with exchange address and purchase number
        exchangePurchasedetails[_localexchange][purchaseNumber[_localexchange]].globalno=globalpurchasenumber;
        
        //########## WATER EXCHANGE UPDATION PART-END ##########

          //Purchase Pending state is acivated between user and exchnage
            pending[msg.sender][_localexchange]=true;
          //EMITTING EVENT AFTER PURCHASE
           emit WaterPurchase(_localexchange, purchaseNumber[_localexchange],globalpurchasenumber,_quantity,now,_deliverylocation,_tokenamount,customerno,_watertype,phoneno);
      }

//Function for fetching exchange purchase details
function getExchangepurchaseDetails(address _localexchange, uint _purchaseNumber) public view returns (state status,address customerAddress,uint purchasenumber)
{
      //returns the state of purchase number
        status= exchangePurchasedetails[_localexchange][_purchaseNumber].status;
        
      //returns customer address of purchase number
        customerAddress=exchangePurchasedetails[_localexchange][_purchaseNumber].customeraddr;
      
      //returns purchase number
        purchasenumber=exchangePurchasedetails[_localexchange][_purchaseNumber]._purchasenumber;
}

//Function for fetching user purchase status
function getUserpurchaseStatus (address _user,uint _globalpurchasenumber)public view  returns(state status)
{
          // returns the state of global purchase number
       status = userpurchasedetails[_user][_globalpurchasenumber].status;
       
}

// Function for Water exchange to trigger Delivery
function triggerDelivery(uint _purchasenumber,uint _timestamp) public
  {
    //Preventing User From Triggering Asynchronous Delivery
    require(_purchasenumber==deliveryNumber[msg.sender]+1,"Not Following First-In First-Out ");
      
      //Updating the state of purchase number from Paid to Delivered in exchange details
      exchangePurchasedetails[msg.sender][_purchasenumber].status=state.Delivered;
      
      //incrementing delivery number
      deliveryNumber[msg.sender]+=1;
      
      //Creating temporary instance of struct detail for a temporary variable
      details memory customer;
      
      //customer address of purchasenumber is fetched
      customer.customer= exchangePurchasedetails[msg.sender][_purchasenumber].customeraddr;
      
      //Global purchase number of purchasenumber is fetched
      customer.globalno=exchangePurchasedetails[msg.sender][_purchasenumber].globalno;
      
      //User Purchase detail state is updated from Paid to Delivered
      userpurchasedetails[customer.customer][customer.globalno].status=state.Delivered;
    
    //Emits Delivery Event
    emit WaterDelivery(msg.sender,customer.globalno,_timestamp,
    userpurchasedetails[customer.customer][ customer.globalno].tokenamount,
    userpurchasedetails[customer.customer][ customer.globalno].watertype,
    userpurchasedetails[customer.customer][ customer.globalno].quantity
    );
}

//Function for user to confirm Delivery
function Confirmation(uint _globalpurchaseno,address _localExchange,uint customerno) public
{
    details memory tempvar;
  
  //Fetching and storing water-exchange purchase number in temporary variable
   tempvar._purchasenumber=userpurchasedetails[msg.sender][_globalpurchaseno]._purchasenumber;
  
  //Exchange purchasenumber is set rejected
   exchangePurchasedetails[_localExchange][tempvar._purchasenumber].status=state.Received;

  //Transfer Tokens from user to exchange
    token.transferFrom(msg.sender,_localExchange,userpurchasedetails[msg.sender][_globalpurchaseno].tokenamount);
  
  //tokenmaount for that purchasenumber is set to zero 
    userpurchasedetails[msg.sender][_globalpurchaseno].tokenamount = 0;
  
  //User purchase  detail state is updated from delivered to Received
    userpurchasedetails[msg.sender][_globalpurchaseno].status = state.Received;
  
  //Pending state is upadted to false since supplychain cycle came to end
    pending[msg.sender][_localExchange]=false;
  
  //Emits Delivery Event
  emit DeliveryConfirmation(_localExchange,_globalpurchaseno,now,customerno,
  userpurchasedetails[msg.sender][ _globalpurchaseno].watertype,
  userpurchasedetails[msg.sender][ _globalpurchaseno].quantity
  );
}

//Function for user to reject delivery if delayed(can be used only after three hour of delivery)
function rejectdelivery(uint _globalpurchaseno,address _exchangeaddr )public
{
   details memory tempvar;
  
  //Fetching and storing water-exchange purchase number in temporary variable
   tempvar._purchasenumber=userpurchasedetails[msg.sender][_globalpurchaseno]._purchasenumber;
  
  //Exchange purchasenumber is set rejected
   exchangePurchasedetails[_exchangeaddr][tempvar._purchasenumber].status=state.Rejected;
  
  //tokenmaount for that purchasenumber is set to zero 
    userpurchasedetails[msg.sender][_globalpurchaseno].tokenamount = 0;
 
 //User purchase  detail state is updated from delivered to Received 
    userpurchasedetails[msg.sender][_globalpurchaseno].status = state.Rejected;
 
 //Pending state is upadted to false since supplychain cycle came to end
    pending[msg.sender][_exchangeaddr]=false;


emit DeliveryRejection(_exchangeaddr,_globalpurchaseno,now,msg.sender);

}

//Function to fetch Pending Status of an user and exchange
function getstatus(address _exchangeaddr)public view returns(bool status)
{
  status = pending[msg.sender][_exchangeaddr];
}


}