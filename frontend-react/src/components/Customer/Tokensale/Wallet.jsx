import React, { Component } from "react";
import Web3 from "web3";
import "../../css/wallet.css";
class Wallet extends Component {
  //###################### STATES - SECTION-->START #####################
  constructor(props) {
    super(props);
    this.state = {};
  }
  //###################### STATES - SECTION-->END #####################

  // ############## RENDERING SECTION--->START ################
  render() {
    return (
      <div className="container wallet">
        <div
          className="card card border-danger text-white "
          style={{
            backgroundColor: "#221f3b",
          }}
        >
          <div className="card-header">CURRENT ETHER PRICE</div>
          <div className="card-body">
            <h5 className="card-title">DOLLARS</h5>
            <h5 className="card-title">{this.props.ether_to_Dollar_Price} $</h5>
            <div class="spinner-grow text-danger" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>

        <div
          className="card card border-success text-white "
          style={{
            backgroundColor: "#221f3b",
          }}
        >
          <div className="card-header">CURRENT OXD PRICE</div>
          <div className="card-body">
            <h5 className="card-title">{this.props.oxd_to_Eth_Price}</h5>
            ETHER
          </div>
        </div>

        <div
          className="card card border-warning text-white "
          style={{
            backgroundColor: "#221f3b",
          }}
        >
          <div className="card-header">MY OXD BALANCE</div>
          <div className="card-body">
            <h5 className="card-title">OXD</h5>
            <h5 className="card-title">{this.props.tokenBalance}</h5>
          </div>
        </div>

        <div
          className="card card border-info text-white "
          style={{
            backgroundColor: "#221f3b",
          }}
        >
          <div className="card-header">MY ETHER BALANCE</div>
          <div className="card-body">
            <h5 className="card-title">ETHER</h5>
            <h5 className="card-title">
              {Web3.utils.fromWei(this.props.ethBalance, "ether")}
            </h5>
          </div>
        </div>
      </div>
    );
  }
}
// ############## RENDERING SECTION--->END  ################
export default Wallet;
