// Display Classements List
enyo.kind({
	name: "FADotCom.Classements",
	kind: "FittableRows",
	components: [
		{name: "confitems", fit: true, components: [
			{ classes: "classement-item", content: "AFC", ontap: "cmdAFC"},
			{ classes: "classement-item", content: "NFC", ontap: "cmdNFC"}
		]}	
	],
	
	// Constructor
	create: function() {
		this.selection = -1;	
		this.inherited(arguments);
		app.spinnerList(false);		
	},
	
	// Show conference detail
	cmdAFC: function() {
		this.selectItem(0);
		app.showDetail({kind: "FADotCom.Classements.Detail", conference: "AFC"});	
	},
	
	cmdNFC: function() {
		this.selectItem(1);
		app.showDetail({kind: "FADotCom.Classements.Detail", conference: "NFC"});		
	},
	
	// Handle selection
	selectItem: function(i) {
		if (this.selection != -1) this.$.confitems.getControls()[this.selection].removeClass("classement-item-selected");	
		this.$.confitems.getControls()[i].addClass("classement-item-selected");		
		this.selection = i;	
	}
});	


// Display Classements Detail
enyo.kind({
	name: "FADotCom.Classements.Detail",
	kind: "FittableRows",
	published: { conference: null },
	components: [
		{ kind: "enyo.Scroller", fit: true, components: [
			{name: "list", fit: true, kind: "Repeater", onSetupItem: "listSetupRow", components: [		
				{name: "item", components: [ 
					{name: "divTitle", classes: "classement-line-title", components: [
						{name: "itemDivision", classes: "classement-line-division"},
						{content: "G", classes: "classement-column-titlesingle"},
						{content: "N", classes: "classement-column-titlesingle"},
						{content: "P", classes: "classement-column-titlesingle"},
						{content: "Pct", classes: "classement-column-titledouble"},
						{classes: "classement-column-pad"}					
					]},
					{classes: "classement-line-item", components: [
						{name: "itemName", classes: "classement-line-name"},
						{name: "itemG", classes: "classement-column-single"},
						{name: "itemN", classes: "classement-column-single"},
						{name: "itemP", classes: "classement-column-single"},
						{name: "itemPct", classes: "classement-column-double"}
					]}
				]}
			]}
		]}		
	],
	
	// Constructor
	create: function() {
		this.inherited(arguments);
		this.data = [];
		this.conferenceChanged();
	},
	
	// Conference changed, get classement values
	conferenceChanged: function() {
		this.afc = [];
		this.nfc = [];		
		var ws = new enyo.JsonpRequest({
			url: "http://m.footballamericain.com/backoffice/v1/fa_classements.php?ligue=1",
			callbackName: "callback",
		});
		ws.response(enyo.bind(this, "queryResponse"));
		ws.error(enyo.bind(this, "queryFail"));
		ws.go();
	},	
	
	// Data received set items
	queryResponse: function(inSender, inResponse) {
		this.data = inResponse;
		var countafc = 0;
		var countnfc = 0;
		for (i = 0 ; i < this.data.length ; i++) {
			var record = this.data[i];
			if (record.conference  == 'AFC')
				this.afc[countafc++] = record;
			else
				this.nfc[countnfc++] = record;
		}
		if (this.conference == "AFC")
			this.$.list.setCount(countafc);	
		else
			this.$.list.setCount(countnfc);	
	},
	
	// Data error
	queryFail: function(inSender) {
		console.log("failed");
	},	
	
	// Set value in rows
	listSetupRow: function(inSender, inEvent) {
		var currentconf;
		var bgconf;
		if (this.conference == "AFC") {
			currentconf = this.afc;
		}else {
			currentconf = this.nfc;
		}
		var inIndex = inEvent.index;
		var record = currentconf[inIndex];
		if (record != null) {
			if (inIndex == 0 || record.division != currentconf[inIndex-1].division) {
				inEvent.item.$.itemDivision.setContent(record.division);
				inEvent.item.$.divTitle.addClass(this.conference+"-header-background");
			}
			else
				inEvent.item.$.divTitle.hide();
			inEvent.item.$.itemName.setContent(record.nom);
			if (inIndex % 2 == 0)
				inEvent.item.$.itemName.addClass(this.conference+"-background");
			inEvent.item.$.itemG.setContent(record.g);
			if (inIndex % 2 == 0)
				inEvent.item.$.itemG.addClass(this.conference+"-background");
			inEvent.item.$.itemN.setContent(record.n);
			if (inIndex % 2 == 0)
				inEvent.item.$.itemN.addClass(this.conference+"-background");
			inEvent.item.$.itemP.setContent(record.p);
			if (inIndex % 2 == 0)
				inEvent.item.$.itemP.addClass(this.conference+"-background");	
			inEvent.item.$.itemPct.setContent(record.pct);
			if (inIndex % 2 == 0)
				inEvent.item.$.itemPct.addClass(this.conference+"-background");				
			return true;
		}
		else
			return false;
	}
});