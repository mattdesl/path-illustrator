/// A simple demo without tools
///

var createApp = require('../')

var isUndo = require('is-undo-redo').undo
var isRedo = require('is-undo-redo').redo

var events = require('dom-events')
require('canvas-testbed')(render, start)

var app

function render(ctx, width, height) {
    ctx.clearRect(0,0,width,height)
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
    })

    app.path.on('change', function() {
        //path is being changed on the fly
    })

    app.path.on('finish-change', function() {
        //changes have finished
        console.log('path changed')
    })

    events.on(window, 'keydown', function(ev) {
        if (isUndo(ev)) {
            ev.preventDefault()
            app.undo()
        } else if (isRedo(ev)) {
            ev.preventDefault()
            app.redo()
        }
    })
}