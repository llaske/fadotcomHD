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
			callbackName: "callback",
		});
		ws.response(enyo.bind(this, "queryResponse"));
		ws.error(enyo.bind(this, "queryFail"));
		ws.go();
	},
	
	// Get response value
	queryResponse: function(inSender, inResponse) {
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
		app.setToolbarDetail({"sendbutton": true, "webbutton": true});	
		History.displayButton();
	},
	
	// Error loading
	queryFail: function(inSender) {
		console.log("failed");
	}		
});