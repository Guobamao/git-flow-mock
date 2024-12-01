import { ElMessage } from "element-plus";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useBranchStore = defineStore(
  "branch",
  () => {
    const branches = ref([
      {
        name: "master",
        type: "master",
        commits: [
          {
            tag: "v0.5",
          }
        ]
      }
    ])

    const links = ref([])
    let featureCount = ref(0) // feature-xxx分支数量

    let branchOrder = ref(0)

    const branchStr = ref(`%%{init: { 'theme': 'base', 'gitGraph': {'mainBranchName': 'master', 'mainBranchOrder': 6}} }%%
    gitGraph\ncommit tag: "v0.5"\n`)

    // 规则
    const rules = {
      // 创建分支规则
      branch: {
        master: [],
        develop: ["master"],
        hotfix: ["master"],
        release: ["develop"],
        feature: ["develop", "feature"]
      },
      // 合并分支规则
      merge: {
        master: ["hotfix", "release"],
        develop: ["feature", "release", "hotfix"],
        feature: ["feature", "develop"],
        release: ["develop", "hotfix"],
      },
      // 提交代码规则
      commit: ["feature", "release", "hotfix", "develop"]
    }

    return {
      branches,
      links,
      branchStr,

      // 创建分支（新分支名，源分支名）
     createBranch: (name, source) => {
      // 判断分支是否已存在
      if (branches.value.find((branch) => branch.name === name)) {
        return ElMessage.error(`${name} 分支已存在`)
      }
      // 判断源分支是否存在
      const baseBranch = branches.value.find((branch) => branch.name === source)
      if (!baseBranch) {
        return ElMessage.error(`${source} 分支不存在`)
      }

      // 校验创建规则
      const validSources = rules.branch[name.split("-")[0]]
      if (!validSources.includes(baseBranch.type)) {
        return ElMessage.error(`${name} 分支只能基于 ${validSources.join(" 和 ")} 分支创建`)
      }

      // 排序规则
      let newType = ""
      if (name === "develop" || name === "hotfix") {
        newType = name
        branchOrder.value = name === "develop" ? 3 : 5
      } else if (name === "release") {
        newType = "release"
        branchOrder.value = 4
      } else if (name.startsWith("feature-")) {
        if (featureCount.value >= 3) {
          return ElMessage.error(`最多只能创建 3 个 feature 分支`)
        }
        newType = "feature"
        branchOrder.value = 2 - featureCount.value
        featureCount.value++
      } else {
        return ElMessage.error(`分支名称不符合规则`)
      }

      // 创建新分支
      branches.value.push({
        name,
        type: newType,
        commits: [],
      })

      // 更新分支字符串
      branchStr.value += `checkout ${source}\nbranch ${name} order: ${branchOrder.value}\ncommit\n`
     },

     // 提交到分支
     commitCode: (branchName, message) => {
      if (message.length > 10) {
        return ElMessage.error("提交信息不能超过 10 个字符")
      }
      const branch = branches.value.find((branch) => branch.name === branchName)
      if (!branch) {
        return ElMessage.error("分支不存在")
      }

      const validSources = rules.commit
      console.log(validSources)
      if (!validSources.includes(branch.type)) {
        return ElMessage.error(`${branchName} 分支不能直接提交代码`)
      }
      branch.commits.push({
        message,
      })

      // 更新分支字符串
      branchStr.value += `checkout ${branchName}\ncommit tag: "${message}"\n`
    },

    // 合并分支
    mergeBranch: (source, target, version="") => {
      const sourceBranch = branches.value.find((branch) => branch.name === source)
      const targetBranch = branches.value.find((branch) => branch.name === target)
      if (!sourceBranch || !targetBranch) {
        return ElMessage.error("分支不存在")
      }

      // 校验合并规则
      const validSources = rules.merge[target]
      if (!validSources.includes(sourceBranch.type)) {
        return ElMessage.error(`${target} 分支的源分支只能是 ${validSources.join(" 和 ")} 分支`)
      }

      links.value.push({
        source,
        target,
      })
      if (targetBranch.type === "master") {
        targetBranch.commits.push({
          tag: version
        })
        branchStr.value += `checkout ${target}\nmerge ${source} tag: "${version}"\n`
      } else {
        branchStr.value += `checkout ${target}\nmerge ${source}\n`
      }
    }
  }},
  {
    persist: true, // 持久化存储
  },
)