<template>
  <div class="dashboard-editor-container">
    <github-corner class="github-corner" />

    <panel-group :statistics="statistics" /> <!-- @handleSetLineChartData="handleSetLineChartData" -->

    <!-- <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row> -->

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <!-- <div class="chart-wrapper">
          <raddar-chart />
        </div> -->
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <!-- <div class="chart-wrapper">
          <pie-chart />
        </div> -->
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <!-- <div class="chart-wrapper">
          <bar-chart />
        </div> -->
      </el-col>
    </el-row>

    <el-row :gutter="32">
      <!-- <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 12}" :xl="{span: 12}" style="padding-right:8px;margin-bottom:30px;">
        <transaction-table />
      </el-col> -->
      <!-- <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <todo-list />
      </el-col> -->
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <box-card />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 12}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
        <tech-info />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 12}" :xl="{span: 12}" style="margin-bottom:30px;">
        <system-info :system="system" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import GithubCorner from '@/components/GithubCorner'
import PanelGroup from './components/PanelGroup'
import BoxCard from './components/BoxCard'
import systemInfo from './components/systemInfo'
import techInfo from './components/techInfo'
import { fetchIndexInfo } from '@/api/user'

export default {
  components: {
    GithubCorner,
    PanelGroup,
    BoxCard,
    systemInfo,
    techInfo
  },
  data() {
    return {
      statistics: {},
      system: {}
    }
  },
  created() {
    fetchIndexInfo().then(res => {
      this.statistics = res.data.statistics
      this.system = res.data.system
    })
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;
  height: 100%;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
