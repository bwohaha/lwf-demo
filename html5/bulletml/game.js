// Generated by CoffeeScript 1.6.2
(function() {
  var Enemy, Game, Obj, Player, Shot, game, keyState, lastTime, timer, vendor, _i, _len, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (window.requestAnimationFrame == null) {
    _ref = ['webkit', 'moz'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      vendor = _ref[_i];
      window.requestAnimationFrame = window[vendor + 'RequestAnimationFrame'];
      if (window.requestAnimationFrame != null) {
        break;
      }
    }
  }

  if (window.requestAnimationFrame == null) {
    lastTime = 0;
    window.requestAnimationFrame = function(callback, element) {
      var currTime, id, timeToCall, timeoutCallback;

      currTime = new Date().getTime();
      if (lastTime === 0) {
        lastTime = currTime;
      }
      timeToCall = Math.max(0, 16 - (currTime - lastTime));
      timeoutCallback = function() {
        return callback(currTime + timeToCall);
      };
      id = window.setTimeout(timeoutCallback, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  game = null;

  keyState = [];

  timer = {};

  Obj = (function() {
    function Obj(x, y, d, v, name) {
      this.x = x;
      this.y = y;
      this.d = d;
      this.v = v;
      this.alive = true;
      this.bitmap = null;
      this.x0 = this.sx0 = 0;
      this.y0 = this.sy0 = 0;
      this.x1 = this.sx1 = game.width;
      this.y1 = this.sy1 = game.height;
      if (name) {
        this.attachBitmap(name);
      }
    }

    Obj.prototype.attachBitmap = function(name) {
      this.bitmap = game.attachBitmap(name);
      this.bitmap.regX = this.bitmap.width / 2;
      this.bitmap.regY = this.bitmap.height / 2;
      this.x0 += this.bitmap.regX;
      this.y0 += this.bitmap.regY;
      this.x1 -= this.bitmap.regX;
      this.y1 -= this.bitmap.regY;
      this.sx0 -= this.bitmap.regX;
      this.sy0 -= this.bitmap.regY;
      this.sx1 += this.bitmap.regX;
      this.sy1 += this.bitmap.regY;
    };

    Obj.prototype.move = function() {};

    Obj.prototype.draw = function() {
      if (this.bitmap) {
        this.bitmap.x = this.x;
        this.bitmap.y = this.y;
      }
    };

    Obj.prototype.ensureBounded = function() {
      if (this.x < this.x0) {
        this.x = this.x0;
      } else if (this.x > this.x1) {
        this.x = this.x1;
      }
      if (this.y < this.y0) {
        this.y = this.y0;
      } else if (this.y > this.y1) {
        this.y = this.y1;
      }
    };

    Obj.prototype.checkBounded = function() {
      if (this.x < this.sx0 || this.x > this.sx1 || this.y < this.sy0 || this.y > this.sy1) {
        this.doVanish();
      }
    };

    Obj.prototype.doVanish = function() {
      this.alive = false;
      game.detachBitmap(this.bitmap);
      this.bitmap = null;
    };

    return Obj;

  })();

  Shot = (function(_super) {
    __extends(Shot, _super);

    function Shot(x, y, d, v, name) {
      if (name == null) {
        name = 'w';
      }
      Shot.__super__.constructor.call(this, x, y, d, v, name);
    }

    Shot.prototype.move = function() {
      var r;

      r = Math.PI * this.d / 180;
      this.x += Math.sin(r) * this.v;
      this.y -= Math.cos(r) * this.v;
      this.checkBounded();
    };

    return Shot;

  })(Obj);

  Player = (function(_super) {
    __extends(Player, _super);

    function Player() {
      Player.__super__.constructor.call(this, game.width / 2, 350, 0, 0, 'r');
    }

    Player.prototype.move = function() {
      var d, r, v;

      v = keyState[90] ? 1 : 2;
      d = -1;
      if (keyState[38]) {
        if (keyState[39]) {
          d = 45;
        } else if (keyState[37]) {
          d = -45;
        } else {
          d = 0;
        }
      } else if (keyState[40]) {
        if (keyState[39]) {
          d = 135;
        } else if (keyState[37]) {
          d = -135;
        } else {
          d = 180;
        }
      } else if (keyState[39]) {
        d = 90;
      } else if (keyState[37]) {
        d = -90;
      }
      if (d !== -1) {
        r = Math.PI * d / 180;
        this.x += Math.sin(r) * v;
        this.y -= Math.cos(r) * v;
        this.ensureBounded();
      }
    };

    return Player;

  })(Obj);

  Enemy = (function(_super) {
    __extends(Enemy, _super);

    function Enemy(runner, x, y, d, v, name) {
      this.runner = runner;
      Enemy.__super__.constructor.call(this, x, y, d, v, name);
      this.isBoss = name === 'g';
      this.runner.obj = this;
    }

    Enemy.prototype.move = function() {
      var r;

      if (!this.alive) {
        return;
      }
      this.runner.run();
      r = Math.PI * this.d / 180;
      this.x += Math.sin(r) * this.v;
      this.y += -Math.cos(r) * this.v;
      if (this.isBoss) {
        this.ensureBounded();
      } else {
        this.checkBounded();
      }
    };

    Enemy.prototype.getRank = function() {
      return 0;
    };

    Enemy.prototype.getTurn = function() {
      return timer.tick;
    };

    Enemy.prototype.getDefaultSpeed = function() {
      return 1;
    };

    Enemy.prototype.getAimDirection = function() {
      var dx, dy;

      dx = game.player.x - this.x;
      dy = game.player.y - this.y;
      return Math.atan2(dx, -dy) * 180 / Math.PI;
    };

    Enemy.prototype.getBulletSpeedX = function() {
      var r;

      r = Math.PI * this.d / 180;
      return Math.sin(r) * this.v;
    };

    Enemy.prototype.getBulletSpeedY = function() {
      var r;

      r = Math.PI * this.d / 180;
      return -Math.cos(r) * this.v;
    };

    Enemy.prototype.getBulletDirection = function() {
      return this.d;
    };

    Enemy.prototype.getBulletSpeed = function() {
      return this.v;
    };

    Enemy.prototype.createSimpleBullet = function(d, v) {
      var shot;

      shot = new Shot(this.x, this.y, d, v);
      game.objs.push(shot);
    };

    Enemy.prototype.createBullet = function(state, d, v) {
      var color, hasFire, runner, shot;

      runner = new BulletMLRunner(state.bulletml, state);
      hasFire = state.nodes[0].getElementsByTagName('fire') || state.nodes[0].getElementsByTagName('fireRef');
      color = hasFire != null ? hasFire : {
        'wg': 'wr'
      };
      shot = new Enemy(runner, this.x, this.y, d, v, color, false);
      objs.push(shot);
    };

    Enemy.prototype.doChangeDirection = function(d) {
      this.d = d;
    };

    Enemy.prototype.doChangeSpeed = function(v) {
      this.v = v;
    };

    Enemy.prototype.doAccelX = function(vx) {
      var vy;

      vy = this.getBulletSpeedY();
      this.v = Math.sqrt(vx * vx + vy * vy);
      this.d = Math.atan2(vx, -vy) * 180 / Math.PI;
    };

    Enemy.prototype.doAccelY = function(vy) {
      var vx;

      vx = this.getBulletSpeedX();
      this.v = Math.sqrt(vx * vx + vy * vy);
      this.d = Math.atan2(vx, -vy) * 180 / Math.PI;
    };

    return Enemy;

  })(Obj);

  Game = (function() {
    function Game(touchDelegate, stage, stats, width, height, xml) {
      this.touchDelegate = touchDelegate;
      this.stage = stage;
      this.width = width;
      this.height = height;
      this.xml = xml;
      this.onrelease = __bind(this.onrelease, this);
      this.onpress = __bind(this.onpress, this);
      this.onmove = __bind(this.onmove, this);
      this.requests = [];
      this.stats = new Stats();
      stats.appendChild(this.stats.domElement);
      LWF.useWebGLRenderer();
    }

    Game.prototype.requestLWF = function(lwfName, onload) {
      var prefix;

      if (lwfName.match(/(.*\/)([^\/]+)/)) {
        prefix = RegExp.$1;
        lwfName = RegExp.$2;
      } else {
        prefix = "";
      }
      this.requests.push({
        lwf: lwfName,
        prefix: prefix,
        stage: this.stage,
        onload: onload
      });
    };

    Game.prototype.loadLWFs = function(onloadall) {
      LWF.ResourceCache.get().loadLWFs(this.requests, onloadall);
      this.requests = [];
    };

    Game.prototype.load = function(lwfName) {
      var _this = this;

      this.requestLWF(lwfName, function(lwf) {
        return _this.lwf = lwf;
      });
      this.loadLWFs(function(errors) {
        if (errors == null) {
          return _this.init();
        }
      });
    };

    Game.prototype.attachBitmap = function(name) {
      var bitmap, cache, path;

      path = "ball_" + name + ".png";
      cache = this.bitmapCache[name];
      if ((cache != null ? cache.length : void 0) > 0) {
        bitmap = cache.pop();
        bitmap.visible = true;
      } else {
        bitmap = this.world.attachBitmap(path, this.bitmapCount++);
      }
      return bitmap;
    };

    Game.prototype.detachBitmap = function(bitmap) {
      var _base, _name, _ref1;

      bitmap.visible = false;
      if ((_ref1 = (_base = this.bitmapCache)[_name = bitmap.name]) == null) {
        _base[_name] = [];
      }
      this.bitmapCache[bitmap.name].push(bitmap);
    };

    Game.prototype.getTime = function() {
      return Date.now() / 1000.0;
    };

    Game.prototype.inputPoint = function(e) {
      var x, y;

      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - this.stage.offsetLeft;
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop - this.stage.offsetTop;
      this.lwf.inputPoint(x, y);
    };

    Game.prototype.inputPress = function(e) {
      this.inputPoint(e);
      this.lwf.inputPress();
    };

    Game.prototype.inputRelease = function(e) {
      this.inputPoint(e);
      this.lwf.inputRelease();
    };

    Game.prototype.onmove = function(e) {
      var _this = this;

      (function(e) {
        _this.inputQueue.push(function() {
          return _this.inputPoint(e);
        });
      })(e);
    };

    Game.prototype.onpress = function(e) {
      var _this = this;

      (function(e) {
        _this.inputQueue.push(function() {
          return _this.inputPress(e);
        });
      })(e);
    };

    Game.prototype.onrelease = function(e) {
      var _this = this;

      (function(e) {
        _this.inputQueue.push(function() {
          return _this.inputRelease(e);
        });
      })(e);
    };

    Game.prototype.init = function() {
      var enemy;

      this.inputQueue = [];
      this.lwf.rendererFactory.fitForHeight(this.lwf);
      this.from = this.getTime();
      timer.tick = 0;
      this.world = this.lwf.rootMovie.attachEmptyMovie("world");
      this.bitmapCache = {};
      this.bitmapCount = 0;
      this.objs = [];
      this.player = new Player;
      this.objs.push(this.player);
      this.runner = new BulletMLRunner(this.xml);
      enemy = new Enemy(this.runner, this.width / 2, 100, 0, 0, 'g');
      this.objs.push(enemy);
      this.exec();
      /*
      @touchDelegate.addEventListener("mousedown", @onpress, false)
      @touchDelegate.addEventListener("mousemove", @onmove, false)
      @touchDelegate.addEventListener("mouseup", @onrelease, false)
      @touchDelegate.addEventListener("touchstart", @onpress, false)
      @touchDelegate.addEventListener("touchmove", @onmove, false)
      @touchDelegate.addEventListener("touchend", @onrelease, false)
      */

    };

    Game.prototype.exec = function() {
      var input, nobjs, obj, tick, time, _j, _k, _l, _len1, _len2, _len3, _len4, _m, _ref1, _ref2, _ref3, _ref4,
        _this = this;

      ++timer.tick;
      time = this.getTime();
      tick = time - this.from;
      this.from = time;
      _ref1 = this.inputQueue;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        input = _ref1[_j];
        input();
      }
      this.inputQueue = [];
      _ref2 = this.objs;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        obj = _ref2[_k];
        if (obj.alive) {
          obj.move();
        }
      }
      if (timer.tick % 20 === 0) {
        nobjs = [];
        _ref3 = this.objs;
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          obj = _ref3[_l];
          nobjs.push(obj);
        }
        this.objs = nobjs;
      }
      _ref4 = this.objs;
      for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
        obj = _ref4[_m];
        if (obj.alive) {
          obj.draw();
        }
      }
      this.lwf.exec(tick);
      this.lwf.render();
      this.stats.update();
      requestAnimationFrame(function() {
        return _this.exec();
      });
    };

    return Game;

  })();

  window.onload = function() {
    var div, h, src, stage, stats, w, xhr;

    div = document.getElementById("touchDelegate");
    stage = document.getElementById("stage");
    stats = document.getElementById("stats");
    w = stage.width;
    h = stage.height;
    stage.style.width = stage.width + "px";
    stage.style.height = stage.height + "px";
    stage.width *= window.devicePixelRatio;
    stage.height *= window.devicePixelRatio;
    src = "test.xml";
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      var xml;

      if (xhr.readyState === 4) {
        if (xhr.responseXML == null) {
          throw new Error("" + xhr.status + ":" + src);
        } else {
          xml = xhr.responseXML.getElementsByTagName('bulletml')[0];
          game = new Game(div, stage, stats, w, h, xml);
          game.load("game.lwf");
          return window.game = game;
        }
      }
    };
    xhr.open('GET', src, true);
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("application/xml");
    }
    xhr.send(null);
  };

  document.onkeydown = function(ev) {
    if (ev != null) {
      return keyState[ev.keyCode] = 1;
    }
  };

  document.onkeyup = function(ev) {
    if (!ev) {
      return;
    }
    if (ev != null) {
      return keyState[ev.keyCode] = 0;
    }
  };

}).call(this);
