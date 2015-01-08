/// <reference path="../JQuery/jQuery162/jquery-1.6.2.js" />
/// <reference path="../Modernizr/Modernizr2.js" />
/// <reference path="../../Core/Templates/GUITemplate.js" />
/// <reference path="../../Core/Core.js" />
/// <reference path="../Drawing/Draw.js" />

$.extend(GUITemplate, (function () {

    var exited = true;
    if (GUITemplate.Loaded()) {
        GUITemplate.Loaded(false); /// Restarts GUI state
        exited = GUITemplate.Exit(); /// Exits any active GUI
    }

    return {
        Render: function (data) {
            if (data == undefined) { GUITemplate.Write("There's nothing to render. Go try something else.", OutputType.Error); return null; }
        },
        PlaceholderId: "WinCanvas",
        LoadUsing: function (coreRef) {
            if (!GUITemplate.Loaded()) {
                if (exited) { /// If existing (if any) GUI exited successfully
                    try {

                        Core.Requires("Modernizr/Modernizr2"); /// Loads Modernizr2
                        Core.Requires("Drawing/Draw"); /// Loads the drawing lib

                        if ((Modernizr.canvas) && (Modernizr.canvastext)) {
                            GUITemplate.Loaded(true);
                        }
                        else {
                            GUITemplate.Write("Your browser doesn't support this GUI");
                        }
                    }
                    catch (e) {
                        GUITemplate.Write("Error while loading WinGUI: " + e.Message, OutputType.Error);
                    }
                }
                else {
                    GUITemplate.Write("Impossible to exit current GUI!", OutputType.Error);
                }
            }
            else {
                GUITemplate.Write("WinGUI was already loaded!", OutputType.Error);
            }
        },
        Exit: function () { return false; }
    };
})());