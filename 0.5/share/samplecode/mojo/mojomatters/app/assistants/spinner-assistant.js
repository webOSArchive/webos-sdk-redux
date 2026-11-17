SpinnerAssistant = Class.create({
		setup: function() {
			this.controller.setupWidget('large-activity-spinner', this.spinnerLAttrs, this.spinnerModel);
			this.controller.setupWidget('small-activity-spinner', this.spinnerSAttrs, this.spinnerModel2);
			this.controller.setupWidget('small-activity-spinner2', this.spinnerSAttrs, this.spinnerModel2);
			this.controller.setupWidget('small-activity-spinner3', this.spinnerSAttrs, this.spinnerModel2);
			this.controller.setupWidget('small-activity-spinner4', this.spinnerSAttrs, this.spinnerModel2);
			this.controller.setupWidget('small-activity-spinner5', this.spinnerSAttrs, this.spinnerModel2);
			this.controller.setupWidget('custom-activity-spinner', this.spinnerCAttrs, this.spinnerModel);
			this.controller.get('spinner-on').observe(Mojo.Event.tap,
									this.spinOn.bind(this));
			this.controller.get('spinner-off').observe(Mojo.Event.tap,
									this.spinOff.bind(this));
			
			// Set up view menu with scene header
			this.controller.setupWidget(Mojo.Menu.viewMenu, undefined, {items: [{label: $L("Spinnerz of Doom.")}]});
			
		},



		spinOn: function() {
			this.controller.get('groups-main').show();
			this.controller.showWidgetContainer('groups-main');
			this.spinnerModel.spinning0 = true;
			this.spinnerModel2.spinning1 = true;
			this.controller.modelChanged(this.spinnerModel);
			this.controller.modelChanged(this.spinnerModel2);
		},

		spinOff: function() {
			this.controller.hideWidgetContainer('groups-main');
			this.controller.get('groups-main').hide();
			this.spinnerModel.spinning0 = false;
			this.spinnerModel2.spinning1 = false;
			this.controller.modelChanged(this.spinnerModel);
			this.controller.modelChanged(this.spinnerModel2);
		},

		spinnerLAttrs: {
			spinnerSize: Mojo.Widget.spinnerLarge,
			modelProperty: 'spinning0'
		},

		spinnerSAttrs: {
			spinnerSize: Mojo.Widget.spinnerSmall,
			property: 'spinning1'
		},

		spinnerCAttrs: {
			superClass: 'bare-sync-activity-animation',
			mainFrameCount: 11,
			finalFrameCount: 7,
			fps: 10,
			property: 'spinning0'
		},

		spinnerModel: {
			spinning0: false
		},
		
		spinnerModel2: {
			spinning1: false
		},
	});

