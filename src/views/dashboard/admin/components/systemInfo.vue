<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>系统信息</span>
    </div>
    <table border="1" cellpadding="36">
      <tr>
        <td class="tit">运行环境</td>
        <td class="val">{{ system.environment }}</td>
      </tr>
      <tr>
        <td class="tit">WEB服务器</td>
        <td class="val">{{ system.webServer }}</td>
      </tr>
      <tr>
        <td class="tit">数据库</td>
        <td class="val">{{ system.mysqlVersion }}</td>
      </tr>
      <tr>
        <td class="tit">后端语言</td>
        <td class="val">{{ system.phpVersion }}</td>
      </tr>
    </table>
  </el-card>
</template>

<script>
export default {
  props: {
    system: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="scss" scoped>
  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #dedede;
    .tit {
      color: #1890ff;
      font-weight: bold;
    }
    .val {
      color: #222226;
    }
  }
</style>
