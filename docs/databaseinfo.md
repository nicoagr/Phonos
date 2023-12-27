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
  "users": [
    {
      "user": "nico",
      "hash": "hhhh",
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
      "token": "jjjjj",
      "authtype": "google",
      "audios": [
        {
          "id": "lllll",
          "data": "mmm"
        },
        {
          "id": "xxxx",
          "data": "yyyy"
        }
      ]
    }
  ]
}
```