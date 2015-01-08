
var InputTemplate = {
    Loaded: false,
    LoadOn: function (placeholder) { return false; },
    Read: function () { return prompt("Enter a value"); }
}