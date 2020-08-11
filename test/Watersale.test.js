const { assert } = require("chai");

const Waterexchange = artifacts.require("Waterexchange");
const Watersale = artifacts.require("Watersale");
const OxidaneToken = artifacts.require("OxidaneToken");
require("chai").use(require("chai-as-promised")).should();

contract(
  "Watersale",
  ([
    owner,
    buyer,
    exchange,
    buyer2,
    exchange2,
    buyer3,
    exchange3,
    exchange4,
  ]) => {
    let waterexchange;
    let watersale;
    //Triggering token transfer and incrementing water in exchanges before test checks
    before(async () => {
    //Creating Water-Exchange contract instance
      waterexchange = await Waterexchange.new();
    //Creating token contract instance
      oxidanetoken = await OxidaneToken.new();
    //Creating watersale contract instance
      watersale = await Watersale.new(
        waterexchange.address,
        oxidanetoken.address
      );
    //Transfering tokens to buyer
      await oxidanetoken.transfer(buyer, 100);
      let incrementqty = 150;
      let category = 0; //Drinking water category-0/non-drinking-1
      let waterlevelpercentage = 90; //rate for 90 percentage dam water level is 6 tokens for 1000l
      //Incrementing Drinking water in exchange
      await waterexchange.incrementWater(
        incrementqty,
        category,
        waterlevelpercentage,
        { from: exchange }
      );
      //Incrementing Non-Drinking water in exchange
      await waterexchange.incrementWater(
        incrementqty,
        1,
        waterlevelpercentage,
        {
          from: exchange,
        }
      );
    });

    //Test for WaterPurchase
    describe("waterpurchase()", async () => {
      let quantity = 2;
      let tokenamount = 2;
      let location = "tvm";
      let watertype = 0;
      let customertype = 0;
      let phoneno="98456778"
      //Triggering waterpurchase
      before(async () => {
        this.result1 = await watersale.waterPurchase(
          quantity,
          exchange,
          tokenamount,
          location,
          watertype,
          customertype,
          1,
          phoneno,
          { from: buyer }
        );
      });

      it("check WaterPurchase", async () => {
        //checking localpurchase number is incremented
        let purchasenumber = await watersale.purchaseNumber(exchange);
        assert.equal(purchasenumber, 1, "localpurchase number not incremented");
        //checking globalpurchase number is incremented
        let globalpurchasenumber = await watersale.globalpurchasenumber();
        assert.equal(
          globalpurchasenumber,
          1,
          "globalpurchase number not incremented"
        );
        //checks Exchange purchase number details are updated
        let exchangedetails = await watersale.getExchangepurchaseDetails(
          exchange,
          purchasenumber
        );
        //Checks state updated to Paid state
        let status = exchangedetails.status;
        assert.equal(status, 0, "state not updated to Paid");
        //Checks whether customer address updated to exchange details
        let useraddress = exchangedetails.customerAddress;
        assert.equal(
          useraddress,
          buyer,
          "customer address not saved to exchange purchase details"
        );
        //Checks userpurchsenumber status updated to Paid State
        let userpurchasestatus = await watersale.getUserpurchaseStatus(
          buyer,
          globalpurchasenumber
        );
        assert.equal(userpurchasestatus, 0, "state not updated to Paid");
        
        //checks whether bought waterquanntity is reduced from total balance
        let exchangewaterdetail = await waterexchange.localExchange(exchange);
        //Fetching drinking water balance of exchange
        let drinkingwaterquantity = exchangewaterdetail.drinkingWaterquantity;
        //Finding difference between initial quantity and the amount bought
        let balancewaterqty = 150 - quantity;
        assert.equal(
          drinkingwaterquantity,
          balancewaterqty,
          "Quantity not reduced from total balance"
        );

        // Check logs to ensure event was emitted with correct data
        const event = this.result1.logs[0].args;
        //Checks Exchange address
        assert.equal(event.exchangeaddr, exchange);
        //Checks purchase number
        assert.equal(event._purchaseNumber, 1, "purchasenumber not same");
        //Checks globalpurchase number
        assert.equal(event.globalpurchasenumber, 1);
        //checks water quantity
        assert.equal(event._quantity, quantity);
        //Checks Delivery location
        assert.equal(event._deliverylocation, "tvm");
        //Checks tokenamount
        assert.equal(event.tokenamount, 2);
        
        //Checks One_time buy limit
        await watersale.waterPurchase(50, exchange, 2, "tvm", 0, 0,"98456", {
          from: buyer,
        }).should.be.rejected;

        //Checks Daily Limit
        await watersale.waterPurchase(4, exchange, 2, "tvm", 0, 0, 1,"98678" ,{
          from: buyer,
        }).should.be.rejected;
      });
    });

    //Tests WaterDelivery
    describe("waterdelivery()", async () => {
      before(async () => {
        let quantity = 2;
        let tokenamount = 2;
        let location = "tvm";
        let watertype = 0;
        let customertype = 0;
        //incrementing water quantity in water exchange
        await waterexchange.incrementWater(100, 0, 90, { from: exchange4 });
        //Triggering water purchase
        await watersale.waterPurchase(
          quantity,
          exchange4,
          tokenamount,
          location,
          watertype,
          customertype,
          1,
          "986578",
          { from: buyer }
        );
        //Triggering water delivery
        let purchasenumber = await watersale.purchaseNumber(exchange4);
        this.result2 = await watersale.triggerDelivery(purchasenumber, 12345, {
          from: exchange4,
        });
      });
      it("check Waterdelivery", async () => {
        let purchasenumber = await watersale.purchaseNumber(exchange4);
        //checks Exchange purchase number details are updated
        let exchangedetails = await watersale.getExchangepurchaseDetails(
          exchange4,
          purchasenumber
        );
        // Checks state updated to Delivered state
        let status = exchangedetails.status;
        assert.equal(status, 1, "state not updated to Delivered");
        //Checks delivery number got upgraded
        let deliverynumber = await watersale.deliveryNumber(exchange4);
        assert.equal(deliverynumber, 1, "delivery number not upgraded");
        let globalpurchasenumber = await watersale.globalpurchasenumber();
        //Checks userpurchase number state updated to Delivered state
        let userpurchasestatus = await watersale.getUserpurchaseStatus(
          buyer,
          globalpurchasenumber
        );
        assert.equal(
          userpurchasestatus,
          1,
          "user purchase number status not updated"
        );
        //Checking events
        const event = this.result2.logs[0].args;
        assert.equal(event.exchangeaddr, exchange4);
        assert.equal(event.globalpurchasenumber, 2);
        assert.equal(event.tokenamount, 2);
      });
    });

  //Test Delivery Confirmation
    describe("Confirmation()", async () => {
      before(async () => {
        let quantity = 2;
        let tokenamount = 2;
        let location = "tvm";
        let watertype = 0;
        let customertype = 0;
        //Transferring tokens from token contract to buyer
        await oxidanetoken.transfer(buyer2, 100);
        //Giving token allowance to exchange from buyer for water purchase
        await oxidanetoken.approve(exchange2, tokenamount, { from: buyer2 });
        //incrementing water quantity in water exchange
        await waterexchange.incrementWater(100, 0, 90, { from: exchange2 });
        //Triggering water purchase
        await watersale.waterPurchase(
          quantity,
          exchange2,
          tokenamount,
          location,
          watertype,
          customertype,
          1,
          "567889",
          { from: buyer2 }
        );
        //Triggering Delivery from water exchange
        let purchasenumber = await watersale.purchaseNumber(exchange2);
        await watersale.triggerDelivery(purchasenumber, 12345, {
          from: exchange2,
        });
        let globalpurchasenumber = await watersale.globalpurchasenumber();
        //Triggering confirmation from user
        this.result3 = await watersale.Confirmation(
          globalpurchasenumber,
          exchange2,
          1,
          { from: buyer2 }
        );
      });
      it("check Confirmation()", async () => {
        //Checks did token transfer from buyer to exchange
        let balance = await oxidanetoken.balanceOf(exchange2);
        assert.equal(
          balance,
          2,
          "tokens didnt transfered from buyer to exchange"
        );
        let purchasenumber = await watersale.purchaseNumber(exchange2);

        //checks Exchange purchase number details are updated
        let exchangedetails = await watersale.getExchangepurchaseDetails(
          exchange2,
          purchasenumber
        );
        // Checks state updated to Received state
        let status = exchangedetails.status;
        assert.equal(
          status,
          2,
          "status didnt change from delivered to received"
        );

        let globalpurchasenumber = await watersale.globalpurchasenumber();
        //Checks userpurchase number state updated to Received state
        let userpurchasestatus = await watersale.getUserpurchaseStatus(
          buyer2,
          globalpurchasenumber
        );
        assert.equal(
          userpurchasestatus,
          2,
          "user purchase number status not updated"
        );
        //Checks whether user transaction pending state with water exchange change to false
        let transactionstatus = await watersale.getstatus(exchange2, {
          from: buyer2,
        });
        assert.equal(
          transactionstatus,
          false,
          "user transaction pending state didnt turn false"
        );
        //Checking Events
        const event = this.result3.logs[0].args;
        assert.equal(event.exchangeaddr, exchange2);
        assert.equal(event.globalpurchasenumber, 3);
      });
    });

    //Test Delivery Rejection
    describe("rejectdelivery()", async () => {
      before(async () => {
        let quantity = 2;
        let tokenamount = 2;
        let location = "tvm";
        let watertype = 0;
        let customertype = 0;
        //Transferring tokens from token contract to buyer
        await oxidanetoken.transfer(buyer3, 100);
        //Giving token allowance to exchange from buyer for water purchase
        await oxidanetoken.approve(exchange3, tokenamount, { from: buyer3 });
        //incrementing water quantity in water exchange
        await waterexchange.incrementWater(100, 0, 90, { from: exchange3 });
        //Triggering water purchase
        await watersale.waterPurchase(
          quantity,
          exchange3,
          tokenamount,
          location,
          watertype,
          customertype,
          1,
          "123456",
          { from: buyer3 }
        );
        //Triggering Delivery from water exchange
        let purchasenumber = await watersale.purchaseNumber(exchange3);
        await watersale.triggerDelivery(purchasenumber, 12345, {
          from: exchange3,
        });
        let globalpurchasenumber = await watersale.globalpurchasenumber();
        //Triggering confirmation from user
        let result = await watersale.rejectdelivery(
          globalpurchasenumber,
          exchange3,
          { from: buyer3 }
        );
      });
      it("check rejection", async () => {
        //Checks did token transfer from buyer to exchange
        let balance = await oxidanetoken.balanceOf(exchange3);
        assert.equal(
          balance,
          0,
          "tokens didnt transfered from buyer to exchange"
        );
        let purchasenumber = await watersale.purchaseNumber(exchange3);

        //checks Exchange purchase number details are updated
        let exchangedetails = await watersale.getExchangepurchaseDetails(
          exchange3,
          purchasenumber
        );
        // Checks state updated to Received state
        let status = exchangedetails.status;
        assert.equal(
          status,
          3,
          "status didnt change from delivered to received"
        );

        let globalpurchasenumber = await watersale.globalpurchasenumber();
        //Checks userpurchase number state updated to Received state
        let userpurchasestatus = await watersale.getUserpurchaseStatus(
          buyer3,
          globalpurchasenumber
        );
        assert.equal(
          userpurchasestatus,
          3,
          "user purchase number status not updated"
        );
        //Checks whether user transaction pending state with water exchange change to false
        let transactionstatus = await watersale.getstatus(exchange3, {
          from: buyer3,
        });
        assert.equal(
          transactionstatus,
          false,
          "user transaction pending state didnt turn false"
        );
      });
    });
  }
);
