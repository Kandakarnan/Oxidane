import React, { Component } from "react";
import { loadWeb3 } from "../../functions/helper";
import Loader from "../Basic/Loader";
import Logoutnav from "../Basic/logoutnav";
import Waterexchange from "../../contracts/Waterexchange.json";
import "../css/adminprofile.css";
import IPFSloader from "../Basic/ipfsloader";
const ipfsClient = require("ipfs-http-client");
//Creating IPFS instance
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

class Adminprofile extends Component {
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

      this.setState({ exchanges: [] });
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
      cluster: 0,
      buffer: null,
      loading: false,
      hash: "",
    };
  }
  //###################### STATES - SECTION-->END #####################

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION-->START #######

  //FUNCTION TO HANDLE INPUT DATA

  handleInputChange = (event) => {
    event.preventDefault();
    //storing input
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  //IPFS FILE CAPTURE
  captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("buffer", this.state.buffer);
    };
  };

  //FUNCTION TO SUBMIT DATA
  handleSubmit = async (event) => {
    event.preventDefault();

    let register = await this.state.waterExchangeinst.methods
      .localExchange(this.state.exchangeAddress)
      .call();
    let registered = register.registered;

    //IF NOT REGISTERD
    if (!registered) {
      // REGISTERING EXCHANGE
      this.setState({ loading: true });
      console.log("Submitting file to ipfs...");
      // Submiting IPFS
      ipfs.add(this.state.buffer, async (error, result) => {
        console.log("Ipfs result", result[0].hash);
        if (error) {
          console.log(error);
          return;
        }
        //Registering Exchange
        await this.state.waterExchangeinst.methods
          .registerExchange(
            this.state.exchangeAddress,
            this.state.location,
            this.state.cluster,
            result[0].hash
          )
          .send({ from: this.state.account })
          .then((r) => {
            return this.setState({ loading: false });
          });
      });

      //IF ALREADY REGISTERED
    } else {
      alert("EXCHANGE ALREADY REGISTERED");
    }
  };

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION--->END #######

  // ############## RENDERING SECTION--->START ################
  render() {
    if (this.state.loading) {
      return <IPFSloader />;
    } else {
      return (
        <div
          style={{
            backgroundColor: "#221f3b",
            height: "1000px",
          }}
          className=""
        >
          <Logoutnav />
          <div className="adminprofile">
            <div
              className="card card border-info text-white "
              style={{
                backgroundColor: "#221f3b",
              }}
            >
              <div className="card-body">
                <h5 className="card-title">WATER-EXCHANGE REGISTRATION</h5>
                <form
                  onSubmit={this.handleSubmit}
                  encType="multipart/form-data"
                >
                  <div className="form-group ">
                    {/* Fetching Exchange Address */}
                    <label className="text-black" for="exampleInputEmail1">
                      Water-Exchange Address
                    </label>
                    <input
                      name="exchangeAddress"
                      type="text"
                      required
                      onChange={this.handleInputChange}
                    />
                  </div>
                  {/* Fetching location */}
                  <div className="form-group">
                    <label for="exampleInputPassword1">Location</label>
                    <input
                      name="location"
                      id="icon_prefix"
                      type="text"
                      required
                      class="validate"
                      onChange={this.handleInputChange}
                    />
                  </div>
                  {/* Fetching cluster */}
                  <div className="form-group">
                    <label for="exampleInputPassword1">Location</label>
                    <select
                      className="form-control"
                      id="exampleFormControlSelect1"
                      name="cluster"
                      onChange={this.handleInputChange}
                    >
                      <option>Select Cluster</option>
                      <option value="0">Central Kerala</option>
                      <option value="1">North Kerala</option>
                      <option value="2">South Kerala</option>
                    </select>
                  </div>

                  {/* Fetching Registration Certificate */}
                  <div className="form-group">
                    <label for="exampleFormControlSelect1">
                      Select APPROVAL CERTIFICATE FILE
                    </label>
                    <input type="file" onChange={this.captureFile} />
                    <input type="submit" class="btn btn-success" />
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* Displaying Registered Exchanges */}
          <div className="tableheading">
            <h4 className="text-white">REGISTERED WATER-EXCHANGE DETAILS</h4>
          </div>
          <div className="container">
            <table className="table table-dark  tabledit">
              <thead>
                <tr>
                  <th scope="col">EXCHANGE NO</th>
                  <th scope="col">EXCHANGE ADDRESS</th>
                  <th scope="col">LOCATION</th>
                  <th scope="col">CLUSTER</th>
                  <th scope="col">IPFS CERTIFICATE</th>
                </tr>
              </thead>
              <tbody>
                {this.state.exchanges.map((ex, key) => {
                  return (
                    <tr>
                      <th scope="row">{ex.exchangeNumber}</th>
                      <td>{ex.exchangeAddress}</td>
                      <td>{ex.location}</td>
                      <td>{ex.region}</td>
                      <td>
                        <a
                          href={"https://ipfs.infura.io/ipfs/" + ex.certificate}
                        >
                          {ex.certificate}
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }
}

// ############## RENDERING SECTION--->END  ################
export default Adminprofile;
