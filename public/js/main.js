import {getRecordBtn} from "./recordBtn.js";
import {getPlayBtn} from "./playBtn.js";
import {getUploadBtn} from "./uploadBtn.js";

class App {
    audio;
    blob;
    state;


    constructor() {

    }

    init() {
    }

    initAudio() {
        this.audio = document.createElement('audio');

        this.audio.addEventListener('onloadedmetadata', () => {
            console.log("onloadedmetadata");
        });
        this.audio.addEventListener('ondurationchange', () => {
            console.log("ondurationchange");
        });
        this.audio.addEventListener('ontimeupdate', () => {
            console.log("ontimeupdate");
        });
        this.audio.addEventListener('onended', () => {
           console.log("onended");
        });
    }

    loadBlob() {
        this.audio.src = this.blob;
    }

    initRecord() {
    }

    record() {
    }

    stopRecording() {
    }

    playAudio() {
    }

    stopAudio() {
    }

    upload() {
    }

    deleteFile() {
    }

    setState(state) {
        this.state = Object.assign({}, this.state, state);
        this.render();
    }

    render() {
        /**
         * Coger el objeto JSON state e interpretarlo
         * Si estamos playing, actualizar los segundos y cambiar el titulo a pause
         * etc..
         */
    }

}

window.onload = function () {
    document.getElementById('liRecordBtn').appendChild(getRecordBtn());
    document.getElementById('liPlayBtn').appendChild(getPlayBtn());
    document.getElementById('liUploadBtn').appendChild(getUploadBtn());
};