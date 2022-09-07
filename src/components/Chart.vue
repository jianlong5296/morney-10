<template>
    <div class="wrapper" ref="wrapper">chart</div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import * as echarts from 'echarts';

    @Component
    export default class Chart extends Vue {
        @Prop() options: any;

        mounted() {
            console.log(this.options);
            const chart = echarts.init(this.$refs.wrapper as HTMLDivElement)
            chart.setOption(this.options)
        }
    }
</script>

<style scoped lang="scss">
    .wrapper{
        height: 400px;
    }
</style>