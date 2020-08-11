import React, { Component } from "react";
class Loader extends Component {
  state = {};
  render() {
    return (
      <div>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
}
export default Loader;
