<script setup>
import { useGitStore } from '@/stores';
import { ref, computed } from 'vue';
import STATUS_MAP from '@/constants/Status';
import {
    Edit, Plus, Remove, Aim, Document, SuccessFilled, WarningFilled, CirclePlusFilled,
    QuestionFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus';

// 初始化 gitStore
const gitStore = useGitStore();
// 对话框状态和绑定数据
const isDialogVisible = ref(false);
const fileId = ref(null) // 当前文件ID
const fileName = ref(''); // 当前文件名称
const fileContent = ref(''); // 当前文件内容

// 新建文件
const createNewFile = () => {
    ElMessageBox.prompt('输入文件名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.+$/, // 输入内容必须非空
        inputErrorMessage: '文件名不能为空'
    }).then(({ value }) => {
        if (value) {
            const cleanedName = value.trim();
            if (cleanedName) gitStore.createFile(cleanedName);

            // 获取新文件ID并设置动画
            const newFile = gitStore.files.at(-1) // 新创建的文件
            if (newFile) {
                animationClasses.value.rowAnimation[newFile.id] = 'animate__animated animate__bounceInLeft'
            }
            ElMessage.success('文件创建成功');
        }
    }).catch(() => { });
}

// 文件操作
// 追踪文件
const trackFile = (id) => {
    gitStore.trackFile(id);
    animationClasses.value.cellAnimation[id] = 'animate__animated animate__fadeIn';
    setTimeout(() => {
        delete animationClasses.value.cellAnimation[id]
    }, 1000)
    ElMessage.success('已跟踪该文件');
}

// 暂存文件
const stageFile = (id) => {
    gitStore.stageFile(id); // 调用暂存逻辑
    animationClasses.value.cellAnimation[id] = 'animate__animated animate__fadeIn';
    setTimeout(() => {
        delete animationClasses.value.cellAnimation[id]
    }, 1000)

    ElMessage.success('文件已添加至暂存区');
}

// 暂存所有文件
const stageAllFiles = () => {
    computedFiles.value.forEach((f) => {
        if (f.canStage) {
            gitStore.stageFile(f.id);
            animationClasses.value.cellAnimation[f.id] = 'animate__animated animate__fadeIn';
            setTimeout(() => {
                delete animationClasses.value.cellAnimation[f.id]
            }, 1000)
        }
    })
    ElMessage.success('所有文件已添加至暂存区');
}

// 删除文件
const deleteFile = (id) => {
    ElMessageBox.confirm('确定删除该文件吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        gitStore.deleteFile(id);
        ElMessage.success('文件删除成功');
    }).catch(() => { });
}

// 保存文件
const editFile = () => {
    if (fileId.value !== null) {
        gitStore.editFile(fileId.value, fileContent.value);
        animationClasses.value.cellAnimation[fileId.value] = 'animate__animated animate__fadeIn';
        setTimeout(() => {
            delete animationClasses.value.cellAnimation[fileId.value]
        }, 1000)
        isDialogVisible.value = false;
        ElMessage.success('文件保存成功');
    }
}

// 显示文件内容对话框
const showFileContent = (file) => {
    fileId.value = file.id
    fileName.value = file.name;
    fileContent.value = file.content;
    isDialogVisible.value = true;
}

// 派生计算属性：增强文件状态
const computedFiles = computed(() =>
    gitStore.files.map((file) => ({
        ...file,
        canTrack: file.status === STATUS_MAP.UNTRACKED, // 未追踪文件可追踪
        canEdit: file.status !== STATUS_MAP.DELETED, // 已删除文件不可编辑 
        canStage: file.tracked && file.modified, // 只有已追踪且已修改的文件可暂存
    }))
);

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
    // 存放单元格的动画
    cellAnimation: {},
});
// 动态获取表格行的类名
const getRowAnimationClass = ({ row }) => gitStore.workAreaAnimation.rowAnimation[row.id] || animationClasses.value.rowAnimation[row.id] || ''

// 获取状态单元格的动画类
const getCellAnimationClass = (id) => gitStore.workAreaAnimation.cellAnimation[id] || animationClasses.value.cellAnimation[id] || ''
</script>

<template>
    <div class="work-area">
        <h1 class="area-title">工作区</h1>
        <el-button type="primary" @click="createNewFile" size="small" class="create-button">创建文件</el-button>
        <el-tooltip class="box-item" effect="dark" content="暂存所有文件" placement="top">
            <el-button v-show="computedFiles.some((f) => f.canStage)" type="default" size="small"
                class="commit-button animate__animated animate__fadeIn" @click="stageAllFiles" :icon="Plus">
            </el-button>
        </el-tooltip>
        <el-scrollbar>
            <el-table :data="computedFiles" style="width: 100%;" size="large" :row-class-name="getRowAnimationClass">
                <el-table-column prop="name" label="文件名" width="150">
                    <template #default="scope">
                        <el-link :icon="Document" style="font-size: 16px;"
                            @click="showFileContent(scope.row)">{{ scope.row.name }}
                            <el-tooltip class="box-item" effect="dark" :content="getStatusText(scope.row.status)"
                                placement="right">
                                <el-icon style="margin-left: 5px;">
                                    <CirclePlusFilled v-if="scope.row.status === STATUS_MAP.STAGED" color="#18be23" />
                                    <SuccessFilled v-else-if="scope.row.status === STATUS_MAP.COMMITTED"
                                        color="#18be23" />
                                    <QuestionFilled v-else-if="scope.row.status === STATUS_MAP.UNTRACKED"
                                        color="#4A8EE6" />
                                    <WarningFilled v-else-if="scope.row.status === STATUS_MAP.MODIFIED"
                                        color="#FF2E00" />
                                </el-icon>
                            </el-tooltip>
                        </el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                        <div :class="['status-cell', 'animated', getCellAnimationClass(scope.row.id)]">
                            {{ getStatusText(scope.row.status) }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-link v-if="scope.row.canTrack" @click="trackFile(scope.row.id)" :icon="Aim" type="primary">
                            追踪</el-link>
                        <el-link v-if="scope.row.canEdit" @click="showFileContent(scope.row)" :icon="Edit"
                            type="primary">编辑</el-link>
                        <el-link v-if="scope.row.canStage" @click="stageFile(scope.row.id)" :icon="Plus"
                            type="primary">暂存</el-link>
                        <el-link v-if="scope.row.status !== STATUS_MAP.DELETED" @click="deleteFile(scope.row.id)"
                            :icon="Remove" type="primary">删除</el-link>
                    </template>
                </el-table-column>
            </el-table>
        </el-scrollbar>

        <el-dialog v-model="isDialogVisible" :title="fileName" width="400px" @close="isDialogVisible = false">
            <el-input type="textarea" v-model="fileContent" placeholder="请输入文件内容" :rows="6"></el-input>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="isDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editFile">保 存</el-button>
                </span>
            </template>
        </el-dialog>
    </div>

</template>

<style scoped>
.el-link {
    margin-right: 8px;
}

.work-area {
    display: flex;
    flex-direction: column;
}

.area-title {
    height: 60px;
    line-height: 60px;
    margin: 0;
    padding-left: 70px;
    background-image: url("../assets/工作区.png");
    background-repeat: no-repeat;
    background-size: contain;
    color: #8b8b8b;
}

.create-button {
    position: fixed;
    top: 100px;
    left: 27%;
}

.commit-button {
    position: fixed;
    top: 100px;
    left: 23%;
}
</style>
