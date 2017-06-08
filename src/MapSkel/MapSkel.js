import React, { Component } from 'react';
import { SelectField, MenuItem } from 'material-ui';
import _ from 'underscore';

import MapActions from './Actions/MapActions.js';
import MapStore from './Stores/MapStore.js';

import { getTheme } from '../Theme/Theme.js';
import ConnectionMap from '../Map/ConnectionMap.js';
import './MapSkel.css';

const childContextTypes = {
	muiTheme: React.PropTypes.object,
};

class MapSkel extends Component {
	constructor() {
		super();

		this.state = {
			routeList: {},
			routeConfig: {},
			vehicleLocations: {},
			selectedRoute: null,
		};

		[
			'onStatusChange',
			'_editSelectedRoute',
		].forEach(fn => {this[fn] = this[fn].bind(this);});
	}

	getChildContext() {
		return { muiTheme: getTheme() };
	}

	componentWillMount() {		
		MapActions.GetRouteList();
		MapActions.GetRouteConfig();
	}

	componentDidMount() {
		this.unsubscribe = MapStore.listen(this.onStatusChange);
	}

	onStatusChange(status) {
		this.setState({
			routeList: status.routeList,
			routeConfig: status.routeConfig,
			vehicleLocations: status.vehicleLocations,
		});
	}

	_editSelectedRoute(e, index, value) {
		this.setState({ selectedRoute: value });
		MapActions.GetVehicleLocations(value);
	}

	render() {
		const { selectedRoute, routeList, routeConfig, vehicleLocations } = this.state;

		const routeListRoute = !routeList.route ? [] : routeList.route;
		const routeSelectedValue = !selectedRoute && routeListRoute.length > 0 ? routeListRoute[0].tag : selectedRoute;

		let routeMapConfig = {};
		if (routeSelectedValue) {
			routeMapConfig = _.findWhere(routeConfig.route, { tag: routeSelectedValue });
		}

		return (
			<div id="mainContent">				
				<div className="mdl-grid">
					<div className="mdl-cell mdl-cell-1-col">
						<SelectField
							type="text"
							id="selectRoute"
							floatingLabelText="Select Route"
							value={routeSelectedValue}
							onChange={(e, index, value) => this._editSelectedRoute(e, index, value)}
							style={{ marginLeft: '20px' }}
						>
							{
								routeListRoute.map((route, i) =>
									<MenuItem key={i} value={route.tag} primaryText={route.title} />
								)
							}
						</SelectField>
					</div>
					{ Object.keys(routeConfig).length > 0 && Object.keys(vehicleLocations).length > 0 && (
						<div className="mdl-cell mdl-cell-11-col">
							<ConnectionMap 
								mapId="connectionMap"
								routeConfig={routeMapConfig}
								vehicleLocations={vehicleLocations}
							/>
						</div>
					)}					
				</div>
			</div>
		);
	}
}

MapSkel.childContextTypes = childContextTypes;

export default MapSkel;
