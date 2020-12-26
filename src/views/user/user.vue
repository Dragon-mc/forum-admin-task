<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="用户名" style="width: 200px;margin-right: 10px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.nickname" placeholder="昵称" style="width: 200px;margin-right: 10px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.sex" clearable style="width: 100px;margin-right: 10px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sexOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px;margin-right: 10px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
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
      <el-table-column label="最后登录时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.last_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="150px">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="昵称" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.sex | sexFilter">
            <span>{{ row.sex }}</span>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="个性签名" min-width="110px">
        <template slot-scope="{row}">
          <span>{{ row.sign }}</span>
        </template>
      </el-table-column>
      <el-table-column label="简介" min-width="110px">
        <template slot-scope="{row}">
          <span>{{ row.introduction }}</span>
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
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="80px" style="width: 400px; margin-left:50px;">
        <el-form-item label="昵称">
          <el-input v-model="temp.nickname" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="temp.sex" class="filter-item" placeholder="Please select">
            <el-option v-for="item in sexOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input v-model="temp.sign" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="temp.introduction" :autosize="{ minRows: 4, maxRows: 10}" type="textarea" placeholder="Please input" />
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
import { fetchList, updateUser, deleteUser } from '@/api/user_list'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'MainCate',
  components: { Pagination },
  directives: { waves },
  filters: {
    sexFilter(sex) {
      const typeMap = {
        '男': '',
        '女': 'danger'
      }
      return typeMap[sex]
    }
  },
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
        nickname: undefined,
        sex: undefined,
        introduction: '',
        sort: '+id'
      },
      // 排序选择的option列表
      sortOptions: [{ label: 'ID 升序', key: '+id' }, { label: 'ID 降序', key: '-id' }],
      // 弹出层的填入的数据（添加和编辑操作时表内的数据）
      temp: {
        nickname: '',
        sex: '男',
        sign: ''
      },
      sexOptions: ['男', '女'],
      // 弹出层显示标识
      dialogFormVisible: false,
      // 弹出层的状态（区分当前操作是编辑还是创建）
      dialogStatus: '',
      // 根据不同弹出层状态，选择对应的文字
      textMap: {
        update: '编辑',
        create: '添加'
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
        nickname: '',
        sex: '男',
        sign: ''
      }
    },

    // 点击编辑按钮 或 点击分类名称时 触发
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.time = new Date(this.temp.time)
      this.temp.status = this.temp.status == '1' ? '已发布' : '待发布'
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 当提交更新数据时
    updateData() {
      const tempData = Object.assign({}, this.temp)
      tempData.time = parseTime(tempData.time, '{y}-{m}-{d} {h}:{i}:{s}') // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 2017-11-30 16:41:05
      updateUser(tempData).then(() => {
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
    },

    // 点击删除某行数据
    handleDelete(row, index) {
      this.$confirm('确定删除吗？')
        .then((res) => {
          deleteUser({ id: row.id })
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
