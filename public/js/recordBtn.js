function getRecordBtn() {
    let btn = document.createElement('input');
    btn.type = 'button';
    btn.id = 'recordBtn';
    btn.value = 'Grabar';
    return btn;
}

export { getRecordBtn };