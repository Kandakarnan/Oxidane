const axios=require("axios");

export const checkethprice=()=>{
   //Fetching Etherprice in dollars
    return axios.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD").then(response=>{
        // console.log(response.data.USD);     // test-point
        return JSON.stringify(response.data.USD)   
  
      })
    
}
