import ShapeProperty from "./model/ShapeProperty.js";

export function propertiesForShape(shape) {
    return shape.queryAll("sh:property")
        .map(p => new ShapeProperty(p))
        .filter(p => p.path);
}
