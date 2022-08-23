import axios from './changeAxios';
// import utils from './utils';



export default {
  // get: (options: { url: any }) => {
  //   return axios.get(options.url);
  // },

  // put: (options: { url: any }) => {
  //   return axios.put(options.url);
  // },

  getPlaybackConfig: (data) => {
    return axios({

      url: `${CLOUDWEBCAST_URL}/ccp/monitor/v2/webcast/playback_config/${data}`,
      method: 'get'
    })
  },

  getPlayback: (data) => {
    return axios({
      url: `${CLOUDWEBCAST_URL}/ccp/monitor/v2/webcast/playback`,
      method: 'get',
      params: {
        cloudRecordId: data,
        pageNum: 1,
        pageSize: 5000,
      },
      // headers: {
      //   "token": utils.getToken().token
      // }
    })
  },

  GetIcon: (data) => {
    return axios({
      url: `${CLOUDWEBCAST_URL}/ccp/monitor/v2/webcast/cloud-setting/${data}`,
      method: 'get',
    })
  },

  userLogin: (data) => {
    return axios({
      url: `${CLOUDWEBCAST_URL}/ccp/monitor/v2/playback_login`,
      method: 'POST',
      data: data
    })
  },
  // 心跳
  heartbeat: (data) => {
    return axios({
      url: `${CLOUDWEBCAST_URL}/ccp/user/v1/playback/heartbeat`,
      method: 'POST',
      data,

    })
  },

  // 获取路径
  getLocation: (data) => {
    return axios({
      url: `${CLOUDWEBCAST_CVMCURL}login/location?cmd=lookup`,
      method: 'POST',
      data
    })
  },

  send: (options: any) => { },

  read: (options: { url: any; error: (arg0: undefined) => any; success: (arg0: any) => any }) => { },
};
