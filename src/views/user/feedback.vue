<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.content" placeholder="反馈内容" style="width: 200px;margin-right: 10px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.has_reply" clearable style="width: 100px;margin-right: 10px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in hasReplyOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px;margin-right: 10px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="反馈时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="反馈内容" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="反馈用户" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="回复次数" width="150px" align="center">
        <template slot-scope="{row}">
          <el-tooltip class="item" effect="dark" content="查看回复详情" placement="top-start">
            <el-tag class="link-type" @click="showReplyDetail(row)">
              {{ row.reply_times || 0 }}
            </el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="success" size="mini" @click="handleReply(row)">
            回复
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="回复" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="时间">
          <el-date-picker v-model="temp.time" type="datetime" placeholder="Please pick a date" disabled />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="temp.content" :autosize="{ minRows: 4, maxRows: 10}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="replyFeedback">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogReplyDetailVisible" title="回复详情">
      <el-table :data="replyList" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="admin_name" label="回复管理员" />
        <el-table-column prop="content" label="内容" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogReplyDetailVisible = false">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, replyUser, deleteFeedback } from '@/api/user/feedback'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapState } from 'vuex'

export default {
  name: 'MainCate',
  components: { Pagination },
  data() {
    return {
      tableKey: 0,
      // 列表的内容
      list: null,
      // 回复详情数据
      replyList: [],
      total: 0,
      // 列表加载标识
      listLoading: true,
      // 查询列表的参数
      listQuery: {
        page: 1,
        limit: 20,
        content: undefined,
        has_reply: undefined,
        sort: '+id'
      },
      // 排序选择的option列表
      sortOptions: [{ label: 'ID 升序', key: '+id' }, { label: 'ID 降序', key: '-id' }],
      // 弹出层的填入的数据（添加和编辑操作时表内的数据）
      temp: {
        content: '',
        time: new Date(),
        admin_id: undefined,
        feedback_id: undefined
      },
      hasReplyOptions: ['已回复', '未回复'],
      // 弹出层显示标识
      dialogFormVisible: false,
      // 回复次数详情 弹出层显示状态
      dialogReplyDetailVisible: false,
      // 弹出层表单提交时的验证规则
      rules: {
        content: [{ required: true, message: 'content is required', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  computed: { ...mapState(['user']) },
  created() {
    this.getList()
  },
  methods: {

    // 获取数据列表
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        // 将列表加载隐藏
        this.listLoading = false
      })
    },

    // 当对筛选条件进行了操作时
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    // 选择排序筛选
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },

    // 重置弹出层表单内容
    resetTemp() {
      this.temp = {
        content: '',
        time: new Date(),
        admin_id: undefined,
        feedback_id: undefined
      }
    },

    // 点击回复次数，查看回复详情
    showReplyDetail(row) {
      this.dialogReplyDetailVisible = true
      this.replyList = row.reply_data
    },

    // 点击操作中 回复 按钮
    handleReply(row) {
      this.resetTemp()
      // 将点击行的feedback_id 设置到提交数据中
      this.temp.feedback_id = Number(row.id)
      // 显示填写回复的表单
      this.dialogFormVisible = true
    },

    // 点击弹出层确定，提交回复内容
    replyFeedback() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const data = Object.assign({}, this.temp)
          data.admin_id = this.user.admin_id
          data.time = parseTime(data.time, '{y}-{m}-{d} {h}:{i}:{s}')
          // 提交回复
          replyUser(data).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '回复成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },

    // 点击删除某行数据
    handleDelete(row, index) {
      this.$confirm('确定删除吗？')
        .then((res) => {
          deleteFeedback({ id: row.id })
            .then(() => {
              this.$notify({
                title: '成功',
                message: '删除成功',
                type: 'success',
                duration: 2000
              })
              this.list.splice(index, 1)
            })
        })
        .catch(() => {})
    },

    // 点击导出按钮
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['id', 'time', 'content', 'user_name', 'reply_times']
        const filterVal = ['id', 'time', 'content', 'user_name', 'reply_times']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'time') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
