export const getRandomPlayer = (allPlayers, playedPlayers) => {
    
    if(allPlayers.length === Object.keys(playedPlayers).length){
        return null;
    }
    const playingPlayer = allPlayers.filter((player) => !playedPlayers[player.playerId]);
    const noOfPlayers = playingPlayer.length;
    const playerIndex = Math.floor(Math.random() * noOfPlayers)
    return playingPlayer[playerIndex];
}