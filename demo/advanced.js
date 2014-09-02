// A more advanced demo with tool selection

var createApp = require('../')

var isUndo = require('is-undo-redo').undo
var isRedo = require('is-undo-redo').redo

var domify = require('domify')
var style = require('dom-style')
var events = require('dom-events')
var classes = require('dom-classes')

var fs = require('fs')
var buttonHTML = fs.readFileSync(__dirname+'/button.html', 'utf8')
var css = fs.readFileSync(__dirname+'/style.css', 'utf8')
require('insert-css')(css)
require('canvas-testbed')(render, start)


var app

function render(ctx, width, height) {
    ctx.clearRect(0,0,width,height)

    ctx.globalAlpha = 1.0

    app.draw(ctx)
}


function start(ctx, width, height) {
    ctx.canvas.onselectstart = function() { return false }
    ctx.canvas.oncontextmenu = function (e) {
        e.preventDefault()
    }

    app = createApp({
        element: ctx.canvas,
        fillStyle: 'black',
        fillAlpha: 0.3
        // stroke: true,
    })

    app.path.on('change', function() {
        //path is being changed on the fly
    })

    app.path.on('finish-change', function() {
        //changes have finished
        console.log('path changed')
    })

    // testing basic svg import
    // app.path.state( require('./infinity.json')   )
    
    events.on(window, 'keydown', function(ev) {
        if (isUndo(ev)) {
            ev.preventDefault()
            app.undo()
        } else if (isRedo(ev)) {
            ev.preventDefault()
            app.redo()
        }
    })

    addButtons()
}

function addButtons() {
    var names = ['pencil',
          'curve',
          'pointer',
          'undo',
          'redo',
          'clear']

    var toolbar = document.createElement("div")
    document.body.appendChild(toolbar)
    classes.add(toolbar, 'toolbar')

    //preload each image
    names.forEach(function(n) {
        var img = new Image()
        img.src = n+'.png'
    })

    var states = {
        pencil: function (app) {
            app.path.showAllControls = false
            app.path.drawing = true
            app.path.allowAdd = true
            app.path.allowRemove = true
        },
        curve: function(app) {
            app.path.showAllControls = true
            app.path.drawing = true
            app.path.allowAdd = true
            app.path.allowRemove = true
        },
        pointer: function(app) {
            app.path.showAllControls = false
            app.path.drawing = false
            app.path.allowAdd = false
            app.path.allowRemove = false
        },
        clear: function(app) {
            app.path.clear()
        },
        undo: function(app) {
            return app.undo()
        },
        redo: function(app) {
            return app.redo()
        }
    }
    var curState = states.pencil

    var buttons = names.map(function(s, i) {
        var div = domify(buttonHTML)
        classes.add(div, s)
        if (i===0)
            classes.add(div, 'selected')

        toolbar.appendChild(div)


        events.on(div, 'click', function(target, name, ev) {
            var trigger = ['undo', 'redo', 'clear'].indexOf(name) !== -1

            if (!trigger) {
                buttons.forEach(function(b) {
                    classes.remove(b, 'selected')
                })

                classes.add(target, 'selected')
                curState = states[name]
                curState(app)
            } else if (name in states) {
                states[name](app)
            }
        }.bind(this, div, s))

        return div
    })

    function icon(div, name) {
        classes.remove(div, /(pencil|pointer).*/)
        classes.add(div, name)
    }

    events.on(window, 'keydown', function(ev) {
        if (ev.metaKey||ev.ctrlKey) {
            icon(buttons[2], 'pointer_fill')
        } else
            icon(buttons[2], 'pointer')

        if (curState !== states.pointer && ev.altKey) { 
            icon(buttons[0], 'pencil_remove')
        }
    })

    events.on(window, 'keyup', function(ev) {
        icon(buttons[2], 'pointer')
        icon(buttons[0], 'pencil')
    })

    events.on(window, 'mousemove', function(ev) {
        if (curState !== states.pointer) {
            var defIcon = ev.altKey ? 'pencil_remove' : 'pencil'
            icon(buttons[0], app.path.pointOnPath 
                    ? 'pencil_add' : defIcon)
        }
    })
}