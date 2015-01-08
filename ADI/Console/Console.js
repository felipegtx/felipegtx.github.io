/// <reference path="../libs/JQuery/jQuery162/jquery-1.6.2.js" />
/// <reference path="../Core/Core.js" />
/// <reference path="../libs/IO/TexboxInput.js" />

(function (core) {
    core.WhenReady(function () {
        core.Requires("Implementations/CoreGUI", "CORE")
        GUITemplate.LoadUsing(core);
        core.Write("Console loaded...");
    });
})(window.Core);
