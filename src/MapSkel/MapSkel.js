import React, { Component } from 'react';
import { SelectField, MenuItem } from 'material-ui';
import injectTapEventPlugin from 'react-tap-event-plugin';

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
		injectTapEventPlugin();
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
	}

	render() {
		const { selectedRoute, routeList, routeConfig, vehicleLocations } = this.state;

		const routeListRoute = !routeList.route ? [] : routeList.route;
		const routeSelectedValue = !selectedRoute && routeListRoute.length > 0 ? routeListRoute[0].title : selectedRoute;		

		return (
			<div id="mainContent">				
				<div className="mdl-grid">
					<div className="mdl-cell mdl-cell-2-col">
						<SelectField
							type="text"
							id="selectRoute"
							floatingLabelText="Select Route"
							value={routeSelectedValue}
							onChange={(e, index, value) => this._editSelectedRoute(e, index, value)}
						>
							{
								routeListRoute.map((route, i) =>
									<MenuItem key={i} value={route.title} primaryText={route.title} />
								)
							}
						</SelectField>
					</div>
					<div className="mdl-cell mdl-cell-10-col">
						<ConnectionMap 
							mapId="connectionMap"
							routeConfig={routeConfig}
							vehicleLocations={vehicleLocations}
							selectedRoute={selectedRoute}
						/>
					</div>
				</div>
			</div>
		);
	}
}

MapSkel.childContextTypes = childContextTypes;

export default MapSkel;
