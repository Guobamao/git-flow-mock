<script setup>
import { useGitStore } from '@/stores';
import { computed, ref } from 'vue';
import DiffView from './DiffView.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, View, RefreshLeft } from '@element-plus/icons-vue'

const gitStore = useGitStore();

// 获取本地仓库文件
const repoFiles = computed(() => gitStore.repo);
// 抽屉组件显示控制
const isDrawerVisible = ref(false);

const activeName = ref('1')

// 文件是否被修改
const isModify = ref(false);
const currentContent = ref(''); // 工作区文件内容
const repoContent = ref('');
const currentFileName = ref('');

// 文件内容对话框
const isDialogVisible = ref(false)


const showFileContent = (file) => {
    currentFileName.value = file.name;
    // 获取当前工作区的文件
    const currentFile = gitStore.files.find(f => f.id === file.id);
    // 判断当前文件内容与本地仓库中的文件内容是否一致
    if (currentFile && currentFile.content !== file.content) {
        isModify.value = true;
        currentContent.value = currentFile.content;
    } else {
        isModify.value = false;
    }
    repoContent.value = file.content;
    isDialogVisible.value = true;
}

// 恢复到指定版本
const revertFile = (commitId) => {
    ElMessageBox.confirm('确定要恢复到此版本吗？').then(() => {
        // 恢复到指定版本
        gitStore.revertFile(commitId);
        isDrawerVisible.value = false;
        isDialogVisible.value = false;
        ElMessage.success('文件已恢复到指定版本');
    })
}
</script>


<template>
    <div class="repo-area">
        <h1 class="area-title">本地仓库</h1>
        <el-scrollbar>
            <el-timeline>
                <el-timeline-item v-for="(item, index) in repoFiles" :key="item.id" :timestamp="item.timestamp"
                    type="primary">
                    <el-collapse v-model="activeName" accordion>
                        <el-collapse-item :name="index">
                            <template #title>
                                <span class="file-name">{{ item.message }}</span>
                                <el-tooltip class="box-item" effect="dark" content="恢复到此版本" placement="top">
                                    <el-button type="text" :icon="RefreshLeft" @click="revertFile(item.id)"
                                        @click.stop></el-button>
                                </el-tooltip>
                            </template>
                            <ul class="file-list">
                                <li class="file-item" v-for="file in item.files" :key="file.id">
                                    <el-link :icon="Document" class="file-link"
                                        @click="showFileContent(file)">{{ file.name }}
                                    </el-link>
                                    <el-tooltip class="box-item" effect="dark" content="查看" placement="top">
                                        <el-link type="primary" :icon="View" @click="showFileContent(file)"></el-link>
                                    </el-tooltip>
                                </li>
                            </ul>
                        </el-collapse-item>
                    </el-collapse>
                </el-timeline-item>
            </el-timeline>
        </el-scrollbar>

        <!-- 文件内容对话框 -->
        <DiffView v-if="isModify" v-model="isDialogVisible" :old-content="repoContent" :new-content="currentContent">
        </DiffView>
        <el-dialog v-model="isDialogVisible" v-else :title="currentFileName" width="400px"
            @close="isDialogVisible = false">
            <div class="diff-column">
                <div v-html="repoContent" class="diff-content"></div>
            </div>
            <template #footer>
                <el-button @click="isDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>


<style scoped>
.el-link {
    margin-right: 8px;
}

.repo-area {
    display: flex;
    flex-direction: column;
}

.area-title {
    height: 60px;
    line-height: 60px;
    margin: 0;
    padding-left: 70px;
    background-image: url("../assets/本地仓库.png");
    background-repeat: no-repeat;
    background-size: contain;
    color:
        #8b8b8b;
}

.diff-column {
    border: 1px solid #ccc;
    padding: 10px;
    white-space:
        pre-wrap;
    font-family: monospace;
    background-color: #f9f9f9;
    overflow: auto;
}

.diff-content {
    font-size: 18px;
}

.el-timeline {
    margin-top: 20px;
    --el-timeline-node-color: #409EFF;
}

.el-timeline-item {
    padding-bottom: 30px;
}

.el-collapse {
    border: none
}

.el-collapse {
    :deep() .el-collapse-item__header {
        height: 20px;
        font-size: 16px;
    }

    :deep() .el-collapse-item__content {
        padding-bottom: 0;
    }
}

.file-list {
    list-style: none;
    padding-left: 20px;
}

.file-item {
    width: 80%;
    border-bottom: 1px solid #ccc;
}

.file-item:last-child {
    border-bottom: none;
}

.header-icon {
    margin-left: 50px
}
</style>
