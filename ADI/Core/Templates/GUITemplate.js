/// <reference path="../../libs/JQuery/jQuery162/jquery-1.6.2.js" />
/// <reference path="OutputTemplate.js" />
/// <reference path="InputTemplate.js" />

var GUITemplate = (function () {
    var Loaded = false;
    return {
        Active: false,
        PlaceholderId: "body",
        Loaded: function (value) { if (value != undefined) { Loaded = value; } return Loaded; },
        GetPlaceholder: function (placeholder) { return $("#" + this.PlaceholderId); },
        Render: function (data) { return null; },
        LoadUsing: function (coreRef) { return null; },
        Exit: function () { return false; },
        /* No need to overrite -> */ Write: function (data, outputType) { return OutputTemplate.Write(data, outputType); },
        /* No need to overrite -> */ Read: function () { return InputTemplate.Read(); }
    }
})();