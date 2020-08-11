const { assert } = require("chai");

const Waterexchange = artifacts.require("Waterexchange");

require("chai").use(require("chai-as-promised")).should();

contract("Waterexchange", ([account, exchange,exchange2,buyer]) => {
  let waterexchange;
  before(async () => {
    waterexchange = await Waterexchange.new();
  });

  //Test for Exchange Registration
  describe(" Exchange Registration", async () => {
    it("check registration", async () => {
      let reglocation="tvm"
      let regcertificatehash="1234"
      let regcluster=0
      result = await waterexchange.registerExchange(exchange,reglocation,regcluster,regcertificatehash, {
        from:account,
      });
      //Checks whether exchange number count is incremented
      let count = await waterexchange.exchangeCount();
      assert.equal(count, 1, "Exchange count not incremented");
      //Checks whether exchange address is stored with exchange number
      let account2=await waterexchange.exchange(count)
      assert.equal(account2,exchange, "Exchange address not added");
      //Checks Exchange Details
      let exchangedetail = await waterexchange.localExchange(exchange);
      //Checks whether exchange registered state changed to true
      let registered =  exchangedetail.registered;
      assert.equal(registered,true, "Exchange not registered");
      //Checks exchange location
      let location = exchangedetail.location;
      assert.equal(location,reglocation, "location not registered");
       //Checks exchange account address
      let exchangeaddress = exchangedetail.exchangeAddress;
      assert.equal(exchangeaddress,exchange, "account address not registered");
      //Checks exchange region
      let region = exchangedetail.region;
      assert.equal(region,regcluster, "region not registered");
      //Checks exchange registration certificate hash
      let certificatehash = exchangedetail.certificate;
      assert.equal(certificatehash,regcertificatehash, "certificate not registered");
    });
  });

  //Test for Updating water updation of exchange
  describe("incrementwater()", async () => {
      let incrementqty=3
      let category=0//Drinking water category-0/non-drinking-1
      let waterlevelpercentage=90//rate for 90 percentage dam water level is 6 tokens for 1000l
    it("check Drinking Water updation", async () => {
      result = await waterexchange.incrementWater(incrementqty,category,waterlevelpercentage,{ from:exchange });
      //Fetching EXchange details after incrementing
      let exchangedetail = await waterexchange.localExchange(exchange);
      //Checks drinking water quantity
      let quantity =  exchangedetail.drinkingWaterquantity;
      assert.equal(quantity,incrementqty, "water not upgraded");
      let tokenratedetail = await waterexchange.localExchangetokenrate(exchange);
      //Checks Drinking water rate when water level in dam is 90%
      let rate=tokenratedetail.drinkingtokenrate
      assert.equal(rate,6, "water not upgraded");
    });
  });

 //Test for checking water buying from exchange
 describe("buyDrinkingWater()", async () => {
    let incrementqty=3
    let category=0//Drinking water category-0/non-drinking-1
    let waterlevelpercentage=90//rate for 90 percentage dam water level is 6 tokens for 1000l

    //Incrementing water in exchange before testing
  before(async () => {
    result = await waterexchange.incrementWater(incrementqty,category,waterlevelpercentage,{ from:exchange2 });
  })
//Triggering DrinkingWater buying function
  it("check Drinking water buying", async () => {
      let buyquantity=1
    //Triggering DrinkingWater buying function
    await waterexchange.buyDrinkingWater(buyquantity,exchange2, { from:buyer});
    //Checking water quantity after purchasing
    let exchangedetail = await waterexchange.localExchange(exchange2);
    let quantity = exchangedetail.drinkingWaterquantity;
    let balanceqty=incrementqty-buyquantity
    //checking remaining quantity in exchange is equal to difference of intial quantity and bought
    assert.equal( quantity,balanceqty, "waterbuy not working");
  });
});

//Test for checking Non-Drinking water buying from exchange
describe("buyNonDrinkingWater()", async () => {
    let incrementqty=3
    let category=1//Drinking water category-0/non-drinking-1
    let waterlevelpercentage=90//rate for 90 percentage dam water level is 6 tokens for 1000l

     //Incrementing water in exchange before testing
  before(async () => {
    result = await waterexchange.incrementWater(incrementqty,category,waterlevelpercentage,{ from:exchange2 });
  })
//Triggering Non-Drinking Water buying function
  it("check NonDrinking water buying", async () => {
      let buyquantity=1
      //Triggering Non-Drinking Water buying function
     await waterexchange.buyNonDrinkingWater(buyquantity,exchange2, { from:buyer});
     //Checking water quantity after purchasing
    let exchangedetail = await waterexchange.localExchange(exchange2);
    let quantity = exchangedetail.nonDrinkingwaterQuantity;
    let balanceqty=incrementqty-buyquantity
     //checking remaining quantity in exchange is equal to difference of intial quantity and bought
    assert.equal( quantity,balanceqty, "waterbuy not working");
  });
});

//Test For Rate Calculation Function
describe("ratecalculator()", async () => {
it("Check Rate Calculation of Token Per 1000 litres of Drinking water", async () => {
  let category=0//Drinking water category-0/non-drinking-1
  let waterlevelpercentage=90//rate for 90 percentage dam water level is 6 tokens for 1000l
  let buyertype=0//buyertype=0 for individual 1 for industry
  //Triggering rate calculation function
  let result= await waterexchange.ratecalculator( waterlevelpercentage,category,buyertype,{ from:buyer});
  assert.equal( result,6, "waterbuy not working");
});

it("Check Rate Calculation of Token Per 1000 litres of Non-Drinking water", async () => {
  let category=1//Drinking water category-0/non-drinking-1
  let waterlevelpercentage=90//rate for 90 percentage dam water level is 4 tokens for Non-drinking 1000l
  let buyertype=0//buyertype=0 for individual 1 for industry
  let result= await waterexchange.ratecalculator( waterlevelpercentage,category,buyertype,{ from:buyer});
  assert.equal( result,4, "waterbuy not working");
});
});

});
