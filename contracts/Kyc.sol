// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Kyc{
  //For customer category
  enum customertype{Individual,Industry}
  //customer number
  uint public customernumber;
  struct regcustomer
  {
    
    //address of customer
        address acountno; 
    // customer category
        customertype customertcategory;
    //  customer number
        uint customerno;
  }
  
  // For storing address of customer with registration number
   mapping(address=>regcustomer)public registration; 
  

   //Function for Customer Signup
    function signup(customertype _category)public
        {
          //increments customer no
            customernumber++;
          
          //stores address of customer
            registration[msg.sender].acountno=msg.sender;
          
          //stores category of customer 
            registration[msg.sender].customertcategory=_category;
            
          //stores Customer Number
            registration[msg.sender].customerno=customernumber;

        }
    

     }