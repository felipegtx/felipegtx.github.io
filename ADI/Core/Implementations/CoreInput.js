/// <reference path="../../libs/JQuery/jQuery162/jquery-1.6.2.js" />
/// <reference path="../Templates/InputTemplate.js" />

$.extend(InputTemplate, {
    HolderId: "input",
    Holder: null,
    DefaultValue: "",
    LoadOn: function (placeholder) {
        this.Holder = $("#" + this.HolderId);
        if (this.Holder.length == 0) {
            placeholder
                    .append($("<a/>").css("color", "white").text(">"))
                    .append(
                        $("<input />")
                        .attr({ type: "text", id: this.HolderId, value: this.DefaultValue, defaultValue: this.DefaultValue })
                        .css("color", "silver").css("width", "300px").css("border", "none").css("background-color", "black")
                        .keypress(function () {
                            if (event.which == 13) {
                                Core.Run(Core.Read());
                                event.preventDefault();
                            }
                        })
                        .focus(function (obj) {
                            if ($(this).val().trim() == $(this).attr("defaultValue")) {
                                $(obj.srcElement).val("")
                            }
                        })
                        .blur(function (obj) {
                            if ($(this).val().trim() == "") {
                                $(this).val($(this).attr("defaultValue"));
                            }
                        })
                    );
            this.Holder = $("#" + this.HolderId); /// Binds to default
        }
        this.Holder.focus();
        return true;
    },
    Read: function (data) {
        var valor = this.Holder.val();
        this.Holder.val("");
        return valor;
    }
});