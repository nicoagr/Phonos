import {getRecordBtn, getNextRecordIcon} from "./recordBtn.js";
import {getPlayBtn} from "./playBtn.js";
import {getUploadBtn} from "./uploadBtn.js";
import {formatAsTime} from "./utils.js";

class App {

    audio;
    blob;
    state;
    mediaRecorder;
    constructor() {
        this.blob = null;
        this.mediaRecorder = null;
        this.state = {recording: false, uploading: false, audioloaded: false, playing: false, files: [], error: false};
    }

    init() {
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                // Inicializar
                this.initRecord(stream);
                this.initAudio();

                //Si damos el permiso y los metodos van bien creara el boton de record y subir
                document.getElementById('liRecordBtn').appendChild(getRecordBtn());
                document.getElementById('liUploadBtn').appendChild(getUploadBtn());
                document.getElementById('recordBtn').addEventListener('click', () => this.recordBtn());
                document.getElementById('uploadBtn').addEventListener('click', () => this.uploadBtn());

                // Render
                this.render();
            })
            .catch(err => {
                document.getElementById('liRecordBtn').appendChild(document.createTextNode('No hay permisos para grabar'));
            });
    }

    initAudio() {
        this.audio = new Audio();

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
        let audioUrl = URL.createObjectURL(this.blob);
        this.audio.src = audioUrl;
        this.setState({audioloaded: true});
    }

    initRecord(stream) {
        let audioChunks = [];
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.addEventListener('dataavailable', (event) => {
            audioChunks.push(event.data);
        });
        this.mediaRecorder.addEventListener('stop', () => {
            this.blob = new Blob(audioChunks, {type: 'audio/wav'});
            this.loadBlob();
        });
    }

    record() {
        this.blob = null;
        this.stopAudio();
        this.mediaRecorder.start();
        this.setState({recording:true});
    }

    stopRecording() {
        this.mediaRecorder.stop();
        this.setState({recording:false});

    }

    playAudio() {
        this.setState({playing: true});
        this.audio.play();
    }

    stopAudio() {
        this.setState({playing: false});
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    upload() {
        this.setState({uploading: true});
        /**
         * Subir archivo al servidor aqui
         */
        this.setState({uploading: false});
    }

    deleteFile() {
    }

    recordBtn() {
        if (!this.state.recording) this.record();
        else this.stopRecording();
    }

    playBtn() {
        if (!this.state.playing) this.playAudio();
        else this.stopAudio();
    }

    uploadBtn() {
        this.upload();
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
            document.getElementById('recordBtn').innerHTML = getNextRecordIcon() + ' Parar';
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
    document.getElementById('playBtn').addEventListener('click', () => app.playAudio());
};