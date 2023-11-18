let classes = ['<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
'\t height="1em" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">\n' +
'<path d="M256,152c-57.5,0-104,46.5-104,104s46.5,104,104,104s104-46.5,104-104S313.5,152,256,152z M256,280c-13.3,0-24-10.8-24-24\n' +
'\ts10.8-24,24-24s24,10.8,24,24S269.3,280,256,280z M256,16C123.5,16,16,123.5,16,256s107.5,240,240,240s240-107.5,240-240\n' +
'\tS388.5,16,256,16z M256,448c-105.9,0-192-86.1-192-192S150.1,64,256,64s192,86.1,192,192S361.9,448,256,448z"/>\n' +
'</svg>', '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
'\t height="1em" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">\n' +
'<path d="M256,160c-53.1,0-96,42.9-96,96s42.9,96,96,96c53.1,0,96-42.9,96-96S309.1,160,256,160z M256,288c-17.7,0-32-14.3-32-32\n' +
'\ts14.3-32,32-32c17.7,0,32,14.3,32,32S273.7,288,256,288z M256,16C123.4,16,16,123.4,16,256s107.4,240,240,240\n' +
'\tc132.6,0,240-107.4,240-240S388.6,16,256,16z M256,384c-70.8,0-128-57.3-128-128s57.3-128,128-128s128,57.3,128,128\n' +
'\tS326.8,384,256,384z"/>\n' +
'</svg>'];
let i = 0;
function getRecordBtn() {
    let btn = document.createElement('button');
    // btn.type = 'submit'; -- Creo que no es asi porq no es formulario, corregidme si me equivoco
    btn.id = 'recordBtn';
    btn.className = 'boton';
    btn.innerHTML = 'Grabar';
    return btn;
}

function getNextRecordIcon() {
    i = (i + 1) % 2;
    return classes[i];
}

export { getRecordBtn, getNextRecordIcon };