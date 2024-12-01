<script setup>
import { useBranchStore } from '@/stores/branch';
import BranchView from './components/BranchView.vue';
import { computed, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const store = useBranchStore();

// 创建分支表单
const createBranchFormRef = ref(null)
// 创建分支表单数据
const createBranchForm = reactive({
    branchName: '',
    branchSource: ''
})
// 创建分支弹窗显示状态
const showCreateBranchDialog = ref(false)

// 合并分支表单
const mergeBranchFormRef = ref(null)
// 合并分支表单数据
const mergeBranchForm = reactive({
    sourceBranch: '',
    targetBranch: '',
})
// 合并分支弹窗显示状态
const showMergeBranchDialog = ref(false)

// 提交代码表单
const commitCodeFormRef = ref(null)
// 提交代码表单数据
const commitCodeForm = reactive({
    branchName: '',
    commitMessage: '',
})
// 提交代码弹窗显示状态
const showCommitCodeDialog = ref(false)

// 表单校验
const rules = {
    branchName: [
        { required: true, message: '分支名称不能为空', trigger: 'blur' }
    ],
    sourceBranch: [
        { required: true, message: '源分支不能为空', trigger: 'blur' }
    ],
    targetBranch: [
        { required: true, message: '目标分支不能为空', trigger: 'blur' }
    ],
    commitMessage: [
        { required: true, message: '提交信息不能为空', trigger: 'blur' }
    ]
}

// 分支列表
const branchList = computed(() => store.branches.map(item => item.name))
// 目标分支列表(过滤掉 branchList中不等于 mergeBranchForm.sourceBranch)
const targetBranchList = computed(() => branchList.value.filter(item => item !== mergeBranchForm.sourceBranch))
// 初始化分支
const initBranch = () => {
    store.branchStr = `%%{init: { 'theme': 'base', 'gitGraph': {'mainBranchName': 'master', 'mainBranchOrder': 6}} }%%
    gitGraph\ncommit tag: "v0.5"\n`
    store.branches = [
        {
            name: "master",
            type: "master",
            commits: [
                {
                    tag: "v0.5",
                }
            ]
        }
    ]
    store.featureCount = 0
    store.links = []
}

// 创建分支
const createBranch = () => {
    createBranchFormRef.value.validate(valid => {
        if (valid) {
            store.createBranch(createBranchForm.branchName, createBranchForm.branchSource || 'master')
            createBranchFormRef.value.resetFields()
            showCreateBranchDialog.value = false
        }
    })
}

// 合并分支
const mergeBranch = () => {
    mergeBranchFormRef.value.validate(valid => {
        if (valid) {
            if (mergeBranchForm.targetBranch === 'master') {
                ElMessageBox.prompt("请输入版本号(vX.X)", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    // vX.X
                    inputPattern: /^v\d+\.\d+$/, // 输入内容必须以 v 开头
                }).then(({ value }) => {
                    // 判断上一个master分支的commits最后一个元素
                    let lastVersion = (store.branches[0].commits.at(-1).tag).replace("v", "")
                    let currentVersion = value.replace("v", "")
                    if (parseFloat(currentVersion) > parseFloat(lastVersion)) {
                        store.mergeBranch(mergeBranchForm.sourceBranch, mergeBranchForm.targetBranch, value)
                        mergeBranchFormRef.value.resetFields()
                        showMergeBranchDialog.value = false
                    } else {
                        ElMessage.error("版本号不能小于等于上一个master分支的版本号")
                    }
                })
            } else {
                store.mergeBranch(mergeBranchForm.sourceBranch, mergeBranchForm.targetBranch)
                mergeBranchFormRef.value.resetFields()
                showMergeBranchDialog.value = false
            }
        }
    })
}

// 提交代码
const commitCode = () => {
    commitCodeFormRef.value.validate(valid => {
        if (valid) {
            store.commitCode(commitCodeForm.branchName, commitCodeForm.commitMessage)
            commitCodeFormRef.value.resetFields()
            showCommitCodeDialog.value = false
        }
    })
}
</script>

<template>
    <div class="header">
        <span>Git Flow 仿真工具</span>
        <el-button type="primary" size="small" @click="initBranch">清空缓存</el-button>
    </div>

    <div class="container">
        <BranchView />
        <el-row class="actions">
            <el-button @click="showCreateBranchDialog = true">创建分支</el-button>
            <el-button @click="showMergeBranchDialog = true">合并分支</el-button>
            <el-button @click="showCommitCodeDialog = true">提交代码</el-button>
        </el-row>
    </div>

    <!-- 创建分支弹窗 -->
    <el-dialog v-model="showCreateBranchDialog" title="创建代码分支" width="500">
        <el-form :model="createBranchForm" ref="createBranchFormRef" :rules="rules" class="create-branch-form">
            <el-form-item label="分支名称" prop="branchName">
                <el-input v-model="createBranchForm.branchName" placeholder="请输入分支名称（建议符合 Git 分支命名规范）" maxlength="255"
                    show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="创建来源" prop="branchSource">
                <el-select v-model="createBranchForm.branchSource" filterable placeholder="请选择分支、标签或commit id 新建分支">
                    <el-option v-for="item in branchList" :key="item" :label="item" :value="item" class="option">
                        <svg t="1733029078377" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="4370" width="16" height="16">
                            <path
                                d="M832 272c0-62.4-51-112.9-113.6-112-60.7 0.9-110 50.6-110.4 111.3-0.3 52.6 35.6 96.8 84.2 109.2 14 3.6 23.8 16 24.1 30.4 0.5 27.3-4.4 57.4-22.3 82.5-28.7 40.3-80.7 54.9-126.6 67.8-29 8.1-50.1 10.2-68.7 12-26.4 2.6-51.4 5.1-82.6 23-6.6 3.8-13.1 8-19.2 12.6-5.3 4-12.8 0.2-12.8-6.4V241.3c0-12.2 6.8-23.5 17.7-28.9 37.1-18.4 62.6-56.8 62.3-101.1-0.5-62.8-53.2-113.4-116-111.2C288.1 2.1 240 51.4 240 112c0 44 25.4 82.1 62.3 100.4 10.9 5.4 17.7 16.5 17.7 28.6v541.7c0 12.2-6.8 23.5-17.7 28.9-37.1 18.4-62.6 56.8-62.3 101.1 0.4 62.8 53.1 113.3 115.9 111.2C416 1021.9 464 972.5 464 912c0-44-25.4-82.1-62.3-100.4-10.9-5.4-17.7-16.5-17.7-28.6v-19.2c0-42 19.9-81.8 54.3-105.9 3.1-2.2 6.4-4.3 9.7-6.2 19.3-11.1 33.5-12.5 57-14.8 20.2-2 45.3-4.5 79.7-14.1 50.5-14.2 119.6-33.5 161.4-92.3 24-33.7 35.4-75 34.1-123-0.2-6.9-0.7-13.8-1.4-20.9-1.1-10.7 3.5-21 11.8-27.8 25.3-20.4 41.4-51.7 41.4-86.8zM304 112c0-26.5 21.5-48 48-48s48 21.5 48 48-21.5 48-48 48-48-21.5-48-48z m96 800c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z m320-592c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"
                                p-id="4371"></path>
                        </svg>
                        {{ item }}
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="showCreateBranchDialog = false">取消</el-button>
                <el-button type="primary" @click="createBranch">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>

    <!-- 合并分支弹窗 -->
    <el-dialog v-model="showMergeBranchDialog" title="合并分支" width="600">
        <el-form :model="mergeBranchForm" ref="mergeBranchFormRef" :rules="rules" class="merge-branch-form">
            <el-form-item prop="sourceBranch" label="源分支">
                <el-select v-model="mergeBranchForm.sourceBranch" placeholder="请选择源分支" clearable
                    @change="mergeBranchForm.targetBranch = ''">
                    <el-option v-for="item in branchList" :key="item" :label="item" :value="item" class="option">
                        <svg t="1733029078377" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="4370" width="16" height="16">
                            <path
                                d="M832 272c0-62.4-51-112.9-113.6-112-60.7 0.9-110 50.6-110.4 111.3-0.3 52.6 35.6 96.8 84.2 109.2 14 3.6 23.8 16 24.1 30.4 0.5 27.3-4.4 57.4-22.3 82.5-28.7 40.3-80.7 54.9-126.6 67.8-29 8.1-50.1 10.2-68.7 12-26.4 2.6-51.4 5.1-82.6 23-6.6 3.8-13.1 8-19.2 12.6-5.3 4-12.8 0.2-12.8-6.4V241.3c0-12.2 6.8-23.5 17.7-28.9 37.1-18.4 62.6-56.8 62.3-101.1-0.5-62.8-53.2-113.4-116-111.2C288.1 2.1 240 51.4 240 112c0 44 25.4 82.1 62.3 100.4 10.9 5.4 17.7 16.5 17.7 28.6v541.7c0 12.2-6.8 23.5-17.7 28.9-37.1 18.4-62.6 56.8-62.3 101.1 0.4 62.8 53.1 113.3 115.9 111.2C416 1021.9 464 972.5 464 912c0-44-25.4-82.1-62.3-100.4-10.9-5.4-17.7-16.5-17.7-28.6v-19.2c0-42 19.9-81.8 54.3-105.9 3.1-2.2 6.4-4.3 9.7-6.2 19.3-11.1 33.5-12.5 57-14.8 20.2-2 45.3-4.5 79.7-14.1 50.5-14.2 119.6-33.5 161.4-92.3 24-33.7 35.4-75 34.1-123-0.2-6.9-0.7-13.8-1.4-20.9-1.1-10.7 3.5-21 11.8-27.8 25.3-20.4 41.4-51.7 41.4-86.8zM304 112c0-26.5 21.5-48 48-48s48 21.5 48 48-21.5 48-48 48-48-21.5-48-48z m96 800c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z m320-592c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"
                                p-id="4371"></path>
                        </svg>
                        {{ item }}
                    </el-option>
                </el-select>
            </el-form-item>
            <span class="merge-to">合并到</span>
            <el-form-item prop="targetBranch" label="目标分支">
                <el-select v-model="mergeBranchForm.targetBranch" placeholder="请选择目标分支" clearable>
                    <el-option v-for="item in targetBranchList" :key="item" :label="item" :value="item" class="option">
                        <svg t="1733029078377" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="4370" width="16" height="16">
                            <path
                                d="M832 272c0-62.4-51-112.9-113.6-112-60.7 0.9-110 50.6-110.4 111.3-0.3 52.6 35.6 96.8 84.2 109.2 14 3.6 23.8 16 24.1 30.4 0.5 27.3-4.4 57.4-22.3 82.5-28.7 40.3-80.7 54.9-126.6 67.8-29 8.1-50.1 10.2-68.7 12-26.4 2.6-51.4 5.1-82.6 23-6.6 3.8-13.1 8-19.2 12.6-5.3 4-12.8 0.2-12.8-6.4V241.3c0-12.2 6.8-23.5 17.7-28.9 37.1-18.4 62.6-56.8 62.3-101.1-0.5-62.8-53.2-113.4-116-111.2C288.1 2.1 240 51.4 240 112c0 44 25.4 82.1 62.3 100.4 10.9 5.4 17.7 16.5 17.7 28.6v541.7c0 12.2-6.8 23.5-17.7 28.9-37.1 18.4-62.6 56.8-62.3 101.1 0.4 62.8 53.1 113.3 115.9 111.2C416 1021.9 464 972.5 464 912c0-44-25.4-82.1-62.3-100.4-10.9-5.4-17.7-16.5-17.7-28.6v-19.2c0-42 19.9-81.8 54.3-105.9 3.1-2.2 6.4-4.3 9.7-6.2 19.3-11.1 33.5-12.5 57-14.8 20.2-2 45.3-4.5 79.7-14.1 50.5-14.2 119.6-33.5 161.4-92.3 24-33.7 35.4-75 34.1-123-0.2-6.9-0.7-13.8-1.4-20.9-1.1-10.7 3.5-21 11.8-27.8 25.3-20.4 41.4-51.7 41.4-86.8zM304 112c0-26.5 21.5-48 48-48s48 21.5 48 48-21.5 48-48 48-48-21.5-48-48z m96 800c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z m320-592c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"
                                p-id="4371"></path>
                        </svg>
                        {{ item }}
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="showMergeBranchDialog = false">取消</el-button>
                <el-button type="primary" @click="mergeBranch">
                    确定
                </el-button>
            </div>
        </template>
    </el-dialog>

    <!-- 提交代码弹窗 -->
    <el-dialog v-model="showCommitCodeDialog" title="提交代码" width="500">
        <el-form :model="commitCodeForm" ref="commitCodeFormRef" :rules="rules" class="commit-code-form">
            <el-form-item prop="branchName" label="选择分支">
                <el-select v-model="commitCodeForm.branchName" placeholder="请选择分支" clearable>
                    <el-option v-for="item in branchList" :key="item" :label="item" :value="item" class="option">
                        <svg t="1733029078377" class="icon" viewBox="0 0 1024 1024" version="1.1"
                            xmlns="http://www.w3.org/2000/svg" p-id="4370" width="16" height="16">
                            <path
                                d="M832 272c0-62.4-51-112.9-113.6-112-60.7 0.9-110 50.6-110.4 111.3-0.3 52.6 35.6 96.8 84.2 109.2 14 3.6 23.8 16 24.1 30.4 0.5 27.3-4.4 57.4-22.3 82.5-28.7 40.3-80.7 54.9-126.6 67.8-29 8.1-50.1 10.2-68.7 12-26.4 2.6-51.4 5.1-82.6 23-6.6 3.8-13.1 8-19.2 12.6-5.3 4-12.8 0.2-12.8-6.4V241.3c0-12.2 6.8-23.5 17.7-28.9 37.1-18.4 62.6-56.8 62.3-101.1-0.5-62.8-53.2-113.4-116-111.2C288.1 2.1 240 51.4 240 112c0 44 25.4 82.1 62.3 100.4 10.9 5.4 17.7 16.5 17.7 28.6v541.7c0 12.2-6.8 23.5-17.7 28.9-37.1 18.4-62.6 56.8-62.3 101.1 0.4 62.8 53.1 113.3 115.9 111.2C416 1021.9 464 972.5 464 912c0-44-25.4-82.1-62.3-100.4-10.9-5.4-17.7-16.5-17.7-28.6v-19.2c0-42 19.9-81.8 54.3-105.9 3.1-2.2 6.4-4.3 9.7-6.2 19.3-11.1 33.5-12.5 57-14.8 20.2-2 45.3-4.5 79.7-14.1 50.5-14.2 119.6-33.5 161.4-92.3 24-33.7 35.4-75 34.1-123-0.2-6.9-0.7-13.8-1.4-20.9-1.1-10.7 3.5-21 11.8-27.8 25.3-20.4 41.4-51.7 41.4-86.8zM304 112c0-26.5 21.5-48 48-48s48 21.5 48 48-21.5 48-48 48-48-21.5-48-48z m96 800c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z m320-592c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"
                                p-id="4371"></path>
                        </svg>
                        {{ item }}
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item prop="commitMessage" label="提交信息">
                <el-input v-model="commitCodeForm.commitMessage" placeholder="请输入提交信息" maxlength="10"
                    show-word-limit></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="showCommitCodeDialog = false">取消</el-button>
                <el-button type="primary" @click="commitCode">提交</el-button>
            </div>
        </template>
    </el-dialog>
</template>


<style lang="scss" scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #8c8c8c;

    span {
        font-size: 20px;
        font-weight: bold;
        color: #8c8c8c;
        line-height: 40px;
    }
}

.container {

    .actions {
        justify-content: center;
    }
}

.create-branch-form {
    .el-form-item {
        flex-direction: column;
    }

    ::v-deep(.el-form-item__label) {
        justify-content: flex-start;
    }
}

.merge-branch-form {
    display: flex;
    align-items: baseline;
    justify-content: center;

    .el-select {
        width: 170px;
    }

    .merge-to {
        margin-left: 20px;
        margin-right: 20px;
    }
}

.commit-code-form {
    .el-form-item {
        flex-direction: column;
    }

    ::v-deep(.el-form-item__label) {
        justify-content: flex-start;
    }
}
</style>