// FA.com mobile tablet version

// Main app class
enyo.kind({
	name: "FADotCom.TabletApp",
	kind: "FittableColumns", 
	classes: "enyo-fit", 
	components: [
		{name: "fitnav", kind: "FittableRows", classes: "fitnav",  ondragover: "dragover", ondrop: "drop", components: [
			{name: "navitems", fit: true, components: [
				{ classes: "nav-item", content: "Articles", ontap: "cmdArticles"},
				{ classes: "nav-item", content: "Scores", ontap: "cmdMatchs"},
				{ classes: "nav-item", content: "Classements", ontap: "cmdClassements"}
			]},	
			{kind: "onyx.Toolbar", components: [
				{content: "", classes: "fitnav-toolbar" }
			]}
		]},
		{name: "fitlist", kind: "FittableRows", classes: "fitlist fittable-shadow", ondragover: "dragover", ondragstart: "dragstart", ondrop: "drop", components: [
			{kind: "Panels", fit: true, name: "listcontent", components: []},
			{kind: "onyx.Toolbar", components: [
				{name: "grabberlist", kind: "onyx.Grabber", ondblclick: "doubleclick"},
				{name: "spinnerlist", showing: false, kind: "Image", src: "images/spinner-dark.gif", classes: "list-spinner"}
			]}
		]},
		{name: "fitdetail", kind: "FittableRows", fit: true, classes: "fitdetail fittable-shadow", ondragover: "dragover", ondragstart: "dragstart", ondrop: "drop", components: [
			{kind: "Panels", fit: true, name: "detailcontent", components: []},
			{kind: "onyx.Toolbar", components: [
				{name: "grabberdetail", kind: "onyx.Grabber", ondblclick: "doubleclick"},
				{name: "spinnerdetail", showing: false, kind: "Image", src: "images/spinner-dark.gif", classes: "list-spinner"}				
			]}
		]}
	],

	// Constructor
	create: function() {
		this.inherited(arguments); 
		this.navselection = -1;
	},
	
	// View articles
	cmdArticles: function() {
		this.selectItem(0);
		this.clearPanel(this.$.listcontent);
		this.clearPanel(this.$.detailcontent);		
		this.spinnerList(true);
		this.$.listcontent.createComponent({kind: "FADotCom.Articles"}, {owner: this});
		this.$.listcontent.render();
	},
	
	// View matchs
	cmdMatchs: function() {
		this.selectItem(1);	
		this.clearPanel(this.$.listcontent);
		this.clearPanel(this.$.detailcontent);
		this.spinnerList(true);		
		this.$.listcontent.createComponent({kind: "FADotCom.Matchs"}, {owner: this});
		this.$.listcontent.render();		
	},
	
	// View matchs
	cmdClassements: function() {
		this.selectItem(2);	
		this.clearPanel(this.$.listcontent);
		this.clearPanel(this.$.detailcontent);
		this.spinnerList(true);		
		this.$.listcontent.createComponent({kind: "FADotCom.Classements"}, {owner: this});
		this.$.listcontent.render();		
	},
	
	// Change selection
	selectItem: function(i) {
		if (this.navselection != -1) this.$.navitems.getControls()[this.navselection].removeClass("nav-item-selected");	
		this.$.navitems.getControls()[i].addClass("nav-item-selected");	
		this.navselection = i;
	},
	
	// Show a new content in the detailed view
	showDetail: function(args) {
		this.clearPanel(this.$.detailcontent);
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
