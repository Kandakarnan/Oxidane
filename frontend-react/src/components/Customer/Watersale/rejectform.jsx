import React, { Component } from "react";
import { loadWeb3 } from "../../../functions/helper";
import "../../css/userprofile.css"
import Sale from "../../../contracts/Watersale.json";
import Waterexchange from "../../../contracts/Waterexchange.json";
import OxidaneToken from "../../../contracts/OxidaneToken.json";
import Loader from "../../Basic/Loader";
class Rejectform extends Component {
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

    //CREATING WATEREXCHANGE CONTRACT INSTANCE

    const WaterExchangeData = Waterexchange.networks[networkId];
    if (WaterExchangeData) {
      //WATEREXCHANGE INSTANCE

      const waterExchangeinst = new web3.eth.Contract(
        Waterexchange.abi,
        WaterExchangeData.address
      );
      this.setState({ waterExchangeinst });
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
      waterSaleinst: {},
      exchangeAddress: "",
      token: {},
      location: "",
      watersaleaddr: "",
      loading: false,
      purchaseno: 0,
      deliverytime: 0,
      tokenamount: 0,
      exchangepurchaseno: 0,
    };
  }

  //###################### STATES - SECTION-->END #####################

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION-->START #######

  //FUNCTION TO Reject delivery

  rejectSubmit = async (event) => {
    event.preventDefault();
    var status = await this.state.waterSaleinst.methods
      .getUserpurchaseStatus(this.state.account, this.state.purchaseno)
      .call();
    console.log(status);
    if (status == "1") {
      //Fetching data from delivery event for rejection
      await this.state.waterSaleinst.getPastEvents(
        "WaterDelivery",
        {
          filter: { globalpurchasenumber: this.state.purchaseno },
          fromBlock: 0,
          toBlock: "latest",
        },
        (err, events) => {
          console.log("====>events", events);
          //Fetching deliverytime and Tokenamount
          let eventvalue = events[0].returnValues;
          let deliverytime = eventvalue._time;
          let tokenamount = eventvalue.tokenamount;
          this.setState({ deliverytime });
          this.setState({ tokenamount });
        }
      );
      
      //Fetching Current Timestamp
      const currenttimestamp = Math.round(new Date().getTime() / 1000);
      
      //Calculating difference between prent timestamp and delivery timestamp
      const timediff = currenttimestamp - this.state.deliverytime;
      
      //If difference is more than 3 hours then rejection process continues 648000seconds
      if (timediff >=648000) {
        console.log(this.state.exchangeAddress);
        
        //Decreasing allowance allocated during water purchase
        await this.state.token.methods
          .decreaseAllowance(this.state.exchangeAddress, this.state.tokenamount)
          .send({ from: this.state.account })
          .on("transactionHash", (hash) => {
            this.state.waterSaleinst.methods
              .rejectdelivery(this.state.purchaseno, this.state.exchangeAddress)
              .send({ from: this.state.account });
          });
      } else {
        alert("You are not allowed to reject before 3 hour");
      }
    }
    else{
      alert("You are not allowed to reject before delivery")
    }
  };

  
  // FUNCTION TO HANDLE INPUT

  handleInputChange = async (event) => {
    event.preventDefault();
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION--->END #######

  // ############## RENDERING SECTION--->START ################

  render() {
    if (this.state.loading == true) {
      return <Loader />;
    } else {
      return (
        <div className="rejectform container">
         <div
          className="card card border-light text-white "
          style={{
            backgroundColor: "#221f3b",
          }}
        >
            <div className="card-body">
              <h5 className="card-title">REJECT DELIVERY</h5>
              <div className="form-group">
                <label for="exampleInputPassword1">Exchange Address</label>
                {/* Fetching Exchange Address */}
                <input
                  type="text"
                  className="form-control"
                  id="exampleInputPassword1"
                  name="exchangeAddress"
                  onChange={this.handleInputChange}
                />
              </div>
              {/* Fetching Global Purchase Number */}
              <div className="form-group">
                <label for="exampleInputPassword1">Purchase no</label>
                <input
                  type="number"
                  className="form-control"
                  id="exampleInputPassword1"
                  name="purchaseno"
                  onChange={this.handleInputChange}
                />
              </div>
              <button
                type="submit"
                onClick={this.rejectSubmit}
                className="btn btn-primary"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
}
// ############## RENDERING SECTION--->END  ################
export default Rejectform;
