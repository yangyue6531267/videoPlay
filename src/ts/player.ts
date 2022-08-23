var tplVideo = require("../template/video.art");
var tplAudio = require("../template/audio.art");

import Bar from "./bar";
import Bezel from "./bezel";
import Controller from "./controller";
import FullScreen from "./fullscreen";
import Template from "./template";
import Events from "./utils/events";
import i18n from "./utils/i18n";
import handleOption from "./utils/options";
import User from "./utils/user";
import utils from "./utils/utils";
import Timer from "./timer";
import HotKey from "./hotkey";
import ContextMenu from "./contextmenu";
// import Drawing from 'drawingboard'
import Icons from "./icons";
// import api from "./utils/api";
import Hls from 'hls.js';

import * as workerTimers from "worker-timers";

let index = 0;
const instances: any[] = [];

class CloudPlayback {
  options: any = null;
  template: any = null;
  tran: any = null;
  events: Events;
  user: User;
  container: any;
  arrow: boolean;
  video: any;
  audio: any;
  type: any;
  plugins: any;
  noticeTime: any;
  // confId: any;
  isLive: any;
  qualityIndex: any;
  quality: any;
  fullScreen: any;
  bezel: any;
  bar: any;
  controller: any;
  focus: any;
  paused: any;
  timer: any;
  hotkey: any;
  contextmenu: any;
  switchingQuality: any;
  prevVideo: any;
  ArrayM3u8: any;
  VodPath: any;
  is_firstPlay: boolean;
  recordId: string;
  prevVideoCurrentTime: any;
  seekEnd: boolean
  // DrawingBoard: any;
  // ifarmeDom: any

  VodVideoData: {
    currentIndex: number;
    duration: number;
    currentTime: number;
  };
  watchMaxDurationCountData: {
    flag: boolean;
    speedValue: number;
    timer: any;
    methodFlag: any;
    currentPosChange: any;
    currentDurationChange: any;
    faultStaus: boolean;
    watchMaxDuration: number;
  };
  docClickFun: () => void;
  containerClickFun: () => void;
  documentContainer: any;
  controllerContainer: any;

  constructor(options) {
    this.options = handleOption({
      // preload: options.video.type === "webtorrent" ? "none" : "metadata",
      ...options,
    });
    this.is_firstPlay = false;
    this.seekEnd = true;

    this.docClickFun = () => {
      this.focus = false;
    };
    this.containerClickFun = () => {
      this.focus = true;
    };
    this.watchMaxDurationCountData = {
      flag: false,
      speedValue: 1000,
      timer: null,
      methodFlag: null,
      currentPosChange: null,
      currentDurationChange: null,
      faultStaus: false,
      watchMaxDuration: 0,
    };
    this.VodVideoData = {
      currentIndex: 0,
      duration: 0,
      currentTime: 0,
    };
    this.tran = new i18n(this.options.lang).tran;
    this.events = new Events();
    this.user = new User(this);
    this.container = this.options.container;
    if (this.options.documentContainer) {
      this.documentContainer = this.options.documentContainer;
    }
    if (this.options.controllerContainer) {
      this.controllerContainer = this.options.controllerContainer;
      // this.controllerContainer.classList.add("CloudPlayback-controller-box");
    } else {
    }

    this.recordId = this.options.recordId;

    this.container.classList.add("CloudPlayback");
    if (this.options.live) {
      this.container.classList.add("CloudPlayback-live");
    } else {
      this.container.classList.remove("CloudPlayback-live");
    }
    if (utils.isMobile) {
      this.container.classList.add("CloudPlayback-mobile");
    }
    this.arrow = this.container.offsetWidth <= 500;
    if (this.arrow) {
      this.container.classList.add("CloudPlayback-arrow");
    }
  }

  notice(text, time = 2000, opacity = 0.8) {
    this.template.notice.innerHTML = text;
    this.template.notice.style.opacity = opacity;
    if (this.noticeTime) {
      clearTimeout(this.noticeTime);
    }
    this.events.trigger("notice_show", text);
    if (time > 0) {
      this.noticeTime = setTimeout(() => {
        this.template.notice.style.opacity = 0;
        this.events.trigger("notice_hide");
      }, time);
    }
  }

  async init() {
    if (this.recordId == '') {
      this.events.trigger('userError', 'recordId必填')
    } else {
      const { DrawingData, url } = await this.user.userLogin(this.recordId) as any;
      // const DrawingData = await this.user.getPlayback(this.recordId)
      this.options.video.quality = url;
      if (this.options.video.quality) {
        this.qualityIndex = this.options.video.defaultQuality;
        this.quality = this.options.video.quality[this.options.video.defaultQuality];
      }
      this.template = new Template({
        container: this.container,
        documentContainer: this.documentContainer,
        controllerContainer: this.controllerContainer,
        options: this.options,
        index: index,
        tran: this.tran,
      });
      this.video = this.template.video;
      this.audio = this.template.audio;
      if (this.options.video.quality) {
        this.video.src = this.quality.url;
      }

      if (DrawingData) {
        this.user.initDrawingboard(DrawingData);
      }

      this.bar = new Bar(this.template);

      this.bezel = new Bezel(this.template.bezel);

      this.fullScreen = new FullScreen(this);

      this.controller = new Controller(this);
      this.plugins = {};

      this.container.addEventListener("click", this.containerClickFun, true);
      this.paused = true;

      this.timer = new Timer(this);

      this.hotkey = new HotKey(this);

      this.contextmenu = new ContextMenu(this);

      this.initVideo(this.video, (this.quality && this.quality.type) || this.options.video.type);

      index++;
      instances.push(this);
    }

  }




  watchMaxDurationCount() {
    if (this.watchMaxDurationCountData.flag) {
      if (this.watchMaxDurationCountData.timer) {
        workerTimers.clearInterval(this.watchMaxDurationCountData.timer);
        this.watchMaxDurationCountData.timer = null;
      }
      this.watchMaxDurationCountData.timer = workerTimers.setInterval(() => {
        this.watchMaxDurationCountData.methodFlag = new Date().getTime();
        this.watchMaxDurationCountData.speedValue = this.options.playAudio ? this.video.playbackRate * 1 : this.audio.playbackRate * 1;
        if (!this.watchMaxDurationCountData.flag && this.watchMaxDurationCountData.timer) {
          workerTimers.clearInterval(this.watchMaxDurationCountData.timer);
          this.watchMaxDurationCountData.timer = null;
        }
        this.watchMaxDurationCountData.watchMaxDuration += this.watchMaxDurationCountData.speedValue;
        console.debug("[watchMaxDurationCount] watchMaxDuration=" + this.watchMaxDurationCountData.watchMaxDuration);
        // watchMaxDurationCount();
      }, 1000);
    }
    var lastTime = this.VodVideoData.currentTime;
    workerTimers.setTimeout(() => {
      if (lastTime != 0 && this.VodVideoData.currentTime != 0 && this.VodVideoData.currentTime == lastTime) {
        this.watchMaxDurationCountData.flag = false;
      }
    }, 3000);
    if (!this.watchMaxDurationCountData.faultStaus) {
      this.posChangeFault();
    }
  }
  posChangeFault() {
    workerTimers.setTimeout(() => {
      var pos = Math.round(this.VodVideoData.currentTime * 1000);
      if (pos > this.watchMaxDurationCountData.currentPosChange && this.watchMaxDurationCountData.watchMaxDuration == this.watchMaxDurationCountData.currentDurationChange) {
        this.watchMaxDurationCountData.flag = true;
        this.watchMaxDurationCount();
      }
      this.watchMaxDurationCountData.currentPosChange = JSON.stringify(pos);
      this.watchMaxDurationCountData.currentDurationChange = JSON.stringify(this.watchMaxDurationCountData.watchMaxDuration);
      this.posChangeFault();
    }, 1000);
    this.watchMaxDurationCountData.faultStaus = true;
  }
  /**
   * Seek video
   */
  seek(time) {
    time = Math.max(time, 0);
    if (this.video.duration) {
      time = Math.min(time, this.video.duration);
    }
    if (this.seekEnd) {
      if (this.video.currentTime < time) {
        this.notice(`${this.tran("FF")} ${(time - this.video.currentTime).toFixed(0)} ${this.tran("s")}`);
      } else if (this.video.currentTime > time) {
        this.notice(`${this.tran("REW")} ${(this.video.currentTime - time).toFixed(0)} ${this.tran("s")}`);
      }
    }
    if (this.options.playAudio) {
      this.video.currentTime = time;
      this.bar.set("played", time / this.video.duration, "width");
    } else {
      this.audio.currentTime = time;
      this.bar.set("played", time / this.audio.duration, "width");
    }
    // <!-- 跳转后需要调用 -->
    if (this.seekEnd) {
      this.user.NewDrawing('playSeek', time)
    }
    this.template.ptime.innerHTML = utils.secondToTime(time);
  }

  /**
   * Play video
   */
  play(fromNative?) {
    this.paused = false;
    if (this.video.paused && !utils.isMobile) {
      this.bezel.switch(Icons.play);
    }

    this.template.playButton.innerHTML = Icons.pause;
    this.template.mobilePlayButton.innerHTML = Icons.pause;

    if (!fromNative) {
      const playedPromise = Promise.resolve(this.video.play());
      playedPromise
        .catch(() => {
          this.pause();
        })
        .then(() => { });
    }
    this.timer.enable("loading");
    this.container.classList.remove("CloudPlayback-paused");
    this.container.classList.add("CloudPlayback-playing");
    if (this.options.mutex) {
      for (let i = 0; i < instances.length; i++) {
        if (this !== instances[i]) {
          instances[i].pause();
        }
      }
    }
  }

  /**
   * Pause video
   */
  pause(fromNative?) {
    this.paused = true;
    this.container.classList.remove("CloudPlayback-loading");

    if (!this.video.paused && !utils.isMobile) {
      this.bezel.switch(Icons.pause);
    }

    this.template.playButton.innerHTML = Icons.play;
    this.template.mobilePlayButton.innerHTML = Icons.play;
    if (!fromNative) {
      this.video.pause();
    }
    this.timer.disable("loading");
    this.container.classList.remove("CloudPlayback-playing");
    this.container.classList.add("CloudPlayback-paused");
  }

  switchVolumeIcon() {
    if (this.volume() >= 0.95) {
      this.template.volumeIcon.innerHTML = Icons.volumeUp;
    } else if (this.volume() > 0) {
      this.template.volumeIcon.innerHTML = Icons.volumeDown;
    } else {
      this.template.volumeIcon.innerHTML = Icons.volumeOff;
    }
  }

  /**
   * Set volume
   */
  volume(percentage?, nostorage?, nonotice?) {
    percentage = parseFloat(percentage);
    if (!isNaN(percentage)) {
      percentage = Math.max(percentage, 0);
      percentage = Math.min(percentage, 1);
      this.bar.set("volume", percentage, "width");
      const formatPercentage = `${(percentage * 100).toFixed(0)}%`;
      this.template.volumeBarWrapWrap.dataset.balloon = formatPercentage;
      if (!nostorage) {
        this.user.set("volume", percentage);
      }
      if (!nonotice) {
        this.notice(`${this.tran("Volume")} ${(percentage * 100).toFixed(0)}%`);
      }
      if (this.options.playAudio) {
        this.video.volume = percentage;
        if (this.video.muted) {
          this.video.muted = false;
        }
      } else {
        this.audio.volume = percentage;
        if (this.audio.muted) {
          this.audio.muted = false;
        }
      }
      this.switchVolumeIcon();
    }

    return this.video.volume;
  }

  /**
   * Toggle between play and pause
   */
  toggle() {
    if (this.options.playAudio) {
      if (this.video.paused) {
        this.play();
      } else {
        this.pause();
      }
    } else {
      if (this.audio.paused) {
        this.audio.play();
        this.bezel.switch(Icons.play);
        this.template.playButton.innerHTML = Icons.pause;
        this.template.mobilePlayButton.innerHTML = Icons.pause;
      } else {
        this.audio.pause();
        this.bezel.switch(Icons.pause);
        this.template.playButton.innerHTML = Icons.play;
        this.template.mobilePlayButton.innerHTML = Icons.play;
      }
    }

  }
  initVideo(video, type) {
    if (type !== 'audio') {
      this.initMSE(video, type);
    }
    const that = this;
    for (let i = 0; i < this.events.videoEvents.length; i++) {
      video.addEventListener(that.events.videoEvents[i], () => {
        that.events.trigger(that.events.videoEvents[i]);
      });
    }
    /**
     * video events
     */
    // show video time: the metadata has loaded or changed
    this.on("durationchange", () => {
      // compatibility: Android browsers will output 1 or Infinity at first
      if (video.duration !== 1 && video.duration !== Infinity) {
        this.template.dtime.innerHTML = utils.secondToTime(video.duration);
      }
    });

    // show video loaded bar: to inform interested parties of progress downloading the media
    this.on("progress", () => {
      const percentage = video.buffered.length ? video.buffered.end(video.buffered.length - 1) / video.duration : 0;
      this.bar.set("loaded", percentage, "width");
    });

    // video download error: an error occurs
    this.on("error", () => {
      if (!this.video.error) {
        // Not a video load error, may be poster load failed, see #307
        return;
      }
      this.tran && this.notice && this.type !== "webtorrent" && this.notice(this.tran("Video load failed"), -1);
    });

    // video end
    this.on("ended", () => {
      this.bar.set("played", 1, "width");
      this.pause();
      this.watchMaxDurationCountData.flag = false;
    });

    this.on("play", () => {
      if (this.paused) {
        this.play(true);
      }
      this.watchMaxDurationCountData.flag = true;
      this.watchMaxDurationCountData.speedValue = 1 * this.video.playbackRate;
      console.log("[timeupdate]" + this.watchMaxDurationCountData.flag);
      this.watchMaxDurationCount();
      if (!this.is_firstPlay) {
        this.is_firstPlay = true;
        this.events.trigger("firstPlay");
        this.user.NewDrawing('playStart')
      }
    });

    this.on("pause", () => {
      console.log(video.currentTime);
      if (!this.paused) {
        this.pause(true);
      }
      this.watchMaxDurationCountData.flag = false;
    });

    // this.on("playing", () => {
    //   if (!this.paused) {
    //     this.pause(true);
    //   }
    //   this.watchMaxDurationCountData.speedValue = 1 * this.video.playbackRate;
    //   this.watchMaxDurationCountData.flag = true;
    // });

    this.on("timeupdate", () => {
      if (this.watchMaxDurationCountData.methodFlag > new Date().getTime() + 10000) {
        this.watchMaxDurationCountData.flag = true;
        console.log("[timeupdate]" + this.watchMaxDurationCountData.flag);
        this.watchMaxDurationCount();
      }

      this.bar.set("played", video.currentTime / video.duration, "width");
      const currentTime = utils.secondToTime(video.currentTime);
      if (this.template.ptime.innerHTML !== currentTime) {
        this.template.ptime.innerHTML = currentTime;
      }
      this.user.NewDrawing('playTime', video.currentTime)
    });

    this.volume(this.user.get("volume"), true, true);
  }

  initMSE(video, type) {
    this.type = type;
    if (this.options.video.customType && this.options.video.customType[type]) {
      if (Object.prototype.toString.call(this.options.video.customType[type]) === "[object Function]") {
        this.options.video.customType[type](this.video, this);
      } else {
        console.error(`Illegal customType: ${type}`);
      }
    } else {
      if (this.type === "auto") {
        if (/m3u8(#|\?|$)/i.exec(video.src)) {
          this.type = "hls";
        } else if (/.flv(#|\?|$)/i.exec(video.src)) {
          this.type = "flv";
        } else if (/.mpd(#|\?|$)/i.exec(video.src)) {
          this.type = "dash";
        } else {
          this.type = "normal";
        }
      }

      if (this.type === "hls" && (video.canPlayType("application/x-mpegURL") || video.canPlayType("application/vnd.apple.mpegURL"))) {
        this.type = "normal";
      }

      switch (this.type) {
        // https://github.com/video-dev/hls.js
        case "hls":
          if (Hls) {
            if (Hls.isSupported()) {
              const options = this.options.pluginOptions.hls;
              const hls = new Hls(options);
              this.plugins.hls = hls;
              if (hls != null) {
                hls.loadSource(video.src);
                hls.attachMedia(video);
              }
              // this.events.unsubscribeAll("destroy");
              this.events.on("destroy", () => {
                // if (hls != null) {
                hls.destroy();
                // }
                delete this.plugins.hls;
              });
              hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      // try to recover network error
                      console.log("fatal network error encountered, try to recover");
                      hls.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      console.log("fatal media error encountered, try to recover");
                      hls.recoverMediaError();
                      break;
                    default:
                      console.log("fatal media error encountered, try to recover");
                      // cannot recover
                      hls.destroy();
                      break;
                  }
                }
              });
            } else {
              this.notice("Error: Hls is not supported.");
            }
          } else {
            this.notice("Error: Can't find Hls.");
          }
          break;

        // https://github.com/Bilibili/flv.js
        case "flv":
          if (window["flvjs"]) {
            if (window["flvjs"].isSupported()) {
              const flvPlayer = window["flvjs"].createPlayer(
                Object.assign(this.options.pluginOptions.flv.mediaDataSource || {}, {
                  type: "flv",
                  url: video.src,
                }),
                this.options.pluginOptions.flv.config,
              );
              this.plugins.flvjs = flvPlayer;
              flvPlayer.attachMediaElement(video);
              flvPlayer.load();
              this.events.on("destroy", () => {
                flvPlayer.unload();
                flvPlayer.detachMediaElement();
                flvPlayer.destroy();
                delete this.plugins.flvjs;
              });
            } else {
              this.notice("Error: flvjs is not supported.");
            }
          } else {
            this.notice("Error: Can't find flvjs.");
          }
          break;
      }
    }
  }
  /**
   * attach event
   */
  on(name, callback) {
    this.events.on(name, callback);
  }

  /**
   * Switch to a new video
   *
   * @param {Object} video - new video info
   */
  switchVideo(video) {
    this.pause();
    this.video.poster = video.pic ? video.pic : "";
    this.video.src = video.url;
    this.initMSE(this.video, video.type || "auto");
  }



  switchQuality(type) {
    // index = typeof index === "string" ? parseInt(index) : index;
    let index;
    this.options.video.quality.forEach((item, i) => {
      if (item.mediaRate == type) {
        this.quality = item;
        index = i;
      }
    })
    if (this.qualityIndex === index || this.switchingQuality) {
      return;
    } else {
      this.qualityIndex = index;
    }
    this.switchingQuality = true;
    this.seekEnd = false;
    this.template.qualityButton.innerHTML = this.quality.mediaRate;
    this.speed(1);
    const paused = this.video.paused;
    const videoHTML = tplVideo({
      current: false,
      pic: null,
      preload: "auto",
      url: this.quality.url,
    });
    const videoEle = new DOMParser().parseFromString(videoHTML, "text/html").body.firstChild;
    this.template.videoWrap.insertBefore(videoEle, this.template.videoWrap.getElementsByTagName("div")[0]);
    this.prevVideo = this.video;
    this.video.pause();
    this.video = videoEle;
    this.template.videoWrap.removeChild(this.prevVideo);
    for (let i = 0; i < this.events.videoEvents.length; i++) {
      this.events.unsubscribeAll(this.events.videoEvents[i])
      this.video.removeEventListener(this.events.videoEvents[i], () => {
      }, false);
    }
    this.initVideo(videoEle, this.quality.type || this.options.video.type);
    // this.seek(this.prevVideo.currentTime);
    if (!paused) {
      this.video.play();
    }
    this.notice(`${this.tran("Switching to")} ${this.quality.mediaRate} ${this.tran("quality")}`, -1);
    this.events.trigger("quality_start", this.quality);
    this.on("canplay", () => {
      if (this.prevVideo) {
        if (this.video.currentTime !== this.prevVideo.currentTime) {
          this.seek(this.prevVideo.currentTime);
          return;
        }

        this.prevVideo = null;
        this.video.classList.add("CloudPlayback-video-current");
        this.notice(`${this.tran("Switched to")} ${this.quality.mediaRate} ${this.tran("quality")}`);
        this.switchingQuality = false;
        this.seekEnd = true;
        this.user.NewDrawing('playSeek', this.video.currentTime);
        this.events.trigger("quality_end");
        if (!paused) {
          this.video.play();
        }
      }
    });
  }



  resize() {
    if (this.controller.thumbnails) {
      this.controller.thumbnails.resize(160, (this.video.videoHeight / this.video.videoWidth) * 160, this.template.barWrap.offsetWidth);
    }
    this.events.trigger("resize");
  }

  speed(rate) {
    if (this.options.playAudio) {
      this.video.playbackRate = rate;
    } else {
      this.audio.playbackRate = rate
    }
    this.template.speedButton.innerHTML = rate + " x";
  }

  destroy() {
    instances.splice(instances.indexOf(this), 1);
    this.pause();
    this.container.removeEventListener("click", this.containerClickFun, true);
    this.fullScreen.destroy();
    this.hotkey.destroy();
    this.contextmenu.destroy();
    this.controller.destroy();
    this.timer.destroy();
    this.video.src = "";
    this.container.innerHTML = "";
    this.events.trigger("destroy");
  }

  changeAudio() {
    if (this.options.playAudio) {
      for (let i = 0; i < this.events.videoEvents.length; i++) {
        this.events.unsubscribeAll(this.events.videoEvents[i])
        this.video.removeEventListener(this.events.videoEvents[i], () => {
          // this.events.trigger(this.events.videoEvents[i]);
        }, false);
      }
      this.options.playAudio = false;
      this.pause();
      this.seekEnd = false;
      this.prevVideoCurrentTime = this.video.currentTime;
      if (this.audio) {
        this.template.videoWrap.removeChild(this.audio);
      }
      const audioHTML = tplAudio({
        url: this.user.audioUrl,
      });
      this.template.videoWrap.removeChild(this.video);
      const audioEle = new DOMParser().parseFromString(audioHTML, "text/html").body.firstChild;
      this.template.videoWrap.insertBefore(audioEle, this.template.videoWrap.getElementsByTagName("div")[0]);
      this.audio = audioEle;
      // this.audio.src = this.user.audioUrl;
      this.initVideo(this.audio, 'audio');
      this.on("canplay", () => {
        if (this.prevVideoCurrentTime == null) {
          return;
        }
        this.seekEnd = true;
        this.seek(this.prevVideoCurrentTime);
        this.prevVideoCurrentTime = null;
      });
      this.template.AudioButton.innerHTML = "视";
      this.template.quality.style.display = 'none'
      this.speed(1);
    } else {
      this.options.playAudio = true;
      this.template.AudioButton.innerHTML = "音";
      this.audio.pause();
      for (let i = 0; i < this.events.videoEvents.length; i++) {
        this.events.unsubscribeAll(this.events.videoEvents[i])
        this.audio.removeEventListener(this.events.videoEvents[i], () => {
        }, false);
      }
      this.watchMaxDurationCountData.flag = false;
      this.prevVideoCurrentTime = this.audio.currentTime;
      this.audio.src = '';
      this.template.quality.style.display = ''

      const videoHTML = tplVideo({
        current: false,
        pic: null,
        preload: "auto",
        url: this.quality.url,
      });
      this.template.videoWrap.removeChild(this.audio);
      this.audio = null;
      const videoEle = new DOMParser().parseFromString(videoHTML, "text/html").body.firstChild;
      this.template.videoWrap.insertBefore(videoEle, this.template.videoWrap.getElementsByTagName("div")[0]);
      this.bezel.switch(Icons.pause);
      this.template.playButton.innerHTML = Icons.play;
      this.template.mobilePlayButton.innerHTML = Icons.play;

      // this.video.src = this.quality.url;
      this.video = videoEle;
      this.seekEnd = false;
      this.initVideo(videoEle, this.quality.type || this.options.video.type);
      this.speed(1);
      this.video.classList.add("CloudPlayback-video-current");
      this.on("canplay", () => {
        if (this.prevVideoCurrentTime == null) {
          return;
        }
        this.seekEnd = true;
        this.seek(this.prevVideoCurrentTime);
        this.prevVideoCurrentTime = null;
        this.video.classList.add("CloudPlayback-video-current");
      });

      // this.on("canplay", () => {
      //   console.log('开始播放');
      //   console.log(this.prevVideo);
      //   if (this.prevVideo) {
      //     if (this.video.currentTime !== this.prevVideo.currentTime) {
      //       this.seek(this.prevVideoCurrentTime);
      //       return;
      //     }
      //     this.prevVideo = null;
      //     this.video.classList.add("CloudPlayback-video-current");
      //     this.seekEnd = true
      //   }

      // });
    }

    // this.destroy()
  }

  static get version() {
    /* global CLOUDWEBCAST_VERSION */
    return CLOUDWEBCAST_VERSION;
  }
}
export default CloudPlayback;
