import seedrandom from 'seedrandom'

export const getSequence = (playlistId, songCount) => {
    const indexes = Array.from(Array(songCount).keys())
    return shuffleSequence(indexes, playlistId, songCount)
}

// Shuffle in predictable order based on playlist ID
export const shuffleSequence = (sequence, playlistId, songCount) => {
    const rng = new seedrandom(playlistId)
    let i = sequence.length
    while (--i > 0) {
        let randIndex = (rng.int32() & 0xff) % songCount;
        [sequence[randIndex], sequence[i]] = [sequence[i], sequence[randIndex]]
    }
    return sequence
}
