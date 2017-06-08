import Reflux from 'reflux';
import MapActions from '../Actions/MapActions.js';
import $ from 'jquery';

export default Reflux.createStore({
	listenables: [MapActions],

	init() {
		this.store = {
            routeList: {},
            routeConfig: {},
			vehicleLocations: {},
        };

        this.agencyTag = 'sf-muni';
        this.baseUrl = 'http://webservices.nextbus.com/service/publicJSONFeed';
	},

	GetRouteList(callback) {
		$.ajax({
			url: this.baseUrl,
			type: 'GET',
            data: { command: 'routeList', a: this.agencyTag },
			dataType: 'json',
            context: this,
			success(response) {
				if (response) {
					this.store.routeList = response;
					this.GetVehicleLocations(response.route[0].tag);
				}
			},
			error(xhr, status, errorThrown) {
				/* const errorMessage = 'Sorry, there was a problem when trying to get datasource!';
				sendNotifications(errorMessage, 'error', null); */
			},
		});
	},

    GetRouteConfig(callback) {
		$.ajax({
			url: this.baseUrl,
			type: 'GET',
            data: { command: 'routeConfig', a: this.agencyTag },
			dataType: 'json',
            context: this,
			success(response) {
				if (response) {
					this.store.routeConfig = response;
					this.trigger(this.store);
				}
			},
			error(xhr, status, errorThrown) {
				/* const errorMessage = 'Sorry, there was a problem when trying to get datasource!';
				sendNotifications(errorMessage, 'error', null); */				
			},
		});
	},

	GetVehicleLocations(routeTag) {
		const dateMilliseconds = new Date().getTime();
		$.ajax({
			url: this.baseUrl,
			type: 'GET',
            data: { command: 'vehicleLocations', a: this.agencyTag, r: routeTag, t: dateMilliseconds },
			dataType: 'json',
            context: this,
			success(response) {
				if (response) {
					this.store.vehicleLocations = response;
					this.trigger(this.store);
				}
			},
			error(xhr, status, errorThrown) {
				/* const errorMessage = 'Sorry, there was a problem when trying to get datasource!';
				sendNotifications(errorMessage, 'error', null); */				
			},
		});
	}
});
