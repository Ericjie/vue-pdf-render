import PDFJS from "PDFJS";

export default {
  bind: (el, binding) => {
    el.innerHTML = '<i class="el-icon-loading pdf-loading" style="font-size: 30px;"></i>';
    el.style.fontSize = 0
    let scale = binding.value.scale;
    PDFJS.getDocument(binding.value.url).then(pdf => {
      let pdfCount = pdf.numPages
      let promises = new Array(pdfCount).fill('').map((item, i) => {
        let canvas = document.createElement('canvas')
        canvas.classList.add('pdf-' + (i + 1))
        return canvas
      })
      promises.forEach((canvas,i) => {
        pdf.getPage(i + 1).then(function(page) {
          let viewport = page.getViewport(scale);
          let context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          let renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          page.render(renderContext);
        });
      })
      Promise.all(promises).then(res => {
        el.innerHTML = ''
        res.forEach(canvas => el.appendChild(canvas))
      })
    })
  },
  // update: (el, binding) => {
  //   el.innerHTML = '<i class="el-icon-loading pdf-loading" style="font-size: 30px;"></i>';
  //   el.style.fontSize = 0
  //   let scale = binding.value.scale;
  //   PDFJS.getDocument(binding.value.url).then(pdf => {
  //     let pdfCount = pdf.numPages
  //     let promises = new Array(pdfCount).fill('').map((item, i) => {
  //       let canvas = document.createElement('canvas')
  //       canvas.classList.add('pdf-' + (i + 1))
  //       return canvas
  //     })
  //     promises.forEach((canvas,i) => {
  //       pdf.getPage(i + 1).then(function(page) {
  //         let viewport = page.getViewport(scale);
  //         let context = canvas.getContext("2d");
  //         canvas.height = viewport.height;
  //         canvas.width = viewport.width;
  //         let renderContext = {
  //           canvasContext: context,
  //           viewport: viewport
  //         };
  //         page.render(renderContext);
  //       });
  //     })
  //     Promise.all(promises).then(res => {
  //       el.innerHTML = ''
  //       res.forEach(canvas => el.appendChild(canvas))
  //     })
  //   })
  // },
}