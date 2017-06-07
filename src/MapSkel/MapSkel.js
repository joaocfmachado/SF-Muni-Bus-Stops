import React, { Component } from 'react';
import logo from '../logo/logo.svg';
import ConnectionMap from '../Map/ConnectionMap.js';
import './MapSkel.css';

class MapSkel extends Component {
	constructor() {
		super();

		this.state = {};
	}

	render() {
		return (
			<div id="mainContent">
                <div className="App">
                    <div className="App-header">
                        <img src={logo} className="App-logo" alt="logo" />
                        <h2>Code Challenge</h2>
                    </div>
                </div>
                <ConnectionMap mapId="connectionMap"/>
            </div>
		);
	}
}

export default MapSkel;
