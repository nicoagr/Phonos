# Información BD
### Base de Datos:
phonos
### Colección: users
### String de conexión (local)
URL: 
```
mongodb://127.0.0.1:27017/phonos
```
Código en NodeJS - MongoJS:
```
const db = mongojs('mongodb://127.0.0.1:27017/phonos', ['users']);
```
### Datos estructurados de forma:
```
{
  "user": "nico",
  "hash": "$2b$10$4/MgvZeItZwLsfGnRGWjmuCjuU/jAB5ANLQwsTMMH1PSUiCWGZGni",
  "mail": "nico@prueba.com",
  "authtype": "native",
  "audios": [
	{
	  "id": "iiii",
	  "data": "dddd"
	},
	{
	  "id": "ooooo",
	  "data": "uuuuu"
	}
  ]
},
{
  "user": "martin",
  "token": "$2b$10$INsmzBYhdoNr1gCU3q850.rdceqL6rqGf7vHUJKb4NNnRh2RDpK9K",
  "mail": "martin@prueba.com",
  "authtype": "native",
  "audios": []
},
{
  "user": "asier",
  "token": "$2b$10$TcpjBD3H7MUuZ9f0KRcaMOn7KwZYN6BItyPw3b43jnEy43sh.q/je",
  "mail": "asier@prueba.com",
  "authtype": "native",
  "audios": []
},
{
  "user": "abraham",
  "token": "$2b$10$MAftMPWj3H7alhxJ82u8W.gGAVRGT8qL3s44GtHOY/SFk8XWPCGt.",
  "mail": "abraham@prueba.com",
  "authtype": "native",
  "audios": []
}
```
Consulta Fetch para hacer un login:
```
fetch('auth/login', {"method":"POST","headers":{"Content-type": "application/json"}, "body":'{"user":"nico","password":"nico"}'});
```