function getUploadBtn() {
    let btn = document.createElement('input');
    btn.type = 'button';
    btn.id = 'uploadBtn';
    btn.value = 'Subir';
    btn.className = 'boton';
    return btn;
}

export { getUploadBtn };