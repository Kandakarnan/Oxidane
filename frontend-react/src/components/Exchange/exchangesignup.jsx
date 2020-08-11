import React, { Component } from "react";
import { loadWeb3 } from "../../functions/helper";
import Waterexchangeprof from "../Exchange/WaterExchangeProfile";
import Waterexchange from "../../contracts/Waterexchange.json";
class Exchangesignup extends Component {
  async componentWillMount() {
    await loadWeb3();
    await this.loadBlockchaindata();
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
    }
    //Autheticate Exchange
    await this.authenticate();
  }
  //############ LOAD BLOCKCHAIN DATA & CREATING CONTRACT INSTANCE SECTION-->END ############
  //Function to check login address is registered or not
  async authenticate() {
    let exchangecount = await this.state.waterExchangeinst.methods
      .exchangeCount()
      .call();
    // Iterating through all registered exchange address
    for (let i = 1; i <= exchangecount; i++) {
      var address = await this.state.waterExchangeinst.methods
        .exchange(i)
        .call();
      if (address == this.state.account) {
        this.setState({ registered: true });
      }
    }
  }
  //###################### STATES - SECTION-->START #####################
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      registered: false,
      waterExchangeinst: {},
    };
  }
  //###################### STATES - SECTION-->END #####################

  // ############## RENDERING SECTION--->START ################
  render() {
    var content;
    //If registered redirect to waterexchange profile page
    if (this.state.registered === true) {
      content = <Waterexchangeprof />;
    } else {
      content = (
        <div
          style={{
            backgroundColor: "#221f3b",
            height: "1000px",
          }}
          className="text-danger"
        >
          <h1 style={{ textAlign: "center" }}>
            YOU ARE NOT A REGISTERED WATER-EXCHANGE!!!
          </h1>
          ;
        </div>
      );
    }
    return content;
  }
}
// ############## RENDERING SECTION--->END ################
export default Exchangesignup;
