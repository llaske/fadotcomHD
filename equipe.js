
//----------------- Cache Equipe handling
TeamCache = {};

TeamCache.content = [];

TeamCache.bulkCount = 0;

TeamCache.ok_callback = null;
TeamCache.ko_callback = null;
TeamCache.context = null;


// Load a bulk of team
TeamCache.bulkloadTeams = function(ids, ok_callback, ko_callback, context) {
	TeamCache.bulkCount = ids.length;
	if (TeamCache.bulkCount == 0) {
		ok_callback();
		return;
	}
	
	// Build url
	var url = "http://m.footballamericain.com/backoffice/v1/fa_equipes.php?id=" + ids;
	TeamCache.ok_callback = ok_callback;
	TeamCache.ko_callback = ko_callback;
	TeamCache.context = context;
	
	// Load data for this team
	var ws = new enyo.JsonpRequest({ url: url, callbackName: "callback" });
	ws.response(enyo.bind(TeamCache, "queryResponse"));
	ws.error(enyo.bind(TeamCache, "queryFail"));
	ws.go();
}

// Team load response handler
TeamCache.queryResponse = function(inSender, inResponse) {
	enyo.forEach(inResponse, TeamCache.addTeam, TeamCache);
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


/*
// Display Equipe Detail
enyo.kind({
	name: "FADotCom.Equipe",
	kind: "FittableRows",
	classes: "onyx",
	components: [
		{kind: "onyx.Toolbar", components: [
			{kind: "onyx.Button", content: "Back", ontap: "backHandler"},
			{content: "FootballAmericain.com"}
		]},
		{style: "display: inline-block;", components: [
			{name: "itemNom", style: "font-weight: bold; color: red; font-size: 20px"},
			{name: "itemVille", style: "font-weight: bold; color: red; font-size: 16px"},
			{name: "itemImageTeam", kind: "Image", style: "width: 100px;"},
			{content: "Création:", style: "font-weight: bold;"},
			{name: "itemCreation"},
			{style: "padding: 8px;"},
			{content: "Site officiel:", style: "font-weight: bold;"},
			{name: "itemWeb", allowHtml: true},
			{style: "padding: 8px;"}
		]},
		{kind: "Scroller", style: "height:200px; padding: 0 80px; width: 350px; display: inline-block;", components: [
			{name: "scoresList", fit: true, kind: "Repeater", onSetupItem: "setupMatchScore", components: [
				{name: "item", ontap: "scoreClicked", components: [
					{kind: "onyx.Button", name: "match", style: "width: 250px;"}
				]}
			]}			
		]},
		{tag: "hr", styles: "height:1px;"},
		{kind: "Scroller", fit: true, components: [
			{name: "articlesList", fit: true, kind: "Repeater", onSetupItem: "listSetupRow", components: [
				{name: "item", classes: "item", ontap: "itemClick", components: [
					{name: "article", kind: "FADotCom.Article"},
					{tag: "hr", styles: "height:1px;"}
				]}
			]}
		]}
	],
	
	init: function(team) {
		console.log("init "+team.id);
		this.team = team;
		this.$.itemNom.setContent(this.team.nom);
		this.$.itemVille.setContent(this.team.ville);
		this.$.itemImageTeam.setSrc("http://footballamericain.com/images/images/team/100/"+this.team.image);
		this.$.itemCreation.setContent(this.team.creation);
		this.$.itemWeb.setContent("<a href='"+this.team.web+"'>"+this.team.web+"</a>");	
		this.$.button.setContent(History.label());
		var ws = new enyo.JsonpRequest({
			url: "http://m.footballamericain.com/backoffice/v1/fa_matchs.php?ligue=1&equipe=" + team.id,
			callbackName: "callback",
		});
		ws.response(enyo.bind(this, "queryResponseMatch"));
		ws.error(enyo.bind(this, "queryFailMatch"));
		ws.go();
		ws = new enyo.JsonpRequest({
			url: "http://m.footballamericain.com/backoffice/v1/fa_articles.php?equipe=" + team.id,
			callbackName: "callback",
		});
		ws.response(enyo.bind(this, "queryResponseArticle"));
		ws.error(enyo.bind(this, "queryFailArticle"));
		ws.go();		
	},
	
	create: function() {
		this.inherited(arguments);
		this.matchs = [];
		this.teams = [];
		this.count = 0;
	},
	
	queryResponseMatch: function(inSender, inResponse) {
		this.matchs = inResponse;
		this.loadTeams(this.matchs);
	},
	
	loadTeams: function(data) {
		// Load teams
		var i;
		var ids = [];
		var count = 0;		
		for(i = 0 ; i < data.length ; i++) {
			ids[count++] = this.equipedom;
			ids[count++] = this.equipeext;		
		}		
		TeamCache.bulkloadTeams(ids,
			function(context) {
				// Update score list when done
				context.$.scoresList.setCount(context.matchs.length);
			},
			
			function(context) {
				console.log("failed");			
			},
			
			this
		);		
	},
	
	queryFailMatch: function(inSender) {
		console.log("failed");
	},
	
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
			theme = '#becfe1';
		} else {
			result = ' D ';
			theme = '#eaeff4';
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
		inEvent.item.$.match.applyStyle("background-color", theme);
	},
	
	scoreClicked: function(inSender, inEvent) {
		var match = this.matchs[inEvent.index];
		console.log("select match "+match.id);
		History.push({label: "Equipe", backto: "FADotCom.Equipe", params: [this.team]});
		var detail = new FADotCom.Matchs.Detail();
		detail.init(match, TeamCache.getTeam(match.equipedom), TeamCache.getTeam(match.equipeext));
		detail.renderInto(document.body);		
	},
	
	queryResponseArticle: function(inSender, inResponse) {
		this.articles = inResponse;
		this.$.articlesList.setCount(this.articles.length);	
	},
	
	queryFailArticle: function(inSender) {
		console.log("failed");
	},
	
	listSetupRow: function(inSender, inEvent) {
		inEvent.item.$.article.setItem(this.articles[inEvent.index]);
	},
	
	itemClick: function(inSender, inEvent) {
		var record = this.articles[inEvent.index];
		console.log("click on "+record.id);	
		History.push({label: "Equipe", backto: "FADotCom.Equipe", params: [this.team]});
		var detail = new FADotCom.Articles.Detail();
		detail.init(record);
		detail.renderInto(document.body);
	},
	
	backHandler: function(inSender, e) {
		History.back();
	}
});*/