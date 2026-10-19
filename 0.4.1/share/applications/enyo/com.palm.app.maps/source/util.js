enyo.mapsApp = {
	myLocation: $L("Current Location"),
	dropPin: $L("Dropped Pin"),
	bingLocale: enyo.g11n.currentLocale().getLocale().replace("_","-"),
	bingScript: "http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&mkt="+this.bingLocale,
	isReservedLabel: function(inValue) {
		return inValue == this.dropPin || inValue == this.myLocation;
	},
	createLocation: function(inInfo) {
		return new Location({
			title: inInfo.title,
			addr: inInfo.address,
			city: inInfo.city,
			state: inInfo.stateOrProvince,
			latitude: inInfo.location && inInfo.location.latitude,
			longitude: inInfo.location && inInfo.location.longitude
		});
	},
	parseLocation: function(inValue) {
		var lat = inValue.substring(0, inValue.indexOf(","));
		var long = inValue.substring(inValue.indexOf(",")+1).replace(" ", "");
		if (!isNaN(Number(lat)) && !isNaN(Number(long))) {
			return {latitude: lat, longitude: long};
		}
	},
	parseLocationToCoords: function(inValue) {
		var loc = this.parseLocation(inValue);
		return [loc.latitude, loc.longitude];
	},
	processLaunchParamsTarget: function(inParams) {
		var t = inParams.target, r;
		if (t) {
			var addr;
			if (t.indexOf("mapto:") == 0) {
				r = true;
				addr = t.substring(6);
			} else if (t.indexOf("maploc:") == 0) {
				addr = t.substring(7);
			}
			if (addr) {
				// remove leading slashes
				addr = addr.replace(/^\/\//g, '');
				// url decode
				addr = decodeURIComponent(addr);
				if (r) {
					inParams.route = {endAddress: addr};
				} else {
					inParams.address = addr;
				}
			}
		}
	},
	//Returns a clean string, free of any unicode private use range characters
	//E000: <b>
	//E001: </b>
	unMicrosoftString: function(dirty){
		return dirty.replace(/[\uE000\uE001]/g, "");
	}
}
