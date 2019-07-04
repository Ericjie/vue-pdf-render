/**
 * Created by GreedyJay on 2018/10/23.
 */
/**
 * Created by GF on 2018/1/3.
 */
(function($){
    $.fn.showPdf = function(only_first_page){
        var _this = this,
            all_show_flag = false;
        // only_first_page = only_first_page || true;
        only_first_page = only_first_page || false;
        function getBorderSection(imgData, width, height) {
            var len = imgData.length,
                border_section = [0, height - 1];
            for(var j = 0 ; j < len; j+=4){
                if((imgData[j] !== 255 || imgData[j+1] !== 255 || imgData[j+2] !== 255) && imgData[j+3] > 0){
                    border_section[0] = Math.floor(j/(width << 2))
                }
            }
            for(var k = len - 1; k > 0; k-=4){
                if((imgData[k-1] !== 255 || imgData[k-2] !== 255 || imgData[k-3] !== 255) && imgData[k] > 0){
                    border_section[1] = Math.floor(j/(width << 2))
                }
            }
            return border_section
        }
        var tools = {
                debounce: function(idle, action){
                    var last;
                    return function(){
                        clearTimeout(last);
                        last = setTimeout(function(){
                            action();
                        }, idle)
                    }
                },
                clipWhiteSpace: function(canvas){
                    var originHeight = canvas.height;
                    var originWidth = canvas.width;
                    var originContext = canvas.getContext('2d');
                    var img_data = originContext.getImageData(0, 0, canvas.width, canvas.height).data;

                    var up_index = getBorderSection(img_data, originWidth, originHeight)[0],
                        down_index = getBorderSection(img_data, originWidth, originHeight)[1];
                    // console.log(up_index,down_index,'new');
                    var new_data = originContext.getImageData(0, up_index - 1, canvas.width, down_index - up_index + 3);
                    // canvas.height = sh + 4;
                    canvas.height = down_index - up_index + 4;
                    originContext.putImageData(new_data, 0, 0);
                },
                drawImage: function(canvas, callback, url, url2){
                    if((!url && !url2) || !canvas){
                        callback(canvas);
                    }else{
                        var imgObj = new Image();
                        imgObj.crossOrigin = '';
                        imgObj.onload = function(){
                            var ctx = canvas.getContext('2d');
                            ctx.drawImage(this, 0, 0, canvas.width, imgObj.height);
                            if(url2){
                                tools.drawImage(canvas, callback, url2);
                            }else{
                                callback(canvas);
                            }
                        };
                        imgObj.src = url || url2;
                    }
                },
                getPdf: function(url, canvas, only_first_page, callback){
                    var answers = [];
                    var corrects = [];
                    if(arguments[4]){
                        answers = arguments[4].split('|');
                    }
                    if(arguments[5]){
                        corrects = arguments[5].split('|')
                    }
                    PDFJS.getDocument(url)
                        .then(function(pdf) {
                            var len = only_first_page ? 1 : Math.max(pdf.numPages, answers.length, corrects.length);
                            var cur = $(canvas).parent();
                            for (var i = 0; i < len-1; i++){
                                var newCanvas = document.createElement('canvas');
                                cur.append(newCanvas);
                            }
                            for (var i = 0; i < len; i++) {
                                (function(i){
                                    if(i<pdf.numPages){
                                        pdf.getPage(i+1).then(function(page){
                                            var scale = 1;
                                            var viewport = page.getViewport(scale);
                                            var renderContext;
                                            var context;
                                            if(i === 0){
                                                context = canvas.getContext('2d');
                                                canvas.height = viewport.height;
                                                canvas.width = viewport.width;
                                                // Prepare object needed by render method
                                                renderContext = {
                                                    canvasContext: context,
                                                    viewport: viewport
                                                };
                                            }else{
                                                var thisCanvas = $(_this).find('canvas').get(i);
                                                context = thisCanvas.getContext('2d');
                                                thisCanvas.height = viewport.height;
                                                thisCanvas.width = viewport.width;
                                                renderContext = {
                                                    canvasContext: context,
                                                    viewport: viewport
                                                };
                                            }
                                            page.render(renderContext)
                                                .then(function(){
                                                    // scale the blank parts
                                                    // var canvas = document.getElementById(id);
                                                    tools.drawImage($(_this).find('canvas').get(i), function(c){
                                                        callback(c);
                                                    },answers[i], corrects[i]);
                                                });
                                        });
                                    }else{
                                        var thisCanvas = $(_this).find('canvas').get(i);
                                        thisCanvas.height = 920;
                                        thisCanvas.width = 960;
                                        tools.drawImage(thisCanvas, function(c){
                                            callback(c);
                                        },answers[i], corrects[i]);
                                    }

                                })(i);
                            }

                        }, function(){});
                }
            },
            main = {
                init: function(){
                    $(_this).each(function(){
                        var $this = $(this);
                        main.main_handler($this);
                    });
                },
                is_show: function(cur_node){
                    var scrollH = $(window).scrollTop(),
                        winH = $(window).height(),
                        top = cur_node.offset().top;
                    return top < winH + scrollH;
                },
                is_need_request: function(cur_node){
                    return !cur_node.find('canvas').is(':show');
                },
                main_handler: function(cur_node){
                    cur_node.attr('data-url') && tools.getPdf(cur_node.attr('data-url'), cur_node.find('canvas').get(0), only_first_page, function(c){
                        tools.clipWhiteSpace(c);
                        cur_node.find('.content-spinner').remove().end().find('canvas').show();
                    },cur_node.attr('data-student-url'), cur_node.attr('data-teacher-url'));
                }
            };
        main.init();
    }
})(jQuery);