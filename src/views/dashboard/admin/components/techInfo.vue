<template>
  <el-card class="box-card-component" style="margin-left:8px;">
    <div slot="header" class="box-card-header">
      <img src="https://s3.ax1x.com/2020/12/27/r472B4.jpg">
    </div>
    <mallki class-name="mallki-text" text="技术占比" />
    <div style="padding-top:15px;" class="progress-item">
      <span>Vue</span>
      <el-progress :percentage="40" />
    </div>
    <div class="progress-item">
      <span>JavaScript</span>
      <el-progress :percentage="10" />
    </div>
    <div class="progress-item">
      <span>HTML\CSS</span>
      <el-progress :percentage="20" />
    </div>
    <div class="progress-item">
      <span>PHP</span>
      <el-progress :percentage="30" />
    </div>
  </el-card>
</template>

<script>
import Mallki from '@/components/TextHoverEffect/Mallki'

export default {
  components: { Mallki }
}
</script>

<style lang="scss" scoped>
  .box-card-component {
    .box-card-header {
      position: relative;
      height: 220px;
      img {
        width: 100%;
        height: 100%;
        transition: all 0.2s linear;
        &:hover {
          transform: scale(1.1, 1.1);
          filter: contrast(130%);
        }
      }
    }
    .progress-item {
      margin-bottom: 10px;
      font-size: 14px;
    }
  }
</style>
