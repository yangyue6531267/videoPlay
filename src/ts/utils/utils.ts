const isMobile = /mobile/i.test(window.navigator.userAgent);

const utils = {
  /**
   * Parse second to time string
   *
   * @param {Number} second
   * @return {String} 00:00 or 00:00:00
   */
  secondToTime: (second) => {
    second = second || 0;
    if (second === 0 || second === Infinity || second.toString() === "NaN") {
      return "00:00";
    }
    const add0 = (num) => (num < 10 ? "0" + num : "" + num);
    const hour = Math.floor(second / 3600);
    const min = Math.floor((second - hour * 3600) / 60);
    const sec = Math.floor(second - hour * 3600 - min * 60);
    return (hour > 0 ? [hour, min, sec] : [min, sec]).map(add0).join(":");
  },

  toDuration: (timestamp) => {
    let result = parseInt(timestamp)
    let h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600);
    let m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60));
    let s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60));
    if (h === '00') {
      return `${m}:${s}`
    } else {
      return `${h}:${m}:${s}`
    }
  },
  /**
   * 获取字符串长度
   * @param {*} str
   * @returns
   */
  // getStrLength: function (str = '') {
  //   let len = 0;
  //   for (let i = 0; i < str.length; i++) {
  //     if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
  //       len += 2;
  //     } else {
  //       len++;
  //     }
  //   }
  //   return len;
  // },
  getStrLength: (value: string) => {
    if (!value) {
      return 0
    }
    const charCount = value.split('').reduce((prev, curr) => {
      // 英文字母和数字等算一个字符
      if (/[a-z]|[0-9]|[,;.!@#-+/\\$%^*()<>?:"'{}~]/i.test(curr)) {
        return prev + 1
      }
      // 其他的算是2个字符
      return prev + 2
    }, 0)

    // 向上取整，防止出现半个字的情况
    return Math.ceil(charCount / 2)
  },
  /**
 * 获取后缀名
 * @param {*} name
 * @returns
 */
  getExtension: (name) => {
    let lastName = name ? name.substr(name.lastIndexOf('.') + 1) : ''
    return lastName;
  },

  /**
   * 获取文件名
   * @param {*} name
   * @returns
   */
  getFileName: (name) => {
    // console.log(name.split('.').pop(), "name");
    return name.substr(0, name.lastIndexOf('.'));
  },

  /**
 * 获取token
 */
  getToken: () => {
    const token = sessionStorage.getItem('playBackToken');
    if (token) {
      return {
        status: true,
        token: token
      }
    } else {
      return {
        status: false,
        token: ''
      }
    }
  },

  uuid: (len, radix) => {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    let uuid: any = [];
    let i;
    radix = radix || chars.length;
    if (len) {
      // Compact form
      for (i = 0; i < len; i++) { uuid[i] = chars[0 | Math.random() * radix] };
    } else {
      // rfc4122, version 4 form
      var r;
      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random() * 16;
          uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }
    return uuid.join('');
  },
  /**
   * control play progress
   */
  // get element's view position
  getElementViewLeft: (element) => {
    let actualLeft = element.offsetLeft;
    let current = element.offsetParent;
    const elementScrollLeft =
      document.body.scrollLeft + document.documentElement.scrollLeft;
    if (
      !document.fullscreenElement &&
      !document["mozFullScreenElement"] &&
      !document["webkitFullscreenElement"]
    ) {
      while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
      }
    } else {
      while (current !== null && current !== element) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
      }
    }
    return actualLeft - elementScrollLeft;
  },

  /**
    * optimize control play progress
 
    * optimize get element's view position,for float dialog video player
    * getBoundingClientRect 在 IE8 及以下返回的值缺失 width、height 值
    * getBoundingClientRect 在 Firefox 11 及以下返回的值会把 transform 的值也包含进去
    * getBoundingClientRect 在 Opera 10.5 及以下返回的值缺失 width、height 值
    */
  getBoundingClientRectViewLeft(element) {
    const scrollTop =
      window.scrollY ||
      window.pageYOffset ||
      document.body.scrollTop +
      ((document.documentElement && document.documentElement.scrollTop) || 0);

    if (element.getBoundingClientRect) {
      if (typeof this.getBoundingClientRectViewLeft["offset"] !== "number") {
        let temp = document.createElement("div");
        temp.style.cssText = "position:absolute;top:0;left:0;";
        document.body.appendChild(temp);
        this.getBoundingClientRectViewLeft["offset"] =
          -temp.getBoundingClientRect().top - scrollTop;
        document.body.removeChild(temp);
        // temp = null;
      }
      const rect = element.getBoundingClientRect();
      const offset = this.getBoundingClientRectViewLeft["offset"];

      return rect.left + offset;
    } else {
      // not support getBoundingClientRect
      return this.getElementViewLeft(element);
    }
  },

  getScrollPosition() {
    return {
      left:
        window.pageXOffset ||
        document.documentElement.scrollLeft ||
        document.body.scrollLeft ||
        0,
      top:
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0,
    };
  },

  setScrollPosition({ left = 0, top = 0 }) {
    if (this.isFirefox) {
      document.documentElement.scrollLeft = left;
      document.documentElement.scrollTop = top;
    } else {
      window.scrollTo(left, top);
    }
  },

  isMobile: isMobile,

  isFirefox: /firefox/i.test(window.navigator.userAgent),

  isChrome: /chrome/i.test(window.navigator.userAgent),

  storage: {
    set: (key, value) => {
      localStorage.setItem(key, value);
    },

    get: (key) => localStorage.getItem(key),
  },

  nameMap: {
    dragStart: isMobile ? "touchstart" : "mousedown",
    dragMove: isMobile ? "touchmove" : "mousemove",
    dragEnd: isMobile ? "touchend" : "mouseup",
  },

  color2Number: (color) => {
    if (color[0] === "#") {
      color = color.substr(1);
    }
    if (color.length === 3) {
      color = `${color[0]}${color[0]}${color[1]}${color[1]}${color[2]}${color[2]}`;
    }
    return (parseInt(color, 16) + 0x000000) & 0xffffff;
  },

  number2Color: (number) => "#" + ("00000" + number.toString(16)).slice(-6),

  number2Type: (number) => {
    switch (number) {
      case 0:
        return "right";
      case 1:
        return "top";
      case 2:
        return "bottom";
      default:
        return "right";
    }
  },
  randomString(e) {
    e = e || 32;
    var t = "0123456789",
      a = t.length,
      n = "";
    for (let i = 0; i < e; i++) {
      n += t.charAt(Math.floor(Math.random() * a));
    }
    return n;
  },
};

export default utils;
