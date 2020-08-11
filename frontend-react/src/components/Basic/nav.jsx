import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
class Navbar extends Component {
  render() {
    return (
      <div>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <Link className="nav-link active" to="/">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/signup">
              User
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/exchangesignup">
              Water-Exchange
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/Rti">
              RTI
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/admin">
              Admin
            </Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default withRouter(Navbar);
