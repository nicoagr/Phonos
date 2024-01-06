import {getRecordBtn, getNextRecordIcon} from "./recordBtn.js";
import {getPlayBtn, getStopIcon, getPlayIcon} from "./playBtn.js";
import {getUploadBtn} from "./uploadBtn.js";
import {formatAsTime} from "./utils/time/time.js";
import {getCloudDownloadIcon, getCopyIcon, getTrashIcon} from "./utils/icons.js";
import {choruseffect, roboteffect, tlfeffect} from "./utils/audio/effects.js";
import {blobToBase64} from "./utils/converter.js";

class App {

    audio;
    blob;
    state;
    mediaRecorder;
    reloj;
    secs;
    audioChunks;
    // audiocontext api
    audioContext;
    audioBuffer;
    audioSource;

    constructor() {
        this.blob = null;
        this.secs = 0;
        this.mediaRecorder = null;
        this.state = {recording: false, uploading: false, audioloaded: false, playing: false, files: [], error: false, uploaded: false};
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    init(recording = true) {
        if (recording)
            navigator.mediaDevices.getUserMedia({audio: true})
                .then(stream => {
                    // Inicializar
                    this.initRecord(stream);
                    this.initAudio();

                    //Si damos el permiso y los metodos van bien creara el boton de record y subir
                    document.getElementById('liRecordBtn').appendChild(getRecordBtn());
                    document.getElementById('liUploadBtn').appendChild(getUploadBtn());
                    document.getElementById('recordBtn').addEventListener('click', () => {
                        this.recordBtn()

                    });
                    document.getElementById('uploadBtn').addEventListener('click', () => this.uploadBtn());
                    document.getElementById('apptitle').innerText = 'Grabadora y reproductora de audio';

                    // Render
                    this.render();
                })
                .catch(() => {
                    document.getElementById('liRecordBtn').appendChild(document.createTextNode('No hay permisos para grabar'));
                    this.render();
                });
        else {
            this.initAudio();
        }
    }


    initAudio() {
        // No tiene sentido porq habrá que crearlo cada vez que se quiera
        // escuchar el audio
    }

    loadBlob() {
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

    playAudio() {
        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.onended = () => this.stopAudio();
        const effect = document.querySelector('input[name="effect"]:checked').id;
        let node;
        switch (effect) {
            case 'normal':
                this.audioSource.disconnect();
                this.audioSource.connect(this.audioContext.destination);
                break;
            case 'robot':
                this.audioSource.disconnect();
                node = roboteffect(this.audioContext);
                this.audioSource.connect(node);
                node.connect(this.audioContext.destination);
                break;
            case 'chorus':
                this.audioSource.disconnect();
                node = choruseffect(this.audioContext);
                this.audioSource.connect(node);
                node.connect(this.audioContext.destination);
                break;
            case 'tlf':
                this.audioSource.disconnect();
                node = tlfeffect(this.audioContext);
                this.audioSource.connect(node);
                node.connect(this.audioContext.destination);
                break;
        }
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
        // transformamos nuestro blob a base 64
        blobToBase64(this.blob).then((base64audio) => {
            fetch("/api/upload/", {
                method: "POST", // usaremos el método POST para subir el audio
                headers: {"Content-type": "application/json"},
                body: JSON.stringify({recording: base64audio}), // el audio en base64
            }).then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
                .then((data) => {
                    // Verificar que 'data' tiene la propiedad 'files'
                    if (data && data.files) {
                        console.log("Archivos recibidos:", data.files);
                        this.setState({ files: data.files});
                        this.setState({uploaded: true})
                        this.setState({uploading: false})
                    } else {
                        console.error("La respuesta del servidor no contiene la lista de archivos esperada.");
                        // Realiza acciones para manejar la falta de 'files' en la respuesta del servidor
                    }
                })
                .catch((error) => {
                    console.error("Error en la solicitud:", error);
                    // Realiza acciones para manejar el error de la solicitud fetch
                });
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
        if (!this.state.recording) {
            this.record();
        } else {
            this.stopRecording();
        }

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

    copytoClipboard(fileID) {
        let dest = window.location.origin + "/share/" + fileID;
        navigator.clipboard.writeText(dest).then(
            () => {
                Snackbar.show({text: "Se ha copiado el enlace correctamente", pos: "bottom-center", actionText: "OK"});
            },
            () => {
                Snackbar.show({text: "No se ha podido copiar", pos: "bottom-center", actionText: "OK"});
            },
        );

    }

    deleteFile(id) {
        const li = document.getElementById(id);
        li.remove();
        for (let i = 0; i < this.state.files.length; i++) {
            let cur = this.state.files[i];
            if (cur.filename == li.id) {
                this.state.files.splice(i, i + 1);
                break;
            }
        }
        let filename = li.id;
        fetch(`/api/delete/` + filename, {
            method: 'DELETE',
        }).then((res) => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
            .then((data) => {
                // Verificar que 'data' tiene la propiedad 'files'
                if (data && data.files) {
                    console.log("Archivos recibidos:", data.files);
                    this.setState({ files: data.files});
                    this.setState({uploaded: true})

                    this.render();
                } else {
                    console.error("La respuesta del servidor no contiene la lista de archivos esperada.");
                    // Realiza acciones para manejar la falta de 'files' en la respuesta del servidor
                }
            })
            .catch((error) => {
                console.error("Error en la solicitud:", error);
                // Realiza acciones para manejar el error de la solicitud fetch
            });

    }

    loadAudioFromServer(fileID) {
        let playBtn = document.getElementById('playBtn') || document.createElement('button');
        playBtn.innerHTML = "Cargando...";
        fetch(`/api/play/` + fileID)
            .then((r) =>
                r.json())
            .then((json) => {
                // decode base64 string in json.data
                fetch(`data:audio;base64,${json.data}`)
                    .then(res => res.blob())
                    .then(blob => {
                        this.blob = blob;
                        this.loadBlob();
                    });
            });
    }

    render() {
        /**
         * Coger el objeto JSON state e interpretarlo
         * Si estamos playing, actualizar los segundos y cambiar el titulo a pause
         * etc..
         */
        let playBtn = document.getElementById('playBtn') || document.createElement('button');
        let uploadBtn = document.getElementById('uploadBtn') || document.createElement('button');
        let recordBtn = document.getElementById('recordBtn') || document.createElement('button');
        let radioBtns = document.getElementsByName('effect');
        let listaFiles = document.getElementById('lista2');
        if (this.state.error) {
            recordBtn.disabled = true;
            playBtn.disabled = true;
            uploadBtn.disabled = true;
            radioBtns.forEach((btn) => btn.disabled = true);
            console.log("Error");
        } else if (this.state.playing) {
            recordBtn.disabled = true;
            uploadBtn.disabled = true;
            playBtn.disabled = false;
            radioBtns.forEach((btn) => btn.disabled = true);
            playBtn.innerHTML = getStopIcon() + ' Parar ' + formatAsTime(this.audioBuffer.duration - this.secs);
        } else if (this.state.recording) {
            playBtn.disabled = true;
            uploadBtn.disabled = true;
            recordBtn.innerHTML = getNextRecordIcon() + ' Parar Grabación ' + formatAsTime(5 * 60 - this.secs);
            recordBtn.disabled = false;
            radioBtns.forEach((btn) => btn.disabled = true);
            recordBtn.value = 'Finalizar';
        } else if (this.state.uploading) {
            uploadBtn.value = "Subiendo...";
            recordBtn.disabled = true;
            playBtn.disabled = true;
            uploadBtn.disabled = true;
            radioBtns.forEach((btn) => btn.disabled = true);
        }else if (this.state.uploaded) {
            uploadBtn.value = "Subir";
            recordBtn.disabled = false;
            playBtn.disabled = true;
            playBtn.innerHTML =  "Reproducir";
            uploadBtn.disabled = true;
            radioBtns.forEach((btn) => btn.disabled = false);

        } else if (this.state.audioloaded) {
            recordBtn.innerHTML = 'Grabar';
            recordBtn.disabled = false;
            playBtn.disabled = false;
            radioBtns.forEach((btn) => btn.disabled = false);
            playBtn.innerHTML = getPlayIcon() + " Reproducir " + formatAsTime(this.audioBuffer.duration);
            uploadBtn.disabled = false;
        }
        if (!this.state.audioloaded) {
            uploadBtn.disabled = true;
            playBtn.disabled = true;
            radioBtns.forEach((btn) => btn.disabled = true);
        }

        if (listaFiles)
            listaFiles.innerHTML = "";

        // If the user has files, show them
        if (this.state.files)
            this.state.files.forEach((file) => {

                // Cargar cada archivo en el servidor
                // crear tags
                let li = document.createElement('li');
                let icon = document.createElement('span');
                let icon3 = document.createElement('span');
                let icon2 = document.createElement('span');
                // id para identificar
                li.id = file.id;
                // icono copiar
                icon.className = 'icon1';
                icon.innerHTML = getCopyIcon();
                icon.addEventListener('click', () => {
                    this.copytoClipboard(file.id);
                });
                // icono descargar
                icon3.className = 'icon1';
                icon3.innerHTML = getCloudDownloadIcon();
                icon3.addEventListener('click', () => {
                    this.loadAudioFromServer(file.id);
                });
                li.appendChild(icon3)
                li.appendChild(icon);
                // texto
                moment.locale('es');
                // let momentOb1 = moment.unix(file.date).day();
                // let semana= ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
                // let momentObj2 = moment.unix(file.date).format('h:mm a DD/MM/YYYY');
                // let dia = semana[momentOb1-1]+' '+momentObj2;
                // li.appendChild(document.createTextNode(dia));
                let datestr = moment(file.date)._d.toLocaleDateString('es', {
                    weekday: 'short',
                    year: 'numeric',
                    month: '2-digit',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                });
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
    // Detectar si link es de reproduccion
    let recording = window.location.pathname.indexOf("/share/") === -1;
    document.getElementById('liPlayBtn').appendChild(getPlayBtn());
    let app = new App();
    app.init(recording);
    const playBtn = document.getElementById('playBtn');
    playBtn.addEventListener('click', () => app.playBtn());
    if (recording){
        fetch(`/api/list`)
            .then((r) =>
                r.json())
            .then((json) => {
                console.log("ficheros" + json.files)
                app.setState({files: json.files});
            });
    } else {
        let id = window.location.pathname.split("/").pop();
        app.loadAudioFromServer(id);
    }
}