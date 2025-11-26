function VideoPlayerAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

VideoPlayerAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Luna.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	this.buttonModel1 = {
		buttonLabel : 'Open video app',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt1 = {
		type : Mojo.Widget.activityButton
	}
	this.buttonModel2 = {
		buttonLabel : 'Open video scene',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt2 = {
		type : Mojo.Widget.activityButton
	}
	this.buttonModel3 = {
		buttonLabel : 'Launch video app',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt3 = {
		type : Mojo.Widget.activityButton
	}
	this.buttonModel4 = {
		buttonLabel : 'Embedded video',
		buttonClass : '',
		disable : false
	}
	this.buttonAtt4 = {}

	this.controller.setupWidget('OpenVideoButton',this.buttonAtt1,this.buttonModel1)
	this.controller.setupWidget('OpenSceneButton',this.buttonAtt2,this.buttonModel2)
	this.controller.setupWidget('LaunchVideoButton',this.buttonAtt3,this.buttonModel3)
	this.controller.setupWidget('EmbeddedButton',this.buttonAtt4,this.buttonModel4)
	
}
	


VideoPlayerAssistant.prototype.handleButton4Pressed = function(event) {
	this.controller.stageController.pushScene("embedded","embedded")

}
VideoPlayerAssistant.prototype.handleButtonPressed = function(event) {
	this.controller.serviceRequest(	'palm://com.palm.applicationManager',
	{
		method: 'open',
		parameters: {
			title : "First Use", 
			target : Mojo.appPath + "video/HaveFun.mp4",
		},
		onSuccess: function(status){
            this.controller.get('area-to-update').update(Object.toJSON(status));
        }.bind(this),
        onFailure: function(status){
        	this.controller.get('area-to-update').update(Object.toJSON(status));							
        }.bind(this),
		onComplete: function(){
			this.getButton = this.controller.get('LaunchVideoButton');
			this.getButton.mojo.deactivate();
		}.bind(this)
	});
}
VideoPlayerAssistant.prototype.handleButton2Pressed = function(event) {
	var args = {
		appId: "com.palm.app.videoplayer",
		name: "nowplaying"
    }
    var params = {};
    params.target =  Mojo.appPath + "video/HaveFun.mp4",
    params.title = "some title";
    params.initialPos = 0;
    params.thumbUrl = "images/generic-thumb-video.png";
    params.videoID = undefined;
    this.controller.stageController.pushScene(args, params);
}
VideoPlayerAssistant.prototype.handleButton3Pressed = function(event) {
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
		method:'launch', 
		parameters: {
			id : 'com.palm.app.videoplayer',
			params: {
				target :  Mojo.appPath + "video/HaveFun.mp4",
				videoTitle : "Video Title"
			}
		},
		onSuccess: function(status){
            this.controller.get('area-to-update').update(Object.toJSON(status));
        }.bind(this),
        onFailure: function(status){
        	this.controller.get('area-to-update').update(Object.toJSON(status));							
        }.bind(this),
		onComplete: function(){
			this.getButton = this.controller.get('EmbeddedButton');
			this.getButton.mojo.deactivate();
		}.bind(this)
	});
}
VideoPlayerAssistant.prototype.activate = function(event) {
	Mojo.Event.listen(this.controller.get('OpenVideoButton'),Mojo.Event.tap, this.handleButtonPressed.bind(this));
	Mojo.Event.listen(this.controller.get('OpenSceneButton'),Mojo.Event.tap, this.handleButton2Pressed.bind(this));
	Mojo.Event.listen(this.controller.get('LaunchVideoButton'),Mojo.Event.tap, this.handleButton3Pressed.bind(this));
	Mojo.Event.listen(this.controller.get('EmbeddedButton'),Mojo.Event.tap, this.handleButton4Pressed.bind(this));
}


VideoPlayerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	this.controller.stopListening(this.controller.get('OpenVideoButton'),Mojo.Event.tap, this.handleButtonPressed.bind(this));
	this.controller.stopListening(this.controller.get('OpenSceneButton'),Mojo.Event.tap, this.handleButton2Pressed.bind(this));
	this.controller.stopListening(this.controller.get('LaunchVideoButton'),Mojo.Event.tap, this.handleButton3Pressed.bind(this));
	this.controller.stopListening(this.controller.get('EmbeddedButton'),Mojo.Event.tap, this.handleButton3Pressed.bind(this));

	  this.getButton = this.controller.get('OpenSceneButton');
			this.getButton.mojo.deactivate();
}

VideoPlayerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
