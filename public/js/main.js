import {getRecordBtn} from "./recordBtn.js";
import {getPlayBtn} from "./playBtn.js";
import {getUploadBtn} from "./uploadBtn.js";
import {formatAsTime} from "./utils.js";

class App {

    audio;
    blob;
    state;

    constructor() {
        this.audio = new Audio();
        this.blob = null;
        this.state = {recording: false, uploading: false, audioloaded: false, playing: false, files: [], error: false};
    }

    init() {
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                //Si damos el permiso creara el boton de record y subir
                document.getElementById('liRecordBtn').appendChild(getRecordBtn());
                document.getElementById('liUploadBtn').appendChild(getUploadBtn());

                this.initRecord(stream);
                this.initAudio();
            })
            .catch(err => {
                console.log("No hay permisos para grabar");
                document.getElementById('liRecordBtn').appendChild(document.createTextNode('No hay permisos para grabar'));
            });
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
            this.render();
        });
        this.audio.addEventListener('onended', () => {
            console.log("onended");
        });
    }

    loadBlob() {
        this.audio.src = this.blob;
        this.setState({audioloaded: true});
    }

    initRecord(s) {
        let audioChunks = [];
        let mediaRecorder = new MediaRecorder(s);
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        }
        mediaRecorder.onstop = function() {
            this.blob = new Blob(audioChunks, {type: 'audio/wav'});
            this.loadBlob();
        }
    }

    record() {
    }

    stopRecording() {
    }

    playAudio() {
        this.setState({playing: true});
        this.audio.play();
    }

    stopAudio() {
        this.setState({playing: false});
        this.audio.stop();
    }

    upload() {
        this.setState({uploading: true});
        /**
         * Subir archivo al servidor aqu�
         */
        this.setState({uploading: false});
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
        let playBtn = document.getElementById('playBtn');
        let uploadBtn = document.getElementById('uploadBtn');
        let recordBtn = document.getElementById('recordBtn');

        if (this.state.error) {
            recordBtn.disabled = true;
            playBtn.disabled = true;
            uploadBtn.disabled = true;
            console.log("Error");
        } else if (this.state.playing) {
            recordBtn.disabled = true;
            uploadBtn.disabled = true;
            playBtn.disabled = false;
            playBtn.value = 'Parar ' + formatAsTime(this.audio.currentTime);
        } else if (this.state.recording) {
            playBtn.disabled = true;
            uploadBtn.disabled = true;
            recordBtn.disabled = false;
            recordBtn.value = 'Finalizar';
        } else if (this.state.audioloaded) {
            recordBtn.value = 'Grabar';
            recordBtn.disabled = false;
            playBtn.disabled = false;
            uploadBtn.disabled = false;
        } else if (this.state.uploading) {
            recordBtn.disabled = true;
            playBtn.disabled = true;
            uploadBtn.disabled = true;
        }
    }

}

window.onload = function () {
    document.getElementById('liPlayBtn').appendChild(getPlayBtn());
    let app = new App();
    app.init();
    app.render();
};