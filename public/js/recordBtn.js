function getRecordBtn() {
    let btn = document.createElement('input');
    btn.type = 'button';
    btn.id = 'recordBtn';
    btn.value = 'Grabar';
    btn.className = 'boton';

    return btn;
}

export { getRecordBtn };