// Display Matchs

enyo.kind({
	name: "FADotCom.Matchs",
	kind: "Scroller",
	components: [
		{name: "matchsList", fit: true, kind: "Repeater", onSetupItem: "setupItem", components: [
			{name: "item", components: [
				{name: "divider", classes: "match-list-line"},
				{name: "match", kind: "FADotCom.MatchLigne", ontap: "taped"}
			]}
		]}
	],
	
	// Constructor, load matchs
	create: function() {
		this.inherited(arguments);	
		this.data = [];
		this.selection = null;
		
		// Get matchs
		var ws = new Cached.JsonpRequest({
			url: Preferences.backoffice + "fa_matchs.php?ligue=1",
			callbackName: "callback",
		});
		ws.setResponse(enyo.bind(this, "queryResponseMatch"));
		ws.setCachedResponse(enyo.bind(this, "queryCachedResponseMatch"));		
		ws.setError(enyo.bind(this, "queryFailMatch"));
		ws.go();
	},
	
	// Match loaded in cached, get teams info and continue waiting
	queryCachedResponseMatch: function(inSender, inResponse) {	
		this.data = inResponse;
		this.loadTeam(this.data, true);
	},
	
	// Match loaded, redisplay match and stop waiting
	queryResponseMatch: function(inSender, inResponse) {	
		// Request aborted, nothing to do
		if (typeof this.$.matchsList === "undefined")
			return;
			
		// Update match list if needed
		if (!inSender.cached) {		
			this.data = inResponse;		
			this.loadTeam(this.data, false);
			return;
		}
		app.spinnerList(false);		
	},
	
	// Load all teams
	loadTeam: function(data, waiting) {
		// Compute teams id
		var i;
		var ids = [];
		var count = 0;	
		for(i = 0 ; i < data.length ; i++) {
			ids[count++] = data[i].equipedom;			
			ids[count++] = data[i].equipeext;		
		}		
		
		// Bulk load all teams
		TeamCache.bulkloadTeams(ids,
			function(context) {
				// Request aborted, nothing to do
				if (typeof context.$.matchsList === "undefined")
					return;
					
				// Update match list when done
				context.$.matchsList.setCount(context.data.length);
				app.spinnerList(waiting);	
			},
			
			function(context) {
				console.log("failed");			
			},
			
			this
		);		
	},
	
	// Error loading match
	queryFailMatch: function(inSender) {
		console.log("failed");
	},
	
	// Change selection
	selectItem: function(s) {
		if (this.selection != null) this.selection.setSelected(false);
		s.setSelected(true);
		this.selection = s;	
	},
	
	// Setup team line
	setupItem: function(inSender, inEvent) {
		var index = inEvent.index;
		var match = this.data[index];
		inEvent.item.$.match.setItem(match);
		inEvent.item.$.match.setTeamDom(TeamCache.getTeam(match.equipedom));
		inEvent.item.$.match.setTeamExt(TeamCache.getTeam(match.equipeext));
		inEvent.item.$.divider.setContent(match.journee);
		if (index == 0 || this.data[index-1].journee != match.journee)
			inEvent.item.$.divider.canGenerate = true;	
		else
			inEvent.item.$.divider.canGenerate = false;	
		if (this.selection != null && this.selection.item.id == match.id) {
			inEvent.item.$.match.setSelected(true);
			this.selection = inEvent.item.$.match;
		}
	},
	
	// Match taped
	taped: function(inSender, inEvent) {
		this.selectItem(this.$.matchsList.children[inEvent.index].$.match);
		console.log("click on "+this.data[inEvent.index].id);	
		app.spinnerDetail(true);		
		app.showDetail({kind: "FADotCom.Matchs.Detail", 
			match: this.data[inEvent.index],
			teamdom: TeamCache.getTeam(this.data[inEvent.index].equipedom),
			teamext: TeamCache.getTeam(this.data[inEvent.index].equipeext)});
	}	
});


// Item match template
enyo.kind({
	name: "FADotCom.MatchLigne",
	kind: enyo.Control,
	classes: "match-item",
	published: { item: "", teamDom: "", teamExt: "" },
	components: [
			{kind: enyo.Control, components: [
				{components: [	
					{name: "itemImageDom", kind: "Image", classes: "match-list-imagedom"},
					{name: "itemNomDom", classes: "match-list-nomdom"},
					{name: "itemScoreDom", classes: "match-list-scoredom"},
					{name: "itemTiret", content: " - ", classes: "match-list-tiret"},
					{name: "itemScoreExt", classes: "match-list-scoreext"},
					{name: "itemDate", classes: "match-list-date"},
					{name: "itemNomExt", classes: "match-list-nomext"},
					{name: "itemImageExt", classes: "match-list-imageext", kind: "Image"},
					{tag: "hr", classes: "match-list-itemline"}
				]} 
			]}
	],

	// Constructor, set team info
	create: function() {
		this.inherited(arguments);
		this.itemChanged();
		this.teamDomChanged();
		this.teamExtChanged();
	},

	// Set score value
	itemChanged: function() {
		// Set score
		this.$.itemScoreDom.setContent(this.item.scoredom);
		this.$.itemScoreExt.setContent(this.item.scoreext);

		// Match not play ?
		if (this.item.date != undefined && (this.item.scoredom == null || this.item.scoreext == null)) {
			// Hide score
			this.$.itemScoreDom.hide();
			this.$.itemTiret.hide();
			this.$.itemScoreExt.hide();

			// Display date
			var dateParts = this.item.date.split("-");
			this.$.itemDate.setContent(dateParts[2]+'/'+dateParts[1]+'/'+dateParts[0]);
			this.$.itemDate.show();
		} else {
			// Hide date
			this.$.itemDate.hide();
		}
	},
	
	// Set team dom value
	teamDomChanged: function() {
		this.$.itemNomDom.setContent(this.teamDom.nom);
		this.$.itemImageDom.setAttribute("src", "http://footballamericain.com/images/images/team/100/"+this.teamDom.image);
	},

	// Set team ext value
	teamExtChanged: function() {
		this.$.itemNomExt.setContent(this.teamExt.nom);
		this.$.itemImageExt.setAttribute("src", "http://footballamericain.com/images/images/team/100/"+this.teamExt.image);	
	},
	
	// Set selection
	setSelected: function(selected) {
		if (selected) {
			this.addClass("match-item-selected");
		} else
			this.removeClass("match-item-selected");			
	}
});

