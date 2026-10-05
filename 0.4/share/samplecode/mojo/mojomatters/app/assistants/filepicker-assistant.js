/*
	The file picker can take in a wide array of parameter combinations to tweak its behavior. Here you'll see many of them in action
*/


FilepickerAssistant = Class.create( FLibExample, {
    initialize: function(){
    },
    
    setup: function(){
		this.setupMenus({
			header: 'File Pickers'
		});
		
		// Bind response handler once, ahead of time
        this.tapHandler = this.handleTap.bind(this);

		// Store references for later, reducing the number of calls made to controller.get()
		this.selectionDiv = this.controller.get('selection');

		// Listen for taps on the whole scene, we'll figure out where they came from later
        this.controller.sceneElement.observe(Mojo.Event.tap, this.tapHandler);

    },
    
    params: {
        // No param, standard
        any: {},
        // fileonly
        fileonly: {
            kinds: ['file']			// pseudo-item type
        },
        // imageonly
        attachimage: {
            actionType: 'attach', 	// Shows an 'attach' icon
            kinds: ['image']		// pseudo-item type
        },
        // imageonly + crop
        attachimagecrop: {
            actionType: 'attach',
            kinds: ['image'],
		    crop: 					// Will crop the image to the specified size before passing it back
		    {
		    	width: 150,
				height: 150
		    }
        },
        // audio and video
        audioandvideo: {
            kinds: ['audio', 'video']
        },
        // audio and video
        audioandvideodefaultvideo: {
            kinds: ['audio', 'video'],
            defaultKind: 'video'
        },
		 // ringtones
        ringtone: {
            kinds: ['ringtone'],
            defaultKind: 'ringtone',
			// this file will be set as currently selected with a check mark
			filePath: '/media/internal/ringtones/some_file.mp3'
        },
        // all default image
        selectanydefaultimage: {
            actionName: 'Select',
            defaultKind: 'image'
        }
    },
    
    pickAny: function(){
        // Demo code
        var params = {
            onValidate: function(file){
                if (file.fullPath.search(/bad/i) != -1) {
                    alert( $L('File not accepted') );
                    return false;
                }
                return true;
            }.bind(this),
            onSelect: function(file){
                this.selectionDiv.innerHTML = Object.toJSON(file);
            }.bind(this),
            onCancel: function(){
                this.selectionDiv.innerHTML = $L('no file selected');
            }.bind(this)
        };
        Mojo.FilePicker.pickFile(params);
    },
    
    simplest: function(){
        // Demo
        var params = {
            onSelect: function(file){
                this.selectionDiv.innerHTML = Object.toJSON(file);
            }
        }.bind(this);
        Mojo.FilePicker.pickFile(params);
    },
    
    handleTap: function(event){
        var targetRow = $(event.target);
        if (!targetRow.hasClassName('row')) {
            targetRow = $(event.target).up('div.row');
        }
        if (targetRow) {
            var matches = targetRow.id.match(/(.*)_example/) || targetRow.id.match(/line_(.*)/);
            var paramName = matches[1];
            if (paramName) {
                Mojo.log(paramName);
            }
            
            var params = this.params[paramName];
            
            params.onValidate = function(file){
                if (file.fullPath.search(/bad/i) != -1) {
                    alert( $L('File not accepted') );
                    return false;
                }
                return true;
            }.bind(this);
            
            params.onSelect = function(file){
                this.selectionDiv.innerHTML = Object.toJSON(file);
            }.bind(this);
            
            params.onCancel = function(){
                this.selectionDiv.innerHTML = $L('no file selected');
            }.bind(this);
            
            Mojo.FilePicker.pickFile(params, this.controller.stageController);
        }
    }
});


FilepickerAssistant.prototype.params.anymock = {
   _mockData: [{
        name: "dogjumping.jpg",
        size: 60 * 1024,
        date: 1022054000,
        type: "image.jpg"
    }, {
        name: "bejumpschool.xls",
        size: 2 * 1024,
        date: 1012054000,
        type: "document.xls"
    }, {
        name: "stopbarking.doc",
        size: 2 * 1024 * 1024,
        date: 1002054000,
        type: "document.doc"
    }, {
        name: "dancingdays.mp3",
        size: 10 * 1024,
        date: 1012084000,
        type: "audio.mp3"
    }, {
        name: "quicknote.txt",
        size: 10 * 1024,
        date: 1012064000,
        type: "document.txt"
    }, {
        name: "doggiedemos.ppt",
        size: 4.6 * 1024 * 1024,
        date: 1012084000,
        type: "document.ppt"
    }, {
        name: "4dogs2cats.mov",
        size: 20 * 1024 * 1024,
        date: 1012084000,
        type: "video.mov"
    }, {
        name: "howto.pdf",
        size: 10 * 1024,
        date: 1012904005,
        type: "docuemnt.pdf"
    }, {
        name: "bad.dummy",
        size: 20 * 1024,
        date: 1012084005,
        type: "other.dummy"
    }, {
        name: "ok.dummy",
        size: 20 * 1024,
        date: 1012084005,
        type: "other.dummy"
    }, {
        name: "1 B size.test",
        size: 1,
        date: 1012084005,
        type: "other.test"
    }, {
        name: "11 B size.test",
        size: 11,
        date: 1012084005,
        type: "other.test"
    }, {
        name: "111 B size.test",
        size: 111,
        date: 1012084005,
        type: "other.test"
    }, {
        name: "999 B size.test",
        size: 999,
        date: 1012084005,
        type: "other.test"
    }, {
        name: "1000 B size.test",
        size: 1000,
        date: 1012084005,
        type: "other.test"
    }, {
        name: "1023 B size.test",
        size: 1023,
        date: 1012084005,
        type: "other.test"
    }, {
        name: "1 KB size.test",
        size: 1024, // 1KB
        date: 1012084005,
        type: "other.test"
    }, {
        name: "1 MB size.test",
        size: 1024 * 1024, // 1 MB
        date: 1012084005,
        type: "other.test"
    }, {
        name: "1 GB size.test",
        size: 1024 * 1024 * 1024, // 1 GB
        date: 1012084005,
        type: "other.test"
    }, {
        name: "1 TB size.test",
        size: 1024 * 1024 * 1024 * 1024, // 1 TB
        date: 1012084005,
        type: "other.test"
    }, {
        name: "1 PB size.test",
        size: 1024 * 1024 * 1024 * 1024 * 1024, // 1 peta byte!
        date: 1012084005,
        type: "other.test"
    }, {
        name: "long name with a short extension.doc",
        size: 1024 * 1024, // 1 MB
        date: 1012084005,
        type: "other.test"
    }, {
        name: "very long name without extension",
        size: 1024 * 1024, // 1 MB
        date: 1012084005,
        type: "other.test"
    }, {
        name: "long name with a long extension.very long name with a long extension",
        size: 1024 * 1024, // 1 MB
        date: 1012084005,
        type: "other.test"
    }, {
        name: "test.short name with a long extension",
        size: 1024 * 1024, // 1 MB
        date: 1012084005,
        type: "other.test"
    }, {
        name: ".no name with a long extension",
        size: 1024 * 1024, // 1 MB
        date: 1012084005,
        type: "other.test"
    }, {
        name: "dummy.dummy.dummy",
        size: 1024 * 1024, // 1 MB
        date: 1012084005,
        type: "other.test"
	}]
};