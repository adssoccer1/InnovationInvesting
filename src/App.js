import React, {Component} from 'react';
import './App.css';
import Fund from './components/Fund.js';
import FundHeader from './components/FundHeader.js';
import Intro from './components/Intro.js';
import MainNavBar from './components/MainNavBar.js';
import axios from 'axios';
import GoogleLogin from 'react-google-login';

import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Row, Col, Modal, Button} from 'react-bootstrap';



class App extends Component {

  constructor(props) {
    super(props); 

    this.state = {
      isLoggedIn : false,
      logginPopUp : false,
      date : "",
      displayFund : "ARKK",
      sortBy: "Largest Position by Weight", 
      fundHoldings: { "ARKK" : [], "ARKG" : [], "ARKF":[], "ARKW":[], "ARKQ":[], "PRINT":[], 'IZRL':[]}, 
      holdings : [],
      displayIntro : false
    }
    this.toggleDisplayIntro = this.toggleDisplayIntro.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
    this.handleClose = this.handleClose.bind(this);

  }
  

  onSignIn(googleUser) {
    console.log("onsignin clicked!")
    var profile = googleUser.getBasicProfile();
    //console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    //console.log('Name: ' + profile.getName());
    //console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present. 
    const data = {
      email: profile.getEmail()
    }
    axios.post('https://arkapi2.herokuapp.com/signUpReact', data)
    .then(function(response){
          //console.log(response); 
    })
    .then(() => {
      this.setState( () => {
        const isLoggedIn = true;
        const logginPopUp = false;
        return{isLoggedIn, logginPopUp};
      });
    })
    .then(() => {
      console.log("State is now", this.state.isLoggedIn)
    });

  }
  
  componentDidMount() {
    this.getData();
  }

  getData() {
    const fund = this.state.displayFund;
    if (this.state.fundHoldings[fund].length > 0) {
      console.log("data already here, no need to fetch"); 
      return;
    } 
    fetch("https://arkapi2.herokuapp.com/" + fund + "/4710cdb7-b205-4802-957a-7c311eac5327")
    .then(
      response=> response.json())
    .then(
      data => {
        this.setState(prevState => {
          let fundHoldings = Object.assign({}, prevState.fundHoldings)
          let date = data.timestamp;
          fundHoldings[fund] = data.holdings;
          return {fundHoldings, date};
        })
      })
    .catch((error) => console.log(error + " Can’t access response. Blocked by browser?"))
  }

  changeFund = (e) => {
    console.log("CLICKED YOOOO", e.target.innerText)
    if(!this.state.isLoggedIn){
      this.setState({logginPopUp : true});
      return;
    }
    const newState =  e.target.innerText;
    this.setState({displayFund : newState}, () => {
         this.getData();
    });
  }
 
  changeSortBy = (e) => {
    console.log("changed sort by function touched: ", e.target.innerText)
    const newSortBy = e.target.innerText; 
    if(this.state.sortBy === newSortBy){
      console.log("already sorted this way");
      return; 
    }

    this.setState(
      {sortBy : newSortBy}, 
      () => {
        console.log("here2", newSortBy)
        if(newSortBy === "Increasing Market Cap"){
          console.log("now sorting for: ", newSortBy)
          this.sortByIncreasingMarketCap();
        }else if(newSortBy === "Largest Position by Weight"){
          console.log("now sorting for: ", newSortBy)
          this.sortByLargestWeight();
        }else if(newSortBy === "Closest to 52 Week Low"){
          console.log("now sorting for: ", newSortBy)
          this.sortByClosestYearLow(); 
        }else if(newSortBy === "Closest to 52 Week High"){
          console.log("now sorting for: ", newSortBy)
          this.sortByClosestYearHigh(); 
        }else if(newSortBy === "% of Company Owned by " +this.state.displayFund){
          console.log("now sorting for: ", newSortBy)
          this.percentCompanyOwned(); 
        }
    });
  }

  percentCompanyOwned(){
    console.log("sorting by percent of company owned by ark");
    const fund = this.state.displayFund; 
    const listOfHoldings = [...this.state.fundHoldings[fund]];
    listOfHoldings.sort((a, b) => (( a.value) / (a.marketCap *1000000)  < ( b.value) / (b.marketCap *1000000)) ? 1 : -1)
    this.setState(prevState => {
      let fundHoldings = Object.assign({}, prevState.fundHoldings)
      fundHoldings[fund] = listOfHoldings;
      return{fundHoldings}; 
    })

  }

  sortByClosestYearLow(){
    console.log("sorting by closest to 52 week low");
    const fund = this.state.displayFund; 
    const listOfHoldings = [...this.state.fundHoldings[fund]];
    listOfHoldings.sort((a, b) => (((a.price - a.fiftyTwoWeekLow) / a.fiftyTwoWeekLow)  > (((b.price - b.fiftyTwoWeekLow) / b.fiftyTwoWeekLow))) ? 1 : -1)
    this.setState(prevState => {
      let fundHoldings = Object.assign({}, prevState.fundHoldings)
      fundHoldings[fund] = listOfHoldings;
      return{fundHoldings}; 
    })
  }

  sortByClosestYearHigh(){
    console.log("sorting by closest to 52 week HIGH");
    const fund = this.state.displayFund; 
    const listOfHoldings = [...this.state.fundHoldings[fund]];
    listOfHoldings.sort((a, b) => (((a.fiftyTwoWeekHigh - a.price) / a.fiftyTwoWeekHigh)  > (((b.fiftyTwoWeekHigh - b.price) / b.fiftyTwoWeekHigh))) ? 1 : -1)
    this.setState(prevState => {
      let fundHoldings = Object.assign({}, prevState.fundHoldings)
      fundHoldings[fund] = listOfHoldings;
      return{fundHoldings}; 
    })
  }

  sortByIncreasingMarketCap(){
    console.log("sorting by marketCap function touched and now sorting")
    const fund = this.state.displayFund; 
    const listOfHoldings = [...this.state.fundHoldings[fund]];
    listOfHoldings.sort((a, b) => (a.marketCap < b.marketCap) ? 1 : -1)
    this.setState(prevState => {
        let fundHoldings = Object.assign({}, prevState.fundHoldings)
        fundHoldings[fund] = listOfHoldings;
        return{fundHoldings}; 
    })
  }

  sortByLargestWeight(){
    console.log("sorting by Weight function touched and now sorting")
    const fund = this.state.displayFund; 
    const listOfHoldings = [...this.state.fundHoldings[fund]];
    listOfHoldings.sort((a, b) => (a.weight < b.weight) ? 1 : -1)
    this.setState(prevState => {
      let fundHoldings = Object.assign({}, prevState.fundHoldings)
      fundHoldings[fund] = listOfHoldings;
      return{fundHoldings}; 
    })
  }

  toggleDisplayIntro(){
    console.log("toglle was pressed")
    this.setState({
      displayIntro : !this.state.displayIntro
    })
  }

  handleClose(){
    this.setState({logginPopUp : false});
  }

  responseGoogle = (response) => {
    console.log("sign in failed")
    console.log(response);
  }
  
  render() {

    const colStyle = {
      background: 'rgba(255,255,255,0.7)', /* newer browsers */
      margin: '10px', 

    }; 

    return (
    <div className="entireApp">
      <Container>
        

        


        <Modal show={this.state.logginPopUp} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <GoogleLogin
              clientId="405465266024-snbatcula099k3olppa1qqd8v45i72bo.apps.googleusercontent.com"
              buttonText="Login"
              onSuccess={this.onSignIn}
              onFailure={this.responseGoogle}
              cookiePolicy={'single_host_origin'}
              />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={this.handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <Intro toggle={this.toggleDisplayIntro} displayIntro={this.state.displayIntro}></Intro>
        <MainNavBar handler={this.changeFund}></MainNavBar>

        <Row>
          <Col sm={1}></Col>
          <Col  id="mainCol" style={colStyle} sm>
              <div id="FundHeader">
                <h1> {this.state.displayFund}</h1>
                <span id="dateLastUpdates">as of {this.state.date}</span>
                <FundHeader handler={this.changeSortBy} sortBy={this.state.sortBy} displayFund={this.state.displayFund} ></FundHeader>
              </div>
              <Fund holdings={this.state.fundHoldings} displayFund={this.state.displayFund} sortBy={this.state.sortBy}/>
          </Col>
          <Col sm={1}></Col>
        </Row>
      </Container>
    </div>    
    )
  }
}

export default App;
