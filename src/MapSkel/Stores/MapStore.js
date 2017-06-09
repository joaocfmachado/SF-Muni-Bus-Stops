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
					this.trigger(this.store);
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
		const { vehicleLocations } = this.store;
		if (routeTag) {
			const lastUpdateTime = !vehicleLocations[routeTag] ? 0 : vehicleLocations[routeTag].lastTime.time;
			$.ajax({
				url: this.baseUrl,
				type: 'GET',
				data: { command: 'vehicleLocations', a: this.agencyTag, r: routeTag, t: lastUpdateTime },
				dataType: 'json',
				context: this,
				success(response) {
					if (response) {
						if (!this.store.vehicleLocations[routeTag]) {
							this.store.vehicleLocations[routeTag] = {};
						}
						this.store.vehicleLocations[routeTag] = response;
						const newStore = {};
						Object.assign(newStore, this.store);
						this.trigger(newStore);
					}
				},
				error(xhr, status, errorThrown) {
					/* const errorMessage = 'Sorry, there was a problem when trying to get datasource!';
					sendNotifications(errorMessage, 'error', null); */				
				},
			});
		} else {
			console.log("Please specify a routeTag to obtain Vehicle Locations.");
		}
	},

	UpdateSelectedRoutes(routeTagToRemove) {
		if (routeTagToRemove) {
			delete this.store.vehicleLocations[routeTagToRemove];
			if (Object.keys(this.store.vehicleLocations).length === 0) {
				this.GetVehicleLocations('E');
			} else {
				const newStore = {}
				Object.assign(newStore, this.store);
				this.trigger(newStore);
			}
		}
	}
});
