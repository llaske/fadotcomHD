// Display Article Detail

enyo.kind({
	name: "FADotCom.Articles.Detail",
	kind: "Scroller",
	classes: "article-detail",
	published: {record: null},	
	components: [
		{name: "itemTitre", classes: "article-detail-titre"},
		{name: "itemSousTitre", classes: "article-detail-soustitre"},
		{name: "itemAuteurDate", classes: "article-detail-auteurdate"},
		{name: "itemImage", classes: "article-detail-image", kind: "Image"},
		{name: "itemCorps", classes: "article-detail-corps", allowHtml: true}
	],
	
	// Constructor, init content
	create: function() {
		this.inherited(arguments);
		this.data = [];		
		this.recordChanged();
		Stats.trace("/tablet/article/"+this.record.id);
	},
	
	// Init content with already known values and with database
	recordChanged: function() {		
		// Set global info
		this.$.itemTitre.setContent(this.record.titre);
		this.$.itemSousTitre.setContent(this.record.soustitre);
		this.$.itemAuteurDate.setContent("le "+this.record.date+" par "+this.record.auteur);
		this.$.itemImage.setSrc(this.record.imagemedium);
		
		// Get detailed info
		var ws = new enyo.JsonpRequest({
			url: Preferences.backoffice + "fa_articles_contenu.php?id=" + this.record.id,
			callbackName: "callback"
		});
		ws.response(enyo.bind(this, "queryResponse"));
		ws.error(enyo.bind(this, "queryFail"));
		ws.go();
		
		// Get comments
		ws = new enyo.JsonpRequest({
			url: Preferences.backoffice + "fa_articles_comments.php?id=" + this.record.id,
			callbackName: "callback"
		});
		ws.response(enyo.bind(this, "commentResponse"));
		ws.error(enyo.bind(this, "commentFail"));
		ws.go();	
	},
	
	// Get response value
	queryResponse: function(inSender, inResponse) {
		// Request aborted, nothing to do
		if (typeof this.$.itemCorps === "undefined")
			return;	
			
		// Save data
		this.data = inResponse;
		var record = this.data;
		
		// Set article body
		this.$.itemCorps.setContent(record.corps);
		
		// Update toolbar
		app.spinnerDetail(false);
		app.setToolbarWebsite("http://www.footballamericain.com"+this.record.urlsite);
		var content = this.record.resume + "\n\n" + "http://www.footballamericain.com"+this.record.urlsite;
		app.setToolbarMailto("mailto:?subject="+encodeURIComponent(this.record.titre)+"&body="+encodeURIComponent(content));
		app.setToolbarDetail({"sendbutton": true, "webbutton": true, "commentbutton": true, "commentnumber": true});	
		History.displayButton();
	},
	
	// Error loading content
	queryFail: function(inSender, inError) {
		app.error("ARTDET"+inError);
	},
		
	// Get comments value
	commentResponse: function(inSender, inResponse) {
		app.setToolbarComment(inResponse.length, "http://www.footballamericain.com"+this.record.urlsite+"#trackback");
	},
	
	// Error loading comment
	commentFail: function(inSender, inError) {
		app.error("ARTCOM"+inError);
	}
});