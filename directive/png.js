import PDFJS from "PDFJS";

export default {
  bind: (el, binding) => {
    el.innerHTML = '';
    el.style.fontSize = 0
    let scale = binding.value.scale;
    PDFJS.getDocument(binding.value.url).then(pdf => {
      let pdfCount = pdf.numPages
      let promises = new Array(pdfCount).fill('').map((item, i) => {
        let canvas = document.createElement('canvas')
        canvas.classList.add('pdf-' + (i + 1))
        return canvas
      })
      promises.forEach((canvas, i) => {
        pdf.getPage(i + 1).then(function (page) {
          console.log(canvas, i)
          let stuAnswerUrl = binding.value.stuUrlArr && binding.value.stuUrlArr.length ? binding.value.stuUrlArr[i] : '';
          let teacherCrtUrl = binding.value.crtUrlArr && binding.value.crtUrlArr.length ? binding.value.crtUrlArr[i] : '';
          let viewport = page.getViewport(scale);
          let context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          let renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          page.render(renderContext).then(() => {
            if (stuAnswerUrl.length != 0) {
              let stuAnswer = new Image();
              stuAnswer.src = stuAnswerUrl;
              stuAnswer.onload = function () {
                context.drawImage(stuAnswer, 0, 0);
              }
            }
            if (teacherCrtUrl.length != 0) {
              let teacherCrt = new Image();
              teacherCrt.src = teacherCrtUrl;
              teacherCrt.onload = function () {
                context.drawImage(teacherCrt, 0, 0, 920, 960);
              }
            }
          });
        });
      })
      Promise.all(promises).then(res => {
        el.innerHTML = ''
        res.forEach(canvas => el.appendChild(canvas))
      })
    })
  },
}

//1、引入
//import png from "../../derectives/png.js"  

//2、注册
// directives:{
//   png
// },

//3、使用
//作为自定义命令使用（具体使用示例可参考mission模块下的CeshiPdf.vue）组件
//<div id="pdfBox" v-png="{url,scale,stuUrlArr,crtUrlArr}"></div>  //使用v-if（url==》pdf路径 ；scale==》放大倍数 ；stuUrlArr==》学生作答轨迹png图片数组 ；crtUrlArr==》老师批改轨迹png图片数组）

