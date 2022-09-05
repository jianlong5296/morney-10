<template>
    <Layout>
        <div class="tags">
            <router-link class="tag"
                         v-for="tag in tags"
                         :key="tag.id"
                         :to="`/labels/edit/${tag.id}`">
                <span>{{tag.name}}</span>
                <Icon name="right"/>
            </router-link>
        </div>
        <div class="createTag-wrapper">
            <Button class="createTag"
                    @click="createTag">新建标签
                <!--                .native 可以实现button点击事件绑定-->
            </Button>
        </div>
    </Layout>
</template>

<script lang="ts">
    import {Component} from 'vue-property-decorator';
    import Button from '@/components/Button.vue';
    import TagHelper from '@/mixins/TagHelper';
    import {mixins} from 'vue-class-component';

    @Component({
        components: {Button},
    })
    export default class Labels extends mixins(TagHelper) {
        get tags(){
            return this.$store.state.tagList;
        }
        beforeCreate() {
            this.$store.commit('fetchTags');  //重复fetch获取
        }

        createTag() {
            const name = window.prompt('请输入标签名');
            if (!name) {
                return window.alert('标签名不能为空');
            }
            this.$store.commit('createTag', name);
        }
    }
</script>

<style scoped lang="scss">
    .tags {
        background: white;
        font-size: 16px;
        padding-left: 16px;

        > .tag {
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #e6e6e6;

            svg {
                width: 18px;
                height: 18px;
                color: #666;
                margin-right: 16px;
            }
        }
    }

    .createTag {
        background: #E63629;
        color: white;
        border-radius: 4px;
        border: none;
        height: 40px;
        padding: 0 16px;

        &-wrapper { //父元素选择器
            text-align: center;
            padding: 16px;
            margin-top: 44-16px;
        }
    }
</style>