import React, { Component } from "react";
import { loadWeb3 } from "../../functions/helper";
import Sale from "../../contracts/Watersale.json";
import OxidaneToken from "../../contracts/OxidaneToken.json";
import Logoutnav from "../Basic/logoutnav";
class RTI extends Component {
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

    //CREATING TOKEN CONTRACT INSTANCE

    const tokenData = OxidaneToken.networks[networkId];
    if (tokenData) {
      const token = new web3.eth.Contract(OxidaneToken.abi, tokenData.address);
      this.setState({ token });
    }

    //CREATING WATERSALE CONTRACT INSTANCE

    const WaterSaleData = Sale.networks[networkId];
    if (WaterSaleData) {
      const waterSaleinst = new web3.eth.Contract(
        Sale.abi,
        WaterSaleData.address
      );
      //storing instance
      this.setState({ waterSaleinst });
      await this.state.waterSaleinst.getPastEvents(
        "WaterPurchase",
        {
          fromBlock: 0,
          toBlock: "latest",
        },
        (err, events) => {
          for (var n = 0; n <= events.length - 1; n++) {
            var pendingarray = events[n].returnValues;
            //storing all the list in pending list array
            this.setState({
              pendinglist: [...this.state.pendinglist, pendingarray],
            });
          }
        }
      );

      await this.state.waterSaleinst.getPastEvents(
        "WaterDelivery",
        {
          fromBlock: 0,
          toBlock: "latest",
        },
        (err, events) => {
          console.log(events);
          for (var m = 0; m <= events.length - 1; m++) {
            var deliveredarray = events[m].returnValues;
            //storing all the list in delivered list array
            this.setState({
              deliveredlist: [...this.state.deliveredlist, deliveredarray],
            });
          }
        }
      );

      await this.state.waterSaleinst.getPastEvents(
        "DeliveryConfirmation",
        {
          fromBlock: 0,
          toBlock: "latest",
        },
        (err, events) => {
          for (var p = 0; p <= events.length - 1; p++) {
            var receivedarray = events[p].returnValues;
            //storing all the list in receivedList list array
            this.setState({
              receivedList: [...this.state.receivedList, receivedarray],
            });
          }
        }
      );

      await this.state.waterSaleinst.getPastEvents(
        "DeliveryRejection",
        {
          fromBlock: 0,
          toBlock: "latest",
        },
        (err, events) => {
          for (var q = 0; q <= events.length - 1; q++) {
            var rejectedarray = events[q].returnValues;
            //storing all the list in pending list array
            this.setState({
              rejectlist: [...this.state.rejectlist, rejectedarray],
            });
          }
        }
      );
    } else {
      window.alert("Tokensale contract not deployed to network");
    }
    console.log(this.state.loading);
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
      deliverylist: [],
      deliveredlist: [],
      rejectlist: [],
      totalpurchase_Count: 0,
      pendinglist: [],
      receivedList: [],
      deliverytime: 0,
      tokenamount: 0,
      purchasenumber: 0,
      status: 0,
      loading: false,
    };
  }

  //###################### STATES - SECTION-->END #####################
  render() {
    return (
      <div
        style={{
          backgroundColor: "#221f3b",
          height: "1000px",
        }}
      >
        <Logoutnav />

        <div className="container">
          <h3>ALL PURCHASE DETAILS FOR PUBLIC</h3>
          <div
            className="card card border-danger text-danger "
            style={{
              backgroundColor: "#221f3b",
            }}
          >
            <div class="card-body">
              {/* Displaying Pending list */}
              <h5 class="card-title">DELIVERY PENDING LIST</h5>
              <table class="table table-bordered text-white ">
                <thead className="thead-dark">
                  <tr className="">
                    <th scope="col">SL NO</th>
                    <th scope="col">PurchaseNO</th>
                    <th scope="col">Exchange Address</th>
                    <th scope="col">WaterType</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.pendinglist.map((ex, key1) => {
                    var a;
                    if (ex.watertype == 0) {
                      a = "Drinking";
                    } else {
                      a = "Non-Drinking";
                    }
                    return (
                      <tr>
                        <th scope="row">{key1}</th>
                        <td>{ex.globalpurchasenumber}</td>
                        <td>{ex.exchangeaddr}</td>
                        <td>{a}</td>
                        <td>{ex._quantity}</td>
                        <td>{ex._time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="card card border-success text-success "
            style={{
              backgroundColor: "#221f3b",
            }}
          >
            <div class="card-body">
              {/* Displaying Delivered list */}
              <h5 class="card-title">DELIVERED LIST</h5>
              <table class="table table-bordered text-white">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">SL NO</th>
                    <th scope="col">PurchaseNO</th>
                    <th scope="col">Exchange Address</th>
                    <th scope="col">WaterType</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.deliveredlist.map((ex2, key2) => {
                    var b;
                    if (ex2.watertype == 0) {
                      b = "Drinking";
                    } else {
                      b = "Non-Drinking";
                    }
                    return (
                      <tr className="">
                        <th scope="row">{key2}</th>
                        <td>{ex2.globalpurchasenumber}</td>
                        <td>{ex2.exchangeaddr}</td>
                        <td>{b}</td>
                        <td>{ex2.quantity}</td>
                        <td>{ex2._time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="card card border-warning text-info "
            style={{
              backgroundColor: "#221f3b",
            }}
          >
            <div class="card-body">
              {/* Displaying Received list */}
              <h5 class="card-title">DELIVERY RECEIVED LIST</h5>
              <table class="table table-bordered text-white">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">SL NO</th>
                    <th scope="col">PurchaseNO</th>
                    <th scope="col">Exchange Address</th>
                    <th scope="col">WaterType</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.receivedList.map((ex, key3) => {
                    var c;
                    if (ex.watertype == 0) {
                      c = "Drinking";
                    } else {
                      c = "Non-Drinking";
                    }
                    return (
                      <tr>
                        <th scope="row">{key3}</th>
                        <td>{ex.globalpurchasenumber}</td>
                        <td>{ex.exchangeaddr}</td>
                        <td>{c}</td>
                        <td>{ex.quantity}</td>
                        <td>{ex._time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="card card border text-white "
            style={{
              backgroundColor: "#221f3b",
            }}
          >
            <div class="card-body">
              {/* Displaying Received list */}
              <h5 class="card-title">DELIVERY REJECTED LIST</h5>
              <table class="table table-bordered text-white">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">SL NO</th>
                    <th scope="col">PurchaseNO</th>
                    <th scope="col">Exchange Address</th>
                    <th scope="col">TimeStamp</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.rejectlist.map((ex, key3) => {
                    return (
                      <tr>
                        <th scope="row">{key3}</th>
                        <td>{ex.globalpurchasenumber}</td>
                        <td>{ex.exchangeaddr}</td>
                        <td>{ex._time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default RTI;
