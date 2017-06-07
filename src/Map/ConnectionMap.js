import React, { Component } from 'react';
import * as d3 from 'd3';
import './Map.css';
import $ from 'jquery';
import ConnectionMapActions from './Actions/ConnectionMapActions.js';
import ConnectionMapStore from './Stores/ConnectionMapStore.js';

const propTypes = {
	mapId: React.PropTypes.string,
};

class ConnectionMap extends Component {
	constructor() {
		super();
		this.state = {};

		[
			'_initMap',
			'_getMapConfigs',
			'_createBounds',
		].forEach(fn => {this[fn] = this[fn].bind(this);});
	}

	componentDidMount() {
		ConnectionMapActions.GetRouteList((routeList) => {
			this._initMap(routeList);
		});		
	}

	_getMapConfigs() {
		const { mapId } = this.props;
		let mapProps = {};

		const width = $(`#${mapId}`).width();
		const height = window.innerHeight;

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

		const xScale = width / Math.abs(bounds[1][0] - bounds[0][0]);
		const yScale = height / Math.abs(bounds[1][1] - bounds[0][1]);
		const scale = xScale < yScale ? xScale : yScale;

		const translate = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2, (height - scale * (bounds[1][1] + bounds[0][1])) / 2];
		
		mapProps.projection.scale(scale).translate(translate);
	}

	_initMap(routeList) {
		const that = this;
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
					.attr('fill', '#EDEDED')
					.attr('fill-opacity', '0.5')
					.attr('stroke', '#555555')
					.attr('stroke-width', 2);
				
				d3.json('/internal/GeoMap/freeways.json', (err, data) => {
					mapProps.freeways.selectAll('path')
						.data(data.features)
						.enter()
						.append('path')
						.attr('d', mapProps.geoPath)
						.attr('fill', '#EDEDED')
						.attr('stroke', '#555555')
						.attr('stroke-width', 3);

					d3.json('/internal/GeoMap/streets.json', (err, data) => {
						mapProps.streets.selectAll('path')
							.data(data.features)
							.enter()
							.append('path')
							.attr('d', mapProps.geoPath)
							.attr('fill', '#EDEDED')
							.attr('stroke', '#555555')
							.attr('stroke-width', 1);
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
