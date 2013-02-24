// Team Favorites handling
TeamFavorites = {};
TeamFavorites.content = null;
TeamFavorites.storage = new FADotCom.LocalStorage();
TeamFavorites.key = Preferences.backoffice + "favoris";

// Load favorites team from local storage
TeamFavorites.load = function() {
	var content = this.storage.getValue(this.key);
	if (content == null) {
		this.content = [];
		this.save();
	} else
		this.content = content;
	return this.content;
}

// Save favorites team in local storage
TeamFavorites.save = function() {
	this.storage.setValue(this.key, this.content);
}

// Test if a team is a favorite
TeamFavorites.is = function(team) {
	if (this.content == null)
		this.load();
	var len = this.content.length;
	for(var i = 0 ; i < len ; i++ ) {
		if (team.id == this.content[i].id)
			return true;
	}
	return false;
}

// Add a team as favorite
TeamFavorites.add = function(team) {
	if (!this.is(team))
		this.content.push(team);
	this.save();
}

// Remove a team from favorites
TeamFavorites.remove = function(team) {
	if (!this.is(team))
		return;
	var newcontent = [];
	var len = this.content.length;	
	for(var i = 0 ; i < len ; i++ ) {
		if (team.id != this.content[i].id)
			newcontent.push(this.content[i]);
	}
	this.content = newcontent;
	this.save();
}


// Display Favoris List
enyo.kind({
	name: "FADotCom.Favoris",
	kind: "Scroller",
	components: [
		{name: "favorisList", fit: true, kind: "Repeater", onSetupItem: "setupItem", components: [
			{name: "item", ontap: "taped", components: [
				{name: "favori", kind: "FADotCom.Favori"},
				{tag: "hr", classes: "favori-list-line"}
			]}
		]}
	],
  
	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		this.selection = null;

		// Load favorites and draw it
		this.data = TeamFavorites.load();
		this.$.favorisList.setCount(this.data.length);
		
		// Stop waiting
		app.spinnerList(false);
	},
		
	// Init setup for a line
	setupItem: function(inSender, inEvent) {
		// Set item in the template
		inEvent.item.$.favori.setTeam(this.data[inEvent.index]);
		if (this.selection != null && this.selection.item.id == this.data[inEvent.index].id) {
			inEvent.item.$.favori.setSelected(true);
			this.selection = inEvent.item.$.favori;
		}		
	},
	
	// Change selection
	selectItem: function(s) {
		if (this.selection != null) this.selection.setSelected(false);
		s.setSelected(true);
		this.selection = s;
	},
	
	// Favori taped
	taped: function(inSender, inEvent) {
		this.selectItem(this.$.favorisList.children[inEvent.index].$.favori);
		Preferences.log("click on team "+this.data[inEvent.index].id);	
		app.spinnerDetail(true);
		app.showDetail({kind: "FADotCom.Equipe", team: this.data[inEvent.index]});
	}	
});


// Item favori template
enyo.kind({
	name: "FADotCom.Favori",
	kind: enyo.Control,
	classes: "favori-item",
	published: { team: null },
	components: [
		{kind: enyo.Control, classes: "favori-list", components: [
			{name: "itemImage", classes: "favori-list-image", kind: "Image" },
			{name: "itemName", classes: "favori-list-name" }
		]}
	],

	// Constructor: set fields value
	create: function() {
		this.inherited(arguments);
		this.teamChanged();
	},

	// Set items properties
	teamChanged: function() {
		if (this.team == null) return;
		this.$.itemImage.setAttribute("src", "http://footballamericain.com/images/images/team/100/"+this.team.image);
		this.$.itemName.setContent(this.team.ville+" "+this.team.nom);
	},
	
	// Set selection
	setSelected: function(selected) {
		if (selected) 
			this.addClass("favori-item-selected");
		else
			this.removeClass("favori-item-selected");			
	}
});


// Display Favoris Selection
enyo.kind({
	name: "FADotCom.FavorisSelect",
	kind: "Scroller",
	components: [
		{name: "favorisList", fit: true, kind: "Repeater", onSetupItem: "setupItem", components: [
			{name: "item", ontap: "taped", components: [
				{name: "favori", kind: "FADotCom.FavoriSelect"},
				{tag: "hr", classes: "favori-list-line"}
			]}
		]}
	],
  
	// Constructor: init list
	create: function() {
		this.inherited(arguments);
		
		// Load all teams
		ws = new enyo.JsonpRequest({
			url: Preferences.backoffice + "fa_equipes.php?id=0,1,2,3",
			callbackName: "callback"
		});
		ws.response(enyo.bind(this, "queryResponse"));
		ws.error(enyo.bind(this, "queryFail"));
		ws.go();
	},

	// Response team
	queryResponse: function(inSender, inResponse) {
		// Load favorites and draw it
		this.data = inResponse;
		this.$.favorisList.setCount(this.data.length);
		
		// Stop waiting
		app.spinnerDetail(false);
	},
	
	// Error from database
	queryFail: function(inSender, inError) {
		app.error("FAVTEA"+inError);
	},
	
	// Init setup for a line
	setupItem: function(inSender, inEvent) {
		// Set item in the template
		inEvent.item.$.favori.setTeam(this.data[inEvent.index]);		
	},
	
	// Favori taped
	taped: function(inSender, inEvent) {
	}	
});


// Item favori template
enyo.kind({
	name: "FADotCom.FavoriSelect",
	kind: enyo.Control,
	classes: "favori-item",
	published: { team: null },
	components: [
		{kind: enyo.Control, classes: "favori-select", ontap: "toggleFavorite", components: [
			{name: "itemImage", classes: "favori-select-image", kind: "Image" },
			{name: "itemName", classes: "favori-select-name" },
			{name: "favbutton", kind: "onyx.ToggleIconButton", src: "images/favorite.png", showing: true, value: false, classes: "favori-select-button", ontap: "toggleFavorite"}
		]}
	],

	// Constructor: set fields value
	create: function() {
		this.inherited(arguments);
		this.teamChanged();
	},

	// Set items properties
	teamChanged: function() {
		if (this.team == null) return;
		this.$.itemImage.setAttribute("src", "http://footballamericain.com/images/images/team/100/"+this.team.image);
		this.$.itemName.setContent(this.team.ville+" "+this.team.nom);
		this.$.favbutton.setValue(TeamFavorites.is(this.team));
	},
	
	// Toggle favorite value
	toggleFavorite: function(inSender, inEvent) {
		this.$.favbutton.setValue(!this.$.favbutton.getValue());
		if (this.$.favbutton.getValue())
			TeamFavorites.add(this.team);
		else
			TeamFavorites.remove(this.team);
		app.updateFavorites();
	}
});