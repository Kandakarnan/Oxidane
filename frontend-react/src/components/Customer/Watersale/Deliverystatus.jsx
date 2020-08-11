import React, { Component } from "react";
import { loadWeb3 } from "../../../functions/helper";
import Sale from "../../../contracts/Watersale.json";
import OxidaneToken from "../../../contracts/OxidaneToken.json";
class DeliveryStatus extends Component {
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

      //Fetching Total- User-Purchase count
      const totalpurchase_Count = await this.state.waterSaleinst.methods
        .userpurchaseno(this.state.account)
        .call();
      console.log(totalpurchase_Count);
      //Storing count
      this.setState({ totalpurchase_Count });
      // initialising user pending delivery list array with empty value
      this.setState({ pendinglist: [] });
      // initialising user delivered list array with empty value
      this.setState({ deliveredlist: [] });
      // initialising user received list array with empty value
      this.setState({ receivedList: [] });
      //iterating through each purchase number of user
      this.setState({ rejectList: [] });
      for (var i = 1; i <= this.state.totalpurchase_Count; i++) {
        //Fetching all the uinque global purchase number of user
        var purchasenumber = await this.state.waterSaleinst.methods
          .userglobalnoretriever(this.state.account, i)
          .call();
        console.log(purchasenumber);
        //storing purchase number
        this.setState({ purchasenumber });
        //Fetching purchase status of each Purchase Number
        var status = await this.state.waterSaleinst.methods
          .getUserpurchaseStatus(this.state.account, this.state.purchasenumber)
          .call();
        this.setState({ status });
        console.log(this.state.status);
        // if status is in paid state(status 0=paid,1=Delivered,2=Received,3=Reject)
        if (this.state.status == "0") {
          //Fetching Data from waterpurchase event with global purchase number as filter
          await this.state.waterSaleinst.getPastEvents(
            "WaterPurchase",
            {
              filter: { globalpurchasenumber: this.state.purchasenumber },
              fromBlock: 0,
              toBlock: "latest",
            },
            (err, events) => {
              console.log("====>purchaseevents", events);
              for (var n = 0; n <= events.length - 1; n++) {
                var pendingarray = events[n].returnValues;
                //storing all the list in pending list array
                this.setState({
                  pendinglist: [...this.state.pendinglist, pendingarray],
                });
              }
            }
          );
          console.log(this.state.pendinglist);
        }
        // if status is in Delivered state(status 0=paid,1=Delivered,2=Received,3=Reject)
        if (this.state.status == "1") {
          //Fetching Data from waterDelivery event with global purchase number as filter
          await this.state.waterSaleinst.getPastEvents(
            "WaterDelivery",
            {
              filter: { globalpurchasenumber: this.state.purchasenumber },
              fromBlock: 0,
              toBlock: "latest",
            },
            (err, events) => {
              console.log("====>deliveredevents", events);
              for (var m = 0; m <= events.length - 1; m++) {
                var deliveredarray = events[m].returnValues;
                //storing all the list in delivered list array
                this.setState({
                  deliveredlist: [...this.state.deliveredlist, deliveredarray],
                });
              }
            }
          );
        }
        // if status is in Received state(status 0=paid,1=Delivered,2=Received,3=Reject)
        if (this.state.status == "2") {
          //Fetching Data from DeliveryConfirmation event with global purchase number as filter
          await this.state.waterSaleinst.getPastEvents(
            "DeliveryConfirmation",
            {
              filter: { globalpurchasenumber: this.state.purchasenumber },
              fromBlock: 0,
              toBlock: "latest",
            },
            (err, events) => {
              console.log("====>receiveddevents", events);
              for (var p = 0; p <= events.length - 1; p++) {
                var receivedarray = events[p].returnValues;
                //storing all the list in receivedList list array
                this.setState({
                  receivedList: [...this.state.receivedList, receivedarray],
                });
              }
            }
          );
        }

        if (this.state.status == "3") {
          //Fetching Data from DeliveryConfirmation event with global purchase number as filter
          await this.state.waterSaleinst.getPastEvents(
            "DeliveryRejection",
            {
              filter: { globalpurchasenumber: this.state.purchasenumber },
              fromBlock: 0,
              toBlock: "latest",
            },
            (err, events) => {
              console.log("====>rejecteddevents", events);
              for (var q = 0; q <= events.length - 1; q++) {
                var rejectarray = events[q].returnValues;
                //storing all the list in receivedList list array
                this.setState({
                  rejectList: [...this.state.rejectList, rejectarray],
                });
              }
            }
          );
        }
      }
      console.log(this.state.receivedList);
    } else {
      window.alert("Tokensale contract not deployed to network");
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
      deliverylist: [],
      rejectList: [],
      deliveredlist: [],
      totalpurchase_Count: 0,
      pendinglist: [],
      receivedList: [],
      deliverytime: 0,
      tokenamount: 0,
      purchasenumber: 0,
      status: 0,
    };
  }

  //###################### STATES - SECTION-->END #####################

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION-->START #######

  //function to Trigger receive water delivery for customer user
  receivesubmit = async (event) => {
    event.preventDefault();
    console.log(event.currentTarget.value);
    console.log(event.currentTarget.name);
    //Triggering confirmation
    await this.state.waterSaleinst.methods
      .Confirmation(
        event.currentTarget.value,
        event.currentTarget.name,
        this.props.customerno
      )
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.loadBlockchaindata();
      });
  };

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION-->END #######
  // ############## RENDERING SECTION--->START ################
  render() {
    return (
      <div className="container">
        <div
          className="card card border-danger text-white "
          style={{
            backgroundColor: "#221f3b",
          }}
        >
          <div className="card-body">
            {/* Displaying Pending list */}
            <h5 className="card-title">DELIVERY PENDING LIST</h5>
            <table className="table table-bordered text-white">
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
                {this.state.pendinglist.map((ex, key) => {
                  var a;
                  if (ex.watertype == 0) {
                    a = "Drinking";
                  } else {
                    a = "Non-Drinking";
                  }
                  return (
                    <tr>
                      <th scope="row">{key}</th>
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
          className="card card border-warning text-white"
          style={{
            backgroundColor: "#221f3b",
          }}
        >
          <div className="card-body">
            {/* Displaying Delivered list */}
            <h5 className="card-title">DELIVERED LIST</h5>
            <table className="table table-bordered text-white">
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
                {this.state.deliveredlist.map((ex, key) => {
                  var b;
                  if (ex.watertype == 0) {
                    b = "Drinking";
                  } else {
                    b = "Non-Drinking";
                  }
                  return (
                    <tr className="">
                      <th scope="row">{key}</th>
                      <td>{ex.globalpurchasenumber}</td>
                      <td>{ex.exchangeaddr}</td>
                      <td>{b}</td>
                      <td>{ex.quantity}</td>
                      <td>{ex._time}</td>

                      <td>
                        <button
                          type="submit"
                          className="btn btn-success"
                          name={ex.exchangeaddr}
                          value={ex.globalpurchasenumber}
                          onClick={this.receivesubmit}
                        >
                          Received
                        </button>{" "}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Displaying Received list */}
        <div
          className="card card border-success text-white "
          style={{
            backgroundColor: "#221f3b",
          }}
        >
          <div className="card-body">
            <h5 className="card-title">RECEIVED LIST</h5>
            <table className="table table-bordered text-white">
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
                {this.state.receivedList.map((ex, key) => {
                  var c;
                  if (ex.watertype == 0) {
                    c = "Drinking";
                  } else {
                    c = "Non-Drinking";
                  }
                  return (
                    <tr className="">
                      <th scope="row">{key}</th>
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
          className="card card border-success text-white "
          style={{
            backgroundColor: "#221f3b",
          }}
        >
          <div className="card-body">
            <h5 className="card-title">REJECTED LIST</h5>
            <table className="table table-bordered text-white">
              <thead className="thead-dark">
                <tr>
                  <th scope="col">SL NO</th>
                  <th scope="col">PurchaseNO</th>
                  <th scope="col">Exchange Address</th>
                  <th scope="col">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {this.state.rejectList.map((ex, key) => {
                  return (
                    <tr className="">
                      <th scope="row">{key}</th>
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
    );
  }
}
// ############## RENDERING SECTION--->END ################
export default DeliveryStatus;
