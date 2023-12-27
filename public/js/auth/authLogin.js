window.onload = () => {
    let usutxt = document.getElementById('usuariotxt');
    let passtxt = document.getElementById('passtxt');
    let errortxt = document.getElementById('errortxt');
    let logbtn = document.getElementById('loginBtn');
    usutxt.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            logbtn.click();
        }
    });
    passtxt.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            logbtn.click();
        }
    });
    logbtn.onclick = () => {
        let usuario = {};
        usuario.user = usutxt.value;
        usuario.password = passtxt.value;
        fetch('/auth/login', {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify(usuario)
        }).then(res => {
            // Check if 200, then redirect
            if (res.status !== 200) {
                res.text().then((msg) => {
                    errortxt.innerHTML = 'Ha habido un error al iniciar sesión!<br>' + msg;
                });
                return;
            }
            window.location = '/';
        })
    };
}