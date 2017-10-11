var FontLibrary = pc.createScript("fontLibrary");
FontLibrary.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
FontLibrary.attributes.add("fontTeko", {
    type: "asset",
    assetType: "binary",
    title: "fontTeko"
}),
FontLibrary.attributes.add("fontTekoMedium", {
    type: "asset",
    assetType: "binary",
    title: "fontTekoMedium"
}),
FontLibrary.attributes.add("fontTekoBold", {
    type: "asset",
    assetType: "binary",
    title: "fontTekoBold"
}),
FontLibrary.attributes.add("fonttrsMillion", {
    type: "asset",
    assetType: "binary",
    title: "fonttrsMillion"
}),
FontLibrary.prototype.initialize = function() {
    var t = document.createElement("style");
    document.head.appendChild(t),
    this.fontCSS = this.css.resource.replace("assetTag_fontTeko", this.fontTeko.getFileUrl()),
    this.fontCSS = this.fontCSS.replace("assetTag_fontTekoMedium", this.fontTekoMedium.getFileUrl()),
    this.fontCSS = this.fontCSS.replace("assetTag_fontTekoBold", this.fontTekoBold.getFileUrl()),
    this.fontCSS = this.fontCSS.replace("assetTag_fonttrsMillion", this.fonttrsMillion.getFileUrl()),
    t.innerHTML = this.fontCSS
}
;
var InputManager = pc.createScript("inputManager"), inputLocations = [], NUM_INPUT_LOCATIONS = 5, startTime;
InputManager.prototype.initialize = function() {
    this.pos = new pc.Vec3,
    this.cameraEntity = this.app.root.findByName("Camera");
    var t = this.app.touch;
    t ? (t.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this),
    t.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this),
    t.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this),
    t.on(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this)) : (this.app.mouse.disableContextMenu(),
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this),
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this),
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this))
}
,
InputManager.prototype.onMouseDown = function(t) {
    t.button === pc.MOUSEBUTTON_LEFT && (inputLocations = [],
    startTime = Date.now(),
    this.addNewInputLocation(t.x, t.y))
}
,
InputManager.prototype.onMouseMove = function(t) {
    t.button === pc.MOUSEBUTTON_LEFT && this.addNewInputLocation(t.x, t.y)
}
,
InputManager.prototype.onMouseUp = function(t) {
    t.button === pc.MOUSEBUTTON_LEFT && (this.addNewInputLocation(t.x, t.y),
    this.swipeComplete())
}
,
InputManager.prototype.addNewInputLocation = function(t, o) {
    inputLocations.push(new pc.Vec2(t,o)),
    inputLocations > NUM_INPUT_LOCATIONS && inputLocations.shift()
}
,
InputManager.prototype.onTouchStart = function(t) {
    1 === t.touches.length && (inputLocations = [],
    startTime = Date.now(),
    this.addNewInputLocation(t.touches[0].x, t.touches[0].y))
}
,
InputManager.prototype.onTouchMove = function(t) {
    1 === t.touches.length && this.addNewInputLocation(t.touches[0].x, t.touches[0].y)
}
,
InputManager.prototype.onTouchEnd = function(t) {
    0 === t.touches.length && this.swipeComplete()
}
,
InputManager.prototype.onTouchCancel = function(t) {
    0 === t.touches.length
}
,
InputManager.prototype.swipeComplete = function() {
    for (var t = 0, o = 0, n = 1; n < inputLocations.length; n++)
        t += inputLocations[n].x - inputLocations[0].x,
        o += inputLocations[n].y - inputLocations[0].y;
    inputLocations.length > 1 && (t /= inputLocations.length - 1,
    o /= inputLocations.length - 1),
    o *= -1,
    this.raiseSwipeComplete(inputLocations[0].x, inputLocations[0].y, t, o, Math.abs(Date.now() - startTime))
}
,
InputManager.prototype.raiseSwipeComplete = function(t, o, n, e, i) {
    this.app.fire("inputManager:swipeComplete", t, o, n, e, i)
}
;
var camera, ballParent, BallManager = pc.createScript("ballManager");
BallManager.NUM_BONUS_BALLS_TIME = 5,
BallManager.attributes.add("bonusBallPts", {
    type: "asset",
    assetType: "material",
    title: "bonusBallPts"
}),
BallManager.attributes.add("bonusBallTime", {
    type: "asset",
    assetType: "material",
    title: "bonusBallTime"
}),
BallManager.prototype.initialize = function() {
    this.BONUS_BALL_BASE_CHANCE = 20,
    this.BONUS_BALL_TRANSLATING_CHANCE = 50,
    camera = this.app.root.findByName("MainCamera").camera;
    var a = this.app.root.findByName("Prefabs");
    this.ballPrefab = a.findByName("Basketball"),
    this.ballPrefabFire = a.findByName("Basketball_Fire"),
    this.ballPrefabGold = a.findByName("Basketball_Gold"),
    this.ballPrefabRainbow = a.findByName("Basketball_Rainbow"),
    this.ballPool = new EntityPool(this.ballPrefab,8),
    this.ballPoolFire = new EntityPool(this.ballPrefabFire,5),
    this.ballPoolGold = new EntityPool(this.ballPrefabGold,5),
    this.ballPoolRainbow = new EntityPool(this.ballPrefabRainbow,5),
    ballParent = new pc.Entity,
    ballParent.name = "Balls",
    camera.entity.addChild(ballParent),
    this.bonusPtsMaterial = this.bonusBallPts.resource,
    this.bonusTimeMaterial = this.bonusBallTime.resource,
    this.ballMaterial = this.ballPrefab.model.model.meshInstances[0].material,
    this.ballMaterialFire = this.ballPrefabFire.model.model.meshInstances[0].material,
    this.ballMaterialGold = this.ballPrefabGold.model.model.meshInstances[0].material,
    this.ballMaterialRainbow = this.ballPrefabRainbow.model.model.meshInstances[0].material,
    this.app.off("inputManager:swipeComplete"),
    this.app.on("inputManager:swipeComplete", this.onSwipeComplete, this),
    this.app.off("ball:shotMissed"),
    this.app.on("ball:shotMissed", this.onShotMissed, this),
    this.app.off("positionManager:positionChanged", this.onPositionChanged, this),
    this.app.on("positionManager:positionChanged", this.onPositionChanged, this),
    this.app.off("scoreManager:streakMultiplierChanged", this.onStreakMultiplierChanged, this),
    this.app.on("scoreManager:streakMultiplierChanged", this.onStreakMultiplierChanged, this),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this)
}
,
BallManager.prototype.onGameStateChanged = function(a) {
    a != GameState.MENU && a != GameState.FTUE || this.resetBalls()
}
,
BallManager.prototype.resetBalls = function() {
    this.nextBall && (this.nextBall.enabled = !1),
    this.streakLevel = 0,
    this.nextBonusType = BallBonusType.NONE,
    this.numBalls = 1,
    this.numBonusBallsPoints = 99999,
    this.numBonusBallsTime = BallManager.NUM_BONUS_BALLS_TIME,
    this.bonusBallChancePoints = this.BONUS_BALL_BASE_CHANCE,
    this.bonusBallChanceTime = 10,
    this.addZDist = 0,
    this.newBallInHand()
}
,
BallManager.prototype.update = function(a) {
    this.nextBall && (this.nextBallYPosition < 1 && (this.nextBallYPosition += 3 * a),
    this.nextBallYPosition > 1 && (this.nextBallYPosition = 1),
    this.updateBallInHandPosition())
}
,
BallManager.prototype.updateBallInHandPosition = function() {
    var a = camera.screenToWorld(0, 0, camera.nearClip);
    a.x += 3 * camera.entity.forward.x,
    a.y += -3 * camera.entity.up.y + this.nextBallYPosition,
    a.z += 3 * camera.entity.forward.z,
    this.nextBall.setPosition(a),
    this.nextBall.setLocalEulerAngles(camera.entity.getEulerAngles().y, 45, this.nextBallRotationZ)
}
,
BallManager.prototype.onSwipeComplete = function(a, e, t, l, i) {
    this.entity.script.gameManager.getGameState() != GameState.PLAYING && this.entity.script.gameManager.getGameState() != GameState.FTUE || this.shootBall(a, e, t, l, i)
}
,
BallManager.prototype.newBallInHand = function() {
    switch (this.streakLevel) {
    case 1:
        this.nextBall = this.ballPoolFire.next();
        break;
    case 2:
        this.nextBall = this.ballPoolGold.next();
        break;
    case 3:
        this.nextBall = this.ballPoolRainbow.next();
        break;
    default:
        this.nextBall = this.ballPool.next()
    }
    switch (this.nextBall.enabled = !0,
    this.nextBonusType) {
    case BallBonusType.NONE:
        switch (this.streakLevel) {
        case 1:
            this.nextBall.model.model.meshInstances[0].material = this.ballMaterialFire;
            break;
        case 2:
            this.nextBall.model.model.meshInstances[0].material = this.ballMaterialGold;
            break;
        case 3:
            this.nextBall.model.model.meshInstances[0].material = this.ballMaterialRainbow;
            break;
        default:
            this.nextBall.model.model.meshInstances[0].material = this.ballMaterial
        }
        break;
    case BallBonusType.POINTS:
        this.nextBall.model.model.meshInstances[0].material = this.bonusPtsMaterial;
        break;
    case BallBonusType.TIME:
        this.nextBall.model.model.meshInstances[0].material = this.bonusTimeMaterial
    }
    this.nextBall.collision.enabled = !1,
    this.nextBall.rigidbody.type = pc.BODYTYPE_KINEMATIC,
    this.nextBall.rigidbody.enabled = !1,
    this.nextBall.script.ball.enabled = !1,
    this.nextBall.reparent(this.app.root),
    this.nextBallYPosition = 0,
    this.nextBallRotationZ = pc.math.random(80, 100),
    this.updateBallInHandPosition(),
    this.nextBall.script.ball.initBall()
}
,
BallManager.prototype.shootBall = function(a, e, t, l, i) {
    if (!(0 > l)) {
        this.app.root.removeChild(this.nextBall),
        this.nextBall.rigidbody.type = pc.BODYTYPE_DYNAMIC;
        var s = this.nextBall;
        s.collision.enabled = !0,
        s.rigidbody.enabled = !0,
        s.script.ball.enabled = !0,
        s.script.ball.onShoot();
        var n = camera.screenToWorld(a, e, camera.nearClip);
        n.x += 2 * camera.entity.forward.x,
        n.z += 2 * camera.entity.forward.z,
        s.rigidbody.teleport(n, new pc.Vec3(0,0,pc.math.random(70, 110))),
        s.enabled = !0,
        ballParent.addChild(s),
        s.script.ball.setBallIndex(this.numBalls++),
        s.script.ball.setBallBonusType(this.nextBonusType),
        this.nextBonusType = this.getBallBonusType(),
        this.raiseNextBonusTypeChanged(),
        i = Math.min(i, 999);
        var o = 48 * t
          , r = Math.sqrt(16e5 * l);
        this.addZDist < 3.5 ? r > 12e3 && (r = 11e3 + Math.sqrt(r - 11e3)) : r > 13500 && (r = 12500 + Math.sqrt(r - 12500));
        var h = 10 * (1e3 - i);
        o *= .8,
        r *= 1.1,
        h *= .8 + .1 * this.addZDist;
        var B = new pc.Vec3
          , p = camera.entity.up.clone()
          , d = camera.entity.right.clone()
          , m = camera.entity.forward.clone();
        B.add(m.scale(h)),
        B.add(p.scale(r)),
        B.add(d.scale(o)),
        s.rigidbody.applyImpulse(B);
        var b = pc.math.random(0, (r + h) / 2 / 20)
          , c = pc.math.random(0, o / 10);
        s.rigidbody.applyTorqueImpulse(new pc.Vec3(b,c,0)),
        this.newBallInHand()
    }
}
,
BallManager.prototype.onShotMissed = function(a) {
    this.raiseFailedShot(a)
}
,
BallManager.prototype.raiseFailedShot = function(a) {
    this.app.fire("ballManager:failedShot", a)
}
,
BallManager.prototype.raiseNextBonusTypeChanged = function(a) {
    this.app.fire("ballManager:nextBonusTypeChanged", this.nextBonusType)
}
,
BallManager.prototype.getBallBonusType = function() {
    var a = pc.math.random(1, 101);
    return this.numBonusBallsPoints > 0 && a <= this.bonusBallChancePoints ? (this.numBonusBallsPoints--,
    BallBonusType.POINTS) : (a = pc.math.random(1, 101),
    this.numBonusBallsTime > 0 && a <= this.bonusBallChanceTime ? (this.numBonusBallsTime--,
    BallBonusType.TIME) : BallBonusType.NONE)
}
,
BallManager.prototype.onPositionChanged = function(a) {
    this.addZDist = a[2].length(),
    a[4] ? this.bonusBallChancePoints = this.BONUS_BALL_TRANSLATING_CHANCE : this.bonusBallChancePoints = this.BONUS_BALL_BASE_CHANCE
}
,
BallManager.prototype.onStreakMultiplierChanged = function(a, e) {
    this.streakLevel = e,
    this.app.root.removeChild(this.nextBall),
    this.nextBall.enabled = !1,
    this.newBallInHand()
}
;
var Goal = pc.createScript("goal");
Goal.prototype.initialize = function() {
    this.light = this.entity.findByName("Flash").light,
    this.entity.collision.on("triggerenter", this.onTriggerEnter, this)
}
,
Goal.prototype.onTriggerEnter = function(t) {
    t.script.ball.hasScored || (this.flashTime = 3,
    t.script.ball.setScored(!0),
    SoundManager.playSound(this.entity, "Goal", {
        pitch: {
            min: .8,
            max: 1
        }
    }),
    this.raiseGoalScored(t.script.ball))
}
,
Goal.prototype.raiseGoalScored = function(t) {
    this.app.fire("goal:scored", t)
}
,
Goal.prototype.update = function(t) {
    this.flashTime > 0 && (this.flashTime -= 15 * t,
    this.light.intensity = Math.max(0, this.flashTime))
}
;
var ScoreManager = pc.createScript("scoreManager");
ScoreManager.prototype.initialize = function() {
    this.allowScoring = !1,
    this.highScore = 0,
    this.BALL_BONUS_POINTS = 5,
    this.goalValue = 2,
    this.lastBallIndex = 0,
    this.streakThresholds = [3, 6, 10],
    this.streakMultipliers = [2, 5, 10],
    this.app.off("goal:scored", this.onScored, this),
    this.app.on("goal:scored", this.onScored, this),
    this.app.off("ballManager:failedShot", this.onFailedShot, this),
    this.app.on("ballManager:failedShot", this.onFailedShot, this),
    this.app.off("platformFacade:gameStarted", this.onGameStarted, this),
    this.app.on("platformFacade:gameStarted", this.onGameStarted, this),
    this.app.off("positionManager:positionChanged", this.onPositionChanged, this),
    this.app.on("positionManager:positionChanged", this.onPositionChanged, this),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this)
}
,
ScoreManager.prototype.onGameStateChanged = function(e) {
    e != GameState.MENU && e != GameState.FTUE || this.resetScore(),
    e == GameState.PLAYING ? this.allowScoring = !0 : this.allowScoring = !1
}
,
ScoreManager.prototype.onGameStarted = function() {
    this.refreshHighScore()
}
,
ScoreManager.prototype.refreshHighScore = function() {
    this.highScore = 0,
    this.raiseHighScoreChanged(),
    Zynga.Instant.player.getDataAsync(["highScore"]).then(function(e) {
        if (e.highScore) {
            var t = pc.app.root.findByName("GameManager").script.scoreManager;
            t.highScore = e.highScore,
            pc.app.fire("scoreManager:highScoreChanged", t.highScore)
        }
    })
}
,
ScoreManager.prototype.getStreakLevel = function() {
    for (var e = 0, t = 0; t < this.streakThresholds.length && this.streak >= this.streakThresholds[t]; t++)
        e = t + 1;
    return e
}
,
ScoreManager.prototype.getCurrentScore = function() {
    return this.score
}
,
ScoreManager.prototype.getHighScore = function() {
    return this.highScore
}
,
ScoreManager.prototype.resetScore = function() {
    this.goalValue = 2,
    this.score = 0,
    this.raiseScoreChanged(),
    this.streak = 0,
    this.raiseStreakChanged(),
    this.highestStreak = 0,
    this.currentMultiplier = 1,
    this.raiseStreakMultiplierChanged(),
    this.highestMultiplier = 1,
    this.goalsScored = 0
}
,
ScoreManager.prototype.onScored = function(e) {
    if (this.allowScoring) {
        this.goalsScored++;
        var t = 0;
        e.getBallBonusType() == BallBonusType.POINTS && (t = this.BALL_BONUS_POINTS),
        this.score += (this.goalValue + t) * this.currentMultiplier,
        this.raiseScoreChanged(),
        this.score > this.highScore && (this.highScore = this.score,
        this.raiseHighScoreChanged());
        var a = e.ballIndex
          , r = this.currentMultiplier
          , i = this.streak;
        if (a == this.lastBallIndex + 1 || 0 === this.streak) {
            this.streak++,
            this.streak > this.highestStreak && (this.highestStreak = this.streak);
            for (var s = 0; s < this.streakThresholds.length; s++)
                this.streak >= this.streakThresholds[s] && (this.currentMultiplier = this.streakMultipliers[s],
                this.currentMultiplier > this.highestMultiplier && (this.highestMultiplier = this.currentMultiplier))
        } else
            this.currentMultiplier = 1,
            this.streak = 1;
        if (this.streak != i && this.raiseStreakChanged(),
        this.currentMultiplier != r) {
            switch (this.getStreakLevel()) {
            case 1:
                SoundManager.playGlobalSound("AnnounceFire");
                break;
            case 2:
                SoundManager.playGlobalSound("AnnounceGold");
                break;
            case 3:
                SoundManager.playGlobalSound("AnnounceRainbow")
            }
            this.raiseStreakMultiplierChanged()
        }
        this.lastBallIndex = a
    }
}
,
ScoreManager.prototype.raiseScoreChanged = function() {
    this.app.fire("scoreManager:scoreChanged", this.score)
}
,
ScoreManager.prototype.raiseHighScoreChanged = function() {
    this.app.fire("scoreManager:highScoreChanged", this.highScore)
}
,
ScoreManager.prototype.raiseStreakMultiplierChanged = function() {
    this.app.fire("scoreManager:streakMultiplierChanged", this.currentMultiplier, this.getStreakLevel())
}
,
ScoreManager.prototype.raiseStreakChanged = function() {
    this.app.fire("scoreManager:streakChanged", this.streak)
}
,
ScoreManager.prototype.onFailedShot = function() {
    var e = 0 !== this.streak
      , t = 1 !== this.currentMultiplier;
    this.streak = 0,
    this.currentMultiplier = 1,
    e && this.raiseStreakChanged(),
    t && this.raiseStreakMultiplierChanged()
}
,
ScoreManager.prototype.onPositionChanged = function(e) {
    this.goalValue = e[5]
}
;
var Ball = pc.createScript("ball")
  , BallBonusType = {
    NONE: 1,
    POINTS: 2,
    TIME: 3
};
Ball.prototype.initBall = function() {
    this.bounceCount = 0,
    this.hitHoopCount = 0,
    this.hitBackboardCount = 0,
    this.lifeAfterBounce = 1,
    this.hasScored = !1,
    this.hasFailed = !1,
    this.ballBonusType = BallBonusType.NONE,
    this.entity.collision.off("collisionstart", this.onCollisionStart, this),
    this.entity.collision.on("collisionstart", this.onCollisionStart, this),
    SoundManager.playSound(this.entity, "Loop", {
        allowMissing: !0
    })
}
,
Ball.prototype.onShoot = function() {
    SoundManager.playSound(this.entity, "Shoot", {
        pitch: {
            min: .75,
            max: 1
        }
    })
}
,
Ball.prototype.update = function(t) {
    this.bounceCount > 0 ? (this.lifeAfterBounce -= t,
    this.lifeAfterBounce <= 0 && (this.entity.enabled = !1)) : this.hasFailed || this.hasScored || this.entity.rigidbody.linearVelocity.y < -.01 && this.entity.position.y < 4.5 && this.failShot()
}
,
Ball.prototype.getBallIndex = function() {
    return this.ballIndex
}
,
Ball.prototype.setBallIndex = function(t) {
    this.ballIndex = t
}
,
Ball.prototype.getBallBonusType = function() {
    return this.ballBonusType
}
,
Ball.prototype.setBallBonusType = function(t) {
    this.ballBonusType = t
}
,
Ball.prototype.setScored = function(t) {
    this.hasScored = t
}
,
Ball.prototype.onCollisionStart = function(t) {
    "Backboard" != t.other.name && "Stand" != t.other.name || (this.hitBackboardCount += 1,
    1 == this.hitBackboardCount ? SoundManager.playSound(this.entity, "HitBackboard", {
        pitch: {
            min: .95,
            max: 1
        }
    }) : this.hitBackboardCount < 4 && SoundManager.playSound(this.entity, "HitBackboard", {
        perPlayFalloff: .5
    })),
    "Hoop" == t.other.name && (this.hitHoopCount += 1,
    1 == this.hitHoopCount ? SoundManager.playSound(this.entity, "HitHoop", {
        pitch: {
            min: .95,
            max: 1
        }
    }) : this.hitHoopCount < 4 && SoundManager.playSound(this.entity, "HitHoop", {
        perPlayFalloff: .5
    })),
    "Ground" == t.other.name && (this.bounceCount += 1,
    1 == this.bounceCount ? SoundManager.playSound(this.entity, "HitFloor", {
        pitch: {
            min: .95,
            max: 1
        }
    }) : this.bounceCount < 4 && SoundManager.playSound(this.entity, "HitFloor", {
        perPlayFalloff: .5
    })),
    this.hasScored || this.hasFailed || "Ground" == t.other.name && this.failShot()
}
,
Ball.prototype.failShot = function() {
    this.hasFailed = !0,
    console.log("Shot failed"),
    this.app.fire("ball:shotMissed", this.ballIndex)
}
;
var GameManager = pc.createScript("gameManager");
GameManager.TOTAL_TIME = 15;
var GameState = {
    LOAD: 1,
    MENU: 2,
    FTUE: 3,
    COUNTDOWN: 4,
    PLAYING: 5,
    OVER: 6
};
GameManager.prototype.initialize = function() {
    this.loadComplete = !1,
    this.ftueComplete = !1,
    this.skipFtueState = !0,
    this.COUNTDOWN_TIME = 3,
    this.BONUS_TIME = 3,
    this.resetGameVariables(),
    this.app.off("platformFacade:gameStarted", this.onGameStarted, this),
    this.app.on("platformFacade:gameStarted", this.onGameStarted, this),
    this.app.off("goal:scored", this.onScored, this),
    this.app.on("goal:scored", this.onScored, this),
    this.app.off("teamView:teamConfirmed", this.onTeamConfirmed, this),
    this.app.on("teamView:teamConfirmed", this.onTeamConfirmed, this),
    this.app.off("leaderboardView:teamConfirmed", this.onTeamConfirmed, this),
    this.app.on("leaderboardView:teamConfirmed", this.onTeamConfirmed, this),
    this.app.off("ftueManager:ftueRefreshed", this.onFtueRefreshed, this),
    this.app.on("ftueManager:ftueRefreshed", this.onFtueRefreshed, this),
    this.app.off("ftueManager:ftueCompleted", this.onFtueCompleted, this),
    this.app.on("ftueManager:ftueCompleted", this.onFtueCompleted, this)
}
,
GameManager.prototype.postInitialize = function() {
    PlatformFacade.currentPlatform != PlatformFacade.PLATFORM.FB_INSTANT && this.onGameStarted()
}
,
GameManager.prototype.onGameStarted = function() {
    console.log("Game Started, change game state to Load"),
    this.changeGameState(GameState.LOAD)
}
,
GameManager.prototype.onScored = function(e) {
    this.FTUEPassed = !0,
    e.getBallBonusType() == BallBonusType.TIME && (this.timer += this.BONUS_TIME,
    this.earnedBonusTime += this.BONUS_TIME)
}
,
GameManager.prototype.onTeamConfirmed = function(e) {
    Stats.log(Stats.COUNTER_ROUND_START, "", "", "", "", "", ""),
    this.startGame()
}
,
GameManager.prototype.onFtueRefreshed = function(e) {
    this.loadComplete = !0,
    this.skipFtueState = e
}
,
GameManager.prototype.onFtueCompleted = function() {
    this.ftueComplete = !0
}
,
GameManager.prototype.resetGameVariables = function() {
    this.countdownTimer = this.COUNTDOWN_TIME,
    this.roundedCountdownTime = 0,
    this.timer = GameManager.TOTAL_TIME,
    this.roundedTime = Math.round(GameManager.TOTAL_TIME),
    this.earnedBonusTime = 0,
    this.raiseTimerUpdated()
}
,
GameManager.prototype.startGame = function() {
    this.resetGameVariables(),
    this.changeGameState(GameState.COUNTDOWN)
}
,
GameManager.prototype.endGame = function() {
    var e = this.app.root.findByName("GameManager").script
      , t = e.scoreManager
      , a = t.score >= t.highScore ? "y" : "n";
    Stats.log(Stats.COUNTER_GAME_END_DETAILS, t.score, a, GameManager.TOTAL_TIME + this.earnedBonusTime, t.highestMultiplier, "", ""),
    this.changeGameState(GameState.OVER)
}
,
GameManager.prototype.getGameState = function() {
    return this.gameState
}
,
GameManager.prototype.changeGameState = function(e) {
    console.log("Game State Changed: " + e),
    this.gameState = e,
    this.raiseGameStateChanged()
}
,
GameManager.prototype.raiseGameStateChanged = function() {
    this.app.fire("gameManager:gameStateChanged", this.gameState),
    PlatformFacade.onGameStateChanged(this.gameState)
}
,
GameManager.prototype.update = function(e) {
    switch (this.gameState) {
    case GameState.LOAD:
        if (!this.loadComplete)
            return;
        if (!this.skipFtueState)
            return console.log("Game Started, change game state to FTUE"),
            void this.changeGameState(GameState.FTUE);
        console.log("Game Started, change game state to MENU"),
        this.changeGameState(GameState.MENU);
        break;
    case GameState.FTUE:
        this.ftueComplete && this.changeGameState(GameState.PLAYING);
        break;
    case GameState.COUNTDOWN:
        var t = this.roundedCountdownTime;
        this.countdownTimer -= e,
        this.roundedCountdownTime = Math.ceil(this.countdownTimer),
        t != this.roundedCountdownTime && (t = this.roundedCountdownTime,
        t > 0 && SoundManager.playGlobalSound("CountdownStart"),
        this.app.fire("gameManager:countdownUpdated", this.roundedCountdownTime)),
        0 >= t && (this.changeGameState(GameState.PLAYING),
        SoundManager.playGlobalSound("StartGame"));
        break;
    case GameState.PLAYING:
        var a = this.roundedTime;
        if (this.timer -= e,
        this.roundedTime = Math.floor(this.timer),
        a != this.roundedTime) {
            if (a = this.roundedTime,
            4 > a)
                switch (a) {
                case 3:
                    SoundManager.playGlobalSound("TimeRunningOut_3");
                    break;
                case 2:
                    SoundManager.playGlobalSound("TimeRunningOut_2");
                    break;
                case 1:
                    SoundManager.playGlobalSound("TimeRunningOut_1")
                }
            this.raiseTimerUpdated()
        }
        0 >= a && (SoundManager.playGlobalSound("TimeUp"),
        this.endGame())
    }
}
,
GameManager.prototype.raiseTimerUpdated = function() {
    this.app.fire("gameManager:timerUpdated", this.roundedTime)
}
;
var PositionManager = pc.createScript("positionManager");
PositionManager.prototype.initialize = function() {
    this.positionList = [[0, 1, new pc.Vec3(0,3,0), new pc.Vec3(0,3,0), !1, 2], [30, 1, new pc.Vec3(0,3,0), new pc.Vec3(3.5,3,0), !1, 2], [120, 1, new pc.Vec3(3.5,3,0), new pc.Vec3(0,3,3.5), !1, 3], [200, 1, new pc.Vec3(0,3,3.5), new pc.Vec3(7,3,2), !0, 3]],
    this.resetPositionManager(),
    this.app.off("scoreManager:scoreChanged", this.onScoreChanged, this),
    this.app.on("scoreManager:scoreChanged", this.onScoreChanged, this),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this)
}
,
PositionManager.prototype.onGameStateChanged = function(i) {
    i != GameState.MENU && i != GameState.FTUE || this.resetPositionManager()
}
,
PositionManager.prototype.resetPositionManager = function() {
    this.positionIndex = 0,
    this.pingPong = !1,
    this.positionProgress = 0,
    this.returning = !1,
    this.targetIndex = 0
}
,
PositionManager.prototype.postInitialize = function() {
    this.changePositionIndex(0)
}
,
PositionManager.prototype.update = function(i) {
    if (this.camera = pc.app.root.findByName("MainCamera"),
    this.cameraTarget = pc.app.root.findByName("CameraTarget"),
    this.camera) {
        if (this.positionList[this.positionIndex][2] == this.positionList[this.positionIndex][3])
            return void (this.positionIndex < this.targetIndex && this.changePositionIndex(this.targetIndex));
        this.positionProgress += i * this.positionList[this.positionIndex][1],
        this.positionProgress >= 1 && (this.positionProgress = 1);
        var t = new pc.Vec3;
        this.returning ? t.lerp(this.positionList[this.positionIndex][3], this.positionList[this.positionIndex][2], this.positionProgress) : t.lerp(this.positionList[this.positionIndex][2], this.positionList[this.positionIndex][3], this.positionProgress),
        this.positionProgress >= 1 && (this.pingPong && (this.positionProgress = 0,
        this.returning = !this.returning),
        !this.returning && this.positionIndex < this.targetIndex && (this.positionProgress = 0,
        this.changePositionIndex(this.targetIndex))),
        this.camera.setPosition(t),
        this.camera.lookAt(this.cameraTarget.getPosition())
    }
}
,
PositionManager.prototype.onScoreChanged = function(i) {
    for (var t = 0; t < this.positionList.length && i >= this.positionList[t][0]; t++)
        this.targetIndex = t
}
,
PositionManager.prototype.changePositionIndex = function(i) {
    this.positionIndex = i,
    this.app.fire("positionManager:positionChanged", this.positionList[this.positionIndex]);
    var t = this.app.root.findByName("GameManager").script
      , o = t.gameManager
      , s = t.ballManager
      , e = t.scoreManager;
    Stats.log(Stats.COUNTER_POSITION_END, this.positionIndex + 1, Math.ceil(o.timer), s.numBalls, e.goalsScored, e.highestStreak, "")
}
;
var LeaderboardManager = pc.createScript("leaderboardManager");
LeaderboardManager.prototype.initialize = function() {
    this.teamName = "",
    this.periodNumber = 0,
    this.app.off("platformFacade:gameStarted", this.onGameStarted, this),
    this.app.on("platformFacade:gameStarted", this.onGameStarted, this),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.off("teamManager:teamConfirmed", this.onTeamConfirmed, this),
    this.app.on("teamManager:teamConfirmed", this.onTeamConfirmed, this),
    this.app.off("teamManager:previousTeamChanged", this.onPreviousTeamChanged, this),
    this.app.on("teamManager:previousTeamChanged", this.onPreviousTeamChanged, this)
}
,
LeaderboardManager.prototype.postInitialize = function() {
    PlatformFacade.currentPlatform != PlatformFacade.PLATFORM.FB_INSTANT && (this.fakeLeaderboardTopThree(),
    this.fakeLeaderboard(),
    this.fakeWinners())
}
,
LeaderboardManager.prototype.fakeLeaderboardTopThree = function() {
    this.onGetScores([{
        rank: 0,
        id: "UCLA",
        score: 125e3
    }, {
        rank: 1,
        id: "UK",
        score: 75e3
    }, {
        rank: 2,
        id: "IND",
        score: 45e3
    }], !0, 0)
}
,
LeaderboardManager.prototype.fakeLeaderboard = function() {
    this.onGetScores([{
        rank: 3,
        id: "WIS",
        score: 3e4
    }, {
        rank: 4,
        id: "TLSA",
        score: 25e3
    }, {
        rank: 5,
        id: "DUKE",
        score: 2e4
    }, {
        rank: 6,
        id: "CIN",
        score: 15e3
    }, {
        rank: 7,
        id: "UNC",
        score: 1e4
    }, {
        rank: 8,
        id: "MICH",
        score: 6e3
    }, {
        rank: 9,
        id: "CAL",
        score: 4e3
    }], !1, 0)
}
,
LeaderboardManager.prototype.fakeWinners = function() {
    this.onGetScores([{
        rank: 0,
        id: "L_UCLA",
        score: 125e3
    }, {
        rank: 1,
        id: "L_UK",
        score: 75e3
    }, {
        rank: 2,
        id: "L_IND",
        score: 45e3
    }, {
        rank: 3,
        id: "L_WIS",
        score: 3e4
    }, {
        rank: 4,
        id: "L_TLSA",
        score: 25e3
    }, {
        rank: 5,
        id: "L_DUKE",
        score: 2e4
    }, {
        rank: 6,
        id: "L_CIN",
        score: 15e3
    }, {
        rank: 7,
        id: "L_UNC",
        score: 1e4
    }, {
        rank: 8,
        id: "L_MICH",
        score: 6e3
    }, {
        rank: 9,
        id: "L_CAL",
        score: 4e3
    }], !1, 1)
}
,
LeaderboardManager.prototype.onGetScores = function(e, a, r) {
    var o = e
      , t = 468421;
    if (e.data && (o = e.data["weekly---test"],
    o[this.teamName] && (o = o[this.teamName]),
    t = e.data.metadata["weekly---test"].time_left,
    0 === this.periodNumber && (this.periodNumber = e.data.metadata["weekly---test"].period_number + r,
    this.app.fire("leaderboardManager:leaderboardPeriodNumberUpdated", this.periodNumber))),
    r > 0) {
        for (var n = [], s = 0; s < o.length; s++)
            n[s] = [o[s].rank, o[s].id, o[s].score];
        return void this.app.fire("leaderboardManager:leaderboardPeriodUpdated", n, r)
    }
    if (a) {
        this.topThreeRecords = [];
        for (var d = 0; d < o.length; d++)
            this.topThreeRecords[d] = [o[d].rank, o[d].id, o[d].score]
    } else {
        this.leaderboardRecords = [];
        for (var i = 0; i < o.length; i++)
            this.leaderboardRecords[i] = [o[i].rank, o[i].id, o[i].score]
    }
    var c = [];
    if (this.topThreeRecords && this.topThreeRecords.length > 0 && this.leaderboardRecords && this.leaderboardRecords.length > 0) {
        c = this.topThreeRecords.concat();
        for (var p = 0; p < this.leaderboardRecords.length; p++) {
            for (var g = !0, h = 0; h < this.topThreeRecords.length; h++)
                if (this.leaderboardRecords[p][0] == this.topThreeRecords[h][0]) {
                    g = !1;
                    break
                }
            g && c.push(this.leaderboardRecords[p])
        }
    } else
        c = this.topThreeRecords && this.topThreeRecords.length > 0 ? this.topThreeRecords : this.leaderboardRecords;
    this.app.fire("leaderboardManager:leaderboardUpdated", c, t)
}
,
LeaderboardManager.prototype.onGetTopThreeSuccess = function(e) {
    var a = this.app || pc.app
      , r = a.root.findByName("GameManager").script.leaderboardManager;
    r.onGetScores(e, !0, 0)
}
,
LeaderboardManager.prototype.onGetScoresSuccess = function(e) {
    var a = this.app || pc.app
      , r = a.root.findByName("GameManager").script.leaderboardManager;
    r.onGetScores(e, !1, 0)
}
,
LeaderboardManager.prototype.onGetTopScoresLastPeriodSuccess = function(e) {
    var a = this.app || pc.app
      , r = a.root.findByName("GameManager").script.leaderboardManager;
    r.onGetScores(e, !1, 1)
}
,
LeaderboardManager.prototype.onGetScoresFailed = function() {
    var e = this.app || pc.app
      , a = e.root.findByName("GameManager").script.leaderboardManager;
    console.log("failed to get leaderboard scores, faking leaderboard scores"),
    a.fakeLeaderboard()
}
,
LeaderboardManager.prototype.onGetTopThreeFailed = function() {
    var e = this.app || pc.app
      , a = e.root.findByName("GameManager").script.leaderboardManager;
    console.log("failed to get top three leaderboard scores, faking top 3"),
    a.fakeLeaderboardTopThree()
}
,
LeaderboardManager.prototype.onGetScoresAroundFailed = function() {
    var e = this.app || pc.app
      , a = e.root.findByName("GameManager").script.leaderboardManager;
    console.log("failed to get leaderboard scores around ID: " + a.teamName),
    console.log("Getting top scores..."),
    Zynga.Leaderboard.getTopScores("weekly---test", a.onGetScoresSuccess, a.onGetScoresFailed)
}
,
LeaderboardManager.prototype.onGetTopScoresLastPeriodFailed = function() {
    var e = this.app || pc.app
      , a = e.root.findByName("GameManager").script.leaderboardManager;
    console.log("failed to get top scores from last period, faking last period scores"),
    a.fakeLeaderboardWinners()
}
,
LeaderboardManager.prototype.onGameStarted = function() {
    var e = this.app || pc.app
      , a = e.root.findByName("GameManager").script.leaderboardManager;
    console.log("Getting top three scores..."),
    Zynga.Leaderboard.getTopThree("weekly---test", a.onGetTopThreeSuccess, a.onGetTopThreeFailed),
    Zynga.Leaderboard.getTopScoresLastPeriod("weekly---test", a.onGetTopScoresLastPeriodSuccess, a.onGetTopScoresLastPeriodFailed)
}
,
LeaderboardManager.prototype.onGameStateChanged = function(e) {
    if (e == GameState.OVER && PlatformFacade.currentPlatform == PlatformFacade.PLATFORM.FB_INSTANT) {
        var a = this.app.root.findByName("GameManager").script
          , r = a.teamManager.getTeamId()
          , o = a.scoreManager.getCurrentScore();
        console.log("Incrementing score: " + o + " for team: " + r),
        Zynga.Leaderboard.incrementScore(r, "weekly---test", o, this.onIncrementScoreSuccess, this.onIncrementScoreFailed)
    }
}
,
LeaderboardManager.prototype.onIncrementScoreSuccess = function() {
    var e = this.app || pc.app
      , a = e.root.findByName("GameManager").script.leaderboardManager;
    console.log("Increment score success"),
    console.log("Getting top three scores..."),
    Zynga.Leaderboard.getTopThree("weekly---test", a.onGetTopThreeSuccess, a.onGetTopThreeFailed),
    console.log("Getting scores around: " + a.teamName),
    Zynga.Leaderboard.getScoresAround(a.teamName, "weekly---test", a.onGetScoresSuccess, a.onGetScoresAroundFailed)
}
,
LeaderboardManager.prototype.onIncrementScoreFailed = function() {
    var e = this.app || pc.app
      , a = e.root.findByName("GameManager").script.leaderboardManager;
    console.log("Increment score failed"),
    console.log("Getting top three scores..."),
    Zynga.Leaderboard.getTopThree("weekly---test", a.onGetTopThreeSuccess, a.onGetTopThreeFailed),
    console.log("Getting scores around: " + a.teamName),
    Zynga.Leaderboard.getScoresAround(a.teamName, "weekly---test", a.onGetScoresSuccess, a.onGetScoresAroundFailed)
}
,
LeaderboardManager.prototype.onTeamConfirmed = function(e) {
    PlatformFacade.currentPlatform == PlatformFacade.PLATFORM.FB_INSTANT && (this.teamName = e,
    console.log("Getting scores around: " + this.teamName),
    Zynga.Leaderboard.getScoresAround(this.teamName, "weekly---test", this.onGetScoresSuccess, this.onGetScoresAroundFailed))
}
,
LeaderboardManager.prototype.onPreviousTeamChanged = function(e) {
    this.teamName = e,
    PlatformFacade.currentPlatform == PlatformFacade.PLATFORM.FB_INSTANT && ("" !== this.teamName ? (console.log("Getting scores around: " + this.teamName),
    Zynga.Leaderboard.getScoresAround(this.teamName, "weekly---test", this.onGetScoresSuccess, this.onGetScoresAroundFailed)) : (console.log("Getting top scores..."),
    Zynga.Leaderboard.getTopScores("weekly---test", this.onGetScoresSuccess, this.onGetScoresFailed)))
}
;
var TeamManager = pc.createScript("teamManager");
TeamManager.prototype.initialize = function() {
    this.team = "",
    this.app.off("platformFacade:gameStarted", this.onGameStarted, this),
    this.app.on("platformFacade:gameStarted", this.onGameStarted, this),
    this.app.off("leaderboardManager:leaderboardUpdated", this.onLeaderboardUpdated, this),
    this.app.on("leaderboardManager:leaderboardUpdated", this.onLeaderboardUpdated, this),
    this.app.off("teamView:teamConfirmed", this.onTeamConfirmed, this),
    this.app.on("teamView:teamConfirmed", this.onTeamConfirmed, this),
    this.app.off("leaderboardView:teamConfirmed", this.onTeamConfirmed, this),
    this.app.on("leaderboardView:teamConfirmed", this.onTeamConfirmed, this),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this)
}
,
TeamManager.prototype.postInitialize = function() {
    PlatformFacade.currentPlatform !== PlatformFacade.PLATFORM.FB_INSTANT && (this.team = "",
    this.raisePreviousTeamChanged())
}
,
TeamManager.prototype.onGameStateChanged = function(a) {
    PlatformFacade.currentPlatform === PlatformFacade.PLATFORM.FB_INSTANT && a == GameState.PLAYING && window.Zynga.Instant.player.setDataAsync({
        previousTeam: this.getTeamId()
    }).then(function() {
        console.log("Set data async previousTeam: " + this.getTeamId())
    })
}
,
TeamManager.prototype.onGameStarted = function() {
    this.refreshPreviousTeam()
}
,
TeamManager.prototype.refreshPreviousTeam = function() {
    Zynga.Instant.player.getDataAsync(["previousTeam"]).then(function(a) {
        var e = this.app || pc.app
          , t = e.root.findByName("GameManager").script.teamManager;
        a.previousTeam ? t.team = a.previousTeam.toUpperCase() : t.team = "",
        t.raisePreviousTeamChanged()
    })
}
,
TeamManager.prototype.onLeaderboardUpdated = function(a) {
    var e = this.app || pc.app
      , t = e.root.findByName("GameManager").script.teamManager;
    if (t.teamList = a,
    t.teamList)
        for (var r = 0; r < t.teamList.length; r++)
            if ("" === t.team && 2 == t.teamList[r][0] && (t.team = t.teamList[r][1],
            t.raisePreviousTeamChanged()),
            t.team == t.teamList[r][1]) {
                t.teamData = t.teamList[r],
                t.raiseSelectedTeamDataUpdated();
                break
            }
    t.raiseTeamListUpdated()
}
,
TeamManager.prototype.getTeamId = function() {
    return this.team
}
,
TeamManager.prototype.raiseTeamListUpdated = function() {
    this.app.fire("teamManager:teamListUpdated", this.teamList)
}
,
TeamManager.prototype.onTeamConfirmed = function(a) {
    this.team = a,
    this.raiseTeamConfirmed()
}
,
TeamManager.prototype.raisePreviousTeamChanged = function() {
    this.app.fire("teamManager:previousTeamChanged", this.team)
}
,
TeamManager.prototype.raiseTeamConfirmed = function() {
    this.app.fire("teamManager:teamConfirmed", this.team)
}
,
TeamManager.prototype.raiseSelectedTeamDataUpdated = function() {
    this.app.fire("teamManager:selectedTeamDataUpdated", this.teamData)
}
;
var LeaderboardView = pc.createScript("leaderboardView");
LeaderboardView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
LeaderboardView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
LeaderboardView.attributes.add("htmlNoLeader", {
    type: "asset",
    assetType: "html",
    title: "HTML No Leader Asset"
}),
LeaderboardView.attributes.add("backgroundLarge", {
    type: "asset",
    assetType: "texture",
    title: "backgroundLarge"
}),
LeaderboardView.attributes.add("backgroundTopThree", {
    type: "asset",
    assetType: "texture",
    title: "backgroundTopThree"
}),
LeaderboardView.attributes.add("rankContainer", {
    type: "asset",
    assetType: "texture",
    title: "rankContainer"
}),
LeaderboardView.attributes.add("rankSelected", {
    type: "asset",
    assetType: "texture",
    title: "rankSelected"
}),
LeaderboardView.attributes.add("buttonFullSize", {
    type: "asset",
    assetType: "texture",
    title: "buttonFullSize"
}),
LeaderboardView.attributes.add("buttonSub", {
    type: "asset",
    assetType: "texture",
    title: "buttonSub"
}),
LeaderboardView.attributes.add("trophyFirst", {
    type: "asset",
    assetType: "texture",
    title: "trophyFirst"
}),
LeaderboardView.attributes.add("trophySecond", {
    type: "asset",
    assetType: "texture",
    title: "trophySecond"
}),
LeaderboardView.attributes.add("trophyThird", {
    type: "asset",
    assetType: "texture",
    title: "trophyThird"
}),
LeaderboardView.prototype.initialize = function() {
    this.timeLeft = 0,
    this.team = "Loading...",
    this.previousTeam = "",
    this.TRANSITION_TIME = .25;
    var e = document.createElement("style");
    document.head.appendChild(e),
    document.body.classList.add("fixedBody");
    var t = this.css.resource.replace(/assetTag_backgroundLarge/g, this.backgroundLarge.getFileUrl());
    t = t.replace(/assetTag_backgroundTopThree/g, this.backgroundTopThree.getFileUrl()),
    t = t.replace(/assetTag_rankContainer/g, this.rankContainer.getFileUrl()),
    t = t.replace(/assetTag_rankSelected/g, this.rankSelected.getFileUrl()),
    t = t.replace(/assetTag_buttonFullSize/g, this.buttonFullSize.getFileUrl()),
    t = t.replace(/assetTag_buttonSub/g, this.buttonSub.getFileUrl()),
    t = t.replace(/assetTag_trophyFirst/g, this.trophyFirst.getFileUrl()),
    t = t.replace(/assetTag_trophySecond/g, this.trophySecond.getFileUrl()),
    t = t.replace(/assetTag_trophyThird/g, this.trophyThird.getFileUrl()),
    e.innerHTML = t,
    this.div = document.createElement("div"),
    this.div.classList.add("leaderboard"),
    this.div.innerHTML = this.html.resource || "",
    document.body.appendChild(this.div),
    this.displayType = this.div.style.display,
    this.div2 = document.createElement("div"),
    this.div2.classList.add("leaderboard2"),
    this.div2.innerHTML = this.htmlNoLeader.resource || "",
    document.body.appendChild(this.div2),
    this.timeLeftLabel = this.div.querySelector(".leaderboardListLabel"),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.off("leaderboardManager:leaderboardUpdated", this.onLeaderboardUpdated, this),
    this.app.on("leaderboardManager:leaderboardUpdated", this.onLeaderboardUpdated, this),
    this.app.off("teamManager:previousTeamChanged", this.onPreviousTeamChanged, this),
    this.app.on("teamManager:previousTeamChanged", this.onPreviousTeamChanged, this),
    this.hide()
}
,
LeaderboardView.prototype.onGameStateChanged = function(e) {
    e == GameState.MENU && (this.show(),
    Flags.DISABLE_LEADERBOARD && this.onShowNoLeaderboard())
}
,
LeaderboardView.prototype.onShowNoLeaderboard = function() {
    var e = this.div2.querySelector(".leaderboard2");
    e ? this.playAsButton2 || (this.playAsButton2 = document.createElement("div"),
    this.playAsButton2.classList.add("leaderboardPlayAsButton2"),
    e.appendChild(this.playAsButton2),
    this.playAsButton2.addEventListener("click", this.onPlayAsClicked, !1),
    this.playAsButton2.textContent = "Play") : console.error("No team container, can't add play button.")
}
,
LeaderboardView.prototype.update = function(e) {
    if (this.doTransition(e),
    this.timeLeft > 0 && (this.timeLeft -= e,
    this.timeLeft < 0 && (this.timeLeft = 0),
    this.timeLeftLabel)) {
        var t = Math.ceil(this.timeLeft)
          , a = Math.floor(t / 86400);
        t -= 86400 * a;
        var i = "0" + Math.floor(t / 3600) % 24;
        t -= 3600 * i;
        var s = "0" + Math.floor(t / 60) % 60;
        t -= 60 * s;
        var r = "0" + t % 60
          , d = a + ":" + i.substr(-2) + ":" + s.substr(-2) + ":" + r.substr(-2);
        this.timeLeftLabel.textContent = "Resets in " + d
    }
}
,
LeaderboardView.prototype.doTransition = function(e) {
    if (this.transitionTime > 0) {
        this.transitionTime -= e,
        this.transitionTime < 0 && (this.transitionTime = 0);
        var t = (this.TRANSITION_TIME - this.transitionTime) / this.TRANSITION_TIME
          , a = 0;
        a = "in" == this.transitionState ? pc.math.lerp(150, -50, t) : pc.math.lerp(-50, -200, t),
        this.div.style.transform = "translate3d(" + a + "%, -25%, 0)"
    }
}
,
LeaderboardView.prototype.highlightTeam = function() {
    if (this.ul) {
        for (var e = this.div.getElementsByTagName("li"), t = 0; t < e.length; t++)
            e[t].id != this.team && (e[t].className = "leaderboardListItem");
        if (this.playAsButton)
            if ("" !== this.team) {
                this.playAsButton.textContent = "Play as " + this.team,
                this.playAsButton.style.display = this.buttonStyle;
                var a = document.getElementById("leaderboard_" + this.team);
                a && (a.className = "leaderboardListItemSelected",
                "false" == a.getAttribute("top3") && (this.ul.scrollTop = a.offsetTop - 50))
            } else
                this.playAsButton.style.display = "none"
    }
}
,
LeaderboardView.prototype.onPreviousTeamChanged = function(e) {
    this.previousTeam = e,
    this.onTeamChanged(e)
}
,
LeaderboardView.prototype.onTeamChanged = function(e) {
    this.team = e,
    this.highlightTeam()
}
,
LeaderboardView.prototype.onLeaderboardUpdated = function(e, t) {
    if (!e)
        return void this.onSelectTeamClicked();
    this.timeLeft = t;
    var a = this.div.querySelector(".leaderboard");
    if (a) {
        this.ulTopThree ? this.ulTopThree.innerHTML = "" : (this.ulTopThree = document.createElement("ul"),
        this.ulTopThree.classList.add("leaderboardListTopThree"),
        a.appendChild(this.ulTopThree)),
        this.ul ? this.ul.innerHTML = "" : (this.ul = document.createElement("ul"),
        this.ul.classList.add("leaderboardList"),
        a.appendChild(this.ul));
        for (var i = 0; i < e.length; i++) {
            var s = document.createElement("li");
            s.setAttribute("id", "leaderboard_" + e[i][1]),
            e[i][1] == this.previousTeam ? s.classList.add("leaderboardListItemSelected") : s.classList.add("leaderboardListItem");
            var r = document.createElement("span")
              , d = e[i][0] + 1;
            if (4 > d) {
                switch (d) {
                case 1:
                    r.classList.add("leaderboardListItemRank1");
                    break;
                case 2:
                    r.classList.add("leaderboardListItemRank2");
                    break;
                case 3:
                    r.classList.add("leaderboardListItemRank3")
                }
                s.setAttribute("top3", "true")
            } else
                s.setAttribute("top3", "false"),
                r.textContent = d + ".",
                r.classList.add("leaderboardListItemRank");
            s.appendChild(r);
            var o = document.createElement("span");
            o.textContent = e[i][1],
            4 > d ? o.classList.add("leaderboardListItemNameWithTrophy") : o.classList.add("leaderboardListItemName"),
            s.appendChild(o);
            var n = document.createElement("span");
            n.textContent = LeaderboardView.formatScore(e[i][2]),
            n.classList.add("leaderboardListItemScore"),
            s.appendChild(n);
            var l = e[i][1];
            s.addEventListener("click", this.onTeamClicked(l), !1),
            4 > d ? this.ulTopThree.appendChild(s) : this.ul.appendChild(s)
        }
        this.playAsButton || (this.playAsButton = document.createElement("div"),
        this.playAsButton.classList.add("leaderboardPlayAsButton"),
        a.appendChild(this.playAsButton),
        this.playAsButton.addEventListener("click", this.onPlayAsClicked, !1)),
        this.buttonStyle = this.playAsButton.style.display,
        this.highlightTeam(),
        this.selectTeamButton || (this.selectTeamButton = document.createElement("div"),
        this.selectTeamButton.classList.add("leaderboardSelectTeamButton"),
        this.selectTeamButton.textContent = "Choose Another Team",
        a.appendChild(this.selectTeamButton),
        this.selectTeamButton.addEventListener("click", this.onSelectTeamClicked, !1))
    }
}
,
LeaderboardView.prototype.onTeamClicked = function(e) {
    return function() {
        var t = pc.app.root.findByName("Views").script.leaderboardView;
        t.onTeamChanged(e),
        SoundManager.playGlobalSound("ButtonClick")
    }
}
,
LeaderboardView.prototype.onPlayAsClicked = function() {
    var e = pc.app.root.findByName("Views").script.leaderboardView;
    e.raiseTeamConfirmed(),
    e.previousTeam == e.team ? Stats.log(Stats.COUNTER_LB_INTERACT, "", Stats.KINGDOM_REPEAT_TEAM, this.team, "", "", "") : Stats.log(Stats.COUNTER_LB_INTERACT, "", Stats.KINGDOM_SELECT_TEAM, this.team, "", "", ""),
    SoundManager.playGlobalSound("ButtonClick")
}
,
LeaderboardView.prototype.raiseTeamConfirmed = function() {
    this.hide(),
    this.app.fire("leaderboardView:teamConfirmed", this.team)
}
,
LeaderboardView.prototype.onSelectTeamClicked = function() {
    var e = pc.app.root.findByName("Views").script.leaderboardView;
    e.hide();
    var t = pc.app.root.findByName("Views").script.teamView;
    t.show(),
    Stats.log(Stats.COUNTER_LB_INTERACT, "", Stats.KINGDOM_SELECT_TEAM, this.team, "", "", ""),
    SoundManager.playGlobalSound("ButtonClick")
}
,
LeaderboardView.prototype.show = function() {
    Flags.DISABLE_LEADERBOARD ? (console.log("SHOW NO LEADERBOARD"),
    this.div2.style.display = this.displayType) : (console.log("SHOW LEADERBOARD"),
    this.div.style.display = this.displayType)
}
,
LeaderboardView.prototype.transitionIn = function() {
    this.transitionState = "in",
    this.div.style.transform = "translate3d(150%, -25%, 0)",
    this.transitionTime = this.TRANSITION_TIME
}
,
LeaderboardView.prototype.hide = function() {
    this.div.style.display = "none",
    this.div2.style.display = "none"
}
,
LeaderboardView.prototype.transitionOut = function() {
    this.transitionState = "out",
    this.transitionTime = this.TRANSITION_TIME
}
,
LeaderboardView.formatScore = function(e) {
    var t, a = [{
        value: 1e18,
        symbol: "E"
    }, {
        value: 1e15,
        symbol: "P"
    }, {
        value: 1e12,
        symbol: "T"
    }, {
        value: 1e9,
        symbol: "G"
    }, {
        value: 1e6,
        symbol: "M"
    }, {
        value: 1e3,
        symbol: "K"
    }], i = /\.0+$|(\.[0-9]*[1-9])0+$/;
    for (t = 0; t < a.length; t++)
        if (e >= a[t].value)
            return (e / a[t].value).toFixed(2).replace(i, "$1") + a[t].symbol;
    return e.toFixed(2).replace(i, "$1")
}
;
var TeamView = pc.createScript("teamView");
TeamView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
TeamView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
TeamView.attributes.add("backgroundLarge", {
    type: "asset",
    assetType: "texture",
    title: "backgroundLarge"
}),
TeamView.attributes.add("rankContainer", {
    type: "asset",
    assetType: "texture",
    title: "rankContainer"
}),
TeamView.attributes.add("rankSelected", {
    type: "asset",
    assetType: "texture",
    title: "rankSelected"
}),
TeamView.attributes.add("buttonFullSize", {
    type: "asset",
    assetType: "texture",
    title: "buttonFullSize"
}),
TeamView.attributes.add("trophyFirst", {
    type: "asset",
    assetType: "texture",
    title: "trophyFirst"
}),
TeamView.attributes.add("trophySecond", {
    type: "asset",
    assetType: "texture",
    title: "trophySecond"
}),
TeamView.attributes.add("trophyThird", {
    type: "asset",
    assetType: "texture",
    title: "trophyThird"
}),
TeamView.prototype.initialize = function() {
    this.previousTeam = "Loading...",
    this.hasSubmitted = !1,
    this.TRANSITION_TIME = .25,
    this.typedInTeam = !1;
    var t = document.createElement("style");
    document.head.appendChild(t);
    var e = this.css.resource.replace(/assetTag_backgroundLarge/g, this.backgroundLarge.getFileUrl());
    e = e.replace(/assetTag_rankContainer/g, this.rankContainer.getFileUrl()),
    e = e.replace(/assetTag_rankSelected/g, this.rankSelected.getFileUrl()),
    e = e.replace(/assetTag_buttonFullSize/g, this.buttonFullSize.getFileUrl()),
    e = e.replace(/assetTag_trophyFirst/g, this.trophyFirst.getFileUrl()),
    e = e.replace(/assetTag_trophySecond/g, this.trophySecond.getFileUrl()),
    e = e.replace(/assetTag_trophyThird/g, this.trophyThird.getFileUrl()),
    t.innerHTML = e,
    this.div = document.createElement("div"),
    this.div.classList.add("team"),
    this.div.innerHTML = this.html.resource || "",
    document.body.appendChild(this.div),
    this.div.style.display = "none",
    this.app.off("teamManager:teamListUpdated", this.onTeamListUpdated, this),
    this.app.on("teamManager:teamListUpdated", this.onTeamListUpdated, this),
    this.bindInput()
}
,
TeamView.prototype.bindInput = function() {
    var t = this.div.querySelector(".teamInput");
    t && (t.oninput = this.onInputChanged,
    t.onclick = this.onClick)
}
,
TeamView.prototype.onClick = function() {
    var t = pc.app.root.findByName("Views").script.teamView;
    t.div.querySelector(".teamInput")
}
,
TeamView.prototype.update = function(t) {
    this.doTransition(t)
}
,
TeamView.prototype.doTransition = function(t) {
    if (this.transitionTime > 0) {
        this.transitionTime -= t,
        this.transitionTime < 0 && (this.transitionTime = 0);
        var e = (this.TRANSITION_TIME - this.transitionTime) / this.TRANSITION_TIME;
        console.log(e);
        var i = pc.math.lerp(150, -50, e);
        this.div.style.transform = "translate3d(" + i + "%, -25%, 0)"
    }
}
,
TeamView.prototype.highlightTeam = function(t) {
    if (this.ul) {
        for (var e = this.ul.getElementsByTagName("li"), i = 0; i < e.length; i++)
            e[i].id != t && (e[i].className = "teamListItem");
        if ("" !== t) {
            var a = document.getElementById("team_" + t);
            a && (a.className = "teamListItemSelected")
        }
    }
}
,
TeamView.prototype.onPreviousTeamChanged = function(t) {
    this.previousTeam = t,
    this.highlightTeam(t)
}
,
TeamView.prototype.onInputChanged = function() {
    var t = pc.app.root.findByName("Views").script.teamView
      , e = t.div.querySelector(".teamInput");
    e && (t.typedInTeam = !0,
    t.changeSelectedTeam(e.value))
}
,
TeamView.prototype.changeSelectedTeam = function(t) {
    var e = this.div.querySelector(".teamText");
    e && (e.innerHTML = "What Team do you play for?",
    e.style.color = "#fbb03b");
    var i = this.div.querySelector(".teamInput");
    i && (t = t.replace(/^\s+|\s+$/g, ""),
    teamNameStrings = t.split(" "),
    teamNameStrings.length > 2 && (t = teamNameStrings[1]),
    t = t.replace(/[^\w]/g, ""),
    t.length > 14 && (t = t.substr(0, 14)),
    t = t.toUpperCase(),
    i.value = t,
    this.selectedTeam = t),
    t.length > 0 ? this.submitButton.style.visibility = "visible" : this.submitButton.style.visibility = "hidden",
    this.highlightTeam(t)
}
,
TeamView.prototype.onTeamListUpdated = function(t) {
    var e = this.div.querySelector(".team");
    if (e) {
        if (this.ul ? this.ul.innerHTML = "" : (this.ul = document.createElement("ul"),
        this.ul.classList.add("teamList"),
        e.appendChild(this.ul)),
        t)
            for (var i = 0; i < t.length; i++) {
                var a = document.createElement("li");
                a.setAttribute("id", "team_" + t[i][1]),
                t[i][1] == this.previousTeam ? a.classList.add("teamListItemSelected") : a.classList.add("teamListItem");
                var s = document.createElement("span")
                  , n = t[i][0] + 1;
                if (4 > n)
                    switch (n) {
                    case 1:
                        s.classList.add("teamListItemRank1");
                        break;
                    case 2:
                        s.classList.add("teamListItemRank2");
                        break;
                    case 3:
                        s.classList.add("teamListItemRank3")
                    }
                else
                    s.textContent = n + ".",
                    s.classList.add("teamListItemRank");
                a.appendChild(s);
                var r = document.createElement("span");
                r.textContent = t[i][1],
                4 > n ? r.classList.add("teamListItemNameWithTrophy") : r.classList.add("teamListItemName"),
                a.appendChild(r);
                var o = document.createElement("span");
                o.textContent = LeaderboardView.formatScore(t[i][2]),
                o.classList.add("teamListItemScore"),
                a.appendChild(o);
                var d = t[i][1];
                a.addEventListener("click", this.onTeamClicked(d), !1),
                this.ul.appendChild(a)
            }
        this.submitButton || (this.submitButton = document.createElement("div"),
        this.submitButton.classList.add("submitButton"),
        this.submitButton.textContent = "Let's Go!",
        e.appendChild(this.submitButton),
        this.submitButton.addEventListener("click", this.onSubmitClicked, !1)),
        this.submitButton.style.visibility = "hidden"
    }
}
,
TeamView.prototype.onTeamClicked = function(t) {
    return function() {
        var e = pc.app.root.findByName("Views").script.teamView;
        e.typedInTeam = !1,
        e.changeSelectedTeam(t),
        SoundManager.playGlobalSound("ButtonClick")
    }
}
,
TeamView.prototype.onSubmitClicked = function() {
    var t = pc.app.root.findByName("Views").script.teamView;
    if (PlatformFacade.currentPlatform === PlatformFacade.PLATFORM.FB_INSTANT) {
        if (t.hasSubmitted)
            return;
        return Zynga.ProfanityFilter.isProfane(t.selectedTeam, t.submitSuccess, t.submitFailed),
        void (t.hasSubmitted = !0)
    }
    t.submitSuccess()
}
,
TeamView.prototype.submitSuccess = function(t) {
    var e = pc.app.root.findByName("Views").script.teamView;
    if (e.hasSubmitted = !1,
    t && t.data.profane) {
        var i = e.div.querySelector(".teamText");
        return void (i && (i.innerHTML = "Profanity Not Allowed",
        i.style.color = "#ED1C24"))
    }
    e.raiseTeamConfirmed();
    var a = e.typedInTeam ? Stats.KINGDOM_TYPE : Stats.KINGDOM_LIST_SELECT;
    Stats.log(Stats.COUNTER_TS_INTERACT, "", a, e.selectedTeam, "", "", ""),
    SoundManager.playGlobalSound("ButtonClick")
}
,
TeamView.prototype.submitFailed = function() {
    var t = pc.app.root.findByName("Views").script.teamView;
    t.hasSubmitted = !1
}
,
TeamView.prototype.raiseTeamConfirmed = function() {
    var t = pc.app.root.findByName("Views").script.teamView;
    this.div.style.display = "none",
    this.app.fire("teamView:teamConfirmed", t.selectedTeam)
}
,
TeamView.prototype.show = function() {
    this.div.style.display = "block"
}
,
TeamView.prototype.transitionIn = function() {
    this.div.style.transform = "translate3d(150%, -35%, 0)",
    this.transitionTime = this.TRANSITION_TIME
}
;
var HUDView = pc.createScript("hudView");
HUDView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
HUDView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
HUDView.attributes.add("hudBackground", {
    type: "asset",
    assetType: "texture",
    title: "hudBackground"
}),
HUDView.prototype.initialize = function() {
    this.targetScore = 0,
    this.targetHighScore = 0,
    this.currentScore = 0,
    this.currentHighScore = 0;
    var e = document.createElement("style");
    document.head.appendChild(e);
    var t = this.css.resource.replace(/assetTag_hudBackground/g, this.hudBackground.getFileUrl());
    e.innerHTML = t || "",
    this.div = document.createElement("div"),
    this.div.classList.add("hudContainer"),
    this.div.innerHTML = this.html.resource || "",
    document.body.appendChild(this.div),
    this.app.off("scoreManager:scoreChanged", this.onScoreChanged, this),
    this.app.on("scoreManager:scoreChanged", this.onScoreChanged, this),
    this.app.off("scoreManager:highScoreChanged", this.onHighScoreChanged, this),
    this.app.on("scoreManager:highScoreChanged", this.onHighScoreChanged, this),
    this.app.off("gameManager:timerUpdated", this.onTimerUpdated, this),
    this.app.on("gameManager:timerUpdated", this.onTimerUpdated, this),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this)
}
,
HUDView.prototype.update = function(e) {
    this.currentScore = pc.math.lerp(this.currentScore, this.targetScore, 5 * e),
    this.currentHighScore = pc.math.lerp(this.currentHighScore, this.targetHighScore, 5 * e);
    var t = this.div.querySelector(".scoreText");
    t && (t.textContent = Math.round(this.currentScore));
    var i = this.div.querySelector(".highScoreText");
    i && (i.textContent = Math.round(this.currentHighScore))
}
,
HUDView.prototype.onScoreChanged = function(e) {
    this.targetScore = e
}
,
HUDView.prototype.onHighScoreChanged = function(e) {
    this.targetHighScore = e
}
,
HUDView.prototype.onTimerUpdated = function(e) {
    var t = this.div.querySelector(".timeText");
    t && (e >= 10 ? (t.style.color = "#FBB03B",
    t.textContent = "0:" + e) : (t.style.color = "#ED1C24",
    t.textContent = "0:0" + e))
}
,
HUDView.prototype.onGameStateChanged = function(e) {
    e == GameState.PLAYING || e == GameState.COUNTDOWN ? this.div.style.display = "flex" : this.div.style.display = "none"
}
;
var FinalScoreView = pc.createScript("finalScoreView");
FinalScoreView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
FinalScoreView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
FinalScoreView.attributes.add("finalScoreBackground", {
    type: "asset",
    assetType: "texture",
    title: "finalScoreBackground"
}),
FinalScoreView.prototype.initialize = function() {
    this.TICK_SOUND_INTERVAL = .05,
    this.tickSoundTimer = this.TICK_SOUND_INTERVAL,
    this.totalTimeToView = 3,
    Flags.DISABLE_LEADERBOARD && (this.totalTimeToView = 5),
    this.tallyScore = !1,
    this.currentScore = 0,
    this.targetScore = 0;
    var e = document.createElement("style");
    document.head.appendChild(e);
    var t = this.css.resource.replace(/assetTag_finalScoreBackground/g, this.finalScoreBackground.getFileUrl());
    e.innerHTML = t || "",
    this.div = document.createElement("div"),
    this.div.classList.add("finalScoreContainer"),
    this.div.innerHTML = this.html.resource || "",
    document.body.appendChild(this.div),
    this.div.style.display = "none",
    this.app.off("scoreManager:scoreChanged", this.onScoreChanged, this),
    this.app.on("scoreManager:scoreChanged", this.onScoreChanged, this),
    this.app.off("scoreManager:highScoreChanged", this.onHighScoreChanged, this),
    this.app.on("scoreManager:highScoreChanged", this.onHighScoreChanged, this),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this)
}
,
FinalScoreView.prototype.update = function(e) {
    if (this.tallyScore && this.totalTimeToView > 0) {
        if (this.totalTimeToView -= e,
        this.totalTimeToView <= 0) {
            if (this.div.style.display = "none",
            Flags.DISABLE_LEADERBOARD && !this.hasEndedGame)
                if (this.hasEndedGame = !0,
                PlatformFacade.currentPlatform == PlatformFacade.PLATFORM.FB_INSTANT)
                    this.app.fire("finalLeaderboardView:preScreenshot", this.score),
                    PlatformFacade.endGame();
                else {
                    var t = this.app.root.findByName("GameManager").script.gameManager;
                    t.changeGameState(GameState.MENU)
                }
            return
        }
        this.lastScore = Math.ceil(this.currentScore),
        this.currentScore = pc.math.lerp(this.currentScore, this.targetScore, 2.5 * e),
        this.tickSoundTimer -= e,
        this.tickSoundTimer <= 0 && this.lastScore < Math.ceil(this.currentScore) && (this.tickSoundTimer = this.TICK_SOUND_INTERVAL,
        SoundManager.playGlobalSound("Tick"));
        var i = this.div.querySelector(".finalScoreText");
        i && (i.textContent = Math.ceil(this.currentScore))
    }
}
,
FinalScoreView.prototype.onScoreChanged = function(e) {
    this.targetScore = e
}
,
FinalScoreView.prototype.onHighScoreChanged = function(e) {
    var t = this.div.querySelector(".finalHighScoreText");
    t && (t.textContent = "High Score " + e)
}
,
FinalScoreView.prototype.onGameStateChanged = function(e) {
    e == GameState.OVER ? (this.tallyScore = !0,
    this.totalTimeToView = 3,
    Flags.DISABLE_LEADERBOARD && (this.totalTimeToView = 5),
    this.div.style.display = "flex") : (this.hasEndedGame = !1,
    this.tallyScore = !1,
    this.currentScore = 0,
    this.div.style.display = "none")
}
;
var FinalTeamScoreView = pc.createScript("finalTeamScoreView");
FinalTeamScoreView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
FinalTeamScoreView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
FinalTeamScoreView.attributes.add("finalTeamScoreBackground", {
    type: "asset",
    assetType: "texture",
    title: "finalTeamScoreBackground"
}),
FinalTeamScoreView.prototype.initialize = function() {
    this.TICK_SOUND_INTERVAL = .05,
    this.tickSoundTimer = this.TICK_SOUND_INTERVAL,
    this.countdownToShow = 3,
    this.totalTimeToView = 3,
    this.tallyScore = !1,
    this.currentScore = 0,
    this.targetScore = 0,
    this.ftueCompletedThisRound = !1;
    var e = document.createElement("style");
    document.head.appendChild(e);
    var t = this.css.resource.replace(/assetTag_finalTeamScoreBackground/g, this.finalTeamScoreBackground.getFileUrl());
    e.innerHTML = t || "",
    this.div = document.createElement("div"),
    this.div.classList.add("finalTeamScoreContainer"),
    this.div.innerHTML = this.html.resource || "",
    document.body.appendChild(this.div),
    this.div.style.display = "none",
    this.app.off("scoreManager:scoreChanged", this.onScoreChanged, this),
    this.app.on("scoreManager:scoreChanged", this.onScoreChanged, this),
    this.app.off("teamManager:teamConfirmed", this.onTeamConfirmed, this),
    this.app.on("teamManager:teamConfirmed", this.onTeamConfirmed, this),
    this.app.off("teamManager:selectedTeamDataUpdated", this.onSelectedTeamDataUpdated, this),
    this.app.on("teamManager:selectedTeamDataUpdated", this.onSelectedTeamDataUpdated, this),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.off("ftueManager:ftueCompleted", this.onFtueCompleted, this),
    this.app.on("ftueManager:ftueCompleted", this.onFtueCompleted, this)
}
,
FinalTeamScoreView.prototype.onFtueCompleted = function() {
    this.ftueCompletedThisRound = !0
}
,
FinalTeamScoreView.prototype.update = function(e) {
    if (this.tallyScore) {
        if (this.countdownToShow > 0) {
            if (this.countdownToShow -= e,
            this.countdownToShow > 0)
                return;
            this.div.style.display = "flex"
        }
        if (this.totalTimeToView -= e,
        this.totalTimeToView <= 0)
            return void (this.div.style.display = "none");
        this.lastScore = Math.ceil(this.currentScore),
        this.currentScore = pc.math.lerp(this.currentScore, this.targetScore, 2.5 * e),
        this.tickSoundTimer -= e,
        this.tickSoundTimer <= 0 && this.lastScore < Math.ceil(this.currentScore) && (this.tickSoundTimer = this.TICK_SOUND_INTERVAL,
        SoundManager.playGlobalSound("Tick"));
        var t = this.div.querySelector(".finalTeamScoreText");
        t && (t.textContent = Math.ceil(this.currentScore))
    }
}
,
FinalTeamScoreView.prototype.onScoreChanged = function(e) {
    var t = this.div.querySelector(".finalTeamScoreLabel");
    this.teamData ? (t && (t.textContent = this.teamData[1]),
    this.targetScore = e + this.teamData[2]) : this.targetScore = e
}
,
FinalTeamScoreView.prototype.onTeamConfirmed = function(e) {
    this.teamData = [0, e, 0]
}
,
FinalTeamScoreView.prototype.onSelectedTeamDataUpdated = function(e) {
    this.teamData = e;
    var t = this.div.querySelector(".finalTeamScoreLabel");
    t && (this.teamData ? t.textContent = this.teamData[1] : t.textContent = "Team Score")
}
,
FinalTeamScoreView.prototype.onGameStateChanged = function(e) {
    if (e == GameState.OVER) {
        if (Flags.DISABLE_LEADERBOARD)
            return;
        if (this.ftueCompletedThisRound)
            return void (this.ftueCompletedThisRound = !1);
        this.tallyScore = !0
    } else
        this.tallyScore = !1,
        this.currentScore = 0,
        this.targetScore = 0,
        this.totalTimeToView = 3,
        this.countdownToShow = 3,
        this.div.style.display = "none"
}
;
var CountdownView = pc.createScript("countdownView");
CountdownView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
CountdownView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
CountdownView.prototype.initialize = function() {
    var t = document.createElement("style");
    document.head.appendChild(t),
    t.innerHTML = this.css.resource || "",
    this.div = document.createElement("div"),
    this.div.classList.add("countdownContainer"),
    this.div.innerHTML = this.html.resource || "",
    document.body.appendChild(this.div),
    this.div.style.display = "none",
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.off("gameManager:countdownUpdated", this.onCountdownUpdated, this),
    this.app.on("gameManager:countdownUpdated", this.onCountdownUpdated, this)
}
,
CountdownView.prototype.onCountdownUpdated = function(t) {
    var e = this.div.querySelector(".countdownText");
    e && (e.textContent = Math.ceil(t))
}
,
CountdownView.prototype.onGameStateChanged = function(t) {
    t == GameState.COUNTDOWN ? this.div.style.display = "block" : this.div.style.display = "none"
}
;
var SoundManager = pc.createScript("soundManager"), GlobalSoundsEntity, soundsFadingIn = [], soundsFadingOut = [];
SoundManager.prototype.update = function(n) {
    for (var o = soundsFadingIn.length - 1; o > -1; o--)
        soundsFadingIn[o].soundEntity.sound.slot(soundsFadingIn[o].soundName).volume = pc.math.clamp(soundsFadingIn[o].soundEntity.sound.slot(soundsFadingIn[o].soundName).volume + 1 * n / soundsFadingIn[o].fadeTime, 0, soundsFadingIn[o].targetVolume),
        soundsFadingIn[o].soundEntity.sound.slot(soundsFadingIn[o].soundName).volume == soundsFadingIn[o].targetVolume && soundsFadingIn.splice(o, 1);
    for (var d = soundsFadingOut.length - 1; d > -1; d--)
        soundsFadingOut[d].soundEntity.sound.slot(soundsFadingOut[d].soundName).volume = pc.math.clamp(soundsFadingOut[d].soundEntity.sound.slot(soundsFadingOut[d].soundName).volume - 1 * n / soundsFadingOut[d].fadeTime, 0, 1),
        soundsFadingOut[d].soundEntity.sound.slot(soundsFadingOut[d].soundName).volume <= 0 && (soundsFadingOut[d].soundEntity.sound.stop(soundsFadingOut[d].soundName),
        soundsFadingOut[d].soundEntity.sound.slot(soundsFadingOut[d].soundName).volume = soundsFadingOut[d].oldVolume,
        soundsFadingOut.splice(d, 1))
}
,
SoundManager.enableSound = function(n) {
    n ? app.systems.sound.volume = 1 : app.systems.sound.volume = 0
}
,
SoundManager.playGlobalSound = function(n, o) {
    if (!GlobalSoundsEntity) {
        if (!pc.app)
            return;
        GlobalSoundsEntity = pc.app.root.findByName("GlobalSounds")
    }
    SoundManager.playSound(GlobalSoundsEntity, n, o)
}
,
SoundManager.stopGlobalSound = function(n, o) {
    if (!GlobalSoundsEntity) {
        if (!pc.app)
            return;
        GlobalSoundsEntity = pc.app.root.findByName("GlobalSounds")
    }
    SoundManager.stopSound(GlobalSoundsEntity, n, o)
}
,
SoundManager.playSound = function(n, o, d) {
    if (SoundManager.validateSound(n, o, d)) {
        if (SoundManager.removeFromLists(n, o),
        d && (d.pitch && (n.sound.slot(o).pitch = pc.math.random(d.pitch.min, d.pitch.max)),
        d.perPlayFalloff && (n.sound.slot(o).volume = pc.math.clamp(n.sound.volume * d.perPlayFalloff, 0, 1)),
        d.fade)) {
            var u = {
                soundEntity: n,
                soundName: o,
                targetVolume: n.sound.slot(o).volume,
                fadeTime: d.fade
            };
            n.sound.slot(o).volume = 0,
            soundsFadingIn.push(u)
        }
        n.sound.play(o)
    }
}
,
SoundManager.stopSound = function(n, o, d) {
    if (SoundManager.validateSound(n, o, d))
        if (SoundManager.removeFromLists(n, o),
        d.fade) {
            var u = {
                soundEntity: n,
                soundName: o,
                oldVolume: n.sound.slot(o).volume,
                fadeTime: d.fade
            };
            soundsFadingOut.push(u)
        } else
            n.sound.stop(o)
}
,
SoundManager.validateSound = function(n, o, d) {
    return n ? n.sound ? n.sound.enabled ? n.sound.slot(o) ? !0 : d && d.allowMissing ? !1 : (console.error("Could not play sound for entity (Sound slot not found): " + n + ". Sound named :" + o),
    !1) : (console.error("Could not play sound for entity (sound component disabled): " + n + ". Sound named :" + o),
    !1) : (console.error("Could not play sound for entity (Missing sound component): " + n + ". Sound named :" + o),
    !1) : (console.error("Could not play sound for entity (Entity undefined): " + n + ". Sound named :" + o),
    !1)
}
,
SoundManager.removeFromLists = function(n, o) {
    for (var d = soundsFadingIn.length - 1; d > -1; d--)
        soundsFadingIn[d].soundEntity == n && soundsFadingIn[d].soundName == o && (soundsFadingIn[d].soundEntity.sound.slot(soundsFadingIn[d].soundName).volume = soundsFadingIn[d].targetVolume,
        soundsFadingIn.splice(d, 1));
    for (var u = soundsFadingOut.length - 1; u > -1; u--)
        soundsFadingOut[u].soundEntity == n && soundsFadingOut[u].soundName == o && (soundsFadingOut[u].soundEntity.sound.stop(soundsFadingOut[u].soundName),
        soundsFadingOut[u].soundEntity.sound.slot(soundsFadingOut[u].soundName).volume = soundsFadingOut[u].oldVolume,
        soundsFadingOut.splice(u, 1))
}
;
var CrowdManager = pc.createScript("crowdManager");
CrowdManager.prototype.initialize = function() {
    this.app.off("scoreManager:streakMultiplierChanged", this.onStreakMultiplierChanged, this),
    this.app.on("scoreManager:streakMultiplierChanged", this.onStreakMultiplierChanged, this)
}
,
CrowdManager.prototype.onStreakMultiplierChanged = function(a, e) {
    switch (e) {
    case 1:
        SoundManager.stopGlobalSound("Crowd_1", {
            fade: 2
        }),
        SoundManager.playGlobalSound("Crowd_2", {
            fade: 2
        });
        break;
    case 2:
        break;
    case 3:
        SoundManager.stopGlobalSound("Crowd_2", {
            fade: 2
        }),
        SoundManager.playGlobalSound("Crowd_3", {
            fade: 2
        });
        break;
    default:
        SoundManager.stopGlobalSound("Crowd_3", {
            fade: 2
        }),
        SoundManager.stopGlobalSound("Crowd_2", {
            fade: 2
        }),
        SoundManager.playGlobalSound("Crowd_1", {
            fade: 2
        })
    }
}
;
var StreakView = pc.createScript("streakView");
StreakView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
StreakView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
StreakView.prototype.initialize = function() {
    var e = document.createElement("style");
    document.head.appendChild(e),
    e.innerHTML = this.css.resource || "",
    this.div = document.createElement("div"),
    this.div.classList.add("streakContainer"),
    this.div.innerHTML = this.html.resource || "",
    document.body.appendChild(this.div),
    this.app.off("scoreManager:streakMultiplierChanged", this.onStreakMultiplierChanged, this),
    this.app.on("scoreManager:streakMultiplierChanged", this.onStreakMultiplierChanged, this),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this)
}
,
StreakView.prototype.onStreakMultiplierChanged = function(e, t) {
    var a = this.div.querySelector(".streakText");
    a && (1 == e ? a.textContent = "" : a.textContent = "x" + e)
}
,
StreakView.prototype.onGameStateChanged = function(e) {
    e == GameState.PLAYING ? this.div.style.display = "block" : this.div.style.display = "none"
}
;
var CalloutView = pc.createScript("calloutView");
CalloutView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
CalloutView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
CalloutView.attributes.add("calloutFire", {
    type: "asset",
    assetType: "texture",
    title: "calloutFire"
}),
CalloutView.attributes.add("calloutGold", {
    type: "asset",
    assetType: "texture",
    title: "calloutGold"
}),
CalloutView.attributes.add("calloutRainbow", {
    type: "asset",
    assetType: "texture",
    title: "calloutRainbow"
}),
CalloutView.prototype.initialize = function() {
    this.fadeDelay = 0;
    var t = document.createElement("style");
    document.head.appendChild(t);
    var e = this.css.resource.replace(/assetTag_calloutFire/g, this.calloutFire.getFileUrl());
    e = e.replace(/assetTag_calloutGold/g, this.calloutGold.getFileUrl()),
    e = e.replace(/assetTag_calloutRainbow/g, this.calloutRainbow.getFileUrl()),
    t.innerHTML = e || "",
    this.div = document.createElement("div"),
    this.div.classList.add("calloutContainer");
    var i = this.html.resource.replace(/assetTag_calloutFire/g, this.calloutFire.getFileUrl());
    i = i.replace(/assetTag_calloutGold/g, this.calloutGold.getFileUrl()),
    i = i.replace(/assetTag_calloutRainbow/g, this.calloutRainbow.getFileUrl()),
    this.div.innerHTML = i || "",
    document.body.appendChild(this.div),
    this.fire = this.div.querySelector(".calloutImageFire"),
    this.gold = this.div.querySelector(".calloutImageGold"),
    this.rainbow = this.div.querySelector(".calloutImageRainbow"),
    this.app.off("scoreManager:streakMultiplierChanged", this.onStreakMultiplierChanged, this),
    this.app.on("scoreManager:streakMultiplierChanged", this.onStreakMultiplierChanged, this)
}
,
CalloutView.prototype.update = function(t) {
    return this.fadeDelay > 0 ? void (this.fadeDelay -= t) : void (this.fadeOutFire ? this.fire.style.opacity -= t / 2 : this.fadeOutGold ? this.gold.style.opacity -= t / 2 : this.fadeOutRainbow && (this.rainbow.style.opacity -= t / 2))
}
,
CalloutView.prototype.onStreakMultiplierChanged = function(t, e) {
    switch (this.hideAlerts(),
    e) {
    case 1:
        this.fadeOutFire = !0,
        this.fire.style.display = "block",
        this.fire.style.opacity = 1,
        this.fadeDelay = 1;
        break;
    case 2:
        this.fadeOutGold = !0,
        this.gold.style.display = "block",
        this.gold.style.opacity = 1,
        this.fadeDelay = 1;
        break;
    case 3:
        this.fadeOutRainbow = !0,
        this.rainbow.style.display = "block",
        this.rainbow.style.opacity = 1,
        this.fadeDelay = 1
    }
}
,
CalloutView.prototype.hideAlerts = function() {
    this.fadeOutFire = !1,
    this.fadeOutGold = !1,
    this.fadeOutRainbow = !1,
    this.fire.style.display = "none",
    this.fire.style.opacity = 0,
    this.gold.style.display = "none",
    this.gold.style.opacity = 0,
    this.rainbow.style.display = "none",
    this.rainbow.style.opacity = 0
}
,
CalloutView.prototype.onGameStateChanged = function(t) {
    t == GameState.PLAYING ? this.div.style.display = "block" : this.div.style.display = "none"
}
;
function EntityPool(t, n) {
    this.POOL_SIZE = n,
    this.Entities = [],
    this.currentIndex = -1;
    for (var i = 0; i < this.POOL_SIZE; i++)
        this.Entities.push(t.clone())
}
EntityPool.prototype.next = function() {
    return this.currentIndex++,
    this.currentIndex >= this.Entities.length && (this.currentIndex = 0),
    this.Entities[this.currentIndex]
}
;
var FinalLeaderboardView = pc.createScript("finalLeaderboardView");
FinalLeaderboardView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
FinalLeaderboardView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
FinalLeaderboardView.attributes.add("backgroundLarge", {
    type: "asset",
    assetType: "texture",
    title: "backgroundLarge"
}),
FinalLeaderboardView.attributes.add("rankContainer", {
    type: "asset",
    assetType: "texture",
    title: "rankContainer"
}),
FinalLeaderboardView.attributes.add("scoreContainer", {
    type: "asset",
    assetType: "texture",
    title: "scoreContainer"
}),
FinalLeaderboardView.prototype.initialize = function() {
    this.totalTimeToView = 3,
    this.countdownToShow = 6,
    this.showBoard = !1,
    this.ftueCompletedThisRound = !1,
    this.score = 0;
    var e = document.createElement("style");
    document.head.appendChild(e);
    var t = this.css.resource.replace(/assetTag_backgroundLarge/g, this.backgroundLarge.getFileUrl());
    t = t.replace(/assetTag_rankContainer/g, this.rankContainer.getFileUrl()),
    t = t.replace(/assetTag_scoreContainer/g, this.scoreContainer.getFileUrl()),
    e.innerHTML = t,
    this.div = document.createElement("div"),
    this.div.classList.add("finalLeaderboard"),
    this.div.innerHTML = this.html.resource || "",
    document.body.appendChild(this.div),
    this.app.off("scoreManager:scoreChanged", this.onScoreChanged, this),
    this.app.on("scoreManager:scoreChanged", this.onScoreChanged, this),
    this.app.off("teamManager:teamConfirmed", this.onTeamConfirmed, this),
    this.app.on("teamManager:teamConfirmed", this.onTeamConfirmed, this),
    this.app.off("teamManager:selectedTeamDataUpdated", this.onSelectedTeamDataUpdated, this),
    this.app.on("teamManager:selectedTeamDataUpdated", this.onSelectedTeamDataUpdated, this),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.off("leaderboardManager:leaderboardUpdated", this.onLeaderboardUpdated, this),
    this.app.on("leaderboardManager:leaderboardUpdated", this.onLeaderboardUpdated, this),
    this.app.off("ftueManager:ftueCompleted", this.onFtueCompleted, this),
    this.app.on("ftueManager:ftueCompleted", this.onFtueCompleted, this),
    this.displayType = this.div.style.display,
    this.hide()
}
,
FinalLeaderboardView.prototype.onScoreChanged = function(e) {
    this.score = e
}
,
FinalLeaderboardView.prototype.updateScores = function() {
    var e = this.div.querySelector(".finalLeaderboardScoreText");
    e && (e.textContent = this.score);
    var t = this.div.querySelector(".finalLeaderboardTeamScoreText");
    t && (this.teamData ? t.textContent = this.teamData[2] : t.textContent = this.score)
}
,
FinalLeaderboardView.prototype.onTeamConfirmed = function(e) {
    this.teamData = [0, e, 0];
    var t = this.div.querySelector(".finalLeaderboardTeamScoreLabel");
    t && (t.textContent = this.teamData[1])
}
,
FinalLeaderboardView.prototype.onSelectedTeamDataUpdated = function(e) {
    this.teamData = e;
    var t = this.div.querySelector(".finalLeaderboardTeamScoreLabel");
    t && (this.teamData ? t.textContent = this.teamData[1] : t.textContent = "Team Score")
}
,
FinalLeaderboardView.prototype.onFtueCompleted = function() {
    this.ftueCompletedThisRound = !0
}
,
FinalLeaderboardView.prototype.update = function(e) {
    if (this.showBoard) {
        if (this.countdownToShow > 0) {
            if (this.countdownToShow -= e,
            this.countdownToShow > 0)
                return;
            this.show()
        }
        if (this.totalTimeToView -= e,
        this.totalTimeToView <= 0) {
            if (!this.hasEndedGame)
                if (this.hasEndedGame = !0,
                PlatformFacade.currentPlatform == PlatformFacade.PLATFORM.FB_INSTANT)
                    this.app.fire("finalLeaderboardView:preScreenshot", this.score),
                    PlatformFacade.endGame();
                else {
                    var t = this.app.root.findByName("GameManager").script.gameManager;
                    t.changeGameState(GameState.MENU)
                }
            return
        }
    }
}
,
FinalLeaderboardView.prototype.onGameStateChanged = function(e) {
    if (e == GameState.OVER) {
        if (Flags.DISABLE_LEADERBOARD)
            return;
        this.ftueCompletedThisRound && (this.ftueCompletedThisRound = !1,
        this.countdownToShow = 3),
        this.showBoard = !0
    } else
        this.showBoard = !1,
        this.hasEndedGame = !1,
        this.totalTimeToView = 3,
        this.countdownToShow = 6,
        this.hide()
}
,
FinalLeaderboardView.prototype.onLeaderboardUpdated = function(e, t) {
    if (void 0 === e)
        return void console.log("No leaderboard records for final leaderboard view. Did fetching records fail?");
    var a = this.div.querySelector(".finalLeaderboard");
    if (a) {
        this.ul ? this.ul.innerHTML = "" : (this.ul = document.createElement("ul"),
        this.ul.classList.add("finalLeaderboardList"),
        a.appendChild(this.ul)),
        this.myTeamLi = null;
        for (var i = 0; i < e.length; i++) {
            var o = document.createElement("li");
            o.classList.add("finalLeaderboardListItem");
            var d = document.createElement("span");
            d.textContent = e[i][0] + 1 + ".",
            o.appendChild(d);
            var r = document.createElement("span");
            r.textContent = e[i][1],
            o.appendChild(r);
            var s = document.createElement("span");
            s.textContent = LeaderboardView.formatScore(e[i][2]),
            o.appendChild(s),
            this.teamData && e[i][1] == this.teamData[1] ? (d.classList.add("finalLeaderboardListItemRankHighlighted"),
            r.classList.add("finalLeaderboardListItemNameHighlighted"),
            s.classList.add("finalLeaderboardListItemScoreHighlighted"),
            this.myTeamLi = o) : (d.classList.add("finalLeaderboardListItemRank"),
            r.classList.add("finalLeaderboardListItemName"),
            s.classList.add("finalLeaderboardListItemScore")),
            this.ul.appendChild(o)
        }
    }
}
,
FinalLeaderboardView.prototype.show = function() {
    this.updateScores(),
    this.div.style.display = this.displayType,
    this.myTeamLi && (this.ul.scrollTop = this.myTeamLi.offsetTop - 210)
}
,
FinalLeaderboardView.prototype.hide = function() {
    this.div.style.display = "none"
}
;
var Net = pc.createScript("net");
Net.prototype.initialize = function() {
    this.app.off("goal:scored", this.onGoalScored, this),
    this.app.on("goal:scored", this.onGoalScored, this)
}
,
Net.prototype.onGoalScored = function() {
    this.entity.animation.currentTime < this.entity.animation.duration || this.entity.animation.play("Hoop_wnet.json")
}
;
var CrowdMember = pc.createScript("crowdMember");
CrowdMember.attributes.add("materialAsset", {
    type: "asset",
    assetType: "material"
}),
CrowdMember.attributes.add("numFrames", {
    type: "number",
    "default": 1,
    description: "Number of frames to play before looping"
}),
CrowdMember.attributes.add("numAnims", {
    type: "number",
    "default": 1,
    description: "Number of anims in the sheet"
}),
CrowdMember.attributes.add("width", {
    type: "number",
    "default": 1,
    description: "Number of frames wide"
}),
CrowdMember.attributes.add("height", {
    type: "number",
    "default": 1,
    description: "Number of frames high"
}),
CrowdMember.attributes.add("frameRate", {
    type: "number",
    "default": 1,
    description: "Playback frames per second"
}),
CrowdMember.prototype.initialize = function() {
    this.lookTarget = this.app.root.findByName("MainCamera").camera,
    this.materialAsset && (this.material = this.materialAsset.resource),
    this.timer = 1 / this.frameRate + pc.math.random(0, 40) / 10,
    this.transform = new pc.Vec4,
    this.setAnim(Math.floor(Math.random() * this.numAnims))
}
,
CrowdMember.prototype.setAnim = function(t) {
    this.startFrame = this.numFrames * t,
    this.frame = this.startFrame,
    this.updateMaterial(this.frame)
}
,
CrowdMember.prototype.update = function(t) {
    this.timer -= t,
    this.timer < 0 && (this.frame++,
    this.frame >= this.numFrames + this.startFrame ? (this.frame = this.startFrame,
    this.timer = 1 / this.frameRate + pc.math.random(10, 40) / 10) : this.timer = 1 / this.frameRate,
    this.updateMaterial(this.frame))
}
,
CrowdMember.prototype.updateMaterial = function(t) {
    var e = 1 / this.width
      , r = 1 / this.height
      , a = t % this.width
      , i = Math.floor(t / this.width)
      , s = this.entity.model.meshInstances;
    this.transform.set(e, r, a * e, 1 - r - i * r),
    s[0].setParameter("texture_diffuseMapTransform", this.transform.data),
    s[0].setParameter("texture_opacityMapTransform", this.transform.data)
}
;
var CrowdView = pc.createScript("crowdView");
CrowdView.prototype.initialize = function() {
    this.CROWD_COUNT_X = 12,
    this.CROWD_COUNT_Z = 3,
    this.CROWD_DISTANCE_X = 3.4,
    this.CROWD_DISTANCE_Z = 1.5,
    this.MAX_SIGNS = 0,
    this.signsLeft = this.MAX_SIGNS,
    this.CROWD_SPACING_X = 2 * this.CROWD_DISTANCE_X / this.CROWD_COUNT_X,
    this.CROWD_SPACING_Z = this.CROWD_DISTANCE_Z / this.CROWD_COUNT_Z;
    var e = this.app.root.findByName("CrowdPrefabs");
    this.prefabs = e.children,
    this.crowdMembers = [],
    this.spawnCrowd();
    for (var t = 0; t < this.prefabs.length; t++)
        this.prefabs[t].enabled = !1;
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this)
}
,
CrowdView.prototype.onGameStateChanged = function(e) {
    e != GameState.MENU && e != GameState.FTUE || this.randomizeCrowd()
}
,
CrowdView.prototype.spawnCrowd = function() {
    this.resetRandomFaceAnimIndices();
    var e = 3 * this.CROWD_COUNT_Z - Math.floor(2 * Math.random());
    this.layeringSpace = 0;
    for (var t = 0; t < this.CROWD_COUNT_X; t++) {
        this.layeringSpace += .02;
        for (var i = 0; i < this.CROWD_COUNT_Z; i++) {
            var a = this.prefabs[0]
              , s = !1;
            e--,
            0 >= e && (e = 6 * this.CROWD_COUNT_Z - 1,
            this.signsLeft--,
            this.signsLeft > -1 && (a = this.prefabs[1],
            s = !0));
            var r = a.clone();
            r.enabled = !0,
            s && r.script.crowdMember.setAnim(this.getRandomFaceAnimIndex()),
            this.entity.addChild(r);
            var o = Math.random() / 10 - .05
              , h = (t + .5) * this.CROWD_SPACING_X - this.CROWD_DISTANCE_X + o
              , n = i * -this.CROWD_SPACING_Z
              , d = 5 * n + this.layeringSpace;
            r.translateLocal(h, d, n),
            this.crowdMembers.push(r)
        }
    }
}
,
CrowdView.prototype.getRandomFaceAnimIndex = function() {
    var e = Math.floor(Math.random() * this.crowdFaceBag.length)
      , t = this.crowdFaceBag[e];
    return this.crowdFaceBag.splice(e, 1),
    t
}
,
CrowdView.prototype.resetRandomFaceAnimIndices = function() {
    this.crowdFaceBag = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
}
,
CrowdView.prototype.randomizeCrowd = function() {
    this.resetRandomFaceAnimIndices();
    for (var e = 0; e < this.crowdMembers.length; e++)
        if ("CrowdMember_Signs" == this.crowdMembers[e].name) {
            var t = this.crowdMembers[e].clone();
            this.crowdMembers[e].destroy(),
            this.entity.addChild(t),
            this.crowdMembers[e] = t,
            t.script.crowdMember.setAnim(this.getRandomFaceAnimIndex())
        }
}
;
var FacebookScreenshotView = pc.createScript("facebookScreenshotView");
FacebookScreenshotView.prototype.initialize = function() {
    this.app.off("finalLeaderboardView:preScreenshot", this.onPreScreenshot, this),
    this.app.on("finalLeaderboardView:preScreenshot", this.onPreScreenshot, this),
    this.app.off("platformFacade:postScreenshotComplete", this.onPostScreenshot, this),
    this.app.on("platformFacade:postScreenshotComplete", this.onPostScreenshot, this),
    this.entity.model.enabled = !1
}
,
FacebookScreenshotView.prototype.updateText = function(e) {
    this.canvas = document.createElement("canvas"),
    this.canvas.height = 512,
    this.canvas.width = 512,
    this.context = this.canvas.getContext("2d"),
    this.texture = new pc.Texture(this.app.graphicsDevice,{
        format: pc.PIXELFORMAT_R8_G8_B8_A8,
        autoMipmap: !0
    }),
    this.texture.setSource(this.canvas),
    this.texture.minFilter = pc.FILTER_LINEAR_MIPMAP_LINEAR,
    this.texture.magFilter = pc.FILTER_LINEAR,
    this.texture.addressU = pc.ADDRESS_CLAMP_TO_EDGE,
    this.texture.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    var t = this.context
      , i = t.canvas.width
      , o = t.canvas.height;
    t.fillStyle = "#00000000",
    t.fillRect(0, 0, i, o),
    t.fillStyle = "white",
    t.save(),
    t.font = "bold 110px Verdana",
    t.textAlign = "center",
    t.textBaseline = "middle",
    t.fillText(e, i / 2, o / 2),
    t.font = "bold 70px Verdana",
    t.fillText("FINAL SCORE", i / 2, o / 2 + 110),
    t.restore(),
    this.texture.upload(),
    this.entity.model.material.emissiveMap = this.texture,
    this.entity.model.material.opacityMap = this.texture,
    this.entity.model.material.blendType = pc.BLEND_NORMAL,
    this.entity.model.material.update()
}
,
FacebookScreenshotView.prototype.onPreScreenshot = function(e) {
    this.entity.model.enabled = !0,
    this.updateText(e)
}
,
FacebookScreenshotView.prototype.onPostScreenshot = function() {
    this.entity.model.enabled = !1
}
;
var VersionView = pc.createScript("versionView");
VersionView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
VersionView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
VersionView.prototype.initialize = function() {
    var e = document.createElement("style");
    document.head.appendChild(e),
    e.innerHTML = this.css.resource,
    this.div = document.createElement("div"),
    this.div.classList.add("versionContainer"),
    this.div.innerHTML = this.html.resource || "",
    document.body.appendChild(this.div),
    this.displayType = this.div.style.display,
    this.hide(),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this);
    var t = this.div.querySelector(".versionText");
    t && (t.textContent = "v" + Stats.VERSION)
}
,
VersionView.prototype.onGameStateChanged = function(e) {
    "5004247" == Stats.GAME_ID && e == GameState.MENU ? this.show() : this.hide()
}
,
VersionView.prototype.show = function() {
    this.div.style.display = this.displayType
}
,
VersionView.prototype.hide = function() {
    this.div.style.display = "none"
}
;
var AgreementView = pc.createScript("agreementView");
AgreementView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
AgreementView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
AgreementView.attributes.add("tosHtml", {
    type: "asset",
    assetType: "html",
    title: "ToS HTML Asset"
}),
AgreementView.attributes.add("privacyHtml", {
    type: "asset",
    assetType: "html",
    title: "Privacy HTML Asset"
});
var AgreementType = {
    TOS: 1,
    PRIVACY: 2
};
AgreementView.prototype.initialize = function() {
    var e = document.createElement("style");
    document.head.appendChild(e),
    e.innerHTML = this.css.resource || "",
    this.div = document.createElement("div"),
    this.div.classList.add("agreementContainer"),
    this.div.innerHTML = this.html.resource || "",
    this.divDisplay = this.div.style.display,
    this.divText = this.div.querySelector(".agreementText"),
    this.divTextDisplay = this.divText.style.display,
    this.divToS = document.createElement("div"),
    this.divToS.classList.add("agreementToSContainer"),
    this.divToS.innerHTML = this.tosHtml.resource || "",
    this.divToSDisplay = this.divToS.style.display,
    this.divPrivacy = document.createElement("div"),
    this.divPrivacy.classList.add("agreementToSContainer"),
    this.divPrivacy.innerHTML = this.privacyHtml.resource || "",
    this.divPrivacyDisplay = this.divPrivacy.style.display,
    this.divDone = document.createElement("div"),
    this.divDone.innerHTML = "<a href='javascript:AgreementView.hideAgreements();'><span class='agreementDoneText'>Done</span></a>",
    this.divToS.style.display = "none",
    this.divPrivacy.style.display = "none",
    this.divDone.style.display = "none",
    document.body.appendChild(this.div),
    this.div.appendChild(this.divToS),
    this.div.appendChild(this.divPrivacy),
    this.div.appendChild(this.divDone),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this)
}
,
AgreementView.showAgreement = function(e) {
    var t = pc.app.root.findByName("Views").script.agreementView;
    switch (AgreementView.hideAgreements(),
    t.divText.style.display = "none",
    t.bodyStylePosition = document.body.style.position,
    document.body.style.position = "static",
    e) {
    case AgreementType.TOS:
        t.showToS();
        break;
    case AgreementType.PRIVACY:
        t.showPrivacy()
    }
}
,
AgreementView.prototype.showToS = function() {
    console.log("Showing ToS"),
    this.divToS.style.display = this.divToSDisplay,
    this.divDone.style.display = "block"
}
,
AgreementView.prototype.showPrivacy = function() {
    console.log("Showing Privacy Policy"),
    this.divPrivacy.style.display = this.divPrivacyDisplay,
    this.divDone.style.display = "block"
}
,
AgreementView.hideAgreements = function() {
    var e = this.app || pc.app
      , t = e.root.findByName("Views").script.agreementView;
    console.log("Hiding agreements"),
    t.divToS.style.display = "none",
    t.divPrivacy.style.display = "none",
    t.divText.style.display = t.divTextDisplay,
    t.divDone.style.display = "none",
    document.body.style.position = t.bodyStylePosition
}
,
AgreementView.prototype.onGameStateChanged = function(e) {
    return e == GameState.MENU ? void (this.div.style.display = this.divDisplay) : void (this.div.style.display = "none")
}
;
var FtueManager = pc.createScript("ftueManager");
FtueManager.prototype.initialize = function() {
    this.ftueComplete = !0,
    this.app.off("platformFacade:gameStarted", this.onGameStarted, this),
    this.app.on("platformFacade:gameStarted", this.onGameStarted, this),
    this.app.off("goal:scored", this.onScored, this),
    this.app.on("goal:scored", this.onScored, this)
}
,
FtueManager.prototype.postInitialize = function() {
    PlatformFacade.currentPlatform != PlatformFacade.PLATFORM.FB_INSTANT && (this.ftueComplete = !0,
    this.raiseFtueRefreshed())
}
,
FtueManager.prototype.onGameStarted = function() {
    this.refreshFtue()
}
,
FtueManager.prototype.onScored = function() {
    this.ftueComplete || (this.ftueComplete = !0,
    this.raiseFtueCompleted())
}
,
FtueManager.prototype.onGameStateChanged = function(e) {
    PlatformFacade.currentPlatform === PlatformFacade.PLATFORM.FB_INSTANT && e == GameState.PLAYING
}
,
FtueManager.prototype.refreshFtue = function() {
    Zynga.Instant.player.getDataAsync(["ftue"]).then(function(e) {
        var t = this.app || pc.app
          , a = t.root.findByName("GameManager").script.ftueManager;
        e.ftue ? a.ftueComplete = !0 : a.ftueComplete = !0,
        a.raiseFtueRefreshed()
    })
}
,
FtueManager.prototype.raiseFtueRefreshed = function() {
    this.app.fire("ftueManager:ftueRefreshed", this.ftueComplete)
}
,
FtueManager.prototype.raiseFtueCompleted = function() {
    this.app.fire("ftueManager:ftueCompleted")
}
;
var FtueView = pc.createScript("ftueView");
FtueView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
FtueView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
FtueView.attributes.add("ftueArrow", {
    type: "asset",
    assetType: "texture",
    title: "ftueArrow"
}),
FtueView.prototype.initialize = function() {
    var e = document.createElement("style");
    document.head.appendChild(e),
    e.innerHTML = this.css.resource || "",
    this.div = document.createElement("div"),
    this.div.classList.add("ftueContainer");
    var t = this.html.resource.replace(/assetTag_ftueArrow/g, this.ftueArrow.getFileUrl());
    this.div.innerHTML = t || "",
    document.body.appendChild(this.div),
    this.div.style.display = "none",
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this)
}
,
FtueView.prototype.onGameStateChanged = function(e) {
    e == GameState.FTUE ? this.div.style.display = "block" : this.div.style.display = "none"
}
;
"undefined" != typeof document && (!function(t, e) {
    function n(t, e) {
        for (var n in e)
            try {
                t.style[n] = e[n]
            } catch (o) {}
        return t
    }
    function o(t) {
        return null == t ? String(t) : "object" == typeof t || "function" == typeof t ? Object.prototype.toString.call(t).match(/\s([a-z]+)/i)[1].toLowerCase() || "object" : typeof t
    }
    function a(t, e) {
        if ("array" !== o(e))
            return -1;
        if (e.indexOf)
            return e.indexOf(t);
        for (var n = 0, a = e.length; a > n; n++)
            if (e[n] === t)
                return n;
        return -1
    }
    function i() {
        var t, e = arguments;
        for (t in e[1])
            if (e[1].hasOwnProperty(t))
                switch (o(e[1][t])) {
                case "object":
                    e[0][t] = i({}, e[0][t], e[1][t]);
                    break;
                case "array":
                    e[0][t] = e[1][t].slice(0);
                    break;
                default:
                    e[0][t] = e[1][t]
                }
        return 2 < e.length ? i.apply(null, [e[0]].concat(Array.prototype.slice.call(e, 2))) : e[0]
    }
    function r(t) {
        return t = Math.round(255 * t).toString(16),
        1 === t.length ? "0" + t : t
    }
    function h(t, e, n, o) {
        t.addEventListener ? t[o ? "removeEventListener" : "addEventListener"](e, n, !1) : t.attachEvent && t[o ? "detachEvent" : "attachEvent"]("on" + e, n)
    }
    function l(t, s) {
        function d(t, e, n, o) {
            return F[0 | t][Math.round(Math.min((e - n) / (o - n) * D, D))]
        }
        function g() {
            T.legend.fps !== W && (T.legend.fps = W,
            T.legend[f] = W ? "FPS" : "ms"),
            E = W ? H.fps : H.duration,
            T.count[f] = E > 999 ? "999+" : E.toFixed(E > 99 ? 0 : I.decimals)
        }
        function m() {
            for (S = p(),
            N < S - I.threshold && (H.fps -= H.fps / Math.max(1, 60 * I.smoothing / I.interval),
            H.duration = 1e3 / H.fps),
            A = I.history; A--; )
                G[A] = 0 === A ? H.fps : G[A - 1],
                V[A] = 0 === A ? H.duration : V[A - 1];
            if (g(),
            I.heat) {
                if (q.length)
                    for (A = q.length; A--; )
                        q[A].el.style[O[q[A].name].heatOn] = W ? d(O[q[A].name].heatmap, H.fps, 0, I.maxFps) : d(O[q[A].name].heatmap, H.duration, I.threshold, 0);
                if (T.graph && O.column.heatOn)
                    for (A = j.length; A--; )
                        j[A].style[O.column.heatOn] = W ? d(O.column.heatmap, G[A], 0, I.maxFps) : d(O.column.heatmap, V[A], I.threshold, 0)
            }
            if (T.graph)
                for (P = 0; P < I.history; P++)
                    j[P].style.height = (W ? G[P] ? Math.round(z / I.maxFps * Math.min(G[P], I.maxFps)) : 0 : V[P] ? Math.round(z / I.threshold * Math.min(V[P], I.threshold)) : 0) + "px"
        }
        function w() {
            20 > I.interval ? (M = u(w),
            m()) : (M = setTimeout(w, I.interval),
            C = u(m))
        }
        function y(t) {
            t = t || window.event,
            t.preventDefault ? (t.preventDefault(),
            t.stopPropagation()) : (t.returnValue = !1,
            t.cancelBubble = !0),
            H.toggle()
        }
        function v() {
            I.toggleOn && h(T.container, I.toggleOn, y, 1),
            t.removeChild(T.container)
        }
        function k() {
            if (T.container && v(),
            O = l.theme[I.theme],
            F = O.compiledHeatmaps || [],
            !F.length && O.heatmaps.length) {
                for (P = 0; P < O.heatmaps.length; P++)
                    for (F[P] = [],
                    A = 0; D >= A; A++) {
                        var e, o = F[P], a = A;
                        e = .33 / D * A;
                        var i = O.heatmaps[P].saturation
                          , p = O.heatmaps[P].lightness
                          , s = void 0
                          , c = void 0
                          , u = void 0
                          , d = u = void 0
                          , m = s = c = void 0
                          , m = void 0
                          , u = .5 >= p ? p * (1 + i) : p + i - p * i;
                        0 === u ? e = "#000" : (d = 2 * p - u,
                        c = (u - d) / u,
                        e *= 6,
                        s = Math.floor(e),
                        m = e - s,
                        m *= u * c,
                        0 === s || 6 === s ? (s = u,
                        c = d + m,
                        u = d) : 1 === s ? (s = u - m,
                        c = u,
                        u = d) : 2 === s ? (s = d,
                        c = u,
                        u = d + m) : 3 === s ? (s = d,
                        c = u - m) : 4 === s ? (s = d + m,
                        c = d) : (s = u,
                        c = d,
                        u -= m),
                        e = "#" + r(s) + r(c) + r(u)),
                        o[a] = e
                    }
                O.compiledHeatmaps = F
            }
            T.container = n(document.createElement("div"), O.container),
            T.count = T.container.appendChild(n(document.createElement("div"), O.count)),
            T.legend = T.container.appendChild(n(document.createElement("div"), O.legend)),
            T.graph = I.graph ? T.container.appendChild(n(document.createElement("div"), O.graph)) : 0,
            q.length = 0;
            for (var f in T)
                T[f] && O[f].heatOn && q.push({
                    name: f,
                    el: T[f]
                });
            if (j.length = 0,
            T.graph)
                for (T.graph.style.width = I.history * O.column.width + (I.history - 1) * O.column.spacing + "px",
                A = 0; A < I.history; A++)
                    j[A] = T.graph.appendChild(n(document.createElement("div"), O.column)),
                    j[A].style.position = "absolute",
                    j[A].style.bottom = 0,
                    j[A].style.right = A * O.column.width + A * O.column.spacing + "px",
                    j[A].style.width = O.column.width + "px",
                    j[A].style.height = "0px";
            n(T.container, I),
            g(),
            t.appendChild(T.container),
            T.graph && (z = T.graph.clientHeight),
            I.toggleOn && ("click" === I.toggleOn && (T.container.style.cursor = "pointer"),
            h(T.container, I.toggleOn, y))
        }
        "object" === o(t) && t.nodeType === e && (s = t,
        t = document.body),
        t || (t = document.body);
        var O, F, S, M, C, z, E, A, P, H = this, I = i({}, l.defaults, s || {}), T = {}, j = [], D = 100, q = [], L = 0, R = I.threshold, B = 0, N = p() - R, G = [], V = [], W = "fps" === I.show;
        H.options = I,
        H.fps = 0,
        H.duration = 0,
        H.isPaused = 0,
        H.tickStart = function() {
            B = p()
        }
        ,
        H.tick = function() {
            S = p(),
            L = S - N,
            R += (L - R) / I.smoothing,
            H.fps = 1e3 / R,
            H.duration = N > B ? R : S - B,
            N = S
        }
        ,
        H.pause = function() {
            return M && (H.isPaused = 1,
            clearTimeout(M),
            c(M),
            c(C),
            M = C = 0),
            H
        }
        ,
        H.resume = function() {
            return M || (H.isPaused = 0,
            w()),
            H
        }
        ,
        H.set = function(t, e) {
            return I[t] = e,
            W = "fps" === I.show,
            -1 !== a(t, x) && k(),
            -1 !== a(t, b) && n(T.container, I),
            H
        }
        ,
        H.showDuration = function() {
            return H.set("show", "ms"),
            H
        }
        ,
        H.showFps = function() {
            return H.set("show", "fps"),
            H
        }
        ,
        H.toggle = function() {
            return H.set("show", W ? "ms" : "fps"),
            H
        }
        ,
        H.hide = function() {
            return H.pause(),
            T.container.style.display = "none",
            H
        }
        ,
        H.show = function() {
            return H.resume(),
            T.container.style.display = "block",
            H
        }
        ,
        H.destroy = function() {
            H.pause(),
            v(),
            H.tick = H.tickStart = function() {}
        }
        ,
        k(),
        w()
    }
    var p, s = t.performance;
    p = s && (s.now || s.webkitNow) ? s[s.now ? "now" : "webkitNow"].bind(s) : function() {
        return +new Date
    }
    ;
    for (var c = t.cancelAnimationFrame || t.cancelRequestAnimationFrame, u = t.requestAnimationFrame, s = ["moz", "webkit", "o"], d = 0, g = 0, m = s.length; m > g && !c; ++g)
        u = (c = t[s[g] + "CancelAnimationFrame"] || t[s[g] + "CancelRequestAnimationFrame"]) && t[s[g] + "RequestAnimationFrame"];
    c || (u = function(e) {
        var n = p()
          , o = Math.max(0, 16 - (n - d));
        return d = n + o,
        t.setTimeout(function() {
            e(n + o)
        }, o)
    }
    ,
    c = function(t) {
        clearTimeout(t)
    }
    );
    var f = "string" === o(document.createElement("div").textContent) ? "textContent" : "innerText";
    l.extend = i,
    window.FPSMeter = l,
    l.defaults = {
        interval: 100,
        smoothing: 10,
        show: "fps",
        toggleOn: "click",
        decimals: 1,
        maxFps: 60,
        threshold: 100,
        position: "absolute",
        zIndex: 10,
        left: "auto",
        bottom: "15px",
        right: "15px",
        top: "auto",
        margin: "0 0 0 0",
        theme: "dark",
        heat: 0,
        graph: 0,
        history: 20
    };
    var x = ["toggleOn", "theme", "heat", "graph", "history"]
      , b = "position zIndex left top right bottom margin".split(" ")
}(window),
function(t, e) {
    e.theme = {};
    var n = e.theme.base = {
        heatmaps: [],
        container: {
            heatOn: null,
            heatmap: null,
            padding: "5px",
            minWidth: "95px",
            height: "30px",
            lineHeight: "30px",
            textAlign: "right",
            textShadow: "none"
        },
        count: {
            heatOn: null,
            heatmap: null,
            position: "absolute",
            top: 0,
            right: 0,
            padding: "5px 10px",
            height: "30px",
            fontSize: "24px",
            fontFamily: "Consolas, Andale Mono, monospace",
            zIndex: 2
        },
        legend: {
            heatOn: null,
            heatmap: null,
            position: "absolute",
            top: 0,
            left: 0,
            padding: "5px 10px",
            height: "30px",
            fontSize: "12px",
            lineHeight: "32px",
            fontFamily: "sans-serif",
            textAlign: "left",
            zIndex: 2
        },
        graph: {
            heatOn: null,
            heatmap: null,
            position: "relative",
            boxSizing: "padding-box",
            MozBoxSizing: "padding-box",
            height: "100%",
            zIndex: 1
        },
        column: {
            width: 4,
            spacing: 1,
            heatOn: null,
            heatmap: null
        }
    };
    e.theme.dark = e.extend({}, n, {
        heatmaps: [{
            saturation: .8,
            lightness: .8
        }],
        container: {
            background: "#222",
            color: "#fff",
            border: "1px solid #1a1a1a",
            textShadow: "1px 1px 0 #222"
        },
        count: {
            heatOn: "color"
        },
        column: {
            background: "#3f3f3f"
        }
    }),
    e.theme.light = e.extend({}, n, {
        heatmaps: [{
            saturation: .5,
            lightness: .5
        }],
        container: {
            color: "#666",
            background: "#fff",
            textShadow: "1px 1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5)",
            boxShadow: "0 0 0 1px rgba(0,0,0,.1)"
        },
        count: {
            heatOn: "color"
        },
        column: {
            background: "#eaeaea"
        }
    }),
    e.theme.colorful = e.extend({}, n, {
        heatmaps: [{
            saturation: .5,
            lightness: .6
        }],
        container: {
            heatOn: "backgroundColor",
            background: "#888",
            color: "#fff",
            textShadow: "1px 1px 0 rgba(0,0,0,.2)",
            boxShadow: "0 0 0 1px rgba(0,0,0,.1)"
        },
        column: {
            background: "#777",
            backgroundColor: "rgba(0,0,0,.2)"
        }
    }),
    e.theme.transparent = e.extend({}, n, {
        heatmaps: [{
            saturation: .8,
            lightness: .5
        }],
        container: {
            padding: 0,
            color: "#fff",
            textShadow: "1px 1px 0 rgba(0,0,0,.5)"
        },
        count: {
            padding: "0 5px",
            height: "40px",
            lineHeight: "40px"
        },
        legend: {
            padding: "0 5px",
            height: "40px",
            lineHeight: "42px"
        },
        graph: {
            height: "40px"
        },
        column: {
            width: 5,
            background: "#999",
            heatOn: "backgroundColor",
            opacity: .5
        }
    })
}(window, FPSMeter));
var Fps = pc.createScript("fps");
Fps.prototype.initialize = function() {
    "5004247" == Stats.GAME_ID && (this.fps = new FPSMeter({
        heat: !0,
        graph: !0
    }))
}
,
Fps.prototype.update = function(t) {
    this.fps && this.fps.tick()
}
;
var LeaderboardWinnersView = pc.createScript("leaderboardWinnersView");
LeaderboardWinnersView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
LeaderboardWinnersView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
LeaderboardWinnersView.attributes.add("topTitle", {
    type: "asset",
    assetType: "texture",
    title: "topTitle"
}),
LeaderboardWinnersView.attributes.add("rankContainer", {
    type: "asset",
    assetType: "texture",
    title: "rankContainer"
}),
LeaderboardWinnersView.attributes.add("buttonFullSize", {
    type: "asset",
    assetType: "texture",
    title: "buttonFullSize"
}),
LeaderboardWinnersView.prototype.initialize = function() {
    var e = document.createElement("style");
    document.head.appendChild(e);
    var t = this.css.resource.replace(/assetTag_rankContainer/g, this.rankContainer.getFileUrl());
    t = t.replace(/assetTag_buttonFullSize/g, this.buttonFullSize.getFileUrl()),
    e.innerHTML = t,
    this.div = document.createElement("div"),
    this.div.classList.add("leaderboardWinnersContainer");
    var a = this.html.resource.replace(/assetTag_topTitle/g, this.topTitle.getFileUrl());
    this.div.innerHTML = a,
    document.body.appendChild(this.div),
    this.app.off("weeklyManager:newLeaderboardWeek", this.onNewLeaderboardWeek, this),
    this.app.on("weeklyManager:newLeaderboardWeek", this.onNewLeaderboardWeek, this),
    this.app.off("leaderboardManager:leaderboardPeriodUpdated", this.onLeaderboardPeriodUpdated, this),
    this.app.on("leaderboardManager:leaderboardPeriodUpdated", this.onLeaderboardPeriodUpdated, this),
    this.displayType = this.div.style.display,
    this.hide()
}
,
LeaderboardWinnersView.prototype.onNewLeaderboardWeek = function() {
    Flags.DISABLE_LEADERBOARD || this.show()
}
,
LeaderboardWinnersView.prototype.onLeaderboardPeriodUpdated = function(e, t) {
    var a = this.div.querySelector(".leaderboardWinners");
    if (a) {
        this.ul ? this.ul.innerHTML = "" : (this.ul = document.createElement("ul"),
        this.ul.classList.add("leaderboardWinnersList"),
        a.appendChild(this.ul));
        for (var i = 0; i < e.length; i++) {
            var r = document.createElement("li");
            r.classList.add("leaderboardWinnersListItem");
            var d = document.createElement("span")
              , s = e[i][0] + 1;
            d.textContent = s,
            d.classList.add("leaderboardWinnersListItemRank"),
            r.appendChild(d);
            var n = document.createElement("span");
            n.textContent = e[i][1],
            n.classList.add("leaderboardWinnersListItemName"),
            r.appendChild(n);
            var o = document.createElement("span");
            o.textContent = LeaderboardView.formatScore(e[i][2]),
            o.classList.add("leaderboardWinnersListItemScore"),
            r.appendChild(o),
            this.ul.appendChild(r)
        }
        this.okButton || (this.okButton = document.createElement("div"),
        this.okButton.classList.add("leaderboardWinnersOkButton"),
        this.okButton.textContent = "OK",
        a.appendChild(this.okButton),
        this.okButton.addEventListener("click", this.onOkClicked, !1))
    }
}
,
LeaderboardWinnersView.prototype.onOkClicked = function() {
    var e = pc.app.root.findByName("Views").script.leaderboardWinnersView;
    e.hide(),
    SoundManager.playGlobalSound("ButtonClick")
}
,
LeaderboardWinnersView.prototype.show = function() {
    Stats.log(Stats.COUNTER_LB_INTERACT, "", Stats.KINGDOM_VIEW_WINNERS, "", "", "", ""),
    this.div.style.display = this.displayType
}
,
LeaderboardWinnersView.prototype.hide = function() {
    this.div.style.display = "none"
}
;
var WeeklyManager = pc.createScript("weeklyManager")
  , LoadState = {
    NONE: 1,
    ONE: 2,
    COMPLETE: 3
};
WeeklyManager.prototype.initialize = function() {
    this.loadState = LoadState.NONE,
    this.app.off("platformFacade:gameStarted", this.onGameStarted, this),
    this.app.on("platformFacade:gameStarted", this.onGameStarted, this),
    this.app.off("leaderboardManager:leaderboardPeriodNumberUpdated", this.onLeaderboardPeriodNumberUpdated, this),
    this.app.on("leaderboardManager:leaderboardPeriodNumberUpdated", this.onLeaderboardPeriodNumberUpdated, this)
}
,
WeeklyManager.prototype.nextLoadState = function() {
    this.loadState++,
    console.log("weeklyManager new load state: " + this.loadState),
    this.loadState == LoadState.COMPLETE && this.evaluateNewWeek()
}
,
WeeklyManager.prototype.onGameStarted = function() {
    var e = this.app || pc.app
      , a = e.root.findByName("GameManager").script.weeklyManager;
    console.log("Getting lastPeriodNumber..."),
    Zynga.Instant.player.getDataAsync(["lastPeriodNumber"]).then(function(e) {
        e.lastPeriodNumber ? (a.lastPeriodNumber = e.lastPeriodNumber,
        console.log("lastPeriodNumber from FB blob: " + a.lastPeriodNumber)) : (a.lastPeriodNumber = 0,
        console.log("lastPeriodNumber default: " + a.lastPeriodNumber)),
        a.nextLoadState()
    })
}
,
WeeklyManager.prototype.onLeaderboardPeriodNumberUpdated = function(e) {
    this.periodNumber = e,
    this.nextLoadState()
}
,
WeeklyManager.prototype.evaluateNewWeek = function() {
    var e = this.app || pc.app
      , a = e.root.findByName("GameManager").script.weeklyManager;
    console.log("evaluating new week: " + a.lastPeriodNumber + "(last) vs " + a.periodNumber + "(now)"),
    a.lastPeriodNumber < a.periodNumber && (window.Zynga.Instant.player.setDataAsync({
        lastPeriodNumber: a.periodNumber
    }).then(function() {
        console.log("Set data async lastPeriodNumber: " + a.periodNumber)
    }),
    a.raiseNewLeaderboardWeek())
}
,
WeeklyManager.prototype.raiseNewLeaderboardWeek = function() {
    this.app.fire("weeklyManager:newLeaderboardWeek")
}
;
var DebugManager = pc.createScript("debugManager");
DebugManager.prototype.initialize = function() {
    this.app.off("debugView:resetAccount", this.onResetAccount, this),
    this.app.on("debugView:resetAccount", this.onResetAccount, this)
}
,
DebugManager.prototype.onResetAccount = function() {
    if (PlatformFacade.currentPlatform != PlatformFacade.PLATFORM.FB_INSTANT)
        return void console.log("Cannot reset account for non-facebook builds.");
    var e = this.app || pc.app
      , t = e.root.findByName("GameManager").script.debugManager;
    t.resetRequests = 2,
    console.log("Resetting facebook account..."),
    window.Zynga.Instant.player.setDataAsync({
        highScore: 0
    }).then(function() {
        console.log("Reset data async highScore."),
        t.resetStepComplete()
    }),
    window.Zynga.Instant.player.setDataAsync({
        lastPeriodNumber: 0
    }).then(function() {
        console.log("Reset data async periodNumber."),
        t.resetStepComplete()
    })
}
,
DebugManager.prototype.resetStepComplete = function() {
    this.resetRequests--,
    0 === this.resetRequests && this.app.fire("debugManager:resetAccountComplete")
}
;
var DebugView = pc.createScript("debugView");
DebugView.attributes.add("css", {
    type: "asset",
    assetType: "css",
    title: "CSS Asset"
}),
DebugView.attributes.add("html", {
    type: "asset",
    assetType: "html",
    title: "HTML Asset"
}),
DebugView.prototype.initialize = function() {
    var e = document.createElement("style");
    document.head.appendChild(e),
    e.innerHTML = this.css.resource,
    this.div = document.createElement("div"),
    this.div.classList.add("debugContainer"),
    this.div.innerHTML = this.html.resource || "",
    document.body.appendChild(this.div),
    this.displayType = this.div.style.display,
    this.hide(),
    this.app.off("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.on("gameManager:gameStateChanged", this.onGameStateChanged, this),
    this.app.off("debugManager:resetAccountComplete", this.onResetAccountComplete, this),
    this.app.on("debugManager:resetAccountComplete", this.onResetAccountComplete, this);
    var t = this.div.querySelector(".debugResetAccountButton");
    t && t.addEventListener("click", this.onResetAccountClicked, !1)
}
,
DebugView.prototype.onResetAccountClicked = function() {
    var e = pc.app.root.findByName("Views").script.debugView;
    e.raiseResetAccount(),
    SoundManager.playGlobalSound("ButtonClick")
}
,
DebugView.prototype.raiseResetAccount = function() {
    var e = this.div.querySelector(".debugResetAccountButton");
    e && (e.removeEventListener("click", this.onResetAccountClicked, !1),
    this.app.fire("debugView:resetAccount"))
}
,
DebugView.prototype.onResetAccountComplete = function() {
    var e = this.div.querySelector(".debugResetAccountButton");
    e && (e.innerHTML = "Complete")
}
,
DebugView.prototype.onGameStateChanged = function(e) {
    "5004247" == Stats.GAME_ID && e == GameState.MENU ? this.show() : this.hide()
}
,
DebugView.prototype.show = function() {
    this.div.style.display = this.displayType
}
,
DebugView.prototype.hide = function() {
    this.div.style.display = "none"
}
;
