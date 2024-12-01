<script setup>
import { useBranchStore } from '@/stores/branch';
import { reactive, ref, computed } from 'vue';
import { ElMessageBox } from 'element-plus';

const store = useBranchStore();

// 表单管理
const formRef = ref(null);
const form = reactive({
    sourceBranch: '',
    targetBranch: '',
});
const rules = {
    sourceBranch: [{ required: true, message: '源分支不能为空', trigger: 'blur' }],
    targetBranch: [{ required: true, message: '目标分支不能为空', trigger: 'blur' }],
};

// 分支列表
const branchList = computed(() => store.branches.map((item) => item.name));
const targetBranchList = computed(() => branchList.value.filter((item) => item !== form.sourceBranch));

// 合并分支
const mergeBranch = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            if (form.targetBranch === 'master') {
                ElMessageBox.prompt('请输入版本号(vX.X)', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: /^v\d+\.\d+$/,
                }).then(({ value }) => {
                    const lastVersion = store.branches[0].commits.at(-1).tag.replace('v', '');
                    const currentVersion = value.replace('v', '');
                    if (parseFloat(currentVersion) > parseFloat(lastVersion)) {
                        store.mergeBranch(form.sourceBranch, form.targetBranch, value);
                        formRef.value.resetFields();
                        emit('update:visible', false);
                    }
                });
            } else {
                store.mergeBranch(form.sourceBranch, form.targetBranch);
                formRef.value.resetFields();
                emit('update:visible', false);
            }
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
    <el-dialog v-model="props.visible" title="合并分支" width="600" @close="closeDialog">
        <el-form :model="form" ref="formRef" :rules="rules">
            <el-form-item label="源分支" prop="sourceBranch">
                <el-select v-model="form.sourceBranch" @change="form.targetBranch = ''" placeholder="请选择源分支">
                    <el-option v-for="item in branchList" :key="item" :label="item" :value="item" />
                </el-select>
            </el-form-item>
            <span class="merge-to">合并到</span>
            <el-form-item label="目标分支" prop="targetBranch">
                <el-select v-model="form.targetBranch" placeholder="请选择目标分支">
                    <el-option v-for="item in targetBranchList" :key="item" :label="item" :value="item" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="closeDialog">取消</el-button>
                <el-button type="primary" @click="mergeBranch">确定</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style lang="scss" scoped>
.el-form {
    display: flex;
    justify-content: center;
    align-items: baseline;

    .merge-to {
        margin: 0 20px;
    }

    .el-select {
        width: 170px;
    }
}
</style>