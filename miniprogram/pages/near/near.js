// miniprogram/pages/near/near.js

const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    longitude: '',
    latitude: '',
    markers: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getLocation()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getLocation()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const latitude = res.latitude
        const longitude = res.longitude
        this.setData({
          longitude,
          latitude
        })
        this.getNearUser()
      }
     })
  },
  getNearUser() {
    db.collection('users').where({
      location: _.geoNear({
        geometry: db.Geo.Point(this.data.longitude, this.data.latitude),
        minDistance: 0,//单位m
        maxDistance: 5000,
      }),
      isLocation: true
    }).field({
      longitude: true,
      latitude: true,
      userPhoto: true
    }).get().then(res => {
      let data = res.data
      let result = []
      if(data.length) {
        data.map((item, idx) => {
          if(item.userPhoto.includes('cloud://')) {
            wx.cloud.getTempFileURL({
              fileList: [item.userPhoto],
              success: res => {
                result.push({
                  iconPath: res.fileList[0].tempFileURL,
                  id: item._id,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  width: 50,
                  height: 50
                })
                this.setData({
                  markers: result
                })
              },
            })
          }
          else {
            result.push({
              iconPath: item.userPhoto,
              id: item._id,
              latitude: item.latitude,
              longitude: item.longitude,
              width: 50,
              height: 50
            })
          }
        })
        this.setData({
          markers: result
        })
      }
    })
  },
  markertap(ev) {
    wx.navigateTo({
      url: '/pages/detail/detail?userId=' + ev.markerId
    })
  }
})