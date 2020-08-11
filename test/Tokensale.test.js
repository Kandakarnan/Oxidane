const OxidaneToken = artifacts.require("OxidaneToken");
const TokenSale = artifacts.require("TokenSale");

require("chai").use(require("chai-as-promised")).should();
const chai = require("chai");
const expect = chai.expect;

contract("Tokensale", ([deployer, buyer, seller]) => {
  before(async () => {
    //Creating Token contract instance
    oxidanetoken = await OxidaneToken.new();
    //Creating Tokensale contract instance
    tokensale = await TokenSale.new(oxidanetoken.address);
    // Transfer all tokens to tokensale contract
    await oxidanetoken.transfer(tokensale.address, 1000);
  });
  //Checks Token Name
  describe("Token deployment", async () => {
    it("contract has a name", async () => {
      const name = await oxidanetoken.name();
      assert.equal(name, "Oxidane Token");
    });
  });
  //Checks Tokensale contract token balance
  describe("Tokensale deployment", async () => {
    it("contract has tokens", async () => {
      this.balance = await oxidanetoken.balanceOf(tokensale.address);
      assert.equal(this.balance, 1000);
    });
  });

  //Checks Token buying
  describe("buyTokens()", async () => {
    let result;

    this.buyamount = 50;
    this.etherprice = 100;
    this.category = 0;
    this.customerno = 1;
    // Purchase tokens before each test
    before(async () => {
      let category = 0;
      // Purchase tokens before each test
      result = await tokensale.buyTokens(50, 100, category, this.customerno, {
        from: buyer,
        value: web3.utils.toWei("1", "ether"),
      });
    });

    it("Check Token Buying", async () => {
      // Check investor token balance after purchase
      let investorBalance = await oxidanetoken.balanceOf(buyer);
      assert.equal(investorBalance, this.buyamount);

      // Check tokensale contract balance after purchase
      let tokenSaleBalance;
      tokenSaleBalance = await oxidanetoken.balanceOf(tokensale.address);
      assert.equal(tokenSaleBalance, this.balance - this.buyamount);
      tokenSaleBalance = await web3.eth.getBalance(tokensale.address);
      assert.equal(tokenSaleBalance.toString(), web3.utils.toWei("1", "Ether"));

      // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args;
      assert.equal(event.account, buyer);
      assert.equal(event.amount.toString(), this.buyamount);
      assert.equal(event.customerno, this.customerno);
    });
    //Test whether contract blocks buyer of category individual from buying more tha 50 tokens a day
    it("Check Token Daily Buylimit ", async () => {
      await tokensale.buyTokens(50, 100, 0, {
        from: buyer,
        value: web3.utils.toWei("1", "ether"),
      }).should.be.rejected;
    });
    //Test whether contract blocks buyer of category industry from buying more tha 100 tokens at a time
    it("Check Token Buylimit  at a time", async () => {
      await tokensale.buyTokens(101, 100, 1, {
        from: buyer,
        value: web3.utils.toWei("1", "ether"),
      }).should.be.rejected;
    });
  });
  //Checks Token Selling
  describe("sellTokens()", async () => {
    let result;
    this.sellamount = 50;
    this.etheramount = "1";
    before(async () => {
      this.initialbalance = await web3.eth.getBalance(tokensale.address);
      console.log("Initial contract Balance", this.initialbalance);
      // Investor must approve tokens before the purchase
      await oxidanetoken.approve(tokensale.address, this.sellamount, {
        from: buyer,
      });
      // Investor sells tokens
      result = await tokensale.sellTokens(
        this.sellamount,
        web3.utils.toWei(this.etheramount, "Ether"),
        { from: buyer }
      );
    });

    it("Water Exchange can Sell Tokens ", async () => {
      // Check investor token balance after purchase
      let investorBalance = await oxidanetoken.balanceOf(buyer);
      assert.equal(investorBalance.toString(), 0);

      // Check tokensale contract balance after purchase
      let tokenBalance;
      //Checks tokenbalance of contract after tokensale
      tokenBalance = await oxidanetoken.balanceOf(tokensale.address);
      assert.equal(tokenBalance.toString(), this.balance);
      //Checks etherbalance of contract after tokensale
      let etherbalance = await web3.eth.getBalance(tokensale.address);
      assert.equal(etherbalance, 0);

      // Check logs to ensure event was emitted with correct data
      const event = result.logs[0].args;
      assert.equal(event.account, buyer);
      assert.equal(event.amount.toString(), this.sellamount);

      // FAILURE: seller can't sell more tokens than they have
      await tokensale.sellTokens(100, { from: buyer }).should.be.rejected;
    });
  });
});
