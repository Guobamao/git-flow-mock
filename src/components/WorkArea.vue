<script setup>
import { useGitStore } from '@/stores';
import { ref, computed } from 'vue';
import STATUS_MAP from '@/constants/Status';
import { Edit, Plus, Remove, Aim, Files, Select } from '@element-plus/icons-vue'
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
    const name = prompt('输入文件名称');
    if (name) {
        const cleanedName = name.trim();
        if (cleanedName) gitStore.createFile(cleanedName);

        // 获取新文件ID并设置动画
        const newFile = gitStore.files.at(-1) // 新创建的文件
        if (newFile) {
            animationClasses.value.rowAnimation[newFile.id] = 'animate__animated animate__bounceInLeft'
        }
        ElMessage.success('文件创建成功');
    }
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
        <el-button type="default" @click="createNewFile" size="small" class="create-button">创建文件</el-button>
        <el-button v-if="computedFiles.some((f) => f.canStage)" type="default" size="small" class="commit-button"
            @click="stageAllFiles">
            全部暂存
        </el-button>
        <el-table :data="computedFiles" style="width: 100%;" :row-class-name="getRowAnimationClass">
            <el-table-column prop="name" label="文件名" width="150">
                <template #default="scope">
                    <el-link :icon="Files" @click="showFileContent(scope.row)">{{ scope.row.name }}</el-link>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="scope">
                    <div :class="['status-cell', 'animated', getCellAnimationClass(scope.row.id)]">
                        <el-icon>
                            <Plus style="color: #3E956E" v-if="scope.row.status === STATUS_MAP.STAGED" />
                            <Select style="color: green" v-else-if="scope.row.status === STATUS_MAP.COMMITTED" />
                            <svg v-else-if="scope.row.status === STATUS_MAP.UNTRACKED" t="1731859762257" class="icon"
                                viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4278">
                                <path
                                    d="M500.382 0.006c-177.646 19.719-276.341 96.721-296.085 230.93-3.949 43.437 17.757 67.13 65.143 71.066 23.667 3.961 43.411-13.808 59.207-53.296 23.692-82.9 80.862-124.35 171.735-124.35 110.479 7.885 169.698 63.156 177.671 165.8 0 94.759-64.313 110.202-99.248 138.774-44.267 36.218-73.217 72.952-108.655 135.216-29.779 52.314-34.91 164.227-34.91 164.227 0 47.373 21.655 71.066 65.143 71.066 39.413 0 61.194-23.693 65.155-71.066 0 0 5.219-125.594 55.925-181.129 57.472-62.942 194.749-107.071 198.698-268.922C804.365 108.561 697.772 15.789 500.382 0.006zM500.382 859.162c-45.524 0-82.409 36.91-82.409 82.41 0 45.523 36.885 82.422 82.409 82.422s82.422-36.898 82.422-82.422c0-45.5-36.898-82.41-82.422-82.41z"
                                    fill="#317FE3" p-id="4279"></path>
                            </svg>
                            <svg v-else-if="scope.row.status === STATUS_MAP.MODIFIED" t="1731841952393" class="icon"
                                viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7070"
                                style="color: #ff0000;">
                                <path
                                    d="M468.114286 621.714286c7.314286 21.942857 21.942857 36.571429 43.885714 36.571428s36.571429-14.628571 43.885714-36.571428L585.142857 219.428571c0-43.885714-36.571429-73.142857-73.142857-73.142857-43.885714 0-73.142857 36.571429-73.142857 80.457143l29.257143 394.971429zM512 731.428571c-43.885714 0-73.142857 29.257143-73.142857 73.142858s29.257143 73.142857 73.142857 73.142857 73.142857-29.257143 73.142857-73.142857-29.257143-73.142857-73.142857-73.142858z"
                                    p-id="7071"></path>
                            </svg>
                        </el-icon>
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

.area-title {
    height: 80px;
    line-height: 80px;
    margin: 0;
    padding-left: 90px;
    background-image: url("../assets/工作区.png");
    background-repeat: no-repeat;
    background-size: contain;
    color: #8b8b8b;
}

.create-button {
    position: fixed;
    top: 100px;
    left: 21%;
}

.commit-button {
    position: fixed;
    top: 100px;
    left: 26%;
}
</style>
