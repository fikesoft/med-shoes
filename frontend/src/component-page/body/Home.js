import React from "react";
import '../../scss/home.scss'
//Import components
import Header from './section-component/Header' ;
import Landpage from "./section-component/Landpage";
import Shop from './section-component/Shop'
function Home({ user, onLogout }) {
  return (
    <div className="container-fluid">
        <Header/>
        <Landpage/>
        <Shop/>
      {/*
      If in future i want to add profile  and logout
      <button onClick={onLogout}>Logout</button> import { Link }'
       from "react-router-dom"; <Link to="/home/admin">Go to Admin Page</Link>*/}      
    </div>
  );
}

export default Home;
