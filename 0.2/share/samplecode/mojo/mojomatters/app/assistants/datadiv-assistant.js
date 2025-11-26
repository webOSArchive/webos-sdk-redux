DatadivAssistant = Class.create({
	
	setup: function() {
		this.atts = {
			template: 'datadiv/item'
		};
		this.model = {};
		this.model.value ="123";
		this.controller.setupWidget('datadiv', this.atts, this.model);
		this.controller.listen('datadiv', Mojo.Event.tap, this.tapped.bind(this, this.controller.get('datadiv')));
	},

	activate: function() {
		if (ActivityAssistant.spinning) {
			$(this.spinner).mojo.start();
		}
		
	},                                                                 
	
	tapped: function(target, event) {
		Mojo.Log.info("DATA " + Object.toJSON(target.mojo.model));
		target.mojo.model = {
			value:  {
					'value': '#{contact2222}',
					'serviceName': '#{accountDomain222}',
					'contactDisplay': '#{contact222}',
					'type': 'IM222',
					'username': '#{username222}'
					}
		};
		Mojo.Log.info("DATA " + Object.toJSON(target.mojo.model));
	},


});