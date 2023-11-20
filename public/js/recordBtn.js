import {getVynilSolid} from "./utils/icons.js";

let classes = [getVynilSolid(), '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
'\t height="1em" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">\n' +
'<path d="M256,152c-57.5,0-104,46.5-104,104s46.5,104,104,104s104-46.5,104-104S313.5,152,256,152z M256,280c-13.3,0-24-10.8-24-24\n' +
'\ts10.8-24,24-24s24,10.8,24,24S269.3,280,256,280z M256,16C123.5,16,16,123.5,16,256s107.5,240,240,240s240-107.5,240-240\n' +
'\tS388.5,16,256,16z M256,448c-105.9,0-192-86.1-192-192S150.1,64,256,64s192,86.1,192,192S361.9,448,256,448z"/>\n' +
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