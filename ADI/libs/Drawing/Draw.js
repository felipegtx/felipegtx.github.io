/// <reference path="../JQuery/jQuery162/jquery-1.6.2.js" />
/// <reference path="Enum/EventType.js" />

var Draw = (function () {

    Core.Requires("Drawing/Enum/LineJoinType");
    Core.Requires("Drawing/Enum/EventType");

    $("body")
        .css({ "background-color": "", "width": "100%", "height": "100%", "margin": "0px" })
        .append(
            $("<canvas/>")
            .css({ "border": "1px dotted" })
            .attr({ id: GUITemplate.PlaceholderId })
            .text("Your browser doesn't support this GUI")
         );

    var Degrees = {
        D0: 0,
        D90: Math.PI / 2,
        D180: Math.PI,
        D360: Math.PI * 2
    }

    var DEFAULT_CLOCKWISE_ORIENTATION = false;
    var DEFAULT_RADIUS = 50;
    var DEFAULT_STROKE_STYLE = "#eee";
    var DEFAULT_FILL_STYLE = "#eee";
    var DEFAULT_START_ANGLE = Degrees.D0; /* Starts on Zero */
    var DEFAULT_END_ANGLE = Degrees.D360; /* Draws a full circle*/
    var DEFAULT_FONT_DATA = "bold 12px sans-serif";
    var DEFAULT_TEXT_BASELINE = "top";
    var DEFAULT_BLUR_VALUE = 10;
    var DEFAULT_SHADOW_COLOR = "rgba(255, 0, 0, 0.5)";

    var canvas = GUITemplate.GetPlaceholder().get(0);
    var GetRadians = function (degrees) { return degrees * (Math.PI / 180); }

    var ID_nr = 0;
    var GetID = function () { return ++ID_nr; };

    return {
        OnClick: function (action) {
            canvas.addEventListener("click", action, false);
            return this;
        },
        TwoD: (function () {

            var context = canvas.getContext("2d");
            context.canvas.width = (window.innerWidth - 20);
            context.canvas.height = (window.innerHeight - 20);

            return {

                Reset: function () {
                    context.canvas.width = (window.innerWidth - 20);
                    context.canvas.height = (window.innerHeight - 20);
                },

                StartContext: function () {

                    context.save();

                    var X = 0;
                    var Y = 0;
                    var Heigth = 0;
                    var Width = 0;
                    var parent = this;

                    function SetArea(x, y, w, h) {
                        X = (x != undefined) ? x : X;
                        Y = (y != undefined) ? y : Y;
                        Width = (w != undefined) ? w : Width;
                        Heigth = (h != undefined) ? h : Heigth;
                    }

                    function Arc(x, y, radius, startAngle, endAngle, anticlockwise) {

                        radius = (radius != undefined) ? radius : DEFAULT_RADIUS;
                        startAngle = (startAngle != undefined) ? startAngle : DEFAULT_START_ANGLE;
                        endAngle = (endAngle != undefined) ? endAngle : DEFAULT_END_ANGLE;
                        anticlockwise = (anticlockwise != undefined) ? anticlockwise : DEFAULT_CLOCKWISE_ORIENTATION;

                        var size = (radius * 2);
                        SetArea(x, y, size, size);

                        context.beginPath();
                        context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
                        context.closePath();
                        context.fill();
                    }

                    return {
                        /*--------------------------------------------------------------------------------------------- Generic to the context */
                        EndContext: function () {
                            context.restore();
                            return parent;
                        },
                        OpenToNewWindow: function () {
                            window.open(canvas.toDataURL(), "canvasImage", "left=0,top=0,width=" + canvas.width + ",height=" + canvas.height + ",toolbar=0,resizable=0");
                            return this;
                        },
                        FillStyle: function (style) {
                            context.fillStyle = (style != undefined) ? style : DEFAULT_FILL_STYLE;
                            return this;
                        },

                        /*--------------------------------------------------------------------------------------------- Tools */
                        Scale: function (x, y) {
                            SetArea(x, y);
                            context.scale(x, y);
                            return this;
                        },
                        CreateLinearGradient: function (x0, y0, x1, y1, color1, color2) {
                            /*paints along a line from (x0, y0) to (x1, y1).*/
                            var gradient = context.createLinearGradient(x0, y0, x1, y1);
                            gradient.addColorStop(0, color1);
                            gradient.addColorStop(1, color2);
                            context.fillStyle = gradient;
                            return this;
                        },
                        CreateRadialGradient: function (x0, y0, r0, x1, y1, r1) {
                            /*Paints along a cone between two circles. The first three parameters represent the start circle, 
                            with origin (x0, y0) and radius r0. The last three parameters represent the end circle, 
                            with origin (x1, y1) and radius r1.*/
                            context.createRadialGradient(x0, y0, r0, x1, y1, r1);
                            return this;
                        },

                        /*--------------------------------------------------------------------------------------------- Shapes and specialized actions */
                        Circle: function (x, y) {
                            Arc(x, y);
                            return this;
                        },
                        SemiCircle: function (x, y, anticlockwise) {
                            Arc(x, y, undefined, undefined, Degrees.D180, anticlockwise);
                            return this;
                        },
                        SemiCircleFaceDown: function (x, y) {
                            this.SemiCircle(x, y, true);
                            return this;
                        },
                        SemiCircleFaceUp: function (x, y) {
                            this.SemiCircle(x, y, false);
                            return this;
                        },
                        Rectangle: function (friendlyName) {

                            var parent = this;
                            var ploted = false;
                            var hasEvents = false;
                            var shouldShowEventAreas = false;
                            var name = (friendlyName == undefined) ? "Rectangle_" + GetID() : friendlyName;
                            var ImAWindow = false;

                            function ShowEventAreas() {
                                if (shouldShowEventAreas) {
                                    if (hasEvents) {
                                        Draw.TwoD
                                        .StartContext()
                                            .Rectangle()
                                                .StrokeStyle("red")
                                                .Stroke(X, Y, Width, Heigth)
                                            .Done()
                                            .FillStyle("red")
                                            .Text()
                                                .UsingFont("bold 0.5em Arial")
                                                .Write(name, (X + Width * 0.5), (Y + Heigth * 0.5))
                                            .Done()
                                        .EndContext();
                                    }
                                    else {
                                        GUITemplate.Write("No events attached!", OutputType.Error);
                                    }
                                }
                            }

                            return (function () {
                                return {
                                    Fill: function (x, y, width, heigth) {
                                        SetArea(x, y, width, heigth);
                                        context.fillRect(x, y, width, heigth);
                                        ploted = true;
                                        return this;
                                    },
                                    Stroke: function (x, y, width, height) {
                                        context.strokeRect(x, y, width, height);
                                        return this;
                                    },
                                    StrokeStyle: function (style) {
                                        context.strokeStyle = (style == undefined) ? DEFAULT_STROKE_STYLE : style;
                                        return this;
                                    },
                                    Clear: function (x, y, width, height) {
                                        context.clearRect(x, y, width, height)
                                        return this;
                                    },
                                    Done: function () {
                                        return parent;
                                    },
                                    ShowEventPlaceholders: function () {
                                        shouldShowEventAreas = true;
                                        ShowEventAreas();
                                        return this;
                                    },
                                    Ploted: function () {
                                        return ploted;
                                    },
                                    OnClick: function (namespace, action, amIAWindow) {
                                        if (!this.Ploted()) {
                                            GUITemplate.Write("Nature says you must have an object prior to handle it!");
                                        }
                                        ImAWindow = (amIAWindow == undefined) ? false : amIAWindow;
                                        $(canvas).unbind("mousedown." + namespace); /// If a previous event exists to this guy, we need to remove it
                                        $(canvas).bind("mousedown." + namespace, function (ev) {
                                            var iX = (ev.pageX - $(canvas).offset().left);
                                            var iY = (ev.pageY - $(canvas).offset().top);
                                            if (((iX >= X) && (iX <= X + Width)) &&
                                                (iY >= Y) && (iY <= Y + Heigth)) {

                                                var keepGoing = true;

                                                if (ImAWindow) {
                                                    /// If window has anything to do with it, we better know it right now!
                                                    keepGoing = Draw.TwoD.Windows.HandleEvent(iX, iY, X, Y, Width, Heigth, ev, EventType.MouseDown);
                                                }
                                                else { keepGoing = action(); }

                                                /// Should we bother bubbling it around?
                                                if (!keepGoing) {
                                                    ev.stopImmediatePropagation();
                                                }
                                            }
                                        });
                                        hasEvents = true;
                                        ShowEventAreas();
                                        return this;
                                    }
                                }
                            } ())
                        },
                        Text: function () {
                            var parent = this;
                            return (function () {
                                context.textBaseline = DEFAULT_TEXT_BASELINE;
                                context.font = DEFAULT_FONT_DATA;
                                return {
                                    UsingBaseline: function (textBaseline) {
                                        context.textBaseline = (textBaseline != undefined) ? textBaseline : context.textBaseline;
                                        return this;
                                    },
                                    UsingFont: function (font) {
                                        context.font = (font != undefined) ? font : context.font;
                                        return this;
                                    },
                                    Write: function (text, x, y) {
                                        SetArea(x, y);
                                        context.fillText(text, x, y);
                                        return this;
                                    },
                                    Done: function () {
                                        return parent;
                                    }
                                }
                            } ())
                        },
                        Shadow: function () {
                            return (function (parent) {
                                return {
                                    OffsetX: function (value) {
                                        context.shadowOffsetX = value;
                                        return this;
                                    },
                                    OffsetY: function (value) {
                                        context.shadowOffsetY = value;
                                        return this;
                                    },
                                    Blur: function (value) {
                                        context.shadowBlur = (value != undefined) ? value : DEFAULT_BLUR_VALUE;
                                        return this;
                                    },
                                    Color: function (value) {
                                        context.shadowColor = (value != undefined) ? value : DEFAULT_SHADOW_COLOR;
                                        return this;
                                    },
                                    Done: function () {
                                        return parent;
                                    }
                                }
                            } (this))
                        },
                        Line: function () {
                            return (function (parent) {
                                context.beginPath();
                                return {
                                    MoveTo: function (x, y) {
                                        context.moveTo(x, y);
                                        return this;
                                    },
                                    SetLineJoin: function (lineJoinType) { /*The corner - See options on LineJoinType enum*/
                                        context.lineJoin = lineJoinType;
                                        return this;
                                    },
                                    Width: function (value) {
                                        context.lineWidth = value;
                                        return this;
                                    },
                                    LineTo: function (x, y) {
                                        context.lineTo(x, y);
                                        return this;
                                    },
                                    Style: function (strokeStyle) {
                                        context.strokeStyle = (strokeStyle != undefined) ? strokeStyle : DEFAULT_STROKE_STYLE;
                                        return this;
                                    },
                                    Done: function () {
                                        context.stroke();
                                        return parent;
                                    }
                                }
                            } (this))
                        }
                    }
                },
                Windows: (function () {

                    /// ----------------------------------------------------------------------------- Private members [Windows]

                    /// TODO: Pensar melhor na organização das janelas.. o zIndex tem que ser dinamico, a medida que o usuário clica 
                    /// nas janelas e as torna a janela ativa no momento, a lista de zIndex deve ser atualizada... talvez um quickSort
                    /// resolva o 'problema'
                    var windows = []; /// windows[zindex] = window instance 

                    var DEFAULT_HEADER_HEIGTH = 20;

                    var Window = function (owner, zIndex) {

                        if (zIndex == undefined) { GUITemplate.Write("Missing parameter [zindex]!"); return null; }

                        var WINDOWS_EVENT_NAMESPACE = "window_" + GetID();

                        var CoreAble = {}; /// Just a marker to be tested when defining whether or not we have a valid owner...

                        /// ----------------------------------------------------------------------------- Inner Class [Windows.Window{.Header}]
                        var Header = function (text) {

                            var HEADER_EVENT_NAMESPACE = "window_header_" + GetID();
                            var onClick = [];
                            var headerText = "Untitled";

                            this.Click = function () {
                                for (var i = 0; i < onClick.length; i++) {
                                    var result = onClick[i](this);
                                    if ((result != undefined) && (result == false)) {
                                        break; /// Stops the execution
                                    }
                                }
                            }

                            this.SetText = function (text) {
                                headerText = (text != undefined) ? text : headerText;
                                return this;
                            }

                            this.OnClick = function (action) {
                                if (action != undefined) {
                                    onClick.push(action);
                                }
                                return this;
                            }

                            this.Show = function (x, y, width) {
                                Draw.TwoD.StartContext()
                                        .FillStyle("white")
                                        .Rectangle(HEADER_EVENT_NAMESPACE)
                                            .Stroke(x, y, width, DEFAULT_HEADER_HEIGTH)
                                            .Fill(x, y, width, DEFAULT_HEADER_HEIGTH)
                                            .OnClick(HEADER_EVENT_NAMESPACE, this.Click, true)
                                            .ShowEventPlaceholders()
                                            .Done()
                                        .FillStyle("gray")
                                        .Text()
                                            .Write(headerText, x + 3, y + 2)
                                            .Done()
                                    .EndContext();
                                return this;
                            }

                            this.GetText = function () {
                                return headerText;
                            }

                            this.SetText(text);
                        }

                        /// ----------------------------------------------------------------------------- Private members[Windows.Window]
                        var my = {
                            OwnerWindow: ((owner == undefined) || (owner == null) || (owner.CoreAble == undefined)) ? window : owner, /// Browser's wind ow
                            Width: 300,
                            Heigth: 300,
                            X: 0,
                            Y: 0,
                            zIndex: zIndex,
                            onClick: [],
                            Header: new Header()
                        }

                        /// ----------------------------------------------------------------------------- Public methods [Windows.Window]

                        this.SetTitle = function (value) {
                            my.Header.SetText(value);
                            UpdateFrameVisualization();
                            return this;
                        }

                        this.SetWidth = function (value) {
                            my.Width = (value != undefined) ? value : my.Width;
                            return this;
                        }

                        this.GetWidth = function (value) {
                            return my.Width;
                        }

                        this.SetHeigth = function (value) {
                            my.Heigth = (value != undefined) ? value : my.Heigth;
                            return this;
                        }

                        this.GetHeigth = function (value) {
                            return my.Heigth;
                        }

                        this.SetTop = function (value) {
                            my.Y = (value != undefined) ? value : my.Y;
                            return this;
                        }

                        this.GetTop = function (value) {
                            return my.Y;
                        }

                        this.SetLeft = function (value) {
                            my.X = (value != undefined) ? value : my.X;
                            return this;
                        }

                        this.GetLeft = function (value) {
                            return my.X;
                        }

                        this.SetZIndex = function (value) {
                            my.zIndex = (value != undefined) ? value : my.zIndex;
                            return this;
                        }

                        this.OnWindowClick = function (action) {
                            if (action != undefined) {
                                my.onClick.push(action);
                            }
                            return this;
                        }

                        this.Click = function () {
                            for (var i = 0; i < my.onClick.length; i++) {
                                var result = my.onClick[i](this);
                                if ((result != undefined) && (result == false)) {
                                    break; /// Stops the execution
                                }
                            }
                        }

                        this.OnHeaderClick = function (action) {
                            my.Header.OnClick(action);
                            return this;
                        }

                        this.Show = function () {
                            return this.ShowOn(my.zIndex);
                        }

                        this.ShowOn = function (z) {

                            /// Draws the window itself
                            Draw.TwoD.StartContext()
                                        .FillStyle("gray")
                                        .Shadow()
                                            .OffsetX(1)
                                            .OffsetY(1)
                                            .Blur()
                                            .Color("silver")
                                            .Done()
                                        .Rectangle(WINDOWS_EVENT_NAMESPACE)
                                            .Stroke(my.X, my.Y, my.Width, my.Heigth)
                                            .Fill(my.X, my.Y, my.Width, my.Heigth)
                                            .OnClick(WINDOWS_EVENT_NAMESPACE, this.Click, true)
                                            .ShowEventPlaceholders()
                                            .Done()
                                        .CreateLinearGradient(0, 50, 0, 10, "silver", "black")
                                    .EndContext();

                            /// Renders header
                            my.Header.Show(my.X, my.Y, my.Width);

                            return this;
                        }

                        this.GetZIndex = function () {
                            return my.zIndex;
                        }

                        this.GetHeader = function () {
                            return my.Header;
                        }

                        this.toString = function () {
                            return my.Header.GetText();
                        }

                    }

                    /// ----------------------------------------------------------------------------- Private methods [Windows]

                    function DrawBasicWindow(owner, width, heigth, x, y, zindex, headerText, windowClickEvent, headerClickEvent) {
                        try {

                            var zIndex = RealzIndex();
                            var newWindow = new Window(owner, zIndex)
                                                .SetWidth(width)
                                                .SetHeigth(heigth)
                                                .SetTop(y)
                                                .SetLeft(x)
                                                .SetTitle(headerText)
                                                .OnWindowClick(windowClickEvent)
                                                .OnHeaderClick(headerClickEvent)
                                                .Show();
                            windows.push(newWindow);
                            return newWindow;
                        }
                        catch (e) {
                            GUITemplate.Write("Error while rendering a new window: " + e.Message, OutputType.Error)
                        }
                    }

                    function UpdateFrameVisualization() {
                        Draw.TwoD.Reset();
                        for (var index = 0; index < windows.length; index++) {
                            windows[index].ShowOn(index);
                        }
                    }

                    function SetActiveWindowAs(X, Y, Width, Heigth) {
                        var i = GetActiveWindowzIndex();
                        var somethingChanged = false;
                        while (i >= 0) {
                            if ((windows[i].GetLeft() == X) && (windows[i].GetTop() == Y) &&
                                (windows[i].GetWidth() == Width) && (windows[i].GetHeigth() == Heigth)) {
                                var currentWindow = windows[i];
                                for (var j = i; j < GetActiveWindowzIndex(); j++) {
                                    windows[j] = windows[j + 1];
                                }
                                windows[GetActiveWindowzIndex()] = currentWindow;
                                UpdateFrameVisualization();
                                somethingChanged = true;
                                break;
                            }
                            --i;
                        }
                        return somethingChanged;
                    }

                    function RealzIndex() { return windows.length; }

                    function GetActiveWindowzIndex() { return windows.length - 1; }

                    return {

                        /*Only a GUI should call Render functions*/
                        Render: function (owner, width, heigth, x, y, zindex, headerText, windowClickEvent, headerClickEvent) {
                            return DrawBasicWindow(owner, width, heigth, x, y, zindex, headerText, windowClickEvent, headerClickEvent);
                        },

                        HandleEvent: function (iX, iY, X, Y, Width, Heigth, ev, eventType) {

                            var activeWindow = windows[GetActiveWindowzIndex()];

                            if (((iX >= activeWindow.GetLeft()) && (iX <= activeWindow.GetLeft() + activeWindow.GetWidth())) &&
                            (iY >= activeWindow.GetTop()) && (iY <= activeWindow.GetTop() + activeWindow.GetHeigth())
                            || SetActiveWindowAs(X, Y, Width, Heigth)) {
                                /// If we're within the boundaries of the active window 
                                /// OR
                                /// by running 'SetActiveWindowAs' we get a 'true' as response (meaning that we found a window that correspond
                                /// to the shape description we received)...

                                var zIndex = GetActiveWindowzIndex();
                                if (iY < (Y + DEFAULT_HEADER_HEIGTH)) { windows[zIndex].GetHeader().Click(); } /// Header click
                                else { windows[zIndex].Click() } /// Body click
                                return false; /// Stop bubbling, we got it right
                            }

                            return true; /// Returns a flag to bubble events up. These are not the windows your are looking for...
                        }
                    }
                })()
            }
        })()
    }
})();

var win = Draw.TwoD.Windows.Render({}, 90, 80, 30, 10, 1, "Hello World", function (window) { alert("clicou na janela"); }, function (window) { alert("clicou no header"); });
win.SetTitle("Utererê!").SetHeigth(200).SetLeft(160).SetTop(50);
Draw.TwoD.Windows.Render(win, 90, 80, 30, 10, 1, "Hello World 1 ", function (window) { alert("clicou na janela 1 "); }, function (window) { alert("clicou no header 1"); });
Draw.TwoD.Windows.Render(win, 90, 80, 0, 10, 1, "Hello World 2 ", function (window) { alert("clicou na janela 2 "); }, function (window) { alert("clicou no header 2"); });

///////////////////////////////////////////////////////// todo ////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------------------------------------------------------------------
// 1 - Explode a merda da barra de titulos
//     win.SetTitle("Utererê! Utererê! Utererê! Utererê!");

//----------------------------------------------------------------------------------------------------------------------------------------
//  2 - Não dispara corretamente os eventos */
//      2.1 - As transições de seleção de objeto não acontecem como esperado... os objetos não seguem a ordem que o usuário imagina que seguirão
//          Draw.TwoD.
//          Windows
//            .Render(win, 90, 80, 0, 80, 1, "Hello World 2 ", function (window) { alert("clicou na janela 2 "); }, function (window) { alert("clicou no header 2"); });
//  2.2 - O evento não é disparado */
/*Draw.TwoD.StartContext()
.Rectangle("teste")
.Stroke(30, 10, 10, 10)
.Fill(30, 10, 10, 10)
.OnClick("teste", function () { alert("ok"); })
.Done()
.EndContext();*/

///////////////////////////////////////////////////////// /todo ///////////////////////////////////////////////////////////////////////////

