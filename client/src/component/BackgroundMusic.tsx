import { Howl } from 'howler';
import * as _ from 'lodash';
import { useEffect, useRef } from 'react';
import backgroundMusicConfig from '../../../data/audio/background_music.json';
import useTick from '../hook/useTick';
import getFileStorageUrl from '../shim/backend/getFileStorageUrl';
import { useSelector } from '../shim/redux';
import { addLoadingTask } from './Loading';

function BackgroundMusic() {
  useEffect(() => {
    nextSongInMsRef.current = __DEV__ ? 0 : 60000;
  }, []);

  const playlistRef = useRef(initialPlaylist);
  const nextSongInMsRef = useRef(Infinity);
  useTick((deltaMs: number) => {
    nextSongInMsRef.current -= deltaMs;
    if (nextSongInMsRef.current > 0) {
      return;
    }
    nextSongInMsRef.current = Infinity;

    const currentSong = playlistRef.current[0];
    album.play(currentSong);

    album.once('end', () => {
      playlistRef.current = updatePlaylist(playlistRef.current);
      nextSongInMsRef.current = (Math.random() + 1.5) * 60000;
    });
  });

  const volume = useSelector((state) => state.volume);
  useEffect(() => {
    album.volume(volume);
  }, [volume]);

  return null;
}

const initialPlaylist: Playlist = ['eating_cake', 'peaceful_piano_amplified', 'all_alone'];

type Playlist = readonly AvailableSong[];

type AvailableSong = keyof typeof backgroundMusicConfig.sprite;

function updatePlaylist(playlist: Playlist): Playlist {
  if (playlist.length === 1) {
    return _.shuffle(initialPlaylist.filter((song) => song !== playlist[0]));
  }
  return initialPlaylist.slice(1);
}

let album: Howl;

addLoadingTask(
  _.constant(
    new Promise((resolve, reject) => {
      album = new Howl({
        src: [
          getFileStorageUrl('/audio/background_music.mp3'),
          getFileStorageUrl('/audio/background_music.ogg'),
          getFileStorageUrl('/audio/background_music.m4a'),
          getFileStorageUrl('/audio/background_music.ac3'),
        ],
        sprite: backgroundMusicConfig.sprite as any,
        onload: () => {
          resolve();
        },
        onloaderror: (id, error) => {
          reject(new TypeError(`Failed to load background music. Error: ${error}`));
        },
      });
    })
  )
);

export default BackgroundMusic;
