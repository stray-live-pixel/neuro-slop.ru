# Background music

Put background music files for the game in this folder.

The game auto-detects files named:

- `track-01.mp3`
- `track-02.mp3`
- `track-03.mp3`

and so on, up to `track-20`, with one of these extensions: `mp3`, `ogg`, `webm`, `wav`, `m4a`.

For custom names, edit `playlist.json` and list files in playback order:

```json
{
  "tracks": ["forest.mp3", "battle.ogg"]
}
```

