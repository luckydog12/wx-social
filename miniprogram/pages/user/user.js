// miniprogram/pages/user/user.js

const app = getApp()
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userPhoto: '/images/user/user-unlogin.png',
    nickName: 'luckydog',
    logged: false,
    id: ''
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
    wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then(res => {
      db.collection('users').where({
        _openid: res.result.openid
      }).get().then(res => {
        if(res.data.length) {
          app.userInfo = Object.assign(app.userInfo, res.data[0])
          this.setData({
            userPhoto: app.userInfo.userPhoto,
            nickName: app.userInfo.nickName,
            logged: true,
            id: app.userInfo._id
          })
          this.getMessage()
        } 
        else {
          console.log('1')
        }
      })
    }).catch(error => {
      console.log(error)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      userPhoto: app.userInfo.userPhoto,
      nickName: app.userInfo.nickName,
      id: app.userInfo._id
    })
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
  bindGetUserInfo(ev) {
    // console.log(ev)
    let userInfo = ev.detail.userInfo
    if(!this.data.logged && userInfo) {
      db.collection('users').add({
        data: {
          userPhoto: userInfo.avatarUrl,
          nickName: userInfo.nickName,
          signature: '',
          phoneNumber: '',
          wxNumber: '',
          likes: 0,
          time: new Date(),
          isLocation: true,
          friendsList: [],
          longitude: this.longitude,
          latitude: this.latitude,
          location: db.Geo.Point(this.longitude, this.latitude)
        }
      }).then(res => {
        db.collection('users').doc(res._id).get().then(res => {
          // console.log(res.data)
          app.userInfo = Object.assign(app.userInfo, res.data) //一级对象深拷贝，二级对象浅拷贝
          this.setData({
            userPhoto: app.userInfo.userPhoto,
            nickName: app.userInfo.nickName,
            logged: true,
            id: app.userInfo._id
          })
        })
      })
    }
  },
  getMessage() {
    db.collection('messages').where({
      userId: app.userInfo._id
    }).watch({
      onChange: function(snapshot) {
        console.log(snapshot)
        if(snapshot.docChanges.length) {
          let list = snapshot.docChanges[0].doc.list
          if (list.length) {
            wx.showTabBarRedDot({
              index: 2
            })
            app.userMessages = list
          } 
          else {
            wx.hideTabBarRedDot({
              index: 2
            })
            app.userMessages = []
          }
        }
      },
      onError: function(err) {
        console.error(err)
      }
    })
  },
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.latitude = res.latitude
        this.longitude = res.longitude
      }
     })
  }
})