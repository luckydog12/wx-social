// miniprogram/pages/detail/detail.js

const db = wx.cloud.database()
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    isFriend: false,
    isHidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userId = options.userId
    db.collection('users').doc(userId).get().then(res => {
      this.setData({
        detail: res.data
      })
      let friendsList = res.data.friendsList
      if(friendsList.includes(app.userInfo._id)) {
        this.setData({
          isFriend: true
        })
      }
      else {
        this.setData({
          isFriend: false
        }, (res) => {
          if (userId === app.userInfo._id) {
            this.setData({
              isHidden: false,
              isFriend: true
            })
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
  handleAddFriend() {
    if(app.userInfo._id) {
      db.collection('messages').where({
        userId: this.data.detail._id
      }).get().then(res => {
        console.log('111', res.data)
        if (res.data.length) {
          if(res.data[0].list.includes(app.userInfo._id)) {
            wx.showToast({
              title: '已经申请过！'
            })
          }
          else {
            wx.cloud.callFunction({
              name: 'update',
              data: {
                collection: 'messages',
                where: {
                  userId: this.data.detail._id
                },
                data: `{list: _.unshift('${app.userInfo._id}')}`
              }
            }).then(res => {
              wx.showToast({
                title: '申请成功~~'
              })
            })
          }
        }
        else {
          db.collection('messages').add({
            data: {
              userId: this.data.detail._id, //userId字段表示被添加的user
              list: [ app.userInfo._id ] //list字段表示申请加userId为好友的user
            }
          }).then(res => {
            wx.showToast({
              title: '申请成功'
            })
          })
        }
      })
    }
    else {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/user/user'
           })
          }, 2000)
          
        }
      })
    }
  }
})