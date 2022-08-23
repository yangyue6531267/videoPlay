import Icons from "./utils/icons";
var tplPlayer = require("../template/player.art");
var tpldocument = require("../template/document.art");
var tplcontroller = require("../template/controller.art");
import utils from "./utils/utils";

class Template {
  container: any;
  options: any;
  index: any;
  tran: any;
  volumeBar: any;
  volumeBarWrap: any;
  volumeBarWrapWrap: any;
  volumeButton: any;
  volumeButtonIcon: any;
  volumeIcon: any;
  playedBar: any;
  loadedBar: any;
  playedBarWrap: any;
  playedBarTime: any;
  video: any;
  bezel: any;
  playButton: any;
  mobilePlayButton: any;
  videoWrap: any;
  controllerMask: any;
  ptime: any;
  mask: any;
  loop: any;
  loopToggle: any;
  speed: any;
  speedItem: any;
  dtime: any;
  controller: any;
  browserFullButton: any;
  webFullButton: any;
  menu: any;
  menuItem: any;
  qualityList: any;
  camareButton: any;
  qualityButton: any;
  barPreview: any;
  barWrap: any;
  notice: any;
  infoPanel: any;
  infoPanelClose: any;
  infoVersion: any;
  infoFPS: any;
  infoType: any;
  infoUrl: any;
  infoResolution: any;
  infoDuration: any;
  ArrayM3u8: any;
  duration: any;
  infoWatchDuration: any;
  documentContainer: any;
  canvasImage: any;
  canvasWrapImage: any;
  canvasAnnotation: any;
  controllerContainer: any;
  canvasFull: any;
  speedList: any;
  speedButton: any;
  AudioButton: any;
  audio: any;
  quality: any

  constructor(options) {
    this.container = options.container;
    this.documentContainer = options.documentContainer;
    this.controllerContainer = options.controllerContainer;
    this.options = options.options;
    this.index = options.index;
    this.tran = options.tran;
    this.ArrayM3u8 = options.ArrayM3u8;
    this.duration = options.duration;
    this.init();
  }

  init() {
    this.container.innerHTML = tplPlayer({
      options: this.options,
      index: this.index,
      tran: this.tran,
      icons: Icons,
      mobile: utils.isMobile,
      ArrayM3u8: this.ArrayM3u8,
      video: {
        current: true,
        pic: this.options.video.pic,
        preload: this.options.preload,
        url: this.options.video.url,
        ArrayM3u8: this.ArrayM3u8,
      },
    });
    if (this.documentContainer) {
      this.documentContainer.innerHTML = tpldocument({
        options: this.options,
        icons: Icons,
      });
      this.canvasFull = this.documentContainer.querySelector(
        ".CloudPlayback-Draw-full"
      );

      this.canvasWrapImage = this.documentContainer.querySelector(
        ".CloudPlayback-document-wrap"
      );
      this.canvasImage = this.documentContainer.querySelector(
        ".CloudPlayback-canvas-images"
      );
      this.canvasAnnotation = this.documentContainer.querySelector(
        ".CloudPlayback-canvas-annotation"
      );
    }
    if (this.controllerContainer) {
      this.controllerContainer.innerHTML = tplcontroller({
        options: this.options,
        index: this.index,
        tran: this.tran,
        icons: Icons,
        mobile: utils.isMobile,
        ArrayM3u8: this.ArrayM3u8,
        video: {
          current: true,
          pic: this.options.video.pic,
          preload: this.options.preload,
          url: this.options.video.url,
          ArrayM3u8: this.ArrayM3u8,
        },
      });
      this.controller = this.controllerContainer;
    } else {
      this.controller = this.container.querySelector(
        ".CloudPlayback-controller-default"
      );
      this.controller.innerHTML = tplcontroller({
        options: this.options,
        index: this.index,
        tran: this.tran,
        icons: Icons,
        mobile: utils.isMobile,
        ArrayM3u8: this.ArrayM3u8,
        video: {
          current: true,
          pic: this.options.video.pic,
          preload: this.options.preload,
          url: this.options.video.url,
          ArrayM3u8: this.ArrayM3u8,
        },
      });
    }

    this.volumeBar = this.controller.querySelector(
      ".CloudPlayback-volume-bar-inner"
    );
    this.volumeBarWrap = this.controller.querySelector(
      ".CloudPlayback-volume-bar"
    );
    this.volumeBarWrapWrap = this.controller.querySelector(
      ".CloudPlayback-volume-bar-wrap"
    );
    this.volumeButton = this.controller.querySelector(".CloudPlayback-volume");
    this.volumeButtonIcon = this.controller.querySelector(
      ".CloudPlayback-volume-icon"
    );
    this.volumeIcon = this.controller.querySelector(
      ".CloudPlayback-volume-icon .CloudPlayback-icon-content"
    );
    this.playedBar = this.controller.querySelector(".CloudPlayback-played");
    this.loadedBar = this.controller.querySelector(".CloudPlayback-loaded");
    this.playedBarWrap = this.controller.querySelector(
      ".CloudPlayback-bar-wrap"
    );
    this.playedBarTime = this.controller.querySelector(
      ".CloudPlayback-bar-time"
    );
    this.video = this.container.querySelector(".CloudPlayback-video-current");
    this.audio = this.container.querySelector(".CloudPlayback-audio-current");

    this.bezel = this.container.querySelector(".CloudPlayback-bezel-icon");
    this.playButton = this.controller.querySelector(".CloudPlayback-play-icon");
    this.mobilePlayButton = this.container.querySelector(
      ".CloudPlayback-mobile-play"
    );
    this.videoWrap = this.container.querySelector(".CloudPlayback-video-wrap");
    this.controllerMask = this.controller.querySelector(
      ".CloudPlayback-controller-mask"
    );
    this.ptime = this.controller.querySelector(".CloudPlayback-ptime");

    this.mask = this.container.querySelector(".CloudPlayback-mask");

    this.dtime = this.controller.querySelector(".CloudPlayback-dtime");


    this.browserFullButton = this.controller.querySelector(
      ".CloudPlayback-full-icon"
    );
    this.webFullButton = this.controller.querySelector(
      ".CloudPlayback-full-in-icon"
    );
    this.menu = this.container.querySelector(".CloudPlayback-menu");
    this.menuItem = this.container.querySelectorAll(".CloudPlayback-menu-item");
    this.qualityList = this.controller.querySelector(
      ".CloudPlayback-quality-list"
    );
    this.quality = this.controller.querySelector(
      ".CloudPlayback-quality"
    );
    this.speedList = this.controller.querySelector(
      ".CloudPlayback-speed-list"
    );
    this.camareButton = this.controller.querySelector(
      ".CloudPlayback-camera-icon"
    );
    this.qualityButton = this.controller.querySelector(
      ".CloudPlayback-quality-icon"
    );
    this.speedButton = this.controller.querySelector(
      ".CloudPlayback-speed-icon"
    );

    this.AudioButton = this.controller.querySelector(".CloudPlayback-playAudio-icon")

    this.barPreview = this.controller.querySelector(
      ".CloudPlayback-bar-preview"
    );
    this.barWrap = this.controller.querySelector(".CloudPlayback-bar-wrap");
    this.notice = this.container.querySelector(".CloudPlayback-notice");
  }
}

export default Template;
