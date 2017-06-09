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
	constructor() {
		super();
		this.state = {
			mapProps: {},
		};

		[
			'_initMap',
			'_getMapConfigs',
			'_createBounds',
			'_applyRouteConfig',
		].forEach(fn => {this[fn] = this[fn].bind(this);});
	}

	shouldComponentUpdate(nextProps) {
		const { routeConfig, vehicleLocations } = this.props;
		if (!_.isEqual(routeConfig, nextProps.routeConfig) || !_.isEqual(vehicleLocations, nextProps.vehicleLocations)) {
			return true;
		}
		
		return false;
	}

	componentDidMount() {	
		this._initMap(() => {
			this._applyRouteConfig();
		});		
	}

	componentDidUpdate() {		
		this._applyRouteConfig();
	}

	_applyRouteConfig() {
		const that = this;
		const { routeConfig } = this.props;
		const { mapProps } = this.state;		

		if (mapProps.currentRoutes) {
			_.each(mapProps.currentRoutes, (currentRoute) => currentRoute.remove());
		}

		if (mapProps.currentStops) {
			_.each(mapProps.currentStops, (currentStop) => currentStop.remove())
		}		

		const currentRoutes = [];
		const currentStops = [];

		const lineFn = d3.line()
					.x((point) => {
						return mapProps.projection([point.lon, point.lat])[0];
					})
					.y((point) => {
						return mapProps.projection([point.lon, point.lat])[1];
					});
		
		
		_.each(routeConfig, (routeConf, i) => {
			const currentRoute = mapProps.svg.append('g').attr('id', `currentRoute${i}`);
			const currentRouteStops = mapProps.svg.append('g').attr('id', `currentRouteStops${i}`);

			currentRoute.selectAll('path')
				.data(routeConf.path)
				.enter()
				.append('path')
				.attr('d', (pathData) => {
					return lineFn(pathData.point);
				})
				.attr('stroke-width', 1.5)			
				.attr('stroke', `#${routeConf.color}`)
				.attr('fill', `#${routeConf.color}`)
				.attr('fill-opacity', 0);

			currentRouteStops.selectAll('rect')
				.data(routeConf.stop)
				.enter()
				.append('rect')
				.attr('fill', '#4040a1')
				.attr('width', 5)
				.attr('height', 5)
				.attr('x', (stopData) => {
					return mapProps.projection([stopData.lon, stopData.lat])[0];
				})
				.attr('y', (stopData) => {
					return mapProps.projection([stopData.lon, stopData.lat])[1];
				});

				currentRoutes.push(currentRoute);
				currentStops.push(currentRouteStops);
		});

		mapProps.currentRoutes = currentRoutes;
		mapProps.currentStops = currentStops;

		this.setState({ mapProps });
	}

	_createLine() {
		const { mapProps } = this.state;

		return d3.line()
			.x(function (point) {
				return mapProps.projection([point.lon, point.lat])[0];
			})
			.y(function (point) {
				return mapProps.projection([point.lon, point.lat])[1];
			});
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

		this.setState({ mapProps });
		return mapProps;
	}

	_createBounds(mapProps, data) {
		const bounds = mapProps.geoPath.bounds(data);
		
		const width = mapProps.mapDimensions.width;
		const height = mapProps.mapDimensions.height;

		const xScale = width / Math.abs(bounds[1][0] - bounds[0][0]);
		const yScale = height / Math.abs(bounds[1][1] - bounds[0][1]);
		const scale = xScale < yScale ? xScale : yScale;

		const translate = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2, (height - scale * (bounds[1][1] + bounds[0][1])) / 2];
		
		mapProps.projection.scale(scale).translate(translate);
	}

	_initMap(callback) {
		const mapProps = this._getMapConfigs();

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
					.attr('fill', 'green')
					.attr('stroke', '#555555')
					.attr('stroke-width', 2);
				d3.json('/internal/GeoMap/freeways.json', (err, data) => {
					mapProps.freeways.selectAll('path')
						.data(data.features)
						.enter()
						.append('path')
						.attr('d', mapProps.geoPath)
						.attr('fill', 'red')
						.attr('stroke', '#555555')
						.attr('stroke-width', 3);
					d3.json('/internal/GeoMap/streets.json', (err, data) => {
						mapProps.streets.selectAll('path')
							.data(data.features)
							.enter()
							.append('path')
							.attr('d', mapProps.geoPath)
							.attr('fill', 'light-gray')
							.attr('stroke', '#555555')
							.attr('stroke-width', 1);

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
