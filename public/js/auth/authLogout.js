window.onload = () => {
    let logbtn = document.getElementById('logoutBtn');
    let volver = document.getElementById('volverBtn');
    let errortxt = document.getElementById('errortxt');
    logbtn.onclick = () => {
        fetch('/auth/logout', {
            method: "POST"
        }).then(res => {
            // Check if 200, then redirect
            if (res.status !== 200) {
                res.text().then((msg) => {
                    errortxt.innerHTML = 'Ha habido un error al cerrar la sesión<br>' + msg;
                });
                return;
            }
            window.location = '/';
        })
    };
    volver.onclick = () => window.location = '/';
}