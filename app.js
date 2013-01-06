// FA.com mobile tablet version

// Main app class
enyo.kind({
	name: "FADotCom.TabletApp",
	kind: "FittableRows",
	fit: false,
	components: [
		{kind: "Image", src: "images/fadotcom-title.png", classes: "fadotcom-title"},
		{kind: "FittableColumns", classes: "fitscreen enyo-fit", components: [
			{name: "fitnav", kind: "FittableRows", classes: "fitnav",  ondragover: "dragover", ondrop: "drop", components: [
				{name: "navitems", fit: true, components: [
					{ classes: "nav-item", content: "A la une", ontap: "cmdUne"},
					{ classes: "nav-item", content: "Elite", ontap: "cmdElite"},
					{ classes: "nav-item", content: "NCAA", ontap: "cmdNCAA"},
					{ classes: "nav-item", content: "NFL", ontap: "cmdNFL"},
					{ classes: "nav-item", content: "Scores", ontap: "cmdMatchs"},
					{ classes: "nav-item", content: "Classements", ontap: "cmdClassements"}
				]},	
				{kind: "onyx.Toolbar", components: [
					{content: "", classes: "fitnav-toolbar" },
					{kind: "onyx.IconButton", src: "images/prefs.png", showing: true, classes: "prefs-button"}					
				]}
			]},
			{name: "fitlist", kind: "FittableRows", classes: "fitlist fittable-shadow", ondragover: "dragover", ondragstart: "dragstart", ondrop: "drop", components: [
				{kind: "Panels", fit: true, name: "listcontent", components: []},
				{kind: "onyx.Toolbar", components: [
					{name: "grabberlist", kind: "onyx.Grabber", ondblclick: "doubleclick"},
					{name: "spinnerlist", showing: false, kind: "Image", src: "images/spinner-dark.gif", classes: "list-spinner"},
					{name: "refresh", showing: true, kind: "onyx.IconButton", src: "images/refresh.png", classes: "refresh-button", ontap: "refreshList"}
				]}
			]},
			{name: "fitdetail", kind: "FittableRows", fit: true, classes: "fitdetail fittable-shadow", ondragover: "dragover", ondragstart: "dragstart", ondrop: "drop", components: [
				{kind: "Panels", fit: true, name: "detailcontent", components: []},
				{name: "toolbardetail", kind: "onyx.Toolbar", components: [
					{name: "grabberdetail", kind: "onyx.Grabber", ondblclick: "doubleclick"},
					{name: "spinnerdetail", showing: false, kind: "Image", src: "images/spinner-dark.gif", classes: "list-spinner"},
					{name: "backbutton", kind: "onyx.IconButton", src: "images/back.png", showing: false, classes: "back-button", ontap: "historyBack"},
					{name: "webbutton", kind: "onyx.IconButton", src: "images/web.png", showing: false, classes: "web-button", ontap: "openWebsite"},
					{name: "sendbutton", kind: "onyx.IconButton", src: "images/send.png", showing: false, classes: "send-button", ontap: "openMail"}
				]}
			]}
		]}
	],

	// Constructor
	create: function() {
		// Init
		this.inherited(arguments); 
		this.navselection = -1;
		this.toolbarweburl = null;
		this.toolbarmailurl = null;
		
		// Select first item
		this.refresh = this.cmdUne;
		this.cmdUne();
	},
	
	// Rendering, store init size
	rendered: function() {
		this.inherited(arguments);	
		this.fitnavinitsize = this.$.fitnav.hasNode().clientWidth;
		this.fitlistinitsize = this.$.fitlist.hasNode().clientWidth;
	},
	
	// View articles
	cmdUne: function() {
		this.refresh = this.cmdUne;	
		this.viewArticles("1,2,3", 0, Preferences.unemaxitems);
	},
	
	cmdElite: function() {
		this.refresh = this.cmdElite;	
		this.viewArticles("3", 1, -1);
	},
	
	cmdNCAA: function() {
		this.refresh = this.cmdNCAA;	
		this.viewArticles("2", 2, -1);
	},
	
	cmdNFL: function() {
		this.refresh = this.cmdNFL;	
		this.viewArticles("1", 3, -1);
	},
	
	viewArticles: function(ligues, index, maxitem) {
		this.selectItem(index);
		this.clearPanel(this.$.listcontent);
		this.clearPanel(this.$.detailcontent);		
		this.spinnerList(true);
		this.setToolbarDetail({"sendbutton": false, "webbutton": false, "backbutton": false});
		this.$.listcontent.createComponent({kind: "FADotCom.Articles", ligues: ligues, maxitem: maxitem}, {owner: this});
		this.$.listcontent.render();
	},
	
	// View matchs
	cmdMatchs: function() {
		this.refresh = this.cmdMatchs;	
		this.selectItem(4);	
		this.clearPanel(this.$.listcontent);
		this.clearPanel(this.$.detailcontent);
		this.spinnerList(true);	
		this.setToolbarDetail({"sendbutton": false, "webbutton": false, "backbutton": false});		
		this.$.listcontent.createComponent({kind: "FADotCom.Matchs"}, {owner: this});
		this.$.listcontent.render();		
	},
	
	// View matchs
	cmdClassements: function() {
		this.refresh = this.cmdClassements;	
		this.selectItem(5);	
		this.clearPanel(this.$.listcontent);
		this.clearPanel(this.$.detailcontent);
		this.spinnerList(true);		
		this.setToolbarDetail({"sendbutton": false, "webbutton": false, "backbutton": false});		
		this.$.listcontent.createComponent({kind: "FADotCom.Classements"}, {owner: this});
		this.$.listcontent.render();		
	},
	
	// Refresh list
	refreshList: function() {
		this.refresh();
	},
	
	// Change selection
	selectItem: function(i) {
		if (this.navselection != -1) this.$.navitems.getControls()[this.navselection].removeClass("nav-item-selected");	
		this.$.navitems.getControls()[i].addClass("nav-item-selected");	
		this.navselection = i;
	},
	
	// Show a new content in the detailed view
	showDetail: function(args) {
		// Clear panel and hide buttons
		this.clearPanel(this.$.detailcontent);
		this.setToolbarDetail({"sendbutton": false, "webbutton": false, "backbutton": false});		
		
		// Create the detail view using the right class and parameter
		this.$.detailcontent.createComponent(args, {owner: this});
		this.$.detailcontent.render();
	},
	
	// Util function, destroy all controls in the panel
	clearPanel: function(panel) {
		var controls = panel.getControls();
		for (var i = 0, c; c = controls[i]; i++) c.destroy();
		panel.render();
	},
	
	// Activate or desactivate spinner detail
	spinnerList: function(value) {
		if (value)
			this.$.spinnerlist.show();
		else
			this.$.spinnerlist.hide();
	},
	
	// Activate or desactivate spinner detail
	spinnerDetail: function(value) {
		if (value)
			this.$.spinnerdetail.show();
		else
			this.$.spinnerdetail.hide();
	},
	
	// Change button visibility in detail toolbar
	setToolbarDetail: function(values) {
		// Get toolbar buttons
		var buttons = this.$.toolbardetail.getControls();

		// Iterate on settings
		for(var key in values) {
			// Look for that button in the toolbar
			for (var i = 0 ; i < buttons.length ; i++) {
				var button = buttons[i];
				if (button.name == key) {
					// Found, change visibility
					if (values[key])
						button.show();
					else
						button.hide();
				}
			}
		}
	},
	
	// Handling toolbar button to web, mail and history
	setToolbarWebsite: function(url) {
		this.toolbarweburl = url;
	},
	
	setToolbarMailto: function(url) {
		this.toolbarmailurl = url;
	},
	
	openWebsite: function() {
		window.open(this.toolbarweburl);
	},
	
	openMail: function() {
		window.location.href = this.toolbarmailurl;	
	},
	
	historyBack: function() {
		this.showDetail(History.pop());
	},
	
	// Start dragging a row
	dragstart: function(s, e) {
		// Reming the dragging object
		this.dragobject = s.name;
		this.dragx = e.dx;
		var tofit;
		
		// Resize the previous row
		if (this.dragobject == "fitlist") {
			tofit = this.$.fitnav;
		} else if (this.dragobject == "fitdetail") {
			tofit = this.$.fitlist;
		} else 
			return true;	
		var newsize = tofit.hasNode().clientWidth+e.dx;
		tofit.applyStyle("width", newsize+"px");
		
		return true;
	},
	
	// Dragging over a row
	dragover: function(s, e) {
		// Nothing to drag
		if (this.dragobject == null)
			return true;
			
		// Resize the previous row
		var tofit;
		if (this.dragobject == "fitlist") {
			tofit = this.$.fitnav;
		} else if (this.dragobject == "fitdetail") {
			tofit = this.$.fitlist;
		} else 
			return true;
			
		// Resize previous row
		var newsize = tofit.hasNode().clientWidth+(e.dx-this.dragx);
		tofit.applyStyle("width", newsize+"px");		
		this.dragx = e.dx;	
		
		// Signal to the fittable to redraw
		this.resized();
		
		// Event processed
		e.preventDefault();
		return false;
	},
	
	// Drop a row
	drop: function(s, e) {
		// Compute final size to simplify handling
		if (this.dragobject == "fitlist") {
			if (this.dragx < 0) {
				this.$.fitnav.hide();
			} else {
				this.$.fitnav.applyStyle("width", this.fitnavinitsize+"px");	
				this.$.fitnav.show();
			}
			this.resized();		
		} else if (this.dragobject == "fitdetail") {
			if (this.dragx < 0) {
				this.$.fitlist.hide();
				this.$.fitnav.hide();			
			} else {
				this.$.fitlist.applyStyle("width", this.fitlistinitsize+"px");
				this.$.fitlist.show();			
			}
			this.resized();				
		}
		
		// Reset objects
		this.dragobject = null;
		this.dragx = 0;
		return true;
	},

	// Double click on a row grabber
	doubleclick: function(s, e) {
		// On the second row, hide the first row
		if (s.name == "grabberlist") {
			if (this.$.fitnav.showing)
				this.$.fitnav.hide();
			else
				this.$.fitnav.show();
			this.resized();	
		} 
		
		// On the third row, hide the first and the second row
		else if (s.name == "grabberdetail") {
			if (this.$.fitlist.showing) {
				this.$.fitlist.hide();
				this.$.fitnav.hide();
			} else {
				this.$.fitlist.show();
			}
			this.resized();				
		}
	}
});
