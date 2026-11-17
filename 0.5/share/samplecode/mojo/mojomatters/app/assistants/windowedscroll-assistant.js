WindowedscrollAssistant = Class.create({
	initialize: function(){
	},

	setup: function() {
		this.controller.setupWidget('map_scroller', {mode: 'free'});
		this.controller.setupWidget('map_pager', {}, this);
	},
	
	getDimensions: function() {
		return {width: 1440, height: 1102};
	},
	
	scrollTo: function(left, top) {
		$('map_positioner').setStyle({left: -left + 'px', top: -top + 'px'})
	}
});
