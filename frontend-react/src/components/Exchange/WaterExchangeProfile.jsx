import React, { Component } from "react";
import "../css/waterexchangeprof.css";
import { loadWeb3 } from "../../functions/helper";
import OxidaneToken from "../../contracts/OxidaneToken.json";
import Waterexchange from "../../contracts/Waterexchange.json";
import Sale from "../../contracts/Watersale.json";
import { loaddamdata } from "../../API/damwaterlevelfinder";
import Exchangewallet from "./exchangewallet";
import Tokensale from "./tokensale";
import Slowloader from "../Basic/slowloader";
import Logoutnav from "../Basic/logoutnav";
const crypto = require("crypto");
class Exchangeprofile extends Component {
  async componentWillMount() {
    await loadWeb3();
    await this.loadBlockchaindata();
    await this.loaddamdata();
  }

  //############ LOAD BLOCKCHAIN DATA & CREATING CONTRACT INSTANCE SECTION-->START ############

  async loadBlockchaindata() {
    // WEB3 INSTANCE
    const web3 = window.web3;

    // FETCHING ACCOUNT

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    //GETTING NETWORKID

    const networkId = await web3.eth.net.getId();

    //CREATING WATEREXHANGE CONTRACT INSTANCE

    const WaterExchangeData = Waterexchange.networks[networkId];
    if (WaterExchangeData) {
      const waterExchangeinst = new web3.eth.Contract(
        Waterexchange.abi,
        WaterExchangeData.address
      );
      this.setState({ waterExchangeinst });

      //Fetching Exchange Details

      const exchange = await waterExchangeinst.methods
        .localExchange(this.state.account)
        .call();
      //Fetching Drinking water Balance
      const drinkingWaterBalance = exchange.drinkingWaterquantity;
      //Fetching NonDrinking water Balance
      const nonDrinkingwaterBalance = exchange.nonDrinkingwaterQuantity;
      //Fetching cluster
      const cluster = exchange.region;
      console.log(cluster);
      //storing cluster
      this.setState({ cluster });
      console.log(cluster);
      //Fetching Delivery charge
      const tokencharge = await waterExchangeinst.methods
        .localExchangetokenrate(this.state.account)
        .call();
      const deliveryCharge = tokencharge.deliverycharge;
      //storing Drinking water Balance
      this.setState({ drinkingWaterBalance });
      //storing Drinking water Balance
      this.setState({ nonDrinkingwaterBalance });
      //storing Delivery charge
      this.setState({ deliveryCharge });
    } else {
      window.alert("waterexchange contract not deployed to network");
    }

    //CREATING TOKEN CONTRACT INSTANCE

    const tokenData = OxidaneToken.networks[networkId];
    if (tokenData) {
      const token = new web3.eth.Contract(OxidaneToken.abi, tokenData.address);
      this.setState({ token });
      //Fetching Token balance
      let tokenBalance = await token.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ tokenBalance: tokenBalance.toString() });
    } else {
      window.alert("Token contract not deployed to network");
    }

    //CREATING WATERSALE CONTRACT INSTANCE

    const WaterSaleData = Sale.networks[networkId];
    if (WaterSaleData) {
      const waterSaleinst = new web3.eth.Contract(
        Sale.abi,
        WaterSaleData.address
      );
      this.setState({ waterSaleinst });
      this.setState({pendinglist:[]})
      this.setState({rejectlist:[]})
      //Fetching Total Purchase Number
      const purchasenumber = await waterSaleinst.methods
        .purchaseNumber(this.state.account)
        .call();
      console.log(purchasenumber);
      //Fetching Total Delivery Number
      const deliverynumber = await waterSaleinst.methods
        .deliveryNumber(this.state.account)
        .call();
      //Iterating through each purchase number to fetch details
      for (let i = deliverynumber; i <= purchasenumber; i++) {
        const pending = await waterSaleinst.methods
          .getExchangepurchaseDetails(this.state.account, i)
          .call();
        console.log(pending);
        //Fetching status of each purchase number
        const state = pending.status;
        console.log(state);
        //If state is in paid state
        if (state === "0") {
          //Fetching Details From WaterPurchase event
          await this.state.waterSaleinst.getPastEvents(
            "WaterPurchase",
            {
              filter: {
                exchangeaddr: this.state.account,
                _purchaseNumber: i,
              },
              fromBlock: 0,
              toBlock: "latest",
            },
            (err, events) => {
              console.log("====>events", events);
              for (var n = 0; n <= events.length - 1; n++) {
                let pendingarray = events[n].returnValues;
                //storing details in pending list array
                this.setState({
                  pendinglist: [...this.state.pendinglist, pendingarray],
                });
              }
            }
          );
        }
        //Fetching Reject Details From WaterPurchase event
        if (state === "3") {
          await this.state.waterSaleinst.getPastEvents(
            "DeliveryRejection",
            {
              filter: {
                exchangeaddr: this.state.account,
              },
              fromBlock: 0,
              toBlock: "latest",
            },
            (err, events) => {
              console.log("====>events", events);
              for (var m = 0; m <= events.length - 1; m++) {
                let rejectarray = events[m].returnValues;
                //storing details in pending list array
                this.setState({
                  rejectlist: [...this.state.rejectlist, rejectarray],
                });
              }
            }
          );
        }
      }
    } else {
      window.alert("Tokensale contract not deployed to network");
    }
  }
  //Function To Fetch Dam waterlevel and to calculate rate of water
  async loaddamdata() {
    this.setState({ loading: true });
    try {
      //Fetching Dam water level Percentage
      const damwaterlevelrawdata = await loaddamdata(this.state.cluster);
      // console.log(damwaterlevelrawdata);//test-point
      const damwaterleveldata = parseInt(damwaterlevelrawdata);
      console.log(damwaterleveldata); //test-point

      //Fetching individual category rate of Drinking water from Smart Contract by providing dam water level percentage
      const drinkingWaterrate = await this.state.waterExchangeinst.methods
        .ratecalculator(damwaterleveldata, 0, 0)
        .call();

      //Fetching individual category rate of Non-Drinking water from Smart Contract by providing dam water level percentage
      const nonDrinkingwaterRate = await this.state.waterExchangeinst.methods
        .ratecalculator(damwaterleveldata, 1, 0)
        .call();

      //Fetching Industry category rate of Drinking water from Smart Contract by providing dam water level percentage
      const industrydrinkingWaterrate = await this.state.waterExchangeinst.methods
        .ratecalculator(damwaterleveldata, 0, 1)
        .call();
      // console.log(industrydrinkingWaterrate);//test-point

      //Fetching Industry category rate of Non-Drinking water from Smart Contract by providing dam water level percentage
      const industrynondrinkingWaterrate = await this.state.waterExchangeinst.methods
        .ratecalculator(damwaterleveldata, 1, 1)
        .call();
      this.setState({ damwaterleveldata });
      this.setState({ drinkingWaterrate });
      this.setState({ nonDrinkingwaterRate });
      this.setState({ industrydrinkingWaterrate });
      this.setState({ industrynondrinkingWaterrate });
    } catch (
      err //If dam water level data is not available due to some error then avg rate is used(90% waterlevel)
    ) {
      //Fetching individual category rate of Drinking water from Smart Contract by providing dam water level percentage
      const drinkingWaterrate = await this.state.waterExchangeinst.methods
        .ratecalculator(90, 0, 0)
        .call();

      //Fetching individual category rate of Non-Drinking water from Smart Contract by providing dam water level percentage
      const nonDrinkingwaterRate = await this.state.waterExchangeinst.methods
        .ratecalculator(90, 1, 0)
        .call();
      //Fetching Industry category rate of Drinking water from Smart Contract by providing dam water level percentage
      const industrydrinkingWaterrate = await this.state.waterExchangeinst.methods.ratecalculator(
        90,
        0,
        1
      );
      //Fetching Industry category rate of Non-Drinking water from Smart Contract by providing dam water level percentage
      const industrynondrinkingWaterrate = await this.state.waterExchangeinst.methods.ratecalculator(
        90,
        1,
        1
      );
      this.setState({ drinkingWaterrate });
      this.setState({ nonDrinkingwaterRate });
      this.setState({ industrydrinkingWaterrate });
      this.setState({ industrynondrinkingWaterrate });
    }
    this.setState({ loading: false });
  }

  //############ LOAD BLOCKCHAIN DATA & CREATING INSTANCE- SECTION-->END ############

  //###################### STATES - SECTION-->START #####################

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      loading: false,
      registered: false,
      waterExchangeinst: {},
      exchangeAddress: "",
      mintAmount: 0,
      waterBalance: 0,
      waterSaleinst: {},
      pendinglist: [],
      rejectlist: [],
      tokenBalance: 0,
      waterType: 0,
      drinkingWaterBalance: 0,
      nonDrinkingwaterBalance: 0,
      deliveryCharge: 0,
      damwaterleveldata: 0,
      drinkingWaterrate: 0,
      nonDrinkingwaterRate: 0,
      cluster: 0,
      industrynondrinkingWaterrate: 0,
      industrydrinkingWaterrate: 0,
    };
  }

  //###################### STATES - SECTION-->END #####################

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION-->START #######

  //FUNCTION TO SUBMIT DATA
  handleSubmit = async (event) => {
    event.preventDefault();
    //TO INCREMENT WATERBALANCE IN WATEREXCHANGE

    this.state.waterExchangeinst.methods
      .incrementWater(
        this.state.mintAmount,
        this.state.waterType,
        this.state.damwaterleveldata
      )
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.loadBlockchaindata();
      });
  };

  // FUNCTION TO HANDLE INPUT
  handleInputChange = (event) => {
    event.preventDefault();
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  //Function to trigger Delivery
  triggerdelivery = async (event) => {
    event.preventDefault();
    //Fetching Current Timestamp
    let timestamp = Math.round(new Date().getTime() / 1000);
    //Triggering Delivery
    await this.state.waterSaleinst.methods
      .triggerDelivery(event.currentTarget.value, timestamp)
      .send({ from: this.state.account });
    this.setState({ pendinglist: [] });
    this.loadBlockchaindata();
  };

  //Function to update Delivery Charge
  updateDeliverycharge = async (event) => {
    event.preventDefault();
    await this.state.waterExchangeinst.methods
      .deliverycharge(this.state.deliveryCharge)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.loadBlockchaindata();
      });
  };
  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION--->END #######

  // ############## RENDERING SECTION--->START ################
  render() {
    if (this.state.loading === true) {
      return (
        <div>
          <Slowloader />
        </div>
      );
    } else {
      return (
        <div
          style={{
            backgroundColor: "#221f3b",
          }}
        >
          <Logoutnav />
          <div>
            <Exchangewallet
              tokenBalance={this.state.tokenBalance}
              DrinkingwaterBalance={this.state.drinkingWaterBalance}
              NonDrinkingwaterBalance={this.state.nonDrinkingwaterBalance}
              DrinkingwaterRate={this.state.drinkingWaterrate}
              NonDrinkingwaterRate={this.state.nonDrinkingwaterRate}
              DeliveryCharge={this.state.deliveryCharge}
              IndustryDrinkingRate={this.state.industrydrinkingWaterrate}
              IndustryNonDrinkingRate={this.state.industrynondrinkingWaterrate}
            />
            <div className="">
              <div className="mintform container">
                <div
                  className="card card border-light text-white "
                  style={{
                    backgroundColor: "#221f3b",
                  }}
                >
                  <div class="card-body">
                    <h5 class="card-title">Update Water</h5>
                    <form
                      onSubmit={this.handleSubmit}
                      encType="multipart/form-data"
                    >
                      {/* Fetching watertype */}
                      <div class="form-group">
                        <label for="exampleFormControlSelect1">
                          Select Water Type
                        </label>
                        <select
                          class="form-control"
                          id="exampleFormControlSelect1"
                          name="waterType"
                          onChange={this.handleInputChange}
                        >
                          <option value="0">Drinking</option>
                          <option value="1">Non Drinking</option>
                        </select>
                      </div>
                      {/* Fetching Waterquantity */}
                      <div class="form-group ">
                        <label className="text-black" for="exampleInputEmail1">
                          Amount to Increment(in kl )
                        </label>
                        <input
                          name="mintAmount"
                          type="number"
                          required
                          onChange={this.handleInputChange}
                        />
                      </div>
                      <button type="submit" class="btn btn-success">
                        Add water
                      </button>
                    </form>

                    {/* Fetching Delivery Charge */}
                    <label className="text-black" for="exampleInputEmail1">
                      Update Delivery charge
                    </label>
                    <input
                      name="deliveryCharge"
                      type="number"
                      required
                      onChange={this.handleInputChange}
                    />
                    <button
                      type="submit"
                      class="btn btn-success"
                      onClick={this.updateDeliverycharge}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
              <div className="sale container">
                <Tokensale />
              </div>
              {/* Displaying Pending list */}
              <div className="pendingtable container">
                <div
                  className="card card border-danger text-white "
                  style={{
                    backgroundColor: "#221f3b",
                  }}
                >
                  <div className="card-body">
                    <h5 className="card-title">DELIVERY PENDING LIST</h5>
                    <table class="table table-bordered text-white">
                      <thead className="thead-dark">
                        <tr>
                          <th scope="col">Customer No</th>
                          <th scope="col">Purchaseno</th>
                          <th scope="col">Quantity</th>
                          <th scope="col">Delivery location</th>
                          <th scope="col">Contact no</th>
                          <th scope="col">Watertype</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.pendinglist.map((ex, key) => {
                          // decrypting Mobile no
                          var mykey1 = crypto.createDecipher(
                            "aes-128-cbc",
                            "mypassword"
                          );
                          var mystr1 = mykey1.update(ex.phoneno, "hex", "utf8");
                          mystr1 += mykey1.final("utf8");
                          var a;
                          if (ex.watertype == 0) {
                            a = "Drinking";
                          } else {
                            a = "Non-Drinking";
                          }
                          return (
                            <tr>
                              <td>{ex.customerno}</td>
                              <td>{ex._purchaseNumber}</td>
                              <td>{ex._quantity}</td>
                              <td>{ex._deliverylocation}</td>
                              <td>{mystr1}</td>
                              <td>{a}</td>
                              <button
                                class="btn btn-success"
                                type="submit"
                                value={ex._purchaseNumber}
                                id={a}
                                onClick={this.triggerdelivery}
                              >
                                Deliver
                              </button>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div
                  className="card card border-danger text-white "
                  style={{
                    backgroundColor: "#221f3b",
                  }}
                >
                  <div className="card-body">
                    <h5 className="card-title">DELIVERY REJECTED LIST</h5>
                    <table class="table table-bordered text-white">
                      <thead>
                        <tr>
                          <th scope="col">Global Purchase Number</th>
                          <th scope="col">Time</th>
                          <th scope="col">Customer Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.rejectlist.map((ex, key) => {
                          return (
                            <tr>
                              <td>{ex.globalpurchasenumber}</td>
                              <td>{ex._time}</td>
                              <td>{ex.customer}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

// ############## RENDERING SECTION--->END  ################
export default Exchangeprofile;
