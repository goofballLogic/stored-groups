const strategySymbol = Symbol( "Strategy" );

module.exports = class Command {

    constructor( id, name, strategy ) {

        this.id = id;
        this.name = name;
        this.invoke = async () => {

            const result = await strategy();
            return {

                completed: Date.now(),
                command: this,
                result

            };

        };

    }

}