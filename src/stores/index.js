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
    // 本地仓库文件 [{ id, name, versions: [{ content, message, timestamp}]}]
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
    // 本地仓库动画类
    const repoAnimation = ref({
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
      repoAnimation,

      // 操作函数调用
      createFile: (name) => actions.createFile(files.value, name),
      trackFile: (id) => actions.trackFile(files.value, id),
      editFile: (id, content) => actions.editFile(files.value, id, content),
      stageFile: (id) =>
        actions.stageFile(files.value, stagingArea.value, id, stagingAreaAnimation.value),
      unstageFile: (id) =>
        actions.unstageFile(files.value, stagingArea.value, id, workAreaAnimation.value),
      commitFile: (id, message) =>
        actions.commitFile(
          files.value,
          stagingArea.value,
          repo.value,
          id,
          message,
          repoAnimation.value,
        ),
      revertFile: (id, versionIndex) =>
        actions.revertFile(files.value, repo.value, id, versionIndex, workAreaAnimation.value),
      deleteFile: (id) =>
        actions.deleteFile(files.value, id, workAreaAnimation.value, stagingAreaAnimation.value),
    }
  },
  {
    persist: true, // 持久化存储
  },
)
