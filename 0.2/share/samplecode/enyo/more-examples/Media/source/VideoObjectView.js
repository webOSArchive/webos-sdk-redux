enyo.kind({
    name: "enyo.VideoObjectView",
	kind: "HeaderView",
	title: "Inline Video",
	components:[
        {kind: "HtmlContent", name: "videoPlayer", srcId: "videoContainer"},
        
        {kind: "Divider", caption: "Screen Width"},
        {kind: "HFlexBox", components: [
        	{kind: "Button", caption: "50%", onclick: "ChangeVideoWidth"},
        	{kind: "Button", caption: "100%", onclick: "ChangeVideoWidth"}
        ]}
    ],
    rendered: function() {
    	this.video = document.getElementById('myHtml5Video');
    	this.playPause = document.getElementById('playPause');
    	var that = this;
    	
    	this.playPause.addEventListener('click', function(e) {
	        that.Play();
	    }, false);
	    
    },
    ChangeVideoWidth: function(inSender, inEvent) {
    	var widthStyle = "width:" + inSender.caption + ";";
    	this.$.videoPlayer.setStyle(widthStyle);
    },
    Play: function(inSender, inEvent) {
    	if (this.video.paused == false) {
	        this.video.pause();
	        this.SetCaption("Play");
	    } else {
	        this.video.play();
	        this.SetCaption("Pause");
	    }
    },
    Pause: function(inSender, inEvent) {
        this.video.pause();
        this.SetCaption("Play");
    },
    SetCaption: function(str) {
    	this.playPause.innerText = str;
    }
});
