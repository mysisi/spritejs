(window.webpackJsonp=window.webpackJsonp||[]).push([[235],{743:function(n,e,t){"use strict";t.r(e),e.default="const {Scene, Sprite} = spritejs;\nconst container = document.getElementById('stage');\nconst scene = new Scene({\n  container,\n  width: 960,\n  height: 540,\n  displayRatio: 2,\n});\n\nconst layer = scene.layer('fglayer');\n\nconst s = new Sprite('https://p1.ssl.qhimg.com/t01ea011242c0a2ea2c.jpg');\nlayer.append(s);\n\n// https://zhuanlan.zhihu.com/p/38767820\nconst fragment = `precision mediump float;\n  varying vec3 vTextureCoord;\n  uniform sampler2D u_texSampler;\n  uniform float u_aspect;\n  uniform vec2 u_center;\n  uniform float speed;\n  uniform float u_time;\n\n  void main() {\n    vec2 tc = vTextureCoord.xy;\n    vec2 p = (tc - u_center);\n    p.x = p.x * u_aspect;\n    float len = length(p);\n    float amp = 1.0;\n    float waves = 5.0;\n    float radius = 0.2;\n    float waves_factor = waves * len / radius;\n    float current_progress = 0.005 * u_time;\n\n    float band = 3.0;\n    float wave_width = band * radius;\n    float current_radius = radius * current_progress;\n    float cut_factor = clamp(wave_width - abs(current_radius - len), 0.0, 1.0);\n    vec2 uv_offset = (p / len) * cos((waves_factor - current_progress) * 3.14) * cut_factor;\n\n    vec4 wave_image = texture2D(u_texSampler, fract(tc + uv_offset));\n    vec4 origin_image = texture2D(u_texSampler, tc);\n    gl_FragColor = mix(wave_image, origin_image, len);\n  }\n`;\n\nconst {width, height} = layer.getResolution();\nconst aspect = width / height;\n\nlayer.addPass({fragment,\n  uniforms: {\n    u_aspect: aspect,\n    u_center: [0.5, 0.5],\n    u_time: 0,\n  }});\n\nconst passMesh = layer.pass[0];\nlayer.tick((t) => {\n  passMesh.setUniforms({\n    u_time: t % 3000,\n  });\n});\n\nsetInterval(() => {\n  passMesh.setUniforms({u_center: [Math.random(), Math.random()]});\n}, 3000);"}}]);