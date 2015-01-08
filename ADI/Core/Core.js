/// <reference path="../libs/JQuery/jQuery162/jquery-1.6.2.js" />
/// <reference path="Enum/OutputType.js" />
/// <reference path="Templates/ExecutorTemplate.js" />
/// <reference path="Templates/GUITemplate.js" />
/// <reference path="Templates/InputTemplate.js" />
/// <reference path="Templates/OutputTemplate.js" />
/// <reference path="Implementations/CoreExecutor.js" />

(function (window) {

    var core = (function () {

        var loadedLibs = {};

        function Execute(instruction) {
            if (instruction != null) {
                if (ExecutorTemplate.Ready) {
                    return ExecutorTemplate.Execute(instruction.split(" "));
                }
                else {
                    this.Write("Core has no executor attached.", OutputType.Error);
                }
            }
            return false;
        }

        return {
            Run: function (instruction) {
                instruction = instruction == undefined ? this.Read() : instruction;
                if (!Execute(instruction)) {
                    eval(instruction);
                }
            },

            Write: function (data, outputType) {
                GUITemplate.Write(data, outputType);
                return this;
            },

            Read: function () {
                return GUITemplate.Read();
            },

            WhenReady: function (func) {
                $(window).ready(func);
                return this;
            },

            Requires: function (fileName, basePath, action) {
                if ((fileName in loadedLibs) && (loadedLibs[fileName])) {
                    alert("Lib " + fileName + " already loaded");
                }
                else {
                    loadedLibs[fileName] = true;
                    var requiredLibPath = (basePath != undefined ? basePath + "/" : "./libs/") + fileName + ".js";
                    $.ajax(requiredLibPath, {
                        async: false,
                        dataType: "script",
                        complete: function (data, status) {
                            if (action != undefined) { action(); }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            alert("Could not load " + fileName + "\nError:" + errorThrown);
                        }
                    });
                }
                return this;
            }
        };
    })();

    core.Requires("Enum/OutputType", "CORE")
        .Requires("Templates/GUITemplate", "CORE")
        .Requires("Templates/ExecutorTemplate", "CORE")
        .Requires("Templates/InputTemplate", "CORE")
        .Requires("Templates/OutputTemplate", "CORE")
        .Requires("Implementations/CoreExecutor", "CORE");

    window.Core = core;

})(window)
