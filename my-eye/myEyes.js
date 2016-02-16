
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
                               var mozaicHSize = img.height / mozaicPieces,
                                   mozaicWSize = img.width / mozaicPieces,
                                   worker = new Worker(location.protocol + "//" + location.host + "/my-eye/palletone.js"),
                                   imageData = null;

                               worker.addEventListener("message", function (event) {

                                   /// This alow us to erase all paths and work with the canvas as if it was blank for the next iteration
                                   var image = _canvasPaletteContext.getImageData(0, 0, _canvasPalette.width, _canvasPalette.height);
                                   _canvasPaletteContext.clearRect(0, 0, _canvasPalette.width, _canvasPalette.height);
                                   _canvasPaletteContext.putImageData(image, 0, 0);

                                   if (event.data === "DONE") {

                                       /// If the next iteration exists
                                       if (typeof then === "function") {
                                           then();
                                       }
                                       return;
                                   }

                                   var color = event.data.palette;
                                   _canvasPaletteContext.beginPath();
                                   _canvasPaletteContext.rect(event.data.x, event.data.y,
                                       mozaicWSize, mozaicHSize);
                                   _canvasPaletteContext.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
                                   _canvasPaletteContext.lineWidth = 1;
                                   _canvasPaletteContext.strokeStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
                                   _canvasPaletteContext.globalAlpha = 1;
                                   _canvasPaletteContext.fill();
                                   _canvasPaletteContext.stroke();

                               }, false);

                               for (var x = 0; x < img.width; x += mozaicWSize) {
                                   for (var y = 0; y < img.height; y += mozaicHSize) {
                                       worker.postMessage({
                                           x: x,
                                           y: y,
                                           imageData: canvasContext.getImageData(x, y, mozaicWSize, mozaicHSize).data
                                       });
                                   }
                               }

                               worker.postMessage("DONE");

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
                        myEyes.blinkTo(img, 100, function () {
                            myEyes.blinkTo(img, 200, function () {
                                canvas.style.display = "";
                                if (timeout !== null) {
                                    $this.clearTimeout(timeout);
                                }
                                timeout = $this.setTimeout(loadImage, 1000);
                            });
                        });
                    });
            });
        }
        loadImage();
    });

})(this, document);
