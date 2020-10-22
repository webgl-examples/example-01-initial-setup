import { ShaderHelper } from './utils/shader-helper';
import { SimpleShader } from './shaders-source/simple-shader';
import { mat4 } from 'gl-matrix';

export class Main {

  private static readonly AppWidth = 640;
  private static readonly AppHeight = 480;

  private _GL: WebGLRenderingContext;

  // shader program info object
  private _shaderProgramInfo: {};
  // WebGL buffers
  private _webglBuffer: WebGLBuffer;

  constructor() {
    this.initializeWebGLContext();
    this.loadShader(this._GL);
    this.initializeWebGLBuffers(this._GL);
  }

  private initializeWebGLContext(): void {
    // Get the Canvas Element
    const canvas = document.querySelector("#webgl-canvas") as HTMLCanvasElement;

    // Initialize the GL Context
    this._GL = canvas.getContext('webgl');

    if (this._GL === null) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }
  }

  private loadShader(GL: WebGLRenderingContext): void {
    // initialize the Shader Program in GPU using the sources in: SimpleShader.ts
    const shaderProgram = ShaderHelper.initShaderProgram(
      GL, 
      SimpleShader.vertexShaderSource, 
      SimpleShader.fragmentShaderSource
    );

    // Now we need to look up the locations that WebGL assied to our inputs (the attributes and uniforms)
    this._shaderProgramInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: GL.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        projectionMatrix: GL.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: GL.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      },
    };
  }

  // This is the buffer where we store the vertices we want to show on screen
  private initializeWebGLBuffers(GL: WebGLRenderingContext): void {
    // Create a buffer for the square's positions.
    this._webglBuffer = GL.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    GL.bindBuffer(GL.ARRAY_BUFFER, this._webglBuffer);

    // Now create an array of positions for the square (vertices).
    const positions = [
      -1.0,  1.0,
      1.0,  1.0,
      -1.0, -1.0,
      1.0, -1.0,
    ];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    GL.bufferData(GL.ARRAY_BUFFER,
      new Float32Array(positions),
      GL.STATIC_DRAW);
  }

  private drawScene(GL: WebGLRenderingContext, programInfo, buffers: WebGLBuffer): void {
    GL.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    GL.clearDepth(1.0);                 // Clear everything
    GL.enable(GL.DEPTH_TEST);           // Enable depth testing
    GL.depthFunc(GL.LEQUAL);            // Near things obscure far things
  
    // Clear the canvas before we start drawing on it.
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
  
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = Main.AppWidth / Main.AppHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
  
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
  
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();
  
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(modelViewMatrix,     // destination matrix
                   modelViewMatrix,     // matrix to translate
                   [0.0, 0.0, -8.0]);  // amount to translate
  
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    const numComponents = 2;  // pull out 2 values per iteration
    const type = GL.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    GL.bindBuffer(GL.ARRAY_BUFFER, buffers);
    GL.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    GL.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
    
    // Tell WebGL to use our program when drawing
    GL.useProgram(programInfo.program);
  
    // Set the shader uniforms
    GL.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    GL.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
  
    const vertexCount = 4;
    GL.drawArrays(GL.TRIANGLE_STRIP, 0, vertexCount);
  }

  update(dt: number): void {
    this.drawScene(this._GL, this._shaderProgramInfo, this._webglBuffer);
  }
}
