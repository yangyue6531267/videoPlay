import utils from "./utils";
import api from './api';
import Drawing from 'drawingboard'

class User {
  player: any;
  storageName: { volume: string; };
  default: { volume: any; };
  data: {};
  DrawingBoard: any;
  ifarmeDom: any;
  startTime: any;
  beatTimer: any;
  timer: any;
  audioUrl: any;
  heartErrorNum: any;
  playBackData: any;
  playBackSet: any;
  playBackFile: any;
  playBcakBg: any
  constructor(player) {
    this.player = player;
    this.storageName = {
      volume: "CloudPlayback-volume",
    };
    this.default = {
      volume: player.options.hasOwnProperty("volume") ? player.options.volume : 0.7,
    };
    this.data = {};
    // this.ifarmeDom;
    // this.startTime;
    // this.playBackData;
    // this.playBackSet;
    this.init();
  }

  init() {
    for (const item in this.storageName) {
      const name = this.storageName[item];
      this.data[item] = parseFloat(utils.storage.get(name) || this.default[item]);
    }

    this.player.on('chatList', (el: any) => {
      console.log('聊天记录', el);
    })

    this.player.on('loginInfo', (el: any) => {
      console.log('登录信息', el);
    })

    this.player.on('playBackSet', (el: any) => {
      console.log('回放设置', el);
    })

    this.player.on('playBackBackground', (el: any) => {
      console.log('回放背景图', el);
    })

    this.player.on('playBackTime', (el: any) => {
      console.log('回放时间', el);
    })

    this.player.on('playBackFile', (el: any) => {
      console.log('回放目录', el);
    })


    // for (let i = 0; i < this.player.events.userEvents.length; i++) {
    //   document.addEventListener(this.player.events.userEvents[i], () => {
    //     this.player.events.trigger(this.player.events.userEvents[i]);
    //   });
    // }
  }

  async getPlayConfig(recordId) {
    const { code, data, msg } = await api.getPlaybackConfig(recordId) as any
    if (code == 200) {
      this.playBackData = Object.assign({
        playback_title: data.playback_title,
        m3u8_file_ids: data.m3u8_file_ids,
      }, this.playBackData)
      this.playBackSet = {
        layout_chat: data.layout_chat,
        layout_doc: data.layout_doc,
        playback_summary: data.playback_summary
      }
      const playBcakBg = Object.assign({
        background: data.background,
        logo: data.logo
      }, this.playBcakBg)
      this.player.events.trigger("loginInfo", this.playBackData);
      this.player.events.trigger("playBackSet", this.playBackSet);
      this.player.events.trigger("playBackBackground", playBcakBg)
      const m3u8Array =  data.m3u8_file_ids[0].urls.map((item,index)=>{
        return Object.assign({
          name:this.player.options.video.quality[index]?.name?this.player.options.video.quality[index]?.name:item.mediaRate,
          type:'hls',
        },item)
      })
      return m3u8Array;
    } else {
      this.player.events.trigger('userError', msg)
      return null
    }
  }

  async userLogin(recordId) {
    // 登录回放sdk
    if (this.player.options?.userId?.length > 64) {
      this.player.events.trigger('userError', 'userId大于64位')
      return
    }

    if (this.player.options?.nickName.length > 64) {

      this.player.events.trigger('userError', 'nickName大于64位')
      return
    }
    const params = {
      passCode: this.player.options?.passCode ? this.player.options?.passCode : '',
      type: this.player.options?.passCode ? '1' : '0',
      recordFileId: recordId,
      userId: this.player.options?.userId ? this.player.options?.userId : utils.uuid(16, 16),
      nickName: this.player.options?.nickName ? this.player.options?.nickName : "",
      thirdPartyRemark: this.player.options?.Remarks ? this.player.options?.Remarks : ''
    };
    const { code, data, msg } = await api.userLogin(params) as any;
    if (code == 200) {
      this.playBackData = {
        type: data.type,
        passCode: this.player.options?.passCode ? this.player.options?.passCode : '',
        nickName: data.nickName,
        player_url: data.player_url,
        Remarks: this.player.options?.Remarks ? this.player.options?.Remarks : ''
      }
      sessionStorage.setItem('playBackToken', data.token);
      this.heartbeat()
      if (data.cid) {
        await this.getIcon(data.cid)
      }
      return {
        DrawingData: await this.getPlayback(recordId), url: await this.getPlayConfig(recordId)
      };
    } else if (code == 2008) {
      this.player.events.trigger('userError', '密码错误')
    } else {
      this.player.events.trigger('userError', msg)
    }
  }

  async getIcon(id) {
    const { data, code } = await api.GetIcon(id) as any;
    if (code == 200) {
      this.playBcakBg = { icon: data.icon };
    } else {
      this.playBcakBg = { icon: '' };
    }
  }


  async getPlayback(recordId) {
    const { data } = await api.getPlayback(recordId) as any;
    this.startTime = data.startTime;
    const playBackTime = {
      endTime: data.endTime,
      startTime: data.startTime
    }
    const chatHistoryInfos = data.chatHistoryInfos.map((item) => {
      item.relativeTime = item.time - this.startTime
      if (item.cmd == '1701') {
        return item
      }
    })
    this.player.events.trigger("playBackTime", playBackTime);
    this.player.events.trigger("chatList", chatHistoryInfos);
    // 获取文档目录
    if (data.downloadAudios.length > 0) {
      this.audioUrl = data.downloadAudios[0].urls[0];
      this.player.options.isAudioChange = true;

    } else {
      this.player.options.isAudioChange = false;
    }
    this.getLists(data.recordDataVoList)
    return data;
  }
  // 文件地址获取
  findFileUrl(fileUrls, type) {
    for (let i = 0; i < fileUrls.length; i++) {
      if (fileUrls[i].type === type) {
        return fileUrls[i].addr;
      }
    }
  }

  async initDrawingboard(datas) {
    this.ifarmeDom = this.player.template.documentContainer.querySelector('.iframeStyle')
    // 获取文档信息
    const commondata = {
      tag: null,
      cmd: 'lookup',
      ver: '4.0',
      dev: '',
      devt: 'web',
      os: navigator.userAgent.toLowerCase()
    };
    // const paramsData = Object.assign(commondata, { name: this.playBackData.nickName });
    // const { serverAddress } = await api.getLocation(paramsData) as any;

    let cvmcUrl = location.protocol + `${CLOUDWEBCAST_FILE_URL}file/web/doc`;
    // if (serverAddress.length > 0) {
    //   cvmcUrl = this.findFileUrl(serverAddress, 12) + '/file/web/doc'
    // }
    console.log(cvmcUrl);

    this.DrawingBoard = new Drawing.DrawingBoard(datas, cvmcUrl, '');
    this.DrawingBoard.subscribe('iframeSrc', el => {
      // src修改回调
      this.ifarmeDom.src = el.iframeSrc
    })
    this.DrawingBoard.subscribe('closeFileDoc', el => {
      this.ifarmeDom.src = ''
    })
    this.DrawingBoard.subscribe('shareDocBl', el => {
      this.player.events.trigger("shareDocBl", el + "");
    })
  }

  heartbeat() {
    api.heartbeat({
      // token: utils.getToken().token,
      duration: this.player.watchMaxDurationCountData.watchMaxDuration
    }).then((res: any) => {
      if (res.code === 200) {
        this.heartErrorNum = 0;
        if (this.beatTimer) {
          clearInterval(this.beatTimer);
          this.beatTimer = null;
        }
        this.beatTimer = setTimeout(() => {
          this.heartbeat();
        }, 10000);
      } else if (
        res.code === 400 ||
        res.code === 6020 ||
        res.code === 20001
      ) {
        this.tokenFail();
      }
    })
      .catch(() => {
        this.tokenFail();
      });
  }

  // token失效机智
  tokenFail() {
    if (this.beatTimer) {
      clearInterval(this.beatTimer);
      this.beatTimer = null;
    }
    if (this.timer) {
      window.clearInterval(this.timer)
      this.timer = null
    }
    if (this.heartErrorNum < 3) {
      this.heartErrorNum++;
      this.beatTimer = setTimeout(() => {
        this.heartbeat();
      }, 10000);
    }
  }

  getLists(lists) {
    if (lists.length == 0) {
      this.player.events.trigger("playBackFile", {});
      return;
    }
    let docs: Array<any> = [];
    lists.forEach((item: any) => {
      switch (item.cmd) {
        case '3001':
          item.fileName = utils.getFileName(item.fileTitle);
          item.type = 'doc';
          item.extension = utils.getExtension(item.fileTitle);
          item.date = utils.toDuration((item.ts - this.startTime) / 1000);
          docs.push(item);
          break;
        case '3006':
          item.fileName = utils.getFileName(item.fileTitle);
          item.type = 'doc';
          item.extension = utils.getExtension(item.fileTitle);
          item.date = utils.toDuration((item.ts - this.startTime) / 1000);
          docs.push(item);
          break;
        case '4006':
          item.fileName = '白板 第 ' + item.page + ' 页';
          item.type = 'wb';
          item.date = utils.toDuration((item.ts - this.startTime) / 1000);
          docs.push(item);
          break;
        case '2020':
          if (item.content !== '') {
            if (JSON.parse(item.content).switch === 'wb') {
              // item.fileName = item.fileTitle;
              item.fileName = '白板 第 ' + item.page + ' 页';
              item.type = 'wb';
              item.date = utils.toDuration((item.ts - this.startTime) / 1000);
            } else {
              item.fileName = utils.getFileName(item.fileTitle);
              item.type = 'doc';
              item.date = utils.toDuration((item.ts - this.startTime) / 1000);
              item.extension = utils.getExtension(item.fileTitle);
            }
          }
          docs.push(item);
          break;
      }
    });
    docs.sort(function (a, b) { return a.ts - b.ts });
    if (docs.length) {
      let docsc = docs.reduce((pru, cur) => {
        if (cur.ts - pru[pru.length - 1].ts > 1000) {
          pru.push(cur)
        } else if (cur.ts - pru[pru.length - 1].ts !== 0) {
          pru[pru.length - 1].children = cur;
        }
        return pru;
      }, [docs[0]])

      docsc.forEach((item, index) => {
        if (item.children) {
          docsc[index] = item.children
        }
      })
      this.playBackFile = docsc;
    }
    this.player.events.trigger("playBackFile", this.playBackFile);

    // this.player.options.highlight = this.playBackFile.reduce((pru, cur) => {
    //   pru.push({
    //     time: (cur.ts - this.startTime) / 1000,
    //     text: cur.fileName
    //   })
    //   return pru
    // }, [])


    //   highlight: [
    //     {
    //         time: 20,
    //         text: '这是第 20 秒',
    //     },
    //     {
    //         time: 120,
    //         text: '这是 2 分钟',
    //     },
    //     {
    //         time: 1500,
    //         text: '这是 1500',
    //     },
    // ],
  }

  NewDrawing(type, time: any = 0) {
    if (!this.DrawingBoard) {
      return
    }
    switch (type) {
      case 'playStart':
        // <!-- 开始播放时调用 -->
        this.DrawingBoard.playStart()
        break;
      case 'playSeek':
        // <!-- 跳转后需要调用 -->
        this.DrawingBoard.playSeek(time)
        break;
      case 'playTime':
        // <!-- 发送播放对应事件 -->
        this.DrawingBoard.playTime(parseInt(this.startTime / 1000 + time))
    }
  }

  fullscrern() {

    this.DrawingBoard.changePosFun(true)
  }


  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    utils.storage.set(this.storageName[key], value);
  }
}

export default User;
