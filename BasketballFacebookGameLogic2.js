var Flags = {};
Flags.DISABLE_LEADERBOARD = false;

/*==============================================
===================== Stats ==================== 
==============================================*/

var Stats = {};
Stats.analytics = null;

Stats.ZID = '';
Stats.VERSION = '1.2.1'; //For staging builds
Stats.GAME_ID = '5004246';

//Stats constants
Stats.COUNTER_LB_INTERACT = "lb_interact";
Stats.COUNTER_TS_INTERACT = "ts_interact";
Stats.COUNTER_FTUE_SHOWN = "ftue_shown";
Stats.COUNTER_FTUE_COMPLETE = "ftue_complete";
Stats.COUNTER_ROUND_START = "round_start";
Stats.COUNTER_POSITION_END = "position_end";
Stats.COUNTER_GAME_END_DETAILS = "game_end_details";
Stats.COUNTER_SHARE = "share";
Stats.VALUE_POSITION_NUMBER = "position_number";
Stats.VALUE_SCORE = "score";
Stats.KINGDOM_VERSION_NUMBER = "version_number";
Stats.KINGDOM_SELECT_TEAM = "select_team";
Stats.KINGDOM_VIEW_WINNERS = "view_winners";
Stats.KINGDOM_REPEAT_TEAM = "repeat_team";
Stats.KINGDOM_FRIEND_TEAM = "friend_team";
Stats.KINGDOM_TYPE = "type";
Stats.KINGDOM_LIST_SELECT = "list_select";
Stats.KINGDOM_SHARE_DESTINATION = "share_destination";

Stats.init = function ()
{
    if (window.Zynga)
    {
        Stats.analytics = Zynga.Analytics;

		var logError = function (reason) {console.error("------ Handle rejected promise for getting ZID from Zynga.Account (" + reason + ")");};
        Zynga.Account.Event.last(Zynga.Account.Events.ACCOUNT_DETAILS).then(Stats.setSocialNetworkToken).catch(logError);
    }
    else
    {
        console.log("ZyngaFBInstantSDK not found");
    }
};

Stats.setSocialNetworkToken = function(account)
{
	Zynga.Net.setSocialNetworkToken(account.snid, account.token, true);
	Stats.ZID = account.zid.toString();
};

// No need to log [session_id] since it is logged by analytics by default already
Stats.log = function (counter, value, kingdom, phylum, Class, family, genus)
{
    if (kingdom === 0) kingdom = '0';
    if (phylum === 0) phylum = '0';
    if (Class === 0) Class = '0';
    if (family === 0) family = '0';
    if (genus === 0) genus = '0';
    if (Stats.analytics)
    {
        Stats.analytics.logCount(
        {
            counter: (counter || '').toString(),
            value: (parseInt(value || '0')),
            kingdom: (kingdom || '').toString(),
            phylum: (phylum || '').toString(),
            class: (Class || '').toString(),
            family: (family || '').toString(),
            genus: (genus || '').toString()
        });
    }
    console.log(
        (counter || '').toString() + ", " +
        (parseInt(value || '0')) + ", " +
        (kingdom || '').toString() + ", " +
        (phylum || '').toString() + ", " +
        (Class || '').toString() + ", " +
        (family || '').toString() + ", " +
        (genus || '').toString() + ", "
    );
};


/*==============================================
=============== BasketballLoading ==============
==============================================*/

var BasketballLoading = {};

//TODO: Update with basketball logo
//BasketballLoading.logoBase64 = 'data:image/png;base64,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';

BasketballLoading.loadGame = function ()
{
    pc.script.createLoadingScreen(function (app)
    {
        // No need for FBInstant to have customize splash screen, it has a default loading screen for us
        if (PlatformFacade.currentPlatform === PlatformFacade.PLATFORM.FB_INSTANT)
        {
            console.log("FBInstant default loading screen");

            var setProgressFBInstant = function (value)
            {
                value = Math.floor(value * 100);
                window.Zynga.Instant.setLoadingProgress(value);
                console.log('Loading ...... ' + value + '%');
            };

            var doneLoading = function ()
            {
                window.Zynga.Instant.setLoadingProgress(100);
                console.log("Done Loading - 100%");
                PlatformFacade.onGameLoaded();
            };
			
			app.on('preload:end', function ()
			{
                app.off('preload:progress');
            });
            app.on('preload:progress', setProgressFBInstant);
            app.on('start', doneLoading);
        }
        else
        {
            console.log("Customized Loading Screen");
            var showSplash = function ()
            {
                // splash wrapper
                var wrapper = document.createElement('div');
                wrapper.id = 'application-splash-wrapper';
                document.body.appendChild(wrapper);

                // splash
                var splash = document.createElement('div');
                splash.id = 'application-splash';
                wrapper.appendChild(splash);
                splash.style.display = 'block';

                var logo = document.createElement('img');
                logo.src = 'http://static.playcanvas.com/images/logo/play.png';
                logo.style.position = 'center';
                splash.appendChild(logo);
                logo.onload = function ()
                {
                    splash.style.display = 'block';
                };

                var container = document.createElement('div');
                container.id = 'progress-bar-container';
                splash.appendChild(container);

                var bar = document.createElement('div');
                bar.id = 'progress-bar';
                container.appendChild(bar);

            };

            var hideSplash = function ()
            {
            	console.log("hide splash");
                var splash = document.getElementById('application-splash-wrapper');
                splash.parentElement.removeChild(splash);
            };

            var setProgress = function (value)
            {
                var bar = document.getElementById('progress-bar');
                if (bar)
                {
                    value = Math.max(1, value) * 100;
                    bar.style.width = value + '%';
                }
            };

            var createCss = function ()
            {
                var css = [
                    'body {',
                    '    background-color: #E2F0F6;',
                    '}',

                    '#application-splash-wrapper {',
                    '    position: absolute;',
                    '    top: 0;',
                    '    left: 0;',
                    '    height: 100%;',
                    '    width: 100%;',
                    '    background-color: #E2F0F6;',
                    '}',

                    '#application-splash {',
                    '    position: absolute;',
                    '    top: calc(30% - 28px);',
                    '    width: 300px;',
                    '    left: calc(50% - 132px);',
                    '}',

                    '#application-splash img {',
                    '    width: 100%;',
                    '}',

                    '#progress-bar-container {',
                    '    margin: 20px auto 0 auto;',
                    '    height: 4px;',
                    '    width: 174px;',
                    '    background-color: #333333',
                    '}',

                    '#progress-bar {',
                    '    width: 0%;',
                    '    height: 100%;',
                    '    background-color: #70c8fa;',
                    '}',
                    '@media (max-width: 480px) {',
                    '    #application-splash {',
                    '        width: 240px;',
                    '        left: calc(50% - 120px);',
                    '    }',
                    '}'
                ].join("\n");

                var style = document.createElement('style');
                style.type = 'text/css';
                if (style.styleSheet)
                {
                    style.styleSheet.cssText = css;
                }
                else
                {
                    style.appendChild(document.createTextNode(css));
                }

                document.head.appendChild(style);
            };

            createCss();

            showSplash();

            app.on('preload:end', function ()
            {
                app.off('preload:progress');
            });
            app.on('preload:progress', setProgress);
            app.on('start', hideSplash);
        }
    });
};

/*==============================================
================ PlatformFacade ================ 
==============================================*/

var PlatformFacade = {};

// Get player profile image from facebook
PlatformFacade.playerImage = null;

// Used to check if FBInstant is initialized, if yes then start the game
PlatformFacade.FBInstantIntialized = false;

// Used to check if game finished loading
PlatformFacade.GameLoaded = false;

// Used to check if experiments finished loading
PlatformFacade.ExperimentsLoaded = false;

// This counts how many games player played in one session
PlatformFacade.gameCount = 0;

PlatformFacade.PLATFORM =
{
    WEB: { value: 0, name: 'Web' },
    I_MESSAGE: { value: 1, name: 'Zynga Game Hub on IMessage' },
    FB_INSTANT: { value: 2, name: 'FB Instant SDK' },
};

// Used to check which platform is the game currently on
PlatformFacade.currentPlatform = PlatformFacade.PLATFORM.WEB;

// Detect and update current platform
PlatformFacade.detectPlatform = function ()
{
    if (window.ZyngaGameHub)
    {
        PlatformFacade.currentPlatform = PlatformFacade.PLATFORM.FB_INSTANT;
        window.Zynga.Instant = window.FBInstant;
    }
    else if (window.FBInstant)
    {
        PlatformFacade.currentPlatform = PlatformFacade.PLATFORM.FB_INSTANT;
    }
    else
    {
        PlatformFacade.currentPlatform = PlatformFacade.WEB;
        if (window.Zynga)
        {
            window.Zynga.Instant = undefined;
        }
    }
    console.log("====== Platform detected: " + PlatformFacade.currentPlatform);
};

// called when the application starts up
PlatformFacade.init = function ()
{
    PlatformFacade.timerStart = Date.now(); // Timer
    PlatformFacade.detectPlatform();

    /*============= FB Instant =============*/
    if (PlatformFacade.currentPlatform === PlatformFacade.PLATFORM.FB_INSTANT)
    {
    	var logError = function (reason) { console.error("------ Handle rejected promise for FBInstant::initializeAsync() (" + reason + ")"); };
    
        // Initializes the SDK library. This should be called before any other SDK functions.
        window.Zynga.Instant.initializeAsync().then(PlatformFacade.onInitializeAsync).catch(logError);
    }
    BasketballLoading.loadGame();
};

PlatformFacade.onInitializeAsync = function ()
{
	var locale = window.Zynga.Instant.getLocale(); // 'en_US'
	var platform = window.Zynga.Instant.getPlatform(); // 'iOS', 'android' or 'web'
	var sdkVersion = window.Zynga.Instant.getSDKVersion(); // '2.0'
	var fbPlayerid = window.Zynga.Instant.player.getID();
	var contextID = window.Zynga.Instant.context.getID();

	PlatformFacade.playerImage = new Image();
	PlatformFacade.playerImage.crossOrigin = 'anonymous';
	PlatformFacade.playerImage.src = FBInstant.player.getPhoto();

	console.log(" ------ FBInstant::initializeAsync() resolved in " + (Date.now() - PlatformFacade.timerStart) / 1000.0 + " seconds : local - " + locale + ", platform - " + platform + ", sdkVersion - " + sdkVersion + ", FBplayerID - " + fbPlayerid);

	PlatformFacade.FBInstantIntialized = true;
	PlatformFacade.startGameIfReady();
};

// Called when the game scene is successfully loaded
PlatformFacade.onGameLoaded = function ()
{
    console.log("====== Game loaded in " + (Date.now() - PlatformFacade.timerStart) / 1000.0 + " seconds"); // Timer
    
    PlatformFacade.GameLoaded = true;
	PlatformFacade.startGameIfReady();
    PlatformFacade.fetchExperiments();
};

PlatformFacade.fetchExperiments = function()
{  
    if (PlatformFacade.currentPlatform === PlatformFacade.PLATFORM.FB_INSTANT)
    {
        console.log("Fetching Experiments");
        var names = ["BB_test1"];
        var p1 = window.Zynga.Optimize.fetchOptimizeAssignments(names);
        p1.then(
        function(val) {
            PlatformFacade.ExperimentsLoaded = true;
            console.log("Fetching Experiments Success");

            var expVars = val["BB_test1"].variables;
            GameManager.TOTAL_TIME = expVars.time;
            BallManager.NUM_BONUS_BALLS_TIME = expVars.time_ball_count;
            Flags.DISABLE_LEADERBOARD = !expVars.leaderboard_toggle; //if leaderboard toggle is false, set DISABLE true
            
            PlatformFacade.startGameIfReady();
        })
        .catch(
        function(reason) {
            PlatformFacade.ExperimentsLoaded = true;
            console.log('Fetching Experiments Failed, Reason: ' + reason);
            GameManager.TOTAL_TIME = 45;
            BallManager.NUM_BONUS_BALLS_TIME = 5;
            Flags.DISABLE_LEADERBOARD = false;

            PlatformFacade.startGameIfReady();
        });
    }
    else
    {
        PlatformFacade.ExperimentsLoaded = true;
        PlatformFacade.startGameIfReady();
    }
};

PlatformFacade.startGameIfReady = function()
{
	if (PlatformFacade.currentPlatform === PlatformFacade.PLATFORM.FB_INSTANT)
	{
		if (PlatformFacade.FBInstantIntialized && PlatformFacade.GameLoaded && PlatformFacade.ExperimentsLoaded)
		{
			var logError = function(reason) { console.error("------ Handle rejected promise for FBInstant::startGameAsync() (" + reason + ")"); };
			
    		console.log("------ FBInstant::startGameAsync() resolved: Game starts here");
			window.FBInstant.startGameAsync().then(PlatformFacade.onGameStarted).catch(logError);
		}
	}
	else
	{
        PlatformFacade.onGameStarted();
	}
};

//Called from gameManager.js
PlatformFacade.onGameStateChanged = function (newGameState)
{
	if (newGameState == GameState.OVER)
	{
        var scoreManager = pc.app.root.findByName("GameManager").script.scoreManager;
		this.onGameEnded(scoreManager.getCurrentScore(), scoreManager.getHighScore());
	}
};

PlatformFacade.onGameStarted = function ()
{
    pc.app.fire("platformFacade:gameStarted");
};

PlatformFacade.onGameEnded = function (endScore, endHighScore)
{
    console.log("====== Game Ended. Score: " + endScore + ", HighScore: " + endHighScore);

    /*============= FB Instant =============*/
    if (PlatformFacade.currentPlatform === PlatformFacade.PLATFORM.FB_INSTANT)
    {
        // Sent final score to messenger leaderboard
        window.Zynga.Instant.setScore(endScore);
        
        window.Zynga.Instant.player.setDataAsync({highScore: endHighScore}).then( function ()
        { 
            console.log("Set data async highScore.");
        });
        
        console.log("------ FBInstant::setScore() : score - " + endScore);
    }
};

PlatformFacade.handleRestart = function ()
{
    /*============= FB Instant =============*/
    if (PlatformFacade.currentPlatform === PlatformFacade.PLATFORM.FB_INSTANT)
    {
        // Handle play again button pressed
        var success = function () { 
            console.log("------ FBInstant::endGameAsync() Resolved: Replay"); 
            PlatformFacade.onGameStarted();
        };
        var logError = function (error) { console.error("------ Handle rejected promise for FBInstant::endGameAsync() (" + error.toString() + ")"); };
        
        window.Zynga.Instant.endGameAsync().then(success).catch(logError);
    }
};

PlatformFacade.endGame = function ()
{
    /*============= FB Instant =============*/
    if (PlatformFacade.currentPlatform === PlatformFacade.PLATFORM.FB_INSTANT)
    {
        console.log("FBInstant End Game");
    	var failed = function (error)
        { 
            this.app.fire("platformFacade:postScreenshotComplete");
            console.error("------ Handle rejected promise for FBInstant::takeScreenshotAsync() (" + error.toString() + ")");
        };
        window.Zynga.Instant.takeScreenshotAsync().then(PlatformFacade.onScreenshotSent).catch(failed);
    }
};

PlatformFacade.onScreenshotSent = function()
{
	console.log("------ FBInstant::takeScreenshotAsync() Resolved: Screenshot taken!");
    pc.app.fire("platformFacade:postScreenshotComplete");
    PlatformFacade.handleRestart();
};

PlatformFacade.getGameID = function()
{
    return Stats.GAME_ID;
};

// This is self invoked before any other functions are called
(function init()
{
    if (window.Zynga)
    {
        window.Zynga.setAppId(PlatformFacade.getGameID()); // Initialize ZyngaFBInstant
    }
    
    Stats.init();
    PlatformFacade.init();
} ());
