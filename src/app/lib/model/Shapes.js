import Entity, { data } from "./Entity.js";

export default class Shapes extends Entity {
    index(vocabId) {
        const query = this[data];
        const shapes = query.ld.queryAll("[@type=sh:NodeShape]");
        const shapeIndex = {};
        shapes
            .map(shape => ({
                targets: shape
                    .queryAll("sh:targetClass @id")
                    .map(id => id.startsWith(vocabId) ? id.substring(vocabId.length) : id),
                shape
            }))
            .forEach(({ targets, shape }) =>
                targets.forEach(target =>
                    shapeIndex[target] = shape
                )
            );
        return shapeIndex;
    }
}