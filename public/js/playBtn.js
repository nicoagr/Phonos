function getPlayBtn() {
    let btn = document.createElement('input');
    btn.type = 'button';
    btn.id = 'playBtn';
    btn.value = 'Reproducir';
    return btn;
}

export { getPlayBtn };