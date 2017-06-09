import React, { Component } from 'react';
import * as d3 from 'd3';
import './Map.css';
import $ from 'jquery';
import _ from 'underscore';

const propTypes = {
	mapId: React.PropTypes.string,
	routeConfig: React.PropTypes.array,
	vehicleLocations: React.PropTypes.object,
};

class ConnectionMap extends Component {
	constructor(props) {
		super(props);

		this.state = {};

		this.mapProps = {};

		[
			'_initMap',
			'_getMapConfigs',
			'_createBounds',
			'_applyRouteConfig',
			'_cleanMap',
			'_createMapRoute',
			'_createMapStops',
			'_createTranslateRouteVehicles',
		].forEach(fn => {this[fn] = this[fn].bind(this);});
	}

	componentDidMount() {	
		this._initMap(() => {
			this._applyRouteConfig();
		});		
	}

	componentDidUpdate() {		
		this._applyRouteConfig();
	}

	_cleanMap(mapPropsData) {
		const { routeConfig } = this.props;
		if (mapPropsData.currentRoutes) {
			_.each(mapPropsData.currentRoutes, (currentRoute) => currentRoute.remove());
		}

		if (mapPropsData.currentStops) {
			_.each(mapPropsData.currentStops, (currentStop) => currentStop.remove())
		}		

		if (mapPropsData.currentVehicles) {
			const routeTags = _.pluck(routeConfig, 'tag');
			const vehicleTags = _.pluck(mapPropsData.currentVehicles, 'routeTag');
			
			const diffTags = _.difference(vehicleTags, routeTags);

			_.each(diffTags, (diffTag) => {
				const routeVehicle = _.findWhere(mapPropsData.currentVehicles, { routeTag: diffTag });
				if (routeVehicle) {
					routeVehicle.currentRouteVehicles.remove();
				}
			});	
		}
	}

	_createMapRoute(currentRoute, routePath, color, lineFn) {
		currentRoute.selectAll('path')
			.data(routePath)
			.enter()
			.append('path')
			.attr('d', (pathData) => {
				return lineFn(pathData.point);
			})
			.attr('stroke-width', 1.5)			
			.attr('stroke', `#${color}`)
			.attr('fill', `#${color}`)
			.attr('fill-opacity', 0);
	}

	_createMapStops(currentRouteStops, stops, projection) {
		currentRouteStops.selectAll('rect')
			.data(stops)
			.enter()
			.append('rect')
			.attr('fill', '#4040a1')
			.attr('width', 5)
			.attr('height', 5)
			.attr('x', (stopData) => {
				return projection([stopData.lon, stopData.lat])[0];
			})
			.attr('y', (stopData) => {
				return projection([stopData.lon, stopData.lat])[1];
			});
	}

	// Source: https://stackoverflow.com/questions/9518186/manipulate-elements-by-binding-new-data
	// Need to repeat the various steps so d3 can manipulate the data correctly
	_createTranslateRouteVehicles(currentRouteVehicles, routeTagVehicles, projection) {		
		// Source: https://stackoverflow.com/questions/15015752/make-sure-d3-data-element-matches-id
		const routeVehicles = currentRouteVehicles.selectAll('image')			
			.data(routeTagVehicles, (vehicle) => {
				return vehicle.id;
			});
		
		routeVehicles.enter()
			.append('image')
			.attr('xlink:href', '/images/BusTrain.png')
			.attr('width', 20)
			.attr('height', 20)
			.attr('x', (vehiclePoint) => {
				return projection([vehiclePoint.lon, vehiclePoint.lat])[0];
			})
			.attr('y', (vehiclePoint) => {
				return projection([vehiclePoint.lon, vehiclePoint.lat])[1];
			});

		routeVehicles.transition()
			.duration(5000)
			.attr('x', (vehiclePoint) => {
				return projection([vehiclePoint.lon, vehiclePoint.lat])[0];
			})
			.attr('y', (vehiclePoint) => {
				return projection([vehiclePoint.lon, vehiclePoint.lat])[1];
			});
	}

	_applyRouteConfig() {
		const { routeConfig, vehicleLocations } = this.props;		
		const mapPropsData = this.mapProps;

		this._cleanMap(mapPropsData);		

		const currentRoutes = [];
		const currentStops = [];
		const currentVehicles = [];

		const lineFn = d3.line()
					.x((point) => {
						return mapPropsData.projection([point.lon, point.lat])[0];
					})
					.y((point) => {
						return mapPropsData.projection([point.lon, point.lat])[1];
					});
		
		
		_.each(routeConfig, (routeConf, i) => {
			const currentRoute = mapPropsData.svg.append('g').attr('id', `currentRoute${routeConf.tag}`);
			const currentRouteStops = mapPropsData.svg.append('g').attr('id', `currentRouteStops${routeConf.tag}`);
			let currentRouteVehicles;
						
			const getCurrentVehicleRoute = _.findWhere(mapPropsData.currentVehicles, { routeTag: routeConf.tag });
			if (getCurrentVehicleRoute) {
				currentRouteVehicles = getCurrentVehicleRoute.currentRouteVehicles;
			} else {
				currentRouteVehicles = mapPropsData.svg.append('g').attr('id', `currentRouteVehicles${routeConf.tag}`);	
			}

			const routeTagVehicles = !vehicleLocations[routeConf.tag] ? null: vehicleLocations[routeConf.tag].vehicle;

			this._createMapRoute(currentRoute, routeConf.path, routeConf.color, lineFn);			

			this._createMapStops(currentRouteStops, routeConf.stop, mapPropsData.projection);

			if (routeTagVehicles) {
				this._createTranslateRouteVehicles(currentRouteVehicles, routeTagVehicles, mapPropsData.projection);
			}

			currentRoutes.push(currentRoute);
			currentStops.push(currentRouteStops);
			currentVehicles.push({ routeTag: routeConf.tag, currentRouteVehicles });
		});

		mapPropsData.currentRoutes = currentRoutes;
		mapPropsData.currentStops = currentStops;
		mapPropsData.currentVehicles = currentVehicles;

		this.mapProps =  mapPropsData;
	}

	_getMapConfigs() {
		const { mapId } = this.props;
		let mapProps = {};

		const width = $(`#${mapId}`).width();
		const height = window.innerHeight-window.innerHeight/6;

		const mapDimensions = { width, height };

		const svg = d3.select(`#${mapId}`).append('svg').attr('width', width).attr('height', height);
		
		const projection = d3.geoMercator().scale(1).translate([0, 0]).precision(0);

		const geoPath = d3.geoPath().projection(projection);		

		const neighborhoods = svg.append('g').attr('id', 'neighborhoods');
		const arteries = svg.append('g').attr('id', 'arteries');
		const freeways = svg.append('g').attr('id', 'freeways');
		const streets = svg.append('g').attr('id', 'streets');

		mapProps = {
			mapDimensions,
			svg,
			projection,
			geoPath,
			neighborhoods,
			arteries,
			freeways,
			streets,
		};

		return mapProps;
	}

	_createBounds(mapProps, data) {
		const bounds = mapProps.geoPath.bounds(data);
		
		const width = mapProps.mapDimensions.width;
		const height = mapProps.mapDimensions.height;

		// Source: http://bl.ocks.org/clhenrick/11183924
		// Calculate bounds and obtain scale and translate for projection
		const scale = .95 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);
        const translate = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2, (height - scale * (bounds[1][1] + bounds[0][1])) / 2];
		
		mapProps.projection.scale(scale).translate(translate);
	}

	_initMap(callback) {
		const mapProps = this._getMapConfigs();
		this.mapProps = mapProps;

		d3.json('/internal/GeoMap/neighborhoods.json', (err, data) => {
			this._createBounds(mapProps, data);

			mapProps.neighborhoods.selectAll('path')
				.data(data.features)
				.enter()
				.append('path')
				.attr('d', mapProps.geoPath)
				.attr('fill', '#EDEDED')
				.attr('stroke', '#555555')
				.attr('stroke-width', 1);	

			d3.json('/internal/GeoMap/arteries.json', (err, data) => {
				mapProps.arteries.selectAll('path')
					.data(data.features)
					.enter()
					.append('path')
					.attr('d', mapProps.geoPath)
					.attr('fill', '#f2f2f2')
					.attr('stroke', '#f2f2f2')
					.attr('stroke-width', 2);

				d3.json('/internal/GeoMap/freeways.json', (err, data) => {
					mapProps.freeways.selectAll('path')
						.data(data.features)
						.enter()
						.append('path')
						.attr('d', mapProps.geoPath)
						.attr('fill', '#e6e6e6')
						.attr('stroke', '#e6e6e6')
						.attr('stroke-width', 3);

					d3.json('/internal/GeoMap/streets.json', (err, data) => {
						mapProps.streets.selectAll('path')
							.data(data.features)
							.enter()
							.append('path')
							.attr('d', mapProps.geoPath)
							.attr('fill', '#a6a6a6')
							.attr('stroke', '#a6a6a6')
							.attr('stroke-width', 2);

						return callback();							
					});
				});
			});
		});		
	}

	render() {
		const { mapId } = this.props;
		return (
			<div id={mapId} className="mapContent" />
		);
	}
}

ConnectionMap.propTypes = propTypes;

export default ConnectionMap;
