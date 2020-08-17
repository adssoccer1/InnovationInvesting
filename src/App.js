import React, {Component} from 'react';
import './App.css';
import Fund from './components/Fund.js';
import FundHeader from './components/FundHeader.js';
import Intro from './components/Intro.js';
import MainNavBar from './components/MainNavBar.js';


import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, Row, Col} from 'react-bootstrap';

class App extends Component {

  constructor(props) {
    super(props); 

    this.state = {
      date : "",
      displayFund : "ARKK",
      sortBy: "Largest Position by Weight", 
      fundHoldings: { "ARKK" : [], "ARKG" : [], "ARKF":[], "ARKW":[], "ARKQ":[], "PRINT":[], 'IZRL':[]}, 
      holdings : [],
      displayIntro : false
    }
    this.toggleDisplayIntro = this.toggleDisplayIntro.bind(this);

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
    fetch("https://arkapi2.herokuapp.com/" + fund + "/7dda18c3-9451-4262-8617-af7937100b7b")
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
  



  render() {

    const colStyle = {
      background: 'rgba(255,255,255,0.7)', /* newer browsers */
      margin: '10px', 

    }; 

    return (
    <div className="entireApp">
      <Container>
        
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
