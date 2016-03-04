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

                var whatNext = [],
                    isFunction = function (f) {
                        return (typeof f === "function");
                    },
                    isValid = isFunction(fnc),
                    $this = {
                        then: function (what) {
                            /// <summary>I promisse I'll call you (maybe)</summary>

                            if (isFunction(what)) {
                                if (isValid === false) {
                                    requestAnimationFrame(what);
                                } else {
                                    whatNext.push(what);
                                }
                            }

                            return $this;
                        }
                    };

                if (isValid === true) {

                    var currentIndex = 0,
                        maxIndex = args.length,
                        moveNext = function () {

                            /// Are we there yet?
                            if (currentIndex >= maxIndex) {
                                for (var i = 0; i < whatNext.length; i++) {
                                    whatNext[i].call();
                                }
                                return;
                            }

                            /// Move forward into the execution chain...
                            var rawParameter = args[currentIndex++];

                            /// If the target function is the default one...
                            if (Array.isArray(rawParameter)) {
                                rawParameter.push(moveNext);
                                fnc.apply(undefined, rawParameter);
                            } else {

                                /// If we need to change thinks a little
                                var target = rawParameter["target"];
                                if (isFunction(target)) {
                                    var currentArguments = Array.isArray(rawParameter["parameters"])
                                        ? rawParameter["parameters"]
                                        : [];
                                    currentArguments.push(moveNext);
                                    target.apply(undefined, currentArguments);
                                } else {
                                    throw { error: "Invalid object structure" };
                                }
                            }
                        };

                    moveNext();
                }

                return $this;
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
                    "FontAwesome",/// 6
                    "'Amatic SC', cursive",
                    "'Rock Salt', cursive",
                    "'Pinyon Script', cursive",
                    "'Nothing You Could Do', cursive",
                    "'Homemade Apple', cursive",
                    "'Reenie Beanie', cursive", // 12
                    "'Sacramento', cursive",
                    "'Waiting for the Sunrise', cursive",
                    "'Petit Formal Script', cursive"
            ],

            /// The collor palete we'll be using
            colors = {
                red: "#FFAAAA", white: "White",
                green: "#7CBB91", yellow: "#FFF8AA",
                blue: "#6B949E", black: "gray",
                orange: "#FFD5AA"
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

            loadImage = function (imgSrc, options, whenDone) {
                /// <summary>Loads a given image into the canvas</summary>
                var image = new Image();
                image.onload = function () {
                    var x = options.x || 0,
                        y = options.y || 0,
                        h = options.h || image.height,
                        w = options.h || image.width;

                    canvasCtx.globalCompositeOperation = "lighter";
                    canvasCtx.globalAlpha = options.alpha || 0.35;
                    canvasCtx.drawImage(this, x, y, w, h);

                    max.x = Math.max(max.x, x + w);
                    max.y = Math.max(max.y, y + h);

                    if (typeof whenDone === "function") {
                        requestAnimationFrame(whenDone);
                    }
                };
                image.src = imgSrc;
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
                        /// The pressure of the hand may vary.
                        canvasCtx.globalAlpha = getRandomArbitrary(0.95, 0.99);
                        canvasCtx.fillStyle = canvasCtx.strokeStyle = "black";
                        canvasCtx.fillRect(x, y, getRandomArbitrary(210, 211), getRandomArbitrary(40, 41));
                        canvasCtx.stroke();
                        if (y <= (max.y + 41)) {
                            if (x >= max.x) {
                                y += getRandomArbitrary(40, 41);
                                x = 0;
                            } else {
                                x += getRandomArbitrary(210, 211);
                            }
                            requestAnimationFrame(erase);
                        } else {
                            erasing.stop();
                            console.log("done");
                            if (typeof whenDone === "function") {
                                requestAnimationFrame(whenDone);
                            }
                        }
                    })();
                }, 2000);
            },

            writeText = function (txt, intFontIndex, options, whenDone) {
                /// <summary>Writes the text into the canvas with an animated efect</summary>

                var dashLen = 100,
                    dashOffset = dashLen,
                    speed = options.speed || 7.5,
                    x = options.x || 10,
                    y = options.y || 90,
                    i = 0,
                    font = fonts[intFontIndex || 0],
                    fontSize = (options.fontSize || "80px"),
                    intFontSize = parseInt(fontSize),
                    defaultAlpha = options.alpha || 0.9;

                /// Reset composition to the "default" behaviour
                canvasCtx.globalCompositeOperation = "source-over";

                /// Adaptation from the code that can be found at: 
                /// http://stackoverflow.com/questions/29911143/how-can-i-animate-the-drawing-of-text-on-a-web-page/29912925#29912925
                canvasCtx.font = fontSize + " " + font;
                canvasCtx.lineWidth = options.lineWidth || 1;
                canvasCtx.lineJoin = "round";

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

                    canvasCtx.globalAlpha = getRandomArbitrary(defaultAlpha - 0.3, defaultAlpha + 0.1);
                    canvasCtx.clearRect(x, 0, textM.width, fontSize);
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
                        if (i < txt.length) {
                            requestAnimationFrame(loop);
                        } else {
                            var textMeasurement = canvasCtx.measureText(txt);
                            max.x = Math.max(max.x, textMeasurement.width + txt.length + x);
                            max.y = Math.max(max.y, intFontSize + y);
                            writing.stop();
                            if (typeof whenDone === "function") {
                                requestAnimationFrame(whenDone);
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
        canvas.height = windowH;
        canvas.width = windowW;

        /// Call to start the animated text writing process 
        functionChain(writeText,
        [
            ///* Intro*/
            ["\uf004", 6, { x: 250, y: 400, alpha: 0.1, lineWidth: 3, strokeStyle: colors.red, fontSize: "390px" }],
            ["Amanda", 4, { x: 100, y: 190, fontSize: "180px" }],
            ["&", 5, { x: 400, y: 280, strokeStyle: colors.red, fontSize: "115px" }],
            ["Felipe", 4, { x: 170, y: 430, fontSize: "180px" }],
            { "target": clear },

            /* Metade da vida dividindo histórias*/
            ["Metade da", 3, { x: 100, y: 160, strokeStyle: colors.red, fontSize: "180px" }],
            ["vida", 3, { x: 110, y: 340, strokeStyle: colors.red, fontSize: "200px" }],
            ["compartilhando", 7, { x: 450, y: 325, fillStyle: colors.yellow, strokeStyle: colors.yellow, fontSize: "90px", alpha: 0.6 }],
             {
                 "target": function (whenDone) {
                     loadImage("sharing.png", { x: 90, y: 405 }, function () {
                         var timeout = window.setTimeout(function () {
                             window.clearTimeout(timeout);
                             requestAnimationFrame(whenDone);
                         }, 700);
                     });
                 }
             },
            ["Histórias", 12, { x: 135, y: 550, fillStyle: colors.white, fontSize: "250px", alpha: 0.7 }],
            { "target": clear },

            /* 12 anos e 6 meses desde que ele consegui o primeiro beijo*/
            ["12 anos", 7, { x: 100, y: 200, fillStyle: colors.white, strokeStyle: colors.black, alpha: 0.97, fontSize: "220px" }],
            ["e 6 meses", 7, { x: 130, y: 320, strokeStyle: colors.blue, fontSize: "130px" }],
            ["desde o", 7, { x: 200, y: 430, strokeStyle: colors.blue, fontSize: "140px" }],
            ["primeiro", 3, { x: 90, y: 550, fillStyle: colors.green, strokeStyle: colors.black, fontSize: "200px" }],
            ["beijo", 4, { x: 200, y: 700, strokeStyle: colors.red, fontSize: "190px" }],
            {
                "target": function (whenDone) {
                    loadImage("kiss.png", { x: 550, y: 450, w: 300, h: 300 }, whenDone);
                }
            },
            { "target": clear },

            /* 6 anos e 6 meses dividindo a escova de dente */
            ["6", 2, { x: 50, y: 300, fontSize: "420px" }],
            ["ANOS", 3, { x: 220, y: 180, strokeStyle: colors.blue, fontSize: "165px" }],
            ["e", 3, { x: 550, y: 180, strokeStyle: colors.red, fontSize: "140px" }],
            ["6", 2, { x: 50, y: 300, strokeStyle: colors.red, fontSize: "420px" }],
            ["6", 2, { x: 50, y: 300, strokeStyle: colors.green, fontSize: "420px" }],
            ["6", 2, { x: 50, y: 300, strokeStyle: colors.blue, fontSize: "420px" }],
            ["6", 2, { x: 50, y: 300, strokeStyle: colors.yellow, fontSize: "420px" }],
            ["6", 2, { x: 50, y: 300, strokeStyle: colors.black, fontSize: "420px" }],
            ["6", 2, { x: 50, y: 300, strokeStyle: colors.white, fontSize: "420px" }],
            ["meses", 4, { x: 250, y: 280, strokeStyle: colors.white, fontSize: "165px" }],
            ["dividindo", 5, { x: 150, y: 380, strokeStyle: colors.green, fontSize: "100px" }],
            ["a", 4, { x: 70, y: 480, strokeStyle: colors.yellow, alpha: 0.5, fontSize: "170px" }],
            ["escova de", 4, { x: 190, y: 470, alpha: 0.5, strokeStyle: colors.white, fontSize: "100px" }],
            ["dente", 4, { x: 240, y: 570, alpha: 0.5, strokeStyle: colors.white, fontSize: "100px" }],
            {
                "target": function (whenDone) {
                    loadImage("teeth.png", { x: 520, y: 490, alpha: 1 }, whenDone);
                }
            },
            { "target": clear },

            /*3 anos e 6 meses desde que ela disse sim*/
            ["3 anos", 7, { x: 200, y: 170, strokeStyle: colors.black, fillStyle: colors.green, fontSize: "165px" }],
            ["e", 14, { x: 540, y: 185, strokeStyle: colors.black, fillStyle: colors.red, fontSize: "180px" }],
            ["6", 3, { x: 0, y: 340, fillStyle: colors.white, strokeStyle: colors.black, fontSize: "370px" }],
            ["meses", 4, { x: 210, y: 310, strokeStyle: colors.white, fontSize: "205px" }],
            ["desde que", 7, { x: 190, y: 400, fillStyle: colors.blue, strokeStyle: colors.black, fontSize: "110px" }],
            ["ela", 7, { x: 490, y: 450, fillStyle: colors.yellow, fontSize: "165px" }],
            ["disse", 7, { x: 50, y: 550, fillStyle: colors.yellow, fontSize: "165px" }],
            ["SIM!", 2, { x: 270, y: 690, fillStyle: colors.orange, strokeStyle: colors.red, fontSize: "350px" }],
            {
                "target": function (whenDone) {
                    loadImage("fireworks.png", { x: 10, y: 450 }, whenDone);
                }
            },
            { "target": clear },

            /*em 6 meses irão se casar*/
            ["em", 9, { x: 330, y: 180, fillStyle: colors.white, strokeStyle: colors.black, fontSize: "165px" }],
            ["6", 15, { x: 10, y: 400, fillStyle: colors.white, strokeStyle: colors.black, alpha: 1, fontSize: "420px" }],
            ["meses", 15, { x: 340, y: 320, fillStyle: colors.blue, strokeStyle: colors.black, alpha: 1, fontSize: "165px" }],
            ["irão se casar", 5, { x: 290, y: 410, alpha: 0.5, strokeStyle: colors.yellow, fontSize: "100px" }],
            {
                "target": function (whenDone) {
                    loadImage("marry.png", { x: 10, y: 350, alpha: 1 }, whenDone);
                }
            },
            { "target": clear },

            /*Save the date - 24/09/2016*/
            ["Save", 5, { x: 90, y: 180, strokeStyle: colors.white, fontSize: "165px" }],
            ["\uf0c7", 6, { x: 40, y: 340, strokeStyle: colors.white, alpha: 1, fontSize: "165px" }],
            ["the date!", 5, { x: 190, y: 280, strokeStyle: colors.white, fontSize: "165px" }],
            ["anote na agenda", 3, { x: 230, y: 350, strokeStyle: colors.red, fontSize: "90px" }],
            ["24/09/16", 4, { x: 30, y: 550, alpha: 0.5, strokeStyle: colors.yellow, fontSize: "200px" }]
        ])
        .then(function () {
            $("#" + idCanvas).click(
                function () {
                    window.open("https://www.google.com/calendar/render?action=" +
                        "TEMPLATE&text=Casamento - Amanda e Felipe&dates=20160924T120000Z/20160925T120000Z", "googleCalendar");
                });
        })
        .then(function partyDisk() {
            functionChain(writeText, [
                    ["\uf0c7", 6, { x: 40, y: 340, strokeStyle: colors.green, alpha: 1, fontSize: "165px" }],
                    ["\uf0c7", 6, { x: 40, y: 340, strokeStyle: colors.yellow, alpha: 1, fontSize: "165px" }],
                    ["\uf0c7", 6, { x: 40, y: 340, strokeStyle: colors.red, alpha: 1, fontSize: "165px" }],
                    ["\uf0c7", 6, { x: 40, y: 340, strokeStyle: colors.black, alpha: 1, fontSize: "165px" }],
                    ["\uf0c7", 6, { x: 40, y: 340, strokeStyle: colors.blue, alpha: 1, fontSize: "165px" }]
            ]).then(function () {
                requestAnimationFrame(partyDisk);
            });

        });
    });
})();
