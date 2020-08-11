import React, { Component } from "react";
import "../css/exchangewallet.css";
class ExchangeWallet extends Component {
  //###################### STATES - SECTION-->START #####################
  constructor(props) {
    super(props);
    this.state = {};
  }
  //###################### STATES - SECTION-->END #####################

  // ############## RENDERING SECTION--->START ################
  render() {
    return (
      <div className="exchangewallet">
        <div className="container">
          <div
            className="card card border-light text-white "
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
            className="card card border-light text-white "
            style={{
              backgroundColor: "#221f3b",
            }}
          >
            <div className="card-header">DRINKING WATER BALANCE</div>
            <div className="card-body">
              <h5 className="card-title">LITRES</h5>
              <h5 className="card-title">{this.props.DrinkingwaterBalance}</h5>
            </div>
          </div>

          <div
            className="card card border-light text-white "
            style={{
              backgroundColor: "#221f3b",
            }}
          >
            <div className="card-header">NON DRINKING WATER BALANCE</div>
            <div className="card-body">
              <h5 className="card-title">LITRES</h5>
              <h5 className="card-title">
                {this.props.NonDrinkingwaterBalance}
              </h5>
            </div>
          </div>

          <div
            className="card card border-light text-white "
            style={{
              backgroundColor: "#221f3b",
            }}
          >
            <div className="card-header">DRINKING WATER RATE</div>
            <div className="card-body">
              <h5 className="">INDIVIDUAL RATE</h5>
              <h5 className="">{this.props.DrinkingwaterRate}</h5>
              <h5 className="">INDUSTRY RATE</h5>
              <h5 className="">{this.props.IndustryDrinkingRate}</h5>
            </div>
          </div>

          <div
            className="card card border-light text-white "
            style={{
              backgroundColor: "#221f3b",
            }}
          >
            <div className="card-header">NON DRINKING WATER RATE</div>
            <div className="card-body">
              <h5 className="">INDIVIDUAL RATE</h5>
              <h5 className="">{this.props.NonDrinkingwaterRate}</h5>
              <h5 className="">INDUSTRY RATE</h5>
              <h5 className="">{this.props.IndustryNonDrinkingRate}</h5>
            </div>
          </div>

          <div
            className="card card border-light text-white "
            style={{
              backgroundColor: "#221f3b",
            }}
          >
            <div className="card-header">DELIVERY CHARGE</div>
            <div className="card-body">
              <h5 className="card-title">OXD</h5>
              <h5 className="card-title">{this.props.DeliveryCharge}</h5>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
// ############## RENDERING SECTION--->END  ################
export default ExchangeWallet;
