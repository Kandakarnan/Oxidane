import React, { Component } from "react";
import "../../css/buytokens.css";
class BuyToken extends Component {
  //###################### STATES - SECTION-->START #####################

  constructor(props) {
    super(props);
    this.state = {
      etherAmount: "",
      etherPrice: "0",
    };
  }

  //###################### STATES - SECTION-->END #####################

  // ############## RENDERING SECTION--->START ################
  render() {
    return (
      <div className="buytokens">
       <div
          className="card card border-light text-white "
          style={{
            backgroundColor: "#221f3b",
          }}
        >
          <div className="card-body">
            <h5 className="card-title">BUY TOKENS</h5>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                let tokenAmount;
                let ether;
                //Fetching current etherprice from parent component
                let ethercurrentprice = this.props.oxd_to_Eth_Price.toString();
                //converting ether to Wei
                let ethertowei = window.web3.utils.toWei(
                  ethercurrentprice,
                  "Ether"
                );
                //Fetching Tokenamount from input
                tokenAmount = this.input.value;
                //Fetching calculated token - ether cost amount and converting to string form
                ether = this.state.etherAmount.toString();
                //token-ether cost is converted to Wei
                ether = window.web3.utils.toWei(ether, "Ether");
                // console.log(ethercurrentprice);//test-point
                // console.log(tokenAmount);//test-point
                // console.log(ether);//test-point
                //submitting value to buy function in parent component
                this.props.buyTokens(tokenAmount, ether, ethertowei);
                //after submitting states are cleared
                this.input.value = "";
                this.setState({ etherAmount: "" });
              }}
            >
              <div className="form-group ">
                <label className="text-black" for="exampleInputEmail1">
                  Token Amount
                </label>
                {/* Fetching Tokenamount */}
                <input
                  type="text"
                  className="form-control"
                  required
                  id="exampleInputEmail1"
                  onChange={(event) => {
                    const tokenAmount = this.input.value.toString();
                    // calculating Ether amount
                    this.setState({
                      etherAmount: this.props.oxd_to_Eth_Price * tokenAmount,
                    });
                  }}
                  ref={(input) => {
                    this.input = input;
                  }}
                />
              </div>
              <div className="form-group">
                {/* Displaying Token-cost */}
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
// ############## RENDERING SECTION--->END  ################
export default BuyToken;
