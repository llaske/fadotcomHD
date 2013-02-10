// Trace in Google Analytics

Stats = {}

var _gaq = _gaq || [];

Stats.init = function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
}

Stats.trace = function(page) {
	// Set account 
	_gaq.push(['_setAccount', 'UA-38333866-1']);

	// Trace page
	_gaq.push(['_trackPageview', page]);
}
