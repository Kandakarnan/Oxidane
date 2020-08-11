import React, { Component } from 'react';
import { Link, withRouter } from "react-router-dom";
import ParticlesBg from "particles-bg";
import Navbar from "./Basic/nav"
import "./css/welcomepage.css"
import "./JS/welcome"




class welcome extends Component {
    render() { 
        return ( 
            <div >
           <Navbar/>
           <div className="typewriter">
          <h1>
            <Link
              style={{
                color: "#221f3b",
              }}
              class="typewrite"
              data-period="2000"
              data-type='[ "Hi, Im OXIDANE.", "Im a Water Trading Dapp <br> For Public.", "I Sell OXD Tokens.", "I Give Pure Drops for OXD Tokens","You can trust me bcoz Im Powered by <br> Blockchain" ]'
            >
              <span class="wrap"></span>
            </Link>
          </h1>
{/* <div className="dropdown">
         
<button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    Dropdown button
  </button>
  <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">

  <Link className="dropdown-item"to="/signup">Do You want to Sign up?</Link>
  
  <Link className="dropdown-item"to="/signup"> Registered user?</Link>
 
  <Link className="dropdown-item"to="/">WaterExchange-Info</Link>
  <Link className="dropdown-item"to="/exchangesignup"> Registered Exchange?</Link>
  <Link className="dropdown-item"to="/admin">ADMIN</Link>

</div>
        </div> */}
            <ParticlesBg type="cobweb"color="#221f3b" bg={true}  />     
            </div>
            </div>
         );
    }
}
 
export default withRouter (welcome);