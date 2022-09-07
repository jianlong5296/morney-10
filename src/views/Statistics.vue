<template>
    <Layout>
        <Tabs class-prefix="type" :data-source="recordTypeList" :value.sync="type"/>
        <div class="chart-wrapper" ref="chartWrapper">
            <Chart class="chart" :options="x"/>
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

        get x() {
            return {
                grid: {          //控制echarts图像的边距
                    left: 0,
                    right: 0,
                },
                xAxis: {
                    type: 'category',
                    data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
                        '11', '12', '13', '14', '15', '16', '17',
                        '18', '19', '20', '21', '22', '23', '24',
                        '25', '26', '27', '28', '29', '30'
                    ],
                    axisTick: {alignWithLabel: true},  //设置横轴刻度线与数据展示对齐
                    axisLine: {lineStyle: {color: '#666'}}
                },
                yAxis: {
                    type: 'value',
                    show: false,
                },
                series: [
                    {
                        symbol:'circle',     //设置标签点的样式
                        symbolSize: 10,     //设置标签点的大小
                        itemStyle: {color: '#666'},
                        data: [
                            150, 230, 224, 218, 135, 147, 260,
                            150, 230, 224, 218, 135, 147, 260,
                            150, 230, 224, 218, 135, 147, 260,
                            150, 230, 224, 218, 135, 147, 260, 1, 2
                        ],
                        type: 'line'
                    }
                ],
                tooltip: {
                    show: true,
                    position:'top',
                    formatter:'{c}'    //提示框下缘有个尖
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
            const result: Result = [{title: dayjs(recordList[0].createdAt).format('YYYY-MM-DD'), items: [newList[0]]}];
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
    };
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