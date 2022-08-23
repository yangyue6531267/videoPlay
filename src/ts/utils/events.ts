class Events {
  events: {};
  videoEvents: string[];
  playerEvents: string[];
  genseeEvents: string[];
  userEvents: string[];
  constructor() {
    this.events = {};

    this.videoEvents = [
      "abort",
      "canplay",
      "canplaythrough",
      "durationchange",
      "emptied",
      "ended",
      "error",
      "loadeddata",
      "loadedmetadata",
      "loadstart",
      "mozaudioavailable",
      "pause",
      "play",
      "playing",
      "progress",
      "ratechange",
      "seeked",
      "seeking",
      "stalled",
      "suspend",
      "timeupdate",
      "volumechange",
      "waiting",
    ];
    this.playerEvents = [
      "firstPlay",
      "status",
      "contextmenu_show",
      "contextmenu_hide",
      "notice_show",
      "notice_hide",
      "quality_start",
      "quality_end",
      "destroy",
      "resize",
      "fullscreen",
      "fullscreen_cancel",
      "webfullscreen",
      "webfullscreen_cancel",
    ];
    this.genseeEvents = ["onChapter", "onFileDuration"];
    this.userEvents = ['chatList', 'loginInfo', 'playBackSet', 'playBackBackground', 'playBackTime', 'shareDocBl', 'playBackFile', 'userError'];
  }

  on(name, callback) {
    if (this.type(name) && typeof callback === "function") {
      if (!this.events[name]) {
        this.events[name] = [];
      }
      this.events[name].push(callback);
    }
  }

  trigger(name, info?) {
    if (this.events[name] && this.events[name].length) {
      for (let i = 0; i < this.events[name].length; i++) {
        this.events[name][i](info);
      }
    }
  }

  // 取消订阅方法
  unsubscribe(type, cb) {
    if (this.events[type]) {
      const cbIndex = this.events[type].findIndex(e => e === cb)
      if (cbIndex != -1) {
        this.events[type].splice(cbIndex, 1);
      }
    }
    if (this.events[type].length === 0) {
      delete this.events[type];
    }
  }

  unsubscribeAll(type) {
    if (this.events[type]) {
      delete this.events[type];
    }
  }

  type(name) {
    if (this.playerEvents.indexOf(name) !== -1) {
      return "player";
    } else if (this.videoEvents.indexOf(name) !== -1) {
      return "video";
    } else if (this.genseeEvents.indexOf(name) !== -1) {
      return "gensee";
    } else if (this.userEvents.indexOf(name) !== -1) {
      return "user";
    }

    console.error(`Unknown event name: ${name}`);
    return null;
  }
}

export default Events;
