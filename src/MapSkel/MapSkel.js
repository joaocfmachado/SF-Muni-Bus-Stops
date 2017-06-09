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
			selectedRoutes: [],
		};

		[
			'onStatusChange',
			'_editSelectedRoutes',
			'_getSelectedRoutes',
			'_triggerTimeoutForVehicleLocations',
		].forEach(fn => {this[fn] = this[fn].bind(this);});
	}

	getChildContext() {
		return { muiTheme: getTheme() };
	}

	componentWillMount() {		
		MapActions.GetRouteList();
		MapActions.GetRouteConfig();
		MapActions.GetVehicleLocations("E"); //Get default vehicle locations
	}

	componentDidMount() {
		this.unsubscribe = MapStore.listen(this.onStatusChange);
	}

	componentDidUpdate() {
		this._triggerTimeoutForVehicleLocations();
	}

	_triggerTimeoutForVehicleLocations() {
		const { selectedRoutes } = this.state;

		if (this.timer) {
			clearTimeout(this.timer);
		}
		
		this.timer = setTimeout(() => {
			_.each(selectedRoutes, (routeTag) => {
				MapActions.GetVehicleLocations(routeTag);
			});
		}, 15000);
	}

	onStatusChange(status) {
		this.setState({
			routeList: status.routeList,
			routeConfig: status.routeConfig,
			vehicleLocations: status.vehicleLocations,
		});
	}

	_editSelectedRoutes(e, index, values) {
		const { selectedRoutes } = this.state;

		if (values.length < selectedRoutes.length) {
			const unselectedRoute = _.difference(selectedRoutes, values);
			if (unselectedRoute.length > 0) {
				MapActions.UpdateSelectedRoutes(unselectedRoute[0]);
			}
		} else {
			MapActions.GetVehicleLocations(values[values.length-1]);
		}

		this.setState({ selectedRoutes: values });		
	}

	_getSelectedRoutes(routeSelectedValues) {
		const { routeConfig } = this.state;

		const routeMapConfig = [];
		if (routeSelectedValues) {
			_.each(routeSelectedValues, (routeSelectedValue) => {
				const routeSelected = _.findWhere(routeConfig.route, { tag: routeSelectedValue });
				if (routeSelected) {
					routeMapConfig.push(routeSelected);
				}
			});
		}

		return routeMapConfig;
	}

	render() {
		const { selectedRoutes, routeList, routeConfig, vehicleLocations } = this.state;

		const routeListRoute = !routeList.route ? [] : routeList.route;		
		const routeSelectedValues = selectedRoutes.length === 0 && routeListRoute.length > 0 ? [routeListRoute[0].tag] : selectedRoutes;

		const routeMapConfig = this._getSelectedRoutes(routeSelectedValues);

		return (
			<div id="mainContent">				
				<div className="mdl-grid">
					<div className="mdl-cell mdl-cell-1-col">
						<SelectField
							multiple={true}
							floatingLabelText="Select Routes"
							value={routeSelectedValues}
							onChange={this._editSelectedRoutes}
							style={{ marginLeft: '20px' }}
						>
							{
								routeListRoute.map((route, i) => 
									<MenuItem
										key={i}
										insetChildren={true}
										value={route.tag}
										primaryText={route.title}
										checked={routeSelectedValues && routeSelectedValues.indexOf(route.tag) > -1}
									/>
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
