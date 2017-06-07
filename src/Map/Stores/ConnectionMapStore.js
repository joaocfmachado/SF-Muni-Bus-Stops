import Reflux from 'reflux';
import ConnectionMapActions from '../Actions/ConnectionMapActions.js';
import $ from 'jquery';

export default Reflux.createStore({
	listenables: [ConnectionMapActions],

	init() {
		this.store = {
            routeList: [],
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
					return callback(response);
				}
			},
			error(xhr, status, errorThrown) {
				/* const errorMessage = 'Sorry, there was a problem when trying to get datasource!';
				sendNotifications(errorMessage, 'error', null);
				that.trigger({ serverResponse: that.serverResponse }); */
			},
		});
	},
});
