import { __decorate } from "tslib";
import Vue from 'vue';
import Component from 'vue-class-component';
const map = {
    'tag name duplicated': '标签名重复了'
};
let TagHelper = class TagHelper extends Vue {
    createTag() {
        const name = window.prompt('请输入标签名');
        if (!name) {
            return window.alert('标签名不能为空');
        }
        this.$store.commit('createTag', name);
        if (this.$store.state.createTagError) {
            if (this.$store.state.createTagError) {
                window.alert(map[this.$store.state.createTagError.message] || '未知错误');
            }
        }
    }
};
TagHelper = __decorate([
    Component
], TagHelper);
export { TagHelper };
export default TagHelper;
//# sourceMappingURL=TagHelper.js.map