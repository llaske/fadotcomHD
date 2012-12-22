Preferences = {};

Preferences.nfl = true;
Preferences.ncaa = true;
Preferences.elite = true;

Preferences.getLigues = function() {
	var count = 0;
	var ligues = "";
	if (this.nfl) {
		ligues = ligues + "1";
		count++;
	}
	if (this.ncaa) {
		if (count > 0) {
			ligues = ligues + ",";
			count = 0;
		}
		ligues = ligues + "2";
		count++;
	}
	if (this.elite) {
		if (count > 0) {
			ligues = ligues + ",";
			count = 0;
		}
		ligues = ligues + "3";
		count++;
	}	
	return ligues;
}