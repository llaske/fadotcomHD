// Cache Equipe handling
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
		{name: "itemImageTeam", kind: "Image", classes: "team-detail-image"},	
		{classes: "team-detail-info", components: [
			{name: "itemNom", classes: "team-detail-nom"},
			{name: "itemVille", classes: "team-detail-ville"},	
			{name: "itemScore", content: "", classes: "team-detail-score"}
		]},		
		{classes: "team-detail-pad"},
		{name: "matchsList", kind: "FADotCom.Equipe.Matchs"},
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
		app.setFavorite(this.team);
		app.setToolbarDetail({"favbutton": true});
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
		// Ignore match without result
		for (var i = 0 ; i < inResponse.length ; i++) {
			var match = inResponse[i];
			if (match.scoredom != null && match.scoreext != null)
				this.matchs.push(match);
		}
		
		// Load teams
		this.loadTeams(this.matchs);
	},
	
	// Load teams info
	loadTeams: function(data) {
		// Set teams list
		var i;
		var ids = [];
		var count = 0;		
		for(i = 0 ; i < data.length ; i++) {
			ids[count++] = data[i].equipedom;
			ids[count++] = data[i].equipeext;		
		}

		// Bulk load team infos
		TeamCache.bulkloadTeams(ids,
			function(context) {
				// Request aborted, do nothing
				if (typeof context.$.matchsList === "undefined")
					return;
					
				// Update score list when done
				context.$.matchsList.setTeam(context.team);
				context.$.matchsList.setMatchs(context.matchs);
				context.displayScore();
						
				// Update spinner
				context.matchsLoaded = true;
				if (context.matchsLoaded && context.articlesLoaded)
					app.spinnerDetail(false);
			},
			
			function(context) {
				app.error("TEAINF");			
			},
			
			this
		);		
	},
	
	// Error loading team
	queryFailMatch: function(inSender, inError) {
		app.error("TEAMAT"+inError);
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
	
	// Process error
	queryFailArticle: function(inSender, inError) {
		app.error("TEAART"+inError);
	},
	
	// Compute and display score for the team
	displayScore: function() {
		var V = 0, D = 0, N = 0, C = 0;
		var len = this.matchs.length;
		for(var i = len-1 ; i >= 0 && C < Preferences.matchseasoncount ; i--) {
			var match = this.matchs[i];
			if (match.scoredom == null || match.scoreext == null)
				continue;
			if ( match.equipedom == this.team.id ) {
				score = parseInt(match.scoredom);
				opponentscore = parseInt(match.scoreext);
			} else {
				score = parseInt(match.scoreext);
				opponentscore = parseInt(match.scoredom);
			}
			if (score > opponentscore) {
				V++;
			} else if (score < opponentscore) {
				D++;
			} else {
				N++;
			}
			C++;
		}
		var content = V+" - "+D;
		if (N > 0)
			content += " - "+N;
		this.$.itemScore.setContent(content);
	},
	
	// Setup article
	listSetupRow: function(inSender, inEvent) {
		inEvent.item.$.article.setItem(this.articles[inEvent.index]);
	},
	
	// Click on an article
	itemClick: function(inSender, inEvent) {
		var record = this.articles[inEvent.index];
		Preferences.log("click on "+record.id);	
		History.push({kind: "FADotCom.Equipe", team: this.team});
		app.spinnerDetail(true);
		app.showDetail({kind: "FADotCom.Articles.Detail", record: this.articles[inEvent.index]});		
	}
});