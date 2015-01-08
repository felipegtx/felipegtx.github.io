/// <reference path="../../libs/JQuery/jQuery162/jquery-1.6.2.js" />
/// <reference path="../Templates/OutputTemplate.js" />
/// <reference path="../Enum/OutputType.js" />

$.extend(OutputTemplate, {
    Loaded: false,
    HolderId: "#Out",
    HolderObj: null,
    LoadOn: function (placeholder) {
        if (!this.Loaded) {
            placeholder.append(
                            $("<div></div>")
                            .attr({ id: "Out" })
                            .css("font-face", "Arial, Tahoma").css("font-size", "8pt").css("color", "white")
                            .css("overflow-x", "auto").css("height", "100px")
                        );
            this.HolderObj = $(this.HolderId);
            this.Loaded = true;
        }
        return this.Loaded;
    },
    Write: function (data, outputType) {

        if (!this.Loaded) { this.Load(); }

        if ((outputType == undefined) || (outputType == OutputType.Info)) {
            this.HolderObj.html("<p>" + data + "</p>" + this.HolderObj.html());
        }
        else if (outputType == OutputType.Error) {
            this.HolderObj.html("<p style='color:red; font-decoration:bold'> ERROR: " + data + "</p>" + this.HolderObj.html());
        }
        else {
            alert("The output type [" + outputType + "] is invalid!");
        }

    }
});