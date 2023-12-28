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
        fetch('/auth/register/step1', {
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
                fire2step();
            }
        })
    };
}

fire2step = () => {
    let step2 = document.getElementById('2step');
    let step1 = document.getElementById('1step');
    step2.classList.add('primary');
    step1.remove();
    step2.innerHTML= '    <p id="apptitle">Registro - Verificación</p>\n' +
        '    <hr>\n' +
        '    <p>Introduce el código que se ha mandado al correo electrónico introducido previamente.</p>\n' +
        '    <input type="password" class="inputtxt" id="codtxt" placeholder="123456" required="required" />\n' +
        '    <button style="margin-top:15px;" class="boton" id="finishBtn">Completar Registro</button>\n' +
        '    <p id="errortxt" class="rojo"></p>\n' +
        '    <hr>\n' +
        '    <small><a href="/">Cancelar Proceso</a></small>';
    let codtxt = document.getElementById('codtxt');
    let errortxt = document.getElementById('errortxt');
    let finishBtn = document.getElementById('finishBtn');
    codtxt.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            finishBtn.click();
        }
    });
    finishBtn.onclick = () => {
            let usuario = {};
            usuario.user = usutxt.value;
            usuario.password = passtxt.value;
            usuario.email = emailtxt.value;
            usuario.code = codtxt.value;
            fetch('/auth/register/step2', {
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
                    window.location.href = '/';
                }
            })
        };

}