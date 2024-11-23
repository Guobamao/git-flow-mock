<script setup>
import WorkArea from './components/WorkArea.vue';
import StagingArea from './components/StagingArea.vue';
import RepoArea from './components/RepoArea.vue';
import { useGitStore } from './stores';
import { ElMessage } from 'element-plus';

const gitStore = useGitStore();
const clearCache = () => {
  gitStore.$patch({
    repo: [],
    stagingArea: [],
    files: [],
    workAreaAnimation: {
      // 存放行的动画
      rowAnimation: {},
      // 存放单元格的动画
      cellAnimation: {},
    },
    stagingAreaAnimation: {
      // 存放行的动画
      rowAnimation: {},
      // 存放单元格的动画
      cellAnimation: {},
    },
    repoAnimation: {
      // 存放行的动画
      rowAnimation: {},
      // 存放单元格的动画
      cellAnimation: {},
    },
  });
  ElMessage.success('清空缓存成功');
}
</script>

<template>
  <div class="header">
    <span>Git三大工作区</span>
    <el-button type="primary" size="small" @click="clearCache">清空缓存</el-button>
  </div>
  <div class="container">
    <WorkArea />
    <StagingArea />
    <RepoArea />
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #8c8c8c;
}

.header span {
  font-size: 20px;
  font-weight: bold;
  color: #8c8c8c;
  line-height: 40px;
}

.container {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  height: 90%;
}

.container>div {
  border: 1px solid #ddd;
  padding: 10px;
  width: 30%;
  border-radius: 10px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, .12);
}
</style>
