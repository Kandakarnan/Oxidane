import React, { Component } from "react";
import M from "materialize-css";
import { loadWeb3 } from "../../../functions/helper";
import { Redirect } from "react-router-dom";
import Kyc from "../../../contracts/Kyc.json";
import "../../css/signup.css";
import ParticlesBg from "particles-bg";
class Signup extends Component {
  async componentWillMount() {
    await loadWeb3();
    await this.loadBlockchaindata();
    await this.authenticate();
  }

  //############ LOAD BLOCKCHAIN DATA & CREATING CONTRACT INSTANCE SECTION-->START ############

  async loadBlockchaindata() {
    //creating web3 instance
    const web3 = window.web3;
    //FETCHING ACCOUNT
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    //GETTING NETWORKID
    const networkId = await web3.eth.net.getId();

    //CREATING KYC CONTRACT INSTANCE
    const KycData = Kyc.networks[networkId];
    if (KycData) {
      const kycInst = new web3.eth.Contract(Kyc.abi, KycData.address);
      this.setState({ kycInst });
    }
    await this.authenticate();
  }

  //############ LOAD BLOCKCHAIN DATA & CREATING INSTANCE- SECTION-->END ############

  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION-->START #######

  //FUNCTION TO HANDLE SUBMIT DATA
  handleSubmit = async (event) => {
    event.preventDefault();
    await this.setCustomer(this.state.category);
    await this.loadBlockchaindata();
  };

  // FUNCTION TO HANDLE INPUT DATA
  handleInputChange = (event) => {
    event.preventDefault();
    //storing input
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  // FUNCTION TO AUTHENTICATE USER
  authenticate = async () => {
    let kycaddr = await this.state.kycInst.methods
      .registration(this.state.account)
      .call();
    //checking whether exchange is registered
    if (kycaddr.acountno === this.state.account) {
      this.setState({ registered: true });
    }
  };

  // FUNCTION TO REGISTER USER
  setCustomer = async (category) => {
    await this.state.kycInst.methods
      .signup(category)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.loadBlockchaindata();
      });
  };
  //##### FRONT-END DATA FETCHING & SMART-CONTRACT FUNCTION INTERACTION - SECTION--->END #######

  //###################### STATES - SECTION-->START #####################
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      kycInst: {},
      registered: false,
      name: "",
      category: 0,
    };
  }
  //###################### STATES - SECTION-->END #####################

  // ############## RENDERING SECTION--->START ################
  render() {
    if (this.state.registered) {
      // if registered then redirects to userprofilepage else to signup page
      return <Redirect to="/profilepage" />;
    } else {
      return (
        <div>
          <div className="signup container">
            <div className="card bg-light mb-3">
              <div className="card-body">
                <h5 className="card-title">Signup</h5>
                <form>
                  {/* Fetching user category */}
                  <div className="form-group">
                    <label for="exampleFormControlSelect1">
                      Select Category
                    </label>
                    <select
                      className="form-control"
                      id="exampleFormControlSelect1"
                      name="category"
                      onChange={this.handleInputChange}
                    >
                      <option>Select Category</option>
                      <option value="0">Individual</option>
                      <option value="1">Industry</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    onClick={this.handleSubmit}
                  >
                    Register
                  </button>
                </form>
              </div>
            </div>
          </div>
          <ParticlesBg type="square" color="#1a237e" bg={true} />
        </div>
      );
    }
  }
}
// ############## RENDERING SECTION--->END  ################
export default Signup;
