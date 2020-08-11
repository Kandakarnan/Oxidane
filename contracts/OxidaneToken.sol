// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract OxidaneToken {
    string  public name = "Oxidane Token";//Token Name
    string  public symbol = "OXD"; // Symbol of Token
    string  public standard = "OXD Token v1.0"; //version of Token
    uint256 public totalSupply =  1000000000000000000000000; // Total Supply of Tokens

    //Event for Transfer Function (Emits when token transfer from contract to customer-ERC 20 STD)
    event Transfer(address indexed _from,address indexed _to,uint256 _value);

    //Event for Approve Function (Emits when token is allocated from owner to Spender-ERC 20 STD)
    event Approval(address indexed _owner,address indexed _spender,uint256 _value);

    //For Storing Token balance with address
    mapping(address => uint256) public balanceOf;
    
    //For Storing Token allowance of owner with Spender address
    mapping(address => mapping(address => uint256)) public allowance;

    //sets total token balance to contract owner
    constructor () public
    {
        balanceOf[msg.sender] = totalSupply;
    }
    
    //Function To Transfer Tokens From contract to beneficiary 
    function transfer(address _to, uint256 _value) public returns (bool success) 
    
    {
        //Prevents Token Self Transfer
        require(_to!=msg.sender,"You cant transfer Token to yourself");
        
        //Prevents Zero Token Transfer
        require(_value!=0,"You cant transfer Zero Token");
        
        //Prevents Token Transfer if quantity is more the balance of contract
        require(balanceOf[msg.sender] >= _value,"Not enough Balance");
        
        //Token balance of contract is reduced
        balanceOf[msg.sender] -= _value;
        
        //Token balance of beneficiary is increased
        balanceOf[_to] += _value;
        
        //Emits event
        emit Transfer(msg.sender, _to, _value);
        
        //return true if transaction is Success (Part of ERC 20-standard)
        return true;
    }

    //Function for Allocation of Token Allowance with Spender
    function approve(address _spender, uint256 _value) public returns (bool success) 
    {
        //Prevents From Allocating Tokens To Themselves
        require(_spender!=msg.sender,"You cant allocate  Token to yourself");
        
        //Prevents Zero Token Allowance
        require(_value!=0,"You cant transfer Zero Token");
        
        //Prevents Token Allowance if quantity is more the balance of owner
        require(_value <= balanceOf[msg.sender],"Not Enough balance to approve");
        
        //Updating Allowance
        allowance[msg.sender][_spender] = _value;

        //Emits event 
        emit Approval(msg.sender, _spender, _value);
        
        //return true if transaction is Success (Part of ERC 20-standard)
        return true;
    }

    // Function For Transforing Tokens From One Account To another after Approval
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) 
    {   
        //Prevents Token Self Transfer
        require(_from!=_to,"You cant tranfer tokens to yourself");
        
        //Prevents Zero Token Transfer
        require(_value!=0,"You cant tranfer zero tokens");
        
        //Prevents Token Transfer if quantity is more the balance of contract
        require(_value <= balanceOf[_from],"Not Enough balance to transfer");
        
        //Prevents Token Transfer if quantity is more the allowance of spender
        require(_value <= allowance[_from][_to],"Not Enough allowance");
        
        //Token balance of owner is reduced
        balanceOf[_from] -= _value;
        
        //Token balance of beneficiary is increased
        balanceOf[_to] += _value;
        
        // Allowance of spender is reduced
        allowance[_from][_to] -= _value;
        
        //Emits event
        emit Transfer(_from, _to, _value);
        
        //return true if transaction is Success (Part of ERC 20-standard)
        return true;
    }
 
    //Function to decrease allowance of Spender
 function decreaseAllowance(address spender,uint256 subtractedValue)public returns (bool)
  {
    //Prevents From Deallocating Tokens To Themselves
    require(spender != msg.sender,"You are not allowed to make self allowance change");
    
    //Prevents Zero Token Deallocating
    require(subtractedValue != 0,"You are not changing any allowance");
    
    //Reducing allowance balance of spender
    allowance[msg.sender][spender] = (allowance[msg.sender][spender]-(subtractedValue));
    
    //Emits event
    emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
    
    //return true if transaction is Success (Part of ERC 20-standard)
    return true;
  }
  //Function to get allowance value
 function getallowance(address _from,address _to)public view returns(uint)
 {
      return allowance[_from][_to];
 }
}