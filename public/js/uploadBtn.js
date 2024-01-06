function getUploadBtn() {
    let btn = document.createElement('button');
    btn.id = 'uploadBtn';
    btn.innerHTML = 'Subir';
    btn.className = 'boton';
    return btn;
}

export { getUploadBtn };