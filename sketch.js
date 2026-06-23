const audioContext = new AudioContext();

let sourceNode, analyserNode;
let audioSetup = false;

const toneBtn = document.getElementById("tone-test");

const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: "triangle"
    },
    envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.1,
        release: 0.8
    }
}).toDestination();
const recorder = new Tone.Recorder();

synth.connect(recorder);

const fftAnalyser = new Tone.Analyser("fft", 1024);
const waveAnalyser = new Tone.Analyser("waveform", 1024);

const currentPiece = document.getElementById("current-piece");

const music = document.getElementById("audio-track");

// const mediaSource = Tone.context.createMediaElementSource(music);
// Tone.connect(mediaSource, fftAnalyser);

const playCurrentBtn = document.getElementById("play-current-btn");

const recordBtn = document.getElementById("record-btn");

// function MIDIAccess(args = {}) {

// }

// class MIDIAcesss {
//     constructor(args = {}) {
//         this.devices = {};
//         this.onDeviceInput = args.onDeviceInput || console.log;
//     }

//     start(){
//         this._requestAccess().then().catch();
//     }

//     _requestAccess() {
//         return new Promise((resolve, reject) => {
//             navigator.requestMIDIAccess().then((access) => {
//             const devices = access.inputs.values();

//             for(let device of devices){
//                 console.log(device);
//                 device.onmidimessage = onMidiMessage;
//             }


//             console.log("midi keyboard connected");
//         }).catch(console.error);
//         })
//     }
        
//     }
// }



document.addEventListener("DOMContentLoaded", () => {
    if(navigator.requestMIDIAccess){
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
        console.log("Web mid")
    }
})

function onMIDISuccess(midiAccess){
    const inputs = midiAccess.inputs.values();
    for(let input of inputs){
        input.onMidiMessage = handleMIDIMessage;
    }
}

function onMIDIFailure() {
    console.log("no midi device access");
}

function handleMIDIMessage(message){
    console.log("hi");
    const command = message.data[0] & 0xf0;
    const midiNote = message.data[1];
    const velocity = message.data[2];

    const frequency = new Tone.Frequency(midiNote, "midi").toNote();

    if(command === 144 && velocity > 0){
        const normalizedVelocity = velocity /127;
        synth.triggerAttack(frequency, Tone.now(), normalizedVelocity);
    } else if(command === 128 || (command === 144 && velocity === 0)){
        synth.triggerRelease(frequency);
    }
}


function onMidiMessage(message){
    let [_, input, value] = message.data;
    console.log({input, value});
}

toneBtn.addEventListener("click", async () => {
    await Tone.start();
    synth.triggerAttackRelease("c3", "8n");
})

let playBtnText = "Play";
let isPlaying = false;

let recordBtnTextText = "Record";
let isRecording = false;

playCurrentBtn.addEventListener("click", (e) => {
    isPlaying = !isPlaying;
        if(isPlaying){
            setupAudio();
            music.play();
            playCurrentBtn.textContent = "Stop";
        } else {
            music.pause();
            playCurrentBtn.textContent = "Start";
        }

})

music.addEventListener("ended", () => {
    playCurrentBtn.textContent = "Start";
})

recordBtn.addEventListener("click", async (e) => {
    isRecording = !isRecording;
    if(isRecording){
        recorder.start();
        recordBtn.textContent = "Recording";
    } else {

        recordBtn.textContent = "Record";
    }
})

document.addEventListener("keydown", async (event) => {
    if(event.key === " "){
        console.log("spacebar hit");
        isRecording = !isRecording;
        if(isRecording){
            recorder.start();
            recordBtn.textContent = "Recording";
        } else {
            const recordingBlob = await recorder.stop();
            const url = URL.createObjectURL(recordingBlob);
            // const anchor = document.createElement("a");
            // anchor.download = "tone.recording.mp3";
            // anchor.href = url;
            // anchor.click();

            music.src = url;

            recordBtn.textContent = "Record";
        }
    }
    if(isRecording && event.key !== " "){

        synth.triggerAttackRelease(keyboard(event.key), "8n");
    }

    

})

function keyboard(note) {
    switch(note){
        case "s":
            return "c3";
        case "d":
            return "d3";
        case "f":
            return "e3";
        case "g":
            return "f3";
        case "h":
            return "g3";
        case "j":
            return "a3";
        case "k":
            return "b3";
        case "l":
            return "c4";
        default:
            break;
    }
}

const hydra = new Hydra({ 
    makeGlobal: false,
    canvas: document.getElementById("hydra-canvas"),
    detectAudio: true 
});

const audio1 = new Audio(audioContext);
const fft1 = audio1.fft;

function setupAudio(){
    if(audioSetup) return;
    audioSetup = true;

    sourceNode = audioContext.createMediaElementSource(music);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fft = 1024;

    sourceNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    hydra.synth.a.setBins(4);
    hydra.synth.a.setScale(8);
    hydra.synth.a.setCutoff(0.2);
    hydra.synth.a.setSmooth(0.6);

    hydra.synth.a.analyser = analyserNode;
}

hydra.synth.voronoi(1, 0.1, 1.2)
// .mult(hydra.synth.osc(2, 0.4, 1))
// .scale(() => 0.0055 + hydra.synth.a.fft[0] * 0.022)
// .rotate(() => 0.5 + hydra.synth.a.fft[0], 0.3)
.out(hydra.synth.o0);

const hydra2 = new Hydra({
    makeGlobal: false,
    canvas: document.getElementById("this-piece"),
    detectAudio: false
})

hydra2.synth.osc()
.scale(() => 0.0055 + hydra.synth.a.fft[0] * 15)
// .rotate(() => hydra.synth.a.fft[1], 3)
.out(hydra2.synth.o0);

const hydra3 = new Hydra({
    makeGlobal: false,
    canvas: document.getElementById("new-section"),
    detectAudio: false
})

hydra3.synth.noise()
.color(0.35, 0.2, 0.6)
.kaleid(4)
.out(hydra3.synth.o0);