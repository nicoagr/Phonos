/*
    Gets a time in seconds and returns
    a string like mm:ss
 */
function formatAsTime(seconds) {
    return Math.floor(seconds / 60) + ':' + ('0' + Math.floor(seconds % 60)).slice(-2);
}

export { formatAsTime };