function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            let raw = reader.result;
            let base64 = raw.replace(/^data:.+;base64,/, '');
            resolve(base64);
        }
        reader.readAsDataURL(blob);
    });
}

export { blobToBase64 };