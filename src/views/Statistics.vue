<template>
    <Layout>
        <Tabs class-prefix="type" :data-source="recordTypeList" :value.sync="type"/>
        <div class="chart-wrapper" ref="chartWrapper">
            <Chart class="chart" :options="chartOptions"/>
        </div>
        <ol v-if="groupedList.length>0">
            <li v-for="(group,index) in groupedList" :key="index">
                <h3 class="title">
                    {{beautify(group.title)}}
                    <span>￥{{group.total}}</span>
                </h3>
                <ol>
                    <li v-for="item in group.items" :key="item.id"
                        class="record">
                        <span>{{tagString(item.tags)}}</span>
                        <span class="notes">{{item.notes}}</span>
                        <span>￥{{item.amount}} </span>
                    </li>
                </ol>
            </li>
        </ol>
        <div v-else class="noResult">
            目前没有相关记录
        </div>

    </Layout>
</template>


<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import Tabs from '@/components/Tabs.vue';
    import recordTypeList from '@/constants/recordTypeList';
    import dayjs from 'dayjs';
    import clone from '@/lib/clone';
    import Chart from '@/components/Chart.vue';
    import _ from 'lodash';
    import day from 'dayjs';

    @Component({
        components: {Chart, Tabs},
    })
    export default class Statistics extends Vue {
        tagString(tags: Tag[]) {
            return tags.length === 0 ? '无' : tags.map(t => t.name).join('，');
        }

        mounted() {             //实现默认图表生成最后的几组数据
            const div = (this.$refs.chartWrapper as HTMLDivElement);
            div.scrollLeft = div.scrollWidth;
        }

        beautify(string: string) {
            const day = dayjs(string);
            const now = dayjs();
            if (day.isSame(now, 'day')) {
                return '今天';
            } else if (day.isSame(now.subtract(1, 'day'), 'day')) {
                return '昨天';
            } else if (day.isSame(now.subtract(2, 'day'), 'day')) {
                return '前天';
            } else if (day.isSame(now, 'year')) {
                return day.format('M月D日');
            } else {
                return day.format('YYYY年M月D日');
            }
        }

        get keyValueList(){
            const today = new Date();
            const array = [];

            for (let i = 0; i <= 29; i++) {
                const dateString = day(today).subtract(i, 'day').format('YYYY-MM-DD');
                const found = _.find(this.groupedList, {title: dateString});
                array.push({
                  key: dateString, value: found ? found.total : 0
                });
            }
            //生成的图标按时间排序
            array.sort((a, b) => {
                if (a.key > b.key) {
                    return 1;
                } else if (a.key === b.key) {
                    return;
                } else {
                    return -1;
                }
            });
            return array;
        }

        get chartOptions() {
            const keys = this.keyValueList.map(item => item.key);
            const values = this.keyValueList.map(item => item.value);
            return {
                grid: {          //控制echarts图像的边距
                    left: 0,
                    right: 0,
                },
                xAxis: {
                    type: 'category',
                    data: keys,
                    axisTick: {alignWithLabel: true},  //设置横轴刻度线与数据展示对齐
                    axisLine: {lineStyle: {color: '#666'}},
                    axisLabel:{
                        formatter: function (value:string, index:number) {
                            return value.substr(5);
                        }
                    }
                },

                yAxis: {
                    type: 'value',
                    show: false,
                },
                series: [
                    {
                        symbol: 'circle',     //设置标签点的样式
                        symbolSize: 10,     //设置标签点的大小
                        itemStyle: {color: '#666'},
                        data: values,
                        type: 'line'
                    }
                ],
                tooltip: {
                    show: true,
                    position: 'top',
                    formatter: '{c}'    //提示框下缘有个尖
                }
            };
        }

        get recordList() {
            return (this.$store.state as RootState).recordList;
        }

        get groupedList() {
            const {recordList} = this;
            const newList = clone(recordList)
                .filter(r => r.type === this.type)
                .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
            if (newList.length === 0) {
                return [];
            }
            type Result = { title: string, total?: number, items: RecordItem[] }[]
            const result: Result = [{title: dayjs(newList[0].createdAt).format('YYYY-MM-DD'), items: [newList[0]]}];
            for (let i = 1; i < newList.length; i++) {
                const current = newList[i];
                const last = result[result.length - 1];
                if (dayjs(last.title).isSame(dayjs(current.createdAt), 'day')) {
                    last.items.push(current);
                } else {
                    result.push({title: dayjs(current.createdAt).format('YYYY-MM-DD'), items: [current]});
                }
            }
            result.map(group => {
                group.total = group.items.reduce((sum, item) => {
                    return sum + item.amount;
                }, 0);
            });
            return result;
        }

        beforeCreate() {
            this.$store.commit('fetchRecords');
        }

        type = '-';
        recordTypeList = recordTypeList;
    }
</script>
<style scoped lang="scss">
    .noResult {
        padding: 16px;
        text-align: center;

    }

    ::v-deep {
        .type-tabs-item {
            background: #c4c4c4;

            &::after {
                display: none;
            }

            &.selected {
                background: white;
            }
        }

        .interval-tabs-item {
            height: 48px;
        }
    }

    %item {
        padding: 8px 16px;
        line-height: 24px;
        display: flex;
        justify-content: space-between;
        align-content: center;
    }

    .title {
        @extend %item;
    }

    .record {
        background: white;
        @extend %item;
    }

    .notes {
        margin-right: auto;
        margin-left: 16px;
        color: #999;
    }

    .chart {
        width: 430%;

        &-wrapper {
            overflow: auto; //图表滚动条
            &::-webkit-scrollbar { //隐藏滚动条，pc端按住shift用鼠标滚轮查看图像
                display: none;
            }
        }
    }
</style>