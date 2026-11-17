enyo.kind({
	name: "system.MediaIndexer",
	kind: HeaderView,   
	components: [
		
		// Container for our buttons
		{ kind: "HFlexBox", components: [
			{ kind: "Button", flex: 1, name: "albumsButton", caption: "Albums", onclick: "getAlbums" },
			{ kind: "Button", flex: 1, name: "artistsButton", caption: "Artists", onclick: "getArtists" },
			{ kind: "Button", flex: 1, name: "audioFilesButton", caption: "Audio Files", onclick: "getAudioFiles" },
			{ kind: "Button", flex: 1, name: "genresButton", caption: "Genres", onclick: "getGenres" },
			{ kind: "Button", flex: 1, name: "videoFilesButton", caption: "Video Files", onclick: "getVideoFiles" },
			{ kind: "Button", flex: 1, name: "wallpapersButton", caption: "Wallpapers", onclick: "getWallpapers" }
		]},
		
		// List area. This is where our files will be populated on the screen
		{kind: "VirtualList", name: "list", flex: 2, onSetupRow: "listSetupRow", components: [
			{kind: "Divider", style: "text-transform: capitalize;"},
	        {kind: "Item", layoutKind: "HFlexLayout", components: [
	            {name: "caption", flex: 1, onclick: "itemClick"}
	        ]}
	    ]},
	    
	    // Item data area. When we tap a file, our media query data for that file will appear here
	    {kind: "Divider", name: "header", showing: false, style: "text-transform: capitalize;"},
	    {kind: "Scroller", flex: 1, components: [
	    	{name: "myContent", style: "padding: 0px 8px;"}
	    ]},
		
	    // This service is used to check to find out if our app has existing permissions to access device media
		{
			kind: "PalmService",
			name: "checkPermission",
			service: "palm://com.palm.db/",
			method: "find",
			onSuccess: "checkPermissionSuccess",
			onFailure: "checkPermissionFail"
			
		},
		
		// This service is used to request permission to access device media
		{
			kind: "PalmService",
			name: "requestPermission",
			service: "palm://com.palm.mediapermissions/",
			method: "request",
			onResponse: "mediaAccessResponse"
		},
		
		// This service is used to access device media
		{ 
			name: "queryMedia", 
			kind: "DbService",
			method: "find",
			onSuccess: "querySuccess", 
			onFailure: "queryFailure"
		 }
		
	], 
	// End Components
	
	create: function() {
		this.inherited(arguments);
		this.data = [];
		
		// Set up our media kinds, queries, and titles
		this.albumsData = {
			kind: "com.palm.media.audio.album:1",
			query: { select: ["name", "artist", "total", "thumbnails"] },
			dividerCaption: "album names",
			captionData: "name"
		};
		
		this.artistsData = {
			kind: "com.palm.media.audio.artist:1",
			query: { select: ["name", "total", "thumbnails"] },
			dividerCaption: "artist names",
			captionData: "name"
		};
		
		this.audioFilesData = {
			kind: "com.palm.media.audio.file:1",
			query: { select: ["path", "title", "size", "duration"] },
			dividerCaption: "audio files",
			captionData: "path"
		};
		
		this.genresData = {
			kind: "com.palm.media.audio.genre:1",
			query: { select: ["name", "total"] },
			dividerCaption: "genres",
			captionData: "name"
		};
		
		this.videosData = {
			kind: "com.palm.media.video.file:1",
			query: { select: ["path", "title", "size", "duration", "description"] },
			dividerCaption: "video files",
			captionData: "path"
		};
		
		this.imageData = {
			kind: "com.palm.media.image.file:1",
			query: {
				select: ["albumPath", "path", "appGridThumbnail"],
				// we just want files in our wallpaper folder, nothing else
				where:[{"prop":"albumPath", "op":"=", "val":"/media/internal/wallpapers"}]
			},
			dividerCaption: "wallpapers",
			captionData: "path"
		};
	},
	
	getAlbums: function (inSender, inEvent) {
		this.checkPermission( this.albumsData );
	},
	getArtists: function (inSender, inEvent) {
		this.checkPermission( this.artistsData );
	},
	getAudioFiles: function (inSender, inEvent) {
		this.checkPermission( this.audioFilesData );
	},
	getGenres: function (inSender, inEvent) {
		this.checkPermission( this.genresData );
	},
	getVideoFiles: function (inSender, inEvent) {
   		this.checkPermission( this.videosData );
	},
	getWallpapers: function (inSender, inEvent) {
   		this.checkPermission( this.imageData );
	},
	
	// Check existing permissions for this media kind
	checkPermission: function(mediaType) {
		this.mediaType = mediaType;
		
		this.$.checkPermission.call({
			query: {
				from: mediaType.kind,
				limit: 1
			}
		});
	},
	checkPermissionSuccess: function(inSender, inResponse, inRequest) {
		// We have permission to access media ... fetch it
		this.queryMedia();
	},
	checkPermissionFail: function(inSender, inResponse) {
		// We don't have permission to access media, so we must ask the user for access
		this.requestPermission( this.mediaType );
	},
	
	// Ask the user if we may access their media
	requestPermission: function(mediaType) {
		
		this.$.requestPermission.call({
			rights: {
				read: [mediaType.kind]
			}
		});
	},
	
	mediaAccessResponse: function(inSender, inResponse, inRequest) {
		
		if (inResponse.returnValue && inResponse.isAllowed) {
			// Things look good. User gave us permission to access their media, so let's make our query
    		this.queryMedia();
		} else {
			// User denied us access
    		this.$.myContent.setContent( "mediaAccessResponse: " + JSON.stringify(inResponse) );
		}
	},
	
	// Execute our media query
	queryMedia: function() {
		
		// Notice that 'from' is not needed in the query since 'dbKind' is in the component
		this.$.queryMedia.call({
		    query: this.mediaType.query
		},{
			dbKind: this.mediaType.kind
		});
		
	},
	querySuccess: function (inSender, inResponse, inRequest) {
    	
    	var results = inResponse.results;
    	var len = results.length;
		this.data = [];
    	
    	// If media results are found
    	if (len) {
	    	for (var i=0; i<len; i++) {
	    		this.data[i] = { mediaCaption: results[i][this.mediaType.captionData], mediaData: results[i]};
	    	}
	    	this.$.header.setCaption("Item Object Data");
    		this.$.myContent.setContent( "Tap an item above to display the item data returned from our query.");
    	} else {
    		// No media files for this type were found
    		this.$.header.setCaption("Alert");
    		this.$.myContent.setContent( "No " + this.mediaType.dividerCaption + " found!");
    	}
    	
    	this.$.header.show();
    	
   		// flush and reset the list to show our new data
    	this.$.list.punt();
	},
	queryFailure: function(inSender, inResponse) {
		// Our data query failed
    	this.$.myContent.setContent( "queryFailure: " + JSON.stringify(inResponse) );
	},
	
	// Show data for our selected media object
	itemClick: function (inSender, inEvent) {
		this.$.myContent.setContent( JSON.stringify(this.data[inEvent.rowIndex].mediaData) );
	},
	
	setupDivider: function(inIndex) {
		// If we're at the top of the list, generate/show the proper caption
		if (!inIndex) {
			this.$.divider.setCaption( this.mediaType.dividerCaption );
			this.$.divider.canGenerate = true;
		} else {
			this.$.divider.canGenerate = false;
		}
	},
	
	listSetupRow: function(inSender, inIndex) {
		
	    var item = this.data[inIndex];
		if (item) {
			this.setupDivider(inIndex);
			this.$.caption.setContent( this.data[inIndex].mediaCaption );
			return true;
		}
	}
});
