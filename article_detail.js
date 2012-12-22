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
			url: "http://m.footballamericain.com/backoffice/v1/fa_articles_contenu.php?id=" + this.record.id,
			callbackName: "callback",
		});
		ws.response(enyo.bind(this, "queryResponse"));
		ws.error(enyo.bind(this, "queryFail"));
		ws.go();
	},
	
	// Get response value
	queryResponse: function(inSender, inResponse) {
		this.data = inResponse;
		var record = this.data;
		this.$.itemCorps.setContent(record.corps);
	},
	
	// Error loading
	queryFail: function(inSender) {
		console.log("failed");
	}		
});