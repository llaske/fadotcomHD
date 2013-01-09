
//----------------- Cache Equipe handling
TeamCache = {};

TeamCache.content = [];

TeamCache.bulkCount = 0;

TeamCache.ok_callback = null;
TeamCache.ko_callback = null;
TeamCache.context = null;
TeamCache.cached = false;


// Load a bulk of team
TeamCache.bulkloadTeams = function(ids, ok_callback, ko_callback, context) {
	TeamCache.bulkCount = ids.length;
	if (TeamCache.bulkCount == 0) {
		ok_callback();
		return;
	}
	
	// Build url
	var url = Preferences.backoffice + "fa_equipes.php?id=" + ids;
	TeamCache.ok_callback = ok_callback;
	TeamCache.ko_callback = ko_callback;
	TeamCache.context = context;
	TeamCache.cached = false;
	
	// Load data for this team
	var ws = new Cached.JsonpRequest({ url: url, callbackName: "callback" });
	ws.setResponse(enyo.bind(TeamCache, "queryResponse"));
	ws.setCachedResponse(enyo.bind(TeamCache, "queryCachedResponse"));
	ws.setError(enyo.bind(TeamCache, "queryFail"));
	ws.go();
}

// Team load cached response handler, store data and call 
TeamCache.queryCachedResponse = function(inSender, inResponse) {
	enyo.forEach(inResponse, TeamCache.addTeam, TeamCache);
	TeamCache.cached = true;
	TeamCache.ok_callback(TeamCache.context);
}

// Team load response handler
TeamCache.queryResponse = function(inSender, inResponse) {
	enyo.forEach(inResponse, TeamCache.addTeam, TeamCache);
	if (!TeamCache.cached)
		TeamCache.ok_callback(TeamCache.context);
}

// Team load error handler
TeamCache.queryFail = function(inSender) {
	console.log("failed");
	TeamCache.ko_callback(TeamCache.context);
}

// Add Team
TeamCache.addTeam = function(item) {
	TeamCache.content[item.id] = item;
}

// Get team information
TeamCache.getTeam = function(id) {
	return this.content[id];
}



// Display Equipe Detail
enyo.kind({
	name: "FADotCom.Equipe",
	kind: "Scroller",
	classes: "team-detail",
	published: {team: null},	
	components: [
		{classes: "team-detail-info", components: [
			{name: "itemNom", classes: "team-detail-nom"},
			{name: "itemVille", classes: "team-detail-ville"},
			{name: "itemImageTeam", kind: "Image", classes: "team-detail-image"},
			{content: "Cr\xE9ation:", classes: "team-detail-creationlabel"},
			{name: "itemCreation", classes: "team-detail-creation"},
			{classes: "team-detail-pad"},
			{content: "Site officiel:", classes: "team-detail-sitelabel"},
			{name: "itemWeb", classes: "team-detail-site", allowHtml: true},
			{classes: "team-detail-pad"}
		]},
		{kind: "Scroller", classes: "team-detail-match", components: [
			{name: "scoresList", fit: true, kind: "Repeater", onSetupItem: "setupMatchScore", components: [
				{name: "item", ontap: "scoreClicked", components: [
					{kind: "onyx.Button", name: "match", classes: "team-detail-matchbutton"}
				]}
			]}			
		]},
		{tag: "hr", classes: "team-detail-line"},
		{kind: "Scroller", fit: true, components: [
			{name: "articlesList", fit: true, kind: "Repeater", onSetupItem: "listSetupRow", components: [
				{name: "item", classes: "item", ontap: "itemClick", components: [
					{name: "article", kind: "FADotCom.Article"},
					{tag: "hr", classes: "team-detail-line"}
				]}
			]}
		]}
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.matchs = [];
		this.teams = [];
		this.count = 0;
		this.teamChanged();
	},
	
	// Team init, get team info and launch articles and matchs requests
	teamChanged: function() {
		// Set team info
		this.$.itemNom.setContent(this.team.nom);
		this.$.itemVille.setContent(this.team.ville);
		this.$.itemImageTeam.setSrc("http://footballamericain.com/images/images/team/100/"+this.team.image);
		this.$.itemCreation.setContent(this.team.creation);
		this.$.itemWeb.setContent("<a href='"+this.team.web+"'>"+this.team.web+"</a>");	
		History.displayButton();		
		
		// Launch matchs request
		this.matchsLoaded = false;	
		var ws = new enyo.JsonpRequest({
			url: Preferences.backoffice + "fa_matchs.php?ligue=1&equipe=" + this.team.id,
			callbackName: "callback",
		});
		ws.response(enyo.bind(this, "queryResponseMatch"));
		ws.error(enyo.bind(this, "queryFailMatch"));
		ws.go();
		
		// Launch articles request
		this.articlesLoaded = false;		
		ws = new enyo.JsonpRequest({
			url: Preferences.backoffice + "fa_articles.php?equipe=" + this.team.id,
			callbackName: "callback",
		});
		ws.response(enyo.bind(this, "queryResponseArticle"));
		ws.error(enyo.bind(this, "queryFailArticle"));
		ws.go();		
	},
	
	// Reponse matchs
	queryResponseMatch: function(inSender, inResponse) {
		this.matchs = inResponse;
		this.loadTeams(this.matchs);
	},
	
	// Load teams info
	loadTeams: function(data) {
		// Set teams list
		var i;
		var ids = [];
		var count = 0;		
		for(i = 0 ; i < data.length ; i++) {
			ids[count++] = this.equipedom;
			ids[count++] = this.equipeext;		
		}

		// Bulk load team infos
		TeamCache.bulkloadTeams(ids,
			function(context) {
				// Request aborted, nothing to do
				if (typeof context.$.scoresList === "undefined")
					return;
					
				// Update score list when done
				context.$.scoresList.setCount(context.matchs.length);
						
				// Update spinner
				context.matchsLoaded = true;
				if (context.matchsLoaded && context.articlesLoaded)
					app.spinnerDetail(false);
			},
			
			function(context) {
				console.log("failed");			
			},
			
			this
		);		
	},
	
	// TODO: Error loading team
	queryFailMatch: function(inSender) {
		console.log("failed");
	},
	
	// Setup a line in the match lists
	setupMatchScore: function(inSender, inEvent) {
		// Compute score string
		var match = this.matchs[inEvent.index];
		var result;
		var theme;
		var place;
		var opponent;
		var score;
		var scorestring;
		var opponentscore;
		if ( match.equipedom == this.team.id ) {
			place = 'vs ';
			score = match.scoredom;
			opponent = match.equipeext;
			opponentscore = match.scoreext;
		} else {
			place = '@';
			score = match.scoreext;
			opponent = match.equipedom;
			opponentscore = match.scoredom;
		}
		if (parseInt(score) > parseInt(opponentscore)) {
			result = ' V ';
			theme = 'team-detail-matchcolorV';
		} else if (parseInt(score) < parseInt(opponentscore)) {
			result = ' D ';
			theme = 'team-detail-matchcolorD';
		} else {
			result = ' N ';
			theme = 'team-detail-matchcolorN';
		}
		if (match.scoredom != null && match.scoreext != null) {
			scorestring = match.scoredom + '-' + match.scoreext;
		} else {
			result = ' ';
			var dateParts = match.date.split("-");
			var date = new Date(dateParts[0], parseFloat(dateParts[1])-1, parseFloat(dateParts[2]));
			scorestring = date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();					
		}		
		var teamopp = TeamCache.getTeam(opponent);
		inEvent.item.$.match.setContent(match.acrojournee + ': ' + result + place + teamopp.nom + ', '+ scorestring);
		inEvent.item.$.match.addClass(theme);	
	},
	
	// Click on a score, view the match
	scoreClicked: function(inSender, inEvent) {
		var match = this.matchs[inEvent.index];	
		console.log("select match "+match.id);	
		History.push({kind: "FADotCom.Equipe", team: this.team});		
		app.spinnerDetail(true);		
		app.showDetail({kind: "FADotCom.Matchs.Detail", 
			match: match,
			teamdom: TeamCache.getTeam(match.equipedom),
			teamext: TeamCache.getTeam(match.equipeext)});		
	},
	
	// Articles loaded
	queryResponseArticle: function(inSender, inResponse) {
		// Request aborted, nothing to do
		if (typeof this.$.articlesList === "undefined")
			return;	
			
		// Display it
		this.articles = inResponse;
		this.$.articlesList.setCount(this.articles.length);	
		
		// Update spinner
		this.articlesLoaded = true;
		if (this.matchsLoaded && this.articlesLoaded)
			app.spinnerDetail(false);
	},
	
	// TODO: Process error
	queryFailArticle: function(inSender) {
		console.log("failed");
	},
	
	// Setup article
	listSetupRow: function(inSender, inEvent) {
		inEvent.item.$.article.setItem(this.articles[inEvent.index]);
	},
	
	// Click on an article
	itemClick: function(inSender, inEvent) {
		var record = this.articles[inEvent.index];
		console.log("click on "+record.id);	
		History.push({kind: "FADotCom.Equipe", team: this.team});
		app.spinnerDetail(true);
		app.showDetail({kind: "FADotCom.Articles.Detail", record: this.articles[inEvent.index]});		
	}
});