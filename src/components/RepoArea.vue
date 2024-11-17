<script setup>
import { useGitStore } from '@/stores';
import { computed, ref } from 'vue';
import DiffView from './DiffView.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Files } from '@element-plus/icons-vue'

const gitStore = useGitStore();

// 获取本地仓库文件
const repoFiles = computed(() => gitStore.repo);

// 抽屉组件显示控制
const isDrawerVisible = ref(false);
const versionList = ref([]);

const isDialogVisible = ref(false);
const fileId = ref('');
const fileContent = ref(''); // 当前文件内容
const isModify = ref(false); // 文件是否被修改
const currentContent = ref('');
const fileName = ref('');
const versionIndex = ref(0);

// 查看指定版本
const viewVersion = (id) => {
    fileId.value = id;
    const repoFile = gitStore.repo.find(f => f.id === id);
    if (repoFile) {
        fileName.value = repoFile.name;
        versionList.value = repoFile.versions;
        isDrawerVisible.value = true;
    }
}

const showFileContent = (row, index) => {
    const currentFile = gitStore.files.find(f => f.id === fileId.value);
    if (currentFile && currentFile.content !== row.content) {
        isModify.value = true;
        currentContent.value = currentFile.content;
        versionIndex.value = index
    } else {
        isModify.value = false;
    }
    fileContent.value = row.content;
    isDialogVisible.value = true;
}

// 恢复到指定版本
const revertToVersion = (fileId, versionIndex) => {
    ElMessageBox.confirm('确定要恢复到此版本吗？').then(() => {
        // 恢复到指定版本
        gitStore.revertFile(fileId, versionIndex);
        isDrawerVisible.value = false;
        isDialogVisible.value = false;
        ElMessage.success('文件已恢复到指定版本');
    })
}

// 动画相关状态
const animationClasses = ref({
    // 存放行的动画
    rowAnimation: {},
});
// 动态获取表格行的类名
const getRowAnimationClass = ({ row }) => gitStore.repoAnimation.rowAnimation[row.id] || animationClasses.value.rowAnimation[row.id] || ''
</script>


<template>
    <div class="repo-area">
        <h1 class="area-title">本地仓库</h1>
        <el-table :data="repoFiles" style="width: 100%;" :row-class-name="getRowAnimationClass">
            <el-table-column prop="name" label="文件名" width="180">
                <template #default="scope">
                    <el-text>
                        <el-icon>
                            <Files />
                        </el-icon>
                        {{ scope.row.name }}</el-text>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-link type="primary" @click="viewVersion(scope.row.id)">查看版本</el-link>
                </template>
            </el-table-column>
        </el-table>

        <!-- 版本历史抽屉 -->
        <el-drawer v-model="isDrawerVisible" :title="'版本历史：' + fileName">
            <el-table :data="versionList" style="width: 100%;">
                <el-table-column prop="message" label="提交消息" width="180" :show-overflow-tooltip="true">
                    <template #default="scope">
                        <el-link @click="showFileContent(scope.row, scope.$index)">{{ scope.row.message }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="timestamp" label="提交时间"></el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-link type="primary" @click="showFileContent(scope.row, scope.$index)">恢复到此版本</el-link>
                    </template>
                </el-table-column>
            </el-table>
        </el-drawer>

        <!-- 文件内容对话框 -->
        <DiffView v-if="isModify" v-model="isDialogVisible" :old-content="fileContent" :new-content="currentContent"
            @revert="revertToVersion(fileId, versionIndex)">
        </DiffView>
        <el-dialog v-model="isDialogVisible" v-else :title="fileName" width="400px" @close="isDialogVisible = false"
            :modal="false">
            <div class="diff-column">
                <div v-html="fileContent" class="diff-content"></div>
            </div>
            <template #footer>
                <el-button @click="isDialogVisible = false">关闭</el-button>
                <el-button type="primary" @click="revertToVersion(fileId, versionIndex)">恢复到此版本</el-button>
            </template>
        </el-dialog>
    </div>
</template>


<style scoped>
.el-link {
    margin-right: 8px;
}

.area-title {
    height: 80px;
    line-height: 80px;
    margin: 0;
    padding-left: 90px;
    background-image: url("../assets/本地仓库.png");
    background-repeat: no-repeat;
    background-size: contain;
    color: #8b8b8b;
}

.diff-column {
    border: 1px solid #ccc;
    padding: 10px;
    white-space: pre-wrap;
    font-family: monospace;
    background-color: #f9f9f9;
    overflow: auto;
}

.diff-content {
    font-size: 18px;
}
</style>