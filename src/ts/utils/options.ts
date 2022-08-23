/* global CLOUDWEBCAST_VERSION */

export default (options) => {
  // default options
  const defaultOption = {
    container: options.element || document.getElementsByClassName("CloudPlayback")[0],
    documentContainer: null,
    controllerContainer: null,
    live: false,
    autoplay: false,
    theme: "#b7daff",
    loop: false,
    lang: (navigator.language || navigator["browserLanguage"]).toLowerCase(),
    hotkey: true,
    preload: "metadata",
    volume: 0.7,
    playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2],
    playAudio: true,
    isAudioChange: true,
    video: {
      url: "",
      type: "hls",
      quality: [
        // {
        //   name: 'SD',
        //   url: '',
        //   type: 'hls',
        // },
        // {
        //   name: 'HD',
        //   url: '',
        //   type: 'hls',
        // },
        // {
        //   name: 'FD',
        //   url: '',
        //   type: 'hls',
        // },
      ],
      defaultQuality: 0,
    },
    contextmenu: [],
    mutex: true,
    pluginOptions: { hls: {}, flv: {}, dash: {}, webtorrent: {} },
  };
  for (const defaultKey in defaultOption) {
    if (defaultOption.hasOwnProperty(defaultKey) && !options.hasOwnProperty(defaultKey)) {
      options[defaultKey] = defaultOption[defaultKey];
    }
  }
  if (options.video) {
    !options.video.type && (options.video.type = "auto");
  }

  if (options.lang) {
    options.lang = options.lang.toLowerCase();
  }

  options.contextmenu = options.contextmenu.concat([
    {
      text: `CloudPlayback v${CLOUDWEBCAST_VERSION}`,
      link: "http://www.263.net/",
    },
  ]);

  return options;
};
