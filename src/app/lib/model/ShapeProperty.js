export default class ShapeProperty {
    constructor(ld) {
        this.class = ld.query("sh:class @id");
        this.labelTemplate = ld.query("sh:labelTemplate @value");
        this.maxCount = ld.query("sh:maxCount @value");
        this.minCount = ld.query("sh:minCount @value");
        this.nodeKind = ld.query("sh:nodeKind @id");
        this.path = ld.query("sh:path @id");
        this.description = ld.query("sh:description @value");
        this.pattern = ld.query("sh:pattern @value");
        this.dataType = ld.query("sh:dataType @id");

        // once set, is this unchangeable? (popsicle style)
        this.immutable = !!ld.query("ots:immutable @value");

        // where a user will choose an object to embed within another object, this is the URL of the document from which to choose
        this.chooseFrom = ld.query("ots:chooseFrom @id");

        // for id nodes, a template for calculating the display value of a rendered link (e.g. a name rather than the URL)
        this.valueTemplate = ld.query("ots:valueTemplate @value");

        // should this be hidden from display to user?
        this.hidden = !!ld.query("ots:hidden @value");

        // should this appear in a summary node (e.g. an item in a collection)?
        this.summary = !!ld.query("ots:summary @value");
    }
}