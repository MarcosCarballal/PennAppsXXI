from spleeter.separator import Separator
from spleeter.audio.adapter import get_default_audio_adapter
from pysndfx import AudioEffectsChain
from librosa import load
from pydub import AudioSegment
import os

def process_sound_file(infile, outpath):

    # Using embedded configuration.
    separator = Separator('spleeter:2stems')

    inpath = infile[:infile.index('/')]
    inname = infile[infile.index('/') + 1:infile.index('.')]

    separator.separate_to_file(infile, outpath)

    vocals, sr = load(os.path.join(os.path.join(outpath, inname), "vocals.wav"), sr=44100)

    fx = (
        AudioEffectsChain()
        .highshelf()
        .lowpass(200)
    # #     .compand()
    #     .reverb()
        .tremolo(2, depth=50)
        .overdrive(gain=50, colour=100)
    #      .lowpass(250)
    #      .pitch(-250)
        .compand(threshold=-40, db_from=-40, db_to=-40)
    #      .phaser()
        #.delay()
        .lowshelf()
    #     .concatanate(kazoo)
    )

    # Apply the effects to a ndarray and store the resulting audio to disk.
    fx(vocals, os.path.join(outpath, 'vocals.mp3'))

    # Reload the files as AudioSegments
    sound1 = AudioSegment.from_mp3(os.path.join(outpath, 'vocals.mp3')) + 2 # Amplifies vocals
    sound2 = AudioSegment.from_mp3(os.path.join(os.path.join(outpath, inname), "accompaniment.wav"))

    # mix sound2 with sound1, starting at 5000ms into sound1)
    output = sound1.overlay(sound2, position=0)

    # save the result
    output.export(os.path.join(outpath, inname + "_mix.mp3"), format="mp3")

    del(output)
    del(separator)
    del(vocals)
    del(sound1)
    del(sound2)


for filename in os.listdir("audio"):
    if (filename[0] == '.'):
        continue

    print("Starting " + filename)
    
    process_sound_file(os.path.join("audio", filename), "mixed")

    print("Finished " + filename)