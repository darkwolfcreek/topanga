var audioContext = null;
var currentOscillator = null;
var currentGainNode = null;
var isTonePlaying = false;

function playTone(frequency, oscillatorType) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (isTonePlaying) {
        stopToneSync();
    }

    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();

    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.value = 1;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();

    currentOscillator = oscillator;
    currentGainNode = gainNode;
    isTonePlaying = true;
}

function stopTone() {
    return new Promise((resolve, reject) => {
        if (currentOscillator) {
            currentOscillator.stop();
            currentOscillator.onended = () => {
                currentOscillator.disconnect();
                currentGainNode.disconnect();
                currentOscillator = null;
                currentGainNode = null;
                isTonePlaying = false;
                resolve();
            };
        } else {
            resolve();
        }
    });
}

function adjustVolume(volume) {
    if (currentGainNode) {
        currentGainNode.gain.value = volume;
    }
}

window.playTone = playTone;
window.stopTone = stopTone;
window.adjustVolume = adjustVolume;
