import shuffle from 'lodash/shuffle';
import { useEffect, useRef } from 'react';
import backgroundMusicConfig from '../../../data/audio/background_music.json';
import useTick from '../hook/useTick';
import { useSelector } from '../shim/redux';

function BackgroundMusic() {
  const album = useSelector((state) => state.backgroundMusic);

  useEffect(() => {
    if (!album) {
      return;
    }
    nextSongInMsRef.current = __DEV__ ? 0 : 60000;
  }, [album]);

  const playlistRef = useRef(initialPlaylist);
  const nextSongInMsRef = useRef(Infinity);
  useTick((deltaMs: number) => {
    if (!album) {
      return;
    }

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
    album?.volume(volume);
  }, [album, volume]);

  return null;
}

const initialPlaylist: Playlist = ['eating_cake', 'peaceful_piano_amplified', 'all_alone'];

type Playlist = readonly AvailableSong[];

type AvailableSong = keyof typeof backgroundMusicConfig.sprite;

function updatePlaylist(playlist: Playlist): Playlist {
  if (playlist.length === 1) {
    return shuffle(initialPlaylist.filter((song) => song !== playlist[0]));
  }
  return initialPlaylist.slice(1);
}

export default BackgroundMusic;
