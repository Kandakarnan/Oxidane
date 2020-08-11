import React, { Component } from "react";
import "../css/waterexchangeprof.css";
import { loadWeb3 } from "../../functions/helper";
import OxidaneToken from "../../contracts/OxidaneToken.json";
import Waterexchange from "../../contracts/Waterexchange.json";
import TokenSale from "../../contracts/TokenSale.json";
import { checkethprice } from "../../API/api";
import Loader from "../Basic/Loader";
class Tokensale extends Component {
  async componentWillMount() {
    await loadWeb3();
    await this.loadBlockchaindata();
    await this.oxdsellPriceFinder();
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
    } else {
      window.alert("waterexchange contract not deployed to network");
    }

    //CREATING TOKEN CONTRACT INSTANCE

    const tokenData = OxidaneToken.networks[networkId];
    if (tokenData) {
      const token = new web3.eth.Contract(OxidaneToken.abi, tokenData.address);
      this.setState({ token });
      //Fetching token balance
      let tokenBalance = await token.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ tokenBalance });
    } else {
      window.alert("Token contract not deployed to network");
    }

    //CREATING TOKEN-SALE CONTRACT INSTANCE
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
      //Fetching total sum of etherprices at which customers bought water
      var totalethprice = await tokensale.methods.etherpricesum().call();
      // console.log(totalethprice);//test-point
      //Converting from wei to ether
      var totalweiethprice = web3.utils.fromWei(totalethprice, "ether");
      //Fetching Totalnumber of water purchase
      const totaltokenpurchaseno = await tokensale.methods
        .tokenpurchasenumber()
        .call();
      // console.log(totaltokenpurchaseno);
      // console.log(totalweiethprice);//test-point
      // calculating avg token price on which customer bought tokens
      let avgtokenrate = totalweiethprice / totaltokenpurchaseno;
      // console.log(avgtokenrate);//test-point
      //if avgtokenrate is not an number(For initial token sale if total ethsum and number of purchase is zero)
      if (isNaN(avgtokenrate)) {
        //then avg rate is set to zero
        this.setState({
          avgtokenrate: 0,
        });
      } else {
        this.setState({
          avgtokenrate,
        });
      }
      // console.log(this.state.avgtokenrate);//test-point
    } else {
      window.alert("Tokensale contract not deployed to network");
    }
    //FETCHING TOKEN-ETHER RATE

    let tokenRate = await this.state.tokenSaleinst.methods.rate().call();
    // console.log(tokenrate);// test-point

    this.setState({ tokenRate });
  }

  oxdsellPriceFinder = async () => {
    //Fetching Current Ether-price
    let price = await checkethprice();
    // console.log(price);// test-point
    this.setState({ etherPrice: price });
    // console.log(price);//test-point
    // console.log(this.state.tokenRate);//test-point
    // console.log(this.state.etherprice);// test-point
    //calculating current token-price with current Etherprice
    let oxdPrice = 1 / (this.state.etherPrice / this.state.tokenRate); //tokenrate is set to 1 dollar for 1 OXD
    this.setState({ oxdPrice });
    console.log(this.state.oxdPrice);
    //if current averagetoken price is zero then selling rate will be current oxd rate
    if (this.state.avgtokenrate === 0) {
      this.setState({ sellingrate: this.state.oxdPrice });
    } else {
      //if current averagetoken price is greater than current token price then selling rate will be current oxd rate
      if (this.state.avgtokenrate > this.state.oxdPrice) {
        this.setState({ sellingrate: this.state.oxdPrice });
      } else {
        //if current averagetoken price is less than current token price then selling rate will be average rate
        this.setState({ sellingrate: this.state.avgtokenrate });
      }
    }
    // console.log(this.state.avgtokenrate);//test-point
  };

  //############ LOAD BLOCKCHAIN DATA & CREATING INSTANCE- SECTION-->END ############

  //###################### STATES - SECTION-->START #####################

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      loading: false,
      waterExchangeinst: {},
      exchangeAddress: "",
      waterSaleinst: {},
      tokenBalance: 0,
      etherPrice: 0,
      avgtokenrate: 0,
      sellingrate: 0,
      oxdPrice: 0,
      tokenSaleinst: "",
      tokenSaleAddress: "",
      tokenRate: 0,
    };
  }

  //###################### STATES - SECTION-->END #####################

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION-->START #######

  // FUNCTION TO HANDLE INPUT
  handleInputChange = (event) => {
    event.preventDefault();
    this.setState({
      [event.target.name]: event.target.value,
    });
  };
  //Function for triggering Token sale
  sellTokens =async (tokenAmount, etheramount) => {
    this.setState({ loading: true });
    //Approving tokens from waterexchange
    await this.state.token.methods
      .approve(this.state.tokenSaleAddress, tokenAmount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        //Transfering Tokens from Exchange to Oxidane & receiving ether amount
        this.state.tokenSaleinst.methods
          .sellTokens(tokenAmount, etheramount)
          .send({ from: this.state.account })
          .on("transactionHash", (hash) => {
            this.setState({ loading: false });
          });
      });
  };

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION--->END #######

  // ############## RENDERING SECTION--->START ################
  render() {
    if (this.state.loading === true) {
      return (
        <div>
          <Loader />
        </div>
      );
    } else {
      return (
        <div className="tokensale">
            <div className="card card border-light text-white "style={{
          backgroundColor: '#221f3b',
          
        }}>
            <div className="card-body">
              <h5 className="card-title">SellTokens</h5>
              <h5 className="card-title">TokenRate:-{this.state.sellingrate}</h5>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  let tokenAmount;
                  let ether;
                  // Fetching token amount
                  tokenAmount = this.input.value;
                  ether = this.state.etherAmount.toString();
                  ether = window.web3.utils.toWei(ether, "Ether");
                  //Triggering sell Function
                  this.sellTokens(tokenAmount, ether);
                  this.input.value = "";
                  this.setState({ etherAmount: "" });
                }}
              >
                <div className="form-group ">
                  <label className="text-black" for="exampleInputEmail1">
                    Token Amount
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    id="exampleInputEmail1"
                    onChange={(event) => {
                      const tokenAmount = this.input.value.toString();
                      this.setState({
                        //CALCULATED SELLING RATE
                        etherAmount: this.state.sellingrate * tokenAmount,
                      });
                    }}
                    ref={(input) => {
                      this.input = input;
                    }}
                  />
                </div>
                {/* Displaying Etherprice */}
                <div className="form-group">
                  <label for="exampleInputPassword1">ETHER PRICE</label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputPassword1"
                    value={this.state.etherAmount}
                  />
                </div>
                <button type="submit" class="btn btn-primary">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }
  }
}

// ############## RENDERING SECTION--->END  ################
export default Tokensale;
