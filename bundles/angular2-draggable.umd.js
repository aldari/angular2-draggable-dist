(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core'], factory) :
	(factory((global['angular2-draggable'] = {}),global.ng.core));
}(this, (function (exports,core) { 'use strict';

var Position = (function () {
    /**
     * @param {?} x
     * @param {?} y
     */
    function Position(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * @param {?} e
     * @return {?}
     */
    Position.fromEvent = function (e) {
        return new Position(e.clientX, e.clientY);
    };
    /**
     * @param {?} p
     * @return {?}
     */
    Position.prototype.add = function (p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    };
    /**
     * @param {?} p
     * @return {?}
     */
    Position.prototype.subtract = function (p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    };
    /**
     * @return {?}
     */
    Position.prototype.reset = function () {
        this.x = 0;
        this.y = 0;
        return this;
    };
    /**
     * @param {?} p
     * @return {?}
     */
    Position.prototype.set = function (p) {
        this.x = p.x;
        this.y = p.y;
        return this;
    };
    return Position;
}());
var AngularDraggableDirective = (function () {
    /**
     * @param {?} el
     * @param {?} renderer
     */
    function AngularDraggableDirective(el, renderer) {
        this.el = el;
        this.renderer = renderer;
        this.allowDrag = true;
        this.moving = false;
        this.orignal = null;
        this.oldTrans = new Position(0, 0);
        this.tempTrans = new Position(0, 0);
        this.oldZIndex = '';
        this.oldPosition = '';
        this._zIndex = '';
        this.started = new core.EventEmitter();
        this.stopped = new core.EventEmitter();
        this.edge = new core.EventEmitter();
        this.lastPosition = new core.EventEmitter();
        /**
         * Whether to limit the element stay in the bounds
         */
        this.inBounds = false;
        /**
         * Whether the element should use it's previous drag position on a new drag event.
         */
        this.trackPosition = true;
        /**
         * Input css scale transform of element so translations are correct
         */
        this.scale = 1;
        /**
         * Whether to prevent default event
         */
        this.preventDefaultEvent = false;
        this.X = 0;
        this.Y = 0;
    }
    Object.defineProperty(AngularDraggableDirective.prototype, "zIndex", {
        /**
         * Set z-index when not dragging
         * @param {?} setting
         * @return {?}
         */
        set: function (setting) {
            this.renderer.setStyle(this.el.nativeElement, 'z-index', setting);
            this._zIndex = setting;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AngularDraggableDirective.prototype, "ngDraggable", {
        /**
         * @param {?} setting
         * @return {?}
         */
        set: function (setting) {
            if (setting !== undefined && setting !== null && setting !== '') {
                this.allowDrag = !!setting;
                var /** @type {?} */ element = this.handle ? this.handle : this.el.nativeElement;
                if (this.allowDrag) {
                    this.renderer.addClass(element, 'ng-draggable');
                }
                else {
                    this.renderer.removeClass(element, 'ng-draggable');
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    AngularDraggableDirective.prototype.ngOnInit = function () {
        if (this.allowDrag) {
            var /** @type {?} */ element = this.handle ? this.handle : this.el.nativeElement;
            this.renderer.addClass(element, 'ng-draggable');
        }
        this.orignal = new Position(0, 0);
        this.pickUp();
        this.moveTo(new Position(this.X, this.Y));
        this.putBack();
    };
    /**
     * @return {?}
     */
    AngularDraggableDirective.prototype.resetPosition = function () {
        this.oldTrans.reset();
        this.tempTrans.reset();
        this.transform();
    };
    /**
     * @param {?} p
     * @return {?}
     */
    AngularDraggableDirective.prototype.moveTo = function (p) {
        if (this.orignal) {
            p.subtract(this.orignal);
            this.tempTrans.set(p);
            this.tempTrans = this.roundPosition(this.tempTrans);
            this.transform();
            if (this.bounds) {
                this.edge.emit(this.boundsCheck());
            }
        }
    };
    /**
     * @return {?}
     */
    AngularDraggableDirective.prototype.transform = function () {
        var /** @type {?} */ value = "translate(" + (this.tempTrans.x + this.oldTrans.x) + "px, " + (this.tempTrans.y + this.oldTrans.y) + "px)";
        if (this.scale !== 1) {
            value += " scale(" + this.scale + ")";
        }
        this.renderer.setStyle(this.el.nativeElement, 'transform', value);
        this.renderer.setStyle(this.el.nativeElement, '-webkit-transform', value);
        this.renderer.setStyle(this.el.nativeElement, '-ms-transform', value);
        this.renderer.setStyle(this.el.nativeElement, '-moz-transform', value);
        this.renderer.setStyle(this.el.nativeElement, '-o-transform', value);
    };
    /**
     * @return {?}
     */
    AngularDraggableDirective.prototype.pickUp = function () {
        // get old z-index:
        this.oldZIndex = this.el.nativeElement.style.zIndex ? this.el.nativeElement.style.zIndex : '';
        if (window) {
            this.oldZIndex = window.getComputedStyle(this.el.nativeElement, null).getPropertyValue('z-index');
        }
        if (this.zIndexMoving) {
            this.renderer.setStyle(this.el.nativeElement, 'z-index', this.zIndexMoving);
        }
        if (!this.moving) {
            this.started.emit(this.el.nativeElement);
            this.moving = true;
        }
    };
    /**
     * @return {?}
     */
    AngularDraggableDirective.prototype.boundsCheck = function () {
        if (this.bounds) {
            var /** @type {?} */ boundary = this.bounds.getBoundingClientRect();
            var /** @type {?} */ elem = this.el.nativeElement.getBoundingClientRect();
            var /** @type {?} */ result = {
                'top': boundary.top < elem.top,
                'right': boundary.right > elem.right,
                'bottom': boundary.bottom > elem.bottom,
                'left': boundary.left < elem.left
            };
            if (this.inBounds) {
                if (!result.top) {
                    this.tempTrans.y -= elem.top - boundary.top;
                }
                if (!result.bottom) {
                    this.tempTrans.y -= elem.bottom - boundary.bottom;
                }
                if (!result.right) {
                    this.tempTrans.x -= elem.right - boundary.right;
                }
                if (!result.left) {
                    this.tempTrans.x -= elem.left - boundary.left;
                }
                this.transform();
            }
            return result;
        }
    };
    /**
     * @return {?}
     */
    AngularDraggableDirective.prototype.putBack = function () {
        if (this._zIndex) {
            this.renderer.setStyle(this.el.nativeElement, 'z-index', this._zIndex);
        }
        else if (this.zIndexMoving) {
            if (this.oldZIndex) {
                this.renderer.setStyle(this.el.nativeElement, 'z-index', this.oldZIndex);
            }
            else {
                this.el.nativeElement.style.removeProperty('z-index');
            }
        }
        if (this.moving) {
            this.stopped.emit(this.el.nativeElement);
            if (this.bounds) {
                this.edge.emit(this.boundsCheck());
            }
            this.moving = false;
            if (this.trackPosition) {
                this.oldTrans.add(this.tempTrans);
            }
            this.lastPosition.emit(this.oldTrans);
            this.tempTrans.reset();
            if (!this.trackPosition) {
                this.transform();
            }
        }
    };
    /**
     * @param {?} value
     * @return {?}
     */
    AngularDraggableDirective.prototype.roundPosition = function (value) {
        return new Position(Math.round(value.x / 15) * 15, Math.round(value.y / 15) * 15);
    };
    /**
     * @param {?} event
     * @return {?}
     */
    AngularDraggableDirective.prototype.onMouseDown = function (event) {
        // 1. skip right click;
        // 2. if handle is set, the element can only be moved by handle
        if (event.button === 2 || (this.handle !== undefined && !this.checkHandleTarget(event.target, this.handle))) {
            return;
        }
        if (this.preventDefaultEvent) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.orignal = Position.fromEvent(event);
        this.pickUp();
    };
    /**
     * @param {?} target
     * @param {?} element
     * @return {?}
     */
    AngularDraggableDirective.prototype.checkHandleTarget = function (target, element) {
        // Checks if the target is the element clicked, then checks each child element of element as well
        // Ignores button clicks
        // Ignore elements of type button
        if (element.tagName === 'BUTTON') {
            return false;
        }
        // If the target was found, return true (handle was found)
        if (element === target) {
            return true;
        }
        // Recursively iterate this elements children
        for (var /** @type {?} */ child in element.children) {
            if (element.children.hasOwnProperty(child)) {
                if (this.checkHandleTarget(target, element.children[child])) {
                    return true;
                }
            }
        }
        // Handle was not found in this lineage
        // Note: return false is ignore unless it is the parent element
        return false;
    };
    /**
     * @return {?}
     */
    AngularDraggableDirective.prototype.onMouseUp = function () {
        this.putBack();
    };
    /**
     * @return {?}
     */
    AngularDraggableDirective.prototype.onMouseLeave = function () {
        this.putBack();
    };
    /**
     * @param {?} event
     * @return {?}
     */
    AngularDraggableDirective.prototype.onMouseMove = function (event) {
        if (this.moving && this.allowDrag) {
            if (this.preventDefaultEvent) {
                event.stopPropagation();
                event.preventDefault();
            }
            this.moveTo(Position.fromEvent(event));
        }
    };
    /**
     * @return {?}
     */
    AngularDraggableDirective.prototype.onTouchEnd = function () {
        this.putBack();
    };
    /**
     * @param {?} event
     * @return {?}
     */
    AngularDraggableDirective.prototype.onTouchStart = function (event) {
        if (this.handle !== undefined && !this.checkHandleTarget(event.target, this.handle)) {
            return;
        }
        if (this.preventDefaultEvent) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.orignal = Position.fromEvent(event.changedTouches[0]);
        this.pickUp();
    };
    /**
     * @param {?} event
     * @return {?}
     */
    AngularDraggableDirective.prototype.onTouchMove = function (event) {
        if (this.moving && this.allowDrag) {
            if (this.preventDefaultEvent) {
                event.stopPropagation();
                event.preventDefault();
            }
            this.moveTo(Position.fromEvent(event.changedTouches[0]));
        }
    };
    return AngularDraggableDirective;
}());
AngularDraggableDirective.decorators = [
    { type: core.Directive, args: [{
                selector: '[ngDraggable]',
                exportAs: 'ngDraggable'
            },] },
];
/**
 * @nocollapse
 */
AngularDraggableDirective.ctorParameters = function () { return [
    { type: core.ElementRef, },
    { type: core.Renderer2, },
]; };
AngularDraggableDirective.propDecorators = {
    'started': [{ type: core.Output },],
    'stopped': [{ type: core.Output },],
    'edge': [{ type: core.Output },],
    'lastPosition': [{ type: core.Output },],
    'handle': [{ type: core.Input },],
    'bounds': [{ type: core.Input },],
    'zIndexMoving': [{ type: core.Input },],
    'zIndex': [{ type: core.Input },],
    'inBounds': [{ type: core.Input },],
    'trackPosition': [{ type: core.Input },],
    'scale': [{ type: core.Input },],
    'preventDefaultEvent': [{ type: core.Input },],
    'ngDraggable': [{ type: core.Input },],
    'X': [{ type: core.Input },],
    'Y': [{ type: core.Input },],
    'onMouseDown': [{ type: core.HostListener, args: ['mousedown', ['$event'],] },],
    'onMouseUp': [{ type: core.HostListener, args: ['document:mouseup',] },],
    'onMouseLeave': [{ type: core.HostListener, args: ['document:mouseleave',] },],
    'onMouseMove': [{ type: core.HostListener, args: ['document:mousemove', ['$event'],] },],
    'onTouchEnd': [{ type: core.HostListener, args: ['document:touchend',] },],
    'onTouchStart': [{ type: core.HostListener, args: ['touchstart', ['$event'],] },],
    'onTouchMove': [{ type: core.HostListener, args: ['document:touchmove', ['$event'],] },],
};
var AngularDraggableModule = (function () {
    function AngularDraggableModule() {
    }
    return AngularDraggableModule;
}());
AngularDraggableModule.decorators = [
    { type: core.NgModule, args: [{
                declarations: [
                    AngularDraggableDirective
                ],
                exports: [
                    AngularDraggableDirective
                ]
            },] },
];
/**
 * @nocollapse
 */
AngularDraggableModule.ctorParameters = function () { return []; };

exports.AngularDraggableModule = AngularDraggableModule;
exports.AngularDraggableDirective = AngularDraggableDirective;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular2-draggable.umd.js.map
