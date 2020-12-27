<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :xs="24" :sm="24" :md="12" :lg="{span: 6, offset: 3}" :xl="{span: 6, offset: 3}">
          <user-card :user="user" @modify="handleModifyAvatar" />
        </el-col>
        <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <img :src="'https://wpimg.wallstcn.com/0e03b7da-db9e-4819-ba10-9016ddfdaed3'" class="emptyGif" style="width: 100%">
        </el-col>

      </el-row>
    </div>
    <el-dialog
      title="上传头像"
      :visible.sync="dialogVisible"
      width="500px"
      @open="handleDialogOpen"
      @close="handleDialogOpen"
    >
      <el-upload
        ref="upload"
        class="upload-wrap"
        :drag="!showUpload"
        action="https://jsonplaceholder.typicode.com/posts/"
        :auto-upload="false"
        :file-list="fileList"
        list-type="picture"
        :limit="1"
        :on-change="handleChange"
        :on-remove="() => showUpload = false"
        :http-request="handleRequestUpload"
      >
        <div v-show="!showUpload">
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </div>
        <div v-show="!showUpload" slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button v-show="showUpload" style="margin-left: 10px;" size="small" type="primary" @click="$refs.upload.submit()">上传并保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
import { uploadAvatar } from '@/api/user'

export default {
  name: 'Profile',
  components: { UserCard },
  data() {
    return {
      user: {},
      dialogVisible: false,
      showUpload: false,
      fileList: []
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles',
      'introduction',
      'admin_id'
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      this.user = {
        name: this.name,
        role: this.roles.join(' | '),
        avatar: this.avatar,
        introduction: this.introduction,
        tempAvatar: undefined
      }
    },

    // 替换头像
    handleModifyAvatar() {
      this.dialogVisible = true
    },

    // 头像上传对话框打开
    handleDialogOpen() {
      // 清空图片上传中所有的数据
      this.fileList = []
      if (this.$refs.upload) { this.$refs.upload.uploadFiles = [] }
      this.showUpload = false
    },

    handleChange(file, fileList) {
      if (file.status === 'ready') {
        // 选择了文件
        const fileInfo = file.raw
        // 判断图片大小是否小于2M
        if (fileInfo.size / 1024 / 1024 > 2) {
          this.$alert('上传图片大小不能超过 2MB!', '提示', { type: 'error' })
          this.fileList = []
          this.$refs.upload.uploadFiles = []
          return
        } else if (fileInfo.type.indexOf('image') === -1) {
          // 判断选择的是否为图片
          this.$alert('请选择图片资源!', '提示', { type: 'error' })
          this.fileList = []
          this.$refs.upload.uploadFiles = []
          return
        }

        // 检查文件大小
        this.checkImg(file.url)
          .then(() => {
            this.showUpload = true
          })
          .catch(() => {
            this.$alert('图片宽度*高度至少为150*150像素!', '提示', { type: 'error' })
            this.fileList = []
            this.$refs.upload.uploadFiles = []
          })
      }
    },

    // 将头像上传至服务器并修改用户头像
    async handleRequestUpload(param) {
      // const fileUrl = this.$refs.upload.uploadFiles[0].url
      const file = param.file

      const forms = new FormData()
      forms.append('file', file)
      forms.append('admin_id', this.admin_id)
      forms.append('avatar', this.avatar)
      // 发送请求，上传用户头像
      let res
      try {
        res = await uploadAvatar(forms)
      } catch (e) {
        // 头像修改失败，将上传框关闭显示
        this.dialogVisible = false
        return
      }

      // 请求并返回成功数据后...
      const url = res.data.url

      // 修改vuex中用户的头像
      await this.$store.dispatch('user/modifyAvatar', url)

      // 修改当前页面用户的头像
      this.user.tempAvatar = url
      this.dialogVisible = false
      this.$message({
        message: '修改头像成功',
        type: 'success'
      })
    },

    checkImg(url) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = url
        img.onload = () => {
          if (img.width < 150 || img.height < 150) {
            reject()
          } else {
            resolve()
          }
        }
      })
    }

  }
}
</script>

<style>
  .upload-wrap {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
