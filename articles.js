// Display Articles List

enyo.kind({
	name: "FADotCom.Articles",
	kind: "Scroller",
	published: { ligues: "1,2,3", maxitem: -1 },
	components: [
		{name: "articlesList", fit: true, kind: "Repeater", onSetupItem: "setupItem", components: [
			{name: "item", ontap: "taped", components: [
				{name: "article", kind: "FADotCom.Article"},
				{tag: "hr", classes: "article-list-line"}
			]}
		]}
	],
  
	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		this.selection = null;
		this.maxitemChanged();		
		this.liguesChanged();
	},

	// Ligues property changed, upgrade display
	liguesChanged: function() {
		// Get articles from backoffice
		var ws = new enyo.JsonpRequest({
			url: Preferences.backoffice + "fa_articles.php?ligue=" + this.ligues,
			callbackName: "callback",
		});
		ws.response(enyo.bind(this, "queryResponse"));
		ws.error(enyo.bind(this, "queryFail"));
		ws.go();
	},
	
	// Maxitem changed
	maxitemChanged: function() {
	},
	
	// Change selection
	selectItem: function(s) {
		if (this.selection != null) this.selection.setSelected(false);
		s.setSelected(true);
		this.selection = s;
	},
	
	// Response from database
	queryResponse: function(inSender, inResponse) {
		// Store article
		this.data = inResponse;
		
		// Display it
		this.$.articlesList.setCount(this.maxitem == -1 ? this.data.length : this.maxitem);
		app.spinnerList(false);
	},
	
	// Error from database, TODO
	queryFail: function(inSender, inError) {
		console.log("failed");
	},
	
	// Init setup for a line
	setupItem: function(inSender, inEvent) {
		// Set item in the template
		inEvent.item.$.article.setItem(this.data[inEvent.index]);
	},
	
	// Article taped
	taped: function(inSender, inEvent) {
		this.selectItem(this.$.articlesList.children[inEvent.index].$.article);
		console.log("click on "+this.data[inEvent.index].id);	
		app.spinnerDetail(true);
		app.showDetail({kind: "FADotCom.Articles.Detail", record: this.data[inEvent.index]});
	}
});


// Item article template
enyo.kind({
	name: "FADotCom.Article",
	kind: enyo.Control,
	classes: "article-item",
	published: { item: "" },
	components: [
		{ kind: enyo.Control, components: [
			{ name: "itemTitre", classes: "article-list-titre" },
			{ name: "itemImage", classes: "article-list-image", kind: "Image" },
			{ name: "itemResume", classes: "article-list-resume" }
		]}
	],

	// Constructor: set fields value
	create: function() {
		this.inherited(arguments);
		this.itemChanged();
	},

	// Set items properties
	itemChanged: function() {
		this.$.itemImage.setAttribute("src", this.item.image);
		this.$.itemTitre.setContent(this.item.titre);
		this.$.itemResume.setContent(this.item.resume);
	},
	
	// Set selection
	setSelected: function(selected) {
		if (selected) 
			this.addClass("article-item-selected");
		else
			this.removeClass("article-item-selected");			
	},
});

