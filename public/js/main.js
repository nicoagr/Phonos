import {getRecordBtn} from "./recordBtn.js";
import {getPlayBtn} from "./playBtn.js";
import {getUploadBtn} from "./uploadBtn.js";

class App {
    audio;
    blob;
    state;


    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.blob = null;
        this.state = {recording: false, uploading: false, audioloaded: false, playing: false, files: [], error: false};
    }

    init() {
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                //Si damos el permiso creara el boton de record
                document.getElementById('liRecordBtn').appendChild(getRecordBtn());
                this.initRecord(stream);
                this.initAudio();
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
        });
        this.audio.addEventListener('onended', () => {
           console.log("onended");
        });
    }

    loadBlob() {
        this.audio.src = this.blob;
    }

    initRecord(s) {
        let audioChunks = [];
        let mediaRecorder = new MediaRecorder(s);
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        }
        mediaRecorder.onstop = () => {
            this.blob = new Blob(audioChunks, {type: 'audio/wav'});
            this.loadBlob();

        }
    }


    record() {
    }

    stopRecording() {
    }

    playAudio() {
        setState({playing: true});
    }

    stopAudio() {
        this.setState({playing: false});
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
        if(!this.state.error) {
            if (this.state.recording) {
                //estamos grabando
            } else { //no estamos grabando
                if (this.state.playing) {
                    //estamos reproduciendo
                    //no podemos reproducir y grabar a la vez
                }
                if (this.state.audioloaded) {
                    //se ha finalizado o se ha cargado audio
                    //no se puede cargar audio o finalizar audio si se está grabando
                }
            }
            if (this.state.uploading) {
                //estamos subiendo audio
            }
        } else {
            //ha habido un error
        }

    }

}

window.onload = function () {
    document.getElementById('liPlayBtn').appendChild(getPlayBtn());
    document.getElementById('liUploadBtn').appendChild(getUploadBtn());
    let app = new App();
    app.init();
};