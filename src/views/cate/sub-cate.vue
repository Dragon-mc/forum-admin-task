<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="分类名称" style="width: 200px;margin-right: 10px" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.sort" style="width: 140px;margin-right: 10px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
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
      <el-table-column label="添加时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类名称" min-width="60px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属主分类" min-width="60px">
        <template slot-scope="{row}">
          <span>{{ row.main_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类描述" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.desc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加者" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.admin_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status=='1'?'已发布':'待发布' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='1'&&row.status!='已发布'" size="mini" type="success" @click="handleModifyStatus(row,'published')">
            发布
          </el-button>
          <el-button v-if="row.status!='0'&&row.status!='待发布'" size="mini" @click="handleModifyStatus(row,'draft')">
            待发布
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
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="temp.name" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="主分类">
          <el-select v-model="temp.main_id" filterable placeholder="Please select">
            <el-option v-for="item in mainCateList" :key="item.name" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间" prop="time">
          <el-date-picker v-model="temp.time" disabled type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item=='已发布'?1:0" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input v-model="temp.desc" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
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
import { fetchList, createCate, updateCate, deleteCate, updateStatus, fetchMainCate } from '@/api/category/sub_cate'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { mapState } from 'vuex'

export default {
  name: 'MainCate',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'info'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      // 列表的内容
      list: null,
      // 主分类列表
      mainCateList: [],
      total: 0,
      // 列表加载标识
      listLoading: true,
      // 查询列表的参数
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        sort: '+id'
      },
      // 排序选择的option列表
      sortOptions: [{ label: 'ID 升序', key: '+id' }, { label: 'ID 降序', key: '-id' }],
      // 发布状态的选择列表
      statusOptions: ['已发布', '待发布'],
      // 弹出层的填入的数据（添加和编辑操作时表内的数据）
      temp: {
        name: '',
        main_id: undefined,
        time: new Date(),
        status: '已发布',
        desc: '',
        admin_id: undefined
      },
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
        desc: [{ required: true, message: 'description is required', trigger: 'change' }],
        time: [{ type: 'date', required: true, message: 'time is required', trigger: 'change' }],
        name: [{ required: true, message: 'name is required', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  computed: {
    ...mapState(['user'])
  },
  created() {
    this.getList()
    this.getMainCate()
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

    // 获取主分类列表
    getMainCate() {
      fetchMainCate().then(response => {
        this.mainCateList = response.data
      })
    },

    // 当对筛选条件进行了操作时
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    // 点击操作中，更改状态的按钮
    handleModifyStatus(row, status) {
      status = status === 'published' ? 1 : 0
      updateStatus({ id: row.id, status })
        .then(() => {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          row.status = status
        })
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
        name: '',
        main_id: undefined,
        time: new Date(),
        status: '已发布',
        desc: '',
        admin_id: undefined
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
          data.admin_id = this.user.admin_id
          data.status = (data.status === '已发布' || Number(data.status) === 1) ? 1 : 0
          data.time = parseTime(data.time, '{y}-{m}-{d} {h}:{i}:{s}')
          createCate(data).then(() => {
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
      this.temp.status = Number(this.temp.status) === 1 ? '已发布' : '待发布'
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
          tempData.time = parseTime(tempData.time, '{y}-{m}-{d} {h}:{i}:{s}') // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 2017-11-30 16:41:05
          tempData.status = tempData.status === '已发布' ? 1 : 0
          updateCate(tempData).then(() => {
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
          deleteCate({ id: row.id })
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
        const tHeader = ['id', 'time', 'name', 'main_name', 'admin_name', 'status']
        const filterVal = ['id', 'time', 'name', 'main_name', 'admin_name', 'status']
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
