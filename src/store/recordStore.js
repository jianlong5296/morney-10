import clone from '@/lib/clone';
const localStorageKeyName = 'recordList';
const recordStore = {
    recordList: [],
    fetchRecords() {
        this.recordList = JSON.parse(window.localStorage.getItem(localStorageKeyName) || '[]');
        return this.recordList;
    },
    saveRecords() {
        window.localStorage.setItem(localStorageKeyName, JSON.stringify(this.recordList));
    },
    createRecord(record) {
        const record2 = clone(record);
        record2.createdAt = new Date().toISOString();
        this.recordList && this.recordList.push(record2);
        //也可以写为 this.recordList?.push(record2); 可选链语法 ES2020
        recordStore.saveRecords();
    },
};
recordStore.fetchRecords();
export default recordStore;
//# sourceMappingURL=recordStore.js.map