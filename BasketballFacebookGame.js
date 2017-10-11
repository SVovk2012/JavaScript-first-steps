(function (win) {
	'use strict';
	var Zynga = win.Zynga;
	var me = {};

	if (Zynga === undefined || (typeof Zynga  === 'object' && Zynga.Core === undefined)) {
		throw Error("No Zynga Core module found.  The Zynga.Core.js module must be loaded first.");
	}

	// Dependencies
	['Instant', 'Net', 'Account'].forEach(function (module) {
		if (Zynga[module] === undefined) {
			throw Error("No Zynga " + module +" module found.  The Zynga." + module + ".js module must be loaded first.");
		}
	});

	var Core = Zynga.Core;
	var Promise = Core.Promise;
	var Instant = Zynga.Instant;
	var Net = Zynga.Net;
	var Account = Zynga.Account;
	
	Zynga.Leaderboard = me;
	
	me.getTopThree = function(leaderboardName, success, failed){
		me.getScores(leaderboardName, "", 0, 0, 2, 1, 0, success, failed);
	}
	
	me.getScoresAround = function(id, leaderboardName, success, failed){
		me.getScores(leaderboardName, id, -1, 50, 50, -1, 0, success, failed);
	}
	
	me.getTopScores = function(leaderboardName, success, failed){
		me.getScores(leaderboardName, "", 0, 0, 100, 1, 0, success, failed);
	}
	
	me.getTopScoresLastPeriod = function(leaderboardName, success, failed){
		me.getScores(leaderboardName, "", 0, 0, 9, 1, 1, success, failed);
	}
	
	me.getScores = function(leaderboardName, id, rank, before, after, tier, periodOffset, success, failed){
		var method = 'GET';
		
		Zynga.Account.Event.last(Zynga.Account.Events.ACCOUNT_DETAILS).then(function (account) {
            var ZID = account.zid.toString();
            
    		Zynga.Event.last(Zynga.Events.APP_ID, function (appId) {
				//Construct URL
				//ex: /leaderboards/v2/app/5004247/leaderboard/weekly---test?rank=0&after=10&tier=1
				var url = '/leaderboards/v2/app/' + appId + '/leaderboard/' + leaderboardName;
				
				var delimiter = '?';
				
				if (id != ""){
					url += '/id/' + id;
				}
				if (rank > -1){
					url += delimiter + 'rank=' + rank;
					delimiter = '&';
				}
				if (before > 0){
					url += delimiter + 'before=' + before;
					delimiter = '&';
				}
				if (after > 0){
					url += delimiter + 'after=' + after;
					delimiter = '&';
				}
				if (tier > -1){
					url += delimiter + 'tier=' + tier;
					delimiter = '&';
				}
				if (periodOffset > 0){
					url += delimiter + 'period_offset=' + periodOffset;
					delimiter = '&';
				}
				url += delimiter + 'details=true';
				
				var options = {} //none?
				Net.api(method, url, options).then((function (response) {
					var body = response.body;
					var xhr = response.xhr;
					if (typeof body === 'object' && xhr.status === 200) {
						console.log('Get scores success');
						success(body);
					}
					else if (typeof body === 'object' && xhr.status === 400 && body["error_data"][leaderboardName][id]["code"] === 303) {
						console.log('No score to get');
						failed();
					}
					else {
						// TODO: error flow
						console.log('Get scores failed');
						failed();
					}
				}),
				function (error) {
					// TODO: error flow
					console.log('Error during leaderboard Get Scores', error);
					failed();
				});
				
			});

        }).catch(function (reason) {
            log("------ Handle rejected promise for getting ZID from Zynga.Account (" + reason + ")");
            failed();
        });
	}
	
	me.incrementScore = function(id, leaderboardName, score, success, failed){
		var method = 'POST';
		
		Zynga.Account.Event.last(Zynga.Account.Events.ACCOUNT_DETAILS).then(function (account) {
            var ZID = account.zid.toString();
            
    		Zynga.Event.last(Zynga.Events.APP_ID, function (appId) {
				//Construct URL
				var url = '/leaderboards/v2/app/' + appId + '/leaderboard/' + leaderboardName + '/id/' + id;
		
				var options = {
					body: {"incr": score}
				}
	
				Net.api(method, url, options).then((function (response) {
					var body = response.body;
					var xhr = response.xhr;
					if (typeof body === 'object' && xhr.status === 200) {
						console.log('Increment score success');
						success();
					}
					else {
						// TODO: error flow
						console.log('Increment score failed');
						failed();
					}
				}),
				function (error) {
					// TODO: error flow
					console.log('Error during leaderboard increment', error);
					failed();
				});
				
			});

        }).catch(function (reason) {
            log("------ Handle rejected promise for getting ZID from Zynga.Account (" + reason + ")");
            failed();
        });
	};

})(window);

(function (win) {
	'use strict';
	var Zynga = win.Zynga;
	var me = {};

	if (Zynga === undefined || (typeof Zynga  === 'object' && Zynga.Core === undefined)) {
		throw Error("No Zynga Core module found.  The Zynga.Core.js module must be loaded first.");
	}

	// Dependencies
	['Instant', 'Net', 'Account'].forEach(function (module) {
		if (Zynga[module] === undefined) {
			throw Error("No Zynga " + module +" module found.  The Zynga." + module + ".js module must be loaded first.");
		}
	});

	var Core = Zynga.Core;
	var Promise = Core.Promise;
	var Instant = Zynga.Instant;
	var Net = Zynga.Net;
	var Account = Zynga.Account;
	
	Zynga.Leaderboard = me;
	
	me.getTopThree = function(leaderboardName, success, failed){
		me.getScores(leaderboardName, "", 0, 0, 2, 1, 0, success, failed);
	}
	
	me.getScoresAround = function(id, leaderboardName, success, failed){
		me.getScores(leaderboardName, id, -1, 50, 50, -1, 0, success, failed);
	}
	
	me.getTopScores = function(leaderboardName, success, failed){
		me.getScores(leaderboardName, "", 0, 0, 100, 1, 0, success, failed);
	}
	
	me.getTopScoresLastPeriod = function(leaderboardName, success, failed){
		me.getScores(leaderboardName, "", 0, 0, 9, 1, 1, success, failed);
	}
	
	me.getScores = function(leaderboardName, id, rank, before, after, tier, periodOffset, success, failed){
		var method = 'GET';
		
		Zynga.Account.Event.last(Zynga.Account.Events.ACCOUNT_DETAILS).then(function (account) {
            var ZID = account.zid.toString();
            
    		Zynga.Event.last(Zynga.Events.APP_ID, function (appId) {
				//Construct URL
				//ex: /leaderboards/v2/app/5004247/leaderboard/weekly---test?rank=0&after=10&tier=1
				var url = '/leaderboards/v2/app/' + appId + '/leaderboard/' + leaderboardName;
				
				var delimiter = '?';
				
				if (id != ""){
					url += '/id/' + id;
				}
				if (rank > -1){
					url += delimiter + 'rank=' + rank;
					delimiter = '&';
				}
				if (before > 0){
					url += delimiter + 'before=' + before;
					delimiter = '&';
				}
				if (after > 0){
					url += delimiter + 'after=' + after;
					delimiter = '&';
				}
				if (tier > -1){
					url += delimiter + 'tier=' + tier;
					delimiter = '&';
				}
				if (periodOffset > 0){
					url += delimiter + 'period_offset=' + periodOffset;
					delimiter = '&';
				}
				url += delimiter + 'details=true';
				
				var options = {} //none?
				Net.api(method, url, options).then((function (response) {
					var body = response.body;
					var xhr = response.xhr;
					if (typeof body === 'object' && xhr.status === 200) {
						console.log('Get scores success');
						success(body);
					}
					else if (typeof body === 'object' && xhr.status === 400 && body["error_data"][leaderboardName][id]["code"] === 303) {
						console.log('No score to get');
						failed();
					}
					else {
						// TODO: error flow
						console.log('Get scores failed');
						failed();
					}
				}),
				function (error) {
					// TODO: error flow
					console.log('Error during leaderboard Get Scores', error);
					failed();
				});
				
			});

        }).catch(function (reason) {
            log("------ Handle rejected promise for getting ZID from Zynga.Account (" + reason + ")");
            failed();
        });
	}
	
	me.incrementScore = function(id, leaderboardName, score, success, failed){
		var method = 'POST';
		
		Zynga.Account.Event.last(Zynga.Account.Events.ACCOUNT_DETAILS).then(function (account) {
            var ZID = account.zid.toString();
            
    		Zynga.Event.last(Zynga.Events.APP_ID, function (appId) {
				//Construct URL
				var url = '/leaderboards/v2/app/' + appId + '/leaderboard/' + leaderboardName + '/id/' + id;
		
				var options = {
					body: {"incr": score}
				}
	
				Net.api(method, url, options).then((function (response) {
					var body = response.body;
					var xhr = response.xhr;
					if (typeof body === 'object' && xhr.status === 200) {
						console.log('Increment score success');
						success();
					}
					else {
						// TODO: error flow
						console.log('Increment score failed');
						failed();
					}
				}),
				function (error) {
					// TODO: error flow
					console.log('Error during leaderboard increment', error);
					failed();
				});
				
			});

        }).catch(function (reason) {
            log("------ Handle rejected promise for getting ZID from Zynga.Account (" + reason + ")");
            failed();
        });
	};

})(window);

