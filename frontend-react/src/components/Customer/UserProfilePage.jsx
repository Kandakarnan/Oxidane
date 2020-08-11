import React, { Component } from "react";
import "../css/userprofile.css";
import { loadWeb3 } from "../../functions/helper";
import OxidaneToken from "../../contracts/OxidaneToken.json";
import TokenSale from "../../contracts/TokenSale.json";
import { checkethprice } from "../../API/api";
import Wallet from "./Tokensale/Wallet";
import BuyToken from "./Tokensale/BuyToken";
import Exchangelist from "./Watersale/exchangelist";
import Watersale from "./Watersale/WaterSalePage";
import Deliverystatus from "./Watersale/Deliverystatus";
import Rejectform from "./Watersale/rejectform";
import Kyc from "../../contracts/Kyc.json";
import Logoutnav from "../Basic/logoutnav";
class Profilepage extends Component {
  async componentWillMount() {
    await loadWeb3();
    await this.loadBlockchainData();

    //API CALLER FOR FETCHING ETHER PRICE
    this.interval = setInterval(() => this.oxdPriceFinder(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  //############ LOAD BLOCKCHAIN DATA & CREATING CONTRACT INSTANCE SECTION-->START ############

  async loadBlockchainData() {
    //WEB3 INSTANCE
    const web3 = window.web3;
    //FETCHING ACCOUNT

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    //FETCHING ETHERBALANCE

    const ethBalance = await web3.eth.getBalance(this.state.account);

    this.setState({ ethBalance });

    //GETTING NETWORKID

    const networkId = await web3.eth.net.getId();

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

    //CREATING TOKENSALE CONTRACT INSTANCE

    const tokensaleData = TokenSale.networks[networkId];
    if (tokensaleData) {
      const tokensale = new web3.eth.Contract(
        TokenSale.abi,
        tokensaleData.address
      );
      this.setState({
        tokenSaleinst: tokensale,
        tokenSaleAddress: tokensaleData.address,
      });
      let tokenRate = await tokensale.methods.rate().call();
      // console.log(tokenrate);// test-point

      this.setState({ tokenRate });
    } else {
      window.alert("Tokensale contract not deployed to network");
    }

    //CREATING KYC CONTRACT INSTANCE
    const KycData = Kyc.networks[networkId];
    if (KycData) {
      const kycInst = new web3.eth.Contract(Kyc.abi, KycData.address);
      this.setState({ kycInst });
      //Fetching customerdetails
      let customerdetail = await kycInst.methods
        .registration(this.state.account)
        .call({ from: this.state.account });
      //Fetching customer-category and customer number
      let customercategory = customerdetail.customertcategory;
      let customernumber = customerdetail.customerno;
      this.setState({ customercategory });
      this.setState({ customernumber });
    } else {
      window.alert("Kyc contract not deployed to network");
    }
  }

  //############ LOAD BLOCKCHAIN DATA & CREATING INSTANCE-SECTION-->END ############

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION-->START #######

  //FUNCTION TO CALCULATE TOKEN PRICE
  oxdPriceFinder = async () => {
    let price = await checkethprice();
    // console.log(price);// test-point
    this.setState({ etherPrice: price });
    // console.log(this.state.etherprice);// test-point
    let oxdPrice = (1 / this.state.etherPrice).toFixed(18); //tokenrate is set to 1 dollar for 1 OXD
    this.setState({ oxdPrice });
  };

  //FUNCTION TO BUY-TOKENS
  buyTokens = (tokenAmount, etherAmount, etherprice) => {
    console.log(etherprice);
    this.state.tokenSaleinst.methods
      .buyTokens(
        tokenAmount,
        etherprice,
        this.state.customercategory,
        this.state.customernumber
      )
      .send({ value: etherAmount, from: this.state.account })
      .on("transactionHash", (hash) => {
        this.loadBlockchainData();
      });
  };


  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION--->END #######

  //###################### STATES - SECTION-->START #####################

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      ethBalance: "0",
      token: {},
      tokenSaleinst: {},
      tokenBalance: "0",
      tokenSaleAddress: "",
      etherPrice: "",
      tokenRate: "",
      oxdPrice: "",
      customercategory: 0,
      kycInst: {},
      customernumber: 0,
    };
  }
  //###################### STATES - SECTION-->END #####################

  // ############## RENDERING SECTION--->START ################
  render() {
    return (
      <div style={{
        backgroundColor: '#221f3b',
       
      }}>
        <Logoutnav />
        <div className="wallet container">
          <Wallet
            //passing etherbalance to child component
            ethBalance={this.state.ethBalance}
            //passing tokenbalance to child component
            tokenBalance={this.state.tokenBalance}
            //passing etherprice to child component
            ether_to_Dollar_Price={this.state.etherPrice}
            //passing tokencost to child component
            oxd_to_Eth_Price={this.state.oxdPrice}
          />
        </div>
        <div className="buytoken">
          <BuyToken
            //passing buytoken function to child component
            buyTokens={this.buyTokens}
            //passing tokencost to child component
            oxd_to_Eth_Price={this.state.oxdPrice}
            //Passing customer number
            customerno={this.state.customernumber}
          />
        </div>
        <div className="exchangelist">
          <Exchangelist />
        </div>
        <div className="watersaleform">
        
          <Watersale
            //passing customer category to child component
            customercategory={this.state.customercategory}
            //Passing customer number
            customerno={this.state.customernumber}
          />
          
        </div>
        <div className="deliverystatus">
          <Deliverystatus customerno={this.state.customernumber} />
        </div>
        <div className="reject">
        <Rejectform />
        </div>
      </div>
    );
  }
}
// ############## RENDERING SECTION--->END  ################
export default Profilepage;
