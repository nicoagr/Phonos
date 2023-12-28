window.onload = () => {
    let usutxt = document.getElementById('usuariotxt');
    let emailtxt = document.getElementById('emailtxt');
    let passtxt = document.getElementById('passtxt');
    let errortxt = document.getElementById('errortxt');
    let logbtn = document.getElementById('registerBtn');
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
    emailtxt.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            logbtn.click();
        }
    });
    logbtn.onclick = () => {
        let usuario = {};
        usuario.user = usutxt.value;
        usuario.password = passtxt.value;
        usuario.email = emailtxt.value;
        fetch('/auth/register', {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify(usuario)
        }).then(res => {
            // Check if 200, then redirect
            if (res.status !== 200) {
                res.text().then((msg) => {
                    errortxt.innerHTML = 'Ha habido un error al registrarse!<br>' + msg;
                });
                return;
            } else {
                window.location = '/';
            }
        })
    };
}