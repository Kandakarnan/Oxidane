// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
import "./OxidaneToken.sol";

contract TokenSale
{
    //Token Contract instance state-variable
    OxidaneToken public token;
    
    //Rate of Token in Dollar
    uint public rate =1 ;//dollar - rate of 1 token
    
    //For Storing Total number of Token purchases
    uint public tokenpurchasenumber;
    
    // For Storing Total Sum of Token price(For Finding avg Token Price in market)
    uint public etherpricesum;
    
    // For buyer Type
   enum buyertype{individual,industry}
   
    //For Storing Tokenamount of token Purchase for restricting daily limits
    mapping(address=>uint) tokenamount;
    
    //For Storing Timestamp of token Purchase for restricting daily limits
    mapping(address=>uint) timestamp;
    
    //Event For Token PUrchase
    event TokenPurchase(address account,uint amount,uint customerno,uint time);
    
    //Event For Token Selling
    event TokensSold(address account, uint amount);

    //Struct for temporary stoage variable
      struct tempstorage
      {
          uint numberstore;
      }  
        
        constructor(OxidaneToken _token)public
        {
        //Creating Token Instance
        token = _token;
        
        }
   
    //Function For buying Tokens and receiving payement
    function buyTokens(uint _tokenAmount,uint etherprice,uint buyer,uint customerno) public payable
    {
        //Creates Temporary instance of struct for temporary variable
        tempstorage memory tempvar;
        
        //Prevents Token Purchase if tokenbalance of contract is below the purchase amount
        require(_tokenAmount <= token.balanceOf(address(this)),"Not Enough Balance");
        
        //Prevents user from purchasing tokens with zero price 
        require(etherprice != 0,"EtherPrice cant be zero");

        //if buyer is of individual type
        if(buyer==0)
        {
            //Daily limit for Individual category is 50 tokens
            tempvar.numberstore=50;
        }
        //if buyer is of industry type
        if(buyer==1)
        {
            //Daily limit for Industry category is 100 tokens
            tempvar.numberstore=100;
        }
        //checks whether quantity is less than daily limit
        require(_tokenAmount<= tempvar.numberstore,"Token amount is beyond your category limit");
            
        //checks whether user is buying for first time in a day or not
        if(timestamp[msg.sender]+24 hours>now)
        {
          // if it is not first time then checks the sum of todays purchase quantity & current purchase quantity is less than quantitty
          require(tokenamount[msg.sender] +_tokenAmount<= tempvar.numberstore,"Exceeded Daily-limit");
        }
         else
        {
          // Timestamp of previous purchase is set to zero if its first purchase in a day
          timestamp[msg.sender]=0;
          
          //Total purchase quantity of previous purchase is set to zero
          tokenamount[msg.sender]=0;
        }
        
            //Transfer Token from contract to buyer
            token.transfer(msg.sender,_tokenAmount);
        
            //sums token-etherprice (Used for calculating avg token-price in market)
            etherpricesum+=etherprice;
        
            //Increments Total number of Token purchases
            tokenpurchasenumber++;
        
            //Tokenamount is stored for Daily-Limit
            tokenamount[msg.sender]+=_tokenAmount;
           
           //Timestamp is stored for Daily-Limit
            timestamp[msg.sender]=now;
            
        //Emits event after purchase
        emit TokenPurchase(msg.sender,_tokenAmount,customerno,now);

    }
    
        //Function to Sell Tokens 
    function sellTokens(uint _amount,uint _etherAmount) public 
    {
        //User cant sell Zero Tokens
        require(_amount!=0,"Tokenamount Cant be zero");
        
        // User can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount,"You dont have enough balance");

        // Require Contract has enough Ether
        require(address(this).balance >= _etherAmount,"Contract dont have enough ether to sell tokens");

        // Transfer Token from seller to this contract
        token.transferFrom(msg.sender, address(this), _amount);
    
        //Transfering ether to token seller
        msg.sender.transfer(_etherAmount);

        // Emit an event
        emit TokensSold(msg.sender, _amount);
    }


}