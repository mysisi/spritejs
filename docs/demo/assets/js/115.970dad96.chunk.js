(window.webpackJsonp=window.webpackJsonp||[]).push([[115],{621:function(n,t,e){"use strict";e.r(t),t.default="const formEl = document.createElement('form');\nformEl.id = 'moveToForm';\nformEl.style.position = 'absolute';\nformEl.style.top = '22%';\nformEl.style.zIndex = '99999';\nconst inputEl = document.createElement('input');\ninputEl.id = 'moveToText';\ninputEl.style.width = '260px';\ninputEl.placeholder = '\u8f93\u5165\u8981\u8fdb\u5165\u7684\u5730\u533a\u540d\u6216ID';\nformEl.appendChild(inputEl);\nconst submitBtn = document.createElement('button');\nsubmitBtn.type = 'submit';\nsubmitBtn.id = 'moveToBtn';\nsubmitBtn.innerHTML = '\u786e\u8ba4';\nformEl.appendChild(submitBtn);\nconst container = document.getElementById('stage');\ncontainer.appendChild(formEl);\n\n/* globals d3,mapRelation,Animator */\nconst {Scene} = spritejs;\n\n(async function () {\n  const scene = new Scene({\n    container,\n    width: 900,\n    height: 500,\n    mode: 'stickyWidth',\n  });\n\n  const worldLayer = scene.layer('world-layer', {\n    handleEvent: false,\n  });\n\n  function mapTransform(layer, matrix) {\n    layer.attributes.transform = matrix;\n  }\n\n  const MapLoader = {\n    cache: {},\n    load(mapId) {\n      worldLayer.attributes.transform = [1, 0, 0, 1, 0, 0];\n      const cached = this.cache[mapId];\n      if(cached) {\n        return Promise.resolve(cached);\n      }\n\n      const mapPath = `https://spritejs.org/res/mapData/${mapId}.json`;\n      return new Promise((resolve, reject) => {\n        d3.json(mapPath, (err, data) => {\n          if(err) {\n            reject(err);\n            return;\n          }\n          data.id = String(mapId);\n          this.cache[mapId] = data;\n          resolve(data);\n        });\n      });\n    },\n  };\n\n  function sleep(ms) {\n    return new Promise((resolve) => {\n      setTimeout(resolve, ms);\n    });\n  }\n\n  const ChinaMapID = 1;\n\n  class World {\n    constructor(layer) {\n      this.layer = layer;\n      this.transitionMap = {};\n    }\n\n    async load(mapId) {\n      const parentId = mapRelation[mapId].parentId;\n\n      this.mapId = mapId;\n      this.parentId = parentId;\n\n      const map = await MapLoader.load(mapId);\n\n      let baseScale = 1;\n\n      const srcSize = mapRelation[mapId].size;\n\n      if(mapId !== ChinaMapID) {\n        // \u76f8\u5bf9\u4e8e\u4e2d\u56fd\u5730\u56fe\u7f29\u653e\n        const desSize = mapRelation[ChinaMapID].size;\n\n        baseScale = Math.min(desSize[0] / srcSize[0], desSize[1] / srcSize[1]);\n      }\n      this.baseScale = baseScale;\n\n      this.map = map;\n\n      if(!map.cp) {\n        map.cp = mapRelation[mapId].boxCP;\n      }\n\n      this.metaData = {\n        [mapId]: {id: mapId, name: mapRelation[mapId].name, cp: map.cp, size: srcSize},\n      };\n\n      map.features.forEach((feature) => {\n        let {id, name, cp} = feature.properties;\n        if(!cp) {\n          cp = mapRelation[id].boxCP;\n        }\n        this.metaData[id] = {id, name, cp, size: mapRelation[id].size};\n      });\n\n      await this.draw();\n    }\n\n    async draw() {\n      const layer = this.layer;\n      const {width, height} = layer.getResolution();\n\n      const projection = d3.geoMercator()\n        .center(this.metaData[this.mapId].cp)\n        .translate([width / 2, height / 2])\n        .scale(this.baseScale * width / 2);\n\n      this.projection = projection;\n\n      const path = d3.geoPath().projection(projection);\n\n      let parentId = this.parentId;\n      const parents = new Set();\n\n      while(parentId != null) {\n        parents.add(parentId);\n        parentId = mapRelation[parentId] && mapRelation[parentId].parentId;\n      }\n\n      let superMaps = await Promise.all([...parents].reverse().map(parentId => MapLoader.load(parentId)));\n      superMaps = superMaps.reduce((features, map) => features.concat(map.features), []);\n\n      const features = [...superMaps, ...this.map.features];\n\n      // \u628a\u4e0d\u5728\u663e\u793a\u533a\u9644\u8fd1\u7684\u5730\u56fe\u7ed9\u8fc7\u6ee4\u6389\n      const filted = features.filter((feature) => {\n        const [topLeft, rightBottom] = path.bounds(feature);\n        const size = [rightBottom[0] - topLeft[0], rightBottom[1] - topLeft[1]];\n        const mapCenter = [width / 2, height / 2];\n        const regionCenter = path.centroid(feature);\n\n        return Math.abs(regionCenter[0] - mapCenter[0]) <= (size[0] + width) / 2\n        && Math.abs(regionCenter[1] - mapCenter[1]) <= (size[1] + height) / 2;\n      });\n\n      const mapId = this.mapId;\n\n      layer.removeAllChildren();\n\n      d3.select(layer).selectAll('path')\n        .data(filted)\n        .enter()\n        .append('path')\n        .attr('d', path)\n        .attr('strokeColor', '#00c2ff')\n        .select(function (data) {\n          const parentMeta = mapRelation[data.properties.id];\n\n          if(parentMeta && String(mapId) === String(parentMeta.parentId)) {\n            // this.attr('lineWidth', 3)\n            this.attr('zIndex', 10);\n            this.attr('fillColor', 'transparent');\n          } else {\n            this.attr('strokeColor', 'rgba(0,0,0,0.2)');\n            this.attr('fillColor', '#2f3644');\n          }\n          this.id = data.properties.id;\n          this.name = data.properties.name;\n          return this;\n        })\n        .exit();\n\n      this.layer = layer;\n    }\n\n    getPath(destId) {\n      const leave = [];\n      const enter = [];\n      let srcId = this.mapId;\n\n      while(String(mapRelation[destId].parentId) !== '0') {\n        enter.unshift(destId);\n        destId = mapRelation[destId].parentId;\n      }\n      while(String(mapRelation[srcId].parentId) !== '0') {\n        leave.push(srcId);\n        srcId = mapRelation[srcId].parentId;\n      }\n\n      while(enter[0] === leave[leave.length - 1]) {\n        enter.shift();\n        leave.pop();\n      }\n\n      return {leave, enter};\n    }\n\n    async moveTo(id) {\n      if(String(id) !== String(this.mapId)) {\n        const {leave, enter} = this.getPath(id); // \u83b7\u53d6\u8df3\u8f6c\u8def\u5f84\n        /* eslint-disable no-console */\n        console.log(leave, enter);\n        /* eslint-enable no-console */\n        /* eslint-disable no-await-in-loop */\n        /* eslint-disable no-restricted-syntax */\n        for(const step of leave) {\n          await this.leave(step);\n          await sleep(500);\n        }\n        for(const step of enter) {\n          await this.enter(step);\n          await sleep(500);\n        }\n        /* eslint-enable no-restricted-syntax */\n        /* eslint-enable no-await-in-loop */\n      }\n    }\n\n    async enter(subId, duration = 1000) {\n      const mapId = mapRelation[subId].parentId;\n      if(!mapId) return;\n\n      if(String(mapId) !== String(this.mapId)) {\n        await this.load(mapId);\n      }\n\n      const layer = this.layer;\n\n      d3.select(layer).selectAll('path')\n        .attr('fillColor', '#2f3644')\n        .attr('lineWidth', 1)\n        .attr('strokeColor', 'rgba(0, 0, 0, 0.3)')\n        .attr('zIndex', 0);\n\n      d3.select(layer)\n        .select(`#${subId}`)\n        // .attr('fillColor', 'white')\n        .attr('strokeColor', 'rgba(0, 0, 0, 0.3)')\n        .attr('lineWidth', 1)\n        .attr('zIndex', 100);\n\n      let desMatrix = this.transitionMap[subId];\n\n      if(!desMatrix) {\n        const subMeta = this.metaData[subId];\n\n        const pos = this.projection(subMeta.cp);\n\n        const desSize = mapRelation[ChinaMapID].size;\n        const scale = Math.min(\n          desSize[0] / subMeta.size[0],\n          desSize[1] / subMeta.size[1]\n        ) / this.baseScale;\n\n        const translate = this.projection.translate();\n\n        desMatrix = [scale, 0, 0, scale,\n          translate[0] - pos[0] * scale,\n          translate[1] - pos[1] * scale];\n\n        this.transitionMap[subId] = desMatrix;\n      }\n\n      const animator = new Animator(duration, (p) => {\n        const matrix = [\n          1 + (desMatrix[0] - 1) * p, 0, 0,\n          1 + (desMatrix[3] - 1) * p,\n          desMatrix[4] * p,\n          desMatrix[5] * p,\n        ];\n\n        mapTransform(layer, matrix);\n      });\n\n      await animator.animate();\n      await sleep(10);\n      await this.load(subId);\n    }\n\n    async leave(subId, duration = 1000) {\n      const parentId = this.parentId;\n      if(!parentId) return;\n\n      await this.load(parentId);\n\n      const layer = this.layer;\n\n      d3.select(layer).selectAll('path')\n        .attr('strokeColor', 'rgba(0, 0, 0, 0.3)')\n        .attr('lineWidth', 1)\n        .attr('zIndex', 0);\n\n      const matrix = this.transitionMap[subId];\n\n      if(matrix) {\n        const animator = new Animator(duration, (p) => {\n          const m = [\n            matrix[0] + (1 - matrix[0]) * p, 0, 0,\n            matrix[3] + (1 - matrix[3]) * p,\n            matrix[4] * (1 - p),\n            matrix[5] * (1 - p),\n          ];\n\n          mapTransform(layer, m);\n        });\n\n        await animator.animate();\n      }\n\n      await sleep(10);\n      await this.load(parentId);\n    }\n  }\n\n  function findId(idOrName) {\n    return new Promise((resolve) => {\n      if(mapRelation[idOrName]) {\n        resolve(idOrName);\n      } else {\n        Object.entries(mapRelation).forEach(([id, value]) => {\n          if(value.name.startsWith(idOrName)) {\n            resolve(id);\n          }\n        });\n      }\n    });\n  }\n\n  const moveToForm = document.getElementById('moveToForm'),\n    moveToText = document.getElementById('moveToText');\n\n  const world = new World(worldLayer);\n  await world.load(1);\n  window.world = world;\n\n  moveToForm.onsubmit = function (evt) {\n    const value = moveToText.value || 1;\n    findId(value).then((id) => {\n      world.moveTo(id);\n    });\n    evt.preventDefault();\n  };\n}());"}}]);