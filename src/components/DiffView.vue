<script setup>
import { computed } from 'vue';
import DiffMatchPatch from 'diff-match-patch';

const props = defineProps({
    oldContent: String, // 本地仓库版本内容
    newContent: String, // 工作区版本文件内容
});


const isVisible = defineModel()

// 实例化 diff-match-patch
const dmp = new DiffMatchPatch();

const closeDialog = () => {
    isVisible.value = false
};

// 生成并格式化左列（本地仓库版本）差异
const formattedOldContent = computed(() => {
    const diffs = dmp.diff_main(props.oldContent || '', props.newContent || '');
    dmp.diff_cleanupSemantic(diffs);

    return diffs.map(([type, text]) => {
        switch (type) {
            case -1: // 删除
                return `<span style="background-color: #f8d4d4; text-decoration: line-through;">${text}</span>`;
            case 1: // 插入
                return `<span style="background-color: #d4f8d4; color: transparent; user-select: none;">${text}</span>`;
            default: // 未变更或插入
                return `<span>${text}</span>`;
        }
    }).join('');
});

// 生成并格式化右列（工作区文件）差异
const formattedNewContent = computed(() => {
    const diffs = dmp.diff_main(props.oldContent || '', props.newContent || '');
    dmp.diff_cleanupSemantic(diffs);

    return diffs.map(([type, text]) => {
        switch (type) {
            case 1: // 插入
                return `<span style="background-color: #d4f8d4;">${text}</span>`;
            case -1: // 删除
                return `<span style="background-color: #f8d4d4;">  </span>`;
            default: // 未变更或删除
                return `<span>${text}</span>`;
        }
    }).join('');
});
</script>

<template>
    <el-dialog v-model="isVisible" title="文件差异对比" width="800px" @close="closeDialog">
        <div class="diff-container">
            <div class="diff-column">
                <h4>本地仓库内容</h4>
                <div v-html="formattedOldContent" class="diff-content"></div>
            </div>
            <div class="diff-column">
                <h4>工作区内容</h4>
                <div v-html="formattedNewContent" class="diff-content"></div>
            </div>
        </div>
        <template #footer>
            <el-button @click="closeDialog">关闭</el-button>
        </template>
    </el-dialog>
</template>



<style scoped>
.diff-container {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.diff-column {
    width: 48%;
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