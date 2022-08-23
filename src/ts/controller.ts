import utils from "./utils/utils";
import Icons from "./icons";

class Controller {
  player: any;
  autoHideTimer: any;
  disableAutoHide: any;
  setAutoHideHandler: any;
  constructor(player) {
    this.player = player;

    this.autoHideTimer = 0;
    if (!utils.isMobile) {
      // this.player.container.addEventListener("mousemove", () => {
      //   this.setAutoHide();
      // });
      // this.player.container.addEventListener("click", () => {
      //   this.setAutoHide();
      // });
      // this.player.on("play", () => {
      //   this.setAutoHide();
      // });
      // this.player.on("pause", () => {
      //   this.setAutoHide();
      // });
      this.setAutoHideHandler = this.setAutoHide.bind(this);
      this.player.container.addEventListener("mousemove", this.setAutoHideHandler);
      this.player.container.addEventListener("click", this.setAutoHideHandler);
      this.player.on("play", this.setAutoHideHandler);
      this.player.on("pause", this.setAutoHideHandler);
    }

    this.initPlayButton();
    this.initPlayedBar();
    this.initFullButton();
    this.initQualityButton();
    this.initspendButton();
    this.initAudio();
    this.initHighlights();
    if (!utils.isMobile) {
      this.initVolumeButton();
    }
  }

  initPlayButton() {
    this.player.template.playButton.addEventListener("click", () => {
      this.player.toggle();
    });

    this.player.template.mobilePlayButton.addEventListener("click", () => {
      this.player.toggle();
    });

    if (!utils.isMobile) {
      this.player.template.videoWrap.addEventListener("click", () => {
        this.player.toggle();
      });
      this.player.template.controllerMask.addEventListener("click", () => {
        this.player.toggle();
      });
    } else {
      this.player.template.videoWrap.addEventListener("click", () => {
        this.toggle();
      });
      this.player.template.controllerMask.addEventListener("click", () => {
        this.toggle();
      });
    }
  }

  initHighlights() {
    this.player.on("durationchange", () => {
      if (this.player.video.duration !== 1 && this.player.video.duration !== Infinity) {
        if (this.player.options.highlight) {
          const highlights = this.player.template.playedBarWrap.querySelectorAll(".CloudPlayback-highlight");
          [].slice.call(highlights, 0).forEach((item) => {
            this.player.template.playedBarWrap.removeChild(item);
          });
          for (let i = 0; i < this.player.options.highlight.length; i++) {
            if (!this.player.options.highlight[i].text || !this.player.options.highlight[i].time) {
              continue;
            }
            const p = document.createElement("div");
            p.classList.add("CloudPlayback-highlight");
            p.style.left = (this.player.options.highlight[i].time / this.player.video.duration) * 100 + "%";
            p.innerHTML = '<span class="CloudPlayback-highlight-text">' + this.player.options.highlight[i].text + "</span>";
            this.player.template.playedBarWrap.insertBefore(p, this.player.template.playedBarTime);
          }
        }
      }
    });
  }

  initPlayedBar() {
    const thumbMove = (e) => {
      let percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.playedBarWrap)) / this.player.template.playedBarWrap.clientWidth;
      percentage = Math.max(percentage, 0);
      percentage = Math.min(percentage, 1);
      this.player.bar.set("played", percentage, "width");
      this.player.template.ptime.innerHTML = utils.secondToTime(percentage * this.player.video.duration);
    };

    const thumbUp = (e) => {
      document.removeEventListener(utils.nameMap.dragEnd, thumbUp);
      document.removeEventListener(utils.nameMap.dragMove, thumbMove);
      let percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.playedBarWrap)) / this.player.template.playedBarWrap.clientWidth;
      percentage = Math.max(percentage, 0);
      percentage = Math.min(percentage, 1);
      this.player.bar.set("played", percentage, "width");
      this.player.seek(this.player.bar.get("played") * this.player.video.duration);

      this.player.timer.enable("progress");
    };

    this.player.template.playedBarWrap.addEventListener(utils.nameMap.dragStart, () => {
      this.player.timer.disable("progress");
      document.addEventListener(utils.nameMap.dragMove, thumbMove);
      document.addEventListener(utils.nameMap.dragEnd, thumbUp);
    });

    this.player.template.playedBarWrap.addEventListener(utils.nameMap.dragMove, (e) => {
      if (this.player.video.duration) {
        const px = this.player.template.playedBarWrap.getBoundingClientRect().left;
        const tx = (e.clientX || e.changedTouches[0].clientX) - px;
        if (tx < 0 || tx > this.player.template.playedBarWrap.offsetWidth) {
          return;
        }
        const time = this.player.video.duration * (tx / this.player.template.playedBarWrap.offsetWidth);
        this.player.template.playedBarTime.style.left = `${tx - (time >= 3600 ? 25 : 20)}px`;
        this.player.template.playedBarTime.innerText = utils.secondToTime(time);
        this.player.template.playedBarTime.classList.remove("hidden");
      }
    });

    if (!utils.isMobile) {
      if (this.player.options.live) {
        this.player.template.playedBarWrap.addEventListener("mouseenter", () => {
          if (this.player.video.duration) {
            this.player.template.playedBarTime.classList.remove("hidden");
          }
        });

        this.player.template.playedBarWrap.addEventListener("mouseleave", () => {
          if (this.player.video.duration) {
            this.player.template.playedBarTime.classList.add("hidden");
          }
        });
      } else {
        this.player.template.playedBarWrap.addEventListener("mouseenter", () => {
          if (this.player.video.duration) {
            this.player.template.playedBarTime.classList.remove("hidden");
          }
        });

        this.player.template.playedBarWrap.addEventListener("mouseleave", () => {
          if (this.player.video.duration) {
            this.player.template.playedBarTime.classList.add("hidden");
          }
        });
      }
    }
  }

  initFullButton() {
    this.player.template.browserFullButton.addEventListener("click", () => {
      this.player.fullScreen.toggle("web");
    });

    this.player.template.canvasFull.addEventListener("click", () => {
      this.player.fullScreen.canvansToggle("canvansWeb");
    });
    // this.player.template.webFullButton.addEventListener("click", () => {
    //   this.player.fullScreen.toggle("web");
    // });
  }

  initVolumeButton() {
    const vWidth = 35;

    const volumeMove = (event) => {
      const e = event || window.event;
      const percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.volumeBarWrap) - 5.5) / vWidth;
      this.player.volume(percentage);
    };
    const volumeUp = () => {
      document.removeEventListener(utils.nameMap.dragEnd, volumeUp);
      document.removeEventListener(utils.nameMap.dragMove, volumeMove);
      this.player.template.volumeButton.classList.remove("CloudPlayback-volume-active");
    };

    this.player.template.volumeBarWrapWrap.addEventListener("click", (event) => {
      const e = event || window.event;
      const percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.volumeBarWrap) - 5.5) / vWidth;
      this.player.volume(percentage);
    });
    this.player.template.volumeBarWrapWrap.addEventListener(utils.nameMap.dragStart, () => {
      document.addEventListener(utils.nameMap.dragMove, volumeMove);
      document.addEventListener(utils.nameMap.dragEnd, volumeUp);
      this.player.template.volumeButton.classList.add("CloudPlayback-volume-active");
    });
    this.player.template.volumeButtonIcon.addEventListener("click", () => {
      if (this.player.options.playAudio) {
        if (this.player.video.muted) {
          this.player.video.muted = false;
          this.player.switchVolumeIcon();
          this.player.bar.set("volume", this.player.volume(), "width");
        } else {
          this.player.video.muted = true;
          this.player.template.volumeIcon.innerHTML = Icons.volumeOff;
          this.player.bar.set("volume", 0, "width");
        }
      } else {
        if (this.player.audio.muted) {
          this.player.audio.muted = false;
          this.player.switchVolumeIcon();
          this.player.bar.set("volume", this.player.volume(), "width");
        } else {
          this.player.audio.muted = true;
          this.player.template.volumeIcon.innerHTML = Icons.volumeOff;
          this.player.bar.set("volume", 0, "width");
        }
      }

    });
  }

  initQualityButton() {
    if (this.player.options.video.quality) {
      this.player.template.qualityList.addEventListener("click", (e) => {
        if (e.target.classList.contains("CloudPlayback-quality-item")) {
          this.player.switchQuality(e.target.innerHTML);
        }
      });
    }
  }

  initspendButton() {
    if (this.player.options.playbackSpeed) {
      this.player.template.speedList.addEventListener("click", (e) => {
        if (e.target.classList.contains("CloudPlayback-speed-item")) {
          this.player.speed(e.target.innerHTML);
        }
      });
    }
  }

  initAudio() {
    if (this.player.template.AudioButton) {
      this.player.template.AudioButton.addEventListener("click", (e) => {
        this.player.changeAudio()
      })
    }

  }

  setAutoHide() {
    this.show();
    clearTimeout(this.autoHideTimer);
    this.autoHideTimer = setTimeout(() => {
      if (this.player.video.played.length && !this.player.paused && !this.disableAutoHide) {
        this.hide();
      }
    }, 3000);
  }

  show() {
    this.player.container.classList.remove("CloudPlayback-hide-controller");
  }

  hide() {
    this.player.container.classList.add("CloudPlayback-hide-controller");
    this.player.comment && this.player.comment.hide();
  }

  isShow() {
    return !this.player.container.classList.contains("CloudPlayback-hide-controller");
  }

  toggle() {
    if (this.isShow()) {
      this.hide();
    } else {
      this.show();
    }
  }

  destroy() {
    if (!utils.isMobile) {
      this.player.container.removeEventListener("mousemove", this.setAutoHideHandler);
      this.player.container.removeEventListener("click", this.setAutoHideHandler);
    }
    clearTimeout(this.autoHideTimer);
  }
}

export default Controller;
