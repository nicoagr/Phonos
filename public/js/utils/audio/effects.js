/**
 * Fuente de los efectos:
 * https://noisehack.com/custom-audio-effects-javascript-web-audio-api/
 * https://webaudioapi.com/samples/room-effects/
 * Adaptado para modernizarlo un poco. Aun asi, utiliza funciones deprecadas.
 */

let bufferSize = 4096;
let roboteffect = function(audioContext) {
    let node = audioContext.createScriptProcessor(bufferSize, 1, 1);
    node.bits = 4; // between 1 and 16
    node.normfreq = 0.1; // between 0.0 and 1.0
    let step = Math.pow(1/2, node.bits);
    let phaser = 0;
    let last = 0;
    node.onaudioprocess = function(e) {
        let input = e.inputBuffer.getChannelData(0);
        let output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            phaser += node.normfreq;
            if (phaser >= 1.0) {
                phaser -= 1.0;
                last = step * Math.floor(input[i] / step + 0.5);
            }
            output[i] = last;
        }
    };
    return node;
};

let choruseffect = function(audioContext) {
    let convolver = audioContext.createConvolver();
    fetch(window.location.origin + '/js/utils/audio/chorus.wav')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            convolver.buffer = audioBuffer;
        })
        .catch(e => console.error(e));
    return convolver;
};

let tlfeffect = function(audioContext) {
    let convolver = audioContext.createConvolver();
    fetch(window.location.origin + '/js/utils/audio/telephone.wav')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            convolver.buffer = audioBuffer;
        })
        .catch(e => console.error(e));
    return convolver;
};

export {roboteffect, choruseffect, tlfeffect};