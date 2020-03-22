import Entity from "../lib/model/Entity.js";
import taxonomy from "../taxonomy.js";

export default class Team extends Entity {
    static typeName() {
        return taxonomy.Team;
    }
};