/// <reference path="../JQuery/jQuery162/jquery-1.6.2.js" />
/// <reference path="../Templates/GUITemplate.js" />
/// <reference path="../Core.js" />
/// <reference path="../Templates/OutputTemplate.js" />
/// <reference path="CoreOutput.js" />
/// <reference path="../Templates/InputTemplate.js" />
/// <reference path="CoreInput.js" />

/// Wraps a console GUI to allow user interaction with Core objects and libraries
$.extend(GUITemplate, {
    Render: function (data) { GUITemplate.Write("CoreGUI has nothing to render. Try something else or go away!", OutputType.Error); return null; },
    PlaceholderId: "Console",
    LoadUsing: function (coreRef) {
        if (!GUITemplate.Loaded()) {
            $("body").css({ "background-color": "black" }).append($("<div/>").attr({ id: GUITemplate.PlaceholderId }));
            coreRef.Requires("Implementations/CoreInput", "CORE")
                    .Requires("Implementations/CoreOutput", "CORE");
            if (!OutputTemplate.LoadOn(GUITemplate.GetPlaceholder())) { GUITemplate.Write("Impossible to load output component!"); return; }
            if (!InputTemplate.LoadOn(GUITemplate.GetPlaceholder())) { GUITemplate.Write("Impossible to load input component!"); return; }
            GUITemplate.Loaded(true);
        }
        else {
            GUITemplate.Write("CoreGUI was already loaded!", OutputType.Error);
        }
    },
    Exit: function () {
        GUITemplate.GetPlaceholder().hide();
        return true;
    }
});