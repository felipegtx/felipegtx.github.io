(function () {

    "use strict";

    $(window).load(function () {
        var idCanvas = "cnvSaveTheDate",
            canvas = document.getElementById(idCanvas),
            windowH = $(window).height(),
            windowW = $(window).width(),
            canvasCtx = canvas.getContext("2d"),
            max = { x: 0, y: 0 },
            getRandomArbitrary = function (min, max) {
                /// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Math/random
                return Math.random() * (max - min) + min;
            },
            clear = function (whenDone) {
                var iteraction = 0,
                    maxIteractions = 150;

                (function erase() {
                    canvasCtx.globalCompositeOperation = "destination-out";
                    canvasCtx.beginPath();
                    canvasCtx.strokeStyle = "black";
                    canvasCtx.lineWidth = 25;
                    canvasCtx.globalAlpha = 1;
                    canvasCtx.moveTo(getRandomArbitrary(0, max.x), getRandomArbitrary(0, max.y));
                    canvasCtx.lineTo(getRandomArbitrary(0, max.x), getRandomArbitrary(0, max.y));
                    canvasCtx.stroke();

                    if (++iteraction < maxIteractions) {
                        requestAnimationFrame(erase);
                    } else {
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
                    speed = options.speed || 5,
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
                canvasCtx.lineJoin = "round";
                canvasCtx.globalAlpha = options.alpha || 0.5;
                canvasCtx.fillStyle = options.fillStyle || "silver";
                canvasCtx.strokeStyle = options.strokeStyle || "white";
                (function loop() {
                    var textM = canvasCtx.measureText(txt[i]);
                    canvasCtx.clearRect(x, 0, textM.width, textM.height);
                    canvasCtx.setLineDash([dashLen - dashOffset, dashOffset - speed]);
                    dashOffset -= speed;
                    canvasCtx.strokeText(txt[i], x, y);

                    if (dashOffset > 0) {
                        requestAnimationFrame(loop);
                    } else {
                        canvasCtx.fillText(txt[i], x, y);
                        dashOffset = dashLen;
                        x += canvasCtx.measureText(txt[i++]).width + canvasCtx.lineWidth * Math.random();
                        canvasCtx.setTransform(1, 0, 0, 1, 0, 3 * Math.random());
                        canvasCtx.rotate(Math.random() * 0.005);
                        if (i < txt.length) {
                            requestAnimationFrame(loop);
                        } else {
                            var textMeasurement = canvasCtx.measureText(txt);
                            max.x = Math.max(max.x, textMeasurement.width + (parseInt(fontSize) * txt.length));
                            max.y = Math.max(max.y, (parseInt(fontSize) * txt.length));
                            if (typeof whenDone === "function") {
                                whenDone.call();
                            }
                        }
                    }
                })();
            };
        canvas.height = windowH - 20;
        canvas.width = windowW - 20;
        writeText("Amanda", 4, { x: 100, y: 100 },
            function () {
                writeText("&", 5, { x: 400, y: 130, strokeStyle: "red", fillStyle: "red", fontSize: "115px" },
                    function () {
                        writeText("Felipe", 4, { x: 450, y: 180 }, function () {
                            var timeout = window.setTimeout(function () {
                                window.clearTimeout(timeout);
                                clear();
                            }, 1000);
                        });
                    });
            });
    });
})();