<script setup>
import { useGitStore } from '@/stores';
import { computed, ref } from 'vue';
import STATUS_MAP from '@/constants/Status';
import { Files, Minus, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';
import DiffView from './DiffView.vue';

const gitStore = useGitStore();

// 对话框显示状态
const isDialogVisible = ref(false);
const fileName = ref(''); // 当前文件名称
const fileContent = ref(''); // 当前文件内容
const isModify = ref(false); // 文件是否被修改
const currentContent = ref('');

// 获取暂存区文件
const stagingFiles = computed(() => gitStore.stagingArea);

// 取消暂存
const unstageFile = (id) => {
    animationClasses.value.rowAnimation[id] = 'animate__animated animate__bounceOutLeft'; // 设置取消暂存动画
    // 动画完成后删除逻辑
    setTimeout(() => {
        gitStore.unstageFile(id);
        delete animationClasses.value.rowAnimation[id];
    }, 500)
    ElMessage.success('文件已移出暂存区');
}

// 取消所有暂存
const unstageAllFiles = () => {
    // 克隆暂存区文件数据
    const fileToUnstage = [...stagingFiles.value];

    fileToUnstage.forEach((f) => {
        animationClasses.value.rowAnimation[f.id] = 'animate__animated animate__bounceOutLeft'; // 设置取消暂存动画
        // 动画完成后删除逻辑
        setTimeout(() => {
            gitStore.unstageFile(f.id);
            delete animationClasses.value.rowAnimation[f.id];
        }, 1000)
    })
    ElMessage.success('所有文件已移出暂存区');
}

// 提交文件到本地仓库
const commitFile = (id) => {
    const message = prompt('请输入提交信息:');
    if (message) {
        const cleanMessage = message.trim();
        if (cleanMessage) {
            animationClasses.value.rowAnimation[id] = 'animate__animated animate__bounceOutRight'; // 设置提交动画
            // 动画完成后删除逻辑
            setTimeout(() => {
                gitStore.commitFile(id, cleanMessage);
                delete animationClasses.value.rowAnimation[id];
            }, 1000)
            ElMessage.success('文件已提交至本地仓库');
        }
    } else {
        ElMessage.warning('提交失败：未输入提交信息')
    }
}

// 显示文件内容对话框
const showFileContent = (row) => {
    fileName.value = row.name;
    const currentFile = gitStore.files.find(f => f.id === row.id);
    if (currentFile && currentFile.content !== row.content) {
        isModify.value = true;
        currentContent.value = currentFile.content;
    } else {
        isModify.value = false;
    }
    fileContent.value = row.content;
    isDialogVisible.value = true;
}
// 文件状态中文映射
const getStatusText = (status) => {
    switch (status) {
        case STATUS_MAP.UNTRACKED: return '未跟踪';
        case STATUS_MAP.TRACKED: return '已追踪';
        case STATUS_MAP.MODIFIED: return '已修改';
        case STATUS_MAP.STAGED: return '已暂存';
        case STATUS_MAP.COMMITTED: return '未修改';
        case STATUS_MAP.DELETED: return '已删除';
        default: return '未知状态';
    }
}

// 动画相关状态
const animationClasses = ref({
    // 存放行的动画
    rowAnimation: {},
});
// 动态获取表格行的类名
const getRowAnimationClass = ({ row }) => gitStore.stagingAreaAnimation.rowAnimation[row.id] || animationClasses.value.rowAnimation[row.id] || ''
</script>

<template>
    <div class="staging-area">
        <h1 class="area-title">暂存区</h1>
        <el-button type="default" size="small" class="unstage-button animate__animated" :icon="Minus"
            @click="unstageAllFiles" v-if="stagingFiles.length">取消全部暂存</el-button>
        <el-table :data="stagingFiles" style="width: 100%;" :row-class-name="getRowAnimationClass">
            <el-table-column prop="name" label="文件名" width="180">
                <template #default="scope">
                    <el-link :icon="Files" @click="showFileContent(scope.row)">{{ scope.row.name }}</el-link>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
                <template #default="scope">
                    {{ getStatusText(scope.row.status) }}
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-link type="primary" :icon="Minus" @click="unstageFile(scope.row.id)">取消暂存</el-link>
                    <el-link type="primary" :icon="Check" @click="commitFile(scope.row.id)">提交</el-link>
                </template>
            </el-table-column>
        </el-table>


        <!-- 文件内容对话框 -->
        <DiffView v-if="isModify" v-model="isDialogVisible" :old-content="fileContent" :new-content="currentContent">
        </DiffView>
        <el-dialog v-model="isDialogVisible" v-else :title="fileName" width="400px" @close="isDialogVisible = false">
            <div class="diff-column">
                <div v-html="fileContent" class="diff-content"></div>
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

.area-title {
    height: 80px;
    line-height: 80px;
    margin: 0;
    padding-left: 90px;
    background-image: url("../assets/暂存区.png");
    background-repeat: no-repeat;
    background-size: contain;
    color: #8b8b8b;
}

.unstage-button {
    position: fixed;
    top: 100px;
    left: 57%;
}
</style>