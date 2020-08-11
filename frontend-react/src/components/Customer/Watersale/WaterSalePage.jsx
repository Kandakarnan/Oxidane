import React, { Component } from "react";
import { loadWeb3 } from "../../../functions/helper";
import Kyc from "../../../contracts/Kyc.json";
import Sale from "../../../contracts/Watersale.json";
import Waterexchange from "../../../contracts/Waterexchange.json";
import OxidaneToken from "../../../contracts/OxidaneToken.json";
import Loader from "../../Basic/Loader";
const crypto = require("crypto");
class WaterSale extends Component {
  async componentWillMount() {
    await loadWeb3();
    await this.loadBlockchaindata();
  }

  //############ LOAD BLOCKCHAIN DATA & CREATING CONTRACT INSTANCE SECTION-->START ############

  async loadBlockchaindata() {
    const web3 = window.web3;

    //FETCHING ACCOUNT
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    //GETTING NETWORKID
    const networkId = await web3.eth.net.getId();

    //CREATING KYC CONTRACT INSTANCE
    const KycData = Kyc.networks[networkId];
    if (KycData) {
      const kycInst = new web3.eth.Contract(Kyc.abi, KycData.address);
      this.setState({ kycInst });
      let customerdetail = await kycInst.methods
        .registration(this.state.account)
        .call({ from: this.state.account });
      let customercategory = customerdetail.customertcategory;
      let customernumber = customerdetail.customerno;
      this.setState({ customercategory });
      this.setState({ customernumber });
    } else {
      window.alert("Kyc contract not deployed to network");
    }

    //CREATING WATEREXCHANGE CONTRACT INSTANCE

    const WaterExchangeData = Waterexchange.networks[networkId];
    if (WaterExchangeData) {
      //WATEREXCHANGE INSTANCE

      const waterExchangeinst = new web3.eth.Contract(
        Waterexchange.abi,
        WaterExchangeData.address
      );
      this.setState({ waterExchangeinst });
      const exchange = await waterExchangeinst.methods
        .localExchange(this.state.account)
        .call();

      //FETCHING WATERBALANCE
      const waterBalance = exchange.waterquantity;
      console.log(waterBalance);
      this.setState({ waterBalance });
    } else {
      window.alert("Waterexchange contract not deployed to network");
    }

    //CREATING WATERSALE CONTRACT INSTANCE
    const WaterSaleData = Sale.networks[networkId];
    if (WaterSaleData) {
      const waterSaleinst = new web3.eth.Contract(
        Sale.abi,
        WaterSaleData.address
      );
      this.setState({ waterSaleinst });
      this.setState({ watersaleaddr: WaterSaleData.address });
    } else {
      window.alert("Tokensale contract not deployed to network");
    }

    //CREATING TOKEN INSTANCE
    const tokenData = OxidaneToken.networks[networkId];
    if (tokenData) {
      const token = new web3.eth.Contract(OxidaneToken.abi, tokenData.address);
      this.setState({ token });
    } else {
      window.alert("Token contract not deployed to network");
    }
  }

  //############ LOAD BLOCKCHAIN DATA & CREATING INSTANCE- SECTION-->END ############

  //###################### STATES - SECTION-->START #####################

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      waterExchangeinst: {},
      waterQuantity: 0,
      waterSaleinst: {},
      exchangeAddress: "",
      waterBalance: 0,
      token: {},
      rate: 0,
      location: "",
      deliverylist: [],
      deliveredlist: [],
      totalpurchase_Count: 0,
      pendinglist: [],
      watertype: 0,
      watersaleaddr: "",
      cluster: 0,
      loading: false,
      drinkingrate: 0,
      nondrinkingrate: 0,
      deliveryrate: 0,
      totalcharge: 0,
      customercategory: 0,
      contactno: "",
    };
  }

  //###################### STATES - SECTION-->END #####################

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION-->START #######

  //FUNCTION TO SUBMIT DATA

  handleSubmit = async (event) => {
    event.preventDefault();
    //Checking Selected Delivery Cluster is same as selected exchange cluster
    let exchangedetail = await this.state.waterExchangeinst.methods
      .localExchange(this.state.exchangeAddress.trim())
      .call();
    let cluster = exchangedetail.region;
    if (cluster != this.state.cluster) {
      alert("Exchange cant deliver on this Cluster");
    } else {
      //Calculating total token cost
      let tokenamount =
        this.state.rate * this.state.waterQuantity + this.state.deliveryrate;
      //checking user has any pending delivery from the exchange
      //customer is not allowed to make multiple purchase at a time from same water exchange before delivery
      let status = await this.state.waterSaleinst.methods
        .getstatus(this.state.exchangeAddress)
        .call({ from: this.state.account });
      console.log(status);
      if (status) {
        alert("You are not allowed to make multiple purchase before delivery");
      } else {
        //Encrypting mobile no
        var mykey = crypto.createCipher("aes-128-cbc", "mypassword");
        var mobno = mykey.update(this.state.contactno, "utf8", "hex");
        mobno += mykey.final("hex");

        //Triggering waterpurchase
        await this.state.waterSaleinst.methods
          .waterPurchase(
            this.state.waterQuantity,
            this.state.exchangeAddress,
            tokenamount,
            this.state.location,
            this.state.watertype,
            this.props.customercategory,
            this.props.customerno,
            mobno
          )
          .send({ from: this.state.account })
          .on("transactionHash", async (hash) => {
            //Triggering approval of tokens to exchange
            await this.state.token.methods
              .approve(this.state.exchangeAddress.trim(), tokenamount)
              .send({ from: this.state.account });
          });
      }
    }
  };

  // FUNCTION TO HANDLE INPUT

  handleInputChange = async (event) => {
    event.preventDefault();
    await this.setState({
      [event.target.name]: event.target.value,
    });
    if (this.state.exchangeAddress != "") {
      try {
        let tokenrate = await this.state.waterExchangeinst.methods
          .localExchangetokenrate(this.state.exchangeAddress.trim())
          .call();

        if (this.state.customercategory == 0) {
          //Fetching drinkingwater rate from exchange
          let drinkingrate = tokenrate.drinkingtokenrate;
          this.setState({ drinkingrate });

          //Fetching non-drinkingwater rate from exchange
          let nondrinkingrate = tokenrate.nondrinkingtokenrate;
          this.setState({ nondrinkingrate });
        }
        if (this.state.customercategory == 1) {
          //Fetching industry drinkingwater rate from exchange
          let drinkingrate = tokenrate.industrydrinkingtokenrate;
          this.setState({ drinkingrate });

          //Fetching industry non-drinkingwater rate from exchange
          let nondrinkingrate = tokenrate.industrynondrinkingtokenrate;
          this.setState({ nondrinkingrate });
        }
        //Fetching deliveryrate
        let deliveryrate = parseInt(tokenrate.deliverycharge);
        this.setState({ deliveryrate });

        //if user select drinking type rate of token will of drinkingwater rate
        if (this.state.watertype == 0) {
          this.setState({ rate: this.state.drinkingrate });
        }
        //if user select non-drinking type rate of token will of non-drinkingwater rate
        if (this.state.watertype == 1) {
          this.setState({ rate: this.state.nondrinkingrate });
        }
      } catch (err) {
        console.log(err);
        alert("wrong Input");
        this.setState({ exchangeAddress: "" });
      }
    }
  };

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION--->END #######

  // ############## RENDERING SECTION--->START ################

  render() {
    if (this.state.loading == true) {
      return <Loader />;
    } else {
      return (
        <div className=" container">
          <div
            className="card card border-light text-white "
            style={{
              backgroundColor: "#221f3b",
            }}
          >
            <div className="card-body">
              <h5 className="card-title">BUY WATER</h5>
              <div className="form-group">
                <label for="exampleInputPassword1">Exchange Address</label>
                {/* Fetching Exchange address */}
                <input
                  type="text"
                  className="form-control"
                  id="exampleInputPassword1"
                  name="exchangeAddress"
                  onChange={this.handleInputChange}
                />
              </div>
              <div className="form-group ">
                <label className="text-black" for="exampleInputEmail1">
                  WaterType
                </label>
                <div className="row">
                  <div className="col-md-6 col-12">
                    <label for="exampleFormControlSelect1">
                      Select WaterType
                    </label>
                    {/* Fetching watertype */}
                    <select
                      className="form-control"
                      id="exampleFormControlSelect1"
                      name="watertype"
                      onChange={this.handleInputChange}
                    >
                      <option>Select watertype</option>
                      <option value="0">Drinking</option>
                      <option value="1">NonDrinking</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Displaying drinking-water rate */}
              <div className="form-group">
                <label for="exampleInputPassword1">Drinking Tokenrate</label>
                <input
                  type="number"
                  class="form-control"
                  id="exampleInputPassword1"
                  name="waterQuantity"
                  value={this.state.drinkingrate}
                  disabled="true"
                />
              </div>
              {/* Displaying non-drinking-water rate */}
              <div className="form-group">
                <label for="exampleInputPassword1">
                  Non Drinking Tokenrate
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="exampleInputPassword1"
                  name="waterQuantity"
                  value={this.state.nondrinkingrate}
                  disabled="true"
                />
              </div>
              {/* Displaying Delivery Rate */}
              <div className="form-group">
                <label for="exampleInputPassword1">Delivery Rate</label>
                <input
                  type="number"
                  class="form-control"
                  id="exampleInputPassword1"
                  name="waterQuantity"
                  value={this.state.deliveryrate}
                  disabled="true"
                />
              </div>
              {/* Fetching Water Quantity */}
              <div className="form-group">
                <label for="exampleInputPassword1">Water Quantity(kl)</label>
                <input
                  type="number"
                  class="form-control"
                  id="exampleInputPassword1"
                  name="waterQuantity"
                  onChange={this.handleInputChange}
                />
              </div>
              {/* Displaying Token cost */}
              <div className="form-group">
                <label for="exampleInputPassword1">Total OXD Amount</label>
                <input
                  type="text"
                  className="form-control"
                  id="exampleInputPassword1"
                  value={
                    this.state.rate * this.state.waterQuantity +
                    this.state.deliveryrate
                  }
                  disabled="true"
                />
              </div>

              <div className="form-group ">
                <label className="text-black" for="exampleInputEmail1">
                  Delivery Cluster
                </label>
                <div className="row">
                  <div className="col-md-6 col-12">
                    <label for="exampleFormControlSelect1">
                      Select Delivery Cluster
                    </label>
                    {/* Fetching watertype */}
                    <select
                      className="form-control"
                      id="exampleFormControlSelect1"
                      name="cluster"
                      onChange={this.handleInputChange}
                    >
                      <option>Select Cluster</option>
                      <option value="0">Central Kerala</option>
                      <option value="1">North Kerala</option>
                      <option value="2">South Kerala</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fetching Delivery Address */}
              <div className="form-group">
                <label for="exampleInputPassword1">Delivery Location</label>
                <input
                  type="text"
                  className="form-control"
                  id="exampleInputPassword1"
                  name="location"
                  onChange={this.handleInputChange}
                />
              </div>

              <div className="form-group">
                <label for="exampleInputPassword1">contact no</label>
                <input
                  type="text"
                  className="form-control"
                  id="exampleInputPassword1"
                  name="contactno"
                  onChange={this.handleInputChange}
                />
              </div>

              <button
                type="submit"
                onClick={this.handleSubmit}
                className="btn btn-primary"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
}
// ############## RENDERING SECTION--->END  ################
export default WaterSale;
