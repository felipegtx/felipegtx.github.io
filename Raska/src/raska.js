/**
* HTML5 canvas visual directed graph creation tool 
*
* @module raska
* @main installUsing
*/
(function (w) {

    'use strict';

    /**
     * An utility that wraps the commom taks to avoid code repetition
     *
     * @module raska
     * @submodule _helpers
     */
    var _helpers = (function () {
        return {

            /**
             * Outputs messages to the 'console'
             *
             * @class $log
             * @module raska
             * @submodule _helpers
             * @static
             */
            $log: {

                /**
                 * Whether or not to actually log the messages (should be 'false' in production code)
                 *
                 * @property active
                 * @type Bool
                 * @default false
                 */
                active: false,

                /**
                * Prints an informational message to the console
                * 
                * @method info
                * @param {String} msg The message to be shown
                * @param {Any} o Any extra message data
                */
                info: function (msg, o) {
                    if (this.active === true) {
                        console.info(msg, o);
                    }
                }

            },

            /**
             * Handles commom prototype element' tasks
             *
             * @class $obj
             * @module raska
             * @submodule _helpers
             * @static
             */
            $obj: (function () {

                var _this;

                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                      .toString(16)
                      .substring(1);
                }

                return _this = {

                    /**
                    * Executes a given delegate for each item in the collection
                    * 
                    * @method forEach
                    * @param {Array} arr The array that need to be enumerated
                    * @param {Delegate} what What to do to a given item
                    * @returns Array of data acquired during array enumaration
                    */
                    forEach: function (arr, what) {
                        var result = [];
                        if (_this.isArray(arr)) {
                            for (var i = 0; i < arr.length; i++) {
                                result.push(what(arr[i], i));
                            }
                        }
                        return result;
                    },

                    /**
                    * Whether or not a given object type is of the type you expect (typeof)
                    * 
                    * @method is
                    * @param {Object} obj The object we whant to know about
                    * @param {String} what The string representing the name of the type
                    * @return {Bool} Whether or not the object matches the specified type
                    */
                    is: function (obj, what) {
                        return typeof obj === what;
                    },

                    /**
                   * Whether or not a given object type is of the type you expect (constructor call)
                   * 
                   * @method isType
                   * @param {Object} obj The object we whant to know about
                   * @param {String} typeName The string representing the name of the type
                   * @return {Bool} Whether or not the object matches the specified type
                   */
                    isType: function (obj, typeName) {
                        return Object.prototype.toString.call(obj) === "[object " + typeName + "]";
                    },

                    /**
                    * Generates a pseudo-random Id
                    * 
                    * @method generateId
                    * @return {String} A pseudo-random Id
                    */
                    generateId: function () {

                        return "__" + s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
                    },

                    /**
                    * Whether or not a given object type is valid to be handled
                    * 
                    * @method isValid
                    * @param {Object} obj The object we whant to know if it's valid to be handled
                    * @return {Bool} Whether or not the object is valid to be handled
                    */
                    isValid: function (obj) {
                        return !this.is(obj, 'undefined') && obj !== null;
                    },

                    /**
                    * Whether or not a given object is an Array
                    * 
                    * @method isArray
                    * @param {Object} obj The object we whant to know is it's valid to be handled
                    * @return {Bool} Whether or not the object is valid to be handled
                    */
                    isArray: function (obj) {
                        return this.isValid(obj) && this.isType(obj, "Array");
                    },

                    /**
                    * Whether or not a given object type is undefined
                    * 
                    * @method isUndefined
                    * @param {Object} obj The object we whant to know if it's undefined
                    * @return {Bool} Whether or not the object is undefined
                    */
                    isUndefined: function (obj) {
                        return this.is(obj, 'undefined');
                    },

                    /**
                    * Serializes a given _basicElement array to a JSON string
                    * 
                    * @method deconstruct
                    * @param {_basicElement[]} basicElementArray The array of _basicElement we're going to work with
                    * @return {string} The corresponding string
                    */
                    deconstruct: function (elements) {
                        var resultFull = [];
                        if (_helpers.$obj.isArray(elements)) {

                            function normalizeChain(elementRoot) {
                                var item, links;
                                for (var i = 0; i < elementRoot.length; i++) {

                                    item = elementRoot[i];
                                    if ((item.graphNode === true) && (((links = item.getLinksFrom()) === null) || (links.length === 0))
                                        && (((links = item.getLinksTo()) === null) || (links.length === 0))) {
                                        throw new _defaultConfigurations.errors.elementDoesNotHaveALink(item.name);
                                    }

                                    if (item.isSerializable()) {

                                        /// Adds the normalized item
                                        resultFull.push(item.normalize());

                                        /// Check for child elements
                                        normalizeChain(item.getChildElements());
                                    }
                                }
                            }

                            normalizeChain(elements);
                        }
                        return JSON.stringify(resultFull);
                    },

                    /**
                    * Tries to recreate a previously serialized object into a new raska instance
                    * 
                    * @method recreate
                    * @param {JSON} jsonElement The JSON representation of a raska object
                    * @return {_basicElement} The recreated element or null if the element type is invalid
                    */
                    recreate: function (jsonElement) {
                        if (this.isValid(jsonElement.type) && (jsonElement.type in _elementTypes)) {

                            var resultElement = this.extend(new _defaultConfigurations[jsonElement.type], jsonElement);

                            resultElement.getType = function () { return resultElement.type; }

                            return resultElement;

                        }
                        return null;
                    },

                    /**
                    * Recreate all links of the object
                    * 
                    * @method recreate                                     
                    */
                    recreateLinks: function (targetElement, baseElement, findElementDelegate) {

                        /// Copy data back as it should be
                        this.forEach(this.forEach(baseElement.linksTo, findElementDelegate), targetElement.addLinkTo.bind(targetElement));
                        this.forEach(this.forEach(baseElement.childElements, findElementDelegate),
                            function (element) {
                                targetElement.addChild(element);
                            });

                        targetElement.setParent(findElementDelegate(baseElement.parent));
                    },

                    /**
                    * Extends any object using a base template object as reference
                    * 
                    * @method extend
                    * @param {Object} baseObject The object we whant to copy from
                    * @param {Object} impl The object with the data we want use 
                    * @param {Bool} addNewMembers Whether or not we allow new members on the 'impl' object to be used in the result
                    * @return {Object} Extended object
                    */
                    extend: function (baseObject, impl, addNewMembers) {
                        var result = {}, element = null;
                        if (this.isUndefined(impl)) {
                            for (element in baseObject) {
                                result[element] = baseObject[element];
                            }
                        } else {

                            if (addNewMembers === true) { result = impl; }
                            for (element in baseObject) {
                                if (!result.hasOwnProperty(element)) {
                                    result[element] = impl.hasOwnProperty(element) ? impl[element] : baseObject[element];
                                }
                            }
                        }
                        return result;
                    }
                };
            })()
        };
    })(),

    /**
    * Gathers all elements being ploted to the canvas and organizes it as a directed graph JSON
    * 
    * @private
    * @class  _graphNodeInfo
    * @param {_basicElement} nodeElement Element whose dependencies we're about to transpose searching for links
    * @param {_graphNodeInfo} parentNode The parent no to this element
    * @param {array} links The linked data to this element
    */
    _graphNodeInfo = function (nodeElement, parentNode, links) {

        var _parent = parentNode || null,
            _links = [];

        /**
         * The element wraped by this node
         *
         * @property element
         * @type _basicElement
         * @final
         */
        this.element = nodeElement;

        /**
         * Whether or not this node has a parent element
         *
         * @property hasParent
         * @type bool
         * @final
         */
        this.hasParent = function (node) {
            return ((_parent !== null)
                && ((_parent.element === node) || (_parent.getName() === node.name) || _parent.hasParent(node)));
        };

        /**
        * Tries to find a parent node compatible with the element passed as parameter
        *
        * @method getParentGraphNodeFor
        * @param {_basicElement} bElement Element wraped by a parent node
        * @type _graphNodeInfo
        */
        this.getParentGraphNodeFor = function (bElement) {

            if ((this.element === bElement) || (this.getName() === bElement.name)) {
                return this;
            }

            if (_parent !== null) {
                return this.getParent(bElement);
            }

            return null;
        };
        this.getName = function () {
            return nodeElement.name;
        };
        this.getParent = function () {
            return _parent;
        };
        this.getLinks = function () {
            return _links;
        };

        for (var j = 0; j < links.length; j++) {
            if (links[j].graphNode === true) {

                if (this.hasParent(links[j])) {

                    /// We've reached a recursive relation. In this case, simply gathers the reference to the parent and 
                    /// link it here for better navegability between nodes dependecies
                    _helpers.$log.info("ingored parent node", this.getParentGraphNodeFor(links[j]));
                } else {

                    _links.push(new _graphNodeInfo(links[j], this, links[j].getLinksTo()));
                }
            }
        }
    },

    /**
     * The valid position types for a Raskel element
     *
     * @private
     * @property _positionTypes
     * @static
     * @final
     */
    _positionTypes = {

        /**
        * Element position will be relative to its parent (if any)
        *
        * @property relative
        * @type Number
        * @default 50
        * @readOnly
        */
        relative: 0,

        /**
        * Element position will be absolute and will have no regard about its parent position whatsoever
        *
        * @property relative
        * @type Number
        * @default 50
        * @readOnly
        */
        absolute: 1
    },

    _elementTypes = {
        basic: "basic",
        html: "htmlElement",
        arrow: "arrow",
        circle: "circle",
        square: "square",
        label: "label"
    },

    /**
    * The basic shape of an Raska element
    *
    * @private
    * @class _basicElement
    * @module raska
    */
    _basicElement = function () {

        var
            /**
             * Points to a parent Raska element (if any)
             *
             * @private
             * @property $parent
             * @default null
             */
            $parent = null,

            /**
             * Points to a Raska element [as an arrow] (if any) related as a dependency from this node
             *
             * @private
             * @property $linksTo
             * @type _basicElement
             * @default []
             */
            $linksTo = [],

            /**
             * Points to a Raska element [as an arrow] (if any) that depends on this instance
             * 
             * @private
             * @property $linksFrom
             * @type _basicElement
             * @default []
             */
            $linksFrom = [],

            /**
             * Points to series of child Raska element (if any) that, usually, are contained inside this node
             *
             * @private
             * @property $childElements
             * @type _basicElement
             * @default []
             */
            $childElements = [];

        /**
        * Clears all links that point to and from this Raska element
        * 
        * @private
        * @method clearLinksFrom
        * @param {Object} source Object that defines the source of the link removal (start node)
        * @param {Function} each Delegates that handle the process of removing the references
        * @return {Array} Empty array
        */
        function clearLinksFrom(source, each) {
            for (var i = 0; i < source.length; i++) {
                each(source[i]);
            }
            return [];
        }

        return {
            /**
             * The element name
             *
             * @property name
             * @default "anonymous"
             * @type String
             */
            name: "anonymous",

            /**
             * The element type
             *
             * @property getType
             * @default _elementTypes.basic
             * @type _elementTypes
             */
            getType: function () { return _elementTypes.basic; },

            /**
             * Wheter or not this element is part of the graph as a node
             *
             * @property graphNode
             * @default true
             * @type Bool
             */
            graphNode: true,

            /**
            * Allows to better check whether or not a new link can be created beteen two elements
            * 
            * @method canLink
            * @param {_basicElement} from Element that will be linked as a source
            * @param {_basicElement} to Element that will be linked as a destination
            * @return {Bool} Whether or not the link can be created
            */
            canLink: function (from, to) {
                if (from === this) {
                    return _helpers.$obj.isValid(to) && (to.canReach(this) === false);
                }
                return true;
            },

            /**
            * Whether or not this element can reach another element via a linked relation
            * 
            * @method canReach
            * @return {Bool} Whether or not a link exists
            */
            canReach: function (node) {
                if ($linksTo.length > 0) {
                    for (var i = 0; i < $linksTo.length; i++) {
                        if ($linksTo[i].canReach(node)) {
                            return true;
                        }
                    }
                }
                return (this === node);
            },

            /**
            * Is this element passive of being linked at all?
            * 
            * @method isLinkable
            * @return {Bool} Whether or not a link can be created either from or to this element
            */
            isLinkable: function () {
                return true;
            },

            /**
            * Is this element passive of being serialized at all?
            * 
            * @method isSerializable
            * @return {Bool} Whether or not this element is suposed to be serialized
            */
            isSerializable: function () {
                return true;
            },

            /**
            * Creates a link between this and another element, using the later as a dependency of this instance
            * 
            * @method addLinkTo
            * @param {_basicElement} element Element that will be linked as a destination from this element node
            * @return {Bool} Whether or not the link was added
            */
            addLinkTo: function (element) {
                if (element.isLinkable() && this.isLinkable() && ($linksTo.indexOf(element) === -1)
                    && (element !== this) && this.canLink(this, element)) {
                    $linksTo.push(element);
                    element.addLinkFrom(this);
                    return true;
                }
                return false;
            },

            /**
             * Links this element to another Raska element as this instance being the target node
             * 
             * @method addLinkFrom
             * @param {_basicElement} element Element that will be linked as a source from this element node
             * @return {Bool} Whether or not the link was added
             */
            addLinkFrom: function (element) {
                if (element.isLinkable() && this.isLinkable() && ($linksFrom.indexOf(element) === -1)
                    && (element !== this) && this.canLink(element, this)) {
                    $linksFrom.push(element);
                    element.addLinkTo(this);
                    return true;
                }
                return false;
            },

            /**
            * Removes the dependency from this element to another Raska element
            * 
            * @method removeLinkTo
            * @param {_basicElement} element Element that will have its link to this element removed
            * @return {_basicElement} Updated Raska element reference
            * @chainable
            */
            removeLinkTo: function (element) {
                if ($linksTo.indexOf(element) > -1) {
                    $linksTo.splice($linksTo.indexOf(element), 1);
                    element.removeLinkFrom(this);
                }
                return this;
            },

            /**
           * Transposes the getter data to a field attached to this instance
           * 
           * @method normalize
           * @chainable
           */
            normalize: function () {
                var n = function (item) { return item.name; };
                this["linksTo"] = _helpers.$obj.forEach(this.getLinksTo(), n);
                this["childElements"] = _helpers.$obj.forEach(this.getChildElements(), n);
                this["parent"] = _helpers.$obj.isValid($parent) ? $parent.name : null;
                this["type"] = this.getType();
                return this;
            },

            /**
            * Gathers all elements that this instance depends on
            * 
            * @method getLinksTo
            * @return {Array} All elements that this node references TO
            */
            getLinksTo: function () {
                return $linksTo;
            },

            /**
            * Gathers all dependecies/linked elements related to this instance
            * 
            * @method getLinksFrom
            * @return {Array} All elements that this node references from
            */
            getLinksFrom: function () {
                return $linksFrom;
            },

            /**
            * Removes the link to this element from another Raska element
            * 
            * @method removeLinkFrom
            * @param {_basicElement} element Element that will have its link from this element removed
            * @return {_basicElement} Updated Raska element reference
            * @chainable
            */
            removeLinkFrom: function (element) {
                if ($linksFrom.indexOf(element) > -1) {
                    $linksFrom.splice($linksFrom.indexOf(element), 1);
                    element.removeLinkTo(this);
                }
                return this;
            },

            /**
            * Removes every and each link that references this element
            * 
            * @method clearAllLinks
            * @return {_basicElement} Updated Raska element reference
            * @chainable
            */
            clearAllLinks: function () {
                $linksTo = clearLinksFrom($linksTo, function (e) { e.removeLinkFrom(this); });
                $linksFrom = clearLinksFrom($linksFrom, function (e) { e.removeLinkTo(this); });
                return this;
            },

            /**
            * Gathers all child elements from this node
            * 
            * @method getChildElements
            * @return {Array} All child elements
            */
            getChildElements: function () {
                return $childElements;
            },

            /**
            * Adds a new child element to this node
            * 
            * @method addChild
            * @param {_basicElement} child Element that will be added to the child array into this element
            * @return {_basicElement} Updated Raska element reference
            * @chainable
            */
            addChild: function (child) {
                child.setParent(this);
                $childElements.push(child);
                return this;
            },

            /**
            * Get the parent node to this element
            * 
            * @method getParent
            * @return {_basicElement} Reference to de parent node (null if none)
            */
            getParent: function () {
                return $parent;
            },

            /**
            * Retrieves the element boundaries information
            * 
            * @method getBoundaries
            * @return {Object} Data regarding x, y, minX and minY from this element
            */
            getBoundaries: function () {
                return {
                    x: this.getWidth(),
                    y: this.getHeight(),
                    minX: 0,
                    minY: 0
                };
            },

            /**
            * Sets the parent node to this element
            * 
            * @method setParent
            * @param {_basicElement} parent Element that will be added as a parent to this element
            * @return {_basicElement} Updated Raska element reference
            * @chainable
            */
            setParent: function (parent) {
                $parent = parent;
                return this;
            },

            /**
             * Details regarding this element' border
             *
             * @attribute border
             */
            border: {
                /**
                * Element border color
                *
                * @property color
                * @type String
                * @default null
                */
                color: null,

                /**
                * Whether or not a border should be rendered
                *
                * @property active
                * @type Bool
                * @default false
                */
                active: false,

                /**
                * Border width
                *
                * @property width
                * @type Number
                * @default 0
                */
                width: 0
            },

            /**
            * Element position type
            *
            * @property position
            * @type _positionTypes
            * @default _positionTypes.relative
            */
            position: _positionTypes.relative,

            /**
            * Element x position
            *
            * @property x
            * @type Number
            * @default 50
            */
            x: 50,

            /**
            * Element y position
            *
            * @property y
            * @type Number
            * @default 50
            */
            y: 50,

            /**
            * Gathers adjusted x/y coordinates for the currente element taking into consideration 
            * the type of positining set to it and wheter or not a parent node is present
            * 
            * @method getAdjustedCoordinates
            * @return {x:Number,y:Number} Adjusted coordinates
            */
            getAdjustedCoordinates: function () {
                if ((this.position === _positionTypes.relative) && ($parent !== null)) {
                    var adjustedParent = $parent.getAdjustedCoordinates();
                    return {
                        x: this.x + adjustedParent.x,
                        y: this.y + adjustedParent.y
                    };
                }
                return { x: this.x, y: this.y };
            },

            /**
            * [ABSTRACT] Adjusts the position of the current element taking in consideration it's parent 
            * positioning constraints
            * 
            * @method adjustPosition
            * @param {Number} newX X position
            * @param {Number} newY Y position
            * @chainable
            */
            adjustPosition: function (newX, newY) {
                console.error(_defaultConfigurations.errors.notImplementedException);
                throw _defaultConfigurations.errors.notImplementedException;
            },

            /**
           * [ABSTRACT] Gets the current width for this element
           * 
           * @method getWidth
           * @return {Number} The width of this element
           * @throws {_defaultConfigurations.errors.notImplementedException} Not implemented
           */
            getWidth: function () {
                console.error(_defaultConfigurations.errors.notImplementedException);
                throw _defaultConfigurations.errors.notImplementedException;
            },

            /**
             * [ABSTRACT] Gets the current Height for this element
             * 
             * @method getHeight
             * @return {Number} The Height of this element
             * @throws {_defaultConfigurations.errors.notImplementedException} Not implemented
             */
            getHeight: function () {
                console.error(_defaultConfigurations.errors.notImplementedException);
                throw _defaultConfigurations.errors.notImplementedException;
            },

            /**
             * [ABSTRACT] Whether or not this element existis withing the boudaries of 
             * the given x/y coordinates
             * 
             * @method existsIn
             * @param {Number} x X Coordinate
             * @param {Number} y Y Coordinate
             * @return {Bool} If this element is contained within the X/Y coordinates
             * @throws {_defaultConfigurations.errors.notImplementedException} Not implemented
             */
            existsIn: function (x, y) {
                console.error(_defaultConfigurations.errors.notImplementedException);
                throw _defaultConfigurations.errors.notImplementedException;
            },

            /**
             * [ABSTRACT] Whether or not this element existis withing the boudaries of 
             * the given x/y coordinates
             * 
             * @method existsIn
             * @param {HTMLElement|Node} The Canvas element
             * @param {Node} tdContext Canvas' 2d context
             * @throws {_defaultConfigurations.errors.notImplementedException} Not implemented
             */
            drawTo: function (canvasElement, tdContext) {
                console.error(_defaultConfigurations.errors.notImplementedException);
                throw _defaultConfigurations.errors.notImplementedException;
            }
        };
    },

     /**
     * A utility container that holds default instance information for the Raska library
     *
     * @private
     * @module raska
     * @submodule _defaultConfigurations
     * @readOnly
     */
    _defaultConfigurations = {

        /**
         * Raska's default configuration data
         *
         * @property library
         * @static
         * @final
         */
        library: {
            readonly: false,
            frameRefreshRate: 20,
            targetCanvasId: ""
        },

        /**
         * Raska's exception types
         *
         * @property errors
         * @static
         * @final
         */
        errors: {
            notImplementedException: {
                message: "Not implemented",
                code: 0
            },
            nullParameterException: function (parameterName) {

                if ((typeof parameterName === 'undefined') || (parameterName === null)) {
                    throw new this.nullParameterException("parameterName");
                }

                this.message = "Parameter can't be null";
                this.parameterName = parameterName;
                this.code = 1;
            },
            elementDoesNotHaveALink: function (elementName) {

                if ((typeof elementName === 'undefined') || (elementName === null)) {
                    throw new this.nullParameterException("elementName");
                }

                return {
                    message: "Element '" + elementName + "' doesn't have a valid linked sibling",
                    elementName: elementName,
                    code: 2
                };
            },
            itemNotFoundException: function (elementName) {

                if ((typeof elementName === 'undefined') || (elementName === null)) {
                    throw new this.nullParameterException("elementName");
                }

                return {
                    message: "Element '" + elementName + "' wasn't found",
                    elementName: elementName,
                    code: 3
                };
            }
        },

        /**
         * Creates a label
         * 
         * @class label
         * @extends _basicElement
         */
        label: function () {
            return _helpers.$obj.extend(new _basicElement(), {
                name: "label" + _helpers.$obj.generateId(),
                graphNode: false,
                getType: function () { return _elementTypes.label; },
                canLink: function () { return false; },
                isLinkable: function () { return false; },
                text: "",
                color: "white",
                x: 0,
                y: 0,
                border: { color: "red", active: true, width: 4 },
                font: { family: "Tahoma", size: "12px" },
                getWidth: function () {
                    return this.text.length * 5;
                },
                getHeight: function () {
                    return this.font.size;
                },
                drawTo: function (canvas, context) {
                    var coordinates = this.getAdjustedCoordinates();
                    context.font = this.font.size + " " + this.font.family;
                    context.textBaseline = "middle";
                    context.textAlign = "center";
                    if (this.border.active === true) {
                        context.lineJoin = "round";
                        context.lineWidth = this.border.width;
                        context.strokeStyle = this.border.color;
                        context.strokeText(this.text, coordinates.x, coordinates.y);
                    }
                    context.fillStyle = this.color;
                    context.fillText(this.text, coordinates.x, coordinates.y);
                },
                existsIn: function (x, y) {
                    /// Efective as a non-draggable element
                    return false;
                }
            }, true);
        },

        /**
         * Creates a square 
         * 
         * @class square
         * @extends _basicElement
         */
        square: function () {
            return _helpers.$obj.extend(new _basicElement(), {
                name: "square" + _helpers.$obj.generateId(),
                getType: function () { return _elementTypes.square; },
                border: { color: "gray", active: true, width: 4 },
                fillColor: "silver",
                dimensions: {
                    width: 30,
                    height: 50
                },
                globalAlpha: 1,
                getWidth: function () {
                    return this.dimensions.width;
                },
                getHeight: function () {
                    return this.dimensions.height;
                },
                drawTo: function (canvas, context) {
                    var coordinates = this.getAdjustedCoordinates();
                    context.beginPath();
                    context.rect(coordinates.x, coordinates.y, this.dimensions.width, this.dimensions.height);
                    context.fillStyle = this.fillColor;
                    if (this.border.active === true) {
                        context.lineWidth = this.border.width;
                        context.strokeStyle = this.border.color;
                    }
                    context.globalAlpha = this.globalAlpha;
                    context.fill();
                    context.stroke();
                },
                existsIn: function (x, y) {
                    return ((x > this.x - this.dimensions.width)
                        && (x < this.x + this.dimensions.width)
                        && (y > this.y - this.dimensions.height)
                        && (y < this.y + this.dimensions.height));
                },
                adjustPosition: function (newX, newY) {
                    if ((this.position === _positionTypes.relative) && ($parent !== null)) {

                        var adjustedParent = $parent.getAdjustedCoordinates();
                        var w = $parent.getWidth() / 2;
                        var h = $parent.getHeight() / 2;
                        var diffX = (newX - adjustedParent.x) - w;
                        var diffH = (newY - adjustedParent.y) - h;
                        this.x = diffX < 0 ? Math.max(diffX, w * -1) : Math.min(diffX, w);;
                        this.y = diffH < 0 ? Math.max(diffH, h * -1) : Math.min(diffH, h);

                    } else {
                        this.x = newX;
                        this.y = newY;
                    }
                    return this;
                }
            }, true);
        },

        /**
         * Creates an arrow 
         * 
         * @class arrow
         * @extends _basicElement
         */
        arrow: function (source) {

            if (_helpers.$obj.isUndefined(source) || (source === null)) {
                throw new _defaultConfigurations.errors.nullParameterException("source");
            }

            var _source = source,
                _drawArrowhead = function (context, x, y, radians, sizeW, sizeH, arrowColor) {
                    context.fillStyle = arrowColor;
                    context.save();
                    context.beginPath();
                    context.translate(x, y);
                    context.rotate(radians);
                    context.moveTo(0, -10);
                    context.lineTo(sizeH, sizeW);
                    context.lineTo(sizeH * -1, sizeW);
                    context.closePath();
                    context.restore();
                    context.fill();
                };

            return _helpers.$obj.extend(new _basicElement(), {
                name: "arrow" + _helpers.$obj.generateId(),
                clearAllLinks: function () {
                    _source.removeLinkFrom(this.getParent());
                    return this;
                },
                graphNode: false,
                isSerializable: function () { return false; },
                getType: function () { return _elementTypes.arrow; },
                canLink: function () { return false; },
                isLinkable: function () { return false; },
                border: { color: "black", active: true, width: 2 },
                fillColor: "black",
                getWidth: function () { return 1; },
                getHeight: function () { return 1; },
                drawTo: function (canvas, context) {

                    this.x = _source.x;
                    this.y = _source.y + (_source.getHeight() / 2);

                    var parent = this.getParent();
                    context.beginPath();
                    context.fillStyle = this.fillColor;
                    if (this.border.active === true) {
                        context.lineWidth = this.border.width;
                        context.strokeStyle = this.border.color;
                    }
                    context.moveTo(this.x, this.y);
                    context.lineTo(parent.x, parent.y);
                    context.stroke();
                    var startRadians = Math.atan((parent.y - this.y) / (parent.x - this.x));
                    startRadians += ((parent.x > this.x) ? -90 : 90) * Math.PI / 180;
                    _drawArrowhead(context, this.x, this.y, startRadians, 23, 10, this.fillColor);
                    _drawArrowhead(context, this.x, this.y, startRadians, 18, 6, "white");
                },
                existsIn: function (x0, y0) {
                    /// https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
                    var x1 = this.x, y1 = this.y, parent = this.getParent(),
                        x2 = parent.x, y2 = parent.y, Dx = x2 - x1, Dy = y2 - y1,
                        padding = 2;
                    var distance = Math.floor(
                                Math.abs(Dy * x0 - Dx * y0 - x1 * y2 + x2 * y1) /
                                    Math.sqrt(Math.pow(Dx, 2) + Math.pow(Dy, 2)));

                    if (this.border.active === true) {
                        padding = this.border.width;
                    }

                    return (distance <= padding);
                }
            }, true);
        },

        /**
         * Wraps any HTML element as a Raska element
         * 
         * @class htmlElement
         * @constructor
         * @extends _basicElement
         */
        htmlElement: function (element) {

            if (!_helpers.$obj.isValid(element)) {
                var nullObj = new _defaultConfigurations.errors.nullParameterException("element");
                console.error(nullObj.message);
                throw nullObj;
            }
            var targetElement = element;
            return _helpers.$obj.extend(new _basicElement(), {
                name: "htmlElement" + _helpers.$obj.generateId(),
                getType: function () { return _elementTypes.html; },
                graphNode: false,
                isSerializable: function () { return false; },
                canLink: function () { return false; },
                isLinkable: function () { return false; },
                border: { active: false },
                fillColor: "",
                getWidth: function () { return 0; },
                getHeight: function () { return 0; },
                drawTo: function (canvas, context) { },
                existsIn: function (x, y) { return false; },
                handleInteractions: true,
                onIteraction: function (iteractionType, trigger) {

                    var triggerWrapper = function (evt) {
                        trigger(evt, targetElement, iteractionType);
                    };

                    if (window.addEventListener) { // modern browsers including IE9+
                        targetElement.addEventListener(iteractionType, triggerWrapper, false);
                    } else if (window.attachEvent) { // IE8 and below
                        targetElement.attachEvent('on' + iteractionType, triggerWrapper);
                    } else {
                        targetElement['on' + iteractionType] = triggerWrapper;
                    }
                }
            }, true);
        },

        /**
         * Creates a cricle.
         * 
         * @class circle
         * @extends _basicElement
         */
        circle: function () {
            return _helpers.$obj.extend(new _basicElement(), {
                name: "circle" + _helpers.$obj.generateId(),
                border: { color: "red", active: true, width: 4 },
                getType: function () { return _elementTypes.circle; },
                fillColor: "black",
                radius: 20,
                getWidth: function () {
                    return this.radius * 2;
                },
                getHeight: function () {
                    return this.radius * 2;
                },
                drawTo: function (canvas, context) {
                    var coordinates = this.getAdjustedCoordinates();
                    context.beginPath();
                    context.arc(coordinates.x, coordinates.y, this.radius, 0, 2 * Math.PI, false);
                    context.fillStyle = this.fillColor;
                    context.fill();
                    if (this.border.active === true) {
                        context.lineWidth = this.border.width;
                        context.strokeStyle = this.border.color;
                    }
                    context.stroke();
                },
                existsIn: function (x, y) {
                    var dx = this.x - x;
                    var dy = this.y - y;
                    return (dx * dx + dy * dy < this.radius * this.radius);
                },
                getBoundaries: function () {
                    var p = this.radius / 2;
                    return {
                        x: p,
                        y: p,
                        minX: p * -1,
                        minY: p * -1
                    };
                },
                adjustPosition: function (newX, newY) {
                    var $parent = this.getParent();
                    if ((this.position === _positionTypes.relative) && ($parent !== null)) {

                        var adjustedParent = $parent.getAdjustedCoordinates();
                        var parentBoundaries = $parent.getBoundaries();
                        var w = parentBoundaries.x;
                        var h = parentBoundaries.y;
                        var diffX = (newX - adjustedParent.x) - w;
                        var diffH = (newY - adjustedParent.y) - h;
                        this.x = diffX < 0 ? Math.max(diffX, parentBoundaries.minX) : Math.min(diffX, w);;
                        this.y = diffH < 0 ? Math.max(diffH, parentBoundaries.minY) : Math.min(diffH, h);
                    } else {
                        this.x = newX;
                        this.y = newY;
                    }
                    return this;
                }
            }, true);
        }
    },

    /**
     * Holds the value for the active configuration on this Raska instance
     *
     * @private
     * @attribute _activeConfiguration
     * @default null
     * @module raska
     */
    _activeConfiguration = null,

    _elementInteractionEventData = (function () {

        var interactionTypes = { "click": 0, "mousemove": 1 },
            createTriggerUsing = function (originalTrigger) {
                return function (evt, targetElement, interactionType) {
                    originalTrigger({
                        x: _drawing.mouseHelper.getX(evt),
                        y: _drawing.mouseHelper.getY(evt),
                        details: {
                            interactionType: interactionType,
                            targetElement: targetElement
                        }
                    });
                };
            };

        return {
            getInteractionTypes: interactionTypes,
            register: function (targetElement, iteractionType, trigger) {

                if ((iteractionType in interactionTypes)
                    && _helpers.$obj.isValid(targetElement)
                    && (targetElement.handleInteractions === true)) {

                    targetElement.onIteraction(iteractionType, createTriggerUsing(trigger));
                }
            }
        };
    })(),

    /**
     * An utility container that holds all the drawing related implementations
     *
     * @class _drawing
     * @module raska
     * @readOnly
     * @static
     */
    _drawing = (function () {

        var

            /**
            * Holds the elements that are to be drawn to the target canvas
            *
            * @private
            * @property _elements
            * @type Array
            * @default []
            */
            _elements = [],

            /**
            * Holds the reference to the timer responsible for (re)draw the elements into the canvas
            *
            * @private
            * @property _timer
            * @type timer
            * @default null
            */
            _timer = null,

            /**
            * Whether or not we have a timer running
            *
            * @private
            * @property _timerRunning
            * @type Bool
            * @default false
            */
            _timerRunning = false,

            /**
            * The Canvas element we're targeting
            *
            * @private
            * @property _canvas
            * @type HTMLElement
            * @default null
            */
            _canvas = null,

            /**
            * The Canvas element (wraped by a Raska _basicElement)
            *
            * @private
            * @property _canvasElement
            * @type _basicElement
            * @default null
            */
            _canvasElement = null,

            /**
            * The 2dContext from the canvas element we're targeting
            *
            * @private
            * @property _2dContext
            * @type Object
            * @default null
            */
            _2dContext = null,

            /**
             * Handles the periodic draw of the elements in this Raska instance
             *
             * @method _timedDrawing
             * @private
             */
            _timedDrawing = function () {

                if (_timer !== null) {
                    w.clearTimeout(_timer);
                }

                if (_timerRunning === true) {
                    _draw();
                    _timer = w.setTimeout(function () {
                        _timedDrawing();
                    }, _activeConfiguration.frameRefreshRate);
                }

            },

            /**
             * Plots the element itself and all its related nodes into the canvas
             *
             * @method _drawAllIn
             * @param {_basicElement} element The element being drawn to the canvas
             * @private
             */
            _drawAllIn = function (element) {

                element.drawTo(_canvas, _2dContext);

                var childElements = element.getChildElements();
                for (var i = 0; i < childElements.length; i++) {
                    _drawAllIn(childElements[i]);
                }
            },

            /**
             * A utility that detects mouse's relative position on the canvas
             *
             * @class _mouse
             * @for _drawing
             * @static
             */
            _mouse = {

                /**
                * Gets mouses's X position relative to the current canvas
                *
                * @method getX
                * @param {Event} evt Event we're bubbling in
                * @for _mouse
                * @return {Number} X value
                * @static
                */
                getX: function (evt) {
                    var canvasRect = _canvas.getBoundingClientRect();
                    return (evt.clientX - canvasRect.left) * (_canvas.width / canvasRect.width);
                },

                /**
                 * Gets mouses's Y position relative to the current canvas
                 *
                 * @method getY
                 * @param {Event} evt Event we're bubbling in
                 * @for _mouse
                 * @return {Number} Y value
                 * @static
                 */
                getY: function (evt) {
                    var canvasRect = _canvas.getBoundingClientRect();
                    return (evt.clientY - canvasRect.top) * (_canvas.height / canvasRect.height);
                },

                /**
                * Gathers the mouse coordinates without the need of an event bubble
                *
                * @class staticCoordinates
                * @for _mouse
                * @static
                */
                staticCoordinates: (function () {

                    var _evt = { clientX: 0, clientY: 0 };
                    document.onmousemove = function (e) {
                        _evt.clientX = e.pageX;
                        _evt.clientY = e.pageY;
                    }

                    return {
                        /**
                        * Gets mouses' X and Y positions relative to the current canvas
                        *
                        * @method getXY
                        * @return {Object} X and Y values
                        * @static
                        */
                        getXY: function () {
                            return {
                                x: _mouse.getX(_evt),
                                y: _mouse.getY(_evt)
                            };
                        }
                    };
                })()
            },

            /**
             * A utility that tracks the state of the element being draged (if any)
             *
             * @class _elementBeingDraged
             * @for _drawing
             */
            _elementBeingDraged = {

                /**
                * The element being draged
                *
                * @property reference
                * @type _basicElement
                * @default null
                * @for _elementBeingDraged
                * @static
                */
                reference: null,

                /**
                * Whether or not the user is holding the CTRL key
                *
                * @property holdingCTRL
                * @type Bool
                * @default false
                * @for _elementBeingDraged
                * @static
                */
                holdingCTRL: false,

                /**
                * A copy from the original border specification for the element being draged
                *
                * @property originalBorder
                * @type Object
                * @default {}
                * @for _elementBeingDraged
                * @static
                */
                originalBorder: {},

                /**
                 * The types of drag that can be applied to an element
                 * 
                 * It can be either: 
                 *      1 - moving
                 *      3 - linking
                 * 
                 * @attribute dragTypes
                 */
                dragTypes: {

                    /**
                     * The element is being moved
                     * 
                     * @element moving
                     * @parents dragTypes
                     */
                    moving: 1,

                    /**
                     * The element is being linked
                     * 
                     * @element moving
                     * @parents dragTypes
                     */
                    linking: 3
                },

                /**
                * Default drag type
                *
                * @property dragType
                * @type Number
                * @default 0
                * @for _elementBeingDraged
                * @static
                */
                dragType: 0,

                temporaryLinkArrow: (function () {

                    return {

                        /**
                        * Whenever possible/necessary it plots the linking arrow to the canvas
                        *
                        * @method tryRender
                        * @private
                        */
                        tryRender: function () {
                            if ((_elementBeingDraged.reference !== null)
                                && (_elementBeingDraged.dragType === _elementBeingDraged.dragTypes.linking)) {

                                var targetXY = _mouse.staticCoordinates.getXY(),
                                    arrow = new _defaultConfigurations.arrow({
                                        x: targetXY.x,
                                        y: targetXY.y - 30,
                                        getHeight: function () { return 0; }
                                    });
                                arrow.name = "_temp";
                                arrow.setParent(_elementBeingDraged.reference);
                                arrow.drawTo(_canvas, _2dContext);
                            }
                            return this;
                        }
                    };
                })(),

                border: {
                    whenMoving: {
                        color: "yellow",
                        active: true
                    },
                    whenLiking: {
                        color: "green",
                        active: true
                    }
                }
            },

            /**
            * Handles de mouse move envent
            *
            * @method _whenMouseMove
            * @param {Event} evt Event we're bubbling in
            * @for _drawing
            * @private
            */
            _whenMouseMove = function (evt) {
                if ((_elementBeingDraged.reference !== null)
                    && (_elementBeingDraged.dragType === _elementBeingDraged.dragTypes.moving)) {

                    _helpers.$log.info("Moving element", _elementBeingDraged);
                    _elementBeingDraged.reference.x = _mouse.getX(evt);
                    _elementBeingDraged.reference.y = _mouse.getY(evt);
                }
            },

            /**
            * Handles de mouse up envent
            *
            * @method _whenMouseUp
            * @param {Event} evt Event we're bubbling in
            * @private
            */
            _whenMouseUp = function (evt) {
                if (_elementBeingDraged.reference !== null) {

                    if (_elementBeingDraged.dragType === _elementBeingDraged.dragTypes.linking) {
                        for (var i = 0; i < _elements.length; i++) {
                            if (_elements[i] !== _elementBeingDraged.reference
                                && _elements[i].existsIn(_mouse.getX(evt), _mouse.getY(evt))) {

                                if (_elementBeingDraged.reference.addLinkTo(_elements[i])) {
                                    _elements.push(new _defaultConfigurations
                                        .arrow(_elements[i])
                                        .setParent(_elementBeingDraged.reference));
                                    break;
                                }
                            }
                        }
                    }

                    _elementBeingDraged.reference.border = _elementBeingDraged.originalBorder;
                    _elementBeingDraged.reference = null;
                }
            },


            /**
            * Removes a given element from the canvas
            *
            * @method _removeElement
            * @param {_basicElement} e Element that is to be removed
            * @private
            * @chainable
            */
            _removeElement = function (e) {
                _helpers.$log.info("Removing element", e);
                _elements.splice(_elements.indexOf(e), 1);
                return this;
            },

            /**
            * Adds a given element from the canvas
            *
            * @method _addElement
            * @param {_basicElement} e Element that is to be added
            * @private
            * @chainable
            */
            _addElement = function (e) {
                _helpers.$log.info("Adding element", e);
                _elements.push(e);
                return this;
            },

            /**
            * Handles de key up envent
            *
            * @method _whenKeyUp
            * @param {Event} evt Event we're bubbling in
            * @private
            * @chainable
            */
            _whenKeyUp = function (evt) {
                _elementBeingDraged.holdingCTRL = false;
                return this;
            },

            /**
            * Handles de key down envent
            *
            * @method _whenKeyDown
            * @param {Event} evt Event we're bubbling in
            * @private
            * @chainable
            */
            _whenKeyDown = function (e) {
                var key = e.keyCode || e.charCode;
                if (((key === 46) || (key === 8))
                    && (_elementBeingDraged.reference !== null)) {
                    _removeElement(_elementBeingDraged.reference.clearAllLinks());
                    _elementBeingDraged.reference = null;
                } else {
                    _elementBeingDraged.holdingCTRL = (key === 17);
                }
                return this;
            },

            /**
            * Handles the click event
            *
            * @method _checkClick
            * @param {Event} evt Event we're bubbling in
            * @private
            */
            _checkClick = function (evt) {

                evt = evt || w.event;
                for (var i = 0; i < _elements.length; i++) {
                    if (_elements[i].existsIn(_mouse.getX(evt), _mouse.getY(evt))) {
                        _elementBeingDraged.reference = _elements[i];
                    }
                }

                if (_elementBeingDraged.reference !== null) {

                    var dragType = _elementBeingDraged.holdingCTRL === true && _elementBeingDraged.reference.isLinkable() === true ?
                        _elementBeingDraged.dragTypes.linking :
                        evt.which;
                    _elementBeingDraged.originalBorder = _elementBeingDraged.reference.border;
                    _elementBeingDraged.reference.border =
                        ((_elementBeingDraged.dragType = dragType) === _elementBeingDraged.dragTypes.moving) ?
                        _elementBeingDraged.border.whenMoving :
                        _elementBeingDraged.border.whenLiking;
                    _helpers.$log.info("Dragging element", { r: _elementBeingDraged.reference, d: dragType });
                }

                if (evt.preventDefault) {
                    evt.preventDefault();
                } else if (evt.returnValue) {
                    evt.returnValue = false;
                }
                return false;
            },

            /**
            * Plots each and every element to the canvas and registers all the event handlers delegates
            *
            * @method _draw
            * @private
            * @chainable
            */
            _draw = function () {

                if (_canvas === null) {
                    _2dContext = (_canvas = document.getElementById(_activeConfiguration.targetCanvasId))
                        .getContext('2d');
                    _canvas.addEventListener("mousedown", _checkClick, false);
                    w.addEventListener("mousemove", _whenMouseMove, false);
                    w.addEventListener("mouseup", _whenMouseUp, false);
                    w.addEventListener("keydown", _whenKeyDown, false);
                    w.addEventListener("keyup", _whenKeyUp, false);
                    _canvas.addEventListener("contextmenu", function (e) {
                        e.preventDefault();
                        return false;
                    }, false);
                    _canvasElement = _helpers.$obj.extend(new _defaultConfigurations.htmlElement(_canvas), {});
                }

                _2dContext.clearRect(0, 0, _canvas.width, _canvas.height);
                for (var i = 0; i < _elements.length; i++) {
                    _drawAllIn(_elements[i]);
                }
                _elementBeingDraged.temporaryLinkArrow.tryRender();

                return this;
            },

            /**
            * Gathers all elements being ploted to the canvas and organizes it as a directed graph JSON
            * 
            * @method  _getElementsSlim
            * @returns {_graphNodeInfo} Graph node information
            * @private
            */
            _getElementsSlim = function () {

                var result = {},
                    element,
                    links;

                for (var i = 0; i < _elements.length; i++) {

                    element = _elements[i];

                    if (element.graphNode === true) {
                        if ((((links = element.getLinksFrom()) === null) || (links.length === 0))
                            && (((links = element.getLinksTo()) === null) || (links.length === 0))) {
                            throw new _defaultConfigurations.errors.elementDoesNotHaveALink(element.name);
                        }

                        result[element.name] = new _graphNodeInfo(element, null, element.getLinksTo());
                    }
                }

                return result;
            };

        return {

            mouseHelper: _mouse,

            /**
             * Add a given element to the drawing elements array
             * 
             * @method  addElement
             * @param {_basicElement} element The element to be drawn
             * @chainable
             */
            addElement: function (element) {
                _addElement(element);
                return this;
            },

            /**
            * Gets the canvas' dataURL
            * 
            * @method  getDataUrl
            */
            getDataUrl: function () {
                return _canvas.toDataURL();
            },

            /**
            * Gathers all elements being ploted to the canvas and organizes it as a directed graph JSON
            * 
            * @method  getElementsSlim
            * @returns {_graphNodeInfo} Graph node information
            */
            getElementsSlim: function () {
                return _getElementsSlim();
            },

            /**
             * Gathers all elements being ploted to the canvas
             * 
             * @method  getElements
             * @returns {_basicElement[]} Graph node information
             */
            getElements: function () {
                return _elements;
            },

            /**
            * Redefines the elements that are supposed to be ploted to the canvas
            *
            * @method reloadUsing
            * @param {_basicElements[]} elements The elements that are going to be ploted
            * @static
            * @chainable
            */
            reloadUsing: function (elements) {
                _elements = elements;
                this.initializeTimedDrawing();
            },

            /**
            * Returns the corresponding Raska Canvas element
            * 
            * @method  getCanvasElement
            */
            getCanvasElement: function () {
                return _canvasElement;
            },

            /**
            * Initializes the drawing process
            * 
            * @method  initializeTimedDrawing
            */
            initializeTimedDrawing: function () {
                if (_timerRunning === false) {
                    _timerRunning = true;
                    _timedDrawing();
                }
            }
        };
    })(),

    /**
    * All public avaliable methods from the Raska library
    *
    * @class _public
    */
    _public = {

        /**
        * Adds a new Label to the target canvas
        *
        * @method newLabel
        * @return {_defaultConfigurations.label} Copy of '_defaultConfigurations.label' object
        * @static
        */
        newLabel: function () {
            return _helpers.$obj.extend(new _defaultConfigurations.label(), {});
        },

        /**
        * Adds a new Square to the target canvas
        *
        * @method newSquare
        * @return {_defaultConfigurations.square} Copy of '_defaultConfigurations.square' object
        * @static
        */
        newSquare: function () {
            return _helpers.$obj.extend(new _defaultConfigurations.square(), {});
        },

        /**
        * Adds a new Circle to the target canvas
        *
        * @method newCircle
        * @return {_defaultConfigurations.circle} Copy of '_defaultConfigurations.circle' object
        * @static
        */
        newCircle: function () {
            return _helpers.$obj.extend(new _defaultConfigurations.circle(), {});
        },

        /**
        * Plots an element to the canvas
        *
        * @method plot
        * @return {_public} Reference to the '_public' pointer
        * @static
        * @chainable
        */
        plot: function (element) {
            _drawing.addElement(element);
            return _public;
        },

        /**
        * Exports current canvas data as an image to a new window
        *
        * @method exportImage
        * @return {_public} Reference to the '_public' pointer
        * @chainable
        * @static
        */
        exportImage: function () {
            var nw = window.open();
            nw.document.write("<img src='" + _drawing.getDataUrl() + "'>");
            return _public;
        },

        /**
        * Retrieves the directed graph represented by the elements in the canvas 
        *
        * @method getElementsSlim
        * @return {json} The JSON object that represents the current directed graph drawn to the canvas
        * @static
        */
        getElementsSlim: function () {
            return _drawing.getElementsSlim();
        },

        /**
        * Retrieves the ENTIRE directed graph represented by the elements in the canvas 
        *
        * @method getElementsData
        * @return {String} The stringfied JSON that represents the current directed graph drawn to the canvas
        * @static
        */
        getElementsString: function () {
            return _helpers.$obj.deconstruct(_drawing.getElements());
        },

        /**
        * Redefines the elements that are supposed to be ploted to the canvas
        *
        * @method loadElementsFrom
        * @param {_basicElements[]} source The elements that are going to be ploted
        * @static
        * @chainable
        */
        loadElementsFrom: function (source) {
            var preparsedSource = JSON.parse(source);
            if (_helpers.$obj.isArray(preparsedSource)) {

                var realSource = [], i = 0;
                /// Create a basic element instance
                for (i = 0; i < preparsedSource.length; i++) {
                    realSource.push(_helpers.$obj.recreate(preparsedSource[i]));
                }

                /// Adds back the links between elements
                var findElement = function (itemName) {
                    if (!_helpers.$obj.isValid(itemName)) {
                        return null;
                    }
                    for (var j = 0; j < realSource.length; j++) {
                        if (realSource[j].name === itemName) {
                            return realSource[j];
                        }
                    }
                    throw _defaultConfigurations.errors.itemNotFoundException(itemName);
                };
                for (i = 0; i < realSource.length; i++) {
                    _helpers.$obj.recreateLinks(realSource[i], preparsedSource[i], findElement);
                }

                /// Recriates all arrows
                var linksTo = [], item;
                for (i = 0; i < realSource.length; i++) {
                    item = realSource[i];
                    if ((item.isLinkable() === true)
                        && ((linksTo = item.getLinksTo()).length > 0)) {
                        for (var k = 0; k < linksTo.length; k++) {
                            realSource.push(new _defaultConfigurations
                                .arrow(linksTo[k])
                                .setParent(item));
                        }
                    }
                }

                /// Removes all nested items that doesn't need to be part of the main array
                /// given they are rendered via their parents
                //for (i = 0; i < realSource.length; i++) {
                //    item = realSource[i];
                //    if (item.isLinkable() !== true) {
                //        realSource.splice(realSource.indexOf(item), 1);
                //    }
                //}

                _drawing.reloadUsing(realSource);
            }
            return this;
        },

        /**
        * Retrieves all possible position types
        *
        * @property positionTypes
        * @type _positionTypes
        * @static
        */
        positionTypes: (function () {
            return _positionTypes;
        })(),

        /**
        * Configures the Raska library to target a given canvas using the configuration passed
        * as a parameter
        *
        * @method installUsing
        * @param {_defaultConfigurations.library} configuration Configuration data that should be used to configure this Raska instance
        * @return {_public} Reference to the '_public' pointer
        * @static
        * @chainable
        */
        installUsing: function (configuration) {
            _activeConfiguration = _helpers.$obj.extend(_defaultConfigurations.library, configuration);
            _drawing.initializeTimedDrawing();
            return _public;
        },

        /**
        * Registers a handler to be trigered by any interaction taken place against the canvas
        *
        * @method onElementInteraction
        * @param {Function} What to do whenever an element iteraction happens
        * @static
        * @chainable
        */
        onCanvasInteraction: function (iteractionType, trigger) {

            _elementInteractionEventData.register(_drawing.getCanvasElement(), iteractionType, trigger);
        }
    };

    w.raska = _public;
})(window);
