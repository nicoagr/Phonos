import {getRecordBtn, getNextRecordIcon} from "./recordBtn.js";
import {getPlayBtn, getStopIcon, getPlayIcon} from "./playBtn.js";
import {getUploadBtn} from "./uploadBtn.js";
import {formatAsTime} from "./utils/time/time.js";
import {getCopyIcon, getTrashIcon} from "./utils/icons.js";
import v4 from "./utils/uuid/v4.js";


class App {

    audio;
    blob;
    state;
    mediaRecorder;
    reloj;
    secs;
    audioChunks;
    uuid;
    // audiocontext api
    audioContext;
    audioBuffer;
    audioSource;

    constructor() {
        this.blob = null;
        this.secs = 0;
        this.mediaRecorder = null;
        this.state = {recording: false, uploading: false, audioloaded: false, playing: false, files: [], error: false};
        if (!localStorage.getItem("uuid"))
            localStorage.setItem("uuid", v4());
        this.uuid = localStorage.getItem("uuid");
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
                document.getElementById('apptitle').innerText = 'Grabadora y reproductora de audio';

                // Render
                this.render();
            })
            .catch(() => {
                document.getElementById('liRecordBtn').appendChild(document.createTextNode('No hay permisos para grabar'));
                this.render();
            });
    }

    // initAudio() {
    //     this.audio = new Audio();
    //
    //     this.audio.addEventListener('loadedmetadata', () => {
    //         this.render();
    //     });
    //     this.audio.addEventListener('durationchange', () => {
    //         this.render();
    //     });
    //     this.audio.addEventListener('timeupdate', () => {
    //         this.render();
    //     });
    //     this.audio.addEventListener('ended', () => {
    //         this.setState({playing: false})
    //     });
    // }

    initAudio() {
       // No tiene sentido porq habrá que crearlo cada vez que se quiera
       // escuchar el audio
    }

    // loadBlob() {
    //     this.audio.src = URL.createObjectURL(this.blob);
    //     this.setState({audioloaded: true});
    // }

    loadBlob() {
        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.connect(this.audioContext.destination);
        this.audioSource.onended = () => this.setState({playing: false});
        const reader = new FileReader();
        reader.onload = async (event) => {
            const arrayBuffer = event.target.result;
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.setState({audioloaded: true});
        };
        reader.readAsArrayBuffer(this.blob);
    }

    initRecord(stream) {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.addEventListener('dataavailable', (event) => {
            this.audioChunks.push(event.data);
        });
        this.mediaRecorder.addEventListener('stop', () => {
            this.blob = new Blob(this.audioChunks, {type: 'audio/wav'});
            this.loadBlob();
        });
    }

    record() {
        this.audioChunks = [];
        this.stopAudio();
        this.mediaRecorder.start();
        this.reloj = setInterval(this.secondCounter, 500, this);
        this.setState({recording: true});
    }

    stopRecording() {
        this.mediaRecorder.stop();
        clearInterval(this.reloj);
        this.secs = 0;
        this.setState({recording: false});
    }

    // playAudio() {
    //     this.audio.play();
    //     this.setState({playing: true});
    // }
    //
    // stopAudio() {
    //     this.audio.pause();
    //     this.audio.currentTime = 0;
    //     this.setState({playing: false});
    // }

    playAudio() {
        this.audioSource.buffer = this.audioBuffer;
        this.audioSource.start();
        this.reloj = setInterval(this.secondCounter, 500, this);
        this.setState({playing: true});
    }

    stopAudio() {
        if (this.state.playing) {
            this.audioSource.stop();
            clearInterval(this.reloj);
            this.secs = 0;
        }
        this.setState({playing: false});
    }

    upload() {
        this.setState({uploading: true});
        const body = new FormData(); // Mediante FormData podremos subir el audio al servidor
        body.append("recording", this.blob); // en el atributo recording de formData guarda el audio para su posterior subida
        fetch("/api/upload/" + this.uuid, {
            method: "POST", // usaremos el método POST para subir el audio
            body,
        })
            .then((res) => res.json())
            // el servidor, una vez recogido el audio,devolverá la lista de todos los ficheros a nombre del presente usuario (inlcuido el que se acaba de subir)
            .then((json) => {
                this.setState({
                    files: json.files, // todos los ficheros del usuario
                    uploading: false, // actualizar el estado actual
                });
            })
            .catch(() => {
                this.setState({error: true});
            });
    }


    secondCounter(app) {
        app.secs += 0.5;
        app.render();
        if (app.secs > 5 * 60 * 2) {
            if (this.state.recording) {
                app.stopRecording();
            } else if (this.state.playing) {
                app.stopAudio();
            }
        }
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

    copytoClipboard(filename) {
        let dest = window.location.origin + "/play/" + filename;
        navigator.clipboard.writeText(dest).then(
            () => {
                Snackbar.show({text:"Se ha copiado el enlace correctamente", pos: "bottom-center", actionText: "OK"});
            },
            () => {
                Snackbar.show({text:"No se ha podido copiar", pos: "bottom-center", actionText: "OK"});
            },
        );

    }

    deleteFile(id) {
        const li = document.getElementById(id);
        li.remove();
        for (let i = 0; i < this.state.files.length; i++) {
            let cur = this.state.files[i];
            if (cur.filename == li.id) {
                this.state.files.splice(i, i+1);
                break;
            }
        }
        /** ESTA ES LA LLAMADA AL API. Ahora mismo da error porque api/delete no existe
        let uuid = li.dataset.uuid;
        let filename = li.dataset.filename;
        fetch('/api/delete/' + uuid + '/' + filename, {
            method: 'DELETE',
        })
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('No se puede borrar el fichero: ' + response.statusText);
                }
                //fila.remove();
            })
            .catch(function (err) {
                console.log(err);
            });

         */
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
        let listaFiles = document.getElementById('lista2');
        if (playBtn != null && uploadBtn != null && recordBtn != null) {
            if (this.state.error) {
                recordBtn.disabled = true;
                playBtn.disabled = true;
                uploadBtn.disabled = true;
                console.log("Error");
            } else if (this.state.playing) {
                recordBtn.disabled = true;
                uploadBtn.disabled = true;
                playBtn.disabled = false;
                playBtn.innerHTML = getStopIcon() + ' Parar ' + formatAsTime(this.audioBuffer.duration - this.secs);
            } else if (this.state.recording) {
                playBtn.disabled = true;
                uploadBtn.disabled = true;
                recordBtn.innerHTML = getNextRecordIcon() + ' Parar Grabación ' + formatAsTime(5 * 60 - this.secs);
                recordBtn.disabled = false;
                recordBtn.value = 'Finalizar';
            } else if (this.state.uploading) {
                uploadBtn.value = "Subiendo...";
                recordBtn.disabled = true;
                playBtn.disabled = true;
                uploadBtn.disabled = true;
            } else if (this.state.audioloaded) {
                recordBtn.innerHTML = 'Grabar';
                recordBtn.disabled = false;
                playBtn.disabled = false;
                playBtn.innerHTML = getPlayIcon() + " Reproducir " + formatAsTime(this.audioBuffer.duration);
                uploadBtn.disabled = false;
            }
            if (!this.state.audioloaded) {
                uploadBtn.disabled = true;
                playBtn.disabled = true;
            }
        }
        listaFiles.innerHTML = "";


        this.state.files.forEach((file) => {
            // Cargar cada archivo en el servidor
            // crear tags
            let li = document.createElement('li');
            let icon = document.createElement('span');
            let icon2 = document.createElement('span');
            // id para identificar
            li.id = file.filename;
            // icono copiar
            icon.className = 'icon1';
            icon.innerHTML = getCopyIcon();
            icon.addEventListener('click', () => {
                this.copytoClipboard(file.filename);

            });
            li.appendChild(icon);
            // texto
            moment.locale('es');
            // let momentOb1 = moment.unix(file.date).day();
            // let semana= ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
            // let momentObj2 = moment.unix(file.date).format('h:mm a DD/MM/YYYY');
            // let dia = semana[momentOb1-1]+' '+momentObj2;
            // li.appendChild(document.createTextNode(dia));
            let datestr = moment(file.date)._d.toLocaleDateString('es', {weekday: 'short', year: 'numeric', month: '2-digit', day: 'numeric', hour: 'numeric', minute: 'numeric'});
            li.appendChild(document.createTextNode(datestr));
            // icono basura
            icon2.className = 'icon2';
            icon2.innerHTML = getTrashIcon();
            icon2.addEventListener('click', function () {
                this.deleteFile(li.id);
            }.bind(this));
            li.appendChild(icon2);
            // añadir a la lista
            listaFiles.appendChild(li);
        });
    }
}

window.onload = function () {
    document.getElementById('liPlayBtn').appendChild(getPlayBtn());
    let app = new App();
    app.init();
    document.getElementById('playBtn').addEventListener('click', () => app.playBtn());
    fetch("/api/list/")
        .then((r) => r.json())
        .then((json) => {
            app.setState({files: json.files});
        });
};