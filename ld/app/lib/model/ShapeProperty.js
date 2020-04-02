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
        this.immutable = ld.query("ots:immutable @value");
        this.chooseFrom = ld.query("ots:chooseFrom @id");
        this.valueTemplate = ld.query("ots:valueTemplate @value");
    }
}