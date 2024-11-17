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
 * 提交文件到本地仓库
 * @param {Array} files 文件列表
 * @param {Array} stagingArea 暂存区文件列表
 * @param {Array} repo 本地仓库文件列表
 * @param {number} id 文件ID
 * @param {string} message 提交说明
 */
export const commitFile = (files, stagingArea, repo, id, message, repoAnimation) => {
  const stagedFile = findFileById(id, stagingArea)
  if (!stagedFile) return

  let repoFile = findFileById(id, repo)
  if (!repoFile) {
    // 如果本地仓库中没有该文件，则创建
    repoFile = { id, name: stagedFile.name, versions: [] }
    repo.push(repoFile)

    // 添加动画
    repoAnimation.rowAnimation[id] = 'animate__animated animate__bounceInLeft'

    setTimeout(() => {
      delete repoAnimation.rowAnimation[id]
    }, 1000)
  }

  // 添加新版本到本地仓库，同时将文件从暂存区移除
  repoFile.versions.unshift({
    content: stagedFile.content,
    message,
    timestamp: new Date().toLocaleString(),
  })

  removeFileById(id, stagingArea)
  const file = findFileById(id, files)
  if (file) file.status = STATUS_MAP.COMMITTED // 已提交
}

/**
 * 恢复到指定的文件版本
 * @param {Array} files 文件列表
 * @param {Array} repo 本地仓库文件列表
 * @param {number} id 文件ID
 * @param {number} versionIndex 版本索引
 */
export const revertFile = (files, repo, id, versionIndex, workAreaAnimation) => {
  const repoFile = findFileById(id, repo)
  if (!repoFile) return

  const targetVersion = repoFile.versions[versionIndex]
  const file = findFileById(id, files)
  if (file) {
    file.content = targetVersion.content // 更新文件内容
    file.status = STATUS_MAP.MODIFIED // 已修改

    workAreaAnimation.cellAnimation[id] = 'animate__animated animate__fadeIn'

    setTimeout(() => {
      delete workAreaAnimation.cellAnimation[id]
    }, 1000)
  } else {
    files.push({
      id,
      name: repoFile.name,
      content: targetVersion.content,
      status: STATUS_MAP.TRACKED,
      tracked: true, // 已追踪
      staged: false, // 未暂存
    })

    // 播放动画
    workAreaAnimation.rowAnimation[id] = 'animate__animated animate__bounceInRight'

    setTimeout(() => {
      delete workAreaAnimation.rowAnimation[id]
    }, 1000)
  }

  repoFile.versions = repoFile.versions.slice(versionIndex)
  repo.find((f) => f.id === id).versions = repoFile.versions
}

/**
 * 删除文件
 * @param {Array} files 文件列表
 * @param {number} id 文件ID
 */
export const deleteFile = (files, id, workAreaAnimation, stagingAreaAnimation) => {
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
