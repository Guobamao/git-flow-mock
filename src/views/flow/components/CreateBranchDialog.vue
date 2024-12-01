<script setup>
import { useBranchStore } from '@/stores/branch';
import { reactive, ref, computed } from 'vue';

const store = useBranchStore();

// 表单管理
const formRef = ref(null);
const form = reactive({
    branchName: '',
    branchSource: '',
});
const rules = {
    branchName: [{ required: true, message: '分支名称不能为空', trigger: 'blur' }],
};

// 分支列表
const branchList = computed(() => store.branches.map((item) => item.name));

// 创建分支
const createBranch = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            store.createBranch(form.branchName, form.branchSource || 'master');
            formRef.value.resetFields();
            emit('update:visible', false);
        }
    });
};

// 父组件传入的显示状态
const props = defineProps({
    visible: Boolean,
});
const emit = defineEmits(['update:visible']);

// 关闭对话框
const closeDialog = () => {
    emit('update:visible', false);
};
</script>

<template>
    <el-dialog v-model="props.visible" title="创建代码分支" width="500" @close="closeDialog">
        <el-form :model="form" ref="formRef" :rules="rules" class="create-branch-form">
            <el-form-item label="分支名称" prop="branchName">
                <el-input v-model="form.branchName" placeholder="请输入分支名称" maxlength="255" show-word-limit />
            </el-form-item>
            <el-form-item label="创建来源" prop="branchSource">
                <el-select v-model="form.branchSource" filterable placeholder="请选择分支">
                    <el-option v-for="item in branchList" :key="item" :label="item" :value="item" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="closeDialog">取消</el-button>
                <el-button type="primary" @click="createBranch">确定</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style lang="scss" scoped>
.el-form-item {
    flex-direction: column;

    ::v-deep(.el-form-item__label) {
        justify-content: flex-start;
    }
}
</style>