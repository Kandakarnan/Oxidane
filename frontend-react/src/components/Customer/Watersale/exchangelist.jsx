import React, { Component } from "react";
import { loadWeb3 } from "../../../functions/helper";
import Waterexchange from "../../../contracts/Waterexchange.json";
class Exchangelist extends Component {
  async componentWillMount() {
    await loadWeb3();
    await this.loadBlockchaindata();
  }

  //############ LOAD BLOCKCHAIN DATA & CREATING CONTRACT INSTANCE SECTION-->START ############

  async loadBlockchaindata() {
    this.setState({ loading: true });
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    //GETTING NETWORKID

    const networkId = await web3.eth.net.getId();

    //CREATING WATER EXCHANGE CONTRACT INSTANCE

    const WaterExchangeData = Waterexchange.networks[networkId];
    if (WaterExchangeData) {
      const waterExchangeinst = new web3.eth.Contract(
        Waterexchange.abi,
        WaterExchangeData.address
      );
      this.setState({ waterExchangeinst });

      //FETCHING TOTAL NUMBER OF EXCHNAGES

      const exchange_Count = parseInt(
        await this.state.waterExchangeinst.methods.exchangeCount().call()
      );
      this.setState({ exchange_Count });

      //FETCHING EXCHANGE DETAILS

      for (var i = 1; i <= this.state.exchange_Count; i++) {
        let exchangeAddress = await waterExchangeinst.methods
          .exchange(i)
          .call();
        let exchange = await waterExchangeinst.methods
          .localExchange(exchangeAddress)
          .call();
        this.setState({ exchanges: [...this.state.exchanges, exchange] });
      }
    }
    this.setState({ loading: false });
    console.log(this.state.exchanges);
  }

  //############ LOAD BLOCKCHAIN DATA & CREATING INSTANCE- SECTION-->END ############

  //###################### STATES - SECTION-->START #####################
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      waterExchangeinst: {},
      exchangeAddress: "",
      exchanges: [],
      exchange_Count: "",
      location: "",
      buffer: null,
      loading: false,
      hash: "",
      selectexchange: [],
      cluster: 0,
    };
  }
  //###################### STATES - SECTION-->END #####################

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION-->START #######
  //Function to select exchanges based on user input
  handleSelectChange = async (event) => {
    event.preventDefault();

    this.setState({
      [event.target.name]: event.target.value,
      selectexchange: [],
    });
    await this.setState({ selectexchange: [] });
    // console.log(this.state.cluster);

    //Iterating through all exchanges
    for (var i = 0; i <= this.state.exchanges.length - 1; i++) {
      var exchange = this.state.exchanges[i];
      var cluster = exchange.region;
      // console.log(cluster);

      //If selected cluster is equal to cluster
      if (cluster == this.state.cluster) {
        //store selected exchange
        this.setState({
          selectexchange: [
            ...this.state.selectexchange,
            this.state.exchanges[i],
          ],
        });
      }
    }
  };
  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION-->END #######
  // ############## RENDERING SECTION--->START ################
  render() {
    return (
      <div className="container">
        <div
          className="card card border-info text-white "
          style={{
            backgroundColor: "#221f3b",
          }}
        >
          <div className="card-body">
            {/* Display selected exchanges */}
            <h5 className="card-title">AVAILABLE WATER EXCHANGES</h5>
            <table className="table table-bordered  table-white">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">Exchange no</th>
                  <th scope="col">Exchange Address</th>
                  <th scope="col">Available Drinking Water</th>
                  <th scope="col">Available Non Drinking Water</th>
                </tr>
              </thead>
              <tbody>
                {this.state.selectexchange.map((ex, key) => {
                  return (
                    <tr className="table-light">
                      <th scope="row">{ex.exchangeNumber}</th>
                      <td>{ex.exchangeAddress}</td>
                      <td>{ex.drinkingWaterquantity}</td>
                      <td>{ex.nonDrinkingwaterQuantity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Fetching cluster */}
          <form className="container">
            <div className="form-group">
              <label for="exampleFormControlSelect1" className="text-white">
                Cluster
              </label>
              <select
                className="form-control"
                id="exampleFormControlSelect1"
                name="cluster"
                onChange={this.handleSelectChange}
              >
                <option>select cluster</option>
                <option value="0">Central Kerala</option>
                <option value="1">North Kerala</option>
                <option value="2">South Kerala</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
// ############## RENDERING SECTION--->END ################
export default Exchangelist;
