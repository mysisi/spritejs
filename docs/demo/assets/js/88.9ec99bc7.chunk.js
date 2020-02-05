(window.webpackJsonp=window.webpackJsonp||[]).push([[88],{592:function(n,e,t){"use strict";t.r(e),e.default="const vertex = /* glsl */ `\n    precision highp float;\n    precision highp int;\n\n    attribute vec3 position;\n    attribute vec3 normal;\n    attribute vec2 uv;\n    attribute vec4 skinIndex;\n    attribute vec4 skinWeight;\n\n    uniform mat3 normalMatrix;\n    uniform mat4 modelMatrix;\n    uniform mat4 modelViewMatrix;\n    uniform mat4 projectionMatrix;\n\n    uniform sampler2D boneTexture;\n    uniform int boneTextureSize;\n\n    mat4 getBoneMatrix(const in float i) {\n        float j = i * 4.0;\n        float x = mod(j, float(boneTextureSize));\n        float y = floor(j / float(boneTextureSize));\n\n        float dx = 1.0 / float(boneTextureSize);\n        float dy = 1.0 / float(boneTextureSize);\n\n        y = dy * (y + 0.5);\n\n        vec4 v1 = texture2D(boneTexture, vec2(dx * (x + 0.5), y));\n        vec4 v2 = texture2D(boneTexture, vec2(dx * (x + 1.5), y));\n        vec4 v3 = texture2D(boneTexture, vec2(dx * (x + 2.5), y));\n        vec4 v4 = texture2D(boneTexture, vec2(dx * (x + 3.5), y));\n\n        return mat4(v1, v2, v3, v4);\n    }\n\n    varying vec2 vUv;\n    varying vec3 vNormal;\n\n    void main() {\n        vUv = uv;\n        vNormal = normalize(normalMatrix * normal);\n\n        mat4 boneMatX = getBoneMatrix(skinIndex.x);\n        mat4 boneMatY = getBoneMatrix(skinIndex.y);\n        mat4 boneMatZ = getBoneMatrix(skinIndex.z);\n        mat4 boneMatW = getBoneMatrix(skinIndex.w);\n\n        // update normal\n        mat4 skinMatrix = mat4(0.0);\n        skinMatrix += skinWeight.x * boneMatX;\n        skinMatrix += skinWeight.y * boneMatY;\n        skinMatrix += skinWeight.z * boneMatZ;\n        skinMatrix += skinWeight.w * boneMatW;\n        vNormal = vec4(skinMatrix * vec4(vNormal, 0.0)).xyz;\n\n        // Update position\n        vec4 bindPos = vec4(position, 1.0);\n        vec4 transformed = vec4(0.0);\n        transformed += boneMatX * bindPos * skinWeight.x;\n        transformed += boneMatY * bindPos * skinWeight.y;\n        transformed += boneMatZ * bindPos * skinWeight.z;\n        transformed += boneMatW * bindPos * skinWeight.w;\n        vec3 pos = transformed.xyz;\n\n        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\n    }\n`;\n\nconst fragment = /* glsl */ `\n    precision highp float;\n    precision highp int;\n\n    uniform sampler2D tMap;\n\n    varying vec2 vUv;\n    varying vec3 vNormal;\n\n    void main() {\n        vec3 tex = texture2D(tMap, vUv).rgb;\n\n        vec3 normal = normalize(vNormal);\n        vec3 light = vec3(0.0, 1.0, 0.0);\n        float shading = min(0.0, dot(normal, light) * 0.2);\n\n        gl_FragColor.rgb = tex + shading;\n        gl_FragColor.a = 1.0;\n    }\n`;\n\nconst shadowVertex = /* glsl */ `\n    precision highp float;\n\n    attribute vec2 uv;\n    attribute vec3 position;\n\n    uniform mat4 modelViewMatrix;\n    uniform mat4 projectionMatrix;\n\n    varying vec2 vUv;\n\n    void main() {\n        vUv = uv;\n        \n        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    }\n`;\n\nconst shadowFragment = /* glsl */ `\n    precision highp float;\n\n    uniform sampler2D tMap;\n\n    varying vec2 vUv;\n\n    void main() {\n        float shadow = texture2D(tMap, vUv).g;\n        \n        gl_FragColor.rgb = vec3(0.0);\n        gl_FragColor.a = shadow;\n    }\n`;\n\nconst {Scene} = spritejs;\nconst {Skin, Plane} = spritejs.ext3d;\nconst container = document.getElementById('container');\nconst scene = new Scene({\n  container,\n  displayRatio: 2,\n});\nconst layer = scene.layer3d('fglayer', {\n  alpha: false,\n  camera: {\n    fov: 35,\n  },\n});\n\nlayer.camera.attributes.pos = [6, 2, 6];\n\n(async function () {\n  const animationData = await (await fetch('https://s2.ssl.qhres.com/static/2042f56d104bd374.json')).json();\n  const texture = layer.createTexture('https://p3.ssl.qhimg.com/d/inn/ae57767c6b58/snout.jpg');\n  const program = layer.createProgram({\n    vertex,\n    fragment,\n    texture,\n  });\n  const model = layer.loadModel('https://s3.ssl.qhres.com/static/e9139173907776d5.json');\n  const skin = new Skin(program, {model});\n  skin.attr({\n    y: -1,\n    scale: 0.01,\n  });\n\n  const shadowTexture = layer.createTexture('https://p1.ssl.qhimg.com/d/inn/8dd37178a756/snout-shadow.jpg');\n  const shadowProgram = layer.createProgram({\n    vertex: shadowVertex,\n    fragment: shadowFragment,\n    texture: shadowTexture,\n    transparent: true,\n    cullFace: false,\n  });\n  const plan = new Plane(shadowProgram, {width: 7, height: 7});\n  plan.attr({\n    rotateX: -90,\n    y: -1,\n  });\n  layer.append(plan);\n\n  const animation = skin.addAnimationFrames(animationData);\n\n  layer.append(skin);\n  layer.setOrbit();\n  layer.tick(() => {\n    animation.elapsed += 0.1;\n  });\n}());"}}]);