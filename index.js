//these will most likely get pulled out and cleaned up
var createPath = require('path-illustrator-client/index')
var createClient = require('path-illustrator-client/client')
var createTools = require('path-illustrator-client/tools')

function App(opt) {
    if (!(this instanceof App))
        return new App(opt)
    opt = opt||{}

    //currently only 1 tool exists
    var tools = createTools.map(function(t) {
        return t()
    })

    this.path = createPath(opt)
    this.client = createClient(this.path, opt)

    //use default multi tool
    this.client.tool = tools[0]

    this.undo = this.client.undo.bind(this.client)
    this.redo = this.client.redo.bind(this.client)
    this.draw = this.path.draw.bind(this.path)
}

Object.defineProperty(App.prototype, "renderer", {
    get: function() {
        return this.path.renderer
    },
    set: function(renderer) {
        this.path.renderer = renderer
    }
})

module.exports = App