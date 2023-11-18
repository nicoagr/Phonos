import {getRecordBtn, getNextRecordIcon} from "./recordBtn.js";
import {getPlayBtn} from "./playBtn.js";
import {getUploadBtn} from "./uploadBtn.js";
import {formatAsTime} from "./utils.js";

class App {

    audio;
    blob;
    state;
    mediaRecorder;
    reloj;
    secs ;
    constructor() {
        this.blob = null;
        this.secs = 0;
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

        this.audio.addEventListener('loadedmetadata', () => {
            console.log("onloadedmetadata");
            this.render();
        });
        this.audio.addEventListener('durationchange', () => {
            console.log("ondurationchange");
            this.render();
        });
        this.audio.addEventListener('timeupdate', () => {
            console.log("ontimeupdate");
            this.render();
        });
        this.audio.addEventListener('ended', () => {
            console.log("onended");
            this.setState({playing: false})
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
        this.reloj = setInterval(this.secondCounter, 1000, this);
        this.setState({recording:true});
    }

    stopRecording() {
        this.mediaRecorder.stop();
        clearInterval(this.reloj);
        this.secs = 0;
        this.setState({recording:false});
    }

    playAudio() {
        this.audio.play();
        this.setState({playing: true});
    }

    stopAudio() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.setState({playing: false});
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

    secondCounter(app) {
        app.secs++;
        app.render();
        if (app.secs > 5*60) this.stopRecording();
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
            playBtn.value = 'Parar ' + formatAsTime(this.audio.duration-this.audio.currentTime);
        } else if (this.state.recording) {
            playBtn.disabled = true;
            uploadBtn.disabled = true;
            recordBtn.innerHTML = getNextRecordIcon() + ' Parar Grabación ' + formatAsTime(300-this.secs);
            recordBtn.disabled = false;
            recordBtn.value = 'Finalizar';
        } else if (this.state.audioloaded) {
            recordBtn.innerHTML = 'Grabar';
            recordBtn.disabled = false;
            playBtn.disabled = false;
            playBtn.value = "Reproducir "+formatAsTime(this.audio.duration);
            uploadBtn.disabled = false;
        } else if (this.state.uploading) {
            recordBtn.disabled = true;
            playBtn.disabled = true;
            uploadBtn.disabled = true;
            uploadBtn.value = "Subiendo...";
        }
        if (!this.state.audioloaded) {
            uploadBtn.disabled = true;
        }
    }

}

window.onload = function () {
    document.getElementById('liPlayBtn').appendChild(getPlayBtn());
    let app = new App();
    app.init();
    document.getElementById('playBtn').addEventListener('click', () => app.playBtn());
};