// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
import "./Owner.sol";

contract Waterexchange is Owner
{
    //No of Tokens for 1000 litre 
    uint public baserate=1;

    //To count no of exchanges
    uint public exchangeCount;
 
    //To store total quantity of water in the exchange   
    uint public totalDrinkingWater;

    //To store total quantity of water in the exchange
    uint public totalNonDrinkingWater;

    //Region of Exchange
    enum cluster{Central,North,South}   
    
    //To store exchange details
    struct localExchangedetail 
    {
       
        uint  drinkingWaterquantity;
        uint  nonDrinkingwaterQuantity;
        uint exchangeNumber;
        bool registered;
        string location;
        string certificate;
        cluster region;
        address exchangeAddress;
    }
    
    //To store Exchange tokenrates
    struct tokenrate
    {
        uint nondrinkingtokenrate;
        uint drinkingtokenrate;
        uint industrynondrinkingtokenrate;
        uint industrydrinkingtokenrate;
        uint deliverycharge;
    }
   
    //To store exchange details
    mapping(address=>localExchangedetail)public localExchange;
    
    //To store exchange tokenrate details
    mapping(address=>tokenrate)public localExchangetokenrate;
    
    //To store registered exchange address with exchange number  
    mapping(uint=>address) public exchange;

   
   function registerExchange(address _exchangeaddr,string memory _location,cluster _region,string memory _certificatehash) public onlyOwner
        
        {
        // Incrementing Exchange Number
            exchangeCount++;
        
        // Storing Exchange Address With Exchange number
            exchange[exchangeCount] = _exchangeaddr;
        
        //Storing Exchange Number
            localExchange[_exchangeaddr].exchangeNumber = exchangeCount ;         
        
        // To flag whether Exchange is registered or not 
            localExchange[_exchangeaddr].registered = true; 

        // location of exchange
            localExchange[_exchangeaddr].location = _location;
        
        // Storing Exchange Address With Exchange With Exchange Address
            localExchange[_exchangeaddr].exchangeAddress = _exchangeaddr;
        
        // Storing Exchange Region With Exchange Address
            localExchange[_exchangeaddr].region = _region;
        
        // Storing Exchange Registration certificate IPFS hash With Exchange Address
            localExchange[_exchangeaddr].certificate = _certificatehash;
 
        }
    
        //Function For Water Exchanges To Increment Water 
    function  incrementWater (uint _mintamount, uint _watertypes,uint waterlevel)public
    
    {
        //If Water Type Is Drinking
        if(_watertypes==0)
        {
            //Increments Drinking Water Quantity
            localExchange[msg.sender].drinkingWaterquantity += _mintamount;
            
            //Updating Drinking waterrate of individual category with value given by the function ratecalculator
            
            //Ratecalculator Uses Damwater Level, Watertype & Buyertype In That Region To Calculate Water Price 
            localExchangetokenrate[msg.sender].drinkingtokenrate = ratecalculator(waterlevel, _watertypes,0);
           
            //Updating Drinking waterrate of industry category with value given by the function ratecalculator
            localExchangetokenrate[msg.sender].industrydrinkingtokenrate = ratecalculator(waterlevel, _watertypes,1);
            
            //Increments Oxidane Total Drinking Water
            totalDrinkingWater += _mintamount;
        }
        
        //If Water Type Is Non-Drinking
           if(_watertypes==1)
        {
            //Increments Non-Drinking Water Quantity
            localExchange[msg.sender].nonDrinkingwaterQuantity += _mintamount;
            
            //Updating Non-Drinking waterrate of individual category with value given by the function ratecalculator
            //Ratecalculator Uses Damwater Level & Watertype In That Region To Calculate Water Price 
            localExchangetokenrate[msg.sender].nondrinkingtokenrate = ratecalculator(waterlevel, _watertypes,0);
            
             //Updating Non-Drinking waterrate of industry category with value given by the function ratecalculator
            localExchangetokenrate[msg.sender].industrynondrinkingtokenrate = ratecalculator(waterlevel, _watertypes,1);
            
            //Increments Oxidane Total Non-Drinking Water
            totalNonDrinkingWater += _mintamount;

        }

        

    }

//Function To Buy Drinking Water
function buyDrinkingWater(uint _quantity,address _localexchange)public
    {
        // Buyer cant be himself
        require(msg.sender!=_localexchange,"Exchange cant buy");
        
        //Cant buy zero quantity
        require(_quantity!=0,"Exchange cant buy");
       
        //Cant buy more quantity than what exchange have
        require(localExchange[_localexchange].drinkingWaterquantity>=_quantity,"Not enough water in Exchange");
        
        //Reducing the quantity from drinking water balance of exchange
        localExchange[_localexchange].drinkingWaterquantity -= _quantity;
        
        //Reducing the quantity from drinking water balance of oxidane
        totalDrinkingWater -= _quantity;
   
    }

//Function To Buy Non-Drinking Water
function buyNonDrinkingWater(uint _quantity,address _localexchange)public
    {
        // Buyer cant be himself
        require(msg.sender!=_localexchange,"Exchange cant buy");
        
        //Cant buy zero quantity
        require(_quantity!=0,"Exchange cant buy");
        
        //Cant buy more quantity than what exchange have
        require( localExchange[_localexchange].nonDrinkingwaterQuantity>=_quantity,"Not enough water in Exchange");
       
        //Reducing the quantity from drinking water balance of exchange
        localExchange[_localexchange].nonDrinkingwaterQuantity -= _quantity;
         
        //Reducing the quantity from drinking water balance of oxidane
        totalNonDrinkingWater -= _quantity;
   
    }
//Function to calculate token rate per 1000litre
// This function use the Waterlevel Percentage of dam in each exchange cluster region to calculate token rate
// Tokenrate is inversly proportional to waterlevel
function ratecalculator(uint _percentage,uint _type,uint buyertype) public view returns(uint)
{
        //creating a temporary instance of struct  tokenrate for temporary storage variable
            tokenrate memory tempstorage;
        //If Water Type is Drinking
        if(_type==0)
        {
            //If waterlevel percentage is greater or equal to 95%  then 1000l will cost 5 OXD
            if(_percentage >= 95)
            {
                tempstorage.drinkingtokenrate = baserate*5;
            }
            
            //If waterlevel percentage is between 90 and 95 % then 1000l will cost 6 OXD
            else if(_percentage < 95 && _percentage>=90)
            {
                tempstorage.drinkingtokenrate = baserate*6;
            }
            
            //If waterlevel percentage is between 90 and 85 then 1000l will cost 7 OXD
            else if(_percentage < 90 && _percentage>=85)
            {
            tempstorage.drinkingtokenrate = baserate*7;
            }
            
            //If waterlevel percentage is less than 85 then 1000l will cost 8 OXD
            else
            {
            tempstorage.drinkingtokenrate = baserate*8;
            }
        }
        
        //If Water Type is Non-Drinking
        if(_type==1)
        {
            //If waterlevel percentage is greater or equal to 95  then 1000l Non-Drinking water will cost 3 OXD
            if(_percentage >= 95)
            {
                tempstorage.drinkingtokenrate = baserate*3;
            }
            
            //If waterlevel percentage is between 90 and 95 then 1000lNon-Drinking water will cost 4 OXD
            else if(_percentage < 95 && _percentage>=90)
            {
                tempstorage.drinkingtokenrate = baserate*4;
            }
            
            //If waterlevel percentage is between 90 and 85 then 1000lNon-Drinking water will cost 5 OXD
            else if(_percentage < 90 && _percentage>=85)
            {
                tempstorage.drinkingtokenrate = baserate * 5;
            }
            
            //If waterlevel percentage is less than 85 then 1000lNon-Drinking water will cost 6 OXD
            else
            {
                tempstorage.drinkingtokenrate = baserate * 6;
            }  
        }
        
        //if buyertype is of industry type
        if(buyertype==1)
        {
            //User have to pay additional token
            tempstorage.drinkingtokenrate+=1;
        }
        
        //returns the calculated value
    return tempstorage.drinkingtokenrate;
}

//Function to Update Delivery Charge
function deliverycharge(uint _charge)public
{
//Stores delivery charge with Water-exchange address
localExchangetokenrate[msg.sender].deliverycharge =_charge;

}
  
}