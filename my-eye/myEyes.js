
(function ($this, d) {

    "use strict";

    $this.addEventListener("load", function () {

        if (!$this.Worker) {
            alert("Woops, your browser does not support this app :(");
        }

        var currentImageIndex = 0,
            images = ["ela.JPG", "minden_52.jpg"],
            canvas = d.querySelector("#cnvImages"),
            timeout = null,
            canvasContext = canvas.getContext("2d"),
            myEyes = (function () {

                var _canvasPalette = d.querySelector("#cnvPalette"),
                    _canvasPaletteContext = _canvasPalette.getContext("2d"),
                    _text = null,
                    _this = {

                        setText: function (strText) {
                            _text = strText;
                            return _this;
                        },
                           
                        /**
                         * Blinks for a moment to try undestand what we're seeing
                         */
                        blinkTo: function (img, mozaicPieces, then) {

                            mozaicPieces = mozaicPieces || 5;
                            var mozaicHSize = Math.trunc(img.height / mozaicPieces),
                                mozaicWSize = Math.trunc(img.width / mozaicPieces),
                                worker = new Worker(location.protocol + "//" + location.host + "/my-eye/palletone.js");

                            worker.addEventListener("message", function (event) {

                                if (event.data === "DONE") {

                                    _text = null;
                                    /// If the next iteration exists
                                    if (typeof then === "function") {
                                        then();
                                    }
                                    return;
                                }

                                var color = event.data.palette;
                                _canvasPaletteContext.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
                                _canvasPaletteContext.fillRect(event.data.x, event.data.y, mozaicWSize, mozaicHSize);

                                _canvasPaletteContext.lineWidth = 3;
                                _canvasPaletteContext.lineJoin = "round";
                                _canvasPaletteContext.fillStyle = "white";
                                _canvasPaletteContext.font = "25px Kaushan Script";
                                _canvasPaletteContext.strokeStyle = "black";
                                if (_text !== null) {
                                    _canvasPaletteContext.font = "50px Kaushan Script";
                                    _canvasPaletteContext.strokeText(_text, 100, 215);
                                    _canvasPaletteContext.fillText(_text, 100, 215);
                                } else {

                                    _canvasPaletteContext.strokeText("Pixel por pixel", 480, 415);
                                    _canvasPaletteContext.fillText("Pixel por pixel", 480, 415);
                                    _canvasPaletteContext.font = "55px Kaushan Script";
                                    _canvasPaletteContext.strokeStyle = "black";
                                    _canvasPaletteContext.strokeText("Sempre linda!", 430, 460);
                                    _canvasPaletteContext.fillText("Sempre linda!", 430, 460);
                                    _canvasPaletteContext.font = "25px Kaushan Script";
                                    _canvasPaletteContext.strokeStyle = "black";
                                    _canvasPaletteContext.strokeText("Feliz Aniversário", 510, 500);
                                    _canvasPaletteContext.fillText("Feliz Aniversário", 510, 500);
                                }

                            }, false);

                            var x = 0, y = 0;
                            function requestChain() {
                                if (y <= img.height) {
                                    if (x > img.width) {
                                        y += mozaicHSize;
                                        x = 0;
                                    }
                                    worker.postMessage({
                                        x: x,
                                        y: y,
                                        imageData: canvasContext.getImageData(x, y, mozaicWSize, mozaicHSize).data
                                    });
                                    x += mozaicWSize;
                                    $this.requestAnimationFrame(requestChain);
                                }
                                else {
                                    worker.postMessage("DONE");
                                }
                            }

                            /// This implementation frees the main thread by using the request animation frame to schedule new
                            /// pixel color information
                            requestChain();

                            return _this;
                        }
                    };

                return _this;
            })();

        /**
         * Loads a given image onto the base canvas
         * @param string pathToImage Path to the image being loaded
         * @param function onImageLoaded What to do when the image is fully loaded
         */
        function loadImageOntoCanvas(pathToImage, onImageLoaded) {
            var imageObj = new Image();
            imageObj.onload = function () {
                canvasContext.drawImage(this, 0, 0);
                onImageLoaded(this);
            };
            imageObj.src = pathToImage;
        }

        /*
         * Loads one of the selected images into the canvas and waits until the beauty
         * is fully visible before starting over again (until the end of times)
         */
        function loadImage() {
            if (currentImageIndex >= images.length) {
                currentImageIndex = 0;
            }
            loadImageOntoCanvas(images[currentImageIndex++], function (img) {
                if (currentImageIndex === 2) {
                    myEyes.setText("E o seu presente...");
                } 
                myEyes
                    .blinkTo(img, 10, function () {
                        if (currentImageIndex === 2) {
                            myEyes.setText("E o seu presente...");
                        }
                        myEyes.blinkTo(img, 50, function () {
                            canvas.style.display = "";
                            var currentOpacity = 0.1;
                            canvas.style.opacity = currentOpacity;
                            function fadeIn() {
                                if (timeout !== null) {
                                    $this.clearTimeout(timeout);
                                }
                                if (currentOpacity <= 1) {
                                    canvas.style.opacity = (currentOpacity += 0.1);
                                    timeout = $this.setTimeout(fadeIn, 100);
                                } else {
                                    timeout = $this.setTimeout(fadeOut, 500);
                                }
                            }

                            function fadeOut() {
                                if (timeout !== null) {
                                    $this.clearTimeout(timeout);
                                }
                                if (currentOpacity >= 0) {
                                    canvas.style.opacity = (currentOpacity -= 0.1);
                                    timeout = $this.setTimeout(fadeOut, 100);
                                } else {
                                    loadImage();
                                }
                            }

                            fadeIn();
                        });
                    });
            });
        }
        loadImage();
    });

})(this, document);
