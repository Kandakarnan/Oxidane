import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { signout } from "../../functions/helper";
class LogoutNavbar extends Component {
  render() {
    return (
      <div>
        <nav className="nav nav-tabs  btn-outline-info">
          <a className="navbar-brand text-white"  href="#">
            OXIDANE
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarTogglerDemo02"
            aria-controls="navbarTogglerDemo02"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <form className="form-inline my-2 my-lg-0">
            <Link to="/">
              <button
                className="btn btn-success my-2 my-sm-0"
                type="submit"
              >
                LOGOUT
              </button>
            </Link>
          </form>
        </nav>
      </div>
    );
  }
}

export default withRouter(LogoutNavbar);
