/*
W3C def language codes is :
    language-code = primary-code ( "-" subcode )
        primary-code    ISO 639-1   ( the names of language with 2 code )
        subcode         ISO 3166    ( the names of countries )

NOTE: use lowercase to prevent case typo from user!
Use this as shown below..... */

function i18n(this: any, lang) {
  this.lang = lang;
  this.tran = (text) => {
    if (tranTxt[this.lang] && tranTxt[this.lang][text]) {
      return tranTxt[this.lang][text];
    } else {
      return text;
    }
  };
}

// add translation text here
const tranTxt = {
  "zh-cn": {
    Top: "顶部",
    Bottom: "底部",
    Rolling: "滚动",
    "About author": "关于作者",
    "CloudPlayback feedback": "播放器意见反馈",
    "About CloudPlayback": "关于 CloudPlayback 播放器",
    Loop: "洗脑循环",
    Speed: "速度",
    Normal: "正常",
    "Video load failed": "视频加载失败",
    "Switching to": "正在切换至",
    "Switched to": "已经切换至",
    quality: "画质",
    FF: "快进",
    REW: "快退",
    "Full screen": "全屏",
    "Web full screen": "页面全屏",
    Send: "发送",
    s: "秒",
    Volume: "音量",
    Live: "直播",
  },
  "zh-tw": {
    Top: "頂部",
    Bottom: "底部",
    Rolling: "滾動",
    "About author": "關於作者",
    "CloudPlayback feedback": "播放器意見回饋",
    "About CloudPlayback": "關於 CloudPlayback 播放器",
    Loop: "循環播放",
    Speed: "速度",
    Normal: "正常",
    "Video load failed": "影片載入失敗",
    "Switching to": "正在切換至",
    "Switched to": "已經切換至",
    quality: "畫質",
    FF: "快進",
    REW: "快退",
    "Full screen": "全螢幕",
    "Web full screen": "頁面全螢幕",
    Send: "發送",
    s: "秒",
    Volume: "音量",
    Live: "直播",
  },
};

export default i18n;
