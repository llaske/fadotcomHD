

// Display Equipe Matchs
enyo.kind({
	name: "FADotCom.Equipe.Matchs",
	kind: enyo.Control,
	classes: "team-detail-match",
	published: {team: null, matchs: null},
	components: [
		{name: "scoresList", fit: true, kind: "Repeater", onSetupItem: "setupMatchScore", components: [
			{name: "item", ontap: "scoreClicked", classes: "team-detailmatch", components: [
				{name: "detailmatchItem", components: [
					{name: "day", classes: "team-detailmatch-day"},
					{name: "match", classes: "team-detailmatch-button"},
					{name: "vsat", classes: "team-detailmatch-vsat"},
					{name: "imageOppTeam", kind: "Image", classes: "team-detailmatch-image"}
				]}
			]}
		]}			
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.matchsChanged();	
	},
	
	// Matchs loaded
	matchsChanged: function() {
		if (this.matchs != null) {	
			this.$.scoresList.setCount(this.matchs.length);	
		}
	},
	
	// Setup a line in the lists
	setupMatchScore: function(inSender, inEvent) {
		// Compute score string
		var match = this.matchs[this.matchs.length-1-inEvent.index];
		var result;
		var theme;
		var place;
		var opponent;
		var score;
		var scorestring;
		var opponentscore;
		if ( match.equipedom == this.team.id ) {
			place = 'vs';
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
			scorestring = '...';					
		}		
		var teamopp = TeamCache.getTeam(opponent);
		inEvent.item.$.day.setContent(match.acrojournee);
		inEvent.item.$.match.setContent(scorestring);
		inEvent.item.$.vsat.setContent(place);
		inEvent.item.$.detailmatchItem.addClass(theme);	
		inEvent.item.$.imageOppTeam.setSrc("http://footballamericain.com/images/images/team/100/"+teamopp.image);
	},
	
	// Click on a score, view the match
	scoreClicked: function(inSender, inEvent) {
		var match = this.matchs[this.matchs.length-1-inEvent.index];	
		Preferences.log("select match "+match.id);	
		History.push({kind: "FADotCom.Equipe", team: this.team});		
		app.spinnerDetail(true);		
		app.showDetail({kind: "FADotCom.Matchs.Detail", 
			match: match,
			teamdom: TeamCache.getTeam(match.equipedom),
			teamext: TeamCache.getTeam(match.equipeext)});		
	}
});
