import React from 'react';
import {BrowserRouter,Switch,Route} from "react-router-dom";
import Welcomepage from "../components/WelcomePage";
import Profilepage from "../components/Customer/UserProfilePage";
import Adminpage from "../components/Admin/AdminProfile";
import Exchangepage from "../components/Exchange/WaterExchangeProfile"
import Signup from "../components/Customer/Signup/Signup";
import Exchangesignup from "../components/Exchange/exchangesignup"
import Rti from "../components/RTI/rti"
                             
const Routes = ()=>{
    return(
        <BrowserRouter>
      
        <Switch>
            <Route path="/" exact component={Welcomepage}/>
            <Route path="/admin" exact component={Adminpage}/>
            <Route path="/profilepage" exact component={Profilepage}/>
            <Route path="/exchangesignup" exact component={Exchangesignup}/>
            <Route path="/signup" exact component={Signup}/>
             <Route path="/Rti" exact component={Rti}/> 
        </Switch>
       
        </BrowserRouter>
    )
};
export default Routes