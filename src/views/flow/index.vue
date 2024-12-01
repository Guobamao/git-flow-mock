<script setup>
import { useBranchStore } from '@/stores/branch';
import BranchView from './components/BranchView.vue';
import CreateBranchDialog from './components/CreateBranchDialog.vue';
import MergeBranchDialog from './components/MergeBranchDialog.vue';
import CommitCodeDialog from './components/CommitCodeDialog.vue';
import { ref } from 'vue';

const store = useBranchStore();

// 弹窗状态管理
const showCreateBranchDialog = ref(false);
const showMergeBranchDialog = ref(false);
const showCommitCodeDialog = ref(false);

// 初始化分支
const initBranch = () => {
    store.branchStr = `%%{init: { 'theme': 'base', 'gitGraph': {'mainBranchName': 'master', 'mainBranchOrder': 6}} }%%
    gitGraph\ncommit tag: "v0.5"\n`;
    store.branches = [
        {
            name: 'master',
            type: 'master',
            commits: [
                {
                    tag: 'v0.5',
                },
            ],
        },
    ];
    store.featureCount = 0;
    store.links = [];
};
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

    <!-- 子组件 -->
    <CreateBranchDialog v-model:visible="showCreateBranchDialog" />
    <MergeBranchDialog v-model:visible="showMergeBranchDialog" />
    <CommitCodeDialog v-model:visible="showCommitCodeDialog" />
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
</style>
