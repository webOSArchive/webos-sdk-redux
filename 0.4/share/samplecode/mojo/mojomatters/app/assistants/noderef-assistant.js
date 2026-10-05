NoderefAssistant = Class.create({
	initialize : function() {	
	},

	setup: function() {

		this.model = {
			buttonLabel : "modify",
			buttonClass: ''
		};
		
		this.addModel = {
			buttonLabel : "add node",
			buttonClass: ''
		};

		this.removeModel = {
			buttonLabel : "remove node",
			buttonClass: ''
		};
		
		this.controller.setupWidget('button', this.attributes, this.model);
		this.controller.setupWidget('addButton', this.addAttributes, this.addModel);
		this.controller.setupWidget('removeButton', this.removeAttributes, this.removeModel);


		this.modifyHandler = this.modifyHandler.bind(this);
		this.addNodeHandler = this.addNodeHandler.bind(this);
		this.removeNodeHandler = this.removeNodeHandler.bind(this);
		
		//this.controller.listen(document, Mojo.Event.tap, this.tapped.bind(this));
		this.controller.listen('button', Mojo.Event.tap, this.modifyHandler);
		this.controller.listen('addButton', Mojo.Event.tap, this.addNodeHandler);
		this.controller.listen('removeButton', Mojo.Event.tap, this.removeNodeHandler);
		
		this.loggerNodeRef = new Mojo.NodeRef(this.controller.get('dummyLogger'));
		this.logger = this.controller.get('dummyLogger');
	},
	
	modifyHandler: function(event) {
		var i;

		Mojo.Log.info("Tappped!");
		for(i in this.loggerNodeRef) {
			Mojo.Log.info(i + " : " + typeof this.loggerNodeRef[i] );
		}
		// console.info("doc got single tapped");
		// this.model.buttonLabel = "tapped : (" + event.x + "," + event.y + ")";
		// this.controller.modelChanged(this.model);
		
		
		//test innerHTML
		Mojo.Log.info("INNER HTML IS " + this.loggerNodeRef.innerHTML);
		this.loggerNodeRef.innerHTML = "wootzors";
		Mojo.Log.info("INNER HTML IS NOW " + this.loggerNodeRef.innerHTML);
		
		
		//test insert
		this.loggerNodeRef.insert("<br /> blarg <br />",{content:'top'});
		
	},
	
	addNodeHandler: function(event) {
		Mojo.Log.info(this.loggerNodeRef.getActualNode());
		container.insert(this.logger);
		Mojo.Log.info(this.loggerNodeRef.getActualNode());
	},
	
	removeNodeHandler: function(event) {
		Mojo.Log.info(this.loggerNodeRef.getActualNode());
		this.logger.remove();
		Mojo.Log.info(this.loggerNodeRef.getActualNode());
		
	}

	
});
