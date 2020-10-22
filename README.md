This is a simple example of a WebGL canvas in HTML5 rendering a simple square, what are we looking here:

1. Initializing the WebGL Context in the function: "initializeWebGLContext".
2. Loading and compiling a Shader in the function: "loadShader" and using the shader-helper.ts file.
3. Initialize a WebGL Buffer for storing the vertices of the Square in the function: "initializeWebGLBuffers".
4. Finally we have the function "drawScene" is where basically all the magic is done to render on screen.

Tips:
1. If you want to change the size of the canvas, must go to: "dist/index.html" and change the "canvas" element width and height property. Then must change the AppWidth and AppHeight static properties in main.ts file.
2. The current color shown on the square is defined in the vertex shader in the file: simple-shader.ts and then on: "gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);" you have to change the RGBA normalized values.

Credits and documentation in:
https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context