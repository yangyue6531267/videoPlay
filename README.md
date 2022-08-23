# 安装

## `<script>`

```html
<!DOCTYPE html>
<html lang="en">
	<div id="CloudPlayback-container"></div>
    <div id="CloudPlayback-document-container"></div>
<head>
  <script src="CloudPlayback.js"></script>
  <script>
  const cloudPlayback = new CloudPlayback({
            container: document.getElementById('CloudPlayback-container'),
            documentContainer: document.getElementById('CloudPlayback-document-container'),
            controllerContainer: document.getElementById('CloudPlayback-controller-container'),
            recordId:'1519216100695347288',
			passCode: '',
            userId: '222',
            nickName: '111',
            preload: true, //视频预加载
            isIframeShow:true, //文档开关展示
            theme: "#01beff", //主题色
            pluginOptions: { // 预加载hls
                hls: {
                    enableWorker: false,
                    isLive: false
                },
            },
        });
        cloudPlayback.init();
  </script>
</head>
<body>
	<div id="CloudPlayback-container"></div>
    <div id="CloudPlayback-document-container"></div>
</body>
```

## `npm`

```shell
# 最新稳定版本
npm install CloudPlayback
```

```js
import * as CloudPlayback from 'CloudPlayback'
const cloudPlayback = CloudPlayback.init({
	// ...
})
```


## 其他

暂无示例

#功能参数

| 名称 | 默认值 | 描述 |
|:--- |:--- |:---  |
| container | document.querySelector('.dplayer') | 播放器容器元素 |
| theme | '#b7daff' | 主题色 |
| loop | false | 视频循环播放 |
| lang | navigator.language.toLowerCase() | 可选值: 'en', 'zh-cn', 'zh-tw' |
| hotkey | true | 开启热键，支持快进、快退、音量控制、播放暂停 |
| airplay | true | 在 Safari 中开启 AirPlay |
| preload | 'auto' | 视频预加载，可选值: 'none', 'metadata', 'auto' |
| volume | 0.7 | 默认音量，请注意播放器会记忆用户设置，用户手动设置音量后默认音量即失效 |
| playbackSpeed | [0.5, 0.75, 1, 1.25, 1.5, 2] | 可选的播放速率，可以设置成自定义的数组 |
| video | - | 视频信息 |
| video.quality | - | 见#清晰度切换 |
| video.defaultQuality | - | 见#清晰度切换 |
| video.url | - | 视频链接 |
| video.pic | - | 视频封面 |
| recordId | - | 录制件ID |
| passCode | - | 用户密码 |
| userId | - | 用户ID |
| nickName | - | 用户名 |

# API

- cloudPlayback.play(): 播放视频

- cloudPlayback.pause(): 暂停视频

- cloudPlayback.seek(time: number): 跳转到特定时间

- cloudPlayback.toggle(): 切换播放和暂停

- cloudPlayback.on(event: string, handler: function): 绑定视频和播放器事件

- cloudPlayback.switchQuality(HD): 切换清晰度

- cloudPlayback.destroy(): 销毁播放器

- cloudPlayback.speed(rate: number): 设置视频速度

- cloudPlayback.volume(percentage: number, nostorage: boolean, nonotice: boolean): 设置视频音量

- cloudPlayback.video: 原生 video

- cloudPlayback.video.currentTime: 返回视频当前播放时间

- cloudPlayback.video.duration: 返回视频总时间

- cloudPlayback.video.paused: 返回视频是否暂停

   支持大多数原生 video 接口(opens new window)

- cloudPlayback.fullScreen.request(): 进入全屏

- cloudPlayback.fullScreen.cancel(): 退出全屏

- cloudPlayback.fullScreen.changeAudio(): 切换音视频
#事件绑定

- cloudPlayback.on(event, handler)

```
cloudPlayback.on('ended', function () {
    console.log('player ended');
});
```
###视频事件
canplay:初始化完成
ended：结束
error：视频报错
pause：暂停
play：开始播放
playing：播放回调
seeked：跳转结束
seeking：跳转中
fullscreen：全屏
fullscreen_cancel：退出全屏

### 录制件信息
'chatList'：聊天信息
```
cmd: "1701" // 聊天：1701
content: {
	body: "1、现在开始录制，2022-04-27 09:26" // 聊天内容
	headImgUrl: "" //头像图标
	imgState: false //是否有图
	imgUrl: "" //图片
	name: "Chrome主播" //用户名
	quote: {} //问答
	role: "6" //角色
	type: "normal" 
}
fromCid: "U00000001" // 来源cid
fromDev: "web" //来源
fromUid: "1519123907150352450111111" //发出id
id: "62689bd9b95b466bfd2615f1" // 消息id
mid: "gbe5x4DTATeyF4N1651022809176"
time: "1651022809678" //聊天信息时间
```
'loginInfo'：登录信息
```
	Remarks: 备注信息
	m3u8_file_ids: 播放链接地址
	nickName: 用户名字
	passCode: 密码
	playback_title: "录制件主題"
	player_url: "https://casttest.263live.net/rFfsoa"
	type: 有无密码 0没有 1有
```
'playBackSet'：获取录制件设置
```
layout_chat: true  //聊天室：启用/不启用
layout_doc: true  //文档共享：启用/不启用
playback_summary: "" //内容介绍：

```
'playBackBackground'：获取直播间UI信息
```
background: "" //回放背景
icon: "" // 页签
logo: "" //回放图标

```
'playBackTime'：回放时间
```
endTime: 1651111787000 //结束时间
startTime: 1651111775000  //开始时间
```
'playBackFile'：回放目录
```
cmd: "3001" //cmd标识 详情见文档cmd对应表
content: "" //内容
date: "02:22" //相对时间点
extension: "docx" //文档类型
fileId: "861df292a7be40f6b7f905959eee7dc1" //文档唯一标识
fileName: "二六三e-HR系统-员工自助操作手册V1.6" //文档名字
fileTitle: "二六三e-HR系统-员工自助操作手册V1.6.docx" //文档全称
host: "https://livetest.263cv.net/file/web/doc" //文档地址
id: "62689c5d7bfda64df4b791b2"
page: "1" //页码
pageId: ""
shareId: "62689c5d7bfda64df4b791b1"
timely: 0
ts: 1651022941426 //文档开始时间
type: "doc" //文档类型 doc：文档 web：白板
```
shareDocBl：文档开关状态

userError：录制件请求错误信息