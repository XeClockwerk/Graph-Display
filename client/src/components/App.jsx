import React, { Component } from 'react';
import Graph from './Graph.jsx';
import Line from './Line.jsx';
import Price from './Price.jsx';
import $ from 'jquery';


class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      graphData: [],
      path: '',
      line: false,
      closest: {x: null, price: null, y: null, date: null},
      date: 'APR 6, 2018',
      currentCompany:null,
      currentPrice: null,
      closing: null,
    }
    this.createPath = this.createPath.bind(this);
    this.getGraphData = this.getGraphData.bind(this);
    this.getCompanyData = this.getCompanyData.bind(this);
    this.formatPrice = this.formatPrice.bind(this);
  }

  formatPrice(int){
    var str = int.toString();
    let index = str.indexOf('.');
    if(index !== str.length - 3){
        if (index === -1) {
          return `$${str}.00`;
        } else {
          return `$${str}0`;
        }
    }
    return `$${str}`;
  }
  
  createPath() {
    let path = `M${this.state.graphData[0].x},${this.state.graphData[0].y}`;
    for (let i = 1; i < this.state.graphData.length; i++) {
      path+=`L${this.state.graphData[i].x},${this.state.graphData[i].y}`
    }
    this.setState({
      path: path
    })
  }

  onMouseMove(e) {
    const closest = {x: null, price: null, y: null, date: null}
    this.setState({x: e.clientX}, () => {
        this.setState({closest:closest}, () => {
          if(this.state.closest.x - document.getElementById('date').offsetWidth / 2 >= 0){
            document.getElementById('date').style.left = this.state.closest.x - document.getElementById('date').offsetWidth / 2 + 'px';
          }
        })
    })
    this.state.graphData.map(coords => {
      if (!closest.x || 0 <= e.clientX - closest.x < e.clientX - coords.x) {
        closest.x = coords.x;
        closest.y = coords.y;
        closest.price = coords.price;
        closest.date = coords.date;
      }
    });
  }

  getGraphData(timeframe) {
    const tempArr = []
    let x = 0;
    $.get(`http://127.0.0.1:3000/prices/${this.state.currentCompany}/monthly`, (results) => {
      this.setState({closing: results[0].price})
      results.forEach((datapoint) => {
        tempArr.push({x:x, price:datapoint.price, y:datapoint.price, date:datapoint['DATE_FORMAT(price_date, "%b %e %Y")']})
        x += 20
      })
      this.setState({graphData: tempArr}, () => {
        this.createPath();
      });
    });
  }

  getCompanyData(company) {
    $.get(`http://127.0.0.1:3000/companies/company?company=${company}`, (results) => {
      this.setState({currentCompany:results[0]},() => {
        this.setState({currentPrice:this.state.currentCompany.last_closing_price});
      });
    });
  }

  componentDidMount() {
    this.getGraphData('monthly');
    this.getCompanyData('animi');
  }

  render() {
    return (
      <div className = 'mainGraphContainer'>
        <Price currentPrice={this.state.line ? this.state.closest.price : this.state.currentPrice} closingPrice={this.state.currentClosing}/>
        <div id='date'>{this.state.line ? this.state.closest.date : null}</div>
        <svg onMouseMove = {this.onMouseMove.bind(this)} onMouseEnter = { () => this.setState({ line: true })} onMouseLeave= { () => this.setState({ line: false })} width={699} height={260} className='graphSVG'>
            <Graph class='mainGraph' data = {this.state.graphData} path={this.state.path}/>
            <Line closest={this.state.closest} show={this.state.line} />
        </svg>
      </div>
    );
  }
}

export default App;
