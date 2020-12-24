// components/removeList/removeList.js

const db = wx.cloud.database()
const app = getApp()
const _ = db.command

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    messageId: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    userMessages: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleDelete() {
      wx.showModal({
        title: '提示信息',
        content: '删除消息',
        confirmText: '删除',
        success: (res) => {
          if(res.confirm) {
            this.removeMessage()
          }
          else if(res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    handleAdd() {
      wx.showModal({
        title: '提示信息',
        content: '申请好友',
        confirmText: '同意',
        success: (res) => {
          if(res.confirm) {
            //更新自己的数据库在客户端就可
            db.collection('users').doc(app.userInfo._id).update({
              data: {
                friendsList: _.unshift(this.data.messageId)
              }
            }).then(res=>{})
            //更新他人的数据库需要调用云函数
            wx.cloud.callFunction({
              name: 'update',
              data: {
                collection: 'users',
                doc: this.data.messageId,
                data: `{
                  friendsList: _.unshift('${app.userInfo._id}')
                }`
              }
            }).then(res => {})
            this.removeMessage()
          } else if(res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    removeMessage() {
      db.collection('messages').where({
        userId: app.userInfo._id
      }).get().then(res => {
        let list = res.data[0].list
        list = list.filter((val, idx) => {
          return val != this.data.messageId
        })
        console.log(list)
        wx.cloud.callFunction({
          name: 'update',
          data: {
            collection: 'messages',
            where: {
              userId: app.userInfo._id
            },
            data: {
              list
            }
          }
        }).then(res => {
          this.triggerEvent('myevent', list)
        })
      })
    }
  },
  lifetimes: {
    attached: function() {
      db.collection('users').doc(this.data.messageId).field({
        userPhoto: true,
        nickName: true
      }).get().then(res => {
        this.setData({
          userMessages: res.data
        })
      })
    }
  }
})
