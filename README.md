## Información del Alumno

- **Nombre Completo del Alumno:**  Alexander Fabrizio Rodriguez Pérez
- **Grupo:**  1°A
- **Materia:**  Fundamentos de Álgebra
Aquí tienes un **README.md limpio, formal y perfectamente adecuado para GitHub**, sin emojis, sin adornos y con formato estándar.

---

# Hill Cipher Web Encryptor

Este proyecto implementa un encriptador y desencriptador basado en el algoritmo Hill Cipher 2×2. La aplicación está desarrollada en HTML, CSS y JavaScript y permite encriptar y desencriptar mensajes utilizando una matriz clave válida en el módulo 26.
El sistema conserva el formato original del texto (mayúsculas, minúsculas, espacios y signos) y proporciona una interfaz visual moderna.

---

## 1. Descripción del Proyecto

El proyecto consiste en una aplicación web que:

* Encripta mensajes utilizando el cifrado Hill 2×2.
* Desencripta mensajes producidos con la misma matriz clave.
* Valida que la matriz sea invertible en módulo 26.
* Genera la matriz numérica del mensaje en tiempo real.
* Maneja de forma controlada el relleno (padding) con la letra "X".
* Preserva la estructura original del texto al desencriptar.
* Proporciona una interfaz oscura con detalles dorados y diseño modernizado.

La aplicación funciona completamente en el navegador y no requiere dependencias externas.

---

## 2. Instrucciones de Uso

1. Descargar o clonar el repositorio.
2. Abrir el archivo `index.html` en cualquier navegador moderno.
3. Escribir el mensaje en el campo correspondiente.
4. Ingresar los valores numéricos de la matriz clave 2×2.
5. Utilizar los botones:

   * **Encriptar**: genera la versión cifrada del texto.
   * **Desencriptar**: recupera el texto original usando la clave.
6. El resultado aparece en el panel inferior.
7. Se puede copiar el resultado mediante el botón incluido.

### Consideraciones

* Solo las letras (A–Z) participan del cifrado.
  Los demás caracteres se mantienen sin cambios.
* Si la cantidad de letras es impar, se añade automáticamente la letra **X**.
* La aplicación determina cuándo debe eliminar la X al desencriptar.
* Si el texto cifrado proviene de una fuente externa, se habilita una casilla opcional para decidir si se debe retirar la X final.

---

## 3. Matemáticas del Algoritmo

### 3.1 Representación del alfabeto

El algoritmo utiliza la correspondencia:

```
A = 0, B = 1, C = 2, …, Z = 25
```

Solo se procesan caracteres alfabéticos.

### 3.2 Vectores del mensaje

Las letras se agrupan de dos en dos formando vectores:

```
[x1]
[x2]
```

Si el número de letras es impar, se agrega la letra X como padding.

### 3.3 Matriz clave

La matriz clave ingresada por el usuario tiene la forma:

```
[a b]
[c d]
```

El determinante se calcula como:

```
det = (a*d - b*c) mod 26
```

La matriz debe tener determinante con inverso multiplicativo en módulo 26; de lo contrario no es válida.

### 3.4 Proceso de encriptación

Cada vector se encripta mediante:

```
[y1]   [a b] [x1]   mod 26
[y2] = [c d] [x2]
```

El resultado se convierte nuevamente a letras.

### 3.5 Proceso de desencriptación

Se calcula la matriz inversa en módulo 26:

```
A⁻¹ = (1/det(A)) * adj(A)   mod 26
```

donde:

```
adj(A) = [ d  -b ]
         [ -c  a ]
```

Cada par cifrado se multiplica por esta matriz inversa para recuperar las letras originales.

---

## 4. Preservación del Formato del Texto

Para mantener el texto tal como fue escrito:

* Se extraen únicamente las letras para el proceso matemático.
* Se registra la posición y si cada letra era mayúscula o minúscula.
* Tras la desencriptación, las letras recuperadas se reintegran respetando:

  * mayúsculas y minúsculas originales,
  * espacios,
  * signos de puntuación,
  * demás caracteres no alfabéticos.

Esto garantiza que el texto final tenga la misma estructura que el original.

---

## 5. Personalización Implementada

El proyecto incorpora varias mejoras tanto visuales como funcionales:

### Estilo

* Paleta oscura con acentos dorados.
* Contenedores con efecto glass, sombras suaves y bordes estilizados.
* Partículas decorativas en el fondo.
* Diseño adaptable a móviles.

### Usabilidad

* Contador dinámico de caracteres.
* Vista de la matriz del mensaje en tiempo real.
* Indicador y control manual para el manejo del padding.
* Copiado del resultado con un solo botón.
* Validaciones detalladas para errores de clave y texto.

### Lógica interna

* Manejo automático del padding al encriptar y desencriptar.
* Registro en sesión para detectar si el mensaje proviene del proceso de encriptación interno.
* Reconstrucción precisa del texto original.

---

## 6. Archivos del Proyecto

* `index.html`: interfaz principal.
* `style.css`: estilos y temas visuales.
* `script.js`: implementación del cifrado Hill y manejo del DOM.
* `README.md`: documentación del proyecto.

---

Si quieres una versión más corta o una versión más técnica para entregar a un profesor, puedo generarla también.
