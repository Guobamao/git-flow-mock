import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as actions from './actions'

export const useGitStore = defineStore(
  'git',
  () => {
    // 文件列表 [{ id, name, content, status, tracked, staged }]
    const files = ref([])
    // 暂存区文件列表 [{ id, name, content, status, tracked, staged }]
    const stagingArea = ref([])
    // 本地仓库文件 [{ id, message, timestamp, files: [{  }]
    const repo = ref([])

    // 工作区动画类
    const workAreaAnimation = ref({
      // 存放行的动画
      rowAnimation: {},
      // 存放单元格的动画
      cellAnimation: {},
    })
    // 暂存区动画类
    const stagingAreaAnimation = ref({
      // 存放行的动画
      rowAnimation: {},
      // 存放单元格的动画
      cellAnimation: {},
    })

    return {
      files,
      stagingArea,
      repo,
      workAreaAnimation,
      stagingAreaAnimation,

      // 操作函数调用
      createFile: (name) => actions.createFile(files.value, name),
      trackFile: (id) => actions.trackFile(files.value, id),
      editFile: (id, content) => actions.editFile(files.value, id, content),
      stageFile: (id) =>
        actions.stageFile(files.value, stagingArea.value, id, stagingAreaAnimation.value),
      unstageFile: (id) =>
        actions.unstageFile(files.value, stagingArea.value, id, workAreaAnimation.value),
      commitFiles: (fileIds, message) =>
        actions.commitFiles(fileIds, message, files.value, stagingArea.value, repo.value),
      revertFile: (commitId) =>
        actions.revertFile(commitId, files.value, repo.value, workAreaAnimation.value),
      deleteFile: (id) =>
        actions.deleteFile(files.value, id, workAreaAnimation.value, stagingAreaAnimation.value),
    }
  },
  {
    persist: true, // 持久化存储
  },
)
