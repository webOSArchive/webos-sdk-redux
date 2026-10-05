/*
	The rich text editor is pretty simple to use. There are no attributes and no model, but it is 
	nice of you to give your users the extra app menu items by passing the attribute:
		richTextEditMenu: true
	
	Simply give a div x-mojo-element="RichTextEdit" and set it up in the assistant. 
*/

RichtextAssistant = Class.create( FLibExample, {
	initialize: function() {
		// Nothing to do here
	},
	
	setup: function() {
			this.setupMenus({
				header: 'Rich Text Editor'
			});
			
			// Store references for later
			this.rte = this.controller.get('richtext-editor');
			this.textResults = this.controller.get('textResults');
			this.htmlResults = this.controller.get('htmlResults');
			
			// Bind callbacks and handlers once, ahead of time
			this.pullContent = this.pullContent.bind(this);
			
			// Adds menu items helpful in formatting rich text
			this.controller.setupWidget(Mojo.Menu.appMenu, {richTextEditMenu: true}, {});
			
			// Builds the editor
			this.controller.setupWidget('richtext-editor', {} , {});
			
			// In 2 seconds, we're going to read the rich text editor and do stuff with 
			// whatever the user has typed in
			this.pullContent.delay(2);
	},
	pullContent: function(){
		this.textResults.innerHTML = this.rte.innerText;
		this.htmlResults.innerHTML = this.rte.innerHTML;
	}

});