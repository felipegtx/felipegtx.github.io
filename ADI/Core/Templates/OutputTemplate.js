
var OutputTemplate = {
    Loaded: false,
    LoadOn: function (placeholder) { return false; },
    Write: function (data, outputType) { alert("" + " - " + data); }
}