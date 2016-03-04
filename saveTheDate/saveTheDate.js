(function () {

    "use strict";

    $(window).load(function () {
        var idCanvas = "cnvSaveTheDate",
            canvas = document.getElementById(idCanvas),
            windowH = $(window).height(),
            windowW = $(window).width(),
            colors = {
                red: "#FFAAAA",
                white: "White",
                green: "#7CBB91",
                yellow: "#FFF8AA",
                blue: "#6B949E",
                black: "gray"
            },
            canvasCtx = canvas.getContext("2d"),
            max = { x: 0, y: 0 },
            writing = new buzz.sound("writing.ogg", { preload: true, loop: false, volume: 100, autoplay: false }),
            erasing = new buzz.sound("eraser.ogg", { preload: true, loop: false, volume: 100, autoplay: false }),

            getRandomArbitrary = function (min, max) {
                /// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Math/random
                return Math.trunc(Math.random() * (max - min) + min);
            },
            clear = function (whenDone) {
                var x = 0,
                    y = 0,
                    maxIteractions = 100;
                erasing.setTime(2);
                (function erase() {
                    erasing.play();
                    canvasCtx.beginPath();
                    canvasCtx.clearRect(x, y, getRandomArbitrary(209, 211), getRandomArbitrary(39, 41))
                    canvasCtx.stroke();
                    if (y < max.y) {
                        if (x >= max.x) {
                            y += getRandomArbitrary(39, 41);
                            x = 0;
                        } else {
                            x += getRandomArbitrary(209, 211);
                        }
                        requestAnimationFrame(erase);
                    } else {
                        erasing.stop();
                        if (typeof whenDone === "function") {
                            whenDone.call();
                        }
                    }
                })();

            },
            writeText = function (txt, intFontIndex, options, whenDone) {

                var fonts = [
                        "kranky, sans-serif",
                        "homemade-apple, sans-serif",
                        "love-ya-like-a-sister, fantasy",
                        "londrina-sketch, sans-serif",
                        "fredericka-the-great, sans-serif",
                        "cabin-sketch, sans-serif",
                        "FontAwesome"],
                    dashLen = 100,
                    dashOffset = dashLen,
                    speed = options.speed || 7.5,
                    x = options.x || 10,
                    y = options.y || 90,
                    i = 0,
                    font = fonts[intFontIndex || 0],
                    fontSize = (options.fontSize || "80px");

                /// Reset composition to the "default" behaviour
                canvasCtx.globalCompositeOperation = "source-over";

                /// Adaptation from the code that can be found at: 
                /// http://stackoverflow.com/questions/29911143/how-can-i-animate-the-drawing-of-text-on-a-web-page/29912925#29912925
                canvasCtx.font = fontSize + " " + font;
                canvasCtx.lineWidth = 1;
                canvasCtx.lineJoin = "square";
                canvasCtx.globalAlpha = options.alpha || 0.9;

                if (options.fillStyle) {
                    canvasCtx.fillStyle = options.fillStyle;
                }
                canvasCtx.strokeStyle = options.strokeStyle || colors.white;
                writing.setTime(4);
                (function loop() {
                    writing.play();
                    var textM = canvasCtx.measureText(txt[i]);
                    canvasCtx.clearRect(x, 0, textM.width, textM.height);
                    canvasCtx.setLineDash([dashLen - dashOffset, dashOffset - speed]);
                    dashOffset -= speed;
                    canvasCtx.strokeText(txt[i], x, y);

                    if (dashOffset > 0) {
                        requestAnimationFrame(loop);
                    } else {
                        if (options.fillStyle) {
                            canvasCtx.fillText(txt[i], x, y);
                        }
                        dashOffset = dashLen;
                        x += canvasCtx.measureText(txt[i++]).width + canvasCtx.lineWidth * Math.random();
                        canvasCtx.setTransform(1, 0, 0, 1, 0, 3 * Math.random());
                        canvasCtx.rotate(Math.random() * 0.005);
                        if (i < txt.length) {
                            requestAnimationFrame(loop);
                        } else {
                            var textMeasurement = canvasCtx.measureText(txt);
                            max.x = Math.max(max.x, textMeasurement.width + (parseInt(fontSize) * txt.length));
                            max.y = Math.max(max.y, parseInt(fontSize));
                            if (typeof whenDone === "function") {
                                writing.stop();
                                whenDone.call();
                            }
                        }
                    }
                })();
            };

        if (!buzz.isSupported()) {
            console.warn("Old browser is old.")
        }

        //writeText("teste0", 0, { y: 480, x: 500 }, function () {
        //    writeText("teste1", 1, { y: 60, x: 500}, function () {
        //        writeText("teste2", 2, { y: 120, x: 500}, function () {
        //            writeText("teste3", 3, { y: 180, x: 500}, function () {
        //                writeText("teste4", 4, { y: 240, x: 500}, function(){
        //                    writeText("teste5", 5, { y: 320, x: 500});
        //                });
        //            });
        //        });
        //    });
        //});

        canvas.height = windowH - 20;
        canvas.width = windowW - 20;
        writeText("Amanda", 4, { x: 100, y: 100 },
            function () {
                writeText("&", 5, { x: 400, y: 130, strokeStyle: colors.red, fontSize: "115px" },
                    function () {
                        writeText("Felipe", 4, { x: 450, y: 180 }, function () {
                            writeText("\uf004", 6, { x: 250, y: 310, alpha: 0.4, strokeStyle: colors.red, fontSize: "340px" }, function () {
                                var timeout = window.setTimeout(function () {
                                    window.clearTimeout(timeout);
                                    clear(function () {
                                        writeText("Metade da vida", 3,
                                            { x: 150, y: 130, strokeStyle: colors.red, fontSize: "130px" },
                                            function () {
                                                writeText("\uf24e", 6, { x: 720, y: 280, strokeStyle: colors.blue, fontSize: "200px" },
                                                    function () {
                                                        writeText("compartilhando", 5,
                                                            { x: 220, y: 215, fillStyle: colors.yellow, strokeStyle: colors.yellow, fontSize: "90px", alpha: 0.6 },
                                                            function () {
                                                                writeText("histórias", 3,
                                                                { x: 185, y: 320, strokeStyle: colors.white, fontSize: "135px" },
                                                                function () {
                                                                    timeout = window.setTimeout(function () {
                                                                        clear();
                                                                    }, 1000);
                                                                });
                                                            });
                                                    });

                                            });
                                    });
                                }, 1000);
                            })
                        });
                    });
            });
    });
})();