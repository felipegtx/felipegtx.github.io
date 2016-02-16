
(function ($this, d) {

    "use strict";

    $this.addEventListener("load", function () {

        if (!$this.Worker) {
            alert("Woops, your browser does not support this app :(");
        }

        var currentImageIndex = 0,
            images = ["ela.JPG", "ela1.JPG"],
            canvas = d.querySelector("#cnvImages"),
            timeout = null,
            canvasContext = canvas.getContext("2d"),
            myEyes = (function () {

                var _canvasPalette = d.querySelector("#cnvPalette"),
                    _canvasPaletteContext = _canvasPalette.getContext("2d"),
                       _this = {
                           /**
                            * Blinks for a moment to try undestand what we're seeing
                            */
                           blinkTo: function (img, mozaicPieces, then) {

                               mozaicPieces = mozaicPieces || 5;
                               var mozaicHSize = Math.trunc(img.height / mozaicPieces),
                                   mozaicWSize = Math.trunc(img.width / mozaicPieces),
                                   worker = new Worker(location.protocol + "//" + location.host + "/my-eye/palletone.js"),
                                   imageData = null;

                               worker.addEventListener("message", function (event) {

                                   if (event.data === "DONE") {

                                       /// If the next iteration exists
                                       if (typeof then === "function") {
                                           then();
                                       }
                                       return;
                                   }

                                   var color = event.data.palette;
                                   _canvasPaletteContext.beginPath();
                                   _canvasPaletteContext.lineWidth = mozaicWSize;
                                   _canvasPaletteContext.strokeStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
                                   _canvasPaletteContext.lineJoin = _canvasPaletteContext.lineCap = 'square';
                                   _canvasPaletteContext.moveTo(event.data.x, event.data.y);
                                   _canvasPaletteContext.lineTo(event.data.x, event.data.y + 1);
                                   _canvasPaletteContext.stroke();
                                   _canvasPaletteContext.closePath();

                               }, false);

                               var x = 0, y = 0;
                               function requestChain() {
                                   if (x <= img.width) {
                                       if (y > img.height) {
                                           x += mozaicWSize;
                                           y = 0;
                                       }
                                       y += mozaicHSize;
                                       worker.postMessage({
                                           x: x,
                                           y: y,
                                           imageData: canvasContext.getImageData(x, y, mozaicWSize, mozaicHSize).data
                                       });
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
            canvas.style.display = "none";
            loadImageOntoCanvas(images[currentImageIndex++], function (img) {
                myEyes
                    .blinkTo(img, 10, function () {
                        myEyes.blinkTo(img, 25, function () {
                            myEyes.blinkTo(img, 50, function () {
                                myEyes.blinkTo(img, 100, function () {
                                    canvas.style.display = "";
                                    if (timeout !== null) {
                                        $this.clearTimeout(timeout);
                                    }
                                    timeout = $this.setTimeout(loadImage, 1000);
                                });
                            });
                        });
                    });
            });
        }
        loadImage();
    });

})(this, document);