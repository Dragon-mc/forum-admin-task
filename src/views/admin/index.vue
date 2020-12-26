<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="用户名" style="width: 200px;margin-right: 10px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.level" clearable style="width: 100px;margin-right: 10px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in levelOptions" :key="item.name" :label="item.name" :value="item.level" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px;margin-right: 10px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
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
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.create_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="150px">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
          <el-tag v-if="user.admin_id==row.id">
            Self
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="介绍" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.introduction }}</span>
        </template>
      </el-table-column>
      <el-table-column label="管理员级别" width="150px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.level | levelFilter">
            <span>{{ row.level==1?'普通管理员':'超级管理员' }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username" placeholder="Please input" />
        </el-form-item>
        <el-form-item v-if="dialogStatus=='create'" label="密码" prop="password">
          <el-input v-model="temp.password" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="时间" prop="create_time">
          <el-date-picker v-model="temp.create_time" disabled type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="级别">
          <el-select v-model="temp.level" class="filter-item" placeholder="Please select">
            <!-- <el-option v-for="item in levelOptions" :key="item" :label="item" :value="item" /> -->
            <el-option label="普通管理员" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="介绍">
          <el-input v-model="temp.introduction" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, updateAdmin, createAdmin, deleteAdmin } from '@/api/admin'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapState } from 'vuex'

export default {
  name: 'MainCate',
  components: { Pagination },
  directives: { waves },
  filters: {
    levelFilter(level) {
      const typeMap = {
        0: 'danger',
        1: ''
      }
      return typeMap[level]
    }
  },
  computed: { ...mapState(['user']) },
  data() {
    return {
      tableKey: 0,
      // 列表的内容
      list: null,
      total: 0,
      // 列表加载标识
      listLoading: true,
      // 查询列表的参数
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        level: undefined,
        sort: '+id'
      },
      // 排序选择的option列表
      sortOptions: [{ label: 'ID 升序', key: '+id' }, { label: 'ID 降序', key: '-id' }],
      // 弹出层的填入的数据（添加和编辑操作时表内的数据）
      temp: {
        username: '',
        password: undefined,
        create_time: new Date(),
        level: '普通管理员',
        introduction: ''
      },
      levelOptions: [{ name: '超级管理员', level: 0 }, { name: '普通管理员', level: 1 }],
      // 弹出层显示标识
      dialogFormVisible: false,
      // 弹出层的状态（区分当前操作是编辑还是创建）
      dialogStatus: '',
      // 根据不同弹出层状态，选择对应的文字
      textMap: {
        update: '编辑',
        create: '添加'
      },
      // 弹出层表单提交时的验证规则
      rules: {
        username: [{ required: true, message: 'username is required', trigger: 'change' }],
        create_time: [{ type: 'date', required: true, message: 'time is required', trigger: 'change' }],
        password: [{ required: true, message: 'password is required', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
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
        username: '',
        password: undefined,
        create_time: new Date(),
        level: '普通管理员',
        introduction: ''
      }
    },

    // 点击创建按钮
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 当提交创建数据时
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const data = Object.assign({}, this.temp)
          data.level = (data.level == '普通管理员' || data.level == 1) ? 1 : 0
          data.create_time = parseTime(data.create_time, '{y}-{m}-{d} {h}:{i}:{s}')
          createAdmin(data).then(() => {
            // 刷新列表
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },

    // 点击编辑按钮 或 点击分类名称时 触发
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.time = new Date(this.temp.time)
      this.temp.level = this.temp.level == '1' ? '普通管理员' : '超级管理员'
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 当提交更新数据时
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.create_time = parseTime(tempData.create_time, '{y}-{m}-{d} {h}:{i}:{s}') // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 2017-11-30 16:41:05
          tempData.level = (tempData.level == '普通管理员' || tempData.level == 1) ? 1 : 0
          updateAdmin(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
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
          deleteAdmin({ id: row.id })
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
        const tHeader = ['id', 'create_time', 'last_time', 'username', 'nickname', 'sex', 'sign']
        const filterVal = ['id', 'create_time', 'last_time', 'username', 'nickname', 'sex', 'sign']
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
