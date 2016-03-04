(function () {

    "use strict";

    $(window).load(function () {

        var idCanvas = "cnvSaveTheDate",
            functionChain = function (fnc, args) {
                /// <summary>
                /// Once upon a time the code was REALLY ugly. Then came this function to solve the problem.
                /// It takes a 'main' function that will be called as default but, if you must, you can supply
                /// a different one as part of an object with the following structure:
                ///     {"target":youFunctionTM, "parameters":[OptionalArray]}
                /// </summary>

                var whatNext = null,
                    isFunction = function (f) {
                        return (typeof f === "function");
                    },
                    isValid = isFunction(fnc);
                if (isValid === true) {

                    var currentIndex = 0,
                        maxIndex = args.length,
                        moveNext = function () {

                            /// Are we there yet?
                            if (currentIndex >= maxIndex) {
                                if (whatNext !== null) {
                                    whatNext.call();
                                }
                                return;
                            }

                            /// Move forward into the execution chain...
                            var rawParameter = args[currentIndex],
                                currentArguments = null;

                            /// If the target function is the default one...
                            if (Array.isArray(rawParameter)) {
                                currentArguments = args[currentIndex];
                                currentArguments.push(moveNext);
                                fnc.apply(undefined, currentArguments);
                            } else {

                                /// If we need to change thinks a little
                                var target = rawParameter["target"];
                                if (isFunction(target)) {
                                    currentArguments = Array.isArray(rawParameter["parameters"]) ?
                                        rawParameter["parameters"] :
                                        [];
                                    currentArguments.push(moveNext);
                                    target.apply(undefined, currentArguments);
                                } else {
                                    throw { error: "Invalid object structure" };
                                }
                            }

                            /// Move ahead
                            currentIndex++;
                        };

                    moveNext();
                }

                return {
                    then: function (what) {
                        /// <summary>I promisse I'll call you (maybe)</summary>

                        if (isFunction(what)) {
                            if (isValid === false) {
                                what.call();
                            } else {
                                whatNext = what;
                            }
                        }
                    }
                }
            },
            canvas = document.getElementById(idCanvas),
            windowH = $(window).height(),
            windowW = $(window).width(),
            fonts = ["kranky, sans-serif",
                    "homemade-apple, sans-serif",
                    "love-ya-like-a-sister, fantasy",
                    "londrina-sketch, sans-serif",
                    "fredericka-the-great, sans-serif",
                    "cabin-sketch, sans-serif",
                    "FontAwesome"],

            /// The collor palete we'll be using
            colors = {
                red: "#FFAAAA", white: "White",
                green: "#7CBB91", yellow: "#FFF8AA",
                blue: "#6B949E", black: "gray"
            },

            canvasCtx = canvas.getContext("2d"),
            max = { x: 0, y: 0 },

            /// This will help bring some life into the writing process
            writing = new buzz.sound("writing.ogg", { preload: true, loop: false, volume: 30, autoplay: false }).load(),
            erasing = new buzz.sound("eraser.ogg", { preload: true, loop: false, volume: 200, autoplay: false }).load(),

            getRandomArbitrary = function (min, max) {
                /// <summary>Gets a pseudo-random value between 'min' and 'max'</summary>

                /// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Math/random
                return Math.random() * (max - min) + min;
            },
            clear = function (whenDone) {
                /// <summary>Clears the canvas via a simulated chalkboard eraser animation</summary>

                var timeout = window.setTimeout(function () {

                    window.clearTimeout(timeout);
                    var x = 0, y = 0;

                    erasing.setTime(getRandomArbitrary(1.9, 2));
                    (function erase() {
                        erasing.play();
                        canvasCtx.globalCompositeOperation = "destination-out";
                        canvasCtx.beginPath();

                        /// Well, cleaning chalkboards aint easy ya know... 
                        /// The pressure of the erasing hand may vary.
                        canvasCtx.globalAlpha = getRandomArbitrary(0.95, 0.99);
                        canvasCtx.fillStyle = canvasCtx.strokeStyle = "black";
                        canvasCtx.fillRect(x, y, getRandomArbitrary(210, 211), getRandomArbitrary(40, 41));
                        canvasCtx.stroke();
                        if (y < max.y) {
                            if (x >= max.x) {
                                y += getRandomArbitrary(40, 41);
                                x = 0;
                            } else {
                                x += getRandomArbitrary(210, 211);
                            }
                            requestAnimationFrame(erase);
                        } else {
                            erasing.stop();
                            if (typeof whenDone === "function") {
                                whenDone.call();
                            }
                        }
                    })();
                }, 2000);
            },
            writeText = function (txt, intFontIndex, options, whenDone) {

                var dashLen = 100,
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

                /// This helps the sound of writing onto the chalkboard get a lil random
                /// thus bringing some extra reallity fell to it
                writing.setTime(getRandomArbitrary(0.4, 5));
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
                            max.x = Math.max(max.x, textMeasurement.width + txt.length + x);
                            max.y = Math.max(max.y, parseInt(fontSize) + y);
                            writing.stop();
                            if (typeof whenDone === "function") {
                                whenDone.call();
                            }
                        }
                    }
                })();
            };

        /// Hope this is never the case...
        if (!buzz.isSupported()) {
            console.warn("Old browser is old.");
        }

        /// Full screen
        canvas.height = windowH - 20;
        canvas.width = windowW - 20;

        /// Call to start the animated text writing process 
        functionChain(writeText,
        [
            ["Amanda", 4, { x: 100, y: 190, fontSize: "180px" }],
            ["&", 5, { x: 400, y: 280, strokeStyle: colors.red, fontSize: "115px" }],
            ["Felipe", 4, { x: 140, y: 430, fontSize: "180px" }],
            ["\uf004", 6, { x: 350, y: 450, alpha: 0.4, strokeStyle: colors.red, fontSize: "390px" }],
            { "target": clear },
            ["Metade da vida", 3, { x: 150, y: 130, strokeStyle: colors.red, fontSize: "130px" }],
            ["compartilhando", 5, { x: 220, y: 215, fillStyle: colors.yellow, strokeStyle: colors.yellow, fontSize: "90px", alpha: 0.6 }],
            ["histórias", 3, { x: 185, y: 320, strokeStyle: colors.white, fontSize: "135px" }],
            { "target": clear },
            ["12 anos", 2, { x: 100, y: 170, fontSize: "195px" }],
            ["e 6 meses", 3, { x: 200, y: 300, strokeStyle: colors.blue, fontSize: "150px" }],
            ["desde o", 3, { x: 180, y: 400, strokeStyle: colors.blue, fontSize: "140px" }],
            ["PRIMEIRO", 2, { x: 200, y: 540, strokeStyle: colors.green, fontSize: "190px" }],
            ["beijo", 4, { x: 200, y: 700, strokeStyle: colors.red, fontSize: "190px" }]
        ]);
    });
})();
