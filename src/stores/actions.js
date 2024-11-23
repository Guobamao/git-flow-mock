import STATUS_MAP from '@/constants/Status'

// 工具函数

/**
 * 根据文件ID查找文件
 * @param {number} id 文件ID
 * @param {Array} fileList 文件列表
 * @returns 匹配的文件对象或 null
 */
export const findFileById = (id, fileList) => fileList.find((f) => f.id === id)

/**
 * 根据文件ID从列表中移除文件
 * @param {number} id 文件ID
 * @param {Array} fileList 文件列表
 */
export const removeFileById = (id, fileList) => {
  const index = fileList.findIndex((f) => f.id === id)
  if (index > -1) fileList.splice(index, 1)
}

/**
 * 创建一个新文件
 * @param {Array} files 文件列表
 * @param {string} name 文件名
 */
export const createFile = (files, name) => {
  files.push({
    id: Date.now(), // 用当前时间戳作为id
    name,
    content: '',
    status: STATUS_MAP.UNTRACKED, // 未追踪状态
    tracked: false, // 是否已追踪
    staged: false, // 是否已暂存
    modified: false, // 是否已修改
  })
}

/**
 * 将文件标记为已追踪
 * @param {Array} files 文件列表
 * @param {number} id 文件ID
 */
export const trackFile = (files, id) => {
  const file = findFileById(id, files)
  if (file) {
    file.tracked = true // 标记为已追踪
    file.status = STATUS_MAP.TRACKED // 设置为已追踪状态
  }
}

/**
 * 修改文件内容
 * @param {Array} files 文件列表
 * @param {number} id 文件ID
 * @param {string} content 文件内容
 */
export const editFile = (files, id, content) => {
  const file = findFileById(id, files)
  if (file) {
    if (file.staged) file.status = STATUS_MAP.MODIFIED // 已修改
    file.modified = true
    file.content = content
  }
}

/**
 * 将文件添加到暂存区
 * @param {Array} files 文件列表
 * @param {Array} stagingArea 暂存区文件列表
 * @param {number} id 文件ID
 */
export const stageFile = (files, stagingArea, id, stagingAreaAnimation) => {
  const file = findFileById(id, files)
  if (!file) return

  // 已追踪 或 已修改 文件，可以进行暂存
  if ([STATUS_MAP.TRACKED, STATUS_MAP.MODIFIED].includes(file.status)) {
    file.status = STATUS_MAP.STAGED // 已暂存
    file.staged = true // 标记为已暂存
    file.modified = false // 标记为未修改

    // 检查暂存区是否已经存在
    const existingIndex = stagingArea.findIndex((f) => f.id === id)
    if (existingIndex > -1) {
      // 如果已存在，则更新内容
      stagingArea[existingIndex] = { ...file }
    } else {
      // 如果文件不存在暂存区，则添加文件
      stagingArea.push({ ...file })

      // 添加动画
      stagingAreaAnimation.rowAnimation[id] = 'animate__animated animate__bounceInLeft'

      setTimeout(() => {
        delete stagingAreaAnimation.rowAnimation[id]
      }, 1000)
    }
  } else if (file.status === STATUS_MAP.DELETED) {
    // 当工作区文件已删除时，提交暂存，暂存的文件也删掉
    removeFileById(id, stagingArea)
    removeFileById(id, files)
  }
}

/**
 * 从暂存区移除文件
 * @param {Array} files 文件列表
 * @param {Array} stagingArea 暂存区文件列表
 * @param {number} id 文件ID
 */
export const unstageFile = (files, stagingArea, id, workAreaAnimation) => {
  // 从暂存区移除文件
  removeFileById(id, stagingArea)
  const file = findFileById(id, files)
  if (file) {
    // 如果文件已删除，则从文件列表中移除
    if (file.status === STATUS_MAP.DELETED) {
      workAreaAnimation.rowAnimation[file.id] = 'animate__animated animate__bounceOutLeft'

      setTimeout(() => {
        removeFileById(id, files)
        delete workAreaAnimation.rowAnimation[file.id]
      }, 1000)
    } else {
      // 否则，将文件状态设置为已追踪、未暂存
      file.status = STATUS_MAP.TRACKED // 已追踪
      file.staged = false // 标记为未暂存
      file.modified = true // 标记为已修改

      // 添加动画
      workAreaAnimation.cellAnimation[id] = 'animate__animated animate__fadeIn'

      setTimeout(() => {
        delete workAreaAnimation.cellAnimation[id]
      }, 500)
    }
  }
}

/**
 * 提交文件
 * @param {Array} fileIds 提交文件ID
 * @param {String} message 提交信息
 * @param {Array} files 文件列表
 * @param {Array} stagingArea 暂存区文件列表
 * @param {Array} repo 本地仓库列表
 */
export const commitFiles = (fileIds, message, files, stagingArea, repo) => {
  console.log('FileIds:', fileIds)

  // 获取提交文件集合
  const fileList = fileIds.map((id) => findFileById(id, files))
  console.log('fileList:', fileList)

  // 添加新版本到本地仓库，同时将文件从暂存区移除
  const repoHistory = {
    id: repo.length + 1,
    message,
    timestamp: new Date().toLocaleString(),
    files: fileList.map((f) => {
      return {
        id: f.id,
        name: f.name,
        content: f.content,
      }
    }),
  }

  // 倒序插入
  repo.unshift(repoHistory)

  // 移除暂存区的文件
  fileList.forEach((f) => {
    removeFileById(f.id, stagingArea)
    const file = findFileById(f.id, files)
    if (file) file.status = STATUS_MAP.COMMITTED // 已提交
  })
}

/**
 *
 * @param {String} commitId 提交ID
 * @param {Array} files 所有文件列表
 * @param {Array} repo 本地仓库列表
 * @param {Array} workAreaAnimation 本店仓库动画
 * @returns
 */
export const revertFile = (commitId, files, repo, workAreaAnimation) => {
  const repoHistory = findFileById(commitId, repo)
  if (!repoHistory) return

  const fileList = repoHistory.files
  fileList.forEach((f) => {
    // 判断工作区是否存在该文件，存在则更新，不存在则添加
    const file = findFileById(f.id, files)
    if (file) {
      file.content = f.content // 更新文件内容
      file.status = STATUS_MAP.MODIFIED // 已修改

      workAreaAnimation.cellAnimation[file.id] = 'animate__animated animate__fadeIn'

      setTimeout(() => {
        delete workAreaAnimation.cellAnimation[file.id]
      }, 1000)
    } else {
      files.push({
        ...f,
        status: STATUS_MAP.TRACKED, // 已跟踪
        tracked: true, // 已跟踪
        staged: false, // 未暂存
      })

      // 添加动画
      workAreaAnimation.rowAnimation[f.id] = 'animate__animated animate__bounceInRight'

      setTimeout(() => {
        delete workAreaAnimation.rowAnimation[f.id]
      }, 1000)
    }
  })
  // 移除本地仓库记录
  const commitIndex = repo.findIndex((c) => c.id === commitId)
  repo.splice(0, commitIndex)
}

/**
 * 删除文件
 * @param {Array} files 文件列表
 * @param {number} id 文件ID
 */
export const deleteFile = (files, id, workAreaAnimation) => {
  const file = findFileById(id, files)
  if (!file) return

  // 判断文件是否已暂存，如果是，设置暂存文件状态为已删除
  if (file.staged) {
    file.status = STATUS_MAP.DELETED // 已删除

    // 添加动画
    workAreaAnimation.cellAnimation[file.id] = 'animate__animated animate__fadeIn'

    setTimeout(() => {
      delete workAreaAnimation.cellAnimation[file.id]
    }, 1000)
  } else {
    workAreaAnimation.rowAnimation[file.id] = 'animate__animated animate__bounceOutLeft'

    setTimeout(() => {
      removeFileById(id, files)
      delete workAreaAnimation.rowAnimation[file.id]
    }, 1000)
  }
}
