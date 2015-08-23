// Display Match Detail
enyo.kind({
	name: "FADotCom.Matchs.Detail",
	kind: "Scroller",
	classes: "match-detail",
	published: {match: null, teamdom: null, teamext: null},
	components: [
		{components: [
			{classes: "match-detail-block", components: [
				{name: "itemImageDom", kind: "Image", classes: "match-detail-imagedom"},
				{name: "itemNomDom", classes: "match-detail-nomdom", onclick: "clickEquipeDom" }
			]},
			{classes: "match-detail-block", components: [
				{name: "itemScoreDom", classes: "match-detail-scoredom"},
				{content: " - ", classes: "match-detail-tiret"},
				{name: "itemScoreExt", classes: "match-detail-scoreext"}
			]},
			{classes: "match-detail-block", components: [
				{name: "itemImageExt", classes: "match-detail-imageext", kind: "Image"},
				{name: "itemNomExt", classes: "match-detail-nomext", onclick: "clickEquipeExt" }
			]}
		]},
		{classes: "match-detail-pad1"},		
		{components: [
			{classes: "match-detail-row", components: [
				{classes: "match-detail-row-title"},
				{name: "qt1title", content: "qt1", classes: "match-detail-row-title-qt1"},
				{name: "qt2title", content: "qt2", classes: "match-detail-row-title-qt2"},
				{name: "qt3title", content: "qt3", classes: "match-detail-row-title-qt1"},
				{name: "qt4title", content: "qt4", classes: "match-detail-row-title-qt2"}
			]},
			{classes: "match-detail-pad2"},		
			{classes: "match-detail-row", components: [
				{name: "scoredom", classes: "match-detail-row-score"},		
				{name: "qt1dom", classes: "match-detail-row-qt1"},
				{name: "qt2dom", classes: "match-detail-row-qt2"},
				{name: "qt3dom", classes: "match-detail-row-qt1"},
				{name: "qt4dom", classes: "match-detail-row-qt2"}
			]},
			{classes: "match-detail-pad2"},		
			{classes: "match-detail-row", components: [
				{name: "scoreext", classes: "match-detail-row-score"},			
				{name: "qt1ext", classes: "match-detail-row-qt1"},
				{name: "qt2ext", classes: "match-detail-row-qt2"},
				{name: "qt3ext", classes: "match-detail-row-qt1"},
				{name: "qt4ext", classes: "match-detail-row-qt2"}
			]}
		]},
		{name: "matchdate", classes: "match-detail-date"},
		{tag: "hr", classes: "match-detail-line"},
		{kind: "Scroller", fit: true, components: [
			{name: "articlesList", fit: true, kind: "Repeater", onSetupItem: "listSetupRow", components: [
				{name: "item", classes: "item", ontap: "itemClick", components: [
					{name: "article", kind: "FADotCom.Article"},
					{tag: "hr", classes: "match-detail-line"}
				]}
			]}
		]}		
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.data = [];
		this.matchChanged();
		this.teamdomChanged();
		this.teamextChanged();
		Stats.trace("/tablet/match/"+this.match.id);
	},
	
	// Set team dom info
	teamdomChanged: function() {
		this.$.itemNomDom.setContent(this.teamdom.nom);	
		this.$.scoredom.setContent(this.teamdom.nom);			
		this.$.itemImageDom.setSrc(Preferences.fairuseImage("http://footballamericain.com/images/images/team/100/"+this.teamdom.image));
		this.$.itemScoreDom.setContent(this.match.scoredom);	
	},
	
	// Set team ext info
	teamextChanged: function() {
		this.$.itemNomExt.setContent(this.teamext.nom);
		this.$.scoreext.setContent(this.teamext.nom);		
		this.$.itemImageExt.setSrc(Preferences.fairuseImage("http://footballamericain.com/images/images/team/100/"+this.teamext.image));
		this.$.itemScoreExt.setContent(this.match.scoreext);	
	},
	
	// Match updated, load score info
	matchChanged: function() {
		// Get score info
		var ws = new enyo.JsonpRequest({
			url: Preferences.backoffice + "fa_matchs_scores.php?id=" + this.match.id,
			callbackName: "callback"
		});
		ws.response(enyo.bind(this, "queryResponseScore"));
		ws.error(enyo.bind(this, "queryFailScore"));
		ws.go();	

		// Get articles
		ws = new enyo.JsonpRequest({
			url: Preferences.backoffice + "fa_articles.php?match=" + this.match.id,
			callbackName: "callback"
		});
		ws.response(enyo.bind(this, "queryResponseArticle"));
		ws.error(enyo.bind(this, "queryFailArticle"));
		ws.go();
		History.displayButton();
	},
	
	// Score retrieved
	queryResponseScore: function(inSender, inResponse) {
		// Request aborted, nothing to do
		if (typeof this.$.qt1dom === "undefined")
			return;	

		// Get data
		this.data = inResponse;
		var record = this.data;
		
		// Set score for each quart-time
		this.$.qt1dom.setContent(this.valueOrNot(record.qt1_dom));
		this.$.qt2dom.setContent(this.valueOrNot(record.qt2_dom));
		this.$.qt3dom.setContent(this.valueOrNot(record.qt3_dom));
		this.$.qt4dom.setContent(this.valueOrNot(record.qt4_dom));
		this.$.qt1ext.setContent(this.valueOrNot(record.qt1_ext));
		this.$.qt2ext.setContent(this.valueOrNot(record.qt2_ext));
		this.$.qt3ext.setContent(this.valueOrNot(record.qt3_ext));
		this.$.qt4ext.setContent(this.valueOrNot(record.qt4_ext));
		
		// Set date
		if (this.match.date != undefined && (this.match.scoredom == null || this.match.scoreext == null)) {
			var dateParts = this.match.date.split("-");
			var dayNames = new Array("Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi");
			var date = new Date(dateParts[0], parseFloat(dateParts[1])-1, parseFloat(dateParts[2]));
			var timeParts = this.match.heure.split(":");
			this.$.matchdate.setContent(dayNames[date.getDay()]+' '+date.getDate()+'/'+(date.getMonth()+1)+' - '+timeParts[0]+'h'+timeParts[1]);
			this.$.matchdate.show();
		} else {
			// Hide date
			this.$.matchdate.hide();
		}
		app.spinnerDetail(false);		
	},
	
	// Value for score
	valueOrNot: function(value) {
		return value == null ? "-" : value;
	},
	
	// Error loading score
	queryFailScore: function(inSender, inError) {
		app.error("MATDET"+inError);
	},
	
	// Articles related to match loaded
	queryResponseArticle: function(inSender, inResponse) {
		// Request aborted, nothing to do
		if (typeof this.$.articlesList === "undefined")
			return;	
			
		// Display articles
		this.articles = inResponse;
		this.$.articlesList.setCount(this.articles.length);	
	},
	
	// Error loading articles
	queryFailArticle: function(inSender, inError) {
		app.error("MATART"+inError);
	},
	
	// Update articles list
	listSetupRow: function(inSender, inEvent) {
		inEvent.item.$.article.setItem(this.articles[inEvent.index]);
	},
	
	// Click on an article, show in detail
	itemClick: function(inSender, inEvent) {
		var record = this.articles[inEvent.index];
		Preferences.log("click on "+record.id);	
		History.push({kind: "FADotCom.Matchs.Detail", match: this.match, teamdom: this.teamdom, teamext: this.teamext});
		app.spinnerDetail(true);
		app.showDetail({kind: "FADotCom.Articles.Detail", record: this.articles[inEvent.index]});
	},
	
	// Click on a team, show it in detail
	clickEquipeDom: function(inSender, inEvent) {
		Preferences.log("click on team "+this.teamdom.id);
		History.push({kind: "FADotCom.Matchs.Detail", match: this.match, teamdom: this.teamdom, teamext: this.teamext});
		app.spinnerDetail(true);
		app.showDetail({kind: "FADotCom.Equipe", team: this.teamdom});
	},

	// Click on a team, show it in detail
	clickEquipeExt: function(inSender, inEvent) {
		Preferences.log("click on team "+this.teamext.id);
		History.push({kind: "FADotCom.Matchs.Detail", match: this.match, teamdom: this.teamdom, teamext: this.teamext});
		app.spinnerDetail(true);
		app.showDetail({kind: "FADotCom.Equipe", team: this.teamext});
	}	
});
