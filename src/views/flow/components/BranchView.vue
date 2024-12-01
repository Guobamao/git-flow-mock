<script setup>
import { useBranchStore } from '@/stores/branch';
import mermaid from 'mermaid';
import { computed, onMounted, ref, watch } from 'vue';

mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });

const branchStore = useBranchStore();
const mermaidRef = ref(null);

const flowData = computed(() => {
    return branchStore.branchStr
})

watch(flowData, async (newValue) => {
    if (mermaidRef.value) {
        const { svg, bindFunctions } = await mermaid.render('mermaid', newValue);
        mermaidRef.value.innerHTML = svg;
        if (bindFunctions) {
            bindFunctions(mermaidRef.value);
        }
    }
});

onMounted(() => {
    if (mermaidRef.value) {
        mermaid.run({ querySelector: '.mermaid' });
    }
});
</script>

<template>
    <div style="text-align: center;">
        <div class="mermaid" ref="mermaidRef" v-html="flowData"></div>
    </div>
</template>
